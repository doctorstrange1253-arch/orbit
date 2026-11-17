# FILE_REGISTRY

One literal project-relative path per row. Reconstructed entries establish location, not feature completion. Test results and approvals belong in TASKS.md and STATE.md. Generated scratch, quarantine and dependency files are excluded from this registry.

| Path | Purpose | Task | Status | Date |
|---|---|---|---|---|
| .agent/MISSION.md | Versioned mission, preserved decisions, boundaries and file map | IW-C-MLOCK |18822bytes/112lines/SHA256f7e32f2d2587e6a540e5460b345c01770744069530718181a34585b49697dc2f;v1.4 measured after verified dead8396/current2928 recovery;no gate approval | 2026-11-12 |
| scripts/agent/supervisor-regressions.test.js | Isolated runtime reproductions for actual source-review claims | IW-C-MLOCK |5884bytes/94lines/SHA256e8aa8f0f1a3dd6527a07ba73c6fb65885404ba359677cc782afc5fea8761bf6d;8originalcases RED then individuallyGREEN,not combinedacceptance;legacycompatibility/2processsettlementclassespending | 2026-11-12 |
| scripts/agent/recovery-hooks.js | Local lifecycle reminders, bounded snapshots and normal-turn journal records | IW-C-MLOCK |7717bytes/100lines/SHA256e0f247e3cd5b924822b013b65c5f02521d6ffadf866fcf22ca2dbf856f35db1b;syntaxexit0 and8synthetic-event tests pass;NOT_INSTALLED,host/race acceptance pending | 2026-11-12 |
| scripts/agent/recovery-hooks.test.js | Isolated local hook payload, ownership, reminder and lifecycle regression tests | IW-C-MLOCK |5506bytes/82lines/SHA2562980b5ca007b2f608f5c0cb194cd3af4880f5ac87cc4d9fbd8a1aa1154d6291c;baseline1pass/7fail then8pass/0fail,exit0/7.4s;no real model or host hook invocation | 2026-11-12 |
| .agent/RUN_JOURNAL.md | Append-only write-ahead run ledger from mission bootstrap | IW-C-MLOCK |667bytes/5lines at creation;step1START,older turns not fabricated as crashes | 2026-11-12 |
| .agent/RUNLOCK | Exclusive canonical writer ownership | IW-C-MLOCK |324bytes/9lines/SHA25632f2012a60c90ac6051d564d28af340758e89ec934696182b398c76e675379e4;writerPID2928/start13:31:35.3772150Z/sessionee8b5ae4-93d5-4acd-b6a5-57001f402a3e acquired14:03UTC after8396confirmeddead/originalbytes archived;no kill or live takeover | 2026-11-12 |
| .agent/CAPABILITIES.md | Dated capability self-tests and explicit limitations | IW-C-MLOCK |File/chunk/browser/softwareWebGL/public-fetch/alternate-search/MCP/isolated-install tests verified;native search failed,supervisor/hooks pending;metadata evolves | 2026-11-12 |
| .agent/RESUME_PROMPT.md | Short gate-preserving crash/restart instructions | IW-C-MLOCK |2507bytes/20lines/SHA25672891e42d18fa9ce5f73c5b4e05c2c5a25f4768d261ed3c0474de6e04863e90e;created/length/first-lines verified,no automatic relaunch implied | 2026-11-12 |
| scripts/agent/supervisor.test.js | Real subprocess regression cases for safe restartable command execution | IW-C-MLOCK |11687bytes/197lines/SHA2561b272b773c738ccea091e4fe8cea16b043441d07b2801e5959c5b326676316ed;20priorcases plus3stdin/orderingcases;2stdinRED then3scopedGREEN,fullupdatedsuite pending | 2026-11-12 |
| scripts/agent/relaunch.js | Conditional exact-session CLI recovery coordinator | IW-C-MLOCK |12770bytes/129lines/SHA2567a807e2b34999df6ccaac348f4ca20e714479ce428a9356bfd1e83ebcec392d6;syntaxexit0/18syntheticchildtestsGREEN;CLIentry/lifecycleedgeproof still pending,no live model call | 2026-11-12 |
| scripts/agent/relaunch.test.js | Local child,gate,ownership,permission and persistent-circuit tests | IW-C-MLOCK |9790bytes/152lines/SHA25699ecffc7aed985c4ab16d552bb762a299a6e7b5312e69f1d65eb771d457883b4;18behavioralRED then18GREEN/exit0/68.3s,isolatedfixtures only | 2026-11-12 |
| scripts/agent/supervisor.js | Gate-aware sequential command and retry coordinator | IW-C-MLOCK |10628bytes/141lines/SHA2565934047c16b9d887305ffcfa25fa6df2043e06d7556324b2980c832f97d22f1f;8reviewcases individuallyGREEN aftercorrections;legacy receipt compatibility/currentcombinedsuite/independentreviewpending | 2026-11-12 |
| scripts/agent/supervisor-state.js | Durable journal,heartbeat and verified lock ownership | IW-C-MLOCK |7725bytes/132lines/SHA25695fae774c977879ef17630724a11304bdbe2d9fc04dcf3008ab65d9f991861ba;process/concurrency/recovery cases within20GREEN;review pending | 2026-11-12 |
| scripts/agent/supervisor-process.js | Bounded argv subprocesses,stdin,stream logs and timeout handling | IW-C-MLOCK |5984bytes/82lines/SHA256bc3600830f8d3dabb29a7849d212eb07b54a62e8377978e09614d553b27587b2;stdin/redaction scopedGREEN;descendant/asynclog-I/O safety/currentcombinedsuitepending,no activation | 2026-11-12 |
| docs/design/v3/05-quotes-pool.md | Forty-five source-traceable candidate quotes, proposed editorial holds and future data-file contract | IW-C |29799bytes/201lines/SHA256859976b7f12e6cbbe0d2668cd292f8d5bbfa606a11722e5ea48ce711775f7e6d;45exact candidates/15each,7source joins/11known source URLs/7local links/2bounds/16NOT_RUN cases/character guard verified; bounded builder review found no new material gaps;20A/25H proposals and all rights/final editorial PENDING, no app data | 2026-11-10 |
| docs/design/v3/04-transition-spec.md | Proposed truthful Cinematic/Fast lifecycle, finite thoughts, authorized restoration and retry/history contract | IW-C |31643bytes/222lines/SHA256b1fc4529463fe51b60e58c69ef991ce434ffc3bba3db33fb0665078d40809673; six workflow-review gaps corrected as main proposals;14local links/8line bounds/1anchor/character guard/32unique NOT_RUN cases and A/B arithmetic pass exit0; timing/natural-entry/rights unapproved, no independent corrected re-review | 2026-11-10 |
| docs/design/v3/03-identity-switcher-spec.md | Proposed separate desktop/mobile identity chooser, access states and source-work guard contract | IW-C |28458bytes/186lines/SHA256255e588a6a159d830b9b794051d45271cf374c18e7da5904f318d5e8eb4e7a02; fresh builder review received, six gaps corrected by main as proposals;22local links/18line bounds/2anchors/character guard/26unique NOT_RUN cases pass; corrected draft not independently re-reviewed or approved | 2026-11-10 |
| docs/design/v3/02-world-bible.md | Selected Artifacts+Projection world grammar, shared-token proposals and stable Mentor studio boundary | IW-C |26595bytes/226lines/SHA2564aaf6ea2f8553b138019c9575340d7e09d78f891c5444f87ce38f4be1efe8104; saved draft unchanged and opening verified; interrupted registration recovered; C design draft, not final approval or rendered acceptance | 2026-11-10 |
| docs/progress/checkpoints/v3/CP-B.md | Identity Worlds research gate with source/quote/review limits and C-only approval choice | IW-B |10395bytes/75lines/SHA2562fae75d2806c8a0ff7ddcffd73842e4301d47ed2fa14b434cd10468e697e01de; existence/metadata/local links/counts/characters/gates verified; included in final17authored-file/505literal-path check; posted, genuine APPROVED2026-11-09 opens C documents only, not design/code approval | 2026-11-09 |
| docs/design/v3/research-quote-candidates.md | B4 quote verification methods and45retained-text checked identity candidates | IW-B |18777bytes/119lines/SHA2567ebbc2f59b7e7dac98c4e99662535344ce947853f68e18beb7e5aa2dbfdb1d02;6method sources/15per identity/45unique rows/20packet-source hashes plus datedQIcase body checked; minor Rousseau-influence note verified/corrected,9clauses/rights/diversity/edition limits explicit; not C-approved pool | 2026-11-09 |
| docs/design/v3/research-worlds-competition.md | B2 original-world representation and B5 accessible/non-demotivating competition evidence | IW-B |12857bytes/89lines/SHA256ab18ebd777bbc499a92f08b2522669e0ac2a7c8149faf8ea4d9dcdcd268c6e34;B2=8/B5=6sources,12distinct200/2excluded403; hashes/excerpts/geometry text/PDF sample checked, no design or efficacy acceptance | 2026-11-09 |
| docs/design/v3/research-infinite-backgrounds.md | B3 procedural/streaming/pooling/CSS-WebGL/memory research and limits | IW-B |13530bytes/96lines/SHA256305bfe59e358c2ff41510592af835ba3daead29c8e5c891bbc03fc20d136549c;18capture hashes checked,15substantive sources and13selected excerpts verified; no scene implementation/performance acceptance | 2026-11-09 |
| docs/design/v3/research-transitions-accessibility.md | B1/B6 transition-loading and accessible-transition source evidence | IW-B |13506bytes/98lines/SHA25672c3054c19e7b21c4df993daa02a944c6aa7124d7cdbd6103b5e52cf7b996091;15body hashes/snippets independently checked, B1=8/B6=7sources; no implementation/UX/device/WCAG acceptance | 2026-11-09 |
| docs/design/v3/research-log.md | Six-topic B source/query/failure/coverage and preservation ledger | IW-B |33231bytes/240lines/SHA2563fca5412160e29d68359784c8ec8d546057564c2200a71cf67065da038e1b3f4;48counted source URLs/50mappings plus quote texts/support; real bounded reviews/limits recorded; CP-B waiting link present | 2026-11-09 |
| docs/progress/checkpoints/v3/CP-A-r2.md | Revised A evidence gate retaining runtime failures, preservation and B-only approval choice | IW-A2 |9152bytes/70lines/SHA2564d8dda712dcae03b540f63c81d1780ccfbf19911151316f84caece0e00bbe936; verified/registered, included in331local-link/499literal-path/17authored-file checks; user's typed APPROVE2026-11-09 opens B only, not design acceptance | 2026-11-09 |
| scripts/agent/identity-ui-fixtures.json | Explicit synthetic account/course/peer/league/plan payload inputs for isolated UI captures | IW-A2 |8118bytes/105lines/SHA256263d595849453bc54eeca0d8756fb6c6cc830e07a07c2e31b5f288d76e36810c; offered/wanted labels corrected, synthetic only | 2026-11-09 |
| scripts/agent/identity-ui-capture.mjs | Safe actual frontend fixture/capture/axe and bounded selectable runtime evidence | IW-A2 |58954bytes/597lines/SHA256cda3a298807ff388b84caa075af1276db5c42d3b4035e508c07928c3ab03d06d;62capture/full71tool GREEN/syntax after62/55/7RED; actual targeted browser consumer verified with retained failures,not UI acceptance | 2026-11-09 |
| scripts/agent/identity-ui-capture.test.mjs | Static/network/fixture/selection/budget/transition and narrow readiness contracts | IW-A2 |18351bytes/326lines/SHA25652554990506b5e240c25abed79af9f123827eca1fa19e03950d28d81eeab0cd6;62capture/full71tool GREEN; tests start no browser | 2026-11-09 |
| docs/design/v3/installed-skills-and-capture-tooling.md | Official skill provenance and actual scoped capture-tool execution evidence | IW-A2 |13892bytes/90lines/SHA25650f49d2a10d82529095f1fb3b1b63c69211bd05334b04a627e1b1db8ee6dcfb4; installation/invocation/71tool tests/211PNG ledger/limits reconciled; character/link checks pass | 2026-11-09 |
| docs/progress/checkpoints/v3/CP-A.md | A source-audit/reuse gate with mandatory critique/capture blocks and B approval request | IW-A |8355bytes/59lines/13local links verified; exact gate/ending/character checks pass; source round only, no full visual acceptance/source/setup approval | 2026-11-08 |
| docs/design/v3/01-ui-audit.md | Original77-route/48-root/17-observation source inventory with dated A2 evidence reconciliation | IW-A2 |57017bytes/322lines/SHA2564250ca5c61ff523875d3f20b43ba8dc60b17a0956e9264937b62f76f804dae3d; historical blocked provenance preserved; current visual report linked; local/source-line/character checks pass | 2026-11-09 |
| docs/progress/checkpoints/CP-R.md | R recovery gate, fresh evidence/limits, snapshot consent and A approval request | IW-R |8330bytes/70lines/16local targets verified; exact waiting/approval wording and authored-character guard pass; no later phase or source changes | 2026-11-08 |
| docs/progress/identity-worlds-recovery.md | R preservation/dirty-work inventory, fresh scoped baselines,10-line status and unperformed snapshot proposal | IW-R |19348bytes/142lines verified;67local targets/source-line bounds and ten status lines pass; no prohibited authored characters; later phases not started | 2026-11-08 |
| docs/progress/identity-worlds-skills-routing.md | Current104 local-skill inventory, mandatory UI gaps and gated Yes/No routing | IW-R |14281bytes/133lines verified;57top-level rows exactly match home files;47nested/13runtime-only routes; no prohibited authored characters or installation | 2026-11-08 |
| shared/fp2/contracts.d.ts | Canonical transport and separate server-only context/Tx declarations | FP2-I-C01 | PAUSED;4508bytes/111lines measured in IW-R; fresh124/124 pure baseline, compiler/live C02 NOT_RUN | 2026-11-08 |
| BackEnd/routes/fp2Routes.js | Pure context/raw command handlers and unmounted gated Express router | FP2-I-C01 | PAUSED;4962bytes/124lines measured in IW-R; two historical review fixes, fresh124/124 pure baseline/syntax exit0; unmounted/live C02 NOT_RUN | 2026-11-08 |
| BackEnd/services/fp2/authority.js | Private branded current-session/identity/capability and fence boundary | FP2-I-C01 | PAUSED;7461bytes/167lines measured in IW-R; fresh124/124 pure baseline/syntax exit0; real source/Tx proof absent | 2026-11-08 |
| BackEnd/services/fp2/policy.js | Approved bundle/scope/time/evidence validation with unavailable default | FP2-I-C01 | PAUSED;2501bytes/62lines measured in IW-R; fresh124/124 pure baseline/syntax exit0; real policy source unconfigured | 2026-11-08 |
| BackEnd/tests/fp2Authority.test.js | Real policy/current actor/fence and pure transport handler tests | FP2-I-C01 | PAUSED;19978bytes/414lines measured in IW-R;37tests within fresh124/124/two-suite baseline; syntax exit0, no live adapter proof | 2026-11-08 |
| shared/fp2/schema.js | Strict JSON/raw duplicate-aware envelope and closed core DTO registries | FP2-I-C01 | PAUSED;12801bytes/347lines measured in IW-R; fresh124/124 pure baseline/syntax exit0; frontend binding/production integration NOT_RUN | 2026-11-08 |
| BackEnd/tests/fp2Contracts.test.js | Real envelope/raw JSON/core registry contract tests | FP2-I-C01 | PAUSED;12910bytes/315lines measured in IW-R;87tests within fresh124/124/two-suite baseline; syntax exit0 | 2026-11-08 |
| .gitignore | Repository exclusions | GIT-SYNC-20261117 | Ignore actual credentials, runtime locks, installed Python/exporter code and tool profiles/cache; retain examples, authored tools and dependency manifests | 2026-11-17 |
| CLAUDE.md | Identity Worlds C approval, confirmed mapping and protected setup boundaries | IW-C | C documents/discussion OPEN; Student Multiverse/Mentor Dimensions/Peer Space confirmed; new CP-C still gates implementation | 2026-11-09 |
| .agent/STATE.md | User-requested C sleep-pause resume and preserved work | IW-C |RUNNING WITH BLOCKERS;3same-run resumes confirmed,2/6/1returns retained;gate unchanged | 2026-11-12 |
| .agent/HANDOFF.md | Current resumed task IDs and boundaries | IW-C |3actual task/run IDs and launch-only starts recorded;saved scripts/hashes preserved,no completed replay | 2026-11-12 |
| .agent/PATHS.md | Exact C destinations and isolated naming evidence convention | IW-C |Canonical07 unchanged; unique scratch research/schema/source outputs ledgered, no stock workbench or app files | 2026-11-11 |
| .agent/FILE_REGISTRY.md | Literal path and current resume metadata | IW-C |02-05metadata preserved;sleep history/current resume retained;scratch excluded | 2026-11-12 |
| .agent/TASKS.md | Running C work and unresolved boundaries | IW-C |3resumes confirmed;2/6/1saved returns;recovery/integration/reviews/closure unfinished | 2026-11-12 |
| .agent/DECISIONS.md | Exact resume request and unchanged gates | IW-C |Resume same3saved scopes only;actual launches recorded,no CP-C approval | 2026-11-12 |
| .agent/ERRORS.md | Actual tool and output limitations | IW-C |HistoricalE141checker correction/E139-E140limits retained;no new failure or transport repair inferred | 2026-11-12 |
| .agent/ENVIRONMENT.md | Current resume checks and retained workflow evidence | IW-C |3resumes/unchanged scripts/2-6-1returns verified at launch;no environment change | 2026-11-12 |
| .agent/SESSION_LOG.md | Append-only actual C progress and resume | IW-C |Exact resume/pre-launch checks/3successful resumes/launch metadata appended;results pending | 2026-11-12 |
| docs/plan/v2/research-course-tiers-subject-routing.md | F course-class/payout/subject source and gap ledger | FP2-F-TIER |72939bytes/456lines;57source-record IDs/88 classified report claims, PARTIAL evidence; no policy approval | 2026-11-08 |
| docs/plan/v2/course-tiers-subject-routing-proposal.md | Partially approved business direction plus proposed monthly price/quote gates | FP2-F-PRICE |72525bytes/460lines; section15 Core599/Premium1199 targets/51local refs verified; prices/Premium production/basis/cost/CP-F still open | 2026-11-08 |
| scripts/agent/probe-env.js | Environment probe | R0 | reconstructed; implementation not reverified | 2026-11-05 |
| scripts/agent/run.js | Command runner with separate streams and per-run logs | F7a | seven regression tests passed | 2026-11-05 |
| scripts/agent/run.test.js | Runner regression tests | F7a | passed | 2026-11-05 |
| scripts/agent/find-file.js | Filesystem search fallback | R3 | reconstructed | 2026-11-05 |
| scripts/agent/where.js | Registry and file lookup | R3 | reconstructed | 2026-11-05 |
| scripts/agent/sync-registry.js | Registry consistency checker | F7a | checks being tightened | 2026-11-05 |
| scripts/agent/check-no-emoji.js | Authored-text Unicode guard | F7a | scanner tests pass; source violations remain | 2026-11-05 |
| scripts/agent/check-no-emoji.test.js | Guard scope and Unicode regression tests | F7a | passed | 2026-11-05 |
| scripts/agent/verify.js | Package-pinned verification pipeline | F7a | full rerun pending | 2026-11-05 |
| BackEnd/.env.example | Example backend configuration | M1 | pre-existing work preserved | 2026-11-05 |
| BackEnd/package.json | Backend scripts and dependencies | M1-M3 | pre-existing work preserved | 2026-11-05 |
| BackEnd/package-lock.json | Backend dependency lock | M1-M3 | pre-existing work preserved | 2026-11-05 |
| BackEnd/server.js | API startup and route mounts | M1-M3 | pre-existing work preserved | 2026-11-05 |
| BackEnd/controllers/sessionsController.js | Sessions and payment handling | M1-M2 | pre-existing work preserved | 2026-11-05 |
| BackEnd/routes/courseRoutes.js | Course/request routes | M2 | pre-existing work preserved | 2026-11-05 |
| BackEnd/services/billingPlans.js | Billing tier calculations | M2 | pre-existing work preserved | 2026-11-05 |
| BackEnd/tests/billingPlans.test.js | Billing regression tests | M2 | pre-existing work preserved | 2026-11-05 |
| BackEnd/models/Achievement.js | Achievement schema, semantic icon default | F7e | planned source-only change | 2026-11-05 |
| BackEnd/services/gameologyService.js | Catalog defaults; XP business logic unchanged | F7e | planned source-only change | 2026-11-05 |
| BackEnd/scripts/seedAchievements.js | Semantic icon catalog; not run against DB | F7e | planned source-only change | 2026-11-05 |
| BackEnd/tests/gameologyService.test.js | Achievement and reward contract regressions | F7e | red run next | 2026-11-05 |
| FrontEnd/src/services/gameology.js | Normalize achievement envelope for page consumers | F7e | page regressions pass | 2026-11-05 |
| FrontEnd/src/admin/pages/Audit.jsx | Readable success/failure labels | F7e | presentation-only | 2026-11-05 |
| FrontEnd/src/admin/pages/Ops.jsx | Readable rating column heading | F7e | presentation-only | 2026-11-05 |
| FrontEnd/src/components/courses/QuizCard.jsx | Plain perfect-quiz status | F7e | presentation-only | 2026-11-05 |
| FrontEnd/src/components/modals/RatingModal.jsx | Rating input readiness copy | F7e | presentation-only | 2026-11-05 |
| FrontEnd/src/components/sessions/RateSessionButton.jsx | Explicit numeric rating action | F7e | presentation-only | 2026-11-05 |
| FrontEnd/src/components/layout/OrbitSigil.jsx | Currency amount without text-character decoration | F7e | amount logic unchanged | 2026-11-05 |
| FrontEnd/src/components/mentor/MentorApplicationForm.jsx | Plain rating threshold copy | F7e | payout numbers unchanged | 2026-11-05 |
| FrontEnd/src/pages/MentorHub.jsx | Plain rating threshold copy | F7e | payout numbers unchanged | 2026-11-05 |
| FrontEnd/src/pages/Profile.jsx | SVG rating stars and accessible score label | F7e | rating values unchanged | 2026-11-05 |
| FrontEnd/src/pages/PublicProfile.jsx | Numeric rating chart label | F7e | rating values unchanged | 2026-11-05 |
| FrontEnd/src/pages/Leaderboard.jsx | Vector location indicators | F7e | presentation-only | 2026-11-05 |
| FrontEnd/src/pages/mentor/CourseBuilder.jsx | Upload state copy | F7e | upload behavior unchanged | 2026-11-05 |
| FrontEnd/src/soul/economy/MentorInviteModal.jsx | Numeric average rating text | F7e | invite behavior unchanged | 2026-11-05 |
| FrontEnd/src/soul/economy/MentorInviteModal.test.jsx | Rating-copy assertion with unchanged interaction tests | F7e | rerun pending | 2026-11-05 |
| FrontEnd/src/soul/editorial/SkillsPolaroid.jsx | Numeric rating captions | F7e | presentation-only | 2026-11-05 |
| FrontEnd/src/pages/Gameology.jsx | SVG achievement and activity presentation | F7e | page regressions pass | 2026-11-05 |
| FrontEnd/src/components/cosmic/xpEventLabels.js | Activity labels and component lookup | F7e | SVG regressions pass | 2026-11-05 |
| FrontEnd/src/hooks/useXpToast.js | Vector icons for level and achievement notifications | F7e | presentation-only change | 2026-11-05 |
| BackEnd/middleware/identity.js | Identity middleware | M1 | reconstructed; acceptance unverified | 2026-11-05 |
| BackEnd/models/WebhookEvent.js | Webhook event ledger | M1 | reconstructed; acceptance unverified | 2026-11-05 |
| BackEnd/models/Quiz.js | AI question schema | M3 | reconstructed; acceptance unverified | 2026-11-05 |
| BackEnd/models/CourseRequest.js | Course request schema | M2 | reconstructed; acceptance unverified | 2026-11-05 |
| BackEnd/services/ollamaService.js | Local model quiz integration | M3 | reconstructed; acceptance unverified | 2026-11-05 |
| BackEnd/controllers/aiQuizController.js | Quiz generation and review endpoints | M3 | reconstructed; acceptance unverified | 2026-11-05 |
| BackEnd/controllers/courseRequestController.js | Course request handling | M2 | reconstructed; acceptance unverified | 2026-11-05 |
| BackEnd/routes/aiQuizRoutes.js | AI quiz routes | M3 | reconstructed; acceptance unverified | 2026-11-05 |
| BackEnd/tests/courseRequest.test.js | Course request tests | M2 | reconstructed | 2026-11-05 |
| BackEnd/tests/identityMiddleware.test.js | Identity middleware tests | M1 | reconstructed | 2026-11-05 |
| FrontEnd/package.json | Frontend scripts and dependencies | P3 | pre-existing uncommitted installs preserved | 2026-11-05 |
| FrontEnd/package-lock.json | Frontend dependency lock | P3 | pre-existing uncommitted installs preserved | 2026-11-05 |
| FrontEnd/playwright.config.js | Browser test configuration | F7a | Node import lint fixed | 2026-11-05 |
| FrontEnd/vite.config.js | Build and unit-test configuration | F3 | existing | 2026-11-05 |
| FrontEnd/src/App.jsx | Application routes and lazy imports | F3 | Lab production exclusion under review | 2026-11-05 |
| FrontEnd/src/pages/CourseLearn.jsx | Student lesson page | F7b | journey integration under review | 2026-11-05 |
| FrontEnd/src/pages/mentor/LessonEdit.jsx | Mentor lesson editor | M3 | pre-existing work preserved | 2026-11-05 |
| FrontEnd/src/components/layout/Navbar.jsx | Navigation | M3 | pre-existing work preserved | 2026-11-05 |
| FrontEnd/src/components/cosmic/lookDevShell.jsx | Earlier unused Lab scaffold | scaffold | lint failures; not replaced or deleted | 2026-11-05 |
| FrontEnd/src/cosmic/AchievementIcon.jsx | Whitelisted bespoke SVG resolver with legacy-key fallback | F7e | page regressions pass; 722a7ab | 2026-11-05 |
| FrontEnd/src/cosmic/AICourseQuizPanel.jsx | Mentor AI review panel | M3 | pre-existing work preserved | 2026-11-05 |
| FrontEnd/src/cosmic/CourseSpaceJourney3D.jsx | Earlier course-map prototype | M3 | retained; tests reference it | 2026-11-05 |
| FrontEnd/src/cosmic/CourseSpaceJourneyWorld.jsx | Current journey scene and fallback | F1-F7 | behavioral review in progress | 2026-11-05 |
| FrontEnd/src/cosmic/PlanetGenerator.jsx | Seeded layout and palettes | F4 | numeric bounds under review | 2026-11-05 |
| FrontEnd/src/cosmic/PlanetSurface.jsx | Planet mesh and shader uniforms | F4 | rendering review in progress | 2026-11-05 |
| FrontEnd/src/cosmic/StarfieldBackdrop.jsx | Procedural star points | F2 | rendering review in progress | 2026-11-05 |
| FrontEnd/src/cosmic/twinkleBackdrop.jsx | Nebula background | F2 | rendering review in progress | 2026-11-05 |
| FrontEnd/src/cosmic/LookDevLab.jsx | Asset workbench | F3-F7 | accessibility review in progress | 2026-11-05 |
| FrontEnd/src/cosmic/Shuttle.jsx | Shuttle mesh and flight state | F5 | behavioral review in progress | 2026-11-05 |
| FrontEnd/src/cosmic/Station.jsx | Checkpoint/station/boss visuals | F6 | implemented; acceptance unverified | 2026-11-05 |
| FrontEnd/src/cosmic/travel.js | Shared layout and travel math | F5-F6 | existing | 2026-11-05 |
| FrontEnd/src/cosmic/shaders/noise.glsl | Noise functions | F2 | existing | 2026-11-05 |
| FrontEnd/src/cosmic/shaders/starfield.vert.glsl | Star vertex shader | F2 | existing | 2026-11-05 |
| FrontEnd/src/cosmic/shaders/starfield.frag.glsl | Star fragment shader | F2 | existing | 2026-11-05 |
| FrontEnd/src/cosmic/shaders/milkyway.frag.glsl | Nebula fragment shader | F2 | existing | 2026-11-05 |
| FrontEnd/src/cosmic/shaders/planet.vert.glsl | Planet vertex shader | F4 | existing | 2026-11-05 |
| FrontEnd/src/cosmic/shaders/planet.frag.glsl | Planet fragment shader | F4 | existing | 2026-11-05 |
| FrontEnd/src/hooks/useQualityTier.js | Renderer tier detection | F1 | fallback under review | 2026-11-05 |
| FrontEnd/src/hooks/useLazyScene.js | Stable initial lazy component, no JSX in .js | F7d | regression tested; 9e5c34e | 2026-11-05 |
| FrontEnd/src/hooks/useContextLossWarning.js | Earlier context-warning helper | scaffold | reconstructed; not GPU recovery | 2026-11-05 |
| FrontEnd/src/services/aiQuiz.js | Quiz service client | M3 | pre-existing work preserved | 2026-11-05 |
| FrontEnd/src/utils/emojiGuard.js | Valid runtime detection and React-tree inspection | F7d | regression tested; 9e5c34e | 2026-11-05 |
| FrontEnd/tests/CourseSpaceJourney3D.test.jsx | Earlier prototype smoke tests | M3 | current unit suite passes | 2026-11-05 |
| FrontEnd/tests/CourseSpaceJourneyWorld.test.jsx | Scene shell tests | F1-F6 | regression expansion pending | 2026-11-05 |
| FrontEnd/tests/cosmic.test.jsx | Planet layout tests | F4 | current unit suite passes | 2026-11-05 |
| FrontEnd/tests/cosmic-components.test.jsx | Cosmic component tests | F0 | current unit suite passes | 2026-11-05 |
| FrontEnd/tests/LookDevLab.test.jsx | Lab component tests | F3 | current unit suite passes | 2026-11-05 |
| FrontEnd/tests/PlanetSurface.test.jsx | Planet geometry tests | F4 | current unit suite passes | 2026-11-05 |
| FrontEnd/tests/Shuttle.test.jsx | Shuttle tests | F5 | behavioral coverage under review | 2026-11-05 |
| FrontEnd/tests/Station.test.jsx | Station tests | F6 | current unit suite passes | 2026-11-05 |
| docs/progress/screenshots/rank-export-planet.png | Actual SVG-backed rank PNG, 1200 by 675 | F7e | browser export verified | 2026-11-05 |
| docs/progress/screenshots/rank-export-pulsar.png | Actual SVG-backed rank PNG, 1200 by 675 | F7e | browser export verified | 2026-11-05 |
| docs/progress/screenshots/rank-export-quasar.png | Actual SVG-backed rank PNG, 1200 by 675 | F7e | browser export verified | 2026-11-05 |
| BackEnd/scripts/seedAdmin.js | Plain administrative log prefix | F7e | script not executed | 2026-11-05 |
| BackEnd/scripts/seedOrbitDemo.js | Plain seed log prefix | F7e | script not executed | 2026-11-05 |
| BackEnd/scripts/seedStore.js | Plain seed log prefix | F7e | script not executed | 2026-11-05 |
| BackEnd/services/crossSoulService.js | Numeric rating in invite copy | F7e | eligibility unchanged | 2026-11-05 |
| BackEnd/services/pactService.js | Comment pictograph removal | F7e | scoring unchanged | 2026-11-05 |
| BackEnd/tests/pactService.test.js | Comment pictograph removal | F7e | all assertions unchanged | 2026-11-05 |
| BackEnd/utils/contentModeration.js | Plain warning prefix | F7e | moderation policy unchanged | 2026-11-05 |
| BackEnd/workers/orbitWorker.js | Plain notification titles | F7e | scheduling and rewards unchanged | 2026-11-05 |
| FrontEnd/src/components/gameEngine/AttentionArc.jsx | Comment pictograph removal | F7e | behavior unchanged | 2026-11-05 |
| FrontEnd/src/components/gameEngine/CoachQuiz.jsx | Comment pictograph removal | F7e | behavior unchanged | 2026-11-05 |
| FrontEnd/src/soul/signalFlare/FlareLaunch.jsx | Comment pictograph removal | F7e | behavior unchanged | 2026-11-05 |
| FrontEnd/src/whiteboard/Whiteboard.jsx | SVG reaction presets and legacy display compatibility | F7e | interaction regressions pass | 2026-11-05 |
| FrontEnd/src/whiteboard/Whiteboard.css | Reaction vector alignment and colors | F7e | browser layout review pending | 2026-11-05 |
| FrontEnd/src/whiteboard/__tests__/Whiteboard.dom.test.jsx | Real board reaction and wire-contract regressions | F7e | five tests pass | 2026-11-05 |
| marketing/orbit-teaser-reveal.html | Vector cards and readable audio/recording labels | F7e | presentation-only | 2026-11-05 |
| FrontEnd/tests/e2e/share-cards.spec.js | Actual SVG-to-PNG rank export verification | F7e | three browser tests pass | 2026-11-05 |
| FrontEnd/tests/shareCards.test.jsx | Rank SVG export and numeric session-rating regressions | F7e | passed | 2026-11-05 |
| FrontEnd/src/cosmic/shareCard.js | Rank card artwork and sharing helpers | F7e | emoji-dependent export being replaced | 2026-11-05 |
| FrontEnd/src/cosmic/sessionCard.js | Numeric rating in session PNG | F7e | presentation-only | 2026-11-05 |
| FrontEnd/src/cosmic/tiers.js | Canonical rank metadata; names/order unchanged | F7e | remove redundant emoji fields | 2026-11-05 |
| FrontEnd/src/cosmic/LiftoffOverlay.jsx | Await decoded rank artwork before sharing | F7e | source change pending | 2026-11-05 |
| FrontEnd/tests/Gameology.test.jsx | Achievement API and activity-icon rendering regressions | F7e | passed | 2026-11-05 |
| FrontEnd/tests/emojiGuard.test.jsx | Runtime guard detection and React-tree traversal regressions | F7d | passed | 2026-11-05 |
| FrontEnd/tests/useLazyScene.test.jsx | Lazy-scene state and loader-lifecycle regressions | F7d | passed | 2026-11-05 |
| FrontEnd/tests/travel.test.jsx | Travel math tests | F5 | current unit suite passes | 2026-11-05 |
| FrontEnd/tests/e2e/cosmic.captures.spec.js | Login smoke captures, not course-flow coverage | F7a | misleading test titles corrected | 2026-11-05 |
| FrontEnd/tests/e2e/lookdev.spec.js | Star Lab screenshot test | F3 | historical capture | 2026-11-05 |
| FrontEnd/tests/e2e/planet-lighting.spec.js | Real-WebGL camera-invariant diffuse lighting regression | F7b | passed after red reproduction; f82e029 | 2026-11-05 |
| FrontEnd/tests/e2e/planet.spec.js | Planet palette screenshot tests | F4 | historical captures | 2026-11-05 |
| FrontEnd/tests/e2e/shuttle.spec.js | Shuttle Lab screenshot test | F5 | historical capture | 2026-11-05 |
| FrontEnd/tests/e2e/station.spec.js | Station screenshot tests | F6 | historical captures | 2026-11-05 |
| FrontEnd/tests/e2e/a11y-sizes.spec.js | Lab screenshots and partial axe scan | F7 | excludes Leva; full scan not passed | 2026-11-05 |
| docs/plan/00-executive-summary.md | Product vision | plan | historical; unverified claims possible | 2026-11-05 |
| docs/plan/01-skill-routing.md | Earlier skill routing | plan | historical | 2026-11-05 |
| docs/plan/02-identity-system.md | Identity plan | plan | historical | 2026-11-05 |
| docs/plan/03-subscription-architecture.md | Subscription plan | plan | historical | 2026-11-05 |
| docs/plan/04-mentor-economics.md | Mentor economics plan | plan | historical | 2026-11-05 |
| docs/plan/05-course-request-engine.md | Request engine plan | plan | historical | 2026-11-05 |
| docs/plan/06-dynamic-3d-space-ui.md | Journey plan | plan | historical | 2026-11-05 |
| docs/plan/07-ai-quiz-engine.md | Quiz architecture plan | plan | historical | 2026-11-05 |
| docs/plan/08-gamification-system.md | Gamification plan | plan | historical | 2026-11-05 |
| docs/plan/09-extra-features.md | Additional feature plan | plan | historical | 2026-11-05 |
| docs/plan/10-technical-architecture.md | Architecture plan | plan | historical | 2026-11-05 |
| docs/plan/11-implementation-roadmap.md | Four-milestone roadmap | plan | historical; completion requires evidence | 2026-11-05 |
| docs/plan/12-testing-qa-plan.md | Test strategy | plan | historical | 2026-11-05 |
| docs/plan/13-deployment-devops.md | Deployment plan | plan | historical | 2026-11-05 |
| docs/plan/14-risk-register.md | Risk register | plan | historical | 2026-11-05 |
| docs/plan/15-stakeholder-governance.md | Governance plan | plan | historical | 2026-11-05 |
| docs/plan/16-interview-questions.md | Product questions | plan | historical | 2026-11-05 |
| docs/plan/bug-audit.md | Earlier audit | plan | historical | 2026-11-05 |
| docs/plan/research-log.md | Earlier research notes | plan | historical; citations need verification | 2026-11-05 |
| docs/plan/research-plan.md | Earlier research plan | plan | historical | 2026-11-05 |
| docs/plan/thinking.md | Earlier planning notes | plan | historical | 2026-11-05 |
| docs/plan/visual-overview.md | Earlier visual overview | plan | historical | 2026-11-05 |
| docs/design/00-art-direction.md | Art direction | P5 | approved direction; acceptance pending | 2026-11-05 |
| docs/design/01-design-tokens.md | Token specification | P5 | approved direction; acceptance pending | 2026-11-05 |
| docs/design/02-icon-and-badge-system.md | Icon specification | P5 | approved direction; acceptance pending | 2026-11-05 |
| docs/design/03-3d-world-spec.md | World specification | P5 | approved direction; acceptance pending | 2026-11-05 |
| docs/design/04-ui-screens-spec.md | Screen specification | P5 | approved direction; acceptance pending | 2026-11-05 |
| docs/design/05-performance-and-quality-tiers.md | Performance targets | P5 | not measured on real devices | 2026-11-05 |
| docs/design/06-design-qa-checklist.md | Design acceptance checks | P5 | incomplete | 2026-11-05 |
| docs/design/07-look-dev-lab-spec.md | Lab specification | P5 | incomplete | 2026-11-05 |
| docs/design/tooling.md | Historical stack and dated cross-phase preflight inventory | IW-A2/PREFLIGHT | Official rg/jq user-scope installs and verified existing tools recorded; runtime cost0bytes; CP-A-r2 wait unchanged | 2026-11-09 |
| docs/design/research-log.md | Research notes | P4 | contains unverified leads | 2026-11-05 |
| docs/progress/TASKS.md | Earlier progress ledger | R0 | superseded by .agent/TASKS.md | 2026-11-05 |
| docs/progress/milestone-ledger.md | Earlier milestone claims | P2 | not current acceptance evidence | 2026-11-05 |
| docs/progress/bug-audit.md | Twelve independently verified F7 follow-up findings | F7 | remediation open | 2026-11-05 |
| docs/progress/recovery-report.md | Earlier recovery report | R5 | historical; corrections in current STATE | 2026-11-05 |
| docs/progress/skills-routing.md | Skill routing inventory | P1 | historical; reread skill before use | 2026-11-05 |
| docs/plan/v2/skills-routing.md | Feature Pack 2 skill inventory, routes, static dependency gaps and phase boundaries | FP2-A | verified 34,838 bytes; 277 lines; all 57 home routes present; no prohibited characters | 2026-11-06 |
| docs/progress/checkpoints/CP-A.md | Skills-routing checkpoint and approval request for read-only Phase B audit | FP2-A | verified 12,982 bytes; 137 lines; exact approval ending; no prohibited characters | 2026-11-06 |
| docs/plan/v2/01-existing-system-audit.md | Feature Pack 2 current-system audit, 14-area inventory and F1-F9 reuse/risk synthesis | FP2-B | verified 38,550 bytes / 220 lines; complete under selected scope, 29 A/U catalog records unresolved | 2026-11-06 |
| docs/plan/v2/01-audit-findings.md | Detailed audit catalog with separate league, currency and whiteboard bugs and explicit verification labels | FP2-B | verified 62,445 bytes / 187 lines; 111 records including 6 aliases, gaps and rejections; no prohibited characters | 2026-11-06 |
| docs/progress/checkpoints/CP-B.md | Existing-system audit checkpoint, verification limits and Phase C approval request | FP2-B | verified 11,736 bytes / 113 lines; links and exact approval ending checked | 2026-11-06 |
| docs/progress/checkpoints/CP-C.md | Research-round checkpoint, evidence debt, decisions and C2 approval request | FP2-C | verified 16,199 bytes / 122 lines; local links/character rules and exact ending checked | 2026-11-07 |
| docs/plan/v2/research-log.md | Historical C ledger with append-only F course-class/subject annex pointer | FP2-F-TIER | C source/claim counts preserved; F two-annex scope/provenance/limits appended, no policy or runtime approval | 2026-11-08 |
| docs/plan/v2/research-source-register.md | Five finalized research reports, source claims and limitations | FP2-C | 76,557 bytes / 290 lines; 88 source records, 94 attributed claims; not 88 independent verified sources | 2026-11-07 |
| docs/plan/v2/research-attempts.md | Complete finalized worker discovery/open logs and failure records | FP2-C | verified 65,164 bytes / 198 lines; 134 attempts from five reports, not all successful | 2026-11-07 |
| docs/plan/v2/research-india-safety.md | C09/C10 regulatory/vendor comparison and primary DPDP text with commencement limits | FP2-C | verified 15,484 bytes / 117 lines; tax, safety operations and full commencement audit unresolved | 2026-11-07 |
| docs/plan/v2/research-art-motion.md | C03/C11 accessible construction, motion/rendering and rights evidence | FP2-C | verified 10,117 bytes / 81 lines; no visual inspection, runtime benchmark or final library/art selection | 2026-11-07 |
| docs/plan/v2/research-creator-evidence.md | Recovered CE source observations, request log and sampling/confirmation limits | FP2-C | verified 8,524 bytes / 73 lines; two source threads, 14 experience observations, no prevalence claim | 2026-11-07 |
| docs/plan/v2/research-pain-points.md | Deduplicated C12 learner/creator qualitative problem index | FP2-C | verified 11,662 bytes / 83 lines; 33 unique codes from 37 raw observations with four explicit merges | 2026-11-07 |
| docs/plan/v2/feature-lab.md | C2 rubric, 25 proposed candidates, five wow, waves, critique and decisions | FP2-C2 | verified 28507 bytes / 200 lines; links/anchors/counts; WAITING_FOR_APPROVAL (CP-C2) | 2026-11-07 |
| docs/plan/v2/feature-ideas.md | Complete raw ideas, 86 seed decisions and SCAMPER | FP2-C2 | verified 40,555 bytes; 96 raw rows; 86 seed decisions; fourteen SCAMPER areas; office engine UNVERIFIED | 2026-11-07 |
| docs/plan/v2/feature-model-recipe.md | Trusted reproducible source/data/model recipe and immediate bookkeeping | FP2-C2 | verified 32,415 bytes / 254 lines; executed isolated Python, generated registered outputs; Office engine UNVERIFIED | 2026-11-07 |
| docs/plan/v2/research-marketplace-economy.md | C01/C02/C04 ranking, notification-study and accounting evidence with gaps | FP2-C | verified 19,801 bytes / 150 lines; finalized sources reconciled; allocation/inflation gaps retained | 2026-11-07 |
| docs/plan/v2/research-media-whiteboard.md | C05/C06 API, licensing, upload, billing and shared-component evidence | FP2-C | verified 17,935 bytes / 123 lines; basic canvas/CRDT licenses read; behavior/terms/performance gaps | 2026-11-07 |
| docs/plan/v2/research-notes-calls.md | C07/C08 finalized editor/license and managed/self-host media evidence | FP2-C | verified 21,043 bytes / 161 lines; currency/contract/timestamp/India limits explicit | 2026-11-07 |
| docs/plan/v2/research-learning-evidence.md | C12 dated review coding, finalized learning-science findings and transfer limits | FP2-C | verified 14,398 bytes / 100 lines; review/science evidence consolidated; no current fault or population-effect claim | 2026-11-07 |
| docs/plan/v2/sources/pib-dpdp-2025/pib-dpdp-rules-2025.pdf | Public PIB source attachment; original URL/integrity retained for research | FP2-C | 302,936 bytes; seven text pages extracted/read; visual figures not inspected; explainer, not operative law | 2026-11-07 |
| docs/plan/v2/sources/notification-bandit-2020/notification-bandit-2020.pdf | Public author-hosted KDD paper; local reference, redistribution not approved | FP2-C | 460,463 bytes; text read, metrics/design scope summarized; no figure/learning-effect claim | 2026-11-07 |
| docs/plan/v2/sources/dpdp-rules-2025/dpdp-rules-2025.pdf | Original MeitY-linked DPDP Rules source attachment | FP2-C | 2,492,944 bytes; English pages 24-41 read; exact current applicability/amendments not certified | 2026-11-07 |
| docs/plan/v2/sources/dpdp-act-2023/dpdp-act-2023.pdf | Original MeitY-linked DPDP Act source attachment | FP2-C | 182,082 bytes; 21 text pages read; enactment distinguished from operative commencement | 2026-11-07 |
| docs/progress/AUDIT_PLAN.md | Audit plan moved from root | R-cleanup | retained | 2026-11-05 |
| docs/progress/AUDIT_REPORT.md | Audit report moved from root | R-cleanup | retained | 2026-11-05 |
| docs/progress/screenshots/login-1280.png | Login screenshot | F3a | capture exists; not course validation | 2026-11-05 |
| docs/progress/screenshots/login-360.png | Login screenshot | F3a | capture exists; not course validation | 2026-11-05 |
| docs/progress/screenshots/lab-360.png | Lab screenshot | F7 | review pending | 2026-11-05 |
| docs/progress/screenshots/lab-768.png | Lab screenshot | F7 | review pending | 2026-11-05 |
| docs/progress/screenshots/lab-1280.png | Lab screenshot | F7 | review pending | 2026-11-05 |
| docs/progress/screenshots/lab-1920.png | Lab screenshot | F7 | review pending | 2026-11-05 |
| docs/design/lab-captures/star-lab-1280.png | Star Lab screenshot | F3 | historical visual evidence only | 2026-11-05 |
| docs/design/lab-captures/planet-terrestrial-1280.png | Terrestrial preset screenshot | F4 | historical visual evidence only | 2026-11-05 |
| docs/design/lab-captures/planet-gas_giant-1280.png | Gas preset screenshot | F4 | distinct archetype behavior not established | 2026-11-05 |
| docs/design/lab-captures/planet-ice_world-1280.png | Ice preset screenshot | F4 | historical visual evidence only | 2026-11-05 |
| docs/design/lab-captures/planet-volcanic-1280.png | Volcanic preset screenshot | F4 | historical visual evidence only | 2026-11-05 |
| docs/design/lab-captures/planet-oceanic-1280.png | Ocean preset screenshot | F4 | historical visual evidence only | 2026-11-05 |
| docs/design/lab-captures/planet-crystalline-1280.png | Crystal preset screenshot | F4 | historical visual evidence only | 2026-11-05 |
| docs/design/lab-captures/planet-desert-1280.png | Desert preset screenshot | F4 | historical visual evidence only | 2026-11-05 |
| docs/design/lab-captures/planet-nebula_station-1280.png | Nebula preset screenshot | F4 | historical visual evidence only | 2026-11-05 |
| docs/design/lab-captures/shuttle-flight-1280.png | Shuttle Lab screenshot | F5 | does not prove live route arrival | 2026-11-05 |
| docs/design/lab-captures/station-checkpoint-1280.png | Checkpoint screenshot | F6 | historical visual evidence only | 2026-11-05 |
| docs/design/lab-captures/station-station-1280.png | Station screenshot | F6 | historical visual evidence only | 2026-11-05 |
| docs/design/lab-captures/station-boss-1280.png | Boss screenshot | F6 | historical visual evidence only | 2026-11-05 |
| docs/plan/v2/models/feature-lab-candidates.csv | Raw scored candidates, provenance and proposed portfolio | FP2-C2 | verified 66,581 bytes; 96 rows; nine integer score columns; separate ethics; office engine UNVERIFIED | 2026-11-07 |
| docs/plan/v2/models/feature-lab-scorecard.xlsx | Editable Feature Lab scorecard and live sensitivity | FP2-C2 | verified 306,510 bytes; eight sheets; 22 scenarios; ZIP CRC/XML and numeric expectations PASS; office engine UNVERIFIED | 2026-11-07 |
| docs/plan/v2/feature-card-pack-01.md | Four learner reasoning Feature Cards and shared contracts | FP2-C2 | verified 14518 bytes / 103 lines; first lines and character checks; PROPOSED | 2026-11-07 |
| docs/plan/v2/feature-card-pack-02.md | Five cooperative clarity/access Feature Cards | FP2-C2 | verified 14985 bytes / 112 lines; first lines/characters; PROPOSED | 2026-11-07 |
| docs/plan/v2/feature-card-pack-03.md | Five coordinator mentor/version-trust Feature Cards | FP2-C2 | verified 16125 bytes / 112 lines; first lines/characters; PROPOSED | 2026-11-07 |
| docs/plan/v2/feature-loops.md | Three identity loops, flywheel handoffs and humane attention proposals | FP2-C2 | verified 12138 bytes / 79 lines; first lines/characters; PROPOSED | 2026-11-07 |
| docs/design/v2/lore-live-ops.md | Original proposed lore/live-ops bible, 12-month calendar and workload | FP2-C2 | verified 14042 bytes / 93 lines; 12 rows and 224 fixed assumption hours reconcile; PROPOSED | 2026-11-07 |
| docs/progress/checkpoints/CP-C2.md | Feature Lab checkpoint, limits, decisions and Phase D approval request | FP2-C2 | verified 12982 bytes / 103 lines; links/characters/exact ending; WAITING_FOR_APPROVAL | 2026-11-07 |
| docs/plan/v2/thinking.md | D reasoning scope, invariants, requirement coverage and pre-mortem | FP2-D | verified 13233 bytes / 78 lines; WAITING_FOR_APPROVAL (CP-D), final links/records checked | 2026-11-07 |
| docs/plan/v2/thinking-signal-ratings.md | F1/F2 proposal formulas, lifecycle, uncertainty and adversarial cases | FP2-D | verified 18997 bytes / 147 lines; D model/link/character checks; proposals only | 2026-11-07 |
| docs/plan/v2/thinking-playgrounds.md | F3/F4 scoring, decay, mission/badge discipline and analytical edges | FP2-D | verified 12918 bytes / 101 lines; D model/link/character checks; proposals only | 2026-11-07 |
| docs/plan/v2/thinking-model-recipe.md | Trusted D synthetic model recipe and isolated generation method | FP2-D | verified 33286 bytes / 244 lines; D model/link/character checks; proposals only | 2026-11-07 |
| docs/plan/v2/models/thinking-simulation-results.csv | Recorded D synthetic model results | FP2-D | verified 26,834 bytes; ratings/allocation/progression/108 wallet months/sensitivities/economics/media clocks; synthetic, Office engine UNVERIFIED | 2026-11-07 |
| docs/plan/v2/models/thinking-simulations.xlsx | Editable D synthetic simulations workbook | FP2-D | verified 87,576 bytes; 19 sheets; rating/progression/claim/ledger/numeric checks; no Office recalculation; synthetic, Office engine UNVERIFIED | 2026-11-07 |
| docs/plan/v2/thinking-economy-sessions.md | F5/F7 synthetic economics, ledger/booking recovery and legal blockers | FP2-D | verified 17060 bytes / 137 lines; D model/link/character checks; proposals only | 2026-11-07 |
| docs/plan/v2/thinking-studio-motion.md | F6/F8 durability, time-map, editor/Board, cost/motion trade-offs | FP2-D | verified 17075 bytes / 123 lines; D model/link/character checks; proposals only | 2026-11-07 |
| docs/plan/v2/thinking-feature-tradeoffs.md | F9 every-candidate/wow/capacity counterfactuals and scope options | FP2-D | verified 13504 bytes / 88 lines; D model/link/character checks; proposals only | 2026-11-07 |
| docs/progress/checkpoints/CP-D.md | D thinking/simulation checkpoint, explicit limits and E approval request | FP2-D | verified 13026 bytes / 99 lines; links/characters/exact ending; WAITING_FOR_APPROVAL | 2026-11-07 |
| docs/plan/v2/03-platform-contracts.md | E current integrated planning specification | FP2-E | verified 80,120 bytes / 552 lines; current coordination/type/consent/gate/case corrections; narrow follow-up validation pending | 2026-11-08 |
| docs/plan/v2/04-signal-flare.md | E current integrated planning specification | FP2-E | verified 61,649 bytes / 491 lines; current coordination/type/consent/gate/case corrections; narrow follow-up validation pending | 2026-11-08 |
| docs/plan/v2/05-ratings.md | E finalized workflow draft, not approved implementation | FP2-E | verified 61615 bytes / 482 lines; finalized source, first lines/characters; full cross-pack QA pending | 2026-11-07 |
| docs/plan/v2/06-mentor-playground.md | E completed-agent draft preserved before user-requested pause | FP2-E | verified 46174 bytes / 393 lines; heading/characters; semantic/review QA pending | 2026-11-08 |
| docs/plan/v2/07-student-playground.md | E completed-agent draft preserved before user-requested pause | FP2-E | verified 56424 bytes / 461 lines; heading/characters; semantic/review QA pending | 2026-11-08 |
| docs/design/v2/playground-art-directions.md | E completed-agent draft preserved before user-requested pause | FP2-E | verified 34889 bytes / 348 lines; heading/characters; semantic/review QA pending | 2026-11-08 |
| docs/plan/v2/10-currencies-ledger.md | E current integrated planning specification | FP2-E | verified 56,144 bytes / 347 lines; current coordination/type/consent/gate/case corrections; narrow follow-up validation pending | 2026-11-08 |
| docs/plan/v2/13-mentorship-sessions.md | E current integrated planning specification | FP2-E | verified 76,136 bytes / 457 lines; current coordination/type/consent/gate/case corrections; narrow follow-up validation pending | 2026-11-08 |
| docs/design/v2/motion-moments.md | E current integrated specification | FP2-E | verified 104,696 bytes / 588 lines; final reviewed producer assignment fixed and inline exact contract checks passed; no runtime/approval | 2026-11-08 |
| docs/plan/v2/master-plan-model-recipe.md | E planning specification/model recipe | FP2-E | verified 44,596 bytes / 330 lines; executed/independent planning checks recorded;7,760 numeric caches/60 vector classifications/8,965 formulas; Office UNVERIFIED | 2026-11-08 |
| docs/plan/v2/models/master-plan-inputs.csv | Typed guarded E planning-model inputs | FP2-E | verified 31,923 bytes; exact schema/JSON types; preserves nine-archetype synthetic assumptions; Office engine UNVERIFIED | 2026-11-08 |
| docs/plan/v2/models/master-plan-models.xlsx | Guarded editable E planning workbook | FP2-E | verified 692,514 bytes; 15 sheets;108 baseline/432 stress months; typed guard/manifest snapshots, not Office recalculation; Office engine UNVERIFIED | 2026-11-08 |
| docs/plan/v2/08-mission-catalogs.md | E current integrated specification | FP2-E | verified 53,287 bytes / 409 lines; final reviewed producer assignment fixed and inline exact contract checks passed; no runtime/approval | 2026-11-08 |
| docs/plan/v2/09-badge-catalog.md | E badge definitions and proposed geometry inventory | FP2-E | verified 59,426 bytes / 432 lines;40 exact IDs/names/distinct primitive recipes, not full semantic/art/clearance review | 2026-11-08 |
| docs/plan/v2/11-studio-capture.md | E completed narrow-workflow draft, not approved implementation | FP2-E | verified 48,674 bytes / 432 lines; heading/characters/provenance; full semantic/link/review QA pending | 2026-11-08 |
| docs/plan/v2/12-studio-notes-whiteboard.md | E completed narrow-workflow draft, not approved implementation | FP2-E | verified 46,992 bytes / 425 lines; heading/characters/provenance; full semantic/link/review QA pending | 2026-11-08 |
| docs/design/v2/studio-ux.md | E completed narrow-workflow draft, not approved implementation | FP2-E | verified 30,402 bytes / 301 lines; heading/characters/provenance; full semantic/link/review QA pending | 2026-11-08 |
| docs/plan/v2/02-master-plan.md | E current integrated planning specification | FP2-E | verified 38,450 bytes / 246 lines; current coordination/type/consent/gate/case corrections; narrow follow-up validation pending | 2026-11-08 |
| docs/plan/v2/16-acceptance-risk-operations.md | E current integrated specification | FP2-E | verified 88,038 bytes / 533 lines; final reviewed producer assignment fixed and inline exact contract checks passed; no runtime/approval | 2026-11-08 |
| docs/plan/v2/15-delivery-sequence.md | E current integrated specification | FP2-E | verified 85,005 bytes / 416 lines; final reviewed producer assignment fixed and inline exact contract checks passed; no runtime/approval | 2026-11-08 |
| docs/plan/v2/17-feature-portfolio-plan.md | E current integrated specification | FP2-E | verified 104,670 bytes / 417 lines; final reviewed producer assignment fixed and inline exact contract checks passed; no runtime/approval | 2026-11-08 |
| docs/progress/checkpoints/CP-E.md | E planning checkpoint and F-only approval request | FP2-E | verified 12,891 bytes / 98 lines; heading/characters/exact ending; planning/evidence limits explicit | 2026-11-08 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261108-be84ac1c/capture-results.json | Synthetic current-frontend capture/interaction/axe/network/headless metrics and terminal status | IW-A2 | 1118bytes/SHA256d8584ee07ef99f332a60956251261373d44f11eed24f4b60fed579a6b63b5ef6 generated and metadata verified; synthetic Chromium evidence | 2026-11-08 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-bc5341f4/student-universe-360.png | Actual existing frontend student-universe,360px fixture capture | IW-A2 | 102322bytes/SHA256e6e232beb3317d4fe37cb3f65293094399d871871967d48eaf6651f727e9ecc7 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-bc5341f4/student-learning-360.png | Actual existing frontend student-learning,360px fixture capture | IW-A2 | 84146bytes/SHA256d15d4492ca76e85679fb3b9dc154c7407245d5e783745c25a63229bf1f2fcde1 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-bc5341f4/student-certificates-360.png | Actual existing frontend student-certificates,360px fixture capture | IW-A2 | 98072bytes/SHA2566f88d5a38aea1402d7dad506157d669b164436356c97753b404fabca46287cce generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-bc5341f4/mentor-observatory-360.png | Actual existing frontend mentor-observatory,360px fixture capture | IW-A2 | 225016bytes/SHA25662c54d19eb26de0f10c6cc6e6a4db30e3a0941bd0f225008ce6e6d698cffb1d2 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-bc5341f4/peer-dashboard-360.png | Actual existing frontend peer-dashboard,360px fixture capture | IW-A2 | 83199bytes/SHA256bc89a09d50cc866f389405c4904305446145eb701cf3b3f9c8400affb6761321 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-bc5341f4/student-universe-768.png | Actual existing frontend student-universe,768px fixture capture | IW-A2 | 112122bytes/SHA25641f28b63b80b93a785432a46d3511c174b2b21fe36ef12ef1c4fbf1fc5e48af6 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-bc5341f4/student-learning-768.png | Actual existing frontend student-learning,768px fixture capture | IW-A2 | 90801bytes/SHA256876773a4998c363de51020c0ca6321d61d33efdbbd5324c1cb764b2db18de3f7 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-bc5341f4/student-certificates-768.png | Actual existing frontend student-certificates,768px fixture capture | IW-A2 | 95157bytes/SHA256a1dabf15f362ef4c7bd2f8c0918ebf6eee35453203a36732049cb715bb5bfef1 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-bc5341f4/mentor-observatory-768.png | Actual existing frontend mentor-observatory,768px fixture capture | IW-A2 | 341500bytes/SHA256c7f481c5e3eb47eba139cab17d4f12f90d86b51ea8640cd3789b88a0baefcc07 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-bc5341f4/peer-dashboard-768.png | Actual existing frontend peer-dashboard,768px fixture capture | IW-A2 | 104195bytes/SHA2560528f420af69583257d6ea138bbcdda0c2fe720811f0f8d126b13350efc94d03 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-bc5341f4/student-universe-1280.png | Actual existing frontend student-universe,1280px fixture capture | IW-A2 | 138850bytes/SHA2566f1d16a8a56b69e71e5a465032a4b869cd02cdf7fdce717d91a408054bed8403 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-bc5341f4/student-learning-1280.png | Actual existing frontend student-learning,1280px fixture capture | IW-A2 | 124233bytes/SHA256374014f89d7184eda123fd1daafff688bfd4afceca8caae99d873716e160c395 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-bc5341f4/student-certificates-1280.png | Actual existing frontend student-certificates,1280px fixture capture | IW-A2 | 140174bytes/SHA256fa0722702430a5d9cfbee047c12bdf28672238b1a19bae4169b8a6af83591096 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-bc5341f4/mentor-observatory-1280.png | Actual existing frontend mentor-observatory,1280px fixture capture | IW-A2 | 468392bytes/SHA25643b8a739072956f8a14cf7454818fee7f1abb1491c057e055193899f6af2d34d generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-bc5341f4/peer-dashboard-1280.png | Actual existing frontend peer-dashboard,1280px fixture capture | IW-A2 | 139901bytes/SHA256cd94b8837eb6cae3a2a931dc1ebca31ea8a8310eac83ea8420a48f81589c5944 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-bc5341f4/capture-results.json | Synthetic current-frontend capture/interaction/axe/network/headless metrics and terminal status | IW-A2 | 81862bytes/SHA2563db6e3b1ddd70159b67ec7c69ba752bea83d6ec20cd1cd316fcb6b3c967441eb generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-apply-360.png | Actual existing frontend mentor-apply,360px fixture capture | IW-A2 | 780960bytes/SHA25696b1d9f536ecc2d90b2c7af3ad3f21f606cc9d28bffc11d4ffea1ffdb72f790d generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-hub-360.png | Actual existing frontend mentor-hub,360px fixture capture | IW-A2 | 780938bytes/SHA2567be4637d39fe1913cd2bacae227e56339474f451ec690b32a2d9db86eb14bb69 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-courses-360.png | Actual existing frontend mentor-courses,360px fixture capture | IW-A2 | 169282bytes/SHA2568de5b70b0319aad38f2eecafa4e9d0b2936a4d8621b3858ba7fb9c8314e2d0b7 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-course-new-360.png | Actual existing frontend mentor-course-new,360px fixture capture | IW-A2 | 183997bytes/SHA256319ec69605a13d63a9578c5f65cf12da1d486e0292dc0cf01f46b42f58664d37 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-course-edit-360.png | Actual existing frontend mentor-course-edit,360px fixture capture | IW-A2 | 201690bytes/SHA256dea2cbd963e6411a554de3ff4c03969ce974c7f5737ad019336c4f3fbb78ba64 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-lesson-edit-360.png | Actual existing frontend mentor-lesson-edit,360px fixture capture | IW-A2 | 302689bytes/SHA25628a854aa365c17fc4cd2d74322a6df8cf65f494deca2a5b7bbdd5349298a2b2b generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-recorder-360.png | Actual existing frontend mentor-recorder,360px fixture capture | IW-A2 | 244305bytes/SHA25621fc98886e279d34299badd65e5f0ab75791668a7470d87788bf389e5c05db3d generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-sessions-360.png | Actual existing frontend mentor-sessions,360px fixture capture | IW-A2 | 151808bytes/SHA256156d9275884536cbe254d72ebdff458d6179e39280da325807cf5aa5f3b4bb01 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-earnings-360.png | Actual existing frontend mentor-earnings,360px fixture capture | IW-A2 | 232051bytes/SHA2569b28ecf9578aab9fb244ad866bc0bf8aa43b42976936d1bd6448252da5e3031c generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-pact-360.png | Actual existing frontend mentor-pact,360px fixture capture | IW-A2 | 250478bytes/SHA256cec3c58c6472575531503293c31c56b6b8be8c88be6b68a8e8368ef0ee029405 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-moderation-360.png | Actual existing frontend mentor-moderation,360px fixture capture | IW-A2 | 196918bytes/SHA2560f9f6816dc402604b06c30172bfcf0de551a028f2ef199c3c77aca4531183c87 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-analytics-360.png | Actual existing frontend mentor-analytics,360px fixture capture | IW-A2 | 216737bytes/SHA2566230293da028a15c6b7553068c6e4c804964fde315b33171b8972a7d19ff8b7e generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-students-360.png | Actual existing frontend mentor-students,360px fixture capture | IW-A2 | 137190bytes/SHA25601a4fc82332b5cb71aceff9cd5ffc04f3e7e7c7661a92aa01e0a1cd2114de331 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-apply-768.png | Actual existing frontend mentor-apply,768px fixture capture | IW-A2 | 792318bytes/SHA256612d013a8a625d9999857f1628975ab5d257741d7a24675e7738328848f9b04e generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-hub-768.png | Actual existing frontend mentor-hub,768px fixture capture | IW-A2 | 792313bytes/SHA256a2ebab214d200666aba9d699173b6148feb24746ca4442e5b994826ae527c965 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-courses-768.png | Actual existing frontend mentor-courses,768px fixture capture | IW-A2 | 173399bytes/SHA256e76d25282c74c42622b9295fdc0900586d5bd4399fdf16db8e681cb4b63696b1 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-course-new-768.png | Actual existing frontend mentor-course-new,768px fixture capture | IW-A2 | 237988bytes/SHA25602fb9b0bb788f77b735b6755c448c698d3e419931ad70b23d6d21efa9f320d2b generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-course-edit-768.png | Actual existing frontend mentor-course-edit,768px fixture capture | IW-A2 | 241071bytes/SHA2567fa1c5a9bc6a22306c47debaf3ddcc5b328eeab0347447b0d8c37fe729f14183 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-lesson-edit-768.png | Actual existing frontend mentor-lesson-edit,768px fixture capture | IW-A2 | 408786bytes/SHA2567844d8d88ce6d545e6d4e36160b0b7c182978adc1cdb5206405279e2ebc87cb5 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-recorder-768.png | Actual existing frontend mentor-recorder,768px fixture capture | IW-A2 | 352649bytes/SHA256c2872cd8cbf230f9a593202bea5a8c2418556131670a6aff224d55464e8e5475 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-media-768.png | Actual existing frontend mentor-media,768px fixture capture | IW-A2 | 439641bytes/SHA25604b56f0f0d3fa73067f8871692aa94bebf700427d30b9558cb9522bf85a97be4 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-sessions-768.png | Actual existing frontend mentor-sessions,768px fixture capture | IW-A2 | 233518bytes/SHA256d4373295a92313f2549cbeeb43598ee8ff06dbbf662fe9cd30e8c6d2f7d4e140 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-earnings-768.png | Actual existing frontend mentor-earnings,768px fixture capture | IW-A2 | 239762bytes/SHA2562bbd117301d4cc38cf94bd4976c4d88bb9f59606c6998df2b19d72da563e53aa generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-pact-768.png | Actual existing frontend mentor-pact,768px fixture capture | IW-A2 | 272748bytes/SHA256596302e6f5dfdcd1a44d977fbc95979988be56a3f7c68025d274c558060e0685 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-moderation-768.png | Actual existing frontend mentor-moderation,768px fixture capture | IW-A2 | 234874bytes/SHA25633e27f4062eac01a48b4537c4cf56f9c502c056096ebd58fda3e0618411a3f73 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-analytics-768.png | Actual existing frontend mentor-analytics,768px fixture capture | IW-A2 | 206546bytes/SHA25622ebc5a1190ce8a572f6fcdfc1c0833016d25bdb3870e1d8f856319829510ddb generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-students-768.png | Actual existing frontend mentor-students,768px fixture capture | IW-A2 | 159276bytes/SHA256f1fcba8e45c6d5da7ac0d2840ea96a7f0f102be087e6fdab1f89e32b5b0056d0 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-apply-1280.png | Actual existing frontend mentor-apply,1280px fixture capture | IW-A2 | 835706bytes/SHA256f2384a70d880bf5d03e1d19e895872c4f57218f655a1b77d6d0f9884b5eca1bf generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-hub-1280.png | Actual existing frontend mentor-hub,1280px fixture capture | IW-A2 | 835809bytes/SHA2569c97a77e73dbbd1bf16ba1d2b29f2fc9daf2edc2f5d72d1866ec77efee706995 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-courses-1280.png | Actual existing frontend mentor-courses,1280px fixture capture | IW-A2 | 232281bytes/SHA256616bf533a31781c0f0f6d3c8ac1313509282b9de12a3e815b90d5bb408e77183 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-course-new-1280.png | Actual existing frontend mentor-course-new,1280px fixture capture | IW-A2 | 296845bytes/SHA256ff051ef4a2cf13cfa631a87878a254a4cdc2917c3f224cac98d241bfbe603254 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-course-edit-1280.png | Actual existing frontend mentor-course-edit,1280px fixture capture | IW-A2 | 282446bytes/SHA256bafaa08370c471497e1f71e0e5ae84d71d9b21aea4b2d39c8776c5014b64ae41 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-lesson-edit-1280.png | Actual existing frontend mentor-lesson-edit,1280px fixture capture | IW-A2 | 518134bytes/SHA256c1fbb1c4b46e0be1aff7a9f294039da246744fa3448de334952ed605021ab1ad generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-recorder-1280.png | Actual existing frontend mentor-recorder,1280px fixture capture | IW-A2 | 360706bytes/SHA2563c6b3dc2c1b5f4da99543493a1d2efa9e82fafa96511697b5bf53e6fdf36c8c4 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-media-1280.png | Actual existing frontend mentor-media,1280px fixture capture | IW-A2 | 569066bytes/SHA256ecd1554ebb1b4e16d8dc4c635cf833e0e0e45c4900b98b396235da98b7bcbc83 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-earnings-1280.png | Actual existing frontend mentor-earnings,1280px fixture capture | IW-A2 | 313563bytes/SHA2560aa3684c9157b7391de9ea07ee8fec9fd868a18974803777089aa4d3bae71d58 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-pact-1280.png | Actual existing frontend mentor-pact,1280px fixture capture | IW-A2 | 339750bytes/SHA256c16848940b58063c0357a4c73bb630d23e83ca94c1c6862cf9fae98227c6bcf6 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-moderation-1280.png | Actual existing frontend mentor-moderation,1280px fixture capture | IW-A2 | 310545bytes/SHA256158e5e8fceeeab38785b96508234568c60b0134c6fd6977eb20a79ebe53253f7 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-analytics-1280.png | Actual existing frontend mentor-analytics,1280px fixture capture | IW-A2 | 275472bytes/SHA25666e965ad0a0f51c2bf512341f70b2d4a6b4adf010de0237bc6c2144f7d326afc generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-students-1280.png | Actual existing frontend mentor-students,1280px fixture capture | IW-A2 | 196538bytes/SHA256a66a63f5a9b7537451b317d2d6a85f122f664c3d9448c0274d4c52b6afc6d541 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/capture-results.json | Synthetic current-frontend capture/interaction/axe/network/headless metrics and terminal status | IW-A2 | 138479bytes/SHA2567baae2244eb0e78b947f4a2bff7bec4b59890f025c5eb922f78f6ba51ad59721 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/student-sessions-360.png | Actual existing frontend student-sessions,360px fixture capture | IW-A2 | 97765bytes/SHA25638e0759124651b0aa254f71d632f0acdd18b94a19cc5864a0fd5ce0bd83dc31f generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/student-mentors-360.png | Actual existing frontend student-mentors,360px fixture capture | IW-A2 | 155444bytes/SHA2562b3cd2baf07a62009ab6ceb521e6eec1601bc794a7b9242df27cc72b6add7298 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/student-mentor-detail-360.png | Actual existing frontend student-mentor-detail,360px fixture capture | IW-A2 | 100474bytes/SHA2563437fb51a0f9ab683fb9089fa04cc229f620f21d4830319623a9424dcedcef02 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/student-room-terminal-360.png | Actual existing frontend student-room-terminal,360px fixture capture | IW-A2 | 21252bytes/SHA256404bb48e158c5188762cfac2759c727e95e5f07b67a77ea5c4d02d052ce14e25 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/courses-360.png | Actual existing frontend courses,360px fixture capture | IW-A2 | 18441bytes/SHA256cec40530fe8c7d4a590b2d67843b21303a28771e91daf909d45355c37e7f0340 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/course-detail-360.png | Actual existing frontend course-detail,360px fixture capture | IW-A2 | 366924bytes/SHA25645fb6f5924e1ee94bb3cc4ff99c0a6197c4d7d0a1a8b998fe44ae87be692d18c generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/course-learn-360.png | Actual existing frontend course-learn,360px fixture capture | IW-A2 | 209369bytes/SHA2561e58a3458e356ee6070c31088c4a53a1e0563c3a0e367532d46d2bf9d953df8f generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/certificate-360.png | Actual existing frontend certificate,360px fixture capture | IW-A2 | 116490bytes/SHA256957e8fdacca9d090d83e0b45d48059418fa126768d1ae430080f8031c6eab4c7 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/plans-360.png | Actual existing frontend plans,360px fixture capture | IW-A2 | 65754bytes/SHA25685eb27e9242118b1329acaae0ca668bc03c0a52e799fd7dfa23c26bebf0ce710 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/gameology-360.png | Actual existing frontend gameology,360px fixture capture | IW-A2 | 213815bytes/SHA2564fbf9d14562bd2edfc3c5ed571c0bc9d40c97a651ed605afda356570c127798e generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/skill-map-360.png | Actual existing frontend skill-map,360px fixture capture | IW-A2 | 12543bytes/SHA25638584bf29f53dfbe951ff2d592888567befc9de0061ce8df1f3c049fce624399 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/public-skill-map-360.png | Actual existing frontend public-skill-map,360px fixture capture | IW-A2 | 20333bytes/SHA256ae30850cd65276788b2a213097b0ffe9baee11bce0b2e70ffcd98a93fd0f5c8c generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/identity-360.png | Actual existing frontend identity,360px fixture capture | IW-A2 | 105084bytes/SHA2569acb5578b73d4d0b56ddde70ca4751ae83fd24ce500e5cb4074e713a9ce45fe6 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/settings-360.png | Actual existing frontend settings,360px fixture capture | IW-A2 | 221065bytes/SHA2565458c5bf044de2777205af577161e87c15bb3c6df26146bbc3c3856cfbb6dd0f generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/mentor-media-360.png | Actual existing frontend mentor-media,360px fixture capture | IW-A2 | 376421bytes/SHA2569d2d559a563ad8185a3274a17fbcd15a68e807c0d06a55e6c7ff3f7541a9988a generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/mentor-sessions-360.png | Actual existing frontend mentor-sessions,360px fixture capture | IW-A2 | 151943bytes/SHA2565a86cb0eeef02deb5531536e6884c3d2af61a4c345ed59eb4d955ce7cde097e4 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/student-sessions-768.png | Actual existing frontend student-sessions,768px fixture capture | IW-A2 | 174922bytes/SHA256a1b40f6110af8a9a4f3e36a189e96b6ef5d6ad32446d54af88b7e6a39b157224 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/student-mentors-768.png | Actual existing frontend student-mentors,768px fixture capture | IW-A2 | 218216bytes/SHA256ed01538662f9109b06652614b31f4f6a3a079a716aa3c6f3bf3af441f2db22b9 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/student-mentor-detail-768.png | Actual existing frontend student-mentor-detail,768px fixture capture | IW-A2 | 172681bytes/SHA256c8ca3e1e2f96d233ab9364912779d85d5a9fe8c87bbb90bef07f3bbcaa5c6217 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/student-room-terminal-768.png | Actual existing frontend student-room-terminal,768px fixture capture | IW-A2 | 42116bytes/SHA256a40fdc65fb5228654739c619b39277a1149ca1ed74845dd71170ec36b49463aa generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/courses-768.png | Actual existing frontend courses,768px fixture capture | IW-A2 | 21227bytes/SHA256c003006571d1e1a9c21613be8193ed3b7c2a8e72de56ae4c95abdb8e7b00da93 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/course-learn-768.png | Actual existing frontend course-learn,768px fixture capture | IW-A2 | 238229bytes/SHA25640de96df8ee862efeca756ac5b81026d4db7cab6fd3765c9de2e3246e319bf82 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/certificate-768.png | Actual existing frontend certificate,768px fixture capture | IW-A2 | 278663bytes/SHA2566354e0f5e2a6472d8a1a4defc915a25f826546790f12deacb2435be59b2f354a generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/plans-768.png | Actual existing frontend plans,768px fixture capture | IW-A2 | 95514bytes/SHA2562f4f930618f10800906731d9fa6aabfe6a3c0294e063f333bdf2fd2268922876 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/gameology-768.png | Actual existing frontend gameology,768px fixture capture | IW-A2 | 280176bytes/SHA2566a319d8cbbe52c5206b8292f28fe74d745a92209b10a3f9763f60c30e5e7ba19 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/skill-map-768.png | Actual existing frontend skill-map,768px fixture capture | IW-A2 | 20382bytes/SHA2564970d84b6856412aaf7b3012e4a69817fa148ab3af4a23c1125936b6c4ee650c generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/public-skill-map-768.png | Actual existing frontend public-skill-map,768px fixture capture | IW-A2 | 28037bytes/SHA256bb5bd60cf4684ebf60bc5b5177839e91ffc48570ee55039b45b6032baf4fc3d8 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/identity-768.png | Actual existing frontend identity,768px fixture capture | IW-A2 | 147726bytes/SHA256b7479e189f27634fc95c3cc821f34eb496e89367bf695b7069bd487cc3e66221 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/settings-768.png | Actual existing frontend settings,768px fixture capture | IW-A2 | 221121bytes/SHA2561a5ba1b9c0acfe17ce79920c6a46695f0c883e28584290b88abcc7b5e8cb5561 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/mentor-media-768.png | Actual existing frontend mentor-media,768px fixture capture | IW-A2 | 440370bytes/SHA256b7a89871e26990b890cb1a94d95fd233b412b904bc6d932730f1788bbafbb592 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/mentor-sessions-768.png | Actual existing frontend mentor-sessions,768px fixture capture | IW-A2 | 234426bytes/SHA25669bcd143f67da8c707a54985c50c4d921750f0b483519a6504fab153fe6a378e generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/student-sessions-1280.png | Actual existing frontend student-sessions,1280px fixture capture | IW-A2 | 199494bytes/SHA256f3a5f1a20cb81b8c8ab5a526cd75dc41e0f0ba523c4da60ee41c9b6f347d45e8 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/student-mentors-1280.png | Actual existing frontend student-mentors,1280px fixture capture | IW-A2 | 275658bytes/SHA256ee1d0b51b5e74cdb58e9629773f5f9d240a00a76f9d4fc4d7600518cff648e11 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/student-mentor-detail-1280.png | Actual existing frontend student-mentor-detail,1280px fixture capture | IW-A2 | 192065bytes/SHA256291c90ab8ee3511257fc1d7b70f4e0fb815bb729886384732944278f2f15f3cf generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/student-room-terminal-1280.png | Actual existing frontend student-room-terminal,1280px fixture capture | IW-A2 | 60888bytes/SHA256cb1bbaefffbc6fba79df77b526d33eecb5ac811676d6e680a14526a8ff77d1e3 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/courses-1280.png | Actual existing frontend courses,1280px fixture capture | IW-A2 | 21455bytes/SHA25644c134ea9d42f40ffb07d337e58351811558b11aab7f6b55fa6da124d7400ad1 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/course-learn-1280.png | Actual existing frontend course-learn,1280px fixture capture | IW-A2 | 278610bytes/SHA256d628990a8e451f3698eac90506325f896bd491aa370a87bb946946b771d91a21 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/design/v3/01-ui-visual-evidence.md | Actual UI critique, all run ledgers, ARIA/axe/reflow/transit/finite journey outcomes and limits | IW-A2 |42342bytes/255lines/SHA256982a39e60907eb2defc4bb9094264122327720642d5ec37fbdd1694b24f18ba3; final evidence round with211PNG/147slot ledger;331combined local links/source bounds/characters verified; not design acceptance | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/certificate-1280.png | Actual existing frontend certificate,1280px fixture capture | IW-A2 | 501791bytes/SHA25620c23fa57b88b49ca61e941c761981c5897408a47ea4ea80c6b7d12c3bb66691 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/plans-1280.png | Actual existing frontend plans,1280px fixture capture | IW-A2 | 123249bytes/SHA256a025465dd1cc787ea6a86c5c180b26ec37fb84a34df8b45be062d7d8da243dee generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/gameology-1280.png | Actual existing frontend gameology,1280px fixture capture | IW-A2 | 346557bytes/SHA25675ec82f4c29698fc5dce81ba88f3b678a7b04c2bb64befde0dacc6815af86d92 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/skill-map-1280.png | Actual existing frontend skill-map,1280px fixture capture | IW-A2 | 29707bytes/SHA2562009c4a686a337693ef1088cb0dadbbf877b8a651e5e5875eb5d25852ec650ad generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/public-skill-map-1280.png | Actual existing frontend public-skill-map,1280px fixture capture | IW-A2 | 36904bytes/SHA2565ba6be8dda21d3c63dd5d2521c550fc0295c6646faa2a20ed1a36f1152520bf4 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/identity-1280.png | Actual existing frontend identity,1280px fixture capture | IW-A2 | 167116bytes/SHA256bf481543049a5cace2ed08cfc4ce1f8a79339ac43fe8eae9af719902162baba6 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/settings-1280.png | Actual existing frontend settings,1280px fixture capture | IW-A2 | 233827bytes/SHA25655b7514ac65a52c7731f6ced074cdec030268f609e6999ce5b655ccef16d6ed4 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/mentor-media-1280.png | Actual existing frontend mentor-media,1280px fixture capture | IW-A2 | 569621bytes/SHA25604a33ccbac24b99721a053a15c60ed4d914aeb9cad3f7bff9a333f99a0347ba6 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/mentor-sessions-1280.png | Actual existing frontend mentor-sessions,1280px fixture capture | IW-A2 | 292847bytes/SHA2568cac81b74485857e99d133a0e6f6a32b7ca8fe6ad7d761fc9fc63300c399ba33 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/capture-results.json | Synthetic current-frontend capture/interaction/axe/network/headless metrics and terminal status | IW-A2 | 138331bytes/SHA2561566b0511e6ec17ceeb93faaab5b3507ab9ffd48271361a2b796c8c688862967 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-739f2cce/courses-360.png | Actual existing frontend courses,360px fixture capture | IW-A2 | 18441bytes/SHA256cec40530fe8c7d4a590b2d67843b21303a28771e91daf909d45355c37e7f0340 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-739f2cce/capture-results.json | Synthetic current-frontend capture/interaction/axe/network/headless metrics and terminal status | IW-A2 | 8610bytes/SHA25690cf20b003edcf6eb816e195dea2be806b5afedc4c4147d2eb3607dd26e5ede5 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/profile-360.png | Actual existing frontend profile,360px fixture capture | IW-A2 | 148431bytes/SHA25607b59339ddcdb33b17562daa6f74be1ce9b162e196c86d7a2a037e5e08c6ad57 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/public-profile-360.png | Actual existing frontend public-profile,360px fixture capture | IW-A2 | 54041bytes/SHA256bab097a126e301caac54cf32bd24324ea86e15c5ae0c3e38563f02b5f66908dc generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/leaderboard-360.png | Actual existing frontend leaderboard,360px fixture capture | IW-A2 | 35200bytes/SHA256cdebb71d8e0b49db351e9d09e544a12102cf69d13220e9bd981752c1405b4a14 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/orbit-360.png | Actual existing frontend orbit,360px fixture capture | IW-A2 | 113815bytes/SHA2567834ecf4cd068f997d04bdb6e9e8bd93cb9e1ae49cbd547eb881230d5c03046e generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/mission-log-360.png | Actual existing frontend mission-log,360px fixture capture | IW-A2 | 81216bytes/SHA25685c63c5e4959416a067f33c43f3670be3f1cc91ac89379869c77d1f09685ceae generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/shop-360.png | Actual existing frontend shop,360px fixture capture | IW-A2 | 123623bytes/SHA2561537aef52c527fd7643e8d4bf10bfb30b3d3d8e9276c4cb396f7ee83eb80063c generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/holobay-360.png | Actual existing frontend holobay,360px fixture capture | IW-A2 | 102144bytes/SHA256253647412ed3d3e0965c3a87cc4dff4f56cce285bc7e37d86617638b5b2f6734 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/cosmic-observatory-360.png | Actual existing frontend cosmic-observatory,360px fixture capture | IW-A2 | 43784bytes/SHA25623d011ed55da02aa87aa129263026c858bfb8ecc903522b0e6253a05c0fba163 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/tier-atlas-360.png | Actual existing frontend tier-atlas,360px fixture capture | IW-A2 | 49309bytes/SHA256f15d5edb0d387bd86e3ab2f04c01e6f2ce6a71ee33e36fce461763972b410a45 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/peer-browse-360.png | Actual existing frontend peer-browse,360px fixture capture | IW-A2 | 62053bytes/SHA25685497392b63b85a28ff66e753f7dc0540149db234094c293a7d24455bcffd634 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/peer-matches-360.png | Actual existing frontend peer-matches,360px fixture capture | IW-A2 | 35653bytes/SHA256b16945db83990815b7525dfe0bc6262bd96559ea478df440fc62b11db462b6d1 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/peer-connections-360.png | Actual existing frontend peer-connections,360px fixture capture | IW-A2 | 35579bytes/SHA2563078134dff6ed574ef691d908523c77cb4873ee0e0358abe7ad557f1c5e366f8 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/peer-nearby-360.png | Actual existing frontend peer-nearby,360px fixture capture | IW-A2 | 61789bytes/SHA256436faafea1aa3649e69aad0cdbd023a6990044d81c4b3235a2c6a6bf588cb95c generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/peer-trust-360.png | Actual existing frontend peer-trust,360px fixture capture | IW-A2 | 82515bytes/SHA256ee510ee7a49f740a61cf2317dec41d04b66461c7bfe0790dc7f19ae13fafb4f8 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/peer-calls-360.png | Actual existing frontend peer-calls,360px fixture capture | IW-A2 | 39668bytes/SHA2568ee6d0406d33f02981afe7f895e90e6200782c11ff518315127efe83ccc42bcb generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/not-found-360.png | Actual existing frontend not-found,360px fixture capture | IW-A2 | 72517bytes/SHA25636bacc8f8b67308fba5da538dbaae41df19c21e45e6af24935633671108b82aa generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/courses-360.png | Actual existing frontend courses,360px fixture capture | IW-A2 | 183645bytes/SHA256dd7c1f465ec80d1ef645700c8085cc97c1dc56c10a692ca17cb89e7d745306c5 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/course-detail-360.png | Actual existing frontend course-detail,360px fixture capture | IW-A2 | 366780bytes/SHA256be404a6d02729c7e860fc5dd8fe15221f19bb2058fa3549f5e07405406b11bba generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/skill-map-360.png | Actual existing frontend skill-map,360px fixture capture | IW-A2 | 38557bytes/SHA2564600291b12b4ed00bec52d04e0e9ee46f95efa9c59a4f1c2798ddd6afeb8440e generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/public-skill-map-360.png | Actual existing frontend public-skill-map,360px fixture capture | IW-A2 | 39937bytes/SHA256d1288a8579db594504b9938e15fc9c3fd3156413355e3126f0087a0f97eec270 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/profile-768.png | Actual existing frontend profile,768px fixture capture | IW-A2 | 166457bytes/SHA25628b8abd45f8d15491a63624a454b830fda29430d5210eec31e53c7b9622afa78 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/public-profile-768.png | Actual existing frontend public-profile,768px fixture capture | IW-A2 | 63058bytes/SHA2568c10b0769de3a7b316ca01decabce672130d34487fbc16a628ef157e7aeec75a generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/leaderboard-768.png | Actual existing frontend leaderboard,768px fixture capture | IW-A2 | 64027bytes/SHA256c5b9f7250bf6fd1f53256c7ad9f8020bb985cf5d78f56ec6b96d9ecc1de13e48 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/orbit-768.png | Actual existing frontend orbit,768px fixture capture | IW-A2 | 115628bytes/SHA256df4dd73ad54789479fa4232664771a303863fc139b542d0094ec6daf85b73e55 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/mission-log-768.png | Actual existing frontend mission-log,768px fixture capture | IW-A2 | 147190bytes/SHA256d948ce19faa0f60de647300eb29b7fe3fee44a62450247ff6a59fe79b3c428b6 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/shop-768.png | Actual existing frontend shop,768px fixture capture | IW-A2 | 98702bytes/SHA256ab387dc607d7d6cb5c94fa2e94b1f1b24fd6ae93b42dfa8dcccd8292f941ed2f generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/holobay-768.png | Actual existing frontend holobay,768px fixture capture | IW-A2 | 121685bytes/SHA25613c51fc914afc2b7cb7b74cac61944d5274de4f1182f7eb987d0b440c756dd80 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/cosmic-observatory-768.png | Actual existing frontend cosmic-observatory,768px fixture capture | IW-A2 | 67317bytes/SHA256ce0fbdc011c034f6cb6545ac416e2aa364d8fd57e6ce36d91082e3604784c8d1 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/tier-atlas-768.png | Actual existing frontend tier-atlas,768px fixture capture | IW-A2 | 605108bytes/SHA256854403baea1392a3c35e4f95673d05fc25a238b1cfbaf604b2d1b33081921394 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/peer-browse-768.png | Actual existing frontend peer-browse,768px fixture capture | IW-A2 | 83569bytes/SHA25684517e5398445b81c65bd9d3129410c86dd9e5fe257796271631d68afff7cb05 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/peer-matches-768.png | Actual existing frontend peer-matches,768px fixture capture | IW-A2 | 59271bytes/SHA256d4aecbeaa428cfa8cdf501db32ad242d4a03b1ab578f2d531abf359ab696cf45 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/peer-connections-768.png | Actual existing frontend peer-connections,768px fixture capture | IW-A2 | 61878bytes/SHA256f83a327a8eba6b01d4f692aa851dbb809a90fb368c47d35d52bf2ff35fe402a5 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/peer-nearby-768.png | Actual existing frontend peer-nearby,768px fixture capture | IW-A2 | 89376bytes/SHA256c318dec92e61a1e5a6dd9dc62a82b34e23793daaed634c49c3378247b315827b generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/peer-trust-768.png | Actual existing frontend peer-trust,768px fixture capture | IW-A2 | 105090bytes/SHA256df6eee4b94e4610d272c9a4517afd7fdf808f2947c2d4db854bbfde295ef9b01 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/peer-calls-768.png | Actual existing frontend peer-calls,768px fixture capture | IW-A2 | 59860bytes/SHA25616fc10b36934f3aa14d113bd1b721d711178b6152acc58e3fdafc7e530c16116 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/not-found-768.png | Actual existing frontend not-found,768px fixture capture | IW-A2 | 139049bytes/SHA2568c23640280fad91f9afb1555e81d362a8c5d2dd58edf3cdf7f78c4bb526e2da6 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/courses-768.png | Actual existing frontend courses,768px fixture capture | IW-A2 | 235374bytes/SHA2568f1671f6ec6a585eaf5d8e7062c46701f8755f02f4801193f69d7afd34a80bdd generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/course-detail-768.png | Actual existing frontend course-detail,768px fixture capture | IW-A2 | 770024bytes/SHA256c893ffd73ff5f8d1368e6b75e8865b315f1bc33fb483e45e3c508ad98e6d99bc generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/skill-map-768.png | Actual existing frontend skill-map,768px fixture capture | IW-A2 | 48651bytes/SHA2569df24ba057bc86775392a77f8b3bd858271396d04c9b39f1e58082e8092e0b75 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/public-skill-map-768.png | Actual existing frontend public-skill-map,768px fixture capture | IW-A2 | 118531bytes/SHA25600755008f9622f9d20742b4f50bc6cf2b4c65e1beaa2fc1ee2d5963b2d1486d2 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/profile-1280.png | Actual existing frontend profile,1280px fixture capture | IW-A2 | 183521bytes/SHA25669329788d68e3959507ed3e751dc20e86bcb732614f96979c5a71aa4ffea8039 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/public-profile-1280.png | Actual existing frontend public-profile,1280px fixture capture | IW-A2 | 73411bytes/SHA2566ae130c527af6420af6a1462e0db838c33f1e45a56e25d29bfddc5bdd4dd3506 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/leaderboard-1280.png | Actual existing frontend leaderboard,1280px fixture capture | IW-A2 | 59113bytes/SHA256b0d2ff3fed32db66a1f60e61c8b0d7dedc82457fd6170169e86f5cf8e4b64978 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/orbit-1280.png | Actual existing frontend orbit,1280px fixture capture | IW-A2 | 78189bytes/SHA25641604452fbdea67cefaa320d2b86daed52e42cead8bc6d03daa46c5d7eabf0cd generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/mission-log-1280.png | Actual existing frontend mission-log,1280px fixture capture | IW-A2 | 155356bytes/SHA256408fdf7b26229b05adf0647174a5a504b409daddbb187a97221ddff67cdeeca0 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/shop-1280.png | Actual existing frontend shop,1280px fixture capture | IW-A2 | 108586bytes/SHA25639a44c0ead28e93e4c49bf95b10114a8e6a41f64ab31364ff60c345a71689354 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/holobay-1280.png | Actual existing frontend holobay,1280px fixture capture | IW-A2 | 95127bytes/SHA2566be900c1c2894d8015c0e2b463824dea53844e6e4a50da9730005b859923798d generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/cosmic-observatory-1280.png | Actual existing frontend cosmic-observatory,1280px fixture capture | IW-A2 | 81679bytes/SHA256db3a8b0944fcf1f2782cb88881353b33d73244c002037f46e053c50e2f692adb generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/tier-atlas-1280.png | Actual existing frontend tier-atlas,1280px fixture capture | IW-A2 | 636635bytes/SHA256359e3b6845a1ea6585b54463a76f022c507455c40e0894c77b8426845d33a3dd generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/peer-browse-1280.png | Actual existing frontend peer-browse,1280px fixture capture | IW-A2 | 102044bytes/SHA25632f8f1b023f4f177fdfd29fbb934b2d5a0f1ddbef3b863f1cc4e3aad359abb03 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/peer-matches-1280.png | Actual existing frontend peer-matches,1280px fixture capture | IW-A2 | 69213bytes/SHA256104e89a24e837c25b0a03513f79c7398a1ffd9f318891e4ac4d3453ee6c168e5 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/peer-connections-1280.png | Actual existing frontend peer-connections,1280px fixture capture | IW-A2 | 78004bytes/SHA2563afe2f74042db4f3a75099ede293bf2b12469a6bbe02bbe9b2c4e9de2539a2ea generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/peer-nearby-1280.png | Actual existing frontend peer-nearby,1280px fixture capture | IW-A2 | 87149bytes/SHA256abcf7a4bbdb72f4cde492b268471b95aff027665b1eba6ac17e731e07674fb7c generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/peer-trust-1280.png | Actual existing frontend peer-trust,1280px fixture capture | IW-A2 | 101262bytes/SHA25672830af10e356bab3114883a1a722f0d0aa37b660aed78f56f846076f78f9b1f generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/peer-calls-1280.png | Actual existing frontend peer-calls,1280px fixture capture | IW-A2 | 71586bytes/SHA256afd8b4af26e599c36a12aaf4d5b779712cf3154c95bee3e3a4632e89b6b23134 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/not-found-1280.png | Actual existing frontend not-found,1280px fixture capture | IW-A2 | 156524bytes/SHA256d59a2f0553165e41dbaf2f4bf4786efc3b7eab12cadb194182a955d08b7c5eee generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/courses-1280.png | Actual existing frontend courses,1280px fixture capture | IW-A2 | 271675bytes/SHA256b953f11901df06c7162784c5542173c4aacdb66bf9b190c1afac84e70098c453 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/skill-map-1280.png | Actual existing frontend skill-map,1280px fixture capture | IW-A2 | 59650bytes/SHA256bbc06903837f72a510cd9a33fb9883bda90649ed060ec3ef3245588bb32f8244 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/public-skill-map-1280.png | Actual existing frontend public-skill-map,1280px fixture capture | IW-A2 | 185769bytes/SHA25668600eb021dbc8914750e7b33186a9ae6c886123b46da91901c844d1b56e9326 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/capture-results.json | Synthetic current-frontend capture/interaction/axe/network/headless metrics and terminal status | IW-A2 | 190038bytes/SHA2567267386f807edbdff88b9c2454c56660272dcebbc2dd28a2fb55ee9d6ec7efdf generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-92da7547/course-detail-1280.png | Actual existing frontend course-detail,1280px fixture capture | IW-A2 | 366879bytes/SHA256ecdbbebacdbcd0075bf72149194a82bbe32e52714ee924247b30ff2c97f24086 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-92da7547/capture-results.json | Synthetic current-frontend capture/interaction/axe/network/headless metrics and terminal status | IW-A2 | 9967bytes/SHA256eaa3d82f7089c433ce42120dc7744cc60d636c7b89d85e820c00a24955e69e80 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-0c7f4bfb/student-empty-360.png | Actual existing frontend student-empty,360px fixture capture | IW-A2 | 54771bytes/SHA2564e357570b47836b355f35a276176e4a7eb6a3077c85046e8df631b05272171cf generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-0c7f4bfb/student-failed-360.png | Actual existing frontend student-failed,360px fixture capture | IW-A2 | 54771bytes/SHA2564e357570b47836b355f35a276176e4a7eb6a3077c85046e8df631b05272171cf generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-0c7f4bfb/mentor-pending-360.png | Actual existing frontend mentor-pending,360px fixture capture | IW-A2 | 84515bytes/SHA2567dfd287603a3a67c4cc7cc8ef2121866a08a68d40ebbabb1987e748cacf5298c generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-0c7f4bfb/mentor-locked-360.png | Actual existing frontend mentor-locked,360px fixture capture | IW-A2 | 36572bytes/SHA25695e95b2385998698ac336bb5fe76ec8b4d2b25e4339f412070275aaac371b697 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-0c7f4bfb/student-light-360.png | Actual existing frontend student-light,360px fixture capture | IW-A2 | 103867bytes/SHA25690a1d0ee930c2588a557fb59af74645b7ef782f769569b9f6cb97785fa1e7dc3 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-0c7f4bfb/mentor-light-360.png | Actual existing frontend mentor-light,360px fixture capture | IW-A2 | 199927bytes/SHA256efbbdcfdbf676f5f80d9443b2cfc86734a0e073197061d450579cb027286bd20 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-0c7f4bfb/switcher-open-attempt-360.png | Actual existing frontend switcher-open-attempt,360px fixture capture | IW-A2 | 113620bytes/SHA256b6ebf0afd3936b31708d5779c6537bf5ab4a9dc368397c838f263f3249c35b3e generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-0c7f4bfb/student-empty-768.png | Actual existing frontend student-empty,768px fixture capture | IW-A2 | 79727bytes/SHA2565a0437edf7a78068f430e98386d43f655038d7ee7552ff9853df513844b30897 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-0c7f4bfb/student-failed-768.png | Actual existing frontend student-failed,768px fixture capture | IW-A2 | 81468bytes/SHA256cb535ba302e9d9f56a0592bd79087975a78944e8d0a1872226b84b54d90af4fb generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-0c7f4bfb/mentor-pending-768.png | Actual existing frontend mentor-pending,768px fixture capture | IW-A2 | 121530bytes/SHA256a922a9466178f42aa12296672cca35144766ab738ebe37164bb7e2ae38584e3a generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-0c7f4bfb/mentor-locked-768.png | Actual existing frontend mentor-locked,768px fixture capture | IW-A2 | 58069bytes/SHA256bdcc9976bce68e3655d5cf21b42ea96cc31941815c6b67192f526b276c9b5e62 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-0c7f4bfb/student-light-768.png | Actual existing frontend student-light,768px fixture capture | IW-A2 | 114232bytes/SHA256d6344abb0abd192a1d84965fdcc9bffa4ff54b3c1e9929f8304787b78cde0023 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-0c7f4bfb/mentor-light-768.png | Actual existing frontend mentor-light,768px fixture capture | IW-A2 | 311463bytes/SHA256b811bd58571321626652e1ec64ef713096daed452450e3fe938ab1cae7feeaa8 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-0c7f4bfb/switcher-open-attempt-768.png | Actual existing frontend switcher-open-attempt,768px fixture capture | IW-A2 | 120350bytes/SHA256b77d00c12e8d620caf5ff8dc2a947d75e1c1b77bb99372dcfb52075fbda12012 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-0c7f4bfb/student-empty-1280.png | Actual existing frontend student-empty,1280px fixture capture | IW-A2 | 106362bytes/SHA256f38525249075e46716bffa07acb699b460409c4e6a76cc427d96b05c5b710065 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-0c7f4bfb/student-failed-1280.png | Actual existing frontend student-failed,1280px fixture capture | IW-A2 | 100078bytes/SHA256ef976aa9d2a330d51f09e670ec2abf15a678c4af8f73163bafcd0f4c888d9a16 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-0c7f4bfb/mentor-pending-1280.png | Actual existing frontend mentor-pending,1280px fixture capture | IW-A2 | 166929bytes/SHA256f728ef076ec8b8685e232d8e2b782c297198ffc7132911ebbb110ecf16bddfc3 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-0c7f4bfb/mentor-locked-1280.png | Actual existing frontend mentor-locked,1280px fixture capture | IW-A2 | 67837bytes/SHA25632f45b8c57a0e20b51efd8df39e3dd4fedd8a1163780f1daa544dcc13b59e84c generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-0c7f4bfb/student-light-1280.png | Actual existing frontend student-light,1280px fixture capture | IW-A2 | 141500bytes/SHA256ce2abc131dbed320e9cdfc3f35e114749870938b0079d9fb8e9c1db17e888428 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-0c7f4bfb/mentor-light-1280.png | Actual existing frontend mentor-light,1280px fixture capture | IW-A2 | 428741bytes/SHA2561cdc8a534868e4d70a1e3d4f51c17632c976aee7dcebd6b493c9d8412e119dd6 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-0c7f4bfb/switcher-open-attempt-1280.png | Actual existing frontend switcher-open-attempt,1280px fixture capture | IW-A2 | 184282bytes/SHA2568ca14609c4a0d57f93c6364c66e968ee44bb80aa6f64b7e9ee24f8c0fe59e0e1 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-0c7f4bfb/journey-1-levels-1280.png | Actual existing frontend journey-1-levels,1280px fixture capture | IW-A2 | 335931bytes/SHA256d5b1068acd2023647cbfe57b11b134036e55c88bf8d4c551d6d7ddf48e27ab23 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-0c7f4bfb/journey-30-levels-1280.png | Actual existing frontend journey-30-levels,1280px fixture capture | IW-A2 | 534439bytes/SHA2561b03afd7e0a50cec483155161e4aa49514efe5834d3fc3dcb76b58caaf5af363 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-0c7f4bfb/journey-100-levels-1280.png | Actual existing frontend journey-100-levels,1280px fixture capture | IW-A2 | 841875bytes/SHA25646aaef3490f62277408dbbe0ffaf0a7e098c8e9fd6f663bb07cf902e8048d3ca generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-0c7f4bfb/journey-300-levels-1280.png | Actual existing frontend journey-300-levels,1280px fixture capture | IW-A2 | 904135bytes/SHA25635e7b4e6fd0cf77c634b3eed919a3e96c75ae2c2a572fe8481b6b2f84afbd335 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-0c7f4bfb/capture-results.json | Synthetic current-frontend capture/interaction/axe/network/headless metrics and terminal status | IW-A2 | 142214bytes/SHA256bd389a32d277222ac1e7c7063ecf81071895d781f6314414be6a95bdc4d6060e generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-7cf5d245/runtime-switcher-attempt-360.png | Actual existing frontend runtime-switcher-attempt,360px fixture capture | IW-A2 | 112173bytes/SHA256e863cf4047a7abe3389c247d312645f865276638db570cb2d82ddc13ee910afa generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-7cf5d245/runtime-reflow-css2x-360.png | Actual existing frontend runtime-reflow-css2x,360px fixture capture | IW-A2 | 52683bytes/SHA256aa02cbeaab36ab4ffc2506c2e20deda51226f895f65878b299fbbc73dbddf692 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-7cf5d245/runtime-identity-before-360.png | Actual existing frontend runtime-identity-before,360px fixture capture | IW-A2 | 16192bytes/SHA256f725203b63198072ddb48c83703a1be956329acc12197e9599221dc840ca98ef generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-7cf5d245/identity-choice-360.png | Actual existing frontend identity-choice,360px fixture capture | IW-A2 | 99879bytes/SHA256f4239c01d4962866207ed5583ae70cde4b1bf0106dc256020af45985bb5d985f generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-7cf5d245/runtime-switcher-attempt-768.png | Actual existing frontend runtime-switcher-attempt,768px fixture capture | IW-A2 | 133335bytes/SHA256c14cb26d163f935933e0adc6b77b9cecdc5a0c9a73d651dcc5802d9b4119ccf4 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-7cf5d245/runtime-reflow-css2x-768.png | Actual existing frontend runtime-reflow-css2x,768px fixture capture | IW-A2 | 99959bytes/SHA25634913ea7115ce7e83458b543665646c4a77c64a51569d488a0ed813b470fe6d1 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-7cf5d245/runtime-identity-before-768.png | Actual existing frontend runtime-identity-before,768px fixture capture | IW-A2 | 40275bytes/SHA25618085f97daa3654571bb8e3243988b37fec90721029e972604ede8102ac4acf2 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-7cf5d245/identity-choice-768.png | Actual existing frontend identity-choice,768px fixture capture | IW-A2 | 133920bytes/SHA256ff42b0b1699ff8d9686ba917916b0b5d4c320cbe79ba14a60cd08b0ffc08f253 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-7cf5d245/runtime-switcher-attempt-1280.png | Actual existing frontend runtime-switcher-attempt,1280px fixture capture | IW-A2 | 90980bytes/SHA256c3dbb298889983d141adb1a80b6fca3779f49aec029c369cc26759f86bb33896 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-7cf5d245/runtime-reflow-css2x-1280.png | Actual existing frontend runtime-reflow-css2x,1280px fixture capture | IW-A2 | 115010bytes/SHA256b21262f5680ea4e72c6376257ea103a51a3e47cf691ba018494a123e4c98ecd1 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-7cf5d245/runtime-identity-before-1280.png | Actual existing frontend runtime-identity-before,1280px fixture capture | IW-A2 | 165646bytes/SHA256f964d3fa2b4e050c9dc7e574b119c924150a49d264c7d9aaf7711fb745c2b0ab generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-7cf5d245/identity-choice-1280.png | Actual existing frontend identity-choice,1280px fixture capture | IW-A2 | 100582bytes/SHA2567bc6604810cd441237e34fa5bf7c7f7bfc450a68b450b98a43664d44ce26ba2e generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-7cf5d245/transit-normal-1280.png | Actual existing frontend transit-normal,1280px fixture capture | IW-A2 | 169745bytes/SHA256a70e200439744970a4dbe27061efd5c8eb42e780beda44dca03033c70e3a33d3 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-7cf5d245/transit-slow-1280.png | Actual existing frontend transit-slow,1280px fixture capture | IW-A2 | 169784bytes/SHA256133bbefbbb4f38e53da6e42dbce9c8e7fe16abbce9d288e29e1ec00342750339 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-7cf5d245/transit-failed-1280.png | Actual existing frontend transit-failed,1280px fixture capture | IW-A2 | 108918bytes/SHA256a12047bfa6d972f960d942dfd872ae469705487ff9ffa40106f847d06e19cf3a generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-7cf5d245/transit-reduced-motion-1280.png | Actual existing frontend transit-reduced-motion,1280px fixture capture | IW-A2 | 156810bytes/SHA256dcbc710c771434a4b0a67abf93a06da267bacdf47386a9aa18a230c8439d33ad generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-7cf5d245/runtime-journey-1-3d-1280.png | Actual existing frontend runtime-journey-1-3d,1280px fixture capture | IW-A2 | 331338bytes/SHA2569b66422efd7da876df8ca335ff81d21cccac047f69b6f76b4f1915128d6a866d generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-7cf5d245/runtime-journey-30-3d-1280.png | Actual existing frontend runtime-journey-30-3d,1280px fixture capture | IW-A2 | 566112bytes/SHA256bf1493a90f5cfa984ea091f400c48fabe811860f9a2e91305dff480cb502fc5f generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-7cf5d245/runtime-context-lost-1280.png | Actual existing frontend runtime-context-lost,1280px fixture capture | IW-A2 | 186503bytes/SHA256a67d24fcfc8d1a6d2f58857fce0b5c381e77ed108c2794e0dd347ed26dcfd871 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-7cf5d245/runtime-journey-100-3d-1280.png | Actual existing frontend runtime-journey-100-3d,1280px fixture capture | IW-A2 | 842172bytes/SHA25636bdf6094f2c47478a0614169f1f6679a239c4b96374c5d0ee4a086c323e10d5 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-7cf5d245/capture-results.json | Synthetic current-frontend capture/interaction/axe/network/headless metrics and terminal status | IW-A2 | 625927bytes/SHA25639a70620f2f7f4ed5b191df3d61b9ab533200c38021a69369fcaf63bd32c57b8 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-0df3369e/runtime-switcher-attempt-1280.png | Actual existing frontend runtime-switcher-attempt,1280px fixture capture | IW-A2 | 94968bytes/SHA25685fda95b17ad9d84e6a82b571d07ec440dd8bf91ff32e0ba0942d5719446cb27 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-0df3369e/runtime-reflow-css2x-1280.png | Actual existing frontend runtime-reflow-css2x,1280px fixture capture | IW-A2 | 131511bytes/SHA2563c36cfb2632893de9c63c53ac35ff4bb16cab86bbda5886c71204f511d86d617 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-0df3369e/runtime-identity-before-1280.png | Actual existing frontend runtime-identity-before,1280px fixture capture | IW-A2 | 165369bytes/SHA2561c1cf3ec081ed2e33a394fc7a0138c0098b87cc9096226e2b97cee292002eb99 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-0df3369e/identity-choice-1280.png | Actual existing frontend identity-choice,1280px fixture capture | IW-A2 | 93260bytes/SHA2560841b76a8af1fabc7d0e5e2c1f9ca2b3aa8b288765f86c61bd40c093d23870d5 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| docs/progress/screenshots/identity-worlds/iw-a2-20261109-0df3369e/capture-results.json | Synthetic current-frontend capture/interaction/axe/network/headless metrics and terminal status | IW-A2 | 483449bytes/SHA256cb31e6d1d2a9d048447eff18931893db7fa810fd77d4216b838ccdf2ef7b46c0 generated and metadata verified; synthetic Chromium evidence | 2026-11-09 |
| .agent/side/shark-tank/snapshot-main.cjs | Local private snapshot helper | ST-0 | 10121bytes/SHA2560030aeb22279d1dd1ce4a6fbd9e261a43499ac2fbab9519365e70fb152d25dd9;syntaxverified | 2026-11-13 |
| .agent/side/main-state-copy/STATE.md | Verbatim main STATE.md before Shark Tank parking | ST-0 | 81541bytes/SHA256646347a54a390e1b189272fe4e94820f30a93ff501d5448f8e37644a5a94703f; private recovery, verified | 2026-11-13 |
| .agent/side/main-state-copy/HANDOFF.md | Verbatim main HANDOFF.md before Shark Tank parking | ST-0 | 76865bytes/SHA25622965fe48f562be11ff321c218fd81bc6110480b34fc31af62d98a859fc46dd9; private recovery, verified | 2026-11-13 |
| .agent/side/main-preservation.json | Safe-file restoration comparison baseline excluding secrets | ST-0 | 219906bytes/SHA2563314e65950db40b61e7d55027eed6a081563cb5191379da290f16fd013d2468c; private recovery, verified | 2026-11-13 |
| .agent/side/main-snapshot.md | Exact main gate/work/Git/process snapshot and restoration | ST-0 | 8264bytes/SHA256b4b86e024903d2a8554422c6e45732af2268cdc1766adea02cdff3ae0c380fe1; private recovery, verified | 2026-11-13 |
| .agent/side/shark-tank/MISSION.md | Private Shark Tank Stage0 authority/facts | ST-0 | 11177bytes/SHA25657f7a93a571df55da52fb391d106d82f076e2cc69a9a34d385af2a6095c5885b;ST-2 supplied-scope handover verified,WAITING_FOR_APPROVAL;not submission/founder facts/ST-3 approval | 2026-11-13 |
| .agent/side/shark-tank/FACTS.md | Private Shark Tank Stage0 founder descriptions, not shipped/traction evidence | ST-0 | 7743bytes/SHA256fc8a00d4c8cbb2b94bc65db680a086a4d12f99159691ea0e04100e195d206a46;ST-2 supplied-scope handover verified,WAITING_FOR_APPROVAL;not submission/founder facts/ST-3 approval | 2026-11-13 |
| .agent/side/shark-tank/STATE.md | Private Shark Tank Stage0 authority/facts | ST-0 | 4433bytes/SHA2562ae0fd5f0b50b8638e6dad13d6a24cf7b9840bd98431b70324f507c2891c03fc;ST-2 supplied-scope handover verified,WAITING_FOR_APPROVAL;not submission/founder facts/ST-3 approval | 2026-11-13 |
| docs/pitch/intake.md | Private Stage0 screenshot/rubric/founder-only intake batch | ST-0 | 6148bytes/SHA256efc060af83fa2828f4f0018bde6856e5d76a656d0f896c2977a225642d25492c;verified;no founder answers received | 2026-11-13 |
| docs/pitch/product-facts.md | Private source-backed product inventory, historical demo versus partial/planned boundaries | ST-0 | 31896bytes/SHA25675fac21585df52c986cebf00aacb01b1835f1977b36a224b9bb8123fc5e78196;46rows cover47auditreturns;links/bounds/characterschecked;runtimeNOT_RUN | 2026-11-13 |
| docs/pitch/checkpoints/ST-0.md | Shark Tank Stage0 checkpoint with explicit founder/input/demo holds | ST-0 | 8483bytes/SHA2569ebe481a1248293e9bd7bb3d34f2959827cfdd4e1c1856d13514c3448444a18b;ST-0 handover verified,WAITING_FOR_APPROVAL;not founder approval | 2026-11-13 |
| docs/pitch/strategy.md | Private bounded positioning/proof/ask working strategy, not public claims or answers | ST-1 | 2352bytes/13lines/SHA2562885ccfdc62baf1877582c45dac519500cdbb8715de0123c26f0737c7dbfcf3e;links/characters checked;founder facts pending | 2026-11-13 |
| docs/pitch/evidence-pack.md | Private dated external evidence and explicit retrieval gaps | ST-1 | 19802bytes/SHA2561eba94b05fb987801f81e3e2f032804d37904bfe97d79e3274c3a86827e947b8;31rows,12verified-attributed/19unverified;no product efficacy or public approval | 2026-11-13 |
| docs/pitch/survey/student-questionnaire.md | Private adult-only survey preparation; no respondent data or publication | ST-1 | 8132bytes/65lines/SHA256f31a3ed84849b6c7912c70fa554f77725060cb7385d5500dbb3497cc4aad5ac4;existence/links/characters verified;fieldwork NOT_RUN | 2026-11-13 |
| docs/pitch/survey/mentor-questionnaire.md | Private adult-only survey preparation; no respondent data or publication | ST-1 | 6266bytes/54lines/SHA2569fa8ab92e84f04e61e994b768cd96e7bca3661cb93030d0036ea4b7ebab2309e;existence/links/characters verified;fieldwork NOT_RUN | 2026-11-13 |
| docs/pitch/survey/fieldwork-and-analysis.md | Private adult-only survey preparation; no respondent data or publication | ST-1 | 9681bytes/75lines/SHA25653f7957b3684ad4d323488f17a225f579a7bb9730c9b15faa16562e7d3ba9b65;existence/links/characters verified;fieldwork NOT_RUN | 2026-11-13 |
| docs/pitch/survey/survey-brief.md | Private adult-only survey preparation; no respondent data or publication | ST-1 | 3328bytes/29lines/SHA256f21664cc23a393fd7928d76da38caef70a29dbce225b8d2707d9d013f719bf85;existence/links/characters verified;fieldwork NOT_RUN | 2026-11-13 |
| docs/pitch/checkpoints/ST-1.md | Shark Tank evidence/survey/strategy checkpoint with explicit source and founder holds | ST-1 | 7787bytes/68lines/SHA256f54b826605bc664de4bb0a44be6c3c6def4e04a406178d5b4832893ef4a03e64;ST-1 verified materials with declared gaps,WAITING_FOR_APPROVAL;no product or founder approval | 2026-11-13 |

