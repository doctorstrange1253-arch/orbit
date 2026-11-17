# D thinking - Studio durability, shared learning artifacts and motion

Date: 2026-11-07. Task: FP2-D. Status: PROPOSED trade-offs/acceptance, not chosen vendor or measured device support.
Audience: founder and engineers evaluating F6/F8 before master-plan drafting.
[Skill: brainstorming] [Skill: writing-plans]

Basis: [real recorder/Board audit](01-existing-system-audit.md), [media/whiteboard source evidence](research-media-whiteboard.md), [notes/calls/local draft evidence](research-notes-calls.md), [motion/rights evidence](research-art-motion.md). Existing recorder composition, mic/camera/screen, layouts, prompter, pause/cuts/chapter/upload are real audited building blocks. Durable recovery, learning checkpoints, usable grading and shared-room authority are not established end-to-end. No browser/server/device/recording run is performed in D.

## F6 build/integrate alternatives

Replace-all studio/editor/Board adds integration, license, migration and permission risk. Keep-everything hides verified lifecycle defects. Recommend preserving useful existing capture/Board/authoring surfaces behind one canonical version/access/time-map contract, repairing foundations in a later authorized implementation and piloting optional editor/canvas integrations against explicit acceptance. A third-party canvas/editor package does not supply this marketplace's membership, durability, publication, timed replay or safeguarding.

The shared Whiteboard is one document/operation authority used by studio, mentor calls and Peer calls. Surface-specific controls may differ; storage/grants/revisions cannot. Existing ephemeral Board TTL/close policy was intentional in the audit; extending persistence for authorized studio/course use requires a distinct purpose/document mode, not treating all ephemeral deletion as a bug or retaining every call indefinitely.

### Capability contract, not an invented browser support matrix

| Required capability | Proposed product behavior | Must verify before support label |
|---|---|---|
| Camera/mic | Explicit device consent, live preview/meters, unavailable/revoked/changed-device states | Actual browser/OS/device permissions, device loss, echo/mixing behavior |
| Screen/window/tab | User chooses permitted surface, clear active indicator, stop/revocation respected | Secure/gesture/browser constraints and correct offered surfaces; no silent switching |
| Tab/system audio | Separate capability and user confirmation; camera/mic recording still usable without it | Browser/OS/surface matrix; never promise system audio from a screen-source name |
| Pause/retakes | Record actual media-time intervals and source segments; preserve draft before overwrite | Chunk/track clock behavior, pause gap mapping, crash after retake |
| Layout/slides/prompter | Reuse existing composition, distinct saved layout/version, keyboard/static controls | Canvas dimensions/orientation, low-power CPU/GPU limits, accessible prompter |
| Background effects | Optional/degraded/no-effect mode; visible CPU trade-off, no learning/access dependency | Actual segmentation/device benchmarks/license, not assumed free hardware |
| Durable local bytes | Journal source chunks/sequence/hash/ack; prove durable write before “saved locally” | Storage quota/eviction/permission/private/shared-device modes and browser crash recovery |
| Resumable upload | Server session/offset/manifest integrity, retries from durable bytes | Provider/storage actual offset/checksum/finalization APIs and terms |
| Processing/HLS/captions/trim | Source asset validation, job/version/status, approved publish output | Codec/device/worker/quality/cost/access/caption correction pipeline |
| Shared Board/notes | Scope/grant/revision/time-map shared across three surfaces | Membership/reconnect/conflict/export/delete/TTL and editor migration behavior |

No per-browser YES values are invented. Full support matrix and package/API version pinning remain E/research/device work; any unavailable feature needs a working supported fallback, not a hidden disabled button or false recording success.

### Capture/recovery acknowledgment ladder

Proposed lifecycle: permission/device preview -> recording source segments -> local durable checkpoints -> upload session -> verified server bytes -> processing -> mentor review -> canonical publication. Failure states are visible and reversible where possible: permission denied/revoked, device changed, low storage, local save failed, disconnected upload, offset mismatch, validation failed, processing failed, draft conflict, unsupported playback, rights/caption review failure and revoked publication.

A MediaRecorder chunk callback/time slice is not the reliable media clock and not proof of durable disk storage. Keep chunk sequence, source segment ID, byte length/hash and real start/end time from the measured media timeline. Local journal must acknowledge a durable store; upload worker resumes only known durable chunks and compares authoritative server offsets. “Uploaded” means verified persisted bytes, not request initiation; “Ready” means processed validated playable asset; “Published” means canonical course authority and learner entitlement checks passed. Retry/finish/processing/publish operations are idempotent and versioned.

Proposed raw budget check: at 4 Mbps and 256 decimal MB free, simple capacity is 512 seconds; with a 30-second safety reserve, modeled usable estimate is 482 seconds. This arithmetic was executed, not a measured quota/durable guarantee. Container/encoder overhead, parallel chunks, journaling copies, memory pressure, browser eviction and changing quotas require margin and actual measurement. Stop/pause with visible unsaved-state warning before danger; never advertise crash-proof indefinite recording.

