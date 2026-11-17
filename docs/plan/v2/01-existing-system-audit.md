# Feature Pack 2 - existing-system audit

Date: 2026-11-06. Task: FP2-B. Status: COMPLETE under the user-selected targeted-verification scope; runtime acceptance remains UNVERIFIED.
Audience: the founder and engineers preparing the Feature Pack 2 plan.
[Skill: systematic-debugging] [Skill: verification-before-completion] [Skill: workflow-authoring]

## 1. Scope, method and limits

CP-A was approved by the typed message "proceed to next". After the workflow approached two hours, the user selected "Stop and finish (Recommended)". TaskStop stopped wf_9c0a22c3-e5b / wodjbpxle. Four audit reports and two independent verification reports were preserved; the reputation and experience second passes did NOT finish. The coordinator performed targeted source checks instead of restarting them. This is not approval of CP-B or Phase C.

All 14 requested areas have source inventories below. No application edits, imports/execution, tests/builds, servers, provider/DB/model calls, installations, migrations or commits occurred. No external research was performed. Existence of a module, passing historical test count or worker startup call does not prove operational deployment.

Repository: D:/orbit-main/orbit-main; branch feature/orbit-v3-foundation; HEAD ae9ba9653a35e6c4b1d656bef9ce8956282f2509. Preservation checks cover 782 tracked/nonignored-untracked FrontEnd/BackEnd files, not ignored runtime files or hosted data. Verification details are in [CP-B](../../progress/checkpoints/CP-B.md) and [ENVIRONMENT](../../../.agent/ENVIRONMENT.md).

### How to read findings

The [detailed catalog](01-audit-findings.md) preserves 110 returned-report records plus one coordinator documentation finding. It contains duplicates, future gaps and rejected hypotheses: **not 111 proven bugs**. Six duplicate records are explicitly cross-referenced.

| Label | Meaning | Limit |
|---|---|---|
| V | Independent source-verification pass returned | No runtime reproduction |
| T | Coordinator checked the specific source/guard/failure path | Not a replacement for a full second pass or runtime tests |
| A | First-pass source finding only | Confirmation UNVERIFIED; check before treating it as established or fixing it |
| U | Explicitly plausible/unverified hypothesis | Includes browser-dependent behavior |
| G | Future requirement gap or policy difference | Not automatically a current defect |
| R | Rejected hypothesis or deliberate current behavior | Do not revive it without new evidence |

Catalog record totals: V53, T13, A27, U2, G6, R10, including aliases. The 29 A/U records remain an explicit unresolved verification backlog. SOURCE_CONFIRMED in a returned report means static reasoning only. Dormant AI code is not presented as an exposed working API.

## 2. Executive assessment

**There is substantial reusable product code, but the earlier "milestones complete" narrative overstates integration and readiness.** The main constraint is not absence of UI components; it is inconsistent authority, lifecycle and data contracts between existing systems.

Source-checked priorities include account/room privacy boundaries; client-controlled XP; conflicting league/wallet writes; paid-room and quiz integration failures; and nonrecoverable payment/ledger transitions. Detailed inputs and source anchors are in the catalog. No evidence of actual exploitation, deployed configuration or live financial loss was collected.

Recommendations below are planning proposals, not approved rewrites, new branding, financial policies or feature selections. The user requires 15% platform share for optional mentor-priced sessions and a separate 20% subscription share. Existing overrides, engagement weighting or payout copy do not create exceptions.

## 3. Existing-system inventory: 14 areas

### B01. Peer leagues and account progression