| docs/pitch/answers.md | Incremental answers to founder-supplied form only; proof/coach notes private | ST-2 | 6071bytes/SHA256278614c486809b754dbf4407947f894fc2dfc3d909a92ba72900c03342f8bffe;ST-2 supplied-scope handover verified,WAITING_FOR_APPROVAL;not submission/founder facts/ST-3 approval | 2026-11-13 |
| docs/pitch/competition-brief.md | Founder-supplied event schedule/deck guide/unweighted rubric and organizer unknowns | ST-2 | 7427bytes/SHA256dd7a49e0e23a38271da905f407305c4f181eba2cc855edfee20b3bba74a20e97;ST-2 supplied-scope handover verified,WAITING_FOR_APPROVAL;not submission/founder facts/ST-3 approval | 2026-11-13 |
| docs/pitch/checkpoints/ST-2.md | Supplied registration-answer handover and verified competition criteria; founder facts outstanding | ST-2 | 6480bytes/SHA25665fe5c180ad964821a3469fe867e50b37bc68d304d5575ff58664413553d5676;ST-2 supplied-scope handover verified,WAITING_FOR_APPROVAL;not submission/founder facts/ST-3 approval | 2026-11-13 |
| docs/pitch/deck/task_pack.json | Single deck task and gate state | TBI-GEU-G0 | created and JSON verified; draft scope |2026-11-14|
| docs/pitch/deck/info_pack.json | Facts and source handoff | TBI-GEU-G0 | created and JSON verified; draft scope |2026-11-14|