### Checkpoints, chapter markers and time mapping

Recording recovery checkpoint means acknowledged durable bytes/state. Chapter marker means navigation location. Learning checkpoint means a mentor-authored prompt/task grounded in an approved lesson timestamp/segment. These have separate IDs/states; a chapter split does not automatically create a usable quiz or award progress.

Use immutable source segment/anchor references and an explicit edit decision map. Executed example: keep source [0,40) and [60,100), yielding output [0,40) and [40,80). Source anchor 70 maps to output 50; source 50 is removed/unavailable; final duration is 80. Boundary intervals are half-open; source 100 is not inside either kept segment. Never attach a question/annotation to a guessed post-trim timestamp or silently move a removed anchor.

Notes, Board strokes, captions, annotations, mistakes and quiz prompts store original source/version plus derived output mapping. Retakes/trim/rate changes require mapping quality exact/approximate/removed/unknown; learners/mentor inspect unresolved anchors. Chapter names, notebook text and student reasoning remain intact under versioned access/retention policy; user content is not stripped. F9 X-090 safe refit depends on this contract.

### Pixel recording versus timed Board replay

Pixel capture preserves what the compositor rendered but costs bytes and cannot reconstruct object semantics or fix hidden source errors. Timed stroke/object replay can support semantic seek/collaboration but needs ordered operations, snapshot boundaries, clock mapping, deterministic schema and permissions; scene JSON alone is insufficient. Recommend pixels as a supported capture artifact first, with bounded timed replay pilot if useful—no claimed storage/learning gain until measured. Audio synchronization and source pause/edit mapping must remain explicit.

Compare existing Board reuse first; Excalidraw MIT editor evidence is available but hosted collaboration is not automatically bundled; tldraw production license/full price/legal terms remain unresolved; Fabric/Konva are render/object foundations, not full authorized collaborative services. Yjs/Automerge MIT evidence does not decide storage/schema/migration/room authority. No winner or production dependency is selected here.

### Notes/local-model trade-off

Tiptap/ProseMirror/Lexical/Slate/BlockNote must be evaluated for timestamps, math/code, versioning, export fidelity, collaboration, persistence and licenses/module boundaries. Source evidence establishes some core/commercial splits, not a tested app integration. Recommend a bounded timestamp-linked private note slice using a canonical document adapter before paid collaboration or a competing editor; package selection is unresolved.

Ollama draft generation is optional and labeled. It needs actual authorized transcript/lesson anchors, bounded context/version, abstention on missing evidence, structured validation, source preview and mentor approval before publication. Human approval is necessary but not proof of accuracy. Do not pretend existing stub/unmounted/mismatched router behavior is a functioning grounded quiz pipeline, call inference hardware free or turn a model fallback into approved answer truth. Students get private annotation/mistake/spaced-review choices independent of AI availability; no automatic mastery/public misconception profile.

### Published-meter cost scope

The research records Stream capacity increments of 5 published-dollar units/month per 1,000 minutes and delivery 1 per 1,000 delivered minutes. ISO billing currency/contract confirmation and all-in cost remain unresolved; no INR conversion or vendor selection. Pending upload reservations, prepaid capacity rounding, segment/preload delivery and actual storage retention differ from human watch time.

Executed synthetic monthly workloads: new minutes/viewer hours 60/10, 600/100, 6,000/1,000, each retaining twelve monthly cohorts. Retained minutes 720/7,200/72,000 require 1/8/72 prepaid capacity blocks. Published-meter monthly subtotals are 5.6/46/420 units; divided by each month's new production hours, 5.6/4.6/4.2 per new hour. This is an allocated storage/delivery subtotal, not all-in cost per recording hour, per viewer hour or bank-currency quote. Captioning, compositor/trim/transcode paths not included in Stream, local inference, separate originals, operations/support/rights and other overhead remain UNKNOWN in the workbook, never silently zero.

### F6 edge cases - analytical expectations

