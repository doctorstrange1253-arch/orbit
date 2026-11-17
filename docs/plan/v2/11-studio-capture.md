# Studio Capture Implementation Plan

Date: 2026-11-08. Phase: E continuation, F6. Status: PROPOSED, NOT IMPLEMENTED, NOT PLAN LOCKED.

> For agentic workers: This is returned planning material. MAIN alone writes/registers it. Implementation requires a later explicit execution gate; every task and assertion below is future and NOT RUN.

**Goal:** Extend the mounted mentor recorder into a private-first, recoverable authoring pipeline that distinguishes captured, locally acknowledged, server-verified, processed, reviewed and published media.
**Architecture:** Keep existing capture/review/library surfaces behind OWN capture, journal and media adapters. All authoritative mutations use the coordinator, schema registry, live fences, receipts and outbox from the written platform contract; byte transport and processing never independently grant publication or learning credit.
**Tech Stack:** Existing JS/JSX, native browser capture seams and the audited Board. Storage, codecs, upload protocol, processing provider and packages remain unselected. TypeScript-style notation defines contracts, not a migration.
**Spec:** `D:/orbit-main/orbit-main/docs/plan/v2/03-platform-contracts.md`; companion notes/Board and UX documents returned with this plan.

## 1. Evidence and scope

| Written evidence | Supports | Does not establish |
|---|---|---|
| `D:/orbit-main/orbit-main/docs/plan/v2/03-platform-contracts.md` | Canonical proposed commands, authority, atomicity, consent and exact maps | Deployed routes, approved policy or working topology |
| `D:/orbit-main/orbit-main/docs/plan/v2/01-existing-system-audit.md`, B03/B10/B11 | Mounted Recorder/MediaLibrary, Board reuse and source-checked integration failures | Actual browser, provider, playback or crash acceptance |
| `D:/orbit-main/orbit-main/docs/plan/v2/research-media-whiteboard.md`, MW-S06/07/08/12/18/19 | Capture permission caveats, chunk delays, processed-audio seam and dated Stream meters/upload constraints | Complete browser matrix, durable browser storage or full processing API |
| `D:/orbit-main/orbit-main/docs/plan/v2/research-notes-calls.md` | Distinct RTC, recording, storage, transcription and commercial meters | All-in studio cost or vendor selection |
| `D:/orbit-main/orbit-main/docs/plan/v2/thinking-studio-motion.md` | Acknowledgment ladder, private artifacts, map examples and failure expectations | Measured performance or final release scope |
| `D:/orbit-main/orbit-main/docs/plan/v2/feature-card-pack-03.md`, X-090 | Proposed learner-safe version-refit dependency | Approval to ship that feature or recover unseen instructions |

Research observations were accessed 2026-11-06; they are not newly checked vendor facts. No source re-audit, browser/camera/model/provider/server run or actual asset was produced here.

Non-goals: a replace-all studio, third Board, production recording of every call, paid access advantage, automatic quiz grading, automatic publication, external vendor procurement or recovery of the missing detailed E/F tail. Cover received F6 requirements within known F1-F9 only.

## 2. Global constraints and review focus

- All normal JSON commands use `CommandEnvelope<T>` with `operationId`, `expectedVersion`, `policyVersion` and a canonical `ResourceRef`; routes begin `/api/v2/fp2`, durable events `fp2.v1.`.
- Import canonical `ActorContext`, `PolicyGate`, `Problem`, `Receipt`, `Version`, `IntUnits`, `TimeAnchor`, `EditTimeMap` and `AnchorMapping`; never define competing authority, currency or map semantics.
- Server constructs ActorContext and conditionally touches live sessionGeneration/authzEpoch, membership, consent and resource fences in the same transaction as business changes. Client role, URL and camera permission confer no authority.
- Capture, playback, notes and basic export do not mint virtual assets, grades, rank or reviews. Any later benefit uses the shared immutable root/equivalence family, fixed source cycle and authoritative grade registry.
- Student best 15 -> 18 gives 3; repeated 18/lower 15 gives 0. F6 never normalizes raw/rational scores, floors them or reinterprets a credited best.
- Session share remains fixed 15%; subscription separately 20%, with remaining 80% for enrolled-course mentors under an approved allocation/base policy. This package introduces no charge or rate override.
- Retention, age/guardian/session safety, rights, costs and all names/formulas/caps remain proposed or unknown until approved. Unknown required values are typed blocks, never zero.
- Preserve private-first content and owner-private student artifacts. A course owner's Mentor role does not authorize reading student notes, mistakes or exports.

Review focus and owning tests: delayed final chunks after local stop (Task 3/F6-06); logout with unsynced bytes (Task 2/F6-22); concurrent withdrawal versus ingest (Task 5/F6-21); stale processing output after retake (Task 6/F6-31); revoked originals versus cached derivatives (Task 8/F6-24).

## 3. Alternatives and bounded recommendation

| Approach | Benefit | Cost/risk | Proposal |
|---|---|---|---|
| Keep existing recorder unchanged | Smallest initial change | Existing recovery, media-access and cut-parity gaps remain hidden | Reject as an authoritative release path |
| Replace recorder/editor/Board with a suite | Potential bundled authoring conveniences | License, migration, private-data, authority and time-map risk; no verified drop-in API | Do not select |
| Extend existing surfaces through OWN adapters | Preserves useful UI; isolates capture/storage/provider differences | Requires explicit reliability and policy work | Recommend one private recording slice first |

This is an engineering recommendation, not a user-approved dependency or release decision. No new library or hosted service is selected.

## 4. Capture support matrix and actual probes

Evidence states are `DOCUMENTED`, `UNVERIFIED`, `PROBE_REQUIRED`, `UNSUPPORTED`. DOCUMENTED means the cited primitive/limitation, not a tested product path. PROBE_REQUIRED means release cannot claim support until an authorized probe records the exact configuration. UNSUPPORTED requires an explicit product exclusion or failed-probe evidence; absence of research is not UNSUPPORTED.