| docs/pitch/deck/base.css | TBI-GEU draft source/build contract or asset | TBI-GEU-G0 | exists; draft, not final submission |2026-11-14|
| docs/pitch/deck/catalog_assets.py | TBI-GEU draft source/build contract or asset | TBI-GEU-G0 | exists; draft, not final submission |2026-11-14|
| docs/pitch/deck/deck-data.json | TBI-GEU draft source/build contract or asset | TBI-GEU-G0 | exists; draft, not final submission |2026-11-14|
| docs/pitch/deck/outline.md | TBI-GEU draft source/build contract or asset | TBI-GEU-G0 | exists; draft, not final submission |2026-11-14|
| docs/pitch/deck/assets/catalog.json | TBI-GEU draft source/build contract or asset | TBI-GEU-G0 | exists; draft, not final submission |2026-11-14|
| docs/pitch/deck/assets/catalog.md | TBI-GEU draft source/build contract or asset | TBI-GEU-G0 | exists; draft, not final submission |2026-11-14|
| docs/pitch/deck/assets/journey-crop.png | TBI-GEU draft source/build contract or asset | TBI-GEU-G0 | exists; draft, not final submission |2026-11-14|
| docs/pitch/deck/assets/recorder-crop.png | TBI-GEU draft source/build contract or asset | TBI-GEU-G0 | exists; draft, not final submission |2026-11-14|
| docs/pitch/deck/plan/deck.md | TBI-GEU draft source/build contract or asset | TBI-GEU-G0 | exists; draft, not final submission |2026-11-14|
| docs/pitch/deck/plan/design-brief.md | TBI-GEU draft source/build contract or asset | TBI-GEU-G0 | exists; draft, not final submission |2026-11-14|
| docs/pitch/deck/plan/grounded-knowledge.md | TBI-GEU draft source/build contract or asset | TBI-GEU-G0 | exists; draft, not final submission |2026-11-14|
| docs/pitch/deck/plan/slide_01.md | TBI-GEU draft source/build contract or asset | TBI-GEU-G0 | exists; draft, not final submission |2026-11-14|
| docs/pitch/deck/plan/slide_02.md | TBI-GEU draft source/build contract or asset | TBI-GEU-G0 | exists; draft, not final submission |2026-11-14|
| docs/pitch/deck/plan/slide_03.md | TBI-GEU draft source/build contract or asset | TBI-GEU-G0 | exists; draft, not final submission |2026-11-14|
| docs/pitch/deck/plan/slide_04.md | TBI-GEU draft source/build contract or asset | TBI-GEU-G0 | exists; draft, not final submission |2026-11-14|
| docs/pitch/deck/plan/slide_05.md | TBI-GEU draft source/build contract or asset | TBI-GEU-G0 | exists; draft, not final submission |2026-11-14|
| docs/pitch/deck/plan/slide_06.md | TBI-GEU draft source/build contract or asset | TBI-GEU-G0 | exists; draft, not final submission |2026-11-14|
| docs/pitch/deck/plan/slide_07.md | TBI-GEU draft source/build contract or asset | TBI-GEU-G0 | exists; draft, not final submission |2026-11-14|
| docs/pitch/deck/plan/slide_08.md | TBI-GEU draft source/build contract or asset | TBI-GEU-G0 | exists; draft, not final submission |2026-11-14|
| docs/pitch/deck/plan/slide_09.md | TBI-GEU draft source/build contract or asset | TBI-GEU-G0 | exists; draft, not final submission |2026-11-14|
| docs/pitch/deck/plan/slide_10.md | TBI-GEU draft source/build contract or asset | TBI-GEU-G0 | exists; draft, not final submission |2026-11-14|
| docs/pitch/deck/plan/slide_11.md | TBI-GEU draft source/build contract or asset | TBI-GEU-G0 | exists; draft, not final submission |2026-11-14|
| docs/pitch/deck/plan/slide_12.md | TBI-GEU draft source/build contract or asset | TBI-GEU-G0 | exists; draft, not final submission |2026-11-14|
| docs/pitch/deck/plan/slide_13.md | TBI-GEU draft source/build contract or asset | TBI-GEU-G0 | exists; draft, not final submission |2026-11-14|
| docs/pitch/deck/plan/slide_14.md | TBI-GEU draft source/build contract or asset | TBI-GEU-G0 | exists; draft, not final submission |2026-11-14|
| docs/pitch/deck/assets/vendor/echarts.min.js | TBI-GEU draft source/build contract or asset | TBI-GEU-G0 | exists; draft, not final submission |2026-11-14|

