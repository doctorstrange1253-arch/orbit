const RESOURCE_KINDS = Object.freeze([
  'account', 'request', 'flare', 'claim', 'course', 'lesson', 'assessment',
  'review', 'progression', 'wallet', 'session', 'room', 'board', 'note',
  'recording', 'artifact', 'consent', 'case', 'cycle',
]);

const CONTRACT_LIMITS = Object.freeze({
  maxIdLength: 128,
  maxDepth: 32,
  maxNodes: 10000,
  maxEncodedBytes: 65536,
});

const PROTOTYPE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const RESOURCE_KIND_SET = new Set(RESOURCE_KINDS);
const ENVELOPE_KEYS = Object.freeze([
  'operationId', 'expectedVersion', 'policyVersion', 'resource', 'payload',
]);
const encoder = new TextEncoder();

class Fp2ContractError extends Error {
  constructor(code = 'INPUT_INVALID') {
    super('Invalid FP2 command input.');
    this.name = 'Fp2ContractError';
    this.code = code;
  }
}

function invalid() {
  throw new Fp2ContractError();
}

function addBytes(state, value) {
  state.bytes += typeof value === 'number' ? value : encoder.encode(value).length;
  if (state.bytes > CONTRACT_LIMITS.maxEncodedBytes) invalid();
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function validateId(value) {
  if (typeof value !== 'string' || value.length === 0 || value.length > CONTRACT_LIMITS.maxIdLength || /\s/.test(value)) invalid();
  for (const character of value) {
    const code = character.codePointAt(0);
    if (code < 32 || code === 127) invalid();
  }
  return value;
}

function validateVersion(value) {
  if (!Number.isSafeInteger(value) || value < 1) invalid();
  return value;
}

function requireKeys(value, keys) {
  if (!isRecord(value)) invalid();
  const ownKeys = Object.keys(value);
  if (ownKeys.length !== keys.length || keys.some((key) => !Object.prototype.hasOwnProperty.call(value, key))) invalid();
}

function cloneJson(value, state, depth) {
  state.nodes += 1;
  if (state.nodes > CONTRACT_LIMITS.maxNodes || depth > CONTRACT_LIMITS.maxDepth) invalid();

  if (value === null) {
    addBytes(state, 4);
    return null;
  }
  if (typeof value === 'boolean') {
    addBytes(state, value ? 4 : 5);
    return value;
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) invalid();
    addBytes(state, JSON.stringify(value));
    return value;
  }
  if (typeof value === 'string') {
    if (value.length > CONTRACT_LIMITS.maxEncodedBytes) invalid();
    addBytes(state, JSON.stringify(value));
    return value;
  }
  if (typeof value !== 'object' || state.active.has(value)) invalid();

  const array = Array.isArray(value);
  const prototype = Object.getPrototypeOf(value);
  if (array ? prototype !== Array.prototype : prototype !== Object.prototype && prototype !== null) invalid();
  const keys = Reflect.ownKeys(value);
  if (keys.some((key) => typeof key !== 'string')) invalid();
  if (array && (!Number.isSafeInteger(value.length) || value.length > CONTRACT_LIMITS.maxNodes - state.nodes || keys.length !== value.length + 1)) invalid();
  if (!array && keys.length > CONTRACT_LIMITS.maxNodes - state.nodes) invalid();

  state.active.add(value);
  addBytes(state, 2);
  const output = array ? [] : {};
  const entries = array ? Array.from({ length: value.length }, (_, index) => String(index)) : keys;

  for (let index = 0; index < entries.length; index += 1) {
    const key = entries[index];
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !descriptor.enumerable || !Object.prototype.hasOwnProperty.call(descriptor, 'value')) invalid();
    if (index > 0) addBytes(state, 1);
    if (!array) {
      if (PROTOTYPE_KEYS.has(key) || key.length > CONTRACT_LIMITS.maxIdLength) invalid();
      addBytes(state, JSON.stringify(key));
      addBytes(state, 1);
    }
    output[key] = cloneJson(descriptor.value, state, depth + 1);
  }

  state.active.delete(value);
  return Object.freeze(output);
}

function snapshotJson(input) {
  try {
    return cloneJson(input, { nodes: 0, bytes: 0, active: new WeakSet() }, 0);
  } catch (error) {
    if (error instanceof Fp2ContractError) throw error;
    invalid();
  }
}