| Capability | General evidence | Desktop Chromium: Windows/macOS/Linux | Desktop Firefox: Windows/macOS/Linux | Desktop Safari: macOS | Mobile Safari: iOS/iPadOS | Mobile Chromium: Android |
|---|---|---|---|---|---|---|
| Camera | Audited recorder seam; dedicated getUserMedia compatibility not read | PROBE_REQUIRED | PROBE_REQUIRED | PROBE_REQUIRED | PROBE_REQUIRED | PROBE_REQUIRED |
| Microphone | Same; physical permission and track presence separate | PROBE_REQUIRED | PROBE_REQUIRED | PROBE_REQUIRED | PROBE_REQUIRED | PROBE_REQUIRED |
| Entire screen video | MW-S06: secure context, activation, fresh display permission | PROBE_REQUIRED | PROBE_REQUIRED | PROBE_REQUIRED | UNVERIFIED | UNVERIFIED |
| Window video | Offered surfaces depend on implementation/user choice | PROBE_REQUIRED | PROBE_REQUIRED | PROBE_REQUIRED | UNVERIFIED | UNVERIFIED |
| Browser tab video | No complete surface-offering matrix read | PROBE_REQUIRED | PROBE_REQUIRED | UNVERIFIED | UNVERIFIED | UNVERIFIED |
| Tab audio | MW-S06: optional audio, browser/OS/surface-dependent | PROBE_REQUIRED | PROBE_REQUIRED | PROBE_REQUIRED | UNVERIFIED | UNVERIFIED |
| System/window audio | Requested audio need not yield an audio track | PROBE_REQUIRED | PROBE_REQUIRED | PROBE_REQUIRED | UNVERIFIED | UNVERIFIED |
| Mic plus display-audio mix | MW-S08 documents an output seam, not this complete recipe | PROBE_REQUIRED | PROBE_REQUIRED | PROBE_REQUIRED | PROBE_REQUIRED | PROBE_REQUIRED |
| Canvas composition recording | Mounted recorder is source evidence, not device acceptance | PROBE_REQUIRED | PROBE_REQUIRED | PROBE_REQUIRED | PROBE_REQUIRED | PROBE_REQUIRED |
| Recorder MIME/codec and playback | MW-S07 documents MIME probing; probe result alone is insufficient | PROBE_REQUIRED | PROBE_REQUIRED | PROBE_REQUIRED | PROBE_REQUIRED | PROBE_REQUIRED |
| Durable local write/reload recovery | No quota/eviction/durability evidence established | PROBE_REQUIRED | PROBE_REQUIRED | PROBE_REQUIRED | PROBE_REQUIRED | PROBE_REQUIRED |
| Background effect | Algorithm/package/license/performance unselected | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED |
| Offline shared-call recording after live authority becomes unverifiable | Explicit safety exclusion | UNSUPPORTED | UNSUPPORTED | UNSUPPORTED | UNSUPPORTED | UNSUPPORTED |

No cell asserts YES or actual device support. Permission denied on one attempt is not a global browser-support conclusion. Windows 11 is the planning environment, not a tested capture device.

Future probe record pins browser/version, OS/build, hardware class, surface actually offered/selected, permission state, track kinds/settings, requested and actual MIME, measured media clock, preview/playback result, pause/lock/background behavior, durable-write test and evidence IDs. Store only approved minimal diagnostics; device labels and captured content are private. A settings request or `isTypeSupported` result is not successful recording/playback.

Future probe sequence: explicit user gesture -> approved permission UI -> inspect actual tracks -> bounded authorized sample -> local acknowledgment -> stop -> reload/playback/integrity check -> interruption cases. Not run now. Unverified functions expose an honest fallback such as camera/mic-only, permitted file upload or no recording; never silently choose another screen or substitute fake audio.

## 5. Typed policy gates

These extension declarations consume `PolicyGate<T>` from 03. Configuration ranges and durations below have no approved defaults.

```ts
type CapturePrivacyPolicy = Readonly<{
  deviceDisclosureVersion: Id; encryptionProfileId: Id; keyLifecyclePolicyId: Id;
  logoutDisposition: "delete" | "lock_until_reauthentication";
  localRetentionPolicyId: Id; sharedDeviceRuleId: Id;
}>;
type CaptureLimitPolicy = Readonly<{
  maxChunkBytes: IntUnits; maxRecordingBytes: IntUnits; maxDurationMs: number;
  lowSpaceReserveBytes: IntUnits; maxBufferedBytes: IntUnits;
  allowedProbeProfileIds: readonly Id[]; allowedMimeProfileIds: readonly Id[];
}>;
type MediaRightsPolicy = Readonly<{
  purposeId: Id; retentionPolicyId: Id; sourceRightsRuleId: Id;
  requiredReviewPolicyId: Id; derivativeAccessPolicyId: Id;
}>;
type StudioPolicySet = Readonly<{
  privacy: PolicyGate<CapturePrivacyPolicy>; limits: PolicyGate<CaptureLimitPolicy>;
  rights: PolicyGate<MediaRightsPolicy>; processing: PolicyGate<{ adapterProfileId: Id; jobLimitsId: Id }>;
  minimalRevocation: PolicyGate<{ securityPurposeId: Id; retentionPolicyId: Id; fenceProfileId: Id }>;
}>;
```

Required nonapproved gates block their affected actions: privacy blocks new private local persistence; rights/retention blocks new remote recording persistence/publication; processing blocks job creation; unsupported capture profile blocks start. Permission preview must not become hidden recording/persistence. The minimal deny-only withdrawal uses its independent approved security/retention purpose, not continued recording-use approval.

`consent.recording.withdraw` authenticates the participant's consent ownership, requires neither Mentor role nor all-party re-consent, and commits the revocation fence even when recording-use policy is suspended. If minimal durable authority is unavailable, local stop still works; server recording start, permit renewal and ingest fail closed, and remote/durable confirmation is explicitly unavailable. Nonrecording call use requires independently valid booking/participant/age/safety eligibility; unknown mandatory guardian/session eligibility blocks that affected session, never local stop.

## 6. Owned records and invariants

