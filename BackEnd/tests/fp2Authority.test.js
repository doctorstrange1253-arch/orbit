function policyModule() {
  return require('../services/fp2/policy');
}

function authorityModule() {
  return require('../services/fp2/authority');
}

function approvedBundle() {
  return {
    state: 'approved',
    policyVersion: 'policy-1',
    gates: {
      grading: {
        state: 'approved',
        value: { range: [0, 24] },
        policyVersion: 'policy-1',
        approvalId: 'approval-1',
        evidenceIds: ['evidence-1'],
        validFrom: '2026-11-01T00:00:00.000Z',
      },
    },
  };
}

function authorityFixture(changes = {}) {
  const state = {
    authentication: {
      actorId: 'member-1', accountId: 'account-1',
      authSessionId: 'session-1', sessionGeneration: 'generation-1',
    },
    session: {
      actorId: 'member-1', accountId: 'account-1',
      authSessionId: 'session-1', sessionGeneration: 'generation-1',
      state: 'active', expiresAt: '2026-11-09T00:00:00.000Z',
    },
    authority: {
      accountId: 'account-1', state: 'active', authzEpoch: 4,
      activeIdentity: 'Student', identities: ['Student'],
      identityCapabilities: { Student: ['context.read.own', 'board.edit.member'] },
      staffCapabilities: [],
    },
    now: '2026-11-08T12:00:00.000Z',
    proofChanges: {},
    ...changes,
  };
  const service = authorityModule().createAuthorityService({
    authenticateRequest: async () => state.authentication,
    readSession: async () => state.session,
    readAuthority: async () => state.authority,
    clock: () => state.now,
    fenceCapability: async (_tx, actor, resource, capability) => ({
      allowed: true, actorId: actor.actorId, accountId: actor.accountId,
      resource, capability, authzEpoch: actor.authzEpoch, serial: 9,
      resourceVersion: 2, membershipVersion: 3, consentVersion: null,
      ...state.proofChanges,
    }),
  });
  return { service, state };
}

const NOW = '2026-11-08T12:00:00.000Z';
const BOARD = { kind: 'board', id: 'board-1' };
const TX = { purpose: 'isolated-unit-fence-fixture' };