| docs/pitch/deck/build_model.py | TBI-GEU data-driven build/model/QA | TBI-GEU-G0 | exists; draft with evidence limits |2026-11-14|
| docs/pitch/deck/facts-needed.md | TBI-GEU data-driven build/model/QA | TBI-GEU-G0 | exists; draft with evidence limits |2026-11-14|
| docs/pitch/deck/finish_outputs.py | TBI-GEU data-driven build/model/QA | TBI-GEU-G0 | exists; draft with evidence limits |2026-11-14|
| docs/pitch/deck/generate_pages.mjs | TBI-GEU data-driven build/model/QA | TBI-GEU-G0 | exists; draft with evidence limits |2026-11-14|
| docs/pitch/deck/model-results.json | TBI-GEU data-driven build/model/QA | TBI-GEU-G0 | exists; draft with evidence limits |2026-11-14|
| docs/pitch/deck/qa-cheat-sheet.md | TBI-GEU data-driven build/model/QA | TBI-GEU-G0 | exists; draft with evidence limits |2026-11-14|
| docs/pitch/deck/render_deck.mjs | TBI-GEU data-driven build/model/QA | TBI-GEU-G0 | exists; draft with evidence limits |2026-11-14|
| docs/pitch/models/pitch-model.xlsx | TBI-GEU data-driven build/model/QA | TBI-GEU-G0 | exists; draft with evidence limits |2026-11-14|
| docs/pitch/models/use-of-funds.xlsx | TBI-GEU data-driven build/model/QA | TBI-GEU-G0 | exists; draft with evidence limits |2026-11-14|
| docs/pitch/survey/deadline-micro-survey.md | TBI-GEU data-driven build/model/QA | TBI-GEU-G0 | exists; draft with evidence limits |2026-11-14|

