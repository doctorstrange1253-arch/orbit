# Recovery Report — Phase R audit (2026-11-04)

Scope: read-only audit of the existing product at `D:/orbit-main/orbit-main` (git repo, branch `feature/orbit-v3-foundation`). Nothing was moved, deleted, or renamed. All commands below were really run; outputs captured in `.agent/scratch/`.

## (a) Vision vs. reality — gap table

| Vision item | Exists? | Where (evidence) | Gap |
|---|---|---|---|
| 3 switchable identities (Student/Peer/Mentor) | Yes | `FrontEnd/src/App.jsx` routes `/peer/*`, `/mentor/*`, `/student/*`; `BackEnd/middleware/identity.js`, `requireRoles.js` | rolesVersion staleness handling exists; unverified end-to-end this session |
| Dynamic 3D space level map | Partial | `FrontEnd/src/cosmic/CourseSpaceJourney3D.jsx` (prototype: star + colored spheres + OrbitControls + 2D grid fallback); mounted in `FrontEnd/src/pages/CourseLearn.jsx:216` | Not the mandated premium world: no bloom/postprocessing, no 8 archetypes, no shuttle/FX, no spline travel, no stations/boss encounters; contains emoji (see d) |
| AI quizzes via Ollama | Yes | `BackEnd/services/ollamaService.js`, `controllers/aiQuizController.js`, `models/Quiz.js`, `routes/aiQuizRoutes.js` mounted at `/api/ai` in `server.js`; UI `FrontEnd/src/cosmic/AICourseQuizPanel.jsx` wired in `pages/mentor/LessonEdit.jsx:304` | Working per earlier session (backend 625/625 green); RAG-only, no fine-tune/hybrid decision documented in `docs/design/research-log.md` yet |
| Tiered subscriptions, lowest tier = 2 enrollments | Yes | `BackEnd/services/billingPlans.js` (20% platform fee, INR paise) | Dunning gaps noted in `docs/plan/bug-audit.md` (earlier) |
| Mentor revenue 80% split across enrolled courses | Yes | `billingPlans.js`, `models/PactWeekLedger.js`, `models/MoneyLedger.js` | Settlement cycle tests exist (`tests/billingPlans.test.js`) |
| Course-request engine with thresholds | Yes | `BackEnd/models/CourseRequest.js`, `controllers/courseRequestController.js`, routes in `courseRoutes.js` | Static `/requests` before `/:id` ordering verified earlier |
| Gamification (XP, streaks, boss, ranks, leaderboards) | Yes | `FrontEnd/src/cosmic/` (tiers.js, liftoffEngine.js, CosmicBadge.jsx), `components/gameEngine/` (LevelCard, CoachQuiz, BossCeremony) referenced in `CourseLearn.jsx` | Exists; visual premium standard not met (emoji in `components/cosmic/xpEventLabels.js:17-25`) |
| Premium whole-website design standard | Not yet | `docs/design/00..07-*.md` written 2026-11-03; no implementation yet | Phase 6 blocked on user approval of Phase 5 docs |
| Zero-emoji rule | Violated | `scripts/agent/check-no-emoji.js` = 116 hits, e.g. `FrontEnd/src/cosmic/CourseSpaceJourney3D.jsx:95,121,128,134`, `AICourseQuizPanel.jsx:98`, `components/cosmic/xpEventLabels.js:17-25`, `cosmic/sessionCard.js:78`, admin `✓/✗/★` in `FrontEnd/src/admin/pages/Audit.jsx:43`, `Ops.jsx:126` | Fix scheduled in Phase 6 (3D world rebuild + UI redesign) |

Milestone claim check: user believed ~3 of ~8 done. Roadmap (`docs/plan/11-implementation-roadmap.md`) defines 4 milestones; ledger (`docs/progress/milestone-ledger.md`) derives 4 from code evidence: M1 security Done, M2 monetization Done, M3 immersive UI + AI quiz Done (prototype-level 3D), M4 gamification polish/beta In Progress. On the roadmap's own 4-milestone scale, 3 of 4 are done; on a derived 8-item vision scale, roughly 3 of 8 hold at production quality. UNVERIFIED: items not re-read this session are marked as such.

## (b) Misplaced files (proposed location — NOT moved, pending approval)