describe('FP2 required policy authority', () => {
  test('returns a frozen independent approved required-scope snapshot', async () => {
    const bundle = approvedBundle();
    const service = policyModule().createPolicyService({ loadBundle: async () => bundle });
    const result = await service.requireApprovedPolicies('policy-1', ['grading'], NOW);
    expect(result.grading.state).toBe('approved');
    expect(result.grading.value.range).toEqual([0, 24]);
    expect(Object.isFrozen(result.grading.value.range)).toBe(true);
    bundle.gates.grading.value.range[1] = 999;
    expect(result.grading.value.range).toEqual([0, 24]);
  });

  test.each(['unknown', 'proposed', 'suspended'])(
    'requiredPolicyNotApprovedBlocks: grading %s is not permission',
    async (state) => {
      const bundle = approvedBundle();
      bundle.gates.grading.state = state;
      const service = policyModule().createPolicyService({ loadBundle: async () => bundle });
      await expect(service.requireApprovedPolicies('policy-1', ['grading'], NOW)).rejects.toMatchObject({ code: 'POLICY_BLOCKED' });
    },
  );

  test('blocks a suspended bundle despite an individually approved gate', async () => {
    const bundle = approvedBundle();
    bundle.state = 'suspended';
    const service = policyModule().createPolicyService({ loadBundle: async () => bundle });
    await expect(service.requireApprovedPolicies('policy-1', ['grading'], NOW)).rejects.toMatchObject({ code: 'POLICY_BLOCKED' });
  });

  test.each(['approvalId', 'evidenceIds', 'validFrom', 'value'])(
    'blocks an incomplete approved-source gate missing %s',
    async (key) => {
      const bundle = approvedBundle();
      delete bundle.gates.grading[key];
      const service = policyModule().createPolicyService({ loadBundle: async () => bundle });
      await expect(service.requireApprovedPolicies('policy-1', ['grading'], NOW)).rejects.toMatchObject({ code: 'POLICY_BLOCKED' });
    },
  );

  test('blocks a wrong policy version rather than using its proposed value', async () => {
    const bundle = approvedBundle();
    bundle.gates.grading.policyVersion = 'different-policy';
    const service = policyModule().createPolicyService({ loadBundle: async () => bundle });
    await expect(service.requireApprovedPolicies('policy-1', ['grading'], NOW)).rejects.toMatchObject({ code: 'POLICY_BLOCKED' });
  });

  test('blocks future policy activation or empty evidence', async () => {
    const bundle = approvedBundle();
    bundle.gates.grading.validFrom = '2026-12-01T00:00:00.000Z';
    const service = policyModule().createPolicyService({ loadBundle: async () => bundle });
    await expect(service.requireApprovedPolicies('policy-1', ['grading'], NOW)).rejects.toMatchObject({ code: 'POLICY_BLOCKED' });
    bundle.gates.grading.validFrom = '2026-11-01T00:00:00.000Z';
    bundle.gates.grading.evidenceIds = [];
    await expect(service.requireApprovedPolicies('policy-1', ['grading'], NOW)).rejects.toMatchObject({ code: 'POLICY_BLOCKED' });
  });

  test('blocks an unregistered scope or unavailable default policy adapter', async () => {
    const service = policyModule().createPolicyService({ loadBundle: async () => approvedBundle() });
    await expect(service.requireApprovedPolicies('policy-1', ['adminEverything'], NOW)).rejects.toMatchObject({ code: 'POLICY_BLOCKED' });
    await expect(policyModule().requireApprovedPolicies('policy-1', ['grading'], NOW)).rejects.toMatchObject({ code: 'TEMPORARILY_UNAVAILABLE' });
  });

  test('handles source failure as unavailable without forwarding its private message', async () => {
    const service = policyModule().createPolicyService({ loadBundle: async () => { throw new Error('private evidence and provider key'); } });
    const error = await service.requireApprovedPolicies('policy-1', ['grading'], NOW).catch((value) => value);
    expect(error).toMatchObject({ code: 'TEMPORARILY_UNAVAILABLE' });
    expect(error.message).not.toContain('private evidence');
  });
});