All server timestamps, source versions, permit cutoffs and authoritative byte acknowledgments are server-assigned. Client hashes, lengths and clock reports are evidence candidates, not verified facts. IDs refer to children of canonical recording/artifact roots; no new ResourceKind is silently added.

```ts
type CaptureState = "PREVIEW" | "STARTING" | "RECORDING" | "PAUSING" | "PAUSED" | "STOPPING" | "STOPPED" | "INTERRUPTED" | "LOCAL_SAVE_FAILED";
type UploadState = "NONE" | "RESERVED" | "TRANSFERRING" | "RECONCILING" | "SERVER_VERIFIED" | "BLOCKED" | "UNKNOWN_RESULT";
type ProcessingState = "NONE" | "QUEUED" | "PROCESSING" | "FAILED" | "READY";
type RecordingDraft = Readonly<{
  recordingId: Id; ownerId: Id; version: Version; purposeId: Id; compositionVersion: Version;
  sourceAssetId: Id | null; sourceVersion: Version | null; state: "OPEN" | "SEALED" | "BLOCKED" | "REVOKED";
  consentScopeId: Id | null; currentPermitId: Id | null; policyVersion: Id;
}>;
type Composition = Readonly<{
  recordingId: Id; version: Version; layoutSchemaId: Id; deviceSelectionRefs: readonly Id[];
  slideAssetRefs: readonly ResourceRef[]; boardRef: ResourceRef | null; backgroundProfileId: Id | null;
}>;
type SourceSegment = Readonly<{
  segmentId: Id; recordingId: Id; sourceVersion: Version; ordinal: number;
  clockProfileId: Id; compositionVersion: Version; state: "OPEN" | "SEALED" | "GAP";
  validatedStartMs: number | null; validatedEndMs: number | null;
}>;
type RecordingPermit = Readonly<{
  permitId: Id; recordingId: Id; purposeId: Id; scopeVersion: Version;
  participantFenceRefs: readonly Id[]; membershipVersion: Version | null;
  sessionGeneration: Id; authzEpoch: Version; consentVersion: Version | null;
  validUntil: UtcInstant; state: "ACTIVE" | "REVOKED" | "EXPIRED";
}>;
type ChunkCandidate = Readonly<{
  chunkId: Id; segmentId: Id; ordinal: number; byteLength: IntUnits; digest: string;
  mimeProfileId: Id; captureClockRef: Id; reportedIntervalRef: Id;
}>;
type LocalChunkAck = Readonly<{
  chunkId: Id; byteLength: IntUnits; digest: string; storeRevision: Version;
  durabilityEvidenceId: Id; accountScopeKey: Id;
}>;
type RecoveryCheckpoint = Readonly<{
  checkpointId: Id; recordingId: Id; journalRevision: Version; acknowledgedChunkIds: readonly Id[];
  lastValidatedIntervalRef: Id | null; missingIntervalRefs: readonly Id[];
}>;
type UploadSession = Readonly<{
  uploadId: Id; recordingId: Id; sourceCandidateId: Id; version: Version;
  adapterProfileId: Id; transportIdentity: Id; manifestVersion: Version;
  state: UploadState; expiresAt: UtcInstant;
}>;
type VerifiedPartAck = Readonly<{
  uploadId: Id; partId: Id; chunkId: Id; byteLength: IntUnits; digest: string;
  contiguousOffsetBytes: IntUnits; serverManifestVersion: Version; acknowledgedAt: UtcInstant;
}>;
type MediaArtifact = Readonly<{
  artifactId: Id; recordingId: Id; sourceVersion: Version; sourceManifestRef: Id;
  validatedDurationMs: number; sourceDigest: string; accessPolicyId: Id;
  processingState: ProcessingState; currentEditVersion: Version; publicationState: "PRIVATE" | "CANDIDATE" | "PUBLISHED" | "REVOKED";
}>;
type ProcessingJob = Readonly<{
  jobId: Id; artifactId: Id; sourceVersion: Version; editVersion: Version;
  profileId: Id; state: ProcessingState; outputRefs: readonly ResourceRef[]; failureCode: string | null;
}>;
```

| Owned record | Required uniqueness/index | Boundary |
|---|---|---|
| RecordingDraft/Composition | Recording ID; `(recordingId,compositionVersion)`; owner/state | Owner-private; immutable composition history |
| Local bytes/journal/checkpoint | `(accountScopeKey,recordingId,chunkId)`; chunk ordinal; checkpoint revision | Proposed device store, enabled only under approved privacy/durability policy |
| SourceSegment | `(recordingId,sourceVersion,ordinal)`; segment ID | Retakes create new segments; never overwrite old source identity |
| UploadSession | Upload ID; stable source-candidate transport identity; owner/state/expiry | Expiry permits reconciliation, not assumed deletion or lost bytes |
| Verified part | `(uploadId,partId)` and `(uploadId,chunkId)`; offset/manifest | Different bytes for same semantic part conflict, not overwrite |
| MediaArtifact | Artifact ID; source candidate finalize key | Source manifest immutable after validation |
| ProcessingJob | `(artifactId,sourceVersion,editVersion,profileId)` | Duplicate finish/retry cannot create duplicate output jobs |
| Derivative/caption track | `(artifactId,sourceVersion,editVersion,kind,trackVersion)` | Every HLS segment/caption/thumbnail inherits explicit access rules |
| Review/publication candidate | `(artifactId,editVersion,reviewVersion)`; course/lesson target | Review binds exact source/map/composition/caption versions |

Use shared Operation/Receipt/Outbox/ProviderInbox/fences; do not create a studio completion table that bypasses their transaction. Index definitions are requirements, not applied migrations. Content, local diagnostics, dedup markers and receipts have separately approved purpose/retention; no invented indefinite retention or TTL that reopens duplicate finalize/publication.

## 7. Local journal and recovery algorithm

