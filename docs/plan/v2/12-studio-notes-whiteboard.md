# Studio Notes and Shared Whiteboard Implementation Plan

Date: 2026-11-08. Phase: E continuation, F6. Status: PROPOSED, NOT IMPLEMENTED, NOT PLAN LOCKED.

> For agentic workers: Returned planning material only. MAIN owns writes/registration. Future implementation requires explicit approval; all tasks/assertions are unchecked and NOT RUN.

**Goal:** Give studio, Mentor calls and Peer calls one Board authority, and give learners private timestamp-linked notes, mistakes and voluntary review independent of AI or tokens.
**Architecture:** Preserve the existing Board core provisionally behind one document/grant/revision adapter. New private notes use an application-owned schema/version adapter; editor/rendering/model libraries are replaceable presentation or drafting tools, never authority or storage contracts.
**Tech Stack:** Existing JS/JSX Board and authoring/learning surfaces. No notes editor, CRDT, hosted service or Ollama integration is selected or run. TypeScript-style signatures are proposed interfaces only.
**Spec:** `D:/orbit-main/orbit-main/docs/plan/v2/03-platform-contracts.md`; capture and UX companions.

## 1. Evidence boundary and received scope

Six written inputs were used: canonical 03, existing-system audit, media/whiteboard research, notes/calls research, studio/motion reasoning and Feature Cards 03, all under `D:/orbit-main/orbit-main/docs/plan/v2/`. No app-source or web reread supports this document.

Audit B03 describes existing framework-independent layered Board drawing, pages, shapes, text/stickies/images, basic math/code rasterization, undo/export, DataChannel/socket sync and REST snapshots. Eleven whiteboard findings received independent static checks; runtime behavior remains UNVERIFIED. Intentional call-end/TTL deletion is not reclassified as a bug.

Audit B11 found no established personal-private-note/timed-checkpoint contract in inspected paths. Existing resources, Q&A, quizzes and draft schemas are reuse opportunities, not proof a private notebook exists. Dormant Ollama/unmounted quiz code and the mounted deterministic proposal do not establish grounded retrieval, verified grading or usable AI publication.

Non-goals: three Board engines, permanent call recording, automatic student monitoring, mentor access to learner notebooks, public misconception profiles, automatic mastery, bought export/access, CRDT adoption by default or hidden expansion into X-090 release membership. The missing detailed E/F tail remains missing; received F1-F9 scope only.

## 2. Global constraints and review focus

- Consume canonical 03 ActorContext, PolicyGate, CommandEnvelope, Receipt, Problem, BoardMode/Grant/Permission, TimeAnchor and exact EditTimeMap; do not redefine their semantics.
- Public routes use `/api/v2/fp2`, durable events `fp2.v1.` and exact envelope fields `operationId`, `expectedVersion`, `policyVersion`.
- Live resource ACL, sessionGeneration/authzEpoch, membership/consent versions and document revision fence every ingress/read/export/cleanup operation. Server context alone is not a live authorization result.
- Owner-private notes/mistakes/review choices are independent resources. Mentor course ownership, course enrollment analytics or assigned content review do not authorize their contents.
- Capture/notes/Board/model events do not award grades, currencies, badges, attendance or rank. F4 authoritative normalization/comparability and shared semantic source consumption remain the only applicable learning-benefit path.
- No currency conversion/cash-out/bought learning/security/basic export; fixed session 15% and separate subscription 20%/80% are untouched.
- Unknown mandatory guardian/session safety blocks the affected session. Local stop/withdrawal never waits on that decision; deny-only withdrawal remains available under 03's independent minimal policy.

Review focus: revoked source versus retained private note text (Task 5/NB-12); end-of-call versus concurrent patch (Task 2/NB-03); stale reviewer/model source version (Task 7/NB-17); sanitized export losing math/code (Task 6/NB-14); keyboard shortcuts inside note/prompter text (Task 8/NB-22).

## 3. Board alternatives and evidence comparison

Research sources below are access-date observations from 2026-11-06, not current package pinning or procurement approval.

| Option | Documented/audited role | License/commercial boundary | Collaboration, persistence and replay limit |
|---|---|---|---|
| Existing Board | Audit B03: strokes/shapes/text/stickies/images, pages, math/code rasterization, canvas export, hybrid sync/snapshots | Repository/dependency/asset notices need later review; no new external contract selected | Useful core; source-checked lifecycle/isolation/snapshot/conflict gaps; no proven convergence, accessibility or timed replay |
| Excalidraw | MW-S09 README separates editor from hosted app; scene JSON/PNG/SVG and drawing editor | MW-S16 full MIT text read by prior research; retain notices, pin release/dependencies/assets later | Hosted collaboration/local-first/encryption features are not a bundled authorized durable backend; no app migration/replay proof |
| tldraw | MW-S11 sync/custom schema/migration/persistence architecture | MW-S02 guidance: production license required; development/trial/hobby conditions; full linked legal page unavailable; numeric commercial price unknown | Vendor documents one authoritative room per document and persistence needs; demo public/day-scale retention is not app authority; no performance/replay proof |
| Fabric.js | C06-S005 object transforms/groups/brushes/filters and JSON/SVG/image I/O excerpt | C06-S001 full MIT text read; dependency/package notices unverified | Rendering/editor foundation, not hosted auth/collaboration/history; audio-seekable replay is app work |
| Konva | C06-S006 2D scene graph/events/drag/transforms/cache/export excerpt | C06-S002 full MIT text read despite classifier NOASSERTION; commercial Polotno separate | Renderer foundation, not complete editor services, ACL/persistence or measured large-board replay |
| Yjs / Automerge | C06-S007/008 describe collaborative shared data/sync/local-first roles | C06-S003/004 full MIT texts read; release/transitive review still needed | Neither supplies Board schema, grants, durable room service, migration, media-clock alignment or convergence evidence for this app |