| docs/pitch/deck/v0/contact-sheet.png | Numbered deck export/QA artifact | TBI-GEU-G0 | file exists; rendered/versioned draft |2026-11-14|
| docs/pitch/deck/v0/Deck_v0.pdf | Numbered deck export/QA artifact | TBI-GEU-G0 | file exists; rendered/versioned draft |2026-11-14|
| docs/pitch/deck/v0/Deck_v0.pptx | Numbered deck export/QA artifact | TBI-GEU-G0 | file exists; rendered/versioned draft |2026-11-14|
| docs/pitch/deck/v0/geometry-checks.json | Numbered deck export/QA artifact | TBI-GEU-G0 | file exists; rendered/versioned draft |2026-11-14|
| docs/pitch/deck/v0/slide_01.pdf | Numbered deck export/QA artifact | TBI-GEU-G0 | file exists; rendered/versioned draft |2026-11-14|
| docs/pitch/deck/v0/slide_02.pdf | Numbered deck export/QA artifact | TBI-GEU-G0 | file exists; rendered/versioned draft |2026-11-14|
| docs/pitch/deck/v0/slide_03.pdf | Numbered deck export/QA artifact | TBI-GEU-G0 | file exists; rendered/versioned draft |2026-11-14|
| docs/pitch/deck/v0/slide_04.pdf | Numbered deck export/QA artifact | TBI-GEU-G0 | file exists; rendered/versioned draft |2026-11-14|
| docs/pitch/deck/v0/slide_05.pdf | Numbered deck export/QA artifact | TBI-GEU-G0 | file exists; rendered/versioned draft |2026-11-14|
| docs/pitch/deck/v0/slide_06.pdf | Numbered deck export/QA artifact | TBI-GEU-G0 | file exists; rendered/versioned draft |2026-11-14|
| docs/pitch/deck/v0/slide_07.pdf | Numbered deck export/QA artifact | TBI-GEU-G0 | file exists; rendered/versioned draft |2026-11-14|
| docs/pitch/deck/v0/slide_08.pdf | Numbered deck export/QA artifact | TBI-GEU-G0 | file exists; rendered/versioned draft |2026-11-14|
| docs/pitch/deck/v0/slide_09.pdf | Numbered deck export/QA artifact | TBI-GEU-G0 | file exists; rendered/versioned draft |2026-11-14|
| docs/pitch/deck/v0/slide_10.pdf | Numbered deck export/QA artifact | TBI-GEU-G0 | file exists; rendered/versioned draft |2026-11-14|
| docs/pitch/deck/v0/slide_11.pdf | Numbered deck export/QA artifact | TBI-GEU-G0 | file exists; rendered/versioned draft |2026-11-14|
| docs/pitch/deck/v0/slide_12.pdf | Numbered deck export/QA artifact | TBI-GEU-G0 | file exists; rendered/versioned draft |2026-11-14|
| docs/pitch/deck/v0/slide_13.pdf | Numbered deck export/QA artifact | TBI-GEU-G0 | file exists; rendered/versioned draft |2026-11-14|
| docs/pitch/deck/v0/slide_14.pdf | Numbered deck export/QA artifact | TBI-GEU-G0 | file exists; rendered/versioned draft |2026-11-14|
| docs/pitch/deck/v0/speaker-notes.md | Numbered deck export/QA artifact | TBI-GEU-G0 | file exists; rendered/versioned draft |2026-11-14|