1. Before persistence, resolve approved local privacy/retention/key policy and actual capability profile. Scope every record to account/session identity; device storage is not permission to retain another account's content.
2. Reserve bounded buffer/space according to approved limits. Available-space API output is an estimate, not guaranteed quota; unknown space does not become unlimited capacity.
3. Assign segment/chunk identities before staging; write bytes to a staging location, compute the approved digest, and record byte length and capture-clock evidence. Never derive source duration from callback count.
4. Through the chosen OWN store, atomically make a complete chunk and its journal reference recoverable, with the adapter's approved durable acknowledgment. Without durability evidence, label it buffered, not saved locally.
5. Commit a RecoveryCheckpoint referencing only acknowledged chunks. A final callback, stop request or completed JavaScript promise alone is not a checkpoint.
6. On reload, authenticate/reconstruct the permitted scope, enumerate approved journal entries, verify referenced bytes/length/digest, classify incomplete staging and report missing or uncertain intervals. Do not invent a gap length when the media clock is unknown.
7. Reconcile server manifests before resuming uploads. Bytes already verified remotely may permit recovery when local bytes are gone, subject to current access; a stale local journal cannot downgrade the server manifest.
8. Resume authoring as a new segment, never append fictional uninterrupted time. Preserve old source/version references; recoverable container decoding/muxing must be validated before declaring the artifact playable.
9. On low space or write failure, stop/pause safely, retain only allowed acknowledged content, expose buffered-versus-acknowledged boundaries and do not silently drop chunks to continue recording.
10. On logout/account switch, stop capture and revoke/stop renewing permits; abort uploads/listeners, clear in-memory scope and apply approved local deletion/locking/key rules before mounting the next account. Security cannot wait for a successful export.

A crash after byte staging but before journal acknowledgment yields unacknowledged candidate bytes, not saved footage. An atomic browser-store transaction does not prove survival of eviction, device loss or every OS crash. Launch requires actual store/topology/durability evidence and honest limits.

## 8. Capture, interruption and recovery transitions

| From / input | Next state | Permitted action and truth |
|---|---|---|
| PREVIEW / approved policy, selected actual tracks and valid permit | STARTING | Allocate bounded buffer; no recorded-success label |
| STARTING / recorder actually starts | RECORDING | Record current segment; expose track and acknowledgment status |
| RECORDING / pause requested | PAUSING | Preserve final pending chunk; do not equate request with paused media |
| PAUSING / validated recorder/clock boundary | PAUSED | Seal interval; upload acknowledged bytes only if current authority allows |
| PAUSED / explicit resume, renewed live authority | RECORDING | New segment; no silent wall-clock continuity |
| RECORDING / device/display track ends | INTERRUPTED | Stop affected source; default pause composition, require explicit fallback |
| Any active / local stop or withdrawal | STOPPING then STOPPED/INTERRUPTED | Stop tracks immediately; capture-off truth does not wait for server |
| Any active / local save error or quota danger | LOCAL_SAVE_FAILED | Stop/pause; identify last acknowledgment and uncertain tail |
| STOPPING / delayed final blob | STOPPED | Persist/ingest only intervals allowed by current prior-content policy and fences |
| Reload / journal recoverable | STOPPED | Recovery tray; no automatic recording restart or remote-success claim |
| Any / membership, role, account or consent loss | BLOCKED server state | No new ingest/renewal; permitted prior-content resolution only |

Pause differs from stop: paused recorders may retain active source tracks, which must remain visibly disclosed and proven per profile. Stop/withdrawal stops source tracks and cancels capture callbacks. Retake is an edit proposal with a new segment and edit version; deletion of earlier bytes is separate approved retention action.

## 9. Resumable upload and acknowledgment ladder

| Level | Required evidence | Allowed copy |
|---|---|---|
| Buffered | Bytes exist only in current process or unacknowledged staging | `Buffered here. Not yet saved.` |
| Locally acknowledged | Verified bytes plus durable journal acknowledgment under approved adapter | `Saved on this device through the last recovery checkpoint.` |
| Transfer accepted | Transport accepted request/part; verification pending | `Transfer received. Verification is pending.` |
| Server verified | Server verified stored bytes, manifest, contiguous offsets and authorized acknowledgment | `Verified on the server.` |
| Processing ready | Approved outputs validated for playback, access and exact versions | `Ready for review.` |
| Mentor reviewed | Owner reviewed exact artifact/edit/caption set | `Your review is saved. Publication checks remain.` |
| Published | Canonical publication receipt after appointed review/rights/entitlement gates | `Published version saved.` |

Upload protocol is an adapter decision, not a fabricated SDK. MW-S19's dated Stream evidence says basic direct POST is limited to 200 MB, tus required above that and recommended for unreliable connections; creation-time expiry/duration metadata matters. This is one candidate's evidence, not an implemented app interface.

Algorithm: create an authorized stable upload session -> reserve declared bounded parts -> stage bytes under live permitted ingress -> read server authoritative offsets/manifests -> verify each part -> acknowledge verified manifest -> finalize once -> validate full ordered-source digest/container/timeline -> atomically link one source artifact/job/receipt/outbox. Hashing concatenated digest strings is not the full-source digest. Unknown offsets or ambiguous external results enter RECONCILING/UNKNOWN_RESULT; never blindly append/restart or claim success.

The adapter must specify part order, duplicate-part behavior, checksum scope, range queries, expiry, interruption, finalization identity, maximum sizes and reconciliation. A provider capability gap blocks that adapter. Tokens remain server-held; a transport ticket is bounded and revocable, not an eternal bearer upload grant. If live ingest fences cannot be enforced at the actual boundary, no shared-recording launch.

An expired auth session pauses network work; reauthentication rechecks owner, identity, source rights, consent and policy. It does not reset operation/source identity. Losing a response after a business commit is resolved through the same operation ID; provider inbox acceptance is not business completion.

## 10. Processing, review and publication

Pipeline: source validation -> immutable edit map -> version-bound processing job -> authorized HLS/playback derivatives -> caption draft/correction -> owner review -> appointed publication review -> canonical lesson/course publication. Each stage has its own status; no percentage is guessed from elapsed time.

