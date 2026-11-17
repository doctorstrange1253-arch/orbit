function schema() {
  return require('../../shared/fp2/schema');
}

function envelope(changes = {}) {
  return {
    operationId: 'op-1',
    expectedVersion: 1,
    policyVersion: 'policy-1',
    resource: { kind: 'board', id: 'board-1' },
    payload: { noteText: 'Original member text', values: [1, true, null] },
    ...changes,
  };
}

function expectInputInvalid(run) {
  let error;
  try {
    run();
  } catch (caught) {
    error = caught;
  }
  expect(error).toMatchObject({ code: 'INPUT_INVALID' });
}

describe('FP2 command envelope', () => {
  test('creates an immutable independent snapshot of valid intent', () => {
    const input = envelope();
    const result = schema().validateEnvelope(input);
    expect(result).toEqual(input);
    expect(result).not.toBe(input);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.resource)).toBe(true);
    expect(Object.isFrozen(result.payload.values)).toBe(true);
    input.payload.noteText = 'Later mutation';
    input.payload.values.push(2);
    expect(result.payload.noteText).toBe('Original member text');
    expect(result.payload.values).toEqual([1, true, null]);
  });

  test.each(['role', 'verified', 'amount', 'graderId', 'actorContext', 'capabilities'])(
    'authorityFieldsRejected: root %s cannot authorize a command',
    (field) => {
      expectInputInvalid(() => schema().validateEnvelope(envelope({ [field]: 'forged' })));
    },
  );

  test.each(['operationId', 'expectedVersion', 'policyVersion', 'resource', 'payload'])(
    'rejects missing required %s',
    (field) => {
      const input = envelope();
      delete input[field];
      expectInputInvalid(() => schema().validateEnvelope(input));
    },
  );

  test.each([0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, true, '1', null])(
    'rejects nonpositive or non-safe expectedVersion %p',
    (expectedVersion) => {
      expectInputInvalid(() => schema().validateEnvelope(envelope({ expectedVersion })));
    },
  );

  test('allows the explicit absent creation version', () => {
    expect(schema().validateEnvelope(envelope({ expectedVersion: 'absent' })).expectedVersion).toBe('absent');
  });

  test.each(['', ' ', ' op-1 ', 'x'.repeat(129), 7, false])('rejects invalid operation ID %p', (operationId) => {
    expectInputInvalid(() => schema().validateEnvelope(envelope({ operationId })));
  });

  test('accepts a bounded opaque ID without converting its value', () => {
    const operationId = 'x'.repeat(128);
    expect(schema().validateEnvelope(envelope({ operationId })).operationId).toBe(operationId);
  });

  test('rejects an unregistered resource kind', () => {
    expectInputInvalid(() => schema().validateEnvelope(envelope({ resource: { kind: 'bankAccount', id: 'a-1' } })));
  });

  test('rejects resource owner or role hints outside the exact resource ref', () => {
    expectInputInvalid(() => schema().validateEnvelope(envelope({ resource: { kind: 'note', id: 'n-1', ownerId: 'victim' } })));
  });

  test('preserves literal member text rather than stripping authority-looking words', () => {
    const noteText = 'role=Mentor, approved, amount, __proto__ are words in my note';
    expect(schema().validateEnvelope(envelope({ payload: { noteText } })).payload.noteText).toBe(noteText);
  });

  test('allows ordinary finite JSON values without treating them as a verified grade', () => {
    expect(schema().validateEnvelope(envelope({ payload: [0.25, false, null, { answer: 3.14 }] })).payload)
      .toEqual([0.25, false, null, { answer: 3.14 }]);
  });

  test.each([NaN, Infinity, undefined, 1n, () => 1, new Date('2026-11-08T00:00:00.000Z')])(
    'rejects non-JSON payload %p',
    (payload) => {
      expectInputInvalid(() => schema().validateEnvelope(envelope({ payload })));
    },
  );

  test('rejects a sparse array instead of converting missing items to null', () => {
    const payload = [1, 2];
    delete payload[0];
    expectInputInvalid(() => schema().validateEnvelope(envelope({ payload })));
  });

  test('rejects undefined object properties rather than changing intent during serialization', () => {
    expectInputInvalid(() => schema().validateEnvelope(envelope({ payload: { answer: undefined } })));
  });

  test('rejects getters without evaluating untrusted accessors', () => {
    let reads = 0;
    const payload = {};
    Object.defineProperty(payload, 'answer', {
      enumerable: true,
      get() {
        reads += 1;
        return 'hidden authority';
      },
    });
    expectInputInvalid(() => schema().validateEnvelope(envelope({ payload })));
    expect(reads).toBe(0);
  });

  test('rejects symbol properties instead of silently dropping hidden intent', () => {
    const payload = { answer: 'a' };
    payload[Symbol('hidden')] = 'b';
    expectInputInvalid(() => schema().validateEnvelope(envelope({ payload })));
  });

  test('rejects cycles with an input problem, not a recursion crash', () => {
    const payload = {};
    payload.self = payload;
    expectInputInvalid(() => schema().validateEnvelope(envelope({ payload })));
  });

  test.each(['__proto__', 'constructor', 'prototype'])(
    'rejects prototype-control JSON key %s without polluting objects',
    (key) => {
      const payload = JSON.parse(`{"${key}":{"polluted":true}}`);
      expectInputInvalid(() => schema().validateEnvelope(envelope({ payload })));
      expect({}.polluted).toBeUndefined();
    },
  );

  test('rejects custom object prototypes instead of inheriting authority fields', () => {
    const payload = Object.create({ verified: true });
    payload.noteText = 'a';
    expectInputInvalid(() => schema().validateEnvelope(envelope({ payload })));
  });

  test('rejects over-deep payloads before recursive work becomes unbounded', () => {
    let payload = null;
    for (let i = 0; i < 40; i += 1) payload = { nested: payload };
    expectInputInvalid(() => schema().validateEnvelope(envelope({ payload })));
  });

  test('rejects an oversized JSON intent before accepting the envelope', () => {
    expectInputInvalid(() => schema().validateEnvelope(envelope({ payload: 'x'.repeat(65537) })));
  });

  test.each([null, [], 'command', 1, true])('rejects non-object envelope %p', (input) => {
    expectInputInvalid(() => schema().validateEnvelope(input));
  });
});

