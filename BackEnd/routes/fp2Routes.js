const express = require('express');
const { randomUUID } = require('node:crypto');
const { TextDecoder } = require('node:util');
const authorityService = require('../services/fp2/authority');
const {
  CONTRACT_LIMITS,
  Fp2ContractError,
  getCommandContract,
  parseEnvelope,
  validateRegisteredPayload,
  validateId,
} = require('../../shared/fp2/schema');

const PROBLEMS = Object.freeze({
  AUTH_REQUIRED: Object.freeze({ status: 401, message: 'Authentication is required.', retryable: false }),
  INPUT_INVALID: Object.freeze({ status: 400, message: 'Invalid FP2 command input.', retryable: false }),
  COMMAND_UNSUPPORTED: Object.freeze({ status: 400, message: 'This FP2 command is unsupported.', retryable: false }),
  RESOURCE_NOT_AVAILABLE: Object.freeze({ status: 404, message: 'Resource is not available.', retryable: false }),
  POLICY_BLOCKED: Object.freeze({ status: 422, message: 'A required policy is unavailable.', retryable: false }),
  TEMPORARILY_UNAVAILABLE: Object.freeze({ status: 503, message: 'This operation is temporarily unavailable.', retryable: true }),
});
const REQUEST_ID = Symbol('fp2ServerRequestId');
const RAW_INPUT_ERRORS = new Set([
  'entity.too.large', 'encoding.unsupported', 'charset.unsupported',
  'entity.parse.failed', 'entity.verify.failed', 'request.aborted', 'request.size.invalid',
]);

function rawBody(body) {
  if (typeof body === 'string') return body;
  if (!Buffer.isBuffer(body)) throw new Fp2ContractError();
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(body);
  } catch {
    throw new Fp2ContractError();
  }
}

function sendProblem(res, error, requestId) {
  const code = Object.prototype.hasOwnProperty.call(PROBLEMS, error?.code) ? error.code : 'TEMPORARILY_UNAVAILABLE';
  const spec = PROBLEMS[code];
  return res.status(spec.status).json({
    kind: 'problem',
    problem: { code, requestId, retryable: spec.retryable, message: spec.message, decisionIds: [] },
  });
}

function createFp2Handlers({ authority = authorityService, contractsEnabled = false, requestIdFactory = randomUUID } = {}) {
  function requestId(req) {
    if (req[REQUEST_ID]) return req[REQUEST_ID];
    const id = requestIdFactory();
    validateId(id);
    Object.defineProperty(req, REQUEST_ID, { value: id });
    return id;
  }

  function prepareRequest(req, res, next) {
    try {
      requestId(req);
      return next();
    } catch {
      return sendProblem(res, new Fp2ContractError('TEMPORARILY_UNAVAILABLE'), randomUUID());
    }
  }

  function parserError(error, req, res, _next) {
    const code = RAW_INPUT_ERRORS.has(error?.type) ? 'INPUT_INVALID' : 'TEMPORARILY_UNAVAILABLE';
    return sendProblem(res, new Fp2ContractError(code), req[REQUEST_ID] || randomUUID());
  }

  async function context(req, res) {
    let id;
    try {
      id = requestId(req);
      if (req.query && Object.keys(req.query).some((key) => key !== 'workspace')) throw new Fp2ContractError();
      const actor = await authority.resolveActorContext(req, id, req.query?.workspace);
      const view = await authority.getPublicContext(actor);
      return res.status(200).json({
        context: {
          accountId: view.accountId,
          sessionGeneration: view.sessionGeneration,
          activeIdentity: view.activeIdentity,
          identities: view.identities,
          capabilities: view.capabilities,
          authzEpoch: view.authzEpoch,
          requestId: id,
        },
      });
    } catch (error) {
      return sendProblem(res, error, id || randomUUID());
    }
  }

  async function command(req, res) {
    let id;
    try {
      id = requestId(req);
      await authority.resolveActorContext(req, id);
      if (contractsEnabled !== true) throw new Fp2ContractError('RESOURCE_NOT_AVAILABLE');
      const commandName = req.params?.commandName;
      const contract = getCommandContract(commandName);
      const envelope = parseEnvelope(rawBody(req.body));
      const payload = validateRegisteredPayload(commandName, envelope.payload);
      if (envelope.resource.kind !== contract.resourceKind) throw new Fp2ContractError();
      if (payload.document && (payload.document.kind !== envelope.resource.kind || payload.document.id !== envelope.resource.id)) throw new Fp2ContractError();
      throw new Fp2ContractError('TEMPORARILY_UNAVAILABLE');
    } catch (error) {
      return sendProblem(res, error, id || randomUUID());
    }
  }

  return Object.freeze({ context, command, prepareRequest, parserError });
}

function createFp2Router(options) {
  const router = express.Router();
  const handlers = createFp2Handlers(options);
  router.use(handlers.prepareRequest);
  router.get('/context', handlers.context);
  router.post('/commands/:commandName', express.raw({ type: 'application/json', limit: CONTRACT_LIMITS.maxEncodedBytes }), handlers.command);
  router.use(handlers.parserError);
  return router;
}

module.exports = { createFp2Handlers, createFp2Router };
