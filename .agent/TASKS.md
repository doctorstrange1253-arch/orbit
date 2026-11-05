# TASKS — task ledger

| ID | Title | Files | Status | Evidence | Commit |
|---|---|---|---|---|---|
| R0 | probe-env + ENVIRONMENT.md | scripts/agent/probe-env.js, .agent/ENVIRONMENT.md | done | ran `node scripts/agent/probe-env.js`, EXIT=0, file written | — (uncommitted) |
| R1 | audit probes: pwd/git/tree/deps | none (read-only) | done | git status/branch/log captured; deps read from package.json | — |
| R2 | identify earlier-agent artifacts | docs/progress/recovery-report.md | done | tmp-* clones, root logs, AUDIT_*.md, _moment_* found | — |
| R3 | state files + CLAUDE.md + agent scripts | .agent/*, CLAUDE.md, scripts/agent/*.js | done | files written; probe-env ran EXIT=0 | — |
| R4 | baseline: tests | .agent/STATE.md, recovery-report.md | done | BackEnd jest 625/625 PASS; FrontEnd vitest 43/43 tests PASS + 1 suite load-fail (E8) | — |
| R5 | recovery-report.md | docs/progress/recovery-report.md | done | written 2026-11-04 with evidence | — |
| R6 | stop, 12-line summary, ask cleanup approval | chat | done | summary posted 2026-11-04; user said "proceed with next" (treated as continue, NOT as approval for moves/installs) | — |
| P1 | skills discovery + routing table | docs/progress/skills-routing.md | done | 53 skills in ~/.claude/skills all valid SKILL.md; table posted; versions checked (fiber 9.8.2, drei 10.7.9, three r187, react 19.2.7) | — |
| P3 | tooling.md verified + capability check | docs/design/tooling.md | done | installed deps verified from package.json; pending installs listed; capability gaps listed | — |
| P3-installs | install dev-only tools + runtime postprocessing + playwright chromium | FrontEnd/package.json, package-lock.json | done | installed 2026-11-04 (approved): @react-three/postprocessing ^3.2.2, postprocessing ^6.39.6, leva ^0.10.1, r3f-perf ^7.2.3, playwright ^1.64.1, axe-core ^4.14.0; chromium binary download exit 0 | pending commit |
| P4 | deep research, cited, logged | docs/design/research-log.md | done | 21 entries logged 2026-11-04; 4 VERIFIED via WebFetch (threejs constants, WCAG22, BoS ch11/13), rest marked LEAD with re-verify debt listed; WebSearch tool returns knowledge-only here — recorded honestly | — |
| P5 | design docs 00-07 approved by user 2026-11-04; decisions 1-5 = recommendations (D8) | docs/design/00..07 | done | user: "i approved all the things you can proceed" | — |
| R-cleanup | gitignore *.md fix + quarantine stray files | .gitignore, .agent/quarantine/, docs/progress/ | done | moves verified by ls; git status now tracks docs/ and .agent/ | pending commit |
| F0 | repair known-red cosmic tests + component bugs (E8/E10/E11) | FrontEnd/tests/cosmic-components.test.jsx, src/cosmic/StarfieldBackdrop.jsx, twinkleBackdrop.jsx, src/hooks/useQualityTier.js | done | vitest 8 files / 48 tests ALL PASS (was 1 file load-fail) | pending commit |
| F1 | Phase 6 foundations: CourseSpaceJourneyWorld scene shell (lazy Canvas, tier switch, context-loss handler, 2D fallback) composing StarfieldBackdrop + PlanetGenerator nodes, wired into CourseLearn | FrontEnd/src/cosmic/CourseSpaceJourneyWorld.jsx, FrontEnd/tests/CourseSpaceJourneyWorld.test.jsx, FrontEnd/src/pages/CourseLearn.jsx | done | vitest 9 files / 54 tests PASS; emoji guard clean on changed files; commit pending at turn end | — |
| F2 | star/nebula backdrop polish: move GLSL to shaders/*.glsl (?raw imports), Milky Way band, twinkle without banding, Planet/Star Lab captures | shaders/*.glsl, StarfieldBackdrop, twinkleBackdrop, CourseSpaceJourneyWorld tone-mapping fix | done | vitest 9/54 pass; vite build green; 3D chunk 271 KB gz; commit c7c84f3 | c7c84f3 |
| F3 | Look-Dev Lab /dev/lab route (leva + r3f-perf, DEV-gated lazy) + Star Lab playwright capture | LookDevLab.jsx, tests/LookDevLab.test.jsx, tests/e2e/lookdev.spec.js, vite.config.js, lab-captures/star-lab-1280.png | done | vitest 10 files/55 pass; lint clean; playwright 1 pass; capture 154 KB verified w/ real WebGL stars; sync-registry clean | 20daf5f |
| F4 | planet surfaces for all 8 archetypes (shaders + PlanetSurface + Lab captures + world wiring) | PlanetGenerator/PlanetSurface/planet.*.glsl/CourseSpaceJourneyWorld/LookDevLab/planet.spec/lab-captures | done | vitest 11/61 pass; lint 0 errors; 8 captures zero pageerrors; captures reviewed in-chat | 1023739 |
| F5 | shuttle + spline travel + camera rig (parametric delta-wing, thruster FX, CatmullRom travel, damped follow; Shuttle Lab capture) | travel.js, Shuttle.jsx, world wiring, LookDevLab shuttle tab, shuttle.spec, shuttle-flight-1280.png | done | vitest 13/72 pass; lint 0 errors; capture shows shuttle mid-flight + trail, 0 pageerrors | 817690e |
| F6 | stations / checkpoints / boss encounters + milestone report (screens, screenshots, BackEnd re-run) | cosmic Station/Boss components, specs, docs/progress/milestone report | todo | — | — |

Verification rule: a task is done only with real command output captured. Commits now allowed (user approved cleanup; branch feature/orbit-v3-foundation; M1-M3 modifications from earlier sessions left unstaged on purpose).