| docs/pitch/deck/add_notes.py | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/build_deck.mjs | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/check_outputs.py | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/contact-sheet.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/make-preview.mjs | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/present.html | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/preservation-check.json | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/q-and-a-one-page.md | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/qa-report.md | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/speaker-notes.md | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/speech.md | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/submission-checklist.md | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/tighten_notes.py | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/slides/slide_01.html | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/slides/slide_02.html | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/slides/slide_03.html | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/slides/slide_04.html | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/slides/slide_05.html | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/slides/slide_06.html | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/slides/slide_07.html | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/slides/slide_08.html | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/slides/slide_09.html | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/slides/slide_10.html | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/slides/slide_11.html | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/slides/slide_12.html | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/slides/slide_13.html | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/slides/slide_14.html | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v1/contact-sheet.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v1/Deck_v1.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v1/Deck_v1.pptx | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v1/geometry-checks.json | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v1/qa-metrics.json | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v1/qa-report.md | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v1/slide_01.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v1/slide_02.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v1/slide_03.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v1/slide_04.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v1/slide_05.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v1/slide_06.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v1/slide_07.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v1/slide_08.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v1/slide_09.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v1/slide_10.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v1/slide_11.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v1/slide_12.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v1/slide_13.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v1/slide_14.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v1/speaker-notes.md | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v2/contact-sheet.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v2/Deck_v2.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v2/Deck_v2.pptx | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v2/geometry-checks.json | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v2/qa-metrics.json | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v2/slide_01.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v2/slide_02.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v2/slide_03.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v2/slide_04.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v2/slide_05.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v2/slide_06.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v2/slide_07.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v2/slide_08.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v2/slide_09.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v2/slide_10.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v2/slide_11.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v2/slide_12.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v2/slide_13.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v2/slide_14.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v2/speaker-notes.md | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v3/contact-sheet.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v3/Deck_v3.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v3/Deck_v3.pptx | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v3/geometry-checks.json | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v3/qa-metrics.json | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v3/slide_01.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v3/slide_02.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v3/slide_03.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v3/slide_04.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v3/slide_05.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v3/slide_06.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v3/slide_07.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v3/slide_08.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v3/slide_09.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v3/slide_10.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v3/slide_11.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v3/slide_12.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v3/slide_13.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v3/slide_14.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v3/speaker-notes.md | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v4/contact-sheet.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v4/Deck_v4.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v4/Deck_v4.pptx | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v4/geometry-checks.json | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v4/qa-metrics.json | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v4/qa-report.md | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v4/slide_01.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v4/slide_02.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v4/slide_03.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v4/slide_04.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v4/slide_05.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v4/slide_06.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v4/slide_07.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v4/slide_08.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v4/slide_09.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v4/slide_10.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v4/slide_11.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v4/slide_12.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v4/slide_13.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v4/slide_14.pdf | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v4/speaker-notes.md | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v4/renders/slide_01.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v4/renders/slide_02.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v4/renders/slide_03.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v4/renders/slide_04.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v4/renders/slide_05.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v4/renders/slide_06.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v4/renders/slide_07.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v4/renders/slide_08.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v4/renders/slide_09.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v4/renders/slide_10.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v4/renders/slide_11.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v4/renders/slide_12.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v4/renders/slide_13.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v4/renders/slide_14.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v3/renders/slide_01.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v3/renders/slide_02.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v3/renders/slide_03.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v3/renders/slide_04.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v3/renders/slide_05.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v3/renders/slide_06.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v3/renders/slide_07.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v3/renders/slide_08.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v3/renders/slide_09.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v3/renders/slide_10.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v3/renders/slide_11.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v3/renders/slide_12.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v3/renders/slide_13.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v3/renders/slide_14.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v2/renders/slide_01.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v2/renders/slide_02.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v2/renders/slide_03.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v2/renders/slide_04.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v2/renders/slide_05.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v2/renders/slide_06.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v2/renders/slide_07.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v2/renders/slide_08.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v2/renders/slide_09.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v2/renders/slide_10.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v2/renders/slide_11.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v2/renders/slide_12.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v2/renders/slide_13.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v2/renders/slide_14.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v1/renders/slide_01.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v1/renders/slide_02.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v1/renders/slide_03.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v1/renders/slide_04.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v1/renders/slide_05.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v1/renders/slide_06.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v1/renders/slide_07.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v1/renders/slide_08.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v1/renders/slide_09.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v1/renders/slide_10.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v1/renders/slide_11.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v1/renders/slide_12.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v1/renders/slide_13.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v1/renders/slide_14.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v0/renders/slide_01.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v0/renders/slide_02.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v0/renders/slide_03.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v0/renders/slide_04.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v0/renders/slide_05.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v0/renders/slide_06.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v0/renders/slide_07.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v0/renders/slide_08.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v0/renders/slide_09.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v0/renders/slide_10.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v0/renders/slide_11.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v0/renders/slide_12.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v0/renders/slide_13.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/deck/v0/renders/slide_14.png | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| docs/pitch/checkpoints/G1-TBI-GEU.md | TBI-GEU numbered draft/build/QA | TBI-GEU-G1 | exists; qualified draft |2026-11-14|
| .agent/RESUME_MAIN.md | Fresh main indexing recovery pointer | IW-C-MLOCK / CP-IDX | exists; branch/gates/limits verified | 2026-11-15 |
| .agent/index/INDEX.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/MANIFEST.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/PROGRESS.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/manifest.ndjson | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/batches.ndjson | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/coverage.ndjson | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/manifest.cjs | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/refine-manifest.cjs | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/update-progress.cjs | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/agent-control.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/docs-design-v3.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/docs-design.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/docs-plan.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/agent-side.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/docs-design-v2.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/docs-plan-v2.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/docs-launch-video-script.md.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/docs-pitch.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/docs-progress-checkpoints.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/docs-progress.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/pitch-titles.cjs | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/control-partials.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/OPEN_WORK.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/DRIFT.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/registered.ndjson | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/docs-progress-screenshots.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/accounting.test.cjs | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/reconcile-index.cjs | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/accounting-red.log | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/accounting-green.log | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/accounting-cache-red.log | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/accounting-final-green.log | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/backend-config.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/backend-middleware.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/backend-routes.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/backend-controllers.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/backend-data.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/backend-models.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/backend-root.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/backend-services.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/backend-utils.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/backend-workers.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/frontend-src-root.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/frontend-hooks.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/frontend-services.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/frontend-soul.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/frontend-store.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/frontend-data.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/frontend-pages.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/frontend-studio.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/frontend-utils.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/frontend-components.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/frontend-whiteboard.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/frontend-cosmic.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/import-reviewed.cjs | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/PROJECT_BRIEF.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/frontend-admin.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/backend-tests.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/frontend-tests.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/shared.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/frontend-public.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/frontend-root.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/frontend-scripts.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/frontend-test-results.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/root.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/vscode.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/backend-scripts.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/github.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/modules/scripts.md | Bounded project index/control artifact | IW-C-MLOCK / CP-IDX | exists; indexing in progress, not runtime proof | 2026-11-15 |
| .agent/index/accounting-final-verification.log | CP-IDX source index or verification artifact | IW-C-MLOCK / CP-IDX | exists; assigned-depth evidence, not application acceptance | 2026-11-15 |
| .agent/index/accounting-import-green.log | CP-IDX source index or verification artifact | IW-C-MLOCK / CP-IDX | exists; assigned-depth evidence, not application acceptance | 2026-11-15 |
| .agent/index/accounting-import-red-corrected.log | CP-IDX source index or verification artifact | IW-C-MLOCK / CP-IDX | exists; assigned-depth evidence, not application acceptance | 2026-11-15 |
| .agent/index/accounting-import-red.log | CP-IDX source index or verification artifact | IW-C-MLOCK / CP-IDX | exists; assigned-depth evidence, not application acceptance | 2026-11-15 |
| .agent/index/close-index-records.cjs | CP-IDX source index or verification artifact | IW-C-MLOCK / CP-IDX | exists; assigned-depth evidence, not application acceptance | 2026-11-15 |
| .agent/index/finalize-metadata.cjs | CP-IDX source index or verification artifact | IW-C-MLOCK / CP-IDX | exists; assigned-depth evidence, not application acceptance | 2026-11-15 |
| .agent/index/finish-verification.cjs | CP-IDX source index or verification artifact | IW-C-MLOCK / CP-IDX | exists; assigned-depth evidence, not application acceptance | 2026-11-15 |
| .agent/index/METADATA_CHECK.md | CP-IDX source index or verification artifact | IW-C-MLOCK / CP-IDX | exists; assigned-depth evidence, not application acceptance | 2026-11-15 |
| .agent/index/register-final.cjs | CP-IDX source index or verification artifact | IW-C-MLOCK / CP-IDX | exists; assigned-depth evidence, not application acceptance | 2026-11-15 |
| .agent/index/REGISTRATION_PENDING.md | CP-IDX source index or verification artifact | IW-C-MLOCK / CP-IDX | exists; assigned-depth evidence, not application acceptance | 2026-11-15 |
| .agent/index/source-observations.ndjson | CP-IDX source index or verification artifact | IW-C-MLOCK / CP-IDX | exists; assigned-depth evidence, not application acceptance | 2026-11-15 |
| .agent/index/SPOT_CHECKS.md | CP-IDX source index or verification artifact | IW-C-MLOCK / CP-IDX | exists; assigned-depth evidence, not application acceptance | 2026-11-15 |
| .agent/index/modules/frontend-android.md | CP-IDX source index or verification artifact | IW-C-MLOCK / CP-IDX | exists; assigned-depth evidence, not application acceptance | 2026-11-15 |
| .agent/index/modules/marketing.md | CP-IDX source index or verification artifact | IW-C-MLOCK / CP-IDX | exists; assigned-depth evidence, not application acceptance | 2026-11-15 |
| docs/progress/checkpoints/CP-IDX.md | CP-IDX source index or verification artifact | IW-C-MLOCK / CP-IDX | exists; assigned-depth evidence, not application acceptance | 2026-11-15 |

