# Project brief
Date: 2026-11-15. Identity Worlds Phase C / IW-C-MLOCK; CP-IDX handover, not implementation approval.
Repository: D:/orbit-main/orbit-main. Branch: feature/orbit-v3-foundation. HEAD: ae9ba9653a35e6c4b1d656bef9ce8956282f2509.
This is a source-backed map of the local project. No deployed demonstration, application test suite, device benchmark or provider transaction was run.

## Product today
Orbit combines peer skill exchange, course learning, mentor authoring, optional paid sessions and several distinct gamification systems. Much of the interface and backend exists, but major integration, authority, financial-recovery and user-feedback gaps prevent treating it as a completed production platform.
Student = Multiverse, Mentor = Dimensions and Peer = Space are retained product decisions. Artifacts + Projection and a default cinematic sequence of five or six verified thoughts are selected intent, not the current implemented transition. New world, league and currency names remain unselected.

## Module map
| Module | Current responsibility | Evidence |
|---|---|---|
| BackEnd | Express APIs, Mongo models, domain services, notification and rollover workers | BackEnd/server.js:715-749,798-885 |
| FrontEnd/src | React routes, account stores, API clients, course/mentor/Peer pages, Canvas/R3F scenes and shared Board | FrontEnd/src/App.jsx:779-840; main.jsx:64-96 |
| shared/fp2 | Strict transport schemas and TypeScript contracts for the paused foundation | shared/fp2/schema.js:282-327; contracts.d.ts:19-110 |
| scripts/agent | Local verification, capture and recovery helpers | scripts/agent/verify.js; supervisor.js; recovery-hooks.js; relaunch.js |
| docs | Historical plans/audits, v2 proposals, v3 research and designs02-05, separate pitch materials | Module digests and MANIFEST.md |
| Android/CI | Capacitor shell, Gradle configuration, main-branch build/test workflows | FrontEnd/capacitor.config.json:1-23; .github/workflows/ci.yml:39-67 |