Approaches: keep current core and repair authority/snapshot adapter; migrate to Excalidraw; adopt tldraw suite. Recommend the first for a bounded serialized V1 slice because it preserves audited reusable behavior and avoids simultaneous license/schema migration. Excalidraw remains a fallback evaluation if a concrete core gap fails acceptance. tldraw requires operative terms and paid/production approval before consideration. Fabric/Konva/CRDTs are foundations, not interchangeable drop-in Boards. No option is user-selected or installed.

## 4. One authority, three purpose modes

| Mode | Surface / additional authority | Lifetime and export |
|---|---|---|
| EPHEMERAL_CALL | Peer authorized connection or Mentor independently usable booked session; live room membership | Intentional call-end/expiry policy, approved TTL/cleanup; no durable promotion or export by default |
| PERSISTENT_STUDIO | Owner's authorized studio artifact/document purpose and retention | Persistent only under its approved policy; separate recording consent for captured participants/content |
| COURSE_PUBLISHED | Canonical reviewed course artifact plus learner entitlement/public projection rules | Immutable published version/read grants; rights/retirement/retention separate from private studio source |

A mode is not a UI toggle that changes retention. To reuse permitted content across purposes, create a reviewed descendant under a distinct approved purpose/rights/retention command and preserve root/equivalence/source lineage. A copied ID or mode change cannot reset benefit family/source cycle or grant access to private student work.

Room joins, signaling, Board patches, asset loads, snapshots, exports, cleanup and recording ingest use the same live grant/fence authority. Generic socket/video handlers, URL room IDs and client-created call histories cannot bypass it. EPHEMERAL_CALL expiry metadata/receipt retention is separately policy-bound; never retain raw call Boards indefinitely for debugging.

Consent to call participation is not recording consent or publication permission. Mutual scoped choices include required participants, sources, visibility, retention and policy. `consent.recording.withdraw` is reused unchanged: consent ownership, deny-only minimal security/retention revocation, no Mentor role/all-party re-consent or recording-use-policy dependency. If durable minimal authority fails, local capture stops and remote confirmation is unavailable; new server capture/renewal/ingest remains fail-closed. Independently eligible nonrecording calls may continue, but unresolved mandatory guardian/session eligibility still blocks the affected session.

## 5. Typed policy blocks

```ts
type BoardPurposePolicy = Readonly<{
  mode: BoardMode; purposeId: Id; retentionPolicyId: Id; grantTtlProfileId: Id;
  patchSchemaIds: readonly Id[]; assetRuleId: Id; exportRuleId: Id; cleanupRuleId: Id;
}>;
type NotePrivacyPolicy = Readonly<{
  ownerOnly: true; localPersistencePolicyId: Id; retentionPolicyId: Id;
  keyLifecyclePolicyId: Id; exportRuleId: Id; diagnosticRedactionPolicyId: Id;
}>;
type NotesLimitPolicy = Readonly<{
  maxDocumentBytes: IntUnits; maxBlockCount: number; maxCodeBytes: IntUnits;
  maxMathBytes: IntUnits; allowedLanguageIds: readonly Id[]; schemaMigrationProfileId: Id;
}>;
type DraftAssistancePolicy = Readonly<{
  adapterProfileId: Id; sourcePurposeId: Id; permittedSourceKinds: readonly ResourceKind[];
  contextLimitProfileId: Id; outputSchemaId: Id; retentionPolicyId: Id;
  reviewerRuleId: Id; hardwareBudgetPolicyId: Id;
}>;
type NotesBoardPolicySet = Readonly<{
  board: PolicyGate<BoardPurposePolicy>; notesPrivacy: PolicyGate<NotePrivacyPolicy>;
  notesLimits: PolicyGate<NotesLimitPolicy>; assistance: PolicyGate<DraftAssistancePolicy>;
}>;
```

All values OPEN. Unknown Board retention/purpose/TTL blocks new grant/persistence/export for that branch; it does not secretly fall back to indefinite retention. Unknown notes privacy/key policy blocks new offline/private persistence; a labeled nonpersistent input must not claim saved notes. Unknown assistance policy blocks AI calls, not manual note/quiz authoring. Basic approved export is never a token perk.

## 6. Board schema, revisions and indexes

Reuse canonical BoardGrant/BoardCommandPayload/BoardApplyResult. `expectedVersion` is the current Board document revision; grant `documentVersion` records issuance context, not an everlasting edit lock. All three surfaces consume the same adapter.

```ts
type BoardEntity = Readonly<{
  entityId: Id; entityVersion: Version; pageId: Id;
  kind: "stroke" | "shape" | "text" | "sticky" | "image" | "math" | "code";
  geometrySchemaId: Id; geometry: JsonValue; contentRef: Id | null; assetRef: ResourceRef | null;
}>;
type BoardPage = Readonly<{ pageId: Id; ordinal: number; title: string; entityIds: readonly Id[] }>;
type BoardSnapshot = Readonly<{
  document: ResourceRef; revision: Version; schemaId: Id; mode: BoardMode; purposeId: Id;
  pages: readonly BoardPage[]; entities: readonly BoardEntity[]; authorizedAssetRefs: readonly ResourceRef[];
}>;
type BoardPatch =
  | Readonly<{ type: "entity.insert"; entity: BoardEntity }>
  | Readonly<{ type: "entity.update"; entityId: Id; expectedEntityVersion: Version; changes: JsonValue }>
  | Readonly<{ type: "entity.delete"; entityId: Id; expectedEntityVersion: Version }>
  | Readonly<{ type: "page.insert"; page: BoardPage }>
  | Readonly<{ type: "page.reorder"; pageIds: readonly Id[] }>;
type BoardOperation = Readonly<{
  documentId: Id; entityOperationKey: Id; patchDigest: string; previousRevision: Version; revision: Version;
  sourceAnchorRef: Id | null; receiptId: Id; schemaId: Id;
}>;
type BoardReplayManifest = Readonly<{
  documentId: Id; sourceAsset: ResourceRef; sourceVersion: Version; schemaId: Id;
  snapshotBoundaryRefs: readonly Id[]; timedOperationRefs: readonly Id[];
  state: "unverified" | "complete" | "incomplete"; missingIntervalRefs: readonly Id[];
}>;
```