- docs/pitch/deck/deck-layout.json — JobD D1 draft artifact, verified existence2026-11-16; scoped QA/factholds in checkpoint.


- docs/pitch/deck/sources.json — JobD D1 draft artifact, verified existence2026-11-16; scoped QA/factholds in checkpoint.


- docs/pitch/deck/native/contracts.mjs — JobD D1 draft artifact, verified existence2026-11-16; scoped QA/factholds in checkpoint.


- docs/pitch/deck/native/contracts.test.mjs — JobD D1 draft artifact, verified existence2026-11-16; scoped QA/factholds in checkpoint.


- docs/pitch/deck/native/render.mjs — JobD D1 draft artifact, verified existence2026-11-16; scoped QA/factholds in checkpoint.


- docs/pitch/deck/native/measure_text.py — JobD D1 draft artifact, verified existence2026-11-16; scoped QA/factholds in checkpoint.


- docs/pitch/deck/native/model.mjs — JobD D1 draft artifact, verified existence2026-11-16; scoped QA/factholds in checkpoint.


- docs/pitch/deck/native/finish.mjs — JobD D1 draft artifact, verified existence2026-11-16; scoped QA/factholds in checkpoint.


- docs/pitch/deck/native/notes.mjs — JobD D1 draft artifact, verified existence2026-11-16; scoped QA/factholds in checkpoint.