describe('FP2 server-only live actor authority', () => {
  test('builds context from verified/current records, not browser role fields', async () => {
    const { service } = authorityFixture();
    const actor = await service.resolveActorContext({ body: { role: 'Mentor', verified: true, authzEpoch: 999 } }, 'request-1');
    expect(actor).toMatchObject({ accountId: 'account-1', activeIdentity: 'Student', authzEpoch: 4, sessionGeneration: 'generation-1' });
    expect(actor.identities).toEqual(['Student']);
    expect(Object.isFrozen(actor)).toBe(true);
    expect(Object.isFrozen(actor.capabilities)).toBe(true);
    const view = await service.getPublicContext(actor);
    expect(view.activeIdentity).toBe('Student');
    expect(view.authSessionId).toBeUndefined();
    expect(view.sessionExpiresAt).toBeUndefined();
  });

  test('workspaceHintCannotGrantIdentity: Mentor hint cannot add a missing identity', async () => {
    const { service } = authorityFixture();
    await expect(service.resolveActorContext({}, 'request-1', 'Mentor')).rejects.toMatchObject({ code: 'INPUT_INVALID' });
  });

  test('selects only capabilities of an actually held requested identity', async () => {
    const { service, state } = authorityFixture();
    state.authority.identities = ['Student', 'Mentor'];
    state.authority.identityCapabilities.Mentor = ['studio.edit.own'];
    const actor = await service.resolveActorContext({}, 'request-1', 'Mentor');
    expect(actor.activeIdentity).toBe('Mentor');
    expect(actor.capabilities).toEqual(['studio.edit.own']);
    expect(actor.capabilities).not.toContain('board.edit.member');
  });

  test('staff capabilities never add a product identity', async () => {
    const { service, state } = authorityFixture();
    state.authority.staffCapabilities = ['money.reconcile.assigned'];
    const actor = await service.resolveActorContext({}, 'request-1');
    expect(actor.identities).toEqual(['Student']);
    expect(actor.capabilities).toContain('money.reconcile.assigned');
    await expect(service.resolveActorContext({}, 'request-2', 'Mentor')).rejects.toMatchObject({ code: 'INPUT_INVALID' });
  });

  test('rejects forged or deserialized actor objects before any capability grant', async () => {
    const { service } = authorityFixture();
    const actor = await service.resolveActorContext({}, 'request-1');
    await expect(service.requireCapability(TX, JSON.parse(JSON.stringify(actor)), BOARD, 'board.edit.member')).rejects.toMatchObject({ code: 'AUTH_REQUIRED' });
  });

  test('requires a matching live transactional fence, not only the capability snapshot', async () => {
    const { service, state } = authorityFixture();
    const actor = await service.resolveActorContext({}, 'request-1');
    await expect(service.requireCapability(TX, actor, BOARD, 'board.edit.member')).resolves.toBeUndefined();
    state.proofChanges.authzEpoch = 5;
    await expect(service.requireCapability(TX, actor, BOARD, 'board.edit.member')).rejects.toMatchObject({ code: 'RESOURCE_NOT_AVAILABLE' });
  });

  test('rejects changed authorization epochs and revoked current capabilities', async () => {
    const { service, state } = authorityFixture();
    const actor = await service.resolveActorContext({}, 'request-1');
    state.authority.authzEpoch = 5;
    await expect(service.requireCapability(TX, actor, BOARD, 'board.edit.member')).rejects.toMatchObject({ code: 'RESOURCE_NOT_AVAILABLE' });
    state.authority.authzEpoch = 4;
    state.authority.identityCapabilities.Student = ['context.read.own'];
    await expect(service.requireCapability(TX, actor, BOARD, 'board.edit.member')).rejects.toMatchObject({ code: 'RESOURCE_NOT_AVAILABLE' });
  });

  test('rejects generation changes even if account and roles are unchanged', async () => {
    const { service, state } = authorityFixture();
    const actor = await service.resolveActorContext({}, 'request-1');
    state.session.sessionGeneration = 'generation-2';
    await expect(service.getPublicContext(actor)).rejects.toMatchObject({ code: 'AUTH_REQUIRED' });
  });

  test('rejects an expired or revoked current session before responding', async () => {
    const { service, state } = authorityFixture();
    const actor = await service.resolveActorContext({}, 'request-1');
    state.now = '2026-11-10T00:00:00.000Z';
    await expect(service.getPublicContext(actor)).rejects.toMatchObject({ code: 'AUTH_REQUIRED' });
    state.now = NOW;
    state.session.state = 'revoked';
    await expect(service.getPublicContext(actor)).rejects.toMatchObject({ code: 'AUTH_REQUIRED' });
  });

  test('rejects mismatched authenticated/current account binding', async () => {
    const { service, state } = authorityFixture();
    state.session.accountId = 'other-account';
    await expect(service.resolveActorContext({}, 'request-1')).rejects.toMatchObject({ code: 'AUTH_REQUIRED' });
  });

  test('does not grant access when the fence adapter is missing or malformed', async () => {
    const { service, state } = authorityFixture();
    const actor = await service.resolveActorContext({}, 'request-1');
    state.proofChanges.serial = 0;
    await expect(service.requireCapability(TX, actor, BOARD, 'board.edit.member')).rejects.toMatchObject({ code: 'TEMPORARILY_UNAVAILABLE' });
    await expect(authorityModule().resolveActorContext({}, 'request-1')).rejects.toMatchObject({ code: 'TEMPORARILY_UNAVAILABLE' });
  });

  test('nonenumeratingDiscovery: missing and unauthorized resource share a generic denial', async () => {
    const { service, state } = authorityFixture();
    const actor = await service.resolveActorContext({}, 'request-1');
    state.proofChanges.allowed = false;
    const missing = await service.requireCapability(TX, actor, { kind: 'note', id: 'missing' }, 'board.edit.member').catch((value) => value);
    const other = await service.requireCapability(TX, actor, { kind: 'note', id: 'private-other' }, 'board.edit.member').catch((value) => value);
    expect(missing).toMatchObject({ code: 'RESOURCE_NOT_AVAILABLE' });
    expect(other.code).toBe(missing.code);
    expect(other.message).toBe(missing.message);
    expect(other.message).not.toContain('private-other');
  });
});