The `changes` field is a schema-registered bounded allowlist per entity kind, never arbitrary property assignment. Reject identity/owner/grant/approval/media-URL authority fields. Math/code remain authored text plus a versioned render profile; rendering does not execute user code. Rasterized views alone are not an accessible or semantic source record.

| Record | Required uniqueness/index | Authority/retention |
|---|---|---|
| BoardDocument | Document ID; owner/mode/state | Canonical Board ACL/version/purpose |
| Board snapshot | `(documentId,revision)` | Authorized full pages/entities/assets; approved lifetime |
| BoardOperation | `(documentId,entityOperationKey)`; `(documentId,revision)` | Semantic retry dedup independent of network operationId |
| BoardGrant | Grant ID; actor/document/expiry | Revocable registry ref with live epochs/membership/consent |
| Board asset ref | `(documentId,assetId,sourceVersion)` | Rights/purpose validated on append/read/export |
| Replay manifest | `(documentId,sourceVersion,replayVersion)` | V2 pilot only; incomplete clocks explicit |

Shared Operation/Receipt/Outbox/fence indexes remain mandatory. Cleanup is an authorized version/fence command, not an arbitrary `call-ended` delete. Snapshot indexes do not prove actual complete snapshots or storage durability; future tests must cover every entity/page kind.

## 7. Serialized V1 Board algorithm and lifecycle

1. Authorize document discovery before detailed patch/version errors; construct live server context and resolve approved purpose/schema/grant.
2. Reuse coordinator operation-intent idempotency. For the semantic entityOperationKey, same validated patch intent returns existing permitted result/no_change; changed patch for that key conflicts. No second insertion.
3. In the shared transaction, touch account/membership/consent/document fences; CAS expected document revision and any affected entity versions.
4. Validate bounds, page references, asset rights, math/code limits and patch kind; stage canonical document, complete snapshot/reference, semantic operation, receipt and outbox together.
5. Commit once or roll back all. Socket/DataChannel delivery is downstream and cannot authoritatively mutate another local store.
6. On reconnect, request an authorized current snapshot, compare last committed revision, recover in-flight receipts and explicitly rebase unsaved permitted operations. Never replay stale deleted entities silently.
7. Concurrent edit/delete loser receives authorized VERSION_CONFLICT, retains only permitted unsaved content and offers explicit merge/refresh. Undo is a new versioned inverse command, not erasure of another user's history.
8. On room close/TTL/revocation, stop sends/read subscriptions immediately on notice; ingress already denies stale grants even before eviction delivery. Resolve own permitted in-flight receipts, then dispose private cache.

| State / trigger | Result |
|---|---|
| UNJOINED -> valid grant | OPEN_READ or OPEN_EDIT according to actual permissions |
| OPEN_EDIT -> patch pending | SAVING; local preview labeled unsaved |
| SAVING -> receipt | SAVED_REVISION with committed revision |
| SAVING -> conflict | CONFLICT; authorized refresh/explicit rebase |
| Connection lost | RECONNECTING; no implied offline write authority |
| Grant expired/role or membership changed | ACCESS_CHANGED; new patch/read/export denied |
| EPHEMERAL_CALL closed/expired | CLOSED; approved cleanup; no studio conversion |
| Persistent publication proposed | Separate CANDIDATE; current private document unchanged |

## 8. Pixel capture versus timed replay

| Artifact | What it preserves | What it cannot prove |
|---|---|---|
| Pixel video | What the compositor actually rendered, if capture/codec integrity passes | Semantic objects, accessible text, hidden strokes, edit convergence or factual correctness |
| Board snapshot/scene JSON | Object/page state at a revision | Audio timing, intermediate stroke order, seekable replay or what viewers actually saw |
| Timed operation replay | Potential versioned object evolution with clock/snapshot boundaries | Correct sync without complete operations/media clock/grants/schema and validated deterministic playback |

Recommend supported pixel capture plus separately retained permitted Board snapshots for V1, without a storage/learning-gain claim. Timed replay is a bounded V2 pilot, not an automatic benefit of scene JSON/Yjs/tldraw. Replay must pin source segment/version, operation sequence, snapshot boundaries, pause/gap clocks, render schema and asset rights. Incomplete intervals return unknown; never interpolate invented strokes or caption/audio alignment. Pixel recording of participants or shared Board content still requires scoped recording and source/publication rights.

03's immutable map example governs all Board/audio/caption anchors: keep [0,40),[60,100) -> output [0,40),[40,80); source70 -> output50, source50/40 removed, source60 -> output40, source100 outside. Pending/wrong-version maps are unknown/blocked. Retakes preserve original source refs and create new mappings; note/quiz placement is not silently moved.

## 9. Notes editor comparison and bounded recommendation

Application requirements use `APP` below to mean custom schema/adapter/UX work, not a documented library feature. No package/version is pinned.

