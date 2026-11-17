const {
  Fp2ContractError,
  snapshotJson,
  validateId,
  validateVersion,
  validateTimestamp,
  validateResourceRef,
} = require('../../../shared/fp2/schema');

const IDENTITIES = Object.freeze(['Student', 'Peer', 'Mentor']);
const CAPABILITIES = Object.freeze([
  'context.read.own', 'receipt.read.own', 'case.create.own',
  'assessment.attempt.submit', 'note.edit.own', 'review.submit.eligible', 'session.book.own',
  'peer.connection.respond', 'peer.room.join.member', 'board.edit.member',
  'studio.edit.own', 'claim.accept.offered', 'course.publish.candidate', 'session.availability.edit.own',
  'assessment.grade.assigned', 'publication.review.assigned', 'case.read.assigned',
  'moderation.decide.assigned', 'money.reconcile.assigned', 'money.resolve.assigned',
  'ledger.commit.planned', 'consent.recording.respond.own', 'consent.recording.withdraw.own',
]);
const identities = new Set(IDENTITIES);
const capabilities = new Set(CAPABILITIES);

function failure(code) {
  throw new Fp2ContractError(code);
}

function createAuthorityService({ authenticateRequest, readSession, readAuthority, fenceCapability, clock = () => new Date().toISOString() } = {}) {
  const actors = new WeakSet();

  async function readSource(loader, ...args) {
    if (typeof loader !== 'function') failure('TEMPORARILY_UNAVAILABLE');
    try {
      const value = await loader(...args);
      return value == null ? null : snapshotJson(value);
    } catch {
      failure('TEMPORARILY_UNAVAILABLE');
    }
  }

  function serverTime() {
    try {
      return validateTimestamp(clock());
    } catch {
      failure('TEMPORARILY_UNAVAILABLE');
    }
  }

  function sourceCapabilities(authority, identity) {
    const local = authority.identityCapabilities?.[identity];
    const staff = authority.staffCapabilities;
    if (!Array.isArray(local) || !Array.isArray(staff) || local.length + staff.length > CAPABILITIES.length * 2) failure('TEMPORARILY_UNAVAILABLE');
    const all = [...local, ...staff];
    if (all.some((value) => !capabilities.has(value))) failure('TEMPORARILY_UNAVAILABLE');
    return Object.freeze([...new Set(all)]);
  }

  async function currentState(binding) {
    const now = serverTime();
    const session = await readSource(readSession, binding.authSessionId);
    if (!session || session.state !== 'active') failure('AUTH_REQUIRED');
    for (const key of ['actorId', 'accountId', 'authSessionId', 'sessionGeneration']) {
      if (session[key] !== binding[key]) failure('AUTH_REQUIRED');
    }
    try {
      validateTimestamp(session.expiresAt);
    } catch {
      failure('TEMPORARILY_UNAVAILABLE');
    }
    if (Date.parse(session.expiresAt) <= Date.parse(now)) failure('AUTH_REQUIRED');
    const authority = await readSource(readAuthority, binding.accountId);
    if (!authority || authority.accountId !== binding.accountId || authority.state !== 'active') failure('RESOURCE_NOT_AVAILABLE');
    try {
      validateVersion(authority.authzEpoch);
      if (!Array.isArray(authority.identities) || authority.identities.length === 0 || authority.identities.length > IDENTITIES.length || new Set(authority.identities).size !== authority.identities.length || authority.identities.some((identity) => !identities.has(identity))) failure('TEMPORARILY_UNAVAILABLE');
    } catch {
      failure('TEMPORARILY_UNAVAILABLE');
    }
    const currentNow = serverTime();
    if (Date.parse(session.expiresAt) <= Date.parse(currentNow)) failure('AUTH_REQUIRED');
    return { now: currentNow, session, authority };
  }

  async function resolveActorContext(request, requestId, workspace) {
    validateId(requestId);
    if (workspace !== undefined && !identities.has(workspace)) failure('INPUT_INVALID');
    const authentication = await readSource(authenticateRequest, request);
    if (!authentication) failure('AUTH_REQUIRED');
    try {
      for (const key of ['actorId', 'accountId', 'authSessionId', 'sessionGeneration']) validateId(authentication[key]);
    } catch {
      failure('AUTH_REQUIRED');
    }
    const { now, session, authority } = await currentState(authentication);
    const activeIdentity = workspace === undefined ? authority.activeIdentity : workspace;
    if (!identities.has(activeIdentity) || !authority.identities.includes(activeIdentity)) failure(workspace === undefined ? 'TEMPORARILY_UNAVAILABLE' : 'INPUT_INVALID');
    const actor = Object.freeze({
      actorId: session.actorId,
      accountId: session.accountId,
      authSessionId: session.authSessionId,
      sessionGeneration: session.sessionGeneration,
      activeIdentity,
      identities: Object.freeze([...authority.identities]),
      capabilities: sourceCapabilities(authority, activeIdentity),
      authzEpoch: authority.authzEpoch,
      sessionExpiresAt: session.expiresAt,
      requestId,
      serverNow: now,
    });
    actors.add(actor);
    return actor;
  }

  async function reauthorize(actor) {
    if (!actor || !actors.has(actor)) failure('AUTH_REQUIRED');
    const state = await currentState(actor);
    if (state.authority.authzEpoch !== actor.authzEpoch || !state.authority.identities.includes(actor.activeIdentity)) failure('RESOURCE_NOT_AVAILABLE');
    return { ...state, capabilities: sourceCapabilities(state.authority, actor.activeIdentity) };
  }

  async function getPublicContext(actor) {
    const current = await reauthorize(actor);
    return Object.freeze({
      accountId: actor.accountId,
      sessionGeneration: actor.sessionGeneration,
      activeIdentity: actor.activeIdentity,
      identities: Object.freeze([...current.authority.identities]),
      capabilities: current.capabilities,
      authzEpoch: actor.authzEpoch,
      requestId: actor.requestId,
    });
  }

  async function requireCapability(tx, actor, resource, capability) {
    const reference = validateResourceRef(snapshotJson(resource));
    if (!capabilities.has(capability)) failure('INPUT_INVALID');
    const current = await reauthorize(actor);
    if (!actor.capabilities.includes(capability) || !current.capabilities.includes(capability)) failure('RESOURCE_NOT_AVAILABLE');
    if (!tx || typeof tx !== 'object' || typeof fenceCapability !== 'function') failure('TEMPORARILY_UNAVAILABLE');
    let proof;
    try {
      proof = await readSource(fenceCapability, tx, actor, reference, capability);
    } catch {
      failure('TEMPORARILY_UNAVAILABLE');
    }
    if (proof?.allowed === false) failure('RESOURCE_NOT_AVAILABLE');
    if (!proof || proof.allowed !== true) failure('TEMPORARILY_UNAVAILABLE');
    if (proof.actorId !== actor.actorId || proof.accountId !== actor.accountId || proof.authzEpoch !== actor.authzEpoch || proof.capability !== capability || proof.resource?.kind !== reference.kind || proof.resource?.id !== reference.id) failure('RESOURCE_NOT_AVAILABLE');
    try {
      for (const key of ['serial', 'resourceVersion', 'membershipVersion']) validateVersion(proof[key]);
      if (proof.consentVersion !== null) validateVersion(proof.consentVersion);
    } catch {
      failure('TEMPORARILY_UNAVAILABLE');
    }
  }

  return Object.freeze({ resolveActorContext, getPublicContext, requireCapability });
}

const defaultService = createAuthorityService();
module.exports = {
  IDENTITIES,
  CAPABILITIES,
  createAuthorityService,
  resolveActorContext: defaultService.resolveActorContext,
  getPublicContext: defaultService.getPublicContext,
  requireCapability: defaultService.requireCapability,
};