function validateResourceRef(input) {
  requireKeys(input, ['kind', 'id']);
  if (!RESOURCE_KIND_SET.has(input.kind)) invalid();
  validateId(input.id);
  return input;
}

function validateEnvelope(input) {
  const result = snapshotJson(input);
  requireKeys(result, ENVELOPE_KEYS);
  validateId(result.operationId);
  validateId(result.policyVersion);
  if (result.expectedVersion !== 'absent') validateVersion(result.expectedVersion);
  validateResourceRef(result.resource);
  return result;
}

function parseEnvelope(input) {
  if (typeof input !== 'string' || encoder.encode(input).length > CONTRACT_LIMITS.maxEncodedBytes) invalid();
  let offset = 0;
  let nodes = 0;
  const whitespace = () => {
    while (offset < input.length && ' \t\r\n'.includes(input[offset])) offset += 1;
  };
  const string = () => {
    if (input[offset] !== '"') invalid();
    const start = offset;
    offset += 1;
    while (offset < input.length) {
      const character = input[offset];
      if (character === '"') {
        offset += 1;
        try {
          return JSON.parse(input.slice(start, offset));
        } catch {
          invalid();
        }
      }
      if (character.charCodeAt(0) < 32) invalid();
      offset += character === '\\' ? 2 : 1;
    }
    invalid();
  };
  const value = (depth) => {
    nodes += 1;
    if (depth > CONTRACT_LIMITS.maxDepth || nodes > CONTRACT_LIMITS.maxNodes) invalid();
    whitespace();
    const character = input[offset];
    if (character === '"') return string();
    if (character === '{') {
      offset += 1;
      whitespace();
      const output = {};
      const keys = new Set();
      if (input[offset] === '}') { offset += 1; return output; }
      while (offset < input.length) {
        whitespace();
        const key = string();
        if (keys.has(key) || PROTOTYPE_KEYS.has(key) || key.length > CONTRACT_LIMITS.maxIdLength) invalid();
        keys.add(key);
        whitespace();
        if (input[offset] !== ':') invalid();
        offset += 1;
        output[key] = value(depth + 1);
        whitespace();
        if (input[offset] === '}') { offset += 1; return output; }
        if (input[offset] !== ',') invalid();
        offset += 1;
      }
      invalid();
    }
    if (character === '[') {
      offset += 1;
      whitespace();
      const output = [];
      if (input[offset] === ']') { offset += 1; return output; }
      while (offset < input.length) {
        output.push(value(depth + 1));
        whitespace();
        if (input[offset] === ']') { offset += 1; return output; }
        if (input[offset] !== ',') invalid();
        offset += 1;
      }
      invalid();
    }
    for (const [token, result] of [['true', true], ['false', false], ['null', null]]) {
      if (input.startsWith(token, offset)) { offset += token.length; return result; }
    }
    const number = input.slice(offset).match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/);
    if (!number) invalid();
    offset += number[0].length;
    const result = Number(number[0]);
    if (!Number.isFinite(result)) invalid();
    return result;
  };
  const result = value(0);
  whitespace();
  if (offset !== input.length) invalid();
  return validateEnvelope(result);
}

function validatePurpose(value) {
  if (typeof value !== 'string' || value.length === 0 || value.length > CONTRACT_LIMITS.maxIdLength || value.trim() !== value) invalid();
  for (const character of value) {
    if (character.codePointAt(0) < 32 || character.codePointAt(0) === 127) invalid();
  }
  return value;
}

function validateTimestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value)) invalid();
  const instant = Date.parse(value);
  if (!Number.isFinite(instant)) invalid();
  const normalized = value.includes('.') ? value.replace(/\.(\d{1,3})Z$/, (_, fraction) => `.${fraction.padEnd(3, '0')}Z`) : `${value.slice(0, -1)}.000Z`;
  if (new Date(instant).toISOString() !== normalized) invalid();
  return value;
}

function validatePermissions(value, minimum) {
  if (!Array.isArray(value) || value.length < minimum || value.length > 3 || new Set(value).size !== value.length || value.some((item) => !['read', 'edit', 'export'].includes(item))) invalid();
}

function boardGrantRequest(value) {
  requireKeys(value, ['document', 'purpose', 'requestedPermissions']);
  validateResourceRef(value.document);
  if (value.document.kind !== 'board') invalid();
  validatePurpose(value.purpose);
  validatePermissions(value.requestedPermissions, 1);
}