| Option | Documented structure/math/code | Timestamp/version/export/collaboration boundary | License/commercial evidence and remaining gap |
|---|---|---|---|
| Tiptap | NC-S01/15 core/extensions; catalog includes LaTeX Mathematics | Source anchors and approved note versions APP; collaboration/caret described, paid export/comments/snapshots/AI labels separate; actual math/code/mobile fidelity untested | Vendor calls core MIT/free; every extension's operative license and exact base/platform price unresolved |
| ProseMirror | C07-S001 schema/plugin architecture | Timestamp/math/code nodes, toolbar, version store and export APP; collaboration support described, no hosted/private service supplied | Homepage says legally free commercial use; exact license text/version/transitive terms not inspected |
| Lexical | NC-S02 framework-agnostic core/React/extensions; JSON/HTML/Markdown conversion and Yjs described | Timestamp/math/code integration/version/exports APP; mobile/IME/PDF behavior untested; local-model demo not grounding | C07-S002 full MIT text read; preserve notices; extension/dependency terms still need pinning |
| Slate | NC-S03 React/plugin/operations architecture and serialization examples | Timestamp/math/code/version/export APP; collaboration layered above core, beta/API-warning evidence is dated | Docs say MIT; full linked license/current release status unverified |
| BlockNote | NC-S04 core blocks/UI/comments/collaboration; XL exporters/AI/layouts separate | Timestamp/math/code correctness and private version/rights adapter APP; advanced export not automatically core | Vendor FAQ says core MPL-2.0; XL GPL-3.0 or commercial; full operative terms incomplete |

Prior research partially read BlockNote XL terms through early section 6.2: application/developer/deployment/active-license and termination conditions require full legal/order review. Displayed Business pricing was $195/month billed $2,340 yearly with $390/month reference; currency code/order entitlement unresolved. Tiptap placeholder prices remain unknown. These are access-date observations, not budgets or accepted terms.

Recommend a bounded Tiptap/ProseMirror-style schema pilot behind the OWN NoteAdapter, compared with Lexical if a concrete accessibility/export requirement fails. This recommends an architecture/evaluation, not a dependency purchase or claim that Tiptap's math/export bundle is free. Minimum core manual editing/export must not depend on commercial AI/collaboration/XL services. Do not simultaneously implement multiple competing editors.

## 10. Private note, mistake and review types

```ts
type NoteBlock =
  | Readonly<{ blockId: Id; kind: "paragraph" | "heading" | "list"; text: string }>
  | Readonly<{ blockId: Id; kind: "math"; latex: string; renderProfileId: Id }>
  | Readonly<{ blockId: Id; kind: "code"; languageId: Id; text: string }>
  | Readonly<{ blockId: Id; kind: "timestamp"; anchorId: Id; label: string }>
  | Readonly<{ blockId: Id; kind: "resource"; authorizedResourceRef: ResourceRef; label: string }>;
type NoteDocument = Readonly<{
  noteId: Id; ownerId: Id; version: Version; schemaId: Id; purposeId: Id;
  visibility: "PRIVATE"; title: string; currentContentVersionId: Id; state: "ACTIVE" | "ARCHIVED" | "DELETION_PENDING";
}>;
type NoteVersion = Readonly<{
  contentVersionId: Id; noteId: Id; parentContentVersionId: Id | null; version: Version;
  blocks: readonly NoteBlock[]; sourceAnchorRefs: readonly Id[]; committedAt: UtcInstant;
}>;
type MistakeEntry = Readonly<{
  entryId: Id; ownerId: Id; version: Version; noteId: Id; sourceAnchorRef: Id | null;
  assessmentEvidenceRef: ResourceRef | null; reflectionContentRef: Id;
  state: "OPEN" | "REVISITING" | "RESOLVED_BY_OWNER" | "ARCHIVED";
}>;
type ReviewChoice = Readonly<{
  choiceId: Id; ownerId: Id; noteId: Id; version: Version;
  mode: "OFF" | "SELF_SCHEDULED"; nextReviewAt: UtcInstant | null; timezoneId: Id | null;
  reminderPreferenceRef: Id | null;
}>;
type NoteAnchorView = Readonly<{ anchor: TimeAnchor; mapping: AnchorMapping; sourceAccess: "available" | "unavailable" }>;
type NoteExport = Readonly<{
  exportId: Id; noteId: Id; contentVersionId: Id; format: "markdown" | "json" | "html";
  state: "PENDING" | "READY" | "FAILED" | "EXPIRED"; safeWarningCodes: readonly string[];
}>;
```

Text is authored content, not authority. Sanitize HTML/links/filenames, bound LaTeX/code inputs and use a nonexecuting render path; do not strip valid learner reasoning merely to simplify rendering. Imported files are untrusted; import requires its own approved schema/security/migration task, not a V1 implicit feature.

| Record | Required uniqueness/index | Permission/lifetime |
|---|---|---|
| NoteDocument | Note ID; owner/state/updated lookup | Owner-private canonical note ACL |
| NoteVersion | `(noteId,version)`; content version ID | Immutable revisions under approved retention; no infinite-history assumption |
| Private anchor | Anchor ID; owner/source/version | Source authorization independently checked before mapping details |
| MistakeEntry | Entry ID; owner/note/state | Private reflection; no mentor aggregate of raw mistakes |
| ReviewChoice | `(ownerId,noteId)`; owner/due-time | Optional schedule only; no award/attendance semantics |
| NoteExport | Export ID; `(noteId,contentVersionId,format,exportIntentKey)` | Current owner/source rights and approved expiry; no reusable public URL |
| AssistanceDraft | Draft ID; stable authorized source/request identity | Separate private draft/retention; no note authority or grade source |

## 11. Notes algorithms, permissions and UX states

Save flow: authorize owner -> validate schema/limits/current note revision -> hash canonical intent -> coordinator dedup -> CAS note root -> append immutable NoteVersion and permitted anchor links -> atomically update current pointer, receipt/outbox -> return committed version. A local editor document is not a saved note until an approved local acknowledgment or server receipt exists.

Concurrent save conflict keeps the permitted unsaved local content, fetches current authorized note and offers explicit compare/rebase; never silently replaces newer reasoning. Deleted/retired schema versions require a reviewed migration with source/version lineage and export fidelity, not coercion through a new editor.