function responseSink() {
  return {
    statusCode: null,
    body: null,
    status(value) { this.statusCode = value; return this; },
    json(value) { this.body = value; return this; },
  };
}

function grantRequestBody() {
  return JSON.stringify({
    operationId: 'op-1', expectedVersion: 2, policyVersion: 'policy-1',
    resource: { kind: 'board', id: 'board-1' },
    payload: { document: { kind: 'board', id: 'board-1' }, purpose: 'authorized-call', requestedPermissions: ['read'] },
  });
}

function handlers(authority, contractsEnabled = true) {
  return require('../routes/fp2Routes').createFp2Handlers({
    authority, contractsEnabled, requestIdFactory: () => 'server-request-1',
  });
}

describe('FP2 gated transport handlers without a server', () => {
  test('own context stays available when new command flag is off', async () => {
    const { service } = authorityFixture();
    const res = responseSink();
    await handlers(service, false).context({ query: {}, body: { role: 'Mentor' } }, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.context).toMatchObject({ activeIdentity: 'Student', accountId: 'account-1', requestId: 'server-request-1' });
    expect(res.body.context.authSessionId).toBeUndefined();
  });

  test('flag off denies protected commands instead of pretending to commit', async () => {
    const { service } = authorityFixture();
    const res = responseSink();
    await handlers(service, false).command({ params: { commandName: 'board.grant.request' }, body: grantRequestBody() }, res);
    expect(res.statusCode).toBe(404);
    expect(res.body).toMatchObject({ kind: 'problem', problem: { code: 'RESOURCE_NOT_AVAILABLE', requestId: 'server-request-1' } });
    expect(res.body.receipt).toBeUndefined();
  });

  test('rejects unknown command suffixes before any coordinator success', async () => {
    const { service } = authorityFixture();
    const res = responseSink();
    await handlers(service).command({ params: { commandName: 'board.grant.request.fake' }, body: grantRequestBody() }, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.problem.code).toBe('COMMAND_UNSUPPORTED');
  });

  test('duplicate raw JSON body is input-invalid, not overwritten intent', async () => {
    const { service } = authorityFixture();
    const res = responseSink();
    const body = grantRequestBody().replace('"operationId":"op-1"', '"operationId":"op-1","operationId":"op-2"');
    await handlers(service).command({ params: { commandName: 'board.grant.request' }, body }, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.problem.code).toBe('INPUT_INVALID');
  });

  test('does not accept already-parsed bodies that lost duplicate-key evidence', async () => {
    const { service } = authorityFixture();
    const res = responseSink();
    await handlers(service).command({ params: { commandName: 'board.grant.request' }, body: JSON.parse(grantRequestBody()) }, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.problem.code).toBe('INPUT_INVALID');
  });

  test('strictly rejects invalid UTF8 command bytes', async () => {
    const { service } = authorityFixture();
    const res = responseSink();
    await handlers(service).command({ params: { commandName: 'board.grant.request' }, body: Buffer.from([0xc3, 0x28]) }, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.problem.code).toBe('INPUT_INVALID');
  });

  test('a valid command remains unavailable until real C02 coordinator is bound', async () => {
    const { service } = authorityFixture();
    const res = responseSink();
    await handlers(service).command({ params: { commandName: 'board.grant.request' }, body: Buffer.from(grantRequestBody()) }, res);
    expect(res.statusCode).toBe(503);
    expect(res.body.problem).toMatchObject({ code: 'TEMPORARILY_UNAVAILABLE', retryable: true });
    expect(res.body.receipt).toBeUndefined();
  });

  test('rejects mismatched root and payload Board refs', async () => {
    const { service } = authorityFixture();
    const res = responseSink();
    const data = JSON.parse(grantRequestBody());
    data.payload.document.id = 'another-board';
    await handlers(service).command({ params: { commandName: 'board.grant.request' }, body: JSON.stringify(data) }, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.problem.code).toBe('INPUT_INVALID');
  });

  test('does not expose exception messages, rejected bodies or owner/version hints', async () => {
    const res = responseSink();
    const authority = { resolveActorContext: async () => { throw new Error('private owner/key/note text'); } };
    await handlers(authority).context({ query: {} }, res);
    expect(res.statusCode).toBe(503);
    expect(res.body.problem).toMatchObject({ code: 'TEMPORARILY_UNAVAILABLE', decisionIds: [] });
    expect(JSON.stringify(res.body)).not.toContain('private');
    expect(res.body.problem.currentVersion).toBeUndefined();
  });
});