## Actual flows and limits
| Area | Source wiring | Important limit |
|---|---|---|
| Entry and caching | FrontEnd/src/main.jsx:64-96 creates one QueryClient and mounts App under shared providers | Private hooks commonly omit account IDs from keys. Account-change cache isolation is not established by the indexed flow. |
| Identities | useSoul.js:30-40 resolves an eligible route, otherwise mentor > student > peer;73-82 starts transit then navigates | Route world, selected context and membership are not the proposed separate state machines. |
| Switching | soul/identityStore.js:28-48 chooses one global thought and clears after3000ms; RoleSwitcher and RoleSettings use another overlay | Old timers survive cancellation/restart. There is no implemented destination-readiness or source-work protection coordinator. |
| Membership | BackEnd/controllers/userController.js:271-350 replaces roles and returns a new token | RoleSettings removes the other paid role while RoleSelector permits both; visual switching must not silently revoke membership. |
| Authentication | BackEnd/middleware/auth.js:15-20 loads live users/roles;41-49 writes daily activity;71-81 checks numeric rolesVersion | Router-relative refresh paths mismatch. OAuth tokens omit rolesVersion at routes/oauthRoutes.js:11-12, though live role loading still applies. |
| Learning access | courseController.js:539-555 permits enrollment without subscription seats;1141-1145 uses enrollment for non-free streaming | billingRoutes.js:137-147 can independently report intro_only. Subscription entitlement and learning access are not one enforced boundary. |
| Progress | courseController.js:793-825 upserts enrollment and records completion | It does not require quiz success or prerequisite completion. Server persistence is not proof of trustworthy learning authority. |
| Lesson quiz | CoachQuiz.jsx:47,85 submits an answer object; CourseLearn.jsx:289-294 forwards it; courseController.js:951-952 requires an array | Requests are incompatible. Client grading also requires correctIdx withheld from nonowners at courseController.js:82-90, and submit reads stale score/passed state at CoachQuiz.jsx:65-86. Do not expose answer keys as a repair. |
| AI generation | server.js:737 mounts aiRoutes; aiController.js supplies deterministic proposal templates; services/aiQuiz.js calls separate generation/approval paths | Standalone aiQuizRoutes is not mounted. Ollama/Quiz scaffolding is not operational per-course fine-tuning or validated lesson-specific generation. |
| Journey | CourseSpaceJourneyWorld.jsx maps all finite nodes, seeded planets and shuttle travel, with quality/error-driven2D fallback | It is not accepted bounded seamless streaming. stationKindForIndex:129-137 derives decorative gates from position, not actual lesson prerequisites or isBoss. |
| Course requests | courseRequestController.js:21-123 clusters text, records votes and claims | List labels claim eligibility at50; claim accepts25. It is separate from SignalFlare, with no unified claim-to-publication bridge. |
| Signal Flare | signalFlareService.js:7 uses configurable fallback threshold5;105-155 ranks taxonomy coverage, selects up to40 mentors and stamps14-day cooldown | Not staged confidence-adjusted rating waves. Send failures still advance cooldown. First publication invokes onCoursePublished at courseController.js:347-351, without a CourseRequest claim link. |
| Ratings | trustRoutes.js:14-26 exposes Peer reviews/reports; sessionsController has session ratings; Course stores rating aggregates | Course stars, Peer trust/Cosmic sentiment and Mentor Pact are distinct. Semantic course-feedback research has not become an implemented course-review system. |
| Student progression | gameologyController.js:115-120 forwards client metadata; gameologyService.js:198-270 calculates XP/tier/achievements | xpOverride is accepted; snapshot writes and follow-up rewards are not a proven atomic, deduplicated event system. |
| Mentor progression | pactService.js computes weekly contributions, six divisions and group rollover | Weekly freshness, pulse/history and rollover-recovery concerns remain. Retheming must preserve IDs, counts, order and scores. |
| Peer economy | Orbit/BinaryStar/duel/shop services and PhotonLedger drive virtual units and cosmetics | Shared stardust/Photon display is not a completed separate Student/Mentor wallet implementation. Virtual units are not real money. |
| Subscriptions | billingPlans.js:24-60 seeds OrbitTwo/Five/Ten at INR599/1299/2199 with20% cut; billingRoutes.js:109-119 returns503 or501 for checkout | Core599/Premium1199 are intended targets, not current catalog or profitability proof. Pricing.jsx:310 says25%, contradicting the retained20% intent. |
| Session payment | sessionsController.js:269-279 creates orders separately from the subscription PAYMENTS_LIVE gate | payment/index.js:35-44 can fall back to mock when keys are absent, including production; actual credentials/configuration were not read. |
| Payout and webhook | sessionsController.js:428-443 saves completed/released before initiatePayout;563-597 inserts webhook dedupe before dispatch | initiatePayout records queued ledger intent, not bank transfer. Failure can strand payout or suppress webhook retry. |
| Calls | VideoCall implements WebRTC/signaling/Board; OrbitSessionRoom wraps paid sessions | Mounted videoRoutes.js:133-145 lacks an end-call participant check. OrbitSessionRoom.jsx:69-73 sends a headerless beacon to a bearer-authenticated completion route, so cleanup is not proof of completion. |
| Studio | Recorder uses streams, Canvas composition, four layouts, chapters/retakes and RecorderReview, then uploadVideo/addLesson | Local blobs are not crash-safe storage or resumable upload. Retakes store cut metadata; Recorder.jsx:445-453 uploads the original blob, so omitted footage is not physically redacted. |
| Whiteboard | Board + WhiteboardSync use RTC/socket operations; Whiteboard.jsx:149-175 hydrates and autosaves snapshots | Snapshots omit tombstones; stale deletes/clears can violate convergence. Save errors are hidden, final-save acknowledgment absent, and room changes need lifecycle isolation. |
| Notifications | notify.js persists rows then sends socket/push; App.jsx:414-445 polls the latest10 every15seconds | No paginated catch-up here: more than10 missed arrivals can lose flashes, though inbox rows persist. Push/account lifecycle and initial-empty-feed suppression remain concerns. |

## Design and implementation status
- v3designs02-05 exist as drafts. Corrected03/04 independent re-review remains owed; designs06-10 are not materialized.
-45quote candidates are documented, but zero are approved for display because final editorial and distribution-rights approval remain pending.
- FP2 authority/policy factories fail closed without real adapters, and their router is unmounted. Do not treat the foundation as completed cross-feature infrastructure.
- Backend worker scheduling and many multi-record effects have retry, concurrency and recovery limits. The separate Cloudflare worker is an HTTP failover proxy, not the Node scheduler, and does not proxy WebSockets.
- Current native configuration points at a remote web origin. A local source build is not proof of the installed APK's behavior.
- Historical fixture captures are synthetic and often software-rendered. They do not establish real users, traction, hardware performance or complete accessibility acceptance.

## Index evidence
The manifest records2,644files:972eligible digests and1,672individual exclusions, plus51explicit excluded-subtree records that are not per-file enumerations. Read scopes remain visible in coverage.ndjson:837full,29key-section,93title/status,8bounded-history and5header reads.
Ten reproducibly random source comparisons found no material mismatch in that sample. Forty-two line-count convention discrepancies were corrected; these were metadata corrections, not application fixes. Eleven isolated index-helper tests passed after retained failures; application and parked recovery-tool suites were NOT_RUN.
All per-file risks, hypotheses and test limitations remain linked through OPEN_WORK.md and source-observations.ndjson. Index completion does not waive any of them or imply zero bugs.
CP-IDX approval opens only the specified research/design continuation. CP-W0 and the new CP-C remain separate, unapproved implementation gates; M4 needs TOOLING OK.