function expectProblem(code, run) {
  let error;
  try {
    run();
  } catch (caught) {
    error = caught;
  }
  expect(error).toMatchObject({ code });
}

function boardGrant() {
  return {
    grantId: 'grant-1',
    document: { kind: 'board', id: 'board-1' },
    mode: 'PERSISTENT_STUDIO',
    purpose: 'studio-notes',
    actorId: 'member-1',
    sessionGeneration: 'generation-1',
    authzEpoch: 3,
    membershipVersion: 2,
    consentVersion: null,
    documentVersion: 5,
    permissions: ['read', 'edit'],
    policyVersion: 'policy-1',
    issuedAt: '2026-11-08T00:00:00.000Z',
    expiresAt: '2026-11-08T00:10:00.000Z',
  };
}

describe('FP2 raw JSON and closed registries', () => {
  test('parses a raw envelope without losing its validated intent', () => {
    expect(schema().parseEnvelope(JSON.stringify(envelope()))).toEqual(envelope());
  });

  test('rejects duplicate raw JSON keys before ordinary JSON parsing hides them', () => {
    const raw = '{"operationId":"op-1","operationId":"op-2","expectedVersion":1,"policyVersion":"p-1","resource":{"kind":"board","id":"b-1"},"payload":{}}';
    expectInputInvalid(() => schema().parseEnvelope(raw));
  });

  test('rejects duplicate decoded keys written using Unicode escapes', () => {
    const key = `operation${String.fromCharCode(92)}u0049d`;
    const raw = `{"operationId":"op-1","${key}":"op-2","expectedVersion":1,"policyVersion":"p-1","resource":{"kind":"board","id":"b-1"},"payload":{}}`;
    expectInputInvalid(() => schema().parseEnvelope(raw));
  });

  test('rejects duplicate nested payload keys', () => {
    const raw = '{"operationId":"op-1","expectedVersion":1,"policyVersion":"p-1","resource":{"kind":"board","id":"b-1"},"payload":{"choice":"grant","choice":"deny"}}';
    expectInputInvalid(() => schema().parseEnvelope(raw));
  });

  test.each(['{} trailing', '{"x":01}', '{"x":true,}', '[1,]', '{"x":1e400}', '{"__proto__":{}}'])(
    'rejects invalid or dangerous raw JSON %s',
    (raw) => expectInputInvalid(() => schema().parseEnvelope(raw)),
  );

  test('rejects an unescaped raw control character', () => {
    expectInputInvalid(() => schema().parseEnvelope(`{"x":"${String.fromCharCode(0)}"}`));
  });

  test('accepts only the registered Board grant request shape', () => {
    const payload = {
      document: { kind: 'board', id: 'board-1' },
      purpose: 'authorized-call',
      requestedPermissions: ['read', 'edit'],
    };
    const result = schema().validateRegisteredPayload('board.grant.request', payload);
    expect(result).toEqual(payload);
    expect(Object.isFrozen(result.requestedPermissions)).toBe(true);
  });

  test.each(['role', 'verified', 'approved', 'amount', 'graderId', 'authzEpoch'])(
    'rejects %s authority in a registered client payload',
    (key) => expectInputInvalid(() => schema().validateRegisteredPayload('board.grant.request', {
      document: { kind: 'board', id: 'board-1' },
      purpose: 'authorized-call',
      requestedPermissions: ['read'],
      [key]: 'forged',
    })),
  );

  test.each([[], ['read', 'read'], ['admin'], 'edit'])(
    'rejects invalid or duplicated requested Board permissions %p',
    (requestedPermissions) => expectInputInvalid(() => schema().validateRegisteredPayload('board.grant.request', {
      document: { kind: 'board', id: 'board-1' },
      purpose: 'authorized-call',
      requestedPermissions,
    })),
  );

  test('rejects a non-Board ref for a Board grant', () => {
    expectInputInvalid(() => schema().validateRegisteredPayload('board.grant.request', {
      document: { kind: 'note', id: 'n-1' },
      purpose: 'authorized-call',
      requestedPermissions: ['read'],
    }));
  });

  test('validates recording choice separately from deny-only withdrawal', () => {
    expect(schema().validateRegisteredPayload('consent.recording.respond', {
      purpose: 'session-recording', scopeVersion: 2, choice: 'deny',
    })).toEqual({ purpose: 'session-recording', scopeVersion: 2, choice: 'deny' });
    expect(schema().validateRegisteredPayload('consent.recording.withdraw', {
      purpose: 'session-recording', scopeVersion: 2,
    })).toEqual({ purpose: 'session-recording', scopeVersion: 2 });
    expectInputInvalid(() => schema().validateRegisteredPayload('consent.recording.withdraw', {
      purpose: 'session-recording', scopeVersion: 2, choice: 'grant',
    }));
  });

  test.each(['wallet.client.mint', 'board.grant.request.fake', '__proto__', 'constructor'])(
    'unknownRegistryEntryRejected: command %s has no wildcard acceptance',
    (command) => expectProblem('COMMAND_UNSUPPORTED', () => schema().validateRegisteredPayload(command, {})),
  );

  test('validates a registered server grant entity and result without granting client authority', () => {
    const input = boardGrant();
    expect(schema().validateRegisteredEntity('fp2.board.grant.v1', input)).toEqual(input);
    expect(schema().validateRegisteredResult('board.grant.request', input)).toEqual(input);
    expectInputInvalid(() => schema().validateRegisteredEntity('fp2.board.grant.v1', { ...input, amount: '999' }));
  });

  test('rejects unknown entity schema instead of accepting arbitrary Board objects', () => {
    expectInputInvalid(() => schema().validateRegisteredEntity('fp2.board.anything.v1', boardGrant()));
  });

  test('rejects an impossible date or non-forward grant expiry', () => {
    expectInputInvalid(() => schema().validateRegisteredEntity('fp2.board.grant.v1', {
      ...boardGrant(), issuedAt: '2026-02-30T00:00:00.000Z',
    }));
    expectInputInvalid(() => schema().validateRegisteredEntity('fp2.board.grant.v1', {
      ...boardGrant(), expiresAt: '2026-11-07T00:00:00.000Z',
    }));
  });

  test('accepts only the registered event version and payload', () => {
    const event = {
      eventId: 'event-1', eventName: 'fp2.v1.consent.changed', schemaVersion: 1,
      operationId: 'op-1', policyVersion: 'policy-1', resource: { kind: 'consent', id: 'consent-1' },
      resourceVersion: 2, aggregateSequence: 2, occurredAt: '2026-11-08T00:00:00.000Z',
      causationEventId: null, payload: { purpose: 'session-recording', scopeVersion: 2, choice: 'deny' },
    };
    expect(schema().validateEventEnvelope(event)).toEqual(event);
    expectInputInvalid(() => schema().validateEventEnvelope({ ...event, eventName: 'fp2.v1.consent.changed.fake' }));
    expectInputInvalid(() => schema().validateEventEnvelope({ ...event, schemaVersion: 2 }));
    expectInputInvalid(() => schema().validateEventEnvelope({ ...event, payload: { ...event.payload, verified: true } }));
  });
});