function routerProbe(headers) {
  const { PassThrough } = require('node:stream');
  const { service } = authorityFixture();
  const router = require('../routes/fp2Routes').createFp2Router({
    authority: service, contractsEnabled: true, requestIdFactory: () => 'server-request-1',
  });
  const req = new PassThrough();
  req.method = 'POST';
  req.url = '/commands/board.grant.request';
  req.headers = { 'content-type': 'application/json', 'content-length': '2', ...headers };
  const res = responseSink();
  return new Promise((resolve) => {
    res.json = function json(body) {
      this.body = body;
      resolve({ res, forwarded: null });
      return this;
    };
    router.handle(req, res, (forwarded) => resolve({ res, forwarded }));
    req.end('{}');
  });
}

describe('FP2 final review regressions', () => {
  test('reauthorizes expiry after an awaited authority read before returning context', async () => {
    const base = authorityFixture();
    const state = base.state;
    state.now = '2026-11-08T12:00:00.000Z';
    state.session.expiresAt = '2026-11-08T12:00:01.000Z';
    let advance = false;
    const service = authorityModule().createAuthorityService({
      authenticateRequest: async () => state.authentication,
      readSession: async () => state.session,
      readAuthority: async () => {
        if (advance) state.now = '2026-11-08T12:00:02.000Z';
        return state.authority;
      },
      clock: () => state.now,
    });
    const actor = await service.resolveActorContext({}, 'request-1');
    advance = true;
    await expect(service.getPublicContext(actor)).rejects.toMatchObject({ code: 'AUTH_REQUIRED' });
    state.now = '2026-11-08T12:00:00.000Z';
    const res = responseSink();
    await handlers(service).context({ query: {} }, res);
    expect(res.statusCode).toBe(401);
    expect(res.body.problem.code).toBe('AUTH_REQUIRED');
  });

  test('oversized raw requests get a fixed FP2 input problem and server request ID', async () => {
    const { res, forwarded } = await routerProbe({ 'content-length': '65537' });
    expect(forwarded).toBeNull();
    expect(res.statusCode).toBe(400);
    expect(res.body.problem).toEqual({
      code: 'INPUT_INVALID', requestId: 'server-request-1', retryable: false,
      message: 'Invalid FP2 command input.', decisionIds: [],
    });
  });

  test('unsupported content encoding stays inside the safe FP2 problem boundary', async () => {
    const { res, forwarded } = await routerProbe({ 'content-encoding': 'private-unknown-encoding' });
    expect(forwarded).toBeNull();
    expect(res.statusCode).toBe(400);
    expect(res.body.problem).toMatchObject({ code: 'INPUT_INVALID', requestId: 'server-request-1' });
    expect(JSON.stringify(res.body)).not.toContain('private-unknown-encoding');
  });
});