| Case | Required outcome/invariant |
|---|---|
| 1 Camera/mic permission denied | Visible unsupported/denied state and permitted alternative |
| 2 Device unplug/change | Preserve draft, explicit track/device state, no fake continued audio |
| 3 Screen/tab source revoked | Stop affected capture, visible consent/status, no silent new surface |
| 4 Tab/system audio unavailable | Honest fallback/mic mode, not promised audio from source label |
| 5 Pause/retake boundary | Real media-time map, durable previous segment before replacement |
| 6 Delayed chunk callback | Timestamp from media timeline, not assumed timeslice counter |
| 7 Low storage/quota/eviction | Safe pause/stop and unsaved warning, no guaranteed durable bytes |
| 8 Browser crash before durable ack | Only acknowledged journal recovered, unsaved interval disclosed |
| 9 Network loss after local save | Resume verified local bytes; local versus server status distinct |
| 10 Upload offset/hash mismatch | Reconcile/restart authorized upload, never concatenate corrupt bytes |
| 11 Finish/retry duplicates | One validated asset/job/version, recoverable outbox |
| 12 Processing/caption failure | Repair/retry status, no publishable-success claim |
| 13 Unsupported codec/playback | Supported alternative/re-encode decision, measured matrix |
| 14 Trim removes checkpoint | Unavailable/review mapping, no guessed question anchor |
| 15 Rate/slide/layout changes | Versioned composition/clock map, preserve source references |
| 16 Board reconnect/revision race | Canonical membership, sequence/snapshot reconciliation, conflict state |
| 17 Closed ephemeral Board versus studio artifact | Purpose-specific lifetime/grants, not indefinite call retention |
| 18 Notes export/math/code fidelity | Authoritative document schema/version and verified export, not editor homepage promise |
| 19 AI missing transcript/wrong answer | Abstain/draft label/source preview and mentor correction, no auto-publish |
| 20 Student annotations/version refit | Private preserved source anchors and chosen mapping, no silent regrade |
| 21 Recording consent withdrawal | Stop new recording, authorized prior-content handling, explicit indicator |
| 22 Account switch/private draft | Partition/clear local cache, no other user's notes/media leakage |
| 23 Shared Board studio/mentor/Peer rooms | One authority/document model; generic socket join cannot bypass grants |
| 24 Unauthorized media/caption URL | Canonical entitlement/signing/visibility, including processed outputs |
| 25 Low-power/background CPU overload | Degrade effect/layout, preserve usable recording/learning controls |
| 26 Rights/deletion/sensitive content | Purpose/hold/revocation policy and accessible unavailable state, not content stripping |

## F8: motion must carry meaning and remain interruptible

Keep existing CSS/Motion/Three/token infrastructure; competing animation engines/themes add cost without utility. A meaningful moment's contract is trigger, purpose, source state, destination state, duration/easing, asset/sound, cancellation/reduced-motion/static equivalent, budget and resume semantics. F8's full moment inventory and exact art/easing implementation remain E/device work.

Proposed ordinary reveal <=180 ms, compare transition <=400 ms, optional larger identity/course ceremony <=800 ms and always skippable; sound off by default, explicit separate choice for nonessential sound. No more than three flashes/second, preferably none. Reduced motion removes spatial/layout/camera movement but also requires explicit CSS/Three handling; setting one Motion flag does not suppress every animation. Static state must convey all meanings; no ceremony blocks login/consent/payment/refund/save/review/exit.

A 60 fps target gives about 16.67 ms/frame, not an observed device result. Degraded mode must stop nonessential continuous loops, reduce costly postprocessing/draw calls/effects and preserve complete 2D navigation/Board controls; do not infer 60 fps from desktop screenshots or installed libraries. GPU context loss, hidden tab, viewport/orientation, retarget/cancel, route change and motion-preference changes need real future tests and resource disposal checks.

| Meaningful moment class | Proposed purpose / trigger | Cancel/skip/static contract |
|---|---|---|
| Identity switch | Confirm selected authorized workspace, never grant role | Immediate authorized destination/label, no forced ceremony |
| Flare/claim acknowledgment | Distinguish delivered offer, exclusive claim and expired loser | No animated success before commit; deadline/cancellation visible |
| Quiz/review feedback | Explain rubric result/uncertainty and chosen next step | Static result, no shame/confetti required; reduced motion complete |
| League/badge/currency update | Explain verified source/cap/reversal, not financial truth | No purchased standing; skip without lost records or balance |
| Studio save/upload/process | Show actual acknowledgment ladder | No perpetual fake progress; canceled/failed/unknown state literal |
| Session payment/consent | Expose confirmed financial/recording state | Never distract from amount/consent/refund controls |
| Revision/assumption comparison | Make changed reasoning or missing bridge visible | Labels/patterns/static layers, private grants respected |
| Course travel/refit | Navigate/preview meaningful version choice | Retarget/cancel arrival safely; ordinary 2D path complete |
| Rest/exit/export | Preserve optional context and clean departure | No guilt/lock-in; finish/revoke/export works with animation disabled |

### F8 failure checks - analytical expectations

New preference while animating must cancel spatial motion; route interruption must not fire stale arrival; retarget must use live position; hidden-tab resume cannot jump financial/consent state; GPU loss falls back to ordinary navigation; low-power mode never loses task information; animation lifetime must dispose resources; sound choice never overrides muting/accessibility; static export contains semantic label; inaccessible/removed asset does not block controls; visible progress follows server acknowledgment; flashing/surprise ceremony never becomes an attention/reward tactic.

## Decisions and remaining uncertainty

Full device/browser support, chosen recorder/upload/editor/Board adapter/vendor, purpose/retention/recording policy, AI grounding quality/hardware costs, all-in media budget, original asset rights and exact motion/easing/performance acceptance need evidence/approval. D models only arithmetic/time-map behavior under stated assumptions. No library API, browser benchmark, legal allowance, vendor contract or production pipeline is invented or executed.
