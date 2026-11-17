export type Id = string;
export type UtcInstant = string;
export type Version = number;
export type IntUnits = string;
export type Identity = 'Student' | 'Peer' | 'Mentor';
export type Capability = string;
export type CommandName = string;
export type ExpectedVersion = Version | 'absent';
export type JsonValue = null | boolean | number | string | readonly JsonValue[] | { readonly [key: string]: JsonValue };
export type ResourceKind = 'account' | 'request' | 'flare' | 'claim' | 'course' | 'lesson' | 'assessment' | 'review' | 'progression' | 'wallet' | 'session' | 'room' | 'board' | 'note' | 'recording' | 'artifact' | 'consent' | 'case' | 'cycle';
export type ResourceRef = Readonly<{ kind: ResourceKind; id: Id }>;
export type PolicyScope = 'identitySafety' | 'sourceProvenance' | 'grading' | 'progression' | 'virtualEconomy' | 'money' | 'recordingConsent' | 'retention' | 'publicVisibility' | 'board' | 'media' | 'delivery';
export type PolicyGate<T extends JsonValue = JsonValue> =
  | Readonly<{ state: 'unknown'; decisionIds: readonly Id[]; blockedActions: readonly CommandName[] }>
  | Readonly<{ state: 'proposed'; value: T; policyVersion: Id; decisionIds: readonly Id[] }>
  | Readonly<{ state: 'approved'; value: T; policyVersion: Id; approvalId: Id; evidenceIds: readonly Id[]; validFrom: UtcInstant }>
  | Readonly<{ state: 'suspended'; policyVersion: Id; decisionIds: readonly Id[]; reasonCode: string }>;

export type CommandEnvelope<T extends JsonValue = JsonValue> = Readonly<{
  operationId: Id;
  expectedVersion: ExpectedVersion;
  policyVersion: Id;
  resource: ResourceRef;
  payload: T;
}>;

export type Receipt<R> = Readonly<{
  receiptId: Id;
  operationId: Id;
  commandName: CommandName;
  resource: ResourceRef;
  outcome: 'committed' | 'no_change';
  policyVersion: Id;
  resourceVersion: Version;
  affectedVersions: readonly Readonly<{ resource: ResourceRef; version: Version }>[];
  committedAt: UtcInstant;
  result: R;
  eventIds: readonly Id[];
  duplicateOfReceiptId: Id | null;
}>;

export type ProblemCode = 'AUTH_REQUIRED' | 'RESOURCE_NOT_AVAILABLE' | 'INPUT_INVALID' | 'COMMAND_UNSUPPORTED' | 'VERSION_CONFLICT' | 'OPERATION_CONFLICT' | 'POLICY_BLOCKED' | 'SOURCE_BLOCKED' | 'INSUFFICIENT_AVAILABLE' | 'CAPACITY_CONFLICT' | 'CONSENT_REQUIRED' | 'GRANT_EXPIRED' | 'TEMPORARILY_UNAVAILABLE';
export type Problem = Readonly<{
  code: ProblemCode;
  requestId: Id;
  retryable: boolean;
  message: string;
  decisionIds: readonly Id[];
  currentVersion?: Version;
}>;
export type CommandResult<R> =
  | Readonly<{ kind: 'receipt'; receipt: Receipt<R>; replayed: boolean }>
  | Readonly<{ kind: 'processing'; operationId: Id; retryAfterSeconds: number }>
  | Readonly<{ kind: 'problem'; problem: Problem }>;

export type BoardMode = 'EPHEMERAL_CALL' | 'PERSISTENT_STUDIO' | 'COURSE_PUBLISHED';
export type BoardPermission = 'read' | 'edit' | 'export';
export type BoardGrantRequest = Readonly<{ document: ResourceRef; purpose: string; requestedPermissions: readonly BoardPermission[] }>;
export type BoardGrant = Readonly<{
  grantId: Id;
  document: ResourceRef;
  mode: BoardMode;
  purpose: string;
  actorId: Id;
  sessionGeneration: Id;
  authzEpoch: Version;
  membershipVersion: Version;
  consentVersion: Version | null;
  documentVersion: Version;
  permissions: readonly BoardPermission[];
  policyVersion: Id;
  issuedAt: UtcInstant;
  expiresAt: UtcInstant;
}>;
export type ConsentChoice = Readonly<{ purpose: string; scopeVersion: Version; choice: 'grant' | 'deny' }>;
export type ConsentWithdrawal = Readonly<{ purpose: string; scopeVersion: Version }>;

export type EventName = `fp2.v1.${string}`;
export type EventEnvelope<T extends JsonValue = JsonValue> = Readonly<{
  eventId: Id;
  eventName: EventName;
  schemaVersion: 1;
  operationId: Id;
  policyVersion: Id;
  resource: ResourceRef;
  resourceVersion: Version;
  aggregateSequence: Version;
  occurredAt: UtcInstant;
  causationEventId: Id | null;
  payload: T;
}>;

export declare namespace Server {
  const actorBrand: unique symbol;
  const transactionBrand: unique symbol;
  type ActorContext = Readonly<{
    actorId: Id;
    accountId: Id;
    authSessionId: Id;
    sessionGeneration: Id;
    activeIdentity: Identity;
    identities: readonly Identity[];
    capabilities: readonly Capability[];
    authzEpoch: Version;
    sessionExpiresAt: UtcInstant;
    requestId: Id;
    serverNow: UtcInstant;
    [actorBrand]: true;
  }>;
  type Tx = Readonly<{ [transactionBrand]: true }>;
}