- Source validation checks actual bytes, codec/container, intervals, gaps and approved rights. A corrupt/incomplete source stays FAILED/BLOCKED with a repair route.
- V1 cut-only edits are rate-1 half-open spans. Frame/sample accuracy and re-encode/remux boundaries require measured acceptance; MediaRecorder does not supply a frame-accurate retake API.
- HLS playlists, segments, original downloads, captions, thumbnails and audio all require current resource/entitlement checks or an approved expiring mediation scheme. Public responses never reveal protected original URLs.
- Caption tracks bind source/edit/language/track versions. Missing captions have a visible accessibility/review state, not an invented empty transcript. Generated captions are drafts until required checks pass.
- Replacing media cannot retain unrelated old audio/caption/layout references. A completed job for an old edit cannot overwrite the current candidate.
- Owner review is not appointed publication authority. Publish checks ownership, claimant/outline linkage where F1 requires it, source rights, media/caption/map versions, assigned reviewer, public projection and learner entitlement.
- Atomic publication updates canonical content, version-bound references, invariant projections, receipt and outbox together. Provider-ready status alone cannot publish a lesson or duplicate partially saved chapter sets.
- Retraction revokes future access/permits and caches according to approved latency/retention policy; already delivered bytes cannot be recalled. Never promise instantaneous deletion from viewers.

Recovery checkpoint, navigation chapter and mentor-approved learning/quiz checkpoint remain separate IDs. Creating a chapter does not create assessment eligibility, mark attendance or award mastery. Assessment submission/grade authority belongs to F4 and 03.

## 11. Immutable time and anchor contract

Use 03's `TimeAnchor`, `EditTimeMap`, `AnchorMapping` and `mapTimeAnchor`. Bounded nonnegative integer source milliseconds originate from a validated timeline, not wall-clock duration or chunk callbacks. Map arithmetic is exact integer/rational; playback-only rounding does not mutate source anchors.

| Source seconds / kept spans | Output / meaning |
|---|---|
| Keep [0,40), [60,100) | Output [0,40), [40,80); duration 80 |
| 70 | Exact 50; stored milliseconds 50000/1 |
| 50 | Removed from complete cut map |
| 40 | Removed; first span excludes its end |
| 60 | Exact 40; second span includes its start |
| 100 | Outside source duration/kept half-open spans; not a valid in-domain anchor placement |
| Pending map or mismatched source identity/version | Unknown or validation block; no placement |
| Unmeasured interruption interval | Unknown clock/gap state; never infer a continuous span |

Retakes create a new segment and edit map; source anchors survive as original refs. Board/caption/audio/slide/note anchors bind the correct source segment and version. Removed anchors stay in a repair tray; no snapping to a nearby quiz or silently regrading prior attempts. Map access does not grant media access. V1 rejects repeated-source occurrences/rate edits; V2 requires explicit occurrence and approved richer-map semantics.

## 12. Proposed commands, byte transport and events

Commands below dispatch through `POST /api/v2/fp2/commands/{name}` and the shared coordinator. Root is recording unless stated. All child/root IDs must match; creation uses `expectedVersion="absent"` plus authorized parent/create capability. Existing canonical consent and Board commands are reused.

| Registered command | Allowlisted payload | Receipt result / primary block |
|---|---|---|
| `studio.recording.create` | `{purposeId, compositionSchemaId, compositionDraftRef, consentScopeId}` | RecordingDraft; 422 POLICY_BLOCKED/CONSENT_REQUIRED |
| `studio.composition.save` | `{layoutSchemaId, layout, slideAssetRefs, boardRef, backgroundProfileId}` | Composition version; 409 VERSION_CONFLICT; asset refs separately authorized |
| `studio.recording.permit.request` | `{scopeVersion, compositionVersion}` | RecordingPermit; live all-participant/guardian/membership checks |
| `studio.recording.stop.report` | `{permitId, lastCandidateChunkId, interruptionCode}` | Minimal stop report; not a consent-withdrawal substitute or verified cutoff |
| `studio.upload.create` | `{sourceCandidateId, manifestSchemaId, manifestRef}` | UploadSession; capacity/retention/adapter block |
| `studio.upload.part.reserve` | `{uploadId, partId, chunk:ChunkCandidate}` | Bounded transport ticket and manifest version; no server-byte acknowledgment |
| `studio.upload.reconcile` | `{uploadId, knownManifestVersion}` | Current permitted manifest/verified offsets; no guessed concatenation |
| `studio.upload.finalize` | `{uploadId, manifestVersion, candidateSourceDigest}` | Artifact validation state/job refs; same candidate cannot produce two sources |
| `studio.edit.propose` | `{artifactId, sourceVersion, keptSpans, compositionVersion}` | Immutable edit/map version; overlapping/invalid spans INPUT_INVALID |
| `studio.processing.request` | `{artifactId, sourceVersion, editVersion, profileId}` | Stable job; missing approved profile POLICY_BLOCKED |
| `studio.caption.revise` | `{artifactId, editVersion, trackId, trackVersion, captionDocumentRef}` | New caption version; no automatic approval |
| `studio.review.record` | `{artifactId, editVersion, captionVersionRefs, disposition}` | Owner review, not publication approval |
| `studio.publication.submit` | `{artifactId, editVersion, lessonRef, reviewRef}` | Candidate only; appointed review/rights checks |
| `studio.publication.commit` | `{candidateId, assignedReviewRef}`; root course/lesson | Canonical publication receipt; explicit capability and affected-version checks |

OWN proposed binary route: `PUT /api/v2/fp2/recordings/{id}/uploads/{uploadId}/parts/{partId}` with bounded transport ticket, declared length/digest and exact approved offset protocol. It performs transport staging only. The ticket references a registered reservation command; transport idempotency is `(uploadId,partId)`, not a new business coordinator. Provider/server verification commits manifest acknowledgment through the shared coordinator under narrow workload authority. Exact binary headers/status semantics require adapter registration and tests; none is asserted as an existing endpoint.

Authorized GETs: `/api/v2/fp2/recordings/{id}/recovery` returns server-manifest/control status, not another device's bytes; `/api/v2/fp2/artifacts/{id}/processing` returns version-bound jobs; canonical operation/projection/anchor GETs remain side-effect-free. All use current resource authorization and account-scoped cache keys.