Source linking checks the learner's media/assessment access separately from note ownership. A source removed/revoked may leave owner-authored reflection available under approved note retention while embedded source bytes/quotes/URLs are withheld according to rights; do not leak removed content via export or promise perpetual old-course access. Return the shared nonenumerating resource error before inaccessible mapping details.

| Actor/action | Required checks | Explicit denial |
|---|---|---|
| Owner create/read/edit/archive/export note | Current account/session, `note.edit.own` or registered owner read/export capability, note policy | Other accounts, mentor course-owner access, arbitrary source bytes |
| Learner create mistake/reflection | Own note, permitted optional assessment ref | Trusted mastery/diagnosis from reflection or local quiz |
| Owner choose review time | Own note/schedule, explicit preference/timezone | Coercive streak, attendance/time reward, default spam |
| Mentor author studio note/resource | Own separate studio/course artifact rights | Treating learner's private note as course property |
| Assigned reviewer | Explicit candidate/source field-purpose grant | Browsing student notebooks/mistakes by course ownership |
| Support | Assigned case and minimal field-purpose grant | General notebook/recording search |
| Draft service | Narrow approved sources/purpose/workload | Pulling private student notes because a mentor owns the course |

States: EDITING_UNSAVED, SAVING, SAVED_VERSION, CONFLICT, SOURCE_UNAVAILABLE, POLICY_BLOCKED, ACCESS_CHANGED, EXPORT_PENDING/READY/FAILED. No AI outage blocks manual notes or learning. Mistake status RESOLVED_BY_OWNER is a self-report, not verified competence.

Voluntary spaced review minimum is owner-chosen dates, OFF by default, timezone explicit, snooze/disable/export available and missed date neutral. No formula or interval claims are finalized. V2 evidence-based scheduling is a separate policy/calibration decision; it cannot buy grades, infer attendance or pressure minors.

## 12. Ollama grounded assistance, not grading

Optional teacher drafting takes an authorized immutable lesson/transcript/Board source set. It does not mount dormant quiz routes or label their generic fallback as verified retrieval/grounding. No model/hardware/server is invoked here.

```ts
type GroundedDraftRequest = Readonly<{
  artifactRef: ResourceRef; sourceVersion: Version; editVersion: Version;
  transcriptVersionRef: Id; allowedAnchorIds: readonly Id[];
  task: "summary" | "note_outline" | "quiz_candidate"; outputSchemaId: Id;
}>;
type DraftCitation = Readonly<{ sourceRef: ResourceRef; sourceVersion: Version; anchorId: Id; quotedSpanRef: Id }>;
type GroundedDraft = Readonly<{
  draftId: Id; version: Version; state: "ABSTAINED" | "UNVERIFIED_DRAFT" | "REVIEW_PENDING" | "MENTOR_REVIEWED" | "REJECTED";
  sourceSnapshotRef: Id; citations: readonly DraftCitation[]; contentRef: Id | null;
  abstentionCode: string | null; reviewerRef: Id | null; limitations: readonly string[];
}>;
```

1. Authorize requesting actor/source purpose and narrow service source access; private student notes/mistakes are excluded from teacher requests.
2. Pin source/transcript/edit versions, permitted anchors and bounded context. Missing transcript, unvalidated media clock, revoked source or unusable citation range yields ABSTAINED, not generated filler.
3. Translate through a later approved Ollama OWN adapter with explicit model/profile/version/hardware budget. Source text is untrusted data; instructions inside it cannot alter permissions, tools or output contract.
4. Validate output schema/size and resolve every citation to the same permitted source snapshot. Citation presence is not factuality; unsupported/inconsistent claims are flagged or abstained, never stamped verified by the model.
5. Present source preview, draft label, limitations and manual correction/rejection. No deterministic fallback questions masquerade as grounded output.
6. Save explicit mentor review bound to draft/source versions. Publication still requires canonical appointed review/rights/assessment authoring checks; mentor approval is necessary where required but not an accuracy guarantee.
7. A quiz candidate becomes an assessment only through authoritative F4 answer-key/rubric/appointment/version validation. No local answer checker, model verdict or approval animation produces GradeEvidence, XP or wallet credit.

AI states are distinct from note/publication states. Stale sources require regeneration/review, not quiet revalidation. Hardware, energy, context capacity, retention and operating cost remain UNKNOWN, not free because inference may be local. Offline model execution does not by itself satisfy consent, privacy, grounding or device performance.

## 13. Proposed APIs, payloads and event schemas

All commands use the shared endpoint/coordinator/envelope. `resource` is canonical board/note/artifact root; explicit parent ref in create payload is separately authorized. No request accepts ownerId/role/verified/approved/server timestamps as trusted authority.

| Registered command | Allowlisted payload | Result / authority |
|---|---|---|
| `board.grant.request` | Canonical BoardGrantRequest | Actual permission subset/current grant, never requested role |
| `board.patch.apply` | Canonical BoardCommandPayload with registered BoardPatch | BoardApplyResult; serialized document revision |
| `board.export.request` | `{grantId, revision, format, exportIntentKey}` | Export job/reference; mode/purpose/asset rights checked |
| `board.purpose.copy.request` | `{grantId, revision, targetPurposeId, targetMode, targetParentRef}` | Reviewed descendant candidate, not automatic promotion |
| `board.cleanup.apply` | `{roomRef, cleanupReasonCode}`; registered narrow service | Approved closed/expiry cleanup with live parent/document fence |
| `note.create.own` | `{title, schemaId, purposeId, initialBlocks}` | NoteDocument/NoteVersion; owner from server |
| `note.version.save` | `{schemaId, parentContentVersionId, blocks, sourceAnchorRefs}` | New committed content/root version |
| `note.archive.own` | `{disposition:"archive"}` | Archived note version; not content-erasure confirmation |
| `note.export.request` | `{contentVersionId, format, exportIntentKey}` | NoteExport; currently authorized source inclusion only |
| `note.mistake.save` | `{entryId, noteId, expectedEntryVersion, sourceAnchorRef, assessmentEvidenceRef, reflectionContentRef, state}` | Private versioned entry, no mastery |
| `note.review.choose` | `{mode, nextReviewAt, timezoneId, reminderPreferenceRef}` | Owner ReviewChoice; OFF clears scheduling intent |
| `studio.assistance.request` | GroundedDraftRequest; root artifact | ABSTAINED or draft/job reference; policy/service gates |
| `studio.assistance.review` | `{draftId, draftVersion, sourceSnapshotRef, disposition, editedContentRef}` | MENTOR_REVIEWED/REJECTED draft; no publication/grade |