| File | Why misplaced | Proposed action |
|---|---|---|
| `build-d/e/f/h/i.log` (repo root) | build logs at root; also silently gitignored by `*.log` | move to `.agent/quarantine/` or delete on approval |
| `AUDIT_PLAN.md`, `AUDIT_REPORT.md` (repo root) | docs must live under `docs/` per PATHS.md | move to `docs/progress/` |
| `FrontEnd/_moment_down.png`, `_moment_quasar.png`, `_moment_up.png`, `_shoot_moment.mjs`, `_verify_moment.html` | underscore scratch files at FrontEnd root | quarantine to `.agent/quarantine/FrontEnd/` |
| `BackEnd/test-brevo.js`, `test-forgot.js`, `test-smtp.js` | ad-hoc `test-` scripts at package root (flagged by sync-registry as suspicious) | review: keep as `BackEnd/scripts/` or quarantine |
| `D:/orbit-main/tmp-r3f`, `tmp-threejs`, `tmp-webshaders` (OUTSIDE repo) | full skill-repo clones downloaded by an earlier session into the parent dir, not the project | leave outside repo or move under `.agent/quarantine/`; never inside repo |

## (c) Duplicates / orphans

- sync-registry duplicate report after whitelist: remaining hits were only common config basenames (package.json etc.) — no action.
- Orphans: none confirmed this session (import-graph check not run; UNVERIFIED). `FrontEnd/src/cosmic/CourseSpaceJourney3D.jsx` is imported only by `CourseLearn.jsx` — the planned `CourseSpaceJourneyWorld` (imported by my new test) does not exist yet; that is the known-red test E8, to be resolved in Phase 6 by building the real world component.

## (d) Likely earlier mistakes (severity, evidence)

| ID | Severity | Finding | Evidence |
|---|---|---|---|
| X1 | High | Root `.gitignore` contains `*.md` — all docs (docs/, .agent/, CLAUDE.md) are invisible to git; `git status` shows none of them | `.gitignore` line 4; `git status --short` 2026-11-04 lacks any docs entries |
| X2 | High | Zero-emoji mandate violated in shipped UI: 116 guard hits | `.agent/scratch/emoji-scan.log` |
| X3 | Medium | Known-red test suite: `FrontEnd/tests/cosmic-components.test.jsx` imports non-existent `../src/cosmic/CourseSpaceJourneyWorld`; `PlanetGenerator.jsx` default export returns a plain object, not JSX | vitest run 2026-11-04: 1 failed suite / 43 passed tests; file lines 41-46 |
| X4 | Medium | 3D prototype is placeholder-quality (flat colored spheres, `meshStandardMaterial` only, emoji labels) though mounted on the student learn page | `CourseSpaceJourney3D.jsx` whole file |
| X5 | Low | Stray root logs/audit docs/scratch files (see b) | `ls` 2026-11-04 |
| X6 | Low | `docs/plan/` contains duplicate-purpose files (`research-log.md` vs `docs/design/research-log.md`) | both exist on disk |
| X7 | Info | `BackEnd/.env` exists on disk (gitignored, correct) — no secret exposure found in tracked files this session | `.gitignore`; no `git status` secret hits |

## (e) Baseline results (real, this session)

- BackEnd: `cd BackEnd && npx jest --maxWorkers=2` → **58 suites passed, 625 tests passed**, exit 0, ~70s (2026-11-04).
- FrontEnd: `cd FrontEnd && npm test` (vitest run) → **43 tests passed, 0 failed; 1 test FILE failed to load** (`tests/cosmic-components.test.jsx`, X3), exit 1, 61.6s.
- Emoji guard: `node scripts/agent/check-no-emoji.js` → exit 1, 116 hits (X2), log `.agent/scratch/emoji-scan.log`.
- Registry sync: `node scripts/agent/sync-registry.js` → reports stray/suspicious names (section b) and was re-run clean for agent areas after registry expansion.
- Lint/build: NOT run yet (recorded as not verified; scheduled in verify.js runs at task end).

## (f) Tool failures hit this audit + working fallbacks (also in .agent/ERRORS.md)

1. `cd D:\...` in Bash tool fails (Git Bash) → use `d:/...` or `/d/...` paths.
2. `npx vitest` from repo root mixes BackEnd jest files ("describe is not defined") → run per-package: `cd FrontEnd && npm test`, `cd BackEnd && npm test`.
3. `command -v` inside Node execSync empty on win32 (cmd.exe) → `where <cmd>`.
4. Unscoped `find` at repo root times out on node_modules → scope to dirs or use `git ls-files` / `scripts/agent/find-file.js`.
5. `rg` not installed → `grep -rn` / find-file.js.
6. jest summary not captured through `run.js` pipe (exit 0, empty stdout/stderr) → run jest directly in the Bash tool and tail.

## Cleanup plan awaiting approval

1. Fix `.gitignore`: remove `*.md` (or add `!docs/**`, `!CLAUDE.md`, `!.agent/**`).
2. Move root `build-*.log`, `AUDIT_*.md`, `FrontEnd/_moment_*` to quarantine/appropriate docs dirs.
3. Decide on `D:/orbit-main/tmp-*` clones (leave outside repo / quarantine).
4. Schedule X2/X3/X4 fixes inside Phase 6 (3D rebuild + emoji purge + test repair).
