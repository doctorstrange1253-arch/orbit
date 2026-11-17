# Identity Worlds: transition specification

**Phase:** C, IW-C. **Date:** 2026-11-10. **Status:** Design draft; new CP-C approval is required before implementation. Numeric timing, natural-completion entry policy, quote-pool rights and sound treatment are not approved.

## 1. Chosen direction and working proposal

Confirmed **Student = Multiverse, Mentor = Dimensions, Peer = Space**. The founder chose Artifacts + Projection and **default Cinematic with 5–6 verified thoughts plus excellent destination animation; Fast/normal is selectable**. Warm cache does not silently select Fast. See the [actual mode decision](../../../.agent/DECISIONS.md#c-transition-default-chosen---2026-11-10) and [world bible](02-world-bible.md).

One transition combines the selected world threshold and destination arrival, including the Mentor studio entrance; no second unavoidable ceremony stacks behind it. Independent Student apertures, connected Mentor planes and preserved Peer Space remain distinct, while thought text and every control stay flat and stable.

**Working lifecycle proposal:** natural Cinematic completion holds a static final reading/status surface and requires explicit Enter once ready. Fast or an explicit Skip requests automatic entry on readiness, subject to reading/visibility/context guards. This is the integrated candidate's proposed reconciliation, not a founder selection. Automatic entry after an unheld completed Cinematic remains an owner alternative to decide before final CP-C; this draft does not implement both policies simultaneously.

All new mechanisms, budgets and acceptance cases below are designer proposals. No application code/assets, quotation JSON, new permission, membership mutation, recorder capability or migration is created in C.

## 2. Current source, not desired behavior

| Inspected current behavior | Source | Required future change |
|---|---|---|
| 3000ms timeout; completion reads mutable global callback; cancel does not clear that timeout | [identityStore:17-48](../../../FrontEnd/src/soul/identityStore.js#L17-L48) | Attempt-scoped timers/results and explicit readiness, not a timer proving arrival |
| Shared thought, sound/haptic effect and pointer-events-none presentation; reduced branch hides thoughts | [TransitSequence:42-107](../../../FrontEnd/src/soul/TransitSequence.jsx#L42-L107) | One operable dialog, readable static equivalent, independent presentation/permission state |
| Legacy local quote array, one-second hide timer and 2500ms cycling | [WindowSwitchOverlay:10-53](../../../FrontEnd/src/components/fx/WindowSwitchOverlay.jsx#L10-L53) | No reused uncleared pool, competing renderer or unscoped delayed callback |
| Switcher starts old overlay and navigates immediately | [RoleSwitcher:161-175](../../../FrontEnd/src/components/layout/RoleSwitcher.jsx#L161-L175) | One entry intent through the guard/coordinator |
| /identity cancels transit on mount and has its own fallback navigation timer | [IdentitySelection:28-46](../../../FrontEnd/src/pages/IdentitySelection.jsx#L28-L46) | Browsing and actual entry have distinct intent; no timer/cancel bypass |
| Path watcher starts transit after identity changes | [App:296-306](../../../FrontEnd/src/App.jsx#L296-L306) | Observe/acknowledge committed navigation, not launch another ceremony |
| Visual Peer id differs from peer_learner role; existing route mapping supplied | [registry:24-92](../../../FrontEnd/src/soul/registry.js#L24-L92) | Explicit identity/role translation and supported route policy |
| Mentor application route is auth-only; workspace/recorder require Mentor role | [App:809-824](../../../FrontEnd/src/App.jsx#L809-L824) | No assumption that a visual Mentor target grants workspace access |

Main read the named current sources. Additional Navbar/auth/RoleGuard/recorder boundaries are in the [switcher specification](03-identity-switcher-spec.md). The [A2 visual evidence](01-ui-visual-evidence.md) retains slow preparation outlasting the old overlay and failure/empty conflation; this document is not proof of repair. The [B transition/accessibility annex](research-transitions-accessibility.md) supplies researched distinctions and limitations, not measured new behavior.

## 3. One coordinator, independent state tracks

Propose one app-root transition coordinator and one visible transition region. All workspace-entry triggers submit an intent; no component independently calls navigate after a decorative timer. Source preservation also covers destructive same-world and non-world exits as specified in 03, not just the identity selector.

Conceptual attempt context: attempt ID, context generation, current account/session and authorization revision, source route/identity/history key, canonical target route/parameters/query/hash, target access policy, navigation kind and safe return-focus reference. These are runtime design concepts, not approved serialized field names or existing APIs. Never put credentials in cache keys or logs.

```text
Preparation
idle -> guarding -> eligibility -> preparing -> ready -> committing -> entered
                 \ blocked/pending/denied       \ precommit failure

After commitment
committed activation failure -> target retry -> usable arrival
                            \ guarded Back / safe recovery

Presentation, independently
entrance -> forward reading -> terminal
                         \ held/manual reading
Fast/Skip -> presentation bypassed
```

Preparation state, quote cursor, monotonic exhaustion, entry-release intent and hold reasons are separate. A held reader can coexist with Ready, pending or an exhausted sequence. There is no single timer whose completion means all of these facts are true.

### Guard and eligibility

Run the source-work guard before covering or unmounting the source. Dirty edits, active quiz, capture/countdown/paused recording, active source tracks, processing, unsaved review parts and pending saves/uploads require supported preservation or a deliberate source-specific resolution. No automatic save/discard/submit/stop/publication. If safe preservation cannot be established, block the exit and keep the source controls visible. Recheck its revision before commitment.

Resolve access uncertainty before protected data preparation. Checking, application pending, denied and failed access checks remain different. Visual identity, Current marking and local role-array/storage fallback do not establish fresh authority. Follow actual target route policy; /mentor/apply is not a recorder shortcut. Reuse supported authorization sources, without claiming the current client guard or this design proves backend authority.

### Read-only preparation and readiness

Future route-specific preparation manifests must identify supported route code, the operable shell, critical reads and supported recovery surfaces. They reuse existing services but are not existing APIs asserted by this document. Do not mount destination effects, media/capture workflows or mutations to prefetch a page. Routine entry never requests camera/microphone/display capture, including after arrival without a separate explicit action.

Private results require correct account, session generation, authorization revision, role/policy, full canonical route and resource scope. A valid warm hit can satisfy a critical read without a blocking refetch; stale, incomplete or differently scoped results cannot. Shared immutable public assets need no private account key. Discard late/stale private preparation rather than inserting it into a newer context's cache.

**Ready requires** established target access plus usable supported shell/code and successful classification of every critical read as actual content or validated successful-empty. Missing results remain pending. Failed core/code reads become precommit failure with supported recovery, never Ready(empty). Noncritical fonts/decorative graphics may use readable system-font/static-art fallback without blocking successful core readiness.

Ready is not final arrival: commitment, mounted activation and a scoped usable-arrival acknowledgement still follow. No decorative screenshot, loaded scene texture or successful HTTP call alone proves that an operable destination has arrived.

## 4. Truthful controls and source restoration

After guarding succeeds, retain an authorized source mounted but inert behind one opaque, labelled, keyboard-operable transition dialog. Transfer focus from the chooser/guard to its heading once; initial heading focus alone does not pause reading. Do not screenshot private source content to create a scenic texture. Null-source/deep-link entry has no retained source to restore.

| Control/status | Proposed meaning |
|---|---|
| Preparing [named prerequisite] | Actual outstanding work; indeterminate status unless a meaningful measured total exists |
| Ready / Enter now | Essential success is known; Enter is immediately available even during entrance/reading |
| Thought i/n | Quote position only, never a loading percentage; absent when n=0 |
| Enter now | Explicitly release optional reading/presentation, then recheck eligibility/context/source guard and commit; no decorative wait |
| Skip presentation | Stop remaining optional cinema and request entry on actual readiness; not Cancel or fake preparation completion |
| Pause thoughts / Resume thoughts | Pause/resume unfinished automatic presentation; explicit resume clears its reading/visible-return hold, not access checks |
| Previous / Next | Nonwrapping manual reading, with automatic clocks paused; preserve focus and source details |
| Resume entry | Only for a held Fast/Skip entry request; continue waiting/enter when eligible and ready, without restarting thoughts |
| Cancel | Precommit only: invalidate attempt and restore source only when still safe/authorized in the current context |
| Retry | Phase-specific recovery; precommit retry and postcommit target retry are not the same navigation |
| Back / safe recovery | Committed/null-source recovery through a supported guarded history or eligible destination; not invented restoration |

Cancel/explicit chooser dismissal may use Escape before commitment when source restoration is safe. The transition is not outside-pointer-dismissable; do not accidentally cancel through the old underlying drawer listeners. On committed activation failure, Cancel is no longer offered. Postcommit Back is a new guarded history action, not a rollback promise.

**Restoration authorization:** when account/session/access context changes, invalidate readiness, pending entry release and old callbacks. Before exposing or focusing a retained source, verify it is authorized under the current account/session; otherwise hide/remove stale private UI and use auth-owned safe recovery. Destination rechecking is not source authorization. Never restore old-account private data or a detached/private source focus node merely because Cancel was pressed.

Forced logout, session loss, permission revocation, browser/OS termination and crashes qualify the preservation guarantee: an in-app guard is not crash-safe persistence, nor permission to expose revoked/private work. Separate recovery/privacy requirements remain; the visual refit adds neither background capture nor silent publication. Authorized ordinary cancellation restores the retained source's supported location/scroll/focus baseline; it cannot resurrect work deliberately discarded through a source-owned confirmation.

## 5. Commitment, retry and history

At commitment, recheck active attempt/context, visibility hold, target access, all critical outcomes and source-guard revision. Commit one valid navigation only. Update committed identity with the route, not while selecting or preparing. Arrival acknowledgement must match the attempt/context and usable target; then remove transitional ownership and focus the target heading. An optional arrival reveal runs around already usable content and never postpones Enter or control access.

| Outcome | Recovery/navigation rule |
|---|---|
| Precommit failure | Source/URL remain; Retry starts a new guarded, scoped entry attempt; Cancel is available only under safe-source rules |
| Committed activation failure | Show an actionable target-URL error surface, not false success; old source may already be unmounted |
| Postcommit Retry | New scoped readiness/activation retry at the committed URL, zero extra history push, no precommit Cancel/source-restoration promise and no forced second world cinema |
| Postcommit Back | Follow the recorded supported guarded history path once; do not push a duplicate target or invent a reversible capture state |
| Null-source entry | URL already exists; prepare without a new push, and offer only supported Retry/Back/eligible safe recovery |

Only the chooser's confirmed Current action is a no-op. Different same-identity routes, explicit Home and distinct history entries still navigate under preservation/readiness rules without a workspace ceremony. Ordinary browsing/explanation actions use 03's action classes; genuinely entering another workspace honors Cinematic/Fast.

Coalesce only equivalent pending intents: same account/session/context, source history entry, complete canonical target/parameters/query/hash/state and navigation kind. POP equivalence also requires the same requested history entry/delta. Identical identity or pathname alone is insufficient. Retry is deliberately a fresh attempt, not coalesced with failed work. Distinct retargets invalidate the old attempt against the retained authorized source before creating another.

Back during a pending pushed-entry intent cancels without dummy history entries when the source/context is valid. Back/Forward after commitment must preserve the original supported POP: retain source while guarding, restore the committed history index if needed, replay the recorded delta once and suppress the echo. This is a future router feasibility requirement, not capability supplied by today's pathname effect. If safe interception/preservation cannot be established, the affected future slice cannot be accepted through a destructive fallback. External browser history/termination is not a tested in-app recovery guarantee.

Every timer, request, animation-completion and arrival callback must match both active attempt and context generation before UI/cache/history/focus changes. Clear attempt-owned timers/controllers; supported abort is cleanup, not a replacement for stale-result checks. Logout/teardown releases resources and private preparation; authentication owns safe redirection. No old global timeout may read a newer attempt's callback.

## 6. Finite thoughts and durable reading holds

The [B quote candidates](research-quote-candidates.md) are source-verification candidates, not a rights-cleared display pool. Require exact text, attribution, work/year meaning, locator, editorial context and relevant territory/edition/translation rights in the future 05 pool. Preserve case/punctuation and identify clauses as excerpts. No invented dimension slogans, attribution padding, inferred learning efficacy or rank/money claims.

Working selection rule: choose n=5 or n=6 distinct destination-eligible cleared items without replacement when sufficient items exist. Exact five-versus-six selection policy remains an owner choice. With only one to four eligible items, show all available items once and disclose the shortage. With zero, show a static shortage/pending-or-Ready surface with no thought counter, fabricated card or implicit Fast preference; the proposed explicit Enter policy applies once ready. Do not hold entry to manufacture a quota or use uncleared legacy text. Five/six availability does not clear rights automatically.

Use ordinary DOM for the exact thought, author, source/year and expandable locator/context. Keep the finite selected transcript reachable to everyone. The thought surface is opaque and stationary; source details/attribution wrap rather than disappear to fit a reading timer. No live-region announcement for every thought or decorative phase. One deduplicated polite status channel announces meaningful preparation, Ready and failure changes. Screen-reader detection never chooses mode or timing policy.

Reading focus, text selection, expanded source details, Pause and manual Next/Previous latch a reading hold. Do not replace the selected text or dismiss the dialog at readiness/completion/ceiling. Explicit Resume/Enter/Skip may release optional reading hold, but never an invalid context, failed guard or hidden-document commitment hold. Focus remaining on a Resume control must not immediately re-latch a hold merely through re-render; a new reading interaction can hold it again.

Cursor position and exhaustion are separate. Mark exhaustion monotonically when the final automatic dwell completes, the active presentation ceiling is reached, or the zero-item branch is established. Manually selecting the final card pauses; it does not itself mark automatic completion. Previous after exhaustion allows transcript browsing but cannot clear exhaustion, restart autoplay or replenish the active budget. After exhaustion, Resume thoughts is not offered; use the appropriate explicit Enter/Resume entry controls. Natural Cinematic exhaustion does not create an automatic entry request under this draft's unapproved explicit-entry proposal.

## 7. Visibility, reduced motion and preference

When the document becomes hidden, pause optional clocks and hold commitment, including Fast/Skip entry requests. Preparation may continue. Returning visible keeps a latched paused/entry hold; explicit Resume thoughts, Resume entry or Enter clears the appropriate visible-return hold. No background readiness/expiry can remove the dialog before that confirmation. Do not catch up several thoughts or resume motion automatically.

Reduced motion immediately removes nonessential spatial translation/rotation/scale independently of saved Cinematic/Fast. Provide a truly static readable version with zero-interpolation changes; an opacity-only crossfade is a separate optional motion choice, not inherently static. Re-enabling motion neither restarts the sequence nor releases a pause. Low-end/static decorative fallback retains thoughts, status and functional destinations without adding graphics prerequisites.

Cinematic is the default when no saved choice exists. Explicit Fast/Cinematic selection is a presentation preference, not access or navigation; persist only under the later agreed storage strategy and disclose session-only behavior when persistence is unavailable. One-off Skip, reduced motion, cache hits and missing art do not silently save Fast. No screen-reader, device-class or access-state heuristic overrides the founder's default.

Sound/haptic design remains unselected. The working document does not grant new audio/capture permission: obey supported preferences and explicit permitted playback, remain fully usable in silence, and do not treat scenic sound as recording/save/access success. Studio/capture safety and the world-bible suppression requirement remain separate source-backed implementation checks.

## 8. Proposed millisecond timeline and timing alternatives

Timing begins only after the source guard permits the presentation; it is not a loading-progress clock. Eligibility/critical preparation runs independently, and Ready/Enter may become available at any point.

| Cinematic phase | Proposed timing | Visual/content meaning |
|---|---:|---|
| Decorative source frame recedes | 0–500ms | Separate noninteractive framing, not moving fields/controls or a captured source texture |
| Destination threshold resolves | 500–2000ms | One bounded Student reality opens, Mentor sections meet along a shared seam, or preserved Peer Space resolves |
| Stationary thought stage | From 2000ms, while eligible presentation remains | Exact readable thought/credit; core preparation may already be Ready or still pending |
| Inter-thought opacity change | Optional 200ms between cards | No spatial text movement; excluded from full-visibility dwell; disabled by truly static mode |
| Natural completion/ceiling | Finite, then static | Pending work stays named; Ready offers explicit Enter under the working proposal |
| Arrival decoration | Up to 1000ms reserved after commitment | Nonblocking around an already usable destination; does not delay Enter/arrival focus or stack a studio hold |

Enter/Skip bypass remaining optional entrance/reading. Failure or invalid access stops automatic atmosphere and exposes real recovery. These values are unselected proposals, not fixed app timers, empirical reading guarantees or flash acceptance.

For uninterrupted forward play with n≥1, let W be displayed quote words and M displayed attribution/source words. B's short candidates span W=3–24; M=5–12 is an English-layout assumption, not a credit limit. Count the full visible credit; localization or longer sources require new arithmetic, not truncation. The assumed two seconds of orientation and reading rates are design assumptions.

| Candidate | Full-visibility dwell d, seconds | Five thoughts, total seconds | Six thoughts, total seconds |
|---|---|---|---|
| A: tighter reading | max(5, 2+(W+M)/4), assumed 240 words/minute; 5–11s | 28.8–58.8 | 34–70 |
| B: roomier reading | max(7, 2+(W+M)/3), assumed 180 words/minute; 7–14s | 38.8–73.8 | 46–88 |

Arithmetic: **T(n)=2+0.2(n−1)+sum(d)+1**, with entrance, inter-card changes, full-visible dwells and arrival reserve. This is uninterrupted forward-play cinema arithmetic, not time-to-ready/commit or a wall-clock promise. It applies only to n≥1; n=0 has the separate static shortage branch and no negative inter-card term.

Candidate total active-presentation ceilings are 70s/A or 88s/B including the 1s arrival reserve. Neither is selected; do not fill unused budget. Pause/hidden/manual reading and terminal confirmation do not consume automatic-play time, but never reset or replenish already consumed active budget. Truly static mode removes motion overhead without cutting thoughts/credit. Core network/service timeouts and any overall wall-clock limit are separate unresolved policies; a presentation ceiling cannot turn pending/failed data into readiness or dismiss a reader.

## 9. Proposed performance and resource budget

These targets are to validate in the later slice, not achieved measurements. Transition-specific cost is separate from the destination's existing course/graphics/media cost.

| Budget proposal | Verification boundary |
|---|---|
| One coordinator, one visible transition dialog, one active entry attempt | Instrument intent/render/commit counts; no duplicate legacy overlay or restarted post-navigation ceremony |
| Zero transition-specific Canvas/WebGL renderers or capture streams | SVG/CSS/DOM threshold art and static fallback; world-journey graphics are not an entry-readiness dependency |
| No per-frame React state updates for decorative motion | Timer/state updates only for actual semantic phase/card/control changes; measure rather than infer compositor performance |
| At most six automatic selected thought records, finite transcript of those items | No endless carousel, replacement padding or growing retained attempt history |
| At most 50KiB gzipped incremental transition module/art transfer, excluding already-loaded shared libraries and target essentials | Measure production output later; include transition artwork/data cost, no hidden movie/font downloads |
| Controlled-browser UI acknowledgement target ≤100ms at p95 | Measure trigger/status/control feedback independently of network/guard readiness; target is not a physical-device guarantee |
| No retained transition-owned resources after teardown | Verify controllers/timers/listeners/DOM references and stale callbacks; a finite JS-heap sample alone is not GPU/full-process/leak proof |

Test default, static/reduced, warm/cold, slow/failure and repeated switch/retarget/cancel cycles with isolated fixtures. Actual device/frame/input/memory results, native accessibility and flash evaluation remain NOT_RUN. Do not solve an over-budget scene by hiding controls, skipping verified credit, silently changing mode or delaying Ready.

## 10. Proposed acceptance cases: NOT RUN

| Case | Given / when | Required observable result |
|---|---|---|
| T01 | Cold entry, essential reads pending | Source retained after a successful guard; zero target commit; named pending work, not fake percentage |
| T02 | Valid scoped warm cache, ready at first render | Ready/Enter immediately available; Cinematic still selected and optional presentation correctly labelled |
| T03 | Source dirty editor/quiz/capture/review/active tracks lacks supported preservation | No source cover/unmount, autosave/discard/submit/stop or new media request; exit blocked |
| T04 | Checking, pending, denied and access-check failure separately | Distinct supported states; no speculative private preparation, empty-success or membership mutation |
| T05 | Core successful-empty versus core failure | Only successful-empty can satisfy Ready; failure has supported precommit recovery |
| T06 | Optional font/graphics fails but core succeeds | Readable static/system-font fallback and Ready; no added graphics permission/dependency |
| T07 | Ready arrives during entrance/thought two; Enter now | Remaining optional presentation stops; exactly one rechecked commit, no decorative delay |
| T08 | Skip with core pending | Cinema bypassed, actual pending remains; entry awaits success/no hold; saved mode unchanged |
| T09 | Natural finite Cinematic completion while pending, then Ready | Autoplay stops; named work then explicit Enter under this proposed policy; no looping or fake loading |
| T10 | Pause/focus/text selection/source details; readiness or deadline occurs | Reader/context/focus preserved; no auto-dismissal; explicit control needed to release hold |
| T11 | Next/Previous at sequence ends | Nonwrapping manual browsing, automatic clock paused; no attribution truncation |
| T12 | Exhausted sequence, then Previous/Resume | Exhaustion/budget remain monotonic; transcript readable; no revived autoplay or replenished ceiling |
| T13 | Four eligible cleared quotes | Exactly those four once with shortage disclosure; no padding/uncleared legacy text |
| T14 | Zero eligible quotes and cache-ready destination | Static shortage/Ready/explicit Enter; no fabricated counter, negative timeline term or saved Fast change |
| T15 | Explicit saved Fast on a later entry | Presentation bypassed, readiness/guards intact; one-off Skip/reduced motion does not silently save Fast |
| T16 | Reduced motion toggled on/off during reading | Spatial motion removed immediately; static readable thoughts/controls; no automatic restart/resume or preference change |
| T17 | Cinematic hidden during preparation/readiness | Optional time and commitment held; visible return stays paused until explicit action; no catch-up announcements |
| T18 | Fast/Skip pending, hide document, readiness arrives | No hidden commit; visible return offers explicit Resume entry/Enter, mode unchanged |
| T19 | Current chooser activation versus another same-world route | Current closes only; distinct route still guarded/prepared/navigated without world cinema |
| T20 | Equal pathname/identity, distinct POP history entry | Distinct history intent survives coalescing; original guarded POP once, no duplicate push |
| T21 | Duplicate equivalent click versus different retarget | Duplicate coalesces; retarget invalidates old attempt and has a new ID/context-scoped callbacks |
| T22 | Old timeout/request/arrival completes after Cancel or retarget | Zero stale UI/cache/history/focus changes; supported abort plus callback scope checks |
| T23 | Source becomes unauthorized or account changes before Cancel | No private-source restoration/focus; old entry release invalidated; auth-owned safe recovery |
| T24 | Ready target access/source guard revision changes | Readiness invalidated/rechecked; no stale commitment or destructive fallback |
| T25 | Precommit failure then Retry | New guarded attempt; source/URL baseline retained; Cancel only when safely restorable |
| T26 | Target pushed, activation fails, Retry | Target-URL error; retry activation there with zero new push and no source-restoration Cancel |
| T27 | Committed failure, Back | Supported guarded history once; no duplicate target or claim of recovered unmounted recording |
| T28 | Initial deep link/null source with failure | No extra history push or nonexistent-source restoration; supported Retry/Back/eligible recovery |
| T29 | Logout/unmount while callbacks pending | Attempt-owned resources/private preparation invalidated; zero late private arrival or focus theft |
| T30 | 360px, long credit, keyboard and native enlarged text | Stable reachable controls/credit/transcript/focus; no Profile-link/drawer interference or clipped essential content |
| T31 | Studio destination entered after outer threshold | One experience, no second unavoidable studio hold; conventional preview/controls and no automatic device request |
| T32 | Repeated attempts and decorative failures | One dialog/attempt, bounded finite thought selection, cleared resources; cost/feedback targets measured separately from destination |

## 11. Review corrections, evidence and decisions still open

The resumed workflow returned two retained contributions, integration and adversarial review. Completed journal confirms the original readers were not restarted; unfinished integration was resumed and review ran afterward. Main read actual returned content, not merely nonempty counts. The candidate was **not ready for draft before correction**: four important and two minor issues were reported.

Main incorporated all six as explicit proposals: authorized source restoration on context loss; distinct postcommit retry/history/Cancel lifecycle; deterministic short/zero pools with n≥1 arithmetic; chooser-only Current no-op and full route/history intent equivalence; monotonic exhaustion/budget with manual browsing; hidden automatic-entry hold. Main also aligned the broader source guard and action classes with 03 and added measurable but unverified transition-specific budget proposals. The corrected document was not independently re-reviewed; do not report the original ready_for_draft=false as a later approval.

Verified input is current source inspection, retained B research, actual returned proposal/review and correct five/six A/B arithmetic. Not verified: every route's readiness manifest, backend/pending producers, current-source restoration authority, router POP/blocker feasibility, every editor/quiz/media persistence path, rendered original art, native screen reader/zoom, real device/input/frame/memory, audio isolation, flash limits or territory-wide quote clearance. One integrator reported a timed-out parent instruction search and partial source coverage; no parent-file absence or full-source review is inferred. Main's known nested repository instructions and 02/03 boundaries govern.

Remaining owner decisions: exact five/six selection rule; A/B or revised reading cadence; active-presentation ceiling versus overall wall-clock/network limits; automatic versus explicit natural completion; final cleared quote pool/editorial rights; sound/haptics; feature flag, stable IDs/display names and screen scope. The visual foundation and Cinematic default are already chosen and are not reopened. Final new CP-C approval still gates all implementation.