function consentChoice(value) {
  requireKeys(value, ['purpose', 'scopeVersion', 'choice']);
  validatePurpose(value.purpose);
  validateVersion(value.scopeVersion);
  if (!['grant', 'deny'].includes(value.choice)) invalid();
}

function consentWithdrawal(value) {
  requireKeys(value, ['purpose', 'scopeVersion']);
  validatePurpose(value.purpose);
  validateVersion(value.scopeVersion);
}

function boardGrantEntity(value) {
  requireKeys(value, ['grantId', 'document', 'mode', 'purpose', 'actorId', 'sessionGeneration', 'authzEpoch', 'membershipVersion', 'consentVersion', 'documentVersion', 'permissions', 'policyVersion', 'issuedAt', 'expiresAt']);
  for (const key of ['grantId', 'actorId', 'sessionGeneration', 'policyVersion']) validateId(value[key]);
  validateResourceRef(value.document);
  if (value.document.kind !== 'board' || !['EPHEMERAL_CALL', 'PERSISTENT_STUDIO', 'COURSE_PUBLISHED'].includes(value.mode)) invalid();
  validatePurpose(value.purpose);
  for (const key of ['authzEpoch', 'membershipVersion', 'documentVersion']) validateVersion(value[key]);
  if (value.consentVersion !== null) validateVersion(value.consentVersion);
  validatePermissions(value.permissions, 0);
  validateTimestamp(value.issuedAt);
  validateTimestamp(value.expiresAt);
  if (Date.parse(value.expiresAt) <= Date.parse(value.issuedAt)) invalid();
}

const COMMAND_REGISTRY = new Map([
  ['board.grant.request', Object.freeze({ resourceKind: 'board', capability: 'board.edit.member', policyScopes: Object.freeze(['identitySafety', 'board', 'retention']), validatePayload: boardGrantRequest, validateResult: boardGrantEntity })],
  ['consent.recording.respond', Object.freeze({ resourceKind: 'consent', capability: 'consent.recording.respond.own', policyScopes: Object.freeze(['identitySafety', 'recordingConsent', 'retention']), validatePayload: consentChoice })],
  ['consent.recording.withdraw', Object.freeze({ resourceKind: 'consent', capability: 'consent.recording.withdraw.own', policyScopes: Object.freeze(['identitySafety', 'retention']), validatePayload: consentWithdrawal })],
]);

function getCommandContract(commandName) {
  if (typeof commandName !== 'string' || !COMMAND_REGISTRY.has(commandName)) throw new Fp2ContractError('COMMAND_UNSUPPORTED');
  return COMMAND_REGISTRY.get(commandName);
}

function validateRegisteredPayload(commandName, input) {
  const contract = getCommandContract(commandName);
  const result = snapshotJson(input);
  contract.validatePayload(result);
  return result;
}

function validateRegisteredEntity(schemaId, input) {
  if (schemaId !== 'fp2.board.grant.v1') invalid();
  const result = snapshotJson(input);
  boardGrantEntity(result);
  return result;
}

function validateRegisteredResult(commandName, input) {
  const contract = getCommandContract(commandName);
  if (!contract.validateResult) throw new Fp2ContractError('COMMAND_UNSUPPORTED');
  const result = snapshotJson(input);
  contract.validateResult(result);
  return result;
}

function validateEventEnvelope(input) {
  const result = snapshotJson(input);
  requireKeys(result, ['eventId', 'eventName', 'schemaVersion', 'operationId', 'policyVersion', 'resource', 'resourceVersion', 'aggregateSequence', 'occurredAt', 'causationEventId', 'payload']);
  if (result.eventName !== 'fp2.v1.consent.changed' || result.schemaVersion !== 1) invalid();
  for (const key of ['eventId', 'operationId', 'policyVersion']) validateId(result[key]);
  validateResourceRef(result.resource);
  if (result.resource.kind !== 'consent') invalid();
  validateVersion(result.resourceVersion);
  validateVersion(result.aggregateSequence);
  validateTimestamp(result.occurredAt);
  if (result.causationEventId !== null) validateId(result.causationEventId);
  consentChoice(result.payload);
  return result;
}

module.exports = {
  CONTRACT_LIMITS,
  RESOURCE_KINDS,
  Fp2ContractError,
  validateEnvelope,
  parseEnvelope,
  validateRegisteredPayload,
  validateRegisteredEntity,
  validateRegisteredResult,
  validateEventEnvelope,
  getCommandContract,
  snapshotJson,
  validateId,
  validateVersion,
  validateTimestamp,
  validateResourceRef,
};