**Exists / reachability.** Orbit weekly leagues, Cosmic reputation tiers, Gameology/Pulse progression and Mentor Pact are distinct systems, not one interchangeable score. Orbit has six divisions, target groups of 30 and top/bottom-five movement; Cosmic has 36 divisions plus archived Quasar honours. Gameology has eight weekly Pulse tiers and lifetime XP levels. Mentor Pact already has six divisions and session/rating/completion/Q&A scoring. These routes and workers are wired in source: [leagueService.js:15-36](../../../BackEnd/services/leagueService.js#L15-L36), [cosmicScore.js:16-42](../../../BackEnd/services/cosmicScore.js#L16-L42), [gameologyService.js:31-99](../../../BackEnd/services/gameologyService.js#L31-L99), [pactService.js:30-94](../../../BackEnd/services/pactService.js#L30-L94), [server.js:798-804](../../../BackEnd/server.js#L798-L804).

**Quality / bugs.** Targeted checks confirm that read-time rollover moves users into the new week before the worker adjudicates the old one, and worker rollover does not reset message-source XP caps: REP-LEAGUE-01/02. Other season/Pact/profile inconsistencies remain A-labeled in the separate league list. Client-selected xpOverride reaches persisted XP through the authenticated public award endpoint: REP-GAMIFICATION-01, checked at [gameologyRoutes.js:22](../../../BackEnd/routes/gameologyRoutes.js#L22), [gameologyController.js:115-120](../../../BackEnd/controllers/gameologyController.js#L115-L120), [gameologyService.js:198-243](../../../BackEnd/services/gameologyService.js#L198-L243).

**Reuse / must change / risk.** Reuse pure calculators, catalogs, worker boundaries and visual components. Replace conflicting rollover coordination and make reward inputs authoritative before F3/F4/F9 build on them. Preserve the distinction between reputation, weekly competition, achievement level and money. Deployed flags, historical standings and worker execution are UNVERIFIED.

### B02. Peer currency and virtual economy

**Exists / reachability.** One shared Photon wallet is stored as orbit.stardust and exposed through current Photon and legacy Stardust fields. It is not three identity-isolated currencies. Sources include activity, missions, milestones and duels; sinks include cosmetics, freezes, rerolls and honours. Gifts require a relationship, integer bounds and a nominal daily cap. A Photon ledger exists, while real-money payouts use a separate MoneyLedger: [orbitController.js:47-58](../../../BackEnd/controllers/orbitController.js#L47-L58), [orbitEngine.js:21-75](../../../BackEnd/services/orbitEngine.js#L21-L75), [photonLedger.js:16-24](../../../BackEnd/services/photonLedger.js#L16-L24), [payment/index.js:151-165](../../../BackEnd/services/payment/index.js#L151-L165).

**Quality / bugs.** A rolled GET or action can overwrite a newer atomic purchase because it replaces the entire orbit subdocument. Gift debits recheck balance but write a stale sentToday total; concurrent gifts can undercount the daily allowance. Gift-credit exceptions and duel-settlement failures lack a recoverable transaction boundary. These are T-checked REP-CURRENCY-01/02/03: [orbitController.js:118-122](../../../BackEnd/controllers/orbitController.js#L118-L122), [orbitController.js:322-370](../../../BackEnd/controllers/orbitController.js#L322-L370), [shopController.js:86-104](../../../BackEnd/controllers/shopController.js#L86-L104), [duelController.js:28-52](../../../BackEnd/controllers/duelController.js#L28-L52).

**Reuse / must change / risk.** Reuse catalog/artwork, guarded purchase logic and existing transaction identities, not the whole-wallet overwrite pattern. F5 needs identity-specific account semantics, atomic balanced accounting, reversals and reconciliation. Do not rename balances, convert currencies or seed/migrate user data in this task. Freeze-cap and sale-window findings remain A, not confirmed here.

### B03. Peer/mentor calls and shared whiteboard

**Exists / reachability.** Peer calls use the mounted VideoCall page. The shared framework-independent Board supports layered canvases, strokes/shapes/text/stickies/images, basic math/code rasterization, pages/templates, pan/zoom, undo and exports; chat/reactions/raised hands are integrated. Hybrid DataChannel/socket sync and REST snapshots are connected: [VideoCall.jsx:129-207](../../../FrontEnd/src/pages/VideoCall.jsx#L129-L207), [board.js:16-48](../../../FrontEnd/src/whiteboard/board.js#L16-L48), [sync.js:18-81](../../../FrontEnd/src/whiteboard/sync.js#L18-L81), [Whiteboard.jsx:118-175](../../../FrontEnd/src/whiteboard/Whiteboard.jsx#L118-L175).

**Quality / bugs.** The independent verifier confirmed eleven whiteboard findings, separately cataloged as MED-WB-01 through WB-11: room isolation/snapshot authorization, reconnect, early null transports, in-call unsaved-close loss, concurrent patch/delete convergence, incomplete snapshots, keyboard-input interception and resize sync/undo. Current call-end deletion and orphan TTL are intentional, not defects: [whiteboard.js:4-50](../../../BackEnd/models/whiteboard.js#L4-L50). A durable studio lifetime is a new contract requiring approval.

**Reuse / must change / risk.** Retain the Board core provisionally; repair or replace its synchronization/persistence layer after Phase C comparison. Recorder annotations currently use a separate canvas; the future studio/calls/peer surface must converge on one shared implementation. No claim of CRDT correctness, stylus quality, large-board performance or accessible rendering follows from synchronous unit tests.

### B04. Notifications and delivery preferences

**Exists / reachability.** Persistent inbox, socket delivery, best-effort FCM, notification bell and App listeners exist. Auth/admin email uses a separate email path; desktop/native chat helpers also exist. There are decay-reminder preferences, browser-local chat mute, OS permissions and some cooldown/deduplication controls, not zero controls: [notify.js:25-51](../../../BackEnd/services/notify.js#L25-L51), [notificationController.js:4-80](../../../BackEnd/controllers/notificationController.js#L4-L80), [ChatDrawer.jsx:993-1006](../../../FrontEnd/src/components/chat/ChatDrawer.jsx#L993-L1006), [orbitWorker.js:34-55](../../../BackEnd/workers/orbitWorker.js#L34-L55).

**Quality / bugs.** Independent source checks found account-cache leakage, listener/socket lifecycle mismatches, relogin push re-registration problems, duplicate worker reminders, wrong-role links, first-poll suppression, session event suppression and a socket chat path bypassing killed-app push. See FIN-NOTIFY-01 through 08; do not conflate cache leakage with the rejected claim that ordinary logout never disconnects the socket.

**Reuse / must change / risk.** Reuse inbox models and adapters, but add coordinated delivery identity, retry/outbox semantics, account-scoped caches, channel preferences, quiet hours and fatigue budgets. Provider configuration and real device delivery remain UNVERIFIED; copy tests are not delivery tests.

### B05. Ratings and reviews

**Exists / reachability.** Peer Rating is one editable record per reviewer/recipient, not per call. Submission requires authentication; completed-connection status affects weighting rather than submission eligibility. Cosmic uses a Bayesian prior and recency weighting. Completed sessions support two-way stars, with student ratings aggregated into MentorProfile. Course.rating stores counters but no course-review submission/aggregation writer was found in the inspected mounted surface: [trustController.js:89-148](../../../BackEnd/controllers/trustController.js#L89-L148), [rating.js:49-65](../../../BackEnd/models/rating.js#L49-L65), [sessionsController.js:487-544](../../../BackEnd/controllers/sessionsController.js#L487-L544), [Course.js:99-102](../../../BackEnd/models/Course.js#L99-L102).

**Quality / bugs.** T-check confirms spotlight quote queries omit hidden-review filtering and directly return the selected text: REP-RATINGS-01, [cosmicController.js:280-304](../../../BackEnd/controllers/cosmicController.js#L280-L304). Retaining hidden reviews' star contribution is deliberate current policy and is not this leak. Stale sentiment, duplicate session aggregates and case-variant self-rating remain A-labeled findings.

**Reuse / must change / risk.** Extend existing rating records and moderation surfaces; define verified learning/session eligibility, separate dimensions and authoritative aggregate inputs. Do not assume one score already governs mentor ranking, flare allocation and course discovery consistently. Learning-outcome and anti-retaliation policies remain future design decisions; no new weights are adopted here.

### B06. Student, Peer and Mentor dashboards

**Exists / reachability.** Peer MyOrbit reads skills/activity; Student Universe renders enrollment-driven CSS planets; Mentor Observatory, Students and Analytics share owner-scoped learner data. The 2D dashboard star map is not the same as the R3F course journey. Canonical routes are connected, while older MySkills scaffolding is unmounted: [App.jsx:798-840](../../../FrontEnd/src/App.jsx#L798-L840), [courseController.js:651-761](../../../BackEnd/controllers/courseController.js#L651-L761), [useSoul.js:28-40](../../../FrontEnd/src/hooks/useSoul.js#L28-L40).

**Quality / bugs.** Cross-account React Query leakage is independently checked under FIN-NOTIFY-01 (EXP-EDT-02 is an alias). Role-control nesting/mobile visibility, PeopleRow's endpoint and responsive star-map hit testing remain A-labeled, not browser-reproduced facts.

**Reuse / must change / risk.** Extend canonical pages and owner-scoped data APIs; do not create parallel dashboards. Fix account boundaries and reconcile UI/API shapes before adding new analytics. Current views do not establish creator drop-off heatmaps, normalized learning outcomes or complete studio management.

### B07. Requests, thresholds and Signal Flare

**Exists / reachability.** There are two separate demand systems. /api/courses/requests stores ASCII-token clusters, votes and mentor claims. /api/flares connects taxonomy, WaitingRoom and publication responses. The latter defaults to a five-record threshold, ranks approved/active subject matches, caps delivery at 40 and applies a global 14-day mentor cooldown: [courseRoutes.js:73-77](../../../BackEnd/routes/courseRoutes.js#L73-L77), [courseRequestController.js:8-65](../../../BackEnd/controllers/courseRequestController.js#L8-L65), [signalFlareService.js:86-155](../../../BackEnd/services/signalFlareService.js#L86-L155), [CoursesBrowse.jsx:103-115](../../../FrontEnd/src/pages/CoursesBrowse.jsx#L103-L115).

**Quality / bugs.** The request API labels 25 votes mentor_notified without a delivery side effect, labels 50 claim_eligible but allows claims at 25, and can allow concurrent claim winners. Flare records can overcount one requester across arbitrary constellation strings, lose an empty-search topic, expose queue data to any authenticated role and consume state before failed delivery. These are FIN-REQUEST/FLARE findings. Flare is bounded fan-out, not a global broadcast and not exclusive allocation.

**Reuse / must change / risk.** Consolidate demand semantics and preserve existing user records/UI rather than adding a third engine. Subject clustering, distinct demand, atomic claims, outline/production timers, expiry/reassignment and new-mentor fairness are not established. Two literal frontend searches, including 347 authored source files, found no newer request-API caller; dynamic URLs/external clients are not ruled out. The tests assert incompatible tier/claim thresholds separately: [courseRequest.test.js:97-133](../../../BackEnd/tests/courseRequest.test.js#L97-L133).

### B08. Subscriptions, booking, real-money ledger and payouts

**Exists / reachability.** Billing read APIs, Pricing and models exist. Fallback paid plans have 2/5/10 seats at INR 599/1299/2199 monthly, plus annual variants; stored plans can override them. These are source values, not launch pricing approval. Subscribe returns 503 when payments are disabled and 501 when enabled: [billingPlans.js:24-60](../../../BackEnd/services/billingPlans.js#L24-L60), [billingRoutes.js:19-35](../../../BackEnd/routes/billingRoutes.js#L19-L35), [billingRoutes.js:100-123](../../../BackEnd/routes/billingRoutes.js#L100-L123). Recurring activation, entitlement enforcement and settlement are not an operational end-to-end flow.

**Accounting distinction.** Code applies the subscription 20% to net-of-configured-tax revenue. Dormant settlement excludes unengaged seats and divides half flat/half by cleared stages, leaving a pool unallocated with no engagement. This is not implemented equal distribution among every enrolled course and is not automatically adopted for Feature Pack 2: [billingPlans.js:131-146](../../../BackEnd/services/billingPlans.js#L131-L146), [billingSettlement.js:26-89](../../../BackEnd/services/billingSettlement.js#L26-L89). The coded 18% tax parameter is NOT legal verification.

**Sessions.** Students book approved profiles for 30/45/60 minutes with immutable price snapshots. Session share defaults to 15%, but permits an override and rounds in whole INR. Current 90% mentor-share copy is inconsistent with the default booking calculation, not an approved exception. Zero-rate profiles are accepted but booking requires a positive order. Packages have a model, not a complete booking lifecycle: [sessionService.js:16-43](../../../BackEnd/services/sessionService.js#L16-L43), [sessionsController.js:228-308](../../../BackEnd/controllers/sessionsController.js#L228-L308), [SessionPackage.js:3-17](../../../BackEnd/models/SessionPackage.js#L3-L17).

**Source-checked failure boundaries.** Missing production keys can enter mock acceptance; multiple pending orders can buy one slot; capture without browser verification leaves payment held but unbooked; failed refunds can be marked refunded; refunds do not coordinate payout reversals. Webhook receipt-before-effect suppresses failed retries. Completion saves completed/released before sequential ledger writes, so partial failures can strand obligations. See FIN-MONEY-01 through 08, particularly [sessionsController.js:428-444](../../../BackEnd/controllers/sessionsController.js#L428-L444), [sessionsController.js:563-597](../../../BackEnd/controllers/sessionsController.js#L563-L597), [MoneyLedger.js:51-61](../../../BackEnd/models/MoneyLedger.js#L51-L61).

**Reuse / must change / risk.** Keep money/Photon separation, paise ledger identities, snapshots and arithmetic primitives; rebuild transition coordination, funding/reversal records, reconciliation and reservation/recovery semantics. initiatePayout only queues ledger intent, not a bank transfer ([payment/index.js:151-165](../../../BackEnd/services/payment/index.js#L151-L165)). Razorpay is not declared in backend manifests; actual installed/parent resolution and live credentials remain uninspected. No legal escrow, tax, KYC or payment-provider compliance claim is made.

### B09. Identities, roles and permissions

**Exists / reachability.** User.roles contains peer_learner/student/mentor; User.role separately controls staff/admin access. Active routes use requireRoles.js; identity.js is a separate scaffold, not the universal middleware. URL/identity-store transitions change presentation, not a server active-identity context. Mentor application deliberately self-approves unless suspended; this is current tested policy, not an accidental bypass: [user.js:140-163](../../../BackEnd/models/user.js#L140-L163), [requireRoles.js:42-52](../../../BackEnd/middleware/requireRoles.js#L42-L52), [identityStore.js:19-45](../../../FrontEnd/src/soul/identityStore.js#L19-L45), [sessionsController.js:52-103](../../../BackEnd/controllers/sessionsController.js#L52-L103).

**Quality / bugs.** The role-refresh exception checks /user/roles or /api/user/roles while the mounted router receives /roles, so stale credentials also fail recovery (T: REP-ACCESS-01 / EXP-EDT-04). Source: [auth.js:71-80](../../../BackEnd/middleware/auth.js#L71-L80), [userRoutes.js:31-37](../../../BackEnd/routes/userRoutes.js#L31-L37), [server.js:719](../../../BackEnd/server.js#L719).

**Reuse / must change / risk.** Preserve distinction between staff permission and product identity, and reuse live-role checks. Add explicit object-level authorization wherever generic room/discovery APIs bypass it. A mentor role or self-approved profile is not verified identity, guardian consent or child-safety compliance. Stricter onboarding/minor policy must be researched and approved, not silently imposed now.

### B10. Realtime stack, signaling and membership

**Exists / reachability.** Socket.io and optional Redis adaptation handle events; native WebRTC uses STUN and configurable TURN. Presence includes process-local state. Guarded session relays coexist with generic video/call handlers. Session HTTP ownership checks do not secure every signaling path: [server.js:170-194](../../../BackEnd/server.js#L170-L194), [server.js:340-422](../../../BackEnd/server.js#L340-L422), [server.js:487-553](../../../BackEnd/server.js#L487-L553).

**Quality / bugs.** V-checked MED-WB-01/02/03 show that generic joins, call-ended cleanup and client-created call history can bypass whiteboard isolation. MED-CALL-02 permits a nonparticipant to end a legacy call through HTTP. The paid wrapper imports the default VideoCall export, which reads a different URL parameter and renders its lobby rather than the supplied transport: [OrbitSessionRoom.jsx:135-141](../../../FrontEnd/src/pages/OrbitSessionRoom.jsx#L135-L141), [VideoCall.jsx:583-593](../../../FrontEnd/src/pages/VideoCall.jsx#L583-L593).

**Reuse / must change / risk.** Reuse transport/UI primitives only behind one authoritative room/booking/connection membership model. Reconnect, cross-instance presence and lifecycle notifications need integration work. No TURN success, weak-network reliability, multi-instance consistency, mutual recording consent or live-call safety evidence was collected.

### B11. Video storage, recording, authoring, notes and AI checkpoints

**Exists / reachability.** Mentor-gated Cloudinary uploads request MP4 conversion with 500 MB video and 5 MB thumbnail limits. MediaLibrary tracks references and some in-component retries. Recorder.jsx is a real mounted studio: 720p canvas composition, screen/camera/mic, layouts, teleprompter, pause/resume, chapter splitting, retake cuts, review and upload. It is not absent: [courseRoutes.js:30-105](../../../BackEnd/routes/courseRoutes.js#L30-L105), [MediaLibrary.jsx:148-198](../../../FrontEnd/src/pages/mentor/MediaLibrary.jsx#L148-L198), [Recorder.jsx:203-270](../../../FrontEnd/src/pages/mentor/Recorder.jsx#L203-L270), [Recorder.jsx:351-464](../../../FrontEnd/src/pages/mentor/Recorder.jsx#L351-L464).

**Media / authoring quality.** Public course responses expose original nonfree media URLs while signing is synthetic; priced playback ignores retake cuts. Source replacement can retain old audio, and retrying partially saved chapter sets can duplicate earlier lessons. Applied builder copy, clearing the last quiz question and free-introduction invariants have checked persistence defects. See MED-MEDIA/STUDIO/AUTHOR findings. Cloudinary ACLs, actual transcoding, remote cleanup and delivery expiry remain UNVERIFIED.

**Learning / notes.** Embedded course/lesson quizzes, enrollment attempts, resources and Q&A exist. Personal private notes and timed quiz-checkpoint contracts were not located in the inspected paths. Chapters are not quiz checkpoints. The canonical CoachQuiz sends an incompatible submission shape, grades without the learner's hidden answer key and reads stale state for onPass; independent verification confirms MED-LEARN-01 ([CoachQuiz.jsx:47-86](../../../FrontEnd/src/components/gameEngine/CoachQuiz.jsx#L47-L86), [CourseLearn.jsx:283-295](../../../FrontEnd/src/pages/CourseLearn.jsx#L283-L295), [courseController.js:947-952](../../../BackEnd/controllers/courseController.js#L947-L952)). A completion upsert alone does not attest learning or attendance.

**AI reachability.** server.js:737 mounts aiRoutes, whose only endpoint is /level-proposal. Visible AI quiz controls call separate unmounted paths: [aiRoutes.js:8-15](../../../BackEnd/routes/aiRoutes.js#L8-L15), [aiQuizRoutes.js:12-18](../../../BackEnd/routes/aiQuizRoutes.js#L12-L18), [aiQuiz.js:12-24](../../../FrontEnd/src/services/aiQuiz.js#L12-L24). The mounted proposal is an explicitly labeled deterministic template. Dormant Ollama code uses supplied text, one configured model and generic fallback questions, not an established retrieval/specialized-course pipeline: [aiController.js:35-62](../../../BackEnd/controllers/aiController.js#L35-L62), [ollamaService.js:43-94](../../../BackEnd/services/ollamaService.js#L43-L94).

**Dormant risks / reuse.** Merely mounting aiQuizRoutes would expose additional work: case-sensitive model imports, nonexistent Course.modules lookup, stringified options, review ownership and premature local approval-copy behavior. See MED-AI-02 and [aiQuizController.js:4-55](../../../BackEnd/controllers/aiQuizController.js#L4-L55), [AICourseQuizPanel.jsx:62-67](../../../FrontEnd/src/cosmic/AICourseQuizPanel.jsx#L62-L67). Extend recorder/authoring/review components; specify durable local recovery, resumable upload, shared Board, actual notes editing and one consistent media/checkpoint timebase before choosing integrations. No codec, crash recovery, HLS/captioning or inference performance was tested.

### B12. Animation, art and quality behavior

**Exists / reachability.** The frontend declares Motion, Three, Fiber, Drei and postprocessing alongside CSS effects; source has shared tokens, identity transitions, bespoke badges, share cards and a seeded course journey. The journey has arrival-driven shuttle navigation, renderer/error fallback and live OS reduced-motion handling: [FrontEnd/package.json:25-47](../../../FrontEnd/package.json#L25-L47), [index.css:3-83](../../../FrontEnd/src/index.css#L3-L83), [CourseSpaceJourneyWorld.jsx:129-147](../../../FrontEnd/src/cosmic/CourseSpaceJourneyWorld.jsx#L129-L147), [useQualityTier.js:13-32](../../../FrontEnd/src/hooks/useQualityTier.js#L13-L32).

**Quality / limits.** Current source gates both Lab import and route on DEV; the historical unconditional production-import defect should not be repeated ([App.jsx:142-143](../../../FrontEnd/src/App.jsx#L142-L143), [App.jsx:863-866](../../../FrontEnd/src/App.jsx#L863-L866)). Actual emitted/precache isolation was not rechecked. Some Lab tabs fall back to the star scene, and normal-motion cosmetics/long-list clipping findings remain A/U. No fresh browser contrast, GPU lifecycle, FPS, thermal or reduced-motion acceptance was run.

**Reuse / must change / risk.** Extend [existing art direction](../../design/00-art-direction.md), [tokens](../../design/01-design-tokens.md), [badge rules](../../design/02-icon-and-badge-system.md) and [quality spec](../../design/05-performance-and-quality-tiers.md). Do not introduce a competing art/motion system in B. F8 still needs a per-moment budget, semantic purpose, skip/sound/reduced-motion contracts and measured device acceptance.

### B13. Search, recommendations and knowledge graph

**Exists / reachability.** Skills use reciprocal escaped-regex matching, nearby discovery computes/fuzzes location, courses use text-index search and server pagination, and CommandPalette provides fuzzy actions. Knowledge APIs expose personal/public maps and concept-based progression; no normal LessonConcept writer was found in the inspected paths: [skillController.js:183-221](../../../BackEnd/controllers/skillController.js#L183-L221), [geoController.js:103-164](../../../BackEnd/controllers/geoController.js#L103-L164), [courseController.js:164-202](../../../BackEnd/controllers/courseController.js#L164-L202), [knowledgeGraphRoutes.js:31-85](../../../BackEnd/routes/knowledgeGraphRoutes.js#L31-L85).

**Quality / privacy.** Targeted source review confirms skill aggregation joins whole User documents then excludes only a small field list; reset/admin/private fields are not removed before JSON output. This is EXP-EDT-01, conditional on an eligible user's stored fields, not proof of actual leaked credentials: [skillController.js:204-221](../../../BackEnd/controllers/skillController.js#L204-L221), [skillController.js:342-379](../../../BackEnd/controllers/skillController.js#L342-L379), [user.js:131-190](../../../BackEnd/models/user.js#L131-L190). Palette response shape, course pagination, graph coordinates/edges and public-score redaction findings remain A. Public sharing itself is intentional, not a defect.

**Reuse / must change / risk.** Retain taxonomy, search APIs and graph concepts; use explicit public projections and repair contracts before using these as F9 recommendation foundations. This is not an existing adaptive curriculum, semantic request clusterer or timestamp-grounded tutor. Actual graph population and recommendation quality remain UNVERIFIED.

### B14. Analytics and event tracking

**Exists / reachability.** orbitAnalytics writes structured stdout and a process-local ring of 1,000 events; admin telemetry polls it. XpEvent and inbox records are persistent. Web Vitals initialization is development-only. Session/swap paths emit XP socket events, while inspected course paths award without equivalent emission: [orbitAnalytics.js:12-48](../../../BackEnd/services/orbitAnalytics.js#L12-L48), [adminPortal.js:149-150](../../../BackEnd/routes/adminPortal.js#L149-L150), [reportWebVitals.js:18-36](../../../FrontEnd/src/utils/reportWebVitals.js#L18-L36), [XpEvent.js:15-29](../../../BackEnd/models/XpEvent.js#L15-L29).

**Quality / bugs.** The XP service updates balances before writing history, and its event catalog includes events excluded by XpEvent's enum (T: REP-GAMIFICATION-02, EXP-EDT-13 alias). Source: [gameologyService.js:227-269](../../../BackEnd/services/gameologyService.js#L227-L269), [XpEvent.js:17-24](../../../BackEnd/models/XpEvent.js#L17-L24). Historical totals or successful UI actions are not trustworthy experiment metrics merely because an analytics function exists.

**Reuse / must change / risk.** Reuse event vocabulary and admin views, but define durable event identities, authoritative learning outcomes, privacy/retention and complete funnel coverage. External log storage, aggregation, data retention and production metrics were not verified. No causal retention or learning-effectiveness claim is made.

## 4. Separate bug lists and proposed prerequisites

Detailed scenarios, exact anchors and verification degrees are in the [catalog](01-audit-findings.md).

| Required separate list | Source records | Checked now | Remaining uncertainty |
|---|---|---|---|
| League bugs | REP-LEAGUE-01 through 10 | T: read-before-adjudication and stale message cap | Remaining eight are A; full season/Pact validation not finished |
| Currency bugs | REP-CURRENCY-01 through 05 | T: full-wallet overwrite, daily gift cap race, partial gift/duel failure | Freeze-cap and sale-window claims remain A |
| Whiteboard bugs | MED-WB-01 through 11 | All eleven have returned independent source checks | Browser, network reordering and runtime authorization tests not run |

Proposed prerequisite order, not implementation approval: (1) public/account/room data boundaries and authoritative rewards; (2) money/entitlement recovery and room/quiz integration; (3) league/currency convergence; (4) studio recovery and trustworthy learning events; (5) expansion on corrected shared components. Preserve the unresolved backlog rather than treating every audit hypothesis as an instruction to change code.

## 5. Feature Pack 2 reuse map

| Feature | Existing building block | Reuse, extend or rebuild | Notes / dependency |
|---|---|---|---|
| F1 Signal Flare | CourseRequest, SignalFlare, taxonomy, WaitingRoom, publication hook | Consolidate and extend; rebuild allocation coordination | Do not add a third demand engine; real claim states and delivery recovery needed |
| F2 Ratings/reputation | Rating, MentorProfile, session stars, Cosmic math, moderation | Extend records; rebuild authority/aggregate consistency | Verified course reviews and outcome signals not complete |
| F3 Mentor Playground | PactHall, six Pact divisions, signals/history, badge components | Extend; replace unsafe rollover coordination | New Multiverse names/perks are proposals only |
| F4 Student Playground | CourseLearn, Enrollment, Gameology/Pulse, XP/achievement UI | Extend after reward/quiz repair | Current account XP is not secure normalized learning competition |
| F5 Separate currencies | Photon wallet/catalog/ledger and separate money ledger | Reuse art/contracts; redesign virtual accounting boundary | No conversion, rename, migration or money linkage approved |
| F6.1 Recording studio | Recorder, RecorderReview, MediaLibrary, cuts, upload client | Extend | Durable buffering, upload/session idempotency and timestamp checkpoints missing |
| F6.2 Shared whiteboard | Board, Whiteboard, sync and snapshot endpoints | Reuse core provisionally; repair/replace sync after research | Recorder annotations must converge into the shared component; lifetime policy differs |
| F6.3 Notes/AI assistance | Course resources, Q&A, embedded quizzes, dormant Quiz draft schema | Extend content links; notes editor/pipeline needs integration design | No established private notes or transcript-grounded drafting workflow |
| F6.4 Flare-to-course | Existing demand UI and mentor authoring | Integrate existing surfaces | Claim/outline/media/checkpoint ownership contracts not connected |
| F7 Optional sessions | BookingModal, OrbitSession, native call controls, payout-intent ledger | Reuse UI/snapshots; rebuild lifecycle and financial coordination | Fix paid transport; enforce fixed 15% separately from subscriptions; no bank payout claim |
| F8 Animation | CSS/Motion, R3F scene, tokens, badges/share cards/transit | Extend one existing system | Compare approaches in C; no competing motion package chosen here |
| F9 Feature Lab | Knowledge graph, Q&A, connections/chat, cosmetic/share primitives and dashboards | Evaluate reuse in C2; no shortlist chosen | Extra features remain equally important; current primitives are not proof their proposed features already work |

## 6. Historical documentation discrepancies

[Milestone ledger:13-16](../../progress/milestone-ledger.md#L13-L16) says subscription economics and AI integration are done; inspected checkout and AI mounts contradict end-to-end completion. PactWeekLedger tracks score signals, not subscription money settlement. [AI plan:23-38](../07-ai-quiz-engine.md#L23-L38) contains architecture/model/performance proposals, not measured installed capabilities.

DOC-01 corrects [executive summary:29-36](../00-executive-summary.md#L29-L36) under its own assumptions: revenue 1,200,000, platform 240,000, mentor pool 960,000 rather than 160,000; listed platform costs leave 130,000 rather than 190,000. This is arithmetic correction only, not validated prices, demand, processor fees or forecasts. Old documents remain untouched.

## 7. Verification performed and still owed

| Check | Result | What it does not prove |
|---|---|---|
| Four source audits | Returned for all assigned areas | Runtime readiness |
| Two independent verifiers | Demand/money and media/whiteboard returned | Completion of the two stopped verifiers |
| Targeted coordinator checks | XP authority/schema, role recovery, league rollover, currency races/failures, hidden quote filtering, public user projection, plus earlier AI/payment checks | Exhaustive verification of A/U backlog |
| Backend relative import scan | 535 references; two case mismatches in dormant AI controller | Dynamic imports, dependency availability or Linux runtime tested |
| Frontend relative import scan | 985 references; no unresolved/case-only path in manifest | Build, rendering or API compatibility |
| Artifact checks | File presence, line bounds, local links, labels, registry and no authored pictographs | Source content or all historical DB/user text scrubbed |
| Application preservation | Beginning/end fingerprint, HEAD and working-tree checks | Ignored runtime files or deployed environments |

Tests read include leagueService/orbitAntiGame/cosmicScore/cosmicTier/seasonService; billingPlans/billingSettlement/paymentService/mentorPayouts/orbitSession; courseRequest/signalFlareService; board/Whiteboard.dom/whiteboardModel; courseModel/courseSerializer/mentorAuthoring/courseStages; and relevant auth/knowledge-graph tests. They were NOT run. Existing board tests use synchronous delivery, DOM tests stub rendering, and the cited course browser capture exercises login, not course acceptance. Source-specific tests and gaps are identified by catalog anchors and the preserved reports.

Still owed before implementation/launch: authentication/room abuse tests; concurrent rollover/award/gift/claim tests; partial payment/ledger failure recovery; real browser paid calls/quizzes/recording recovery; native push/logout; media authorization/cut parity; accessibility and target-device performance. Live DB/index state, flags, provider capabilities, taxes/laws and safety policies remain UNVERIFIED. Phase C must use current primary sources rather than these documents as legal/pricing evidence.

## 8. Problems, process correction and next gate

The original eight-pass workflow was too broad for a timely checkpoint. At roughly 119 minutes, six passes had returned and a remaining verifier had made 315 tool calls. The user chose to stop; completed reports were recovered without relaunching. Partial verification is explicit, not concealed by a green status.

Other issues: guessed module paths resolved through exact directory listings; some broad searches timed out or hit output limits; saved report outputs were split into bounded sections for recovery. These are recorded in [ERRORS](../../../.agent/ERRORS.md). No evidence was invented from empty searches, no dependency was installed, and no runtime test was used to disguise source uncertainty.

The supplied prompt is truncated during Phase C topic 12. The gate map and F1-F9 requirements are present, but the missing detailed phase tail must be supplied before relying on it. This audit does not reconstruct those instructions.

Next: present [CP-B](../../progress/checkpoints/CP-B.md), set STATE/HANDOFF to WAITING_FOR_APPROVAL (CP-B), and stop. Approval would open research only, not repairs, installations, branding decisions, new financial policies or implementation.
