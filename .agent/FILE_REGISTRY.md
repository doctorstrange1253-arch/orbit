# FILE_REGISTRY

One literal project-relative path per row. Reconstructed entries establish location, not feature completion. Test results and approvals belong in TASKS.md and STATE.md. Generated scratch, quarantine and dependency files are excluded from this registry.

| Path | Purpose | Task | Status | Date |
|---|---|---|---|---|
| .gitignore | Repository exclusions | R-cleanup | existing | 2026-11-05 |
| CLAUDE.md | Session instructions | R3 | existing; stale statements need reconciliation | 2026-11-05 |
| .agent/STATE.md | Current verified state | F7 | active | 2026-11-05 |
| .agent/HANDOFF.md | Next-session instructions | F7 | active | 2026-11-05 |
| .agent/PATHS.md | Canonical file locations | R3 | active | 2026-11-05 |
| .agent/FILE_REGISTRY.md | Literal file registry | F7a | normalized | 2026-11-05 |
| .agent/TASKS.md | Task status and evidence | F7 | active | 2026-11-05 |
| .agent/DECISIONS.md | Approvals and decisions | R3 | active | 2026-11-05 |
| .agent/ERRORS.md | Failures and corrective actions | F7 | active | 2026-11-05 |
| .agent/ENVIRONMENT.md | Verified command environment | F7a | active | 2026-11-05 |
| .agent/SESSION_LOG.md | Append-only event history | F7 | active | 2026-11-05 |
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
| FrontEnd/src/hooks/useLazyScene.js | Earlier lazy-render helper | scaffold | lint failure; retained | 2026-11-05 |
| FrontEnd/src/hooks/useContextLossWarning.js | Earlier context-warning helper | scaffold | reconstructed; not GPU recovery | 2026-11-05 |
| FrontEnd/src/services/aiQuiz.js | Quiz service client | M3 | pre-existing work preserved | 2026-11-05 |
| FrontEnd/src/utils/emojiGuard.js | Earlier runtime Unicode scanner | scaffold | parse failure; retained | 2026-11-05 |
| FrontEnd/tests/CourseSpaceJourney3D.test.jsx | Earlier prototype smoke tests | M3 | current unit suite passes | 2026-11-05 |
| FrontEnd/tests/CourseSpaceJourneyWorld.test.jsx | Scene shell tests | F1-F6 | regression expansion pending | 2026-11-05 |
| FrontEnd/tests/cosmic.test.jsx | Planet layout tests | F4 | current unit suite passes | 2026-11-05 |
| FrontEnd/tests/cosmic-components.test.jsx | Cosmic component tests | F0 | current unit suite passes | 2026-11-05 |
| FrontEnd/tests/LookDevLab.test.jsx | Lab component tests | F3 | current unit suite passes | 2026-11-05 |
| FrontEnd/tests/PlanetSurface.test.jsx | Planet geometry tests | F4 | current unit suite passes | 2026-11-05 |
| FrontEnd/tests/Shuttle.test.jsx | Shuttle tests | F5 | behavioral coverage under review | 2026-11-05 |
| FrontEnd/tests/Station.test.jsx | Station tests | F6 | current unit suite passes | 2026-11-05 |
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
| docs/design/tooling.md | Tool decisions | P3 | historical; estimates not measurements | 2026-11-05 |
| docs/design/research-log.md | Research notes | P4 | contains unverified leads | 2026-11-05 |
| docs/progress/TASKS.md | Earlier progress ledger | R0 | superseded by .agent/TASKS.md | 2026-11-05 |
| docs/progress/milestone-ledger.md | Earlier milestone claims | P2 | not current acceptance evidence | 2026-11-05 |
| docs/progress/bug-audit.md | Twelve independently verified F7 follow-up findings | F7 | remediation open | 2026-11-05 |
| docs/progress/recovery-report.md | Earlier recovery report | R5 | historical; corrections in current STATE | 2026-11-05 |
| docs/progress/skills-routing.md | Skill routing inventory | P1 | historical; reread skill before use | 2026-11-05 |
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