| Event extension | Bounded payload, references only |
|---|---|
| `fp2.v1.studio.recording.created` | `{recordingId, compositionVersion, purposeId}` |
| `fp2.v1.studio.upload.part.verified` | `{uploadId, partId, manifestVersion, verifiedBytes}` |
| `fp2.v1.studio.source.validated` | `{artifactId, sourceVersion, manifestVersion}` |
| `fp2.v1.studio.processing.changed` | `{jobId, sourceVersion, editVersion, state, safeFailureCode}` |
| `fp2.v1.studio.review.changed` | `{artifactId, editVersion, reviewVersion, disposition}` |
| Shared consent/map/publication events | Reuse 03 registered schemas; no parallel consent or publish authority |

Register exact schemas before accepting any name. Outbox delivery is at-least-once; consumers atomically apply event/checkpoint, reject downgrade and refresh on sequence gaps. Events never carry raw recordings, transcript text, note contents, private URLs or tokens.

Errors reuse 03: 400 INPUT_INVALID/COMMAND_UNSUPPORTED; 401 AUTH_REQUIRED; 404 RESOURCE_NOT_AVAILABLE for absent/unauthorized/revoked; 409 VERSION_CONFLICT/OPERATION_CONFLICT/CAPACITY_CONFLICT; 422 POLICY_BLOCKED/SOURCE_BLOCKED/CONSENT_REQUIRED/GRANT_EXPIRED; 503 TEMPORARILY_UNAVAILABLE. Feature reason codes such as `OFFSET_UNCERTAIN`, `CHECKSUM_MISMATCH`, `CLOCK_UNVALIDATED` and `CODEC_PROFILE_UNSUPPORTED` are safe registered detail, not new ProblemCode values. Local errors have their own display model and are not fabricated server receipts.

## 13. OWN adapters and future files

Every NEW path is proposed, not an existence claim. EXISTING paths are evidence-supported reuse targets; source lines/compatibility must be checked during later implementation.

| File | Status / responsibility |
|---|---|
| `D:/orbit-main/orbit-main/FrontEnd/src/pages/mentor/Recorder.jsx` | EXISTING; extend control shell, replace acknowledgment assumptions |
| `D:/orbit-main/orbit-main/FrontEnd/src/pages/mentor/MediaLibrary.jsx` | EXISTING; display canonical artifact/job/recovery state |
| `D:/orbit-main/orbit-main/FrontEnd/src/whiteboard/board.js` | EXISTING; consume shared Board adapter from companion plan |
| `D:/orbit-main/orbit-main/FrontEnd/src/studio/captureAdapter.js` | NEW; actual tracks/recorder/clock observations |
| `D:/orbit-main/orbit-main/FrontEnd/src/studio/localJournal.js` | NEW; privacy-scoped durable byte/journal contract |
| `D:/orbit-main/orbit-main/FrontEnd/src/studio/uploadController.js` | NEW; reconcile offsets/receipts; no trusted authority construction |
| `D:/orbit-main/orbit-main/BackEnd/services/fp2/studioCommands.js` | NEW; stage recording/composition/upload/review plans in shared Tx |
| `D:/orbit-main/orbit-main/BackEnd/services/fp2/mediaAdapter.js` | NEW; approved byte/probe/processing protocol translation |
| `D:/orbit-main/orbit-main/BackEnd/services/fp2/mediaAccess.js` | NEW; derivative and original access mediation |
| `D:/orbit-main/orbit-main/BackEnd/services/fp2/studioPublication.js` | NEW; exact candidate/review/canonical-publication linkage |
| `D:/orbit-main/orbit-main/shared/fp2/studioSchemas.js` | NEW; registered payload/event/local-journal schemas |
| `D:/orbit-main/orbit-main/shared/fp2/timeMap.js` | SHARED PROPOSED in 03; reuse exact map implementation |

```ts
type ProbeRequest = Readonly<{ profileId: Id; requestedKinds: readonly string[] }>;
type ProbeResult = Readonly<{ state: "verified" | "denied" | "unavailable" | "unknown"; actualTrackRefs: readonly Id[]; evidenceRefs: readonly Id[] }>;
type CaptureObservation = Readonly<{ recordingId: Id; segmentId: Id; state: CaptureState; candidateChunkIds: readonly Id[]; unknownIntervalRefs: readonly Id[] }>;
interface CaptureAdapter {
  probe(request: ProbeRequest): Promise<ProbeResult>;
  start(recording: RecordingDraft, permit: RecordingPermit, composition: Composition): Promise<CaptureObservation>;
  pause(recordingId: Id): Promise<CaptureObservation>;
  resume(recordingId: Id, permit: RecordingPermit): Promise<CaptureObservation>;
  stopLocal(recordingId: Id, reasonCode: string): void;
}
interface LocalJournal {
  persistChunk(scope: AccountScope, chunk: ChunkCandidate, bytes: Uint8Array): Promise<LocalChunkAck>;
  checkpoint(scope: AccountScope, recordingId: Id): Promise<RecoveryCheckpoint>;
  recover(scope: AccountScope, recordingId: Id): Promise<Readonly<{ checkpoints: readonly RecoveryCheckpoint[]; missingChunkIds: readonly Id[]; uncertainIntervalRefs: readonly Id[] }>>;
  disposeScope(scope: AccountScope, disposition: CapturePrivacyPolicy["logoutDisposition"]): Promise<void>;
}
interface MediaAdapter {
  queryUpload(upload: UploadSession): Promise<Readonly<{ state: "known" | "unknown_result"; verifiedParts: readonly VerifiedPartAck[] }>>;
  verifyPart(upload: UploadSession, partId: Id): Promise<VerifiedPartAck>;
  validateSource(upload: UploadSession): Promise<Readonly<{ digest: string; durationMs: number; validatedTimelineRef: Id; gapRefs: readonly Id[] }>>;
  requestProcessing(job: ProcessingJob): Promise<"accepted" | "unknown_result">;
  inspectProcessing(job: ProcessingJob): Promise<Readonly<{ state: ProcessingState; outputRefs: readonly ResourceRef[] }>>;
}
function planStudioCommand(actor: ActorContext, tx: Tx, name: CommandName, envelope: CommandEnvelope<JsonValue>): Promise<AtomicPlan<JsonValue>>;
function authorizeMediaDelivery(actor: ActorContext, artifact: ResourceRef, derivativeId: Id): Promise<Readonly<{ deliveryGrantId: Id; expiresAt: UtcInstant }>>;
function planStudioPublication(actor: ActorContext, tx: Tx, envelope: CommandEnvelope<JsonValue>): Promise<AtomicPlan<JsonValue>>;
```