`expectedEntryVersion` is an additional affected-child CAS, not a replacement for canonical root `expectedVersion`. Reusing a command/operation with changed payload is OPERATION_CONFLICT; retrying a semantic insertion under another operation cannot duplicate it.

Proposed authorized reads: `GET /api/v2/fp2/boards/{id}/snapshot?revision={v}`, `GET /api/v2/fp2/notes/{id}?version={v}`, `GET /api/v2/fp2/notes/{id}/exports/{exportId}`, `GET /api/v2/fp2/artifacts/{id}/drafts/{draftId}`. Reuse canonical operation/projection/anchor GETs. Lists are owner/member-scoped and bounded; GET does not create schedules, extend TTL, mutate review or roll cycles.

Errors remain 03 ProblemCode/status mapping. Unauthorized/missing/revoked board/note/draft is uniform 404 RESOURCE_NOT_AVAILABLE, `This item is unavailable.`; no owner/title/count/current version hints. Grant/purpose/retention/safety blocks use 422 POLICY_BLOCKED/CONSENT_REQUIRED/GRANT_EXPIRED after discovery authority. Conflict is authorized 409 VERSION_CONFLICT/OPERATION_CONFLICT. Unavailable live fences/store use 503 TEMPORARILY_UNAVAILABLE. Detailed schema errors follow resource authorization.

| Durable event | Bounded payload |
|---|---|
| Shared `fp2.v1.board.revision.committed` | Registered board ref/revision/operation ref; no private text |
| Shared `fp2.v1.room.grant.revoked` / consent/map/publication events | Reuse exact 03 event contracts |
| `fp2.v1.note.version.committed` | `{noteId, contentVersionId, noteVersion}` |
| `fp2.v1.note.mistake.changed` | `{noteId, entryId, entryVersion, state}`; private scope only |
| `fp2.v1.note.review.changed` | `{noteId, choiceId, choiceVersion, mode}` |
| `fp2.v1.note.export.changed` | `{noteId, exportId, state, safeWarningCodes}` |
| `fp2.v1.studio.assistance.changed` | `{artifactId, draftId, draftVersion, state, safeAbstentionCode}` |

Register schemas before use. Canonical event envelope/aggregate sequence/checkpoints and account-generation cache rules apply. Broad analytics never include note/reflection/transcript text, private source URLs, learner citations or inferred diagnosis. Due-review delivery uses existing notification/outbox/preferences only after approved attention/retention policy; queued notification is not attendance or learning evidence.

## 14. OWN adapter signatures and future file map

```ts
interface SharedBoardAdapter {
  open(actorScope: AccountScope, grant: BoardGrant): Promise<BoardSnapshot>;
  apply(envelope: CommandEnvelope<BoardCommandPayload>): Promise<CommandResult<BoardApplyResult>>;
  reconcile(actorScope: AccountScope, document: ResourceRef, knownRevision: Version): Promise<BoardSnapshot>;
  dispose(document: ResourceRef): void;
}
interface NoteAdapter {
  decode(schemaId: Id, input: JsonValue): readonly NoteBlock[];
  encode(schemaId: Id, blocks: readonly NoteBlock[]): JsonValue;
  renderAccessible(blocks: readonly NoteBlock[]): Readonly<{ text: string; semanticDocument: JsonValue }>;
  exportVersion(version: NoteVersion, format: NoteExport["format"]): Promise<Readonly<{ bytes: Uint8Array; warningCodes: readonly string[] }>>;
}
interface OllamaDraftAdapter {
  generate(request: GroundedDraftRequest, authorizedSourceSnapshot: JsonValue): Promise<Readonly<{ state: "abstained" | "unverified_draft"; output: JsonValue | null; reasonCode: string | null }>>;
}
function planNoteCommand(actor: ActorContext, tx: Tx, name: CommandName, envelope: CommandEnvelope<JsonValue>): Promise<AtomicPlan<JsonValue>>;
function getPrivateNote(actor: ActorContext, note: ResourceRef, version?: Version): Promise<NoteVersion>;
function planBoardPurposeCopy(actor: ActorContext, tx: Tx, envelope: CommandEnvelope<JsonValue>): Promise<AtomicPlan<JsonValue>>;
function validateDraftSources(actor: ActorContext, request: GroundedDraftRequest): Promise<Readonly<{ state: "available" | "abstain"; sourceSnapshotRef: Id | null; reasonCode: string | null }>>;
function reviewAssistanceDraft(actor: ActorContext, tx: Tx, envelope: CommandEnvelope<JsonValue>): Promise<AtomicPlan<JsonValue>>;
```

No signature claims a vendor method. Frontend receives transport/view types only. NoteAdapter serialization/export has no authority to fetch arbitrary sources; getPrivateNote and media authorization supply an already permitted snapshot. Model calls run outside Tx through recoverable job identity; draft status/domain/receipt/outbox commits use the shared coordinator.