- docs/pitch/deck/native/check_artifacts.py — JobD D1 draft artifact, verified existence2026-11-16; scoped QA/factholds in checkpoint.


- docs/pitch/deck/qa/visual-review.md — JobD D1 draft artifact, verified existence2026-11-16; scoped QA/factholds in checkpoint.


- docs/pitch/deck/plan/native-d1-build.md — JobD D1 draft artifact, verified existence2026-11-16; scoped QA/factholds in checkpoint.


- docs/pitch/published-evidence-update.md — JobD D1 draft artifact, verified existence2026-11-16; scoped QA/factholds in checkpoint.


- docs/pitch/funding-proposal.md — JobD D1 draft artifact, verified existence2026-11-16; scoped QA/factholds in checkpoint.


- docs/pitch/models/launch-budget.xlsx — JobD D1 draft artifact, verified existence2026-11-16; scoped QA/factholds in checkpoint.


- docs/pitch/checkpoints/D1.md — JobD D1 draft artifact, verified existence2026-11-16; scoped QA/factholds in checkpoint.


- docs/pitch/deck/versions/v12/artifact-check.json — JobD D1 draft artifact, verified existence2026-11-16; scoped QA/factholds in checkpoint.


- docs/pitch/deck/versions/v12/contact-sheet.png — JobD D1 draft artifact, verified existence2026-11-16; scoped QA/factholds in checkpoint.


- docs/pitch/deck/versions/v12/Deck_v12.pdf — JobD D1 draft artifact, verified existence2026-11-16; scoped QA/factholds in checkpoint.


- docs/pitch/deck/versions/v12/Deck_v12.pptx — JobD D1 draft artifact, verified existence2026-11-16; scoped QA/factholds in checkpoint.


- docs/pitch/deck/versions/v12/Deck_v12_presentation-safe.pptx — JobD D1 draft artifact, verified existence2026-11-16; scoped QA/factholds in checkpoint.


- docs/pitch/deck/versions/v12/density-report.json — JobD D1 draft artifact, verified existence2026-11-16; scoped QA/factholds in checkpoint.


- docs/pitch/deck/versions/v12/qa-report.md — JobD D1 draft artifact, verified existence2026-11-16; scoped QA/factholds in checkpoint.


- docs/pitch/deck/versions/v12/speaker-notes.md — JobD D1 draft artifact, verified existence2026-11-16; scoped QA/factholds in checkpoint.