These are OWN signatures, not MDN/provider SDK methods. Adapter operations that contact providers run outside database transactions through durable instructions; commands stage only plans. Internal verification is workload-authenticated and cannot trust browser-supplied ack/duration/approval. `stopLocal` must execute without awaiting a network/storage operation.

## 14. Illustrative published-meter model

The dated research reports Stream prepaid stored-capacity blocks at 5 displayed-dollar units/month per 1,000 minutes and delivery at 1 per 1,000 delivered minutes. ISO currency, contract and current applicability remain UNKNOWN. This is not a vendor quote, INR conversion or all-in cost.

Synthetic assumptions from D: retain twelve monthly cohorts; modeled delivery equals stated viewer hours times 60. Billable reservations, four-second rounding, buffering/preload and measured usage can differ.

| New minutes/month | Viewer hours/month | Retained minutes | Capacity blocks | Storage/delivery subtotal | Allocated subtotal per new production hour |
|---|---|---|---|---|---|
| 60 | 10 | 720 | 1 | 5 + 0.6 = 5.6 units | 5.6 units |
| 600 | 100 | 7,200 | 8 | 40 + 6 = 46 units | 4.6 units |
| 6,000 | 1,000 | 72,000 | 72 | 360 + 60 = 420 units | 4.2 units |

These reproduce a supplied synthetic model, not a run in this continuation. Separate originals, unsupported editing/compositing paths, captions, local inference hardware, storage overhead, egress elsewhere, tax, exchange, rights, support and operations remain UNKNOWN. An all-in total is blocked rather than subtotal plus guessed zero. Stream's documented WebRTC-broadcast recording limitation is not a conference-recording solution.

## 15. Numbered concrete F6 failure vectors

All expected outcomes are future acceptance assertions, NOT RUN.

| ID / concrete failure | Expected outcome |
|---|---|
| F6-01 Camera permission denied | No start/success; show denied and independently permitted mic/file alternative |
| F6-02 Mic unplugged mid-segment | Mark affected track interval unknown/lost, pause by default, preserve acknowledged chunks; no fake continued audio |
| F6-03 Shared screen ended by OS | Stop that track immediately; no silent selection of another surface |
| F6-04 Requested tab/system audio but zero audio tracks | Explicit unavailable audio and opt-in permitted fallback; no recorded-audio claim |
| F6-05 Pause/retake crosses pending chunk boundary | Seal validated source interval; retake creates new segment/map, old source not overwritten |
| F6-06 Final chunk arrives late or Android screen lock delays callbacks | No callback-count clock or premature finalization; disclose uncertain interval |
| F6-07 Quota exhausted while bytes stage | Stop/pause; no local acknowledgment for failed chunk or hidden dropping |
| F6-08 Crash after bytes stage before journal acknowledgment | Recover acknowledged checkpoint only; candidate tail labeled unacknowledged |
| F6-09 Network fails after local acknowledgment | Local status remains distinct; resume only after live authority and server-offset reconciliation |
| F6-10 Server offset/digest differs from client | BLOCKED/RECONCILING; never concatenate corrupt or conflicting part bytes |
| F6-11 Finalize response lost and retried with same operation | Original permitted receipt; one source artifact/job; no duplicate chapter set |
| F6-12 Processing/caption generation fails | FAILED/repair state, no READY or PUBLISHED label |
| F6-13 MIME probe true but actual sample cannot play | Profile fails acceptance; supported conversion/fallback only after approval |
| F6-14 Cut removes source-50 quiz/note | Removed anchor repair state, never snapped/regraded |
| F6-15 Layout/slides/device changed mid-recording | New composition/segment version with explicit media interval; no false source continuity |
| F6-16 Board reconnect sends old revision | Shared revision conflict/rebase; no last-writer blind overwrite |
| F6-17 Closed ephemeral Board requested through studio URL | No retention/mode promotion without distinct purpose/rights/retention |
| F6-18 Export cannot represent note math/code | Explicit export warning/error and basic supported alternative; no silent data loss |
| F6-19 AI has missing/wrong transcript | Abstention or unverified draft; source review/mentor correction; no grade/publication |
| F6-20 Course refit has unknown old note anchor | Preserve private original ref and chosen-path repair; no automatic relocation |
| F6-21 Participant withdraws while ingest races | Local stop always; fenced server ordering permits only authorized pre-cutoff intervals under prior-content policy |
| F6-22 A logout/login B receives delayed upload/note response | Old generation discarded; A bytes/notes/URLs never enter B scope |
| F6-23 Generic socket join attempts Board access | Same live room/document grant denial; no transport bypass |
| F6-24 Nonenrolled user requests original/HLS/caption URL | Nonenumerating denial or approved mediation refusal; no original URL leak |
| F6-25 Background effect overloads device | Disable optional effect/degrade composition with explicit notice; controls/learning remain usable |
| F6-26 Source rights revoked with retained versions | Block affected new access/publication; reviewed retention/hold resolution, no instant-erasure promise |
| F6-27 Recording-use policy suspended then participant withdraws | Deny-only ownership-authenticated revocation still commits under approved minimal policy; no Mentor requirement |
| F6-28 Minimal revocation store/policy unavailable | Stop locally; no remote confirmation; new recording/renewal/ingest fail closed |
| F6-29 Mandatory guardian/session eligibility unknown | Affected session blocked; local stop usable; no claim that every nonrecording call remains eligible |
| F6-30 Same part ID uploaded with changed bytes | Conflict/quarantine, prior verified bytes unchanged |
| F6-31 Old-edit job completes after retake | Output retained only for its version; cannot replace current candidate |
| F6-32 Source 60/100 seconds at half-open boundary | 60 -> 40 exact; 100 outside, never output-end placement |
| F6-33 Source has unmeasured missing audio interval | Unknown gap shown; no invented exact Board/caption synchronization |
| F6-34 Source replacement retains prior unrelated audio | Version/reference validation blocks candidate until corrected |
| F6-35 Provider inbox saved then processing handler crashes | Recover lease/effect handling; inbox is not READY/business completion |
| F6-36 Motion/GPU lost during save/publication | Same static receipt/status/stop/review controls; no stale success callback |

