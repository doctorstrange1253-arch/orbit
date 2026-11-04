# FILE_REGISTRY — files created or significantly changed by agents

Method: from `git status --short` (2026-11-04) + docs dirs + .agent + scripts/agent. Purposes marked UNVERIFIED where not read this session.

| Path | Purpose | Task | Status | Date |
|---|---|---|---|---|
| BackEnd/middleware/identity.js | RBAC rolesVersion stale-token rejection | M1 | modified, unverified content this session | 2026-11-03 |
| BackEnd/models/WebhookEvent.js | idempotent Razorpay webhook ledger | M1 | new | 2026-11-03 |
| BackEnd/services/billingPlans.js | tiers, INR paise, 20% fee | M2 | modified | 2026-11-03 |
| BackEnd M1/M2 wiring files (controllers/sessionsController.js, routes/courseRoutes.js, server.js, .env.example, package.json, package-lock.json, tests/billingPlans.test.js) | M1/M2 wiring | M1/M2 | modified (earlier sessions, unstaged) | 2026-11-03 |
| BackEnd/models/Quiz.js | standalone AI quiz question doc | M3 | new | 2026-11-03 |
| BackEnd M2/M3 engine files (services/ollamaService.js, controllers/aiQuizController.js + courseRequestController.js, routes/aiQuizRoutes.js, tests/courseRequest.test.js + identityMiddleware.test.js, models/CourseRequest.js) | Ollama RAG quiz + course-request engine | M2/M3 | new (earlier sessions, unstaged) | 2026-11-03 |
| FrontEnd/src/services/aiQuiz.js | AI quiz client, `/ai` prefix fix | M3 | new | 2026-11-03 |
| FrontEnd/src/cosmic/AICourseQuizPanel.jsx | mentor review queue UI | M3 | new | 2026-11-03 |
| FrontEnd/src/cosmic/CourseSpaceJourney3D.jsx | R3F solar-system course map (prototype) | M3 | legacy (superseded by CourseSpaceJourneyWorld; quarantine candidate) | 2026-11-02 |
| FrontEnd M3 wiring files (pages/CourseLearn.jsx, pages/mentor/LessonEdit.jsx, components/layout/Navbar.jsx) | mounted 3D map + quiz panel wiring | M3 | modified (earlier sessions, unstaged) | 2026-11-03 |
| FrontEnd/package.json, package-lock.json | deps: three/fiber/drei + F3 tooling (postprocessing, leva, r3f-perf, playwright, @playwright/test, axe-core) | M3/F3 | modified, committed (25ee1a7 + 70ba5d5 + 08e69cf) | 2026-11-04 |
| FrontEnd/tests/CourseSpaceJourney3D.test.jsx | 4 smoke tests for 3D component | M3 | new | 2026-11-03 |
| FrontEnd/tests/cosmic.test.jsx | PlanetGenerator unit tests | Phase4-scaffold | new, expected to PASS (pure fns) | 2026-11-04 |
| FrontEnd/tests/cosmic-components.test.jsx | component smoke tests; FIXED 2026-11-04 (imports real CourseSpaceJourney3D, pure-fn PlanetGenerator test) — now passing | Phase4-scaffold | fixed, commit 70ba5d5 | 2026-11-04 |
| FrontEnd/src/cosmic/CourseSpaceJourneyWorld.jsx | Phase 6 F1 scene shell (lazy Canvas, tiers, ctx-loss, 2D fallback) | F1 | done, commit 1a2aea6 | 2026-11-04 |
| FrontEnd/tests/CourseSpaceJourneyWorld.test.jsx | 6 tests for the world shell | F1 | done, commit 1a2aea6 | 2026-11-04 |
| FrontEnd/src/pages/CourseLearn.jsx | lazy-mounts CourseSpaceJourneyWorld (supersedes M3 prototype mount) | F1 | done, commit 1a2aea6 | 2026-11-04 |
| FrontEnd/src/cosmic/CourseSpaceJourney3D.jsx | old prototype, now unused by CourseLearn — candidate for quarantine after world verified | M3 | legacy, pending decision | 2026-11-02 |
| FrontEnd/src/cosmic/PlanetGenerator.jsx | seeded planet layout generator; default export returns object not JSX — needs component fix | Phase4-scaffold | new, contract bug (E8) | 2026-11-04 |
| FrontEnd/src/cosmic/StarfieldBackdrop.jsx | instanced starfield points + shaders | Phase4-scaffold | new, UNVERIFIED render | 2026-11-04 |
| FrontEnd/src/cosmic/twinkleBackdrop.jsx | nebula pulse backdrop | Phase4-scaffold | new, UNVERIFIED render | 2026-11-04 |
| FrontEnd/src/components/cosmic/lookDevShell.jsx | Look-Dev Lab shell | Phase4-scaffold | new, UNVERIFIED | 2026-11-04 |
| FrontEnd/src/hooks/useQualityTier.js, useLazyScene.js, useContextLossWarning.js | tier detect, lazy scene, context-loss | Phase4-scaffold | new, UNVERIFIED | 2026-11-04 |
| FrontEnd/src/utils/emojiGuard.js | emoji scanner | Phase4-scaffold | new, UNVERIFIED | 2026-11-04 |
| docs/plan/*.md (22 files) | product plan docs | earlier phases | existing | pre-2026-11-03 |
| docs/design/*.md (10 files) | tooling.md, research-log.md, 00-07 design docs | Phase 3 | new | 2026-11-03 |
| docs/progress/milestone-ledger.md, TASKS.md | milestone ledger + task list | Phase 2 | new | 2026-11-03 |
| AUDIT_PLAN.md, AUDIT_REPORT.md (root) | earlier audit docs, misplaced per PATHS | earlier | misplaced, quarantine proposed | 2026-10-29/30 |
| build-d/e/f/h/i.log (root) | stray build logs | earlier | misplaced (gitignored by *.log) | 2026-08-31 |
| FrontEnd/_moment_*.png, _shoot_moment.mjs, _verify_moment.html | underscore scratch files | earlier | misplaced, quarantine proposed | unknown |
| .agent/* (9 files: STATE, PATHS, FILE_REGISTRY, TASKS, DECISIONS, ERRORS, ENVIRONMENT, HANDOFF, SESSION_LOG) | agent state system | Phase R | new this session | 2026-11-04 |
| scripts/agent/*.js (probe-env, run, find-file, where, sync-registry, check-no-emoji, verify) | self-checking agent scripts | Phase R | new this session | 2026-11-04 |
| CLAUDE.md | root agent rules (created; not pre-existing) | Phase R | new | 2026-11-04 |
| docs/plan/00..16-*.md + bug-audit.md, research-log.md, research-plan.md, thinking.md, visual-overview.md (22 files) | product plan docs (group row; individually UNVERIFIED this session) | earlier phases | existing | pre-2026-11-03 |
| docs/design/00..07-*.md | design docs (group row) | Phase 3 | new | 2026-11-03 |
| docs/progress/recovery-report.md | Phase R deliverable | R5 | done | 2026-11-04 |
| docs/progress/skills-routing.md | Phase 1 skills routing table | P1 | done | 2026-11-04 |

## Explicit agent-area entries (for sync-registry)

| .agent/DECISIONS.md | agent state | R3 | new | 2026-11-04 |
| .agent/ENVIRONMENT.md | machine truth | R0 | new | 2026-11-04 |
| .agent/ERRORS.md | failure log | R3 | new | 2026-11-04 |
| .agent/FILE_REGISTRY.md | this registry | R3 | new | 2026-11-04 |
| .agent/HANDOFF.md | handoff | R3 | new | 2026-11-04 |
| .agent/PATHS.md | directory contract | R3 | new | 2026-11-04 |
| .agent/SESSION_LOG.md | append-only log | R3 | new | 2026-11-04 |
| .agent/STATE.md | one-page truth | R3 | new | 2026-11-04 |
| .agent/TASKS.md | task ledger | R3 | new | 2026-11-04 |
| CLAUDE.md | root agent rules | R3 | new | 2026-11-04 |
| FrontEnd/tests/CourseSpaceJourney3D.test.jsx | 3D smoke tests | M3 | new | 2026-11-03 |
| FrontEnd/tests/cosmic-components.test.jsx | component smoke (FIXED 2026-11-04, commit 70ba5d5) | scaffold | fixed | 2026-11-04 |
| FrontEnd/tests/cosmic.test.jsx | PlanetGenerator unit tests | scaffold | new | 2026-11-04 |
| docs/design/00-art-direction.md | design doc | Phase 3 | new | 2026-11-03 |
| docs/design/01-design-tokens.md | design doc | Phase 3 | new | 2026-11-03 |
| docs/design/02-icon-and-badge-system.md | design doc | Phase 3 | new | 2026-11-03 |
| docs/design/03-3d-world-spec.md | design doc | Phase 3 | new | 2026-11-03 |
| docs/design/04-ui-screens-spec.md | design doc | Phase 3 | new | 2026-11-03 |
| docs/design/05-performance-and-quality-tiers.md | design doc | Phase 3 | new | 2026-11-03 |
| docs/design/06-design-qa-checklist.md | design doc | Phase 3 | new | 2026-11-03 |
| docs/design/07-look-dev-lab-spec.md | design doc | Phase 3 | new | 2026-11-03 |
| docs/design/research-log.md | research log | Phase 4-prep | new | 2026-11-03 |
| docs/design/tooling.md | tooling decisions | Phase 3 | new | 2026-11-03 |
| docs/plan/00-executive-summary.md | plan doc | earlier | existing | pre-2026-11-03 |
| docs/plan/01-skill-routing.md | plan doc | earlier | existing | pre-2026-11-03 |
| docs/plan/02-identity-system.md | plan doc | earlier | existing | pre-2026-11-03 |
| docs/plan/03-subscription-architecture.md | plan doc | earlier | existing | pre-2026-11-03 |
| docs/plan/04-mentor-economics.md | plan doc | earlier | existing | pre-2026-11-03 |
| docs/plan/05-course-request-engine.md | plan doc | earlier | existing | pre-2026-11-03 |
| docs/plan/06-dynamic-3d-space-ui.md | plan doc | earlier | existing | pre-2026-11-03 |
| docs/plan/07-ai-quiz-engine.md | plan doc | earlier | existing | pre-2026-11-03 |
| docs/plan/08-gamification-system.md | plan doc | earlier | existing | pre-2026-11-03 |
| docs/plan/09-extra-features.md | plan doc | earlier | existing | pre-2026-11-03 |
| docs/plan/10-technical-architecture.md | plan doc | earlier | existing | pre-2026-11-03 |
| docs/plan/11-implementation-roadmap.md | plan doc | earlier | existing | pre-2026-11-03 |
| docs/plan/12-testing-qa-plan.md | plan doc | earlier | existing | pre-2026-11-03 |
| docs/plan/13-deployment-devops.md | plan doc | earlier | existing | pre-2026-11-03 |
| docs/plan/14-risk-register.md | plan doc | earlier | existing | pre-2026-11-03 |
| docs/plan/15-stakeholder-governance.md | plan doc | earlier | existing | pre-2026-11-03 |
| docs/plan/16-interview-questions.md | plan doc | earlier | existing | pre-2026-11-03 |
| docs/plan/bug-audit.md | plan doc | earlier | existing | pre-2026-11-03 |
| docs/plan/research-log.md | plan doc | earlier | existing | pre-2026-11-03 |
| docs/plan/research-plan.md | plan doc | earlier | existing | pre-2026-11-03 |
| docs/plan/thinking.md | plan doc | earlier | existing | pre-2026-11-03 |
| docs/plan/visual-overview.md | plan doc | earlier | existing | pre-2026-11-03 |
| docs/progress/TASKS.md | task list | Phase 2 | new | 2026-11-03 |
| docs/progress/milestone-ledger.md | milestone ledger | Phase 2 | new | 2026-11-03 |
| docs/progress/AUDIT_PLAN.md | earlier audit plan, moved from root | R-cleanup | moved, commit b0778f4 | 2026-11-04 |
| docs/progress/AUDIT_REPORT.md | earlier audit report, moved from root | R-cleanup | moved, commit b0778f4 | 2026-11-04 |
| docs/progress/screenshots/login-1280.png | playwright capture 1280x800, verified non-blank | F3a | committed 08e69cf | 2026-11-04 |
| docs/progress/screenshots/login-360.png | playwright capture 360x740, verified non-blank | F3a | committed 08e69cf | 2026-11-04 |
| docs/design/lab-captures/star-lab-1280.png | Star Lab capture (SwiftShader headless) | F3 | 154 KB PNG, stars visible | 2026-11-04 |
| FrontEnd/tests/e2e/cosmic.captures.spec.js | playwright smoke captures | F3a | 2 pass, committed 08e69cf | 2026-11-04 |
| FrontEnd/tests/e2e/lookdev.spec.js | Star Lab capture spec | F3 | 1 pass | 2026-11-04 |
| FrontEnd/tests/LookDevLab.test.jsx | lab shell unit test | F3 | passing | 2026-11-04 |
| FrontEnd/src/cosmic/LookDevLab.jsx | dev-only /dev/lab route scene (leva + r3f-perf) | F3 | route gated by import.meta.env.DEV | 2026-11-04 |
| FrontEnd/src/App.jsx | added DEV-gated /dev/lab route (F3) | F3 | pending commit | 2026-11-04 |
| .gitignore | removed *.md (R-cleanup), ignored playwright artifacts (F3) | R-cleanup/F3 | pending commit | 2026-11-04 |
| FrontEnd/src/cosmic/shaders/noise.glsl | shared noise chunk | F2 | build green | 2026-11-04 |
| FrontEnd/src/cosmic/shaders/starfield.vert.glsl | star vertex shader | F2 | build green | 2026-11-04 |
| FrontEnd/src/cosmic/shaders/starfield.frag.glsl | star fragment shader | F2 | build green | 2026-11-04 |
| FrontEnd/src/cosmic/shaders/milkyway.frag.glsl | nebula + band + dust lanes | F2 | build green, capture shows MW band right side | 2026-11-04 |
| FrontEnd/vite.config.js | vitest excludes tests/e2e (playwright owns it) | F3 | 10 files / 55 tests pass | 2026-11-04 |
| FrontEnd/playwright.config.js | playwright chromium config | F3a | committed 08e69cf | 2026-11-04 |
| scripts/agent/check-no-emoji.js | emoji guard | R3 | new | 2026-11-04 |
| scripts/agent/find-file.js | file walker | R3 | new | 2026-11-04 |
| scripts/agent/probe-env.js | env probe | R0 | new | 2026-11-04 |
| scripts/agent/run.js | command runner | R3 | new | 2026-11-04 |
| scripts/agent/sync-registry.js | registry sync | R3 | new | 2026-11-04 |
| scripts/agent/verify.js | verify pipeline | R3 | new | 2026-11-04 |
| scripts/agent/where.js | keyword lookup | R3 | new | 2026-11-04 |