| Absolute path | Status / responsibility |
|---|---|
| `D:/orbit-main/orbit-main/FrontEnd/src/whiteboard/board.js` | EXISTING; retain useful core; semantic/accessibility additions require tests |
| `D:/orbit-main/orbit-main/FrontEnd/src/whiteboard/sync.js` | EXISTING; replace bypass assumptions with one grant/revision adapter |
| `D:/orbit-main/orbit-main/FrontEnd/src/whiteboard/Whiteboard.jsx` | EXISTING; shared surface controls/focus/status |
| `D:/orbit-main/orbit-main/FrontEnd/src/pages/VideoCall.jsx` | EXISTING; consume shared Board/room authority, not default lobby entitlement |
| `D:/orbit-main/orbit-main/FrontEnd/src/pages/OrbitSessionRoom.jsx` | EXISTING; verify audited transport/parameter integration before reuse |
| `D:/orbit-main/orbit-main/BackEnd/models/whiteboard.js` | EXISTING; preserve intentional ephemeral semantics; separate approved modes |
| `D:/orbit-main/orbit-main/FrontEnd/src/studio/sharedBoardAdapter.js` | NEW; SharedBoardAdapter for all three surfaces |
| `D:/orbit-main/orbit-main/FrontEnd/src/notes/noteAdapter.js` | NEW; application schema/editor/export translation |
| `D:/orbit-main/orbit-main/FrontEnd/src/notes/PrivateNotesPanel.jsx` | NEW; owner-private notes/mistake/review shell in existing learning surfaces |
| `D:/orbit-main/orbit-main/BackEnd/services/fp2/noteCommands.js` | NEW; planNoteCommand/getPrivateNote |
| `D:/orbit-main/orbit-main/BackEnd/services/fp2/noteExport.js` | NEW; rights-aware version-bound basic export |
| `D:/orbit-main/orbit-main/BackEnd/services/fp2/studioAssistance.js` | NEW; source validation/draft job/review, no grading |
| `D:/orbit-main/orbit-main/BackEnd/services/fp2/ollamaDraftAdapter.js` | NEW; optional approved Ollama protocol translation |
| `D:/orbit-main/orbit-main/shared/fp2/notesBoardSchemas.js` | NEW; registered note/patch/export/draft schemas |
| `D:/orbit-main/orbit-main/BackEnd/services/fp2/boardAuthority.js` | SHARED PROPOSED in 03; canonical grant/patch/purpose authority |
| `D:/orbit-main/orbit-main/shared/fp2/timeMap.js` | SHARED PROPOSED in 03; exact anchors, no access grant |

Do not mount dormant aiQuizRoutes or adopt incompatible Course.modules/model imports as a shortcut. Existing Recorder annotations must converge on this Board adapter, not remain a fourth mutation authority. Exact existing edit lines/package APIs are intentionally not invented from planning evidence.

## 15. Concrete future failure vectors

All expectations are specified, NOT RUN.

| ID / input or failure | Expected outcome |
|---|---|
| NB-01 Nonmember joins Board through generic socket room | Denied at shared ingress; no snapshot/entity/owner leakage |
| NB-02 Membership revoked after grant but before patch | Live fence orders mutation; no post-revocation commit |
| NB-03 Call close races patch/cleanup | Only properly ordered pre-close commit; approved cleanup cannot delete another room |
| NB-04 Two concurrent inserts at same root revision | One commit; loser explicit conflict/rebase; no convergence claim from sync mocks |
| NB-05 Same entityOperationKey retried with another operation | No duplicate entity; changed semantic payload conflicts |
| NB-06 Reconnect after missed delete/out-of-order revision | Authorized current snapshot; stale entity not resurrected |
| NB-07 Snapshot has second page/image/math/code | Complete registered state or failed validation, never blank-success snapshot |
| NB-08 Undo after another participant modifies entity | Version conflict/reviewed inverse; no blind erasure |
| NB-09 Ephemeral Board copied by URL/mode field | Denied without distinct target purpose/rights/retention |
| NB-10 Mentor owns course containing student's note anchor | 404 for private note/mistake/export; course ownership grants nothing |
| NB-11 A's note save arrives after B login | Old generation discarded; no A text/version enters B cache |
| NB-12 Course media revoked while private reflection retained | Note text only where policy permits; source bytes/URLs/mapping details withheld |
| NB-13 Cut removes source50 anchor, map pending for another | Removed and unknown separately shown; no automatic snap or regrade |
| NB-14 Export math/code cannot round-trip | Warn/fail exact version; supported text/source representation remains available |
| NB-15 Code block contains script or HTML link injection | Nonexecuting/sanitized render/export; learner text preserved safely |
| NB-16 AI transcript missing or source unauthorized | ABSTAINED/nonenumerating source error; no generic fallback labeled grounded |
| NB-17 Source changed after draft generation before review | Version conflict/stale-source review; no current publication approval |
| NB-18 Model emits fabricated citation/answer | Schema/source resolution rejects/flags; no GradeEvidence or automatic approval |
| NB-19 Service tries private learner notes for teacher draft | Access denied despite mentor course ownership |
| NB-20 Missed self-chosen review date | Neutral overdue choice, no points loss/streak/attendance inference |
| NB-21 Withdrawal with suspended recording-use policy | Deny-only command still works under minimal approved authority; local stop always |
| NB-22 Ctrl/keyboard shortcut typed in note/prompter input | Text editing unaffected; Board shortcut scoped and escapable |
| NB-23 Unknown guardian/session eligibility during call | Affected session blocked; stop usable; no generic nonrecording eligibility bypass |
| NB-24 Timed replay has missing media/operation interval | Incomplete/unknown interval, never invented smooth replay |
| NB-25 Export job queued then rights revoked | Recheck before delivery; no stale download grant |
| NB-26 Note save crashes after version insert before current pointer | All-or-nothing rollback/commit with receipt/outbox; no orphan-success version |
| NB-27 Tiny/private cohort refit preview | No private notebook text/rare learner identity inference; safe unavailable/approved aggregate only |
| NB-28 Library upgrade changes math/JSON semantics | Reviewed schema migration and fidelity tests; do not reinterpret immutable prior versions |