## 16. Numbered future tasks and acceptance

No runner command is guessed. Every task begins with named failing assertions, verifies failure using the later manifest-verified targeted runner, implements the listed interface, reruns for the exact expected outcomes, and receives review. Those future commands and expected assertions are NOT RUN; no commit step is required or authorized now.

- [ ] **Task 1 - Policy/schema foundation.** NEW studioSchemas/studioCommands and `D:/orbit-main/orbit-main/BackEnd/tests/fp2StudioPolicy.test.js`. Consume 03 coordinator/policy APIs; produce `planStudioCommand`. Assert `clientAuthorityRejected`, `unknownRetentionBlocksPersistence`, `unsupportedProfileBlocksStart` and F6-27/28/29. Deliverable: registered blocked/preflight contracts with no provider effect.
- [ ] **Task 2 - Scoped local journal.** NEW localJournal and `D:/orbit-main/orbit-main/FrontEnd/src/studio/__tests__/localJournal.test.js`. Produce LocalJournal methods; assert F6-07/08/22 and `unacknowledgedTailNotSaved`. Real selected-store reload/eviction/key tests remain separate release evidence; mocks do not prove durability.
- [ ] **Task 3 - Capture/clock controls.** NEW captureAdapter, EXISTING Recorder.jsx and `D:/orbit-main/orbit-main/FrontEnd/src/studio/__tests__/captureAdapter.test.js`. Produce CaptureAdapter; assert F6-01 through 06/13/15/25/33 and `stopLocalDoesNotAwaitNetwork`. Deliverable: honest track/clock/pause state, not a browser-support claim.
- [ ] **Task 4 - Resumable transport.** NEW uploadController/mediaAdapter and `D:/orbit-main/orbit-main/BackEnd/tests/fp2StudioUpload.integration.test.js`. Produce MediaAdapter query/verify/source validation; assert F6-09/10/11/30/35 and atomic manifest/receipt/outbox failures. Deliverable: stable part/finalize identity and unknown-result reconciliation under verified topology.
- [ ] **Task 5 - Consent and live ingress fences.** Extend shared consent/authority handlers from 03; test `D:/orbit-main/orbit-main/BackEnd/tests/fp2StudioConsent.integration.test.js`. Consume canonical deny-only withdrawal; assert F6-21/23/27/28/29 with actual transaction races and external-ingress revocation evidence. Deliverable: no stale permit append/renewal and accurate local-versus-remote copy.
- [ ] **Task 6 - Source/map/processing.** NEW processing portions of mediaAdapter, SHARED timeMap and `D:/orbit-main/orbit-main/BackEnd/tests/fp2StudioProcessing.integration.test.js`. Assert F6-12/14/31/32/33/34, exact 70 -> 50 and source-50 removed. Deliverable: one version-bound job and validated output, no guessed clock.
- [ ] **Task 7 - Board/caption/review integration.** Consume companion shared Board and note adapters; extend Recorder/MediaLibrary; test `D:/orbit-main/orbit-main/FrontEnd/src/studio/__tests__/studioReview.test.js`. Assert F6-16/17/18/19/20, separate checkpoint kinds and no local quiz truth. Deliverable: private review tray with exact source refs.
- [ ] **Task 8 - Publication and media access.** NEW studioPublication/mediaAccess and `D:/orbit-main/orbit-main/BackEnd/tests/fp2StudioPublication.integration.test.js`. Produce publication/access signatures; assert F6-24/26/31/34, role loss and atomic chapter-publication failure. Deliverable: candidate/reviewer/entitlement chain, no public original leakage.
- [ ] **Task 9 - UX and release evidence.** Extend existing shell/tokens only; `D:/orbit-main/orbit-main/FrontEnd/src/studio/__tests__/studioUx.test.js`. Assert F6-36 and companion keyboard/static/sound-off/error copy. Later authorized real-device probes cover every enabled matrix cell, lock/background/quota/crash/media-access and performance case; release blocks on unsupported/unapproved required branches.

## 17. Minimum, V1, V2 and open decisions

Minimum: one owner-private capture/file-ingest path only after privacy/durability/rights/authority gates; bounded segments, explicit local/server states, cut-only map and manual review. No publication or shared-call recording shortcut when foundation is absent.
V1 candidate: approved device profiles, resumable verified upload, version-bound processing/captions, shared serialized Board, private notes and canonical reviewed publication. Each branch activates independently after its required gates; optional call recording remains off otherwise.
V2 candidate: proven timed Board replay, richer edit/rate/occurrence maps, collaborative authoring and broader tested device support. No extra membership, public minor rank, AI publication, paid perk or retention expansion is implicitly selected.

Blocking decisions: DEC-E-C01/C02 transaction/fence/digest/keys; C03 guardian/session/consent; C07 source rights/markers; C08 Board purpose/schema/TTL; C10 exact media APIs/codecs/licenses/currency; C12 privacy/retention/holds/operator capacity. F6-specific choices are local store/key/disclosure and acknowledgment evidence, supported probe profiles, processing/caption profiles, safe gap handling, derivative mediation/revocation latency and all-in operating budget. All OPEN.

This document returns proposed content only. No implementation, command execution, camera/provider/model call, package installation, asset creation, test, build, migration, commit, publication or diagram rendering occurred. MAIN must validate file/line/link/character bounds and preserve existing authoritative drafts before registration.