## 16. Numbered future tasks

For every task: first author the named failing assertions, then run the later manifest-verified targeted runner for expected failure, implement exact interfaces, rerun for stated acceptance and review the deliverable. All future commands/expected assertions are NOT RUN. No runner/package/version or mandatory commit is guessed.

- [ ] **Task 1 - Purpose/schema/ACL policy.** NEW notesBoardSchemas; SHARED boardAuthority; test `D:/orbit-main/orbit-main/BackEnd/tests/fp2BoardPolicy.test.js`. Produce approved purpose/schema checks; assert NB-01/09/10/19/23 and `unknownTtlBlocksGrant`. Deliverable: no generic-room/private-note bypass.
- [ ] **Task 2 - Board atomic revision path.** SHARED boardAuthority; NEW sharedBoardAdapter; test `D:/orbit-main/orbit-main/BackEnd/tests/fp2BoardRevision.integration.test.js`. Consume 03 applyBoardCommand; assert NB-02/03/04/05/08 with real CAS/fence/rollback tests. Deliverable: one shared revision/semantic-dedup authority.
- [ ] **Task 3 - Snapshot/reconnect integration.** EXISTING sync/Whiteboard/VideoCall/OrbitSessionRoom; test `D:/orbit-main/orbit-main/FrontEnd/src/whiteboard/__tests__/fp2Reconnect.test.js`. Produce SharedBoardAdapter open/reconcile/dispose; assert NB-06/07/11 and audited paid-room transport parameter alignment. Deliverable: all surfaces load the same authorized full snapshot.
- [ ] **Task 4 - Private note versioning.** NEW noteAdapter/noteCommands/PrivateNotesPanel; test `D:/orbit-main/orbit-main/BackEnd/tests/fp2PrivateNotes.integration.test.js`. Produce planNoteCommand/getPrivateNote and NoteAdapter encode/decode; assert NB-10/11/15/26/28. Deliverable: owner-private versioned notes with explicit conflicts and no client grading.
- [ ] **Task 5 - Source anchors and safe refit seam.** Consume SHARED timeMap/media access; test `D:/orbit-main/orbit-main/BackEnd/tests/fp2NoteAnchors.test.js`. Assert NB-12/13/27 and exact 70 -> 50, 60 -> 40, 100 outside. Deliverable: private source refs and repair states; X-090 remains unselected.
- [ ] **Task 6 - Basic export and voluntary review.** NEW noteExport; extend noteCommands/PrivateNotesPanel; test `D:/orbit-main/orbit-main/BackEnd/tests/fp2NoteExportReview.test.js`. Produce exportVersion and review-choice command; assert NB-14/15/20/25 plus `tokensNotRequiredForBasicExport`. Deliverable: exact-version safe Markdown/JSON/HTML export and OFF-by-default scheduling; PDF/commercial exporter not implied.
- [ ] **Task 7 - Optional bounded draft assistance.** NEW studioAssistance/ollamaDraftAdapter; test `D:/orbit-main/orbit-main/BackEnd/tests/fp2StudioAssistance.test.js`. Produce validateDraftSources/generate/reviewAssistanceDraft; assert NB-16/17/18/19 and `mentorReviewNotGradeOrPublication`. Deliverable: abstention/source labels/manual correction under policy; actual inference/device validation remains separate and blocked.
- [ ] **Task 8 - Accessibility/consent integration.** Extend existing controls only; test `D:/orbit-main/orbit-main/FrontEnd/src/notes/__tests__/notesBoardUx.test.js`. Assert NB-21/22/23, full keyboard/math/code text equivalents and static/sound-off states. Later real-device stylus/IME/mobile/shared-room tests are required, not replaced by DOM stubs.
- [ ] **Task 9 - Bounded replay evaluation, V2 only.** NEW future `D:/orbit-main/orbit-main/FrontEnd/src/studio/boardReplayAdapter.js` and `D:/orbit-main/orbit-main/FrontEnd/src/studio/__tests__/boardReplay.test.js`. Future signature `inspectReplay(manifest: BoardReplayManifest, map: EditTimeMap): Readonly<{state:"complete"|"unknown"; missingIntervalRefs:readonly Id[]}>`; assert NB-24 and deterministic permitted seek/reconnect/schema behavior. No replay membership or implementation approved now.

## 17. Minimum, V1, V2 and open decisions

Minimum: one authorized serialized Board document per purpose; approved complete snapshot/patch/read/cleanup; one private note schema with manual timestamp/math/code text, exact-version export and chosen review dates. Missing policy/storage authority blocks persistence; no mock-success release.
V1 candidate: all three surfaces share Board grant/revision adapter; owner-private versioned notes/mistakes; approved source anchors, basic exports and optional labeled teacher drafts after separate source/model/retention clearance. No collaborative student notebooks, public mistake analytics or automatic course refit.
V2 candidate: proven CRDT/operation migration, timed replay, richer refit maps, additional exports and collaborative authoring only after concrete scope/license/privacy/device decisions. None is implied by library support or Feature Card ranking.

OPEN decisions: DEC-E-C01 atomic topology/fences; C03 session/guardian/withdrawal; C07 rights/provenance/marker retention; C08 Board TTL/schema/cleanup/reconnect/latency; C10 editor/model/library releases/full licenses/commercial terms; C11 aggregate privacy; C12 notebook/control/export/draft retention, encryption, operator staffing and attention budgets. Specific release choices remain the Board-core acceptance fallback, notes editor pilot, semantic math/code rendering, export fidelity, timed replay scope and AI evidence/abstention policy.

No file writing, application execution, library installation, browser/AI/provider call, tests/builds, migration, diagram rendering, commit or publication occurred. This is an implementable proposal, not runtime readiness or recovery of unseen instructions.
