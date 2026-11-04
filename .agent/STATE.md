# STATE — one-page truth

- Project root: `D:/orbit-main/orbit-main` (git repo, branch `feature/orbit-v3-foundation`). Parent `D:/orbit-main` is NOT a repo and holds stray `tmp-*` skill clones.
- Phase: R (recovery audit), read-only until user approves cleanup. Tasks R0-R6 in `.agent/TASKS.md`.
- Done so far this session: R0 — `.agent/` created, `scripts/agent/probe-env.js` written and run, `.agent/ENVIRONMENT.md` generated from real output (node v24.21.0, npm 11.19.0, git 2.56.0, python 3.14.8; rg NOT installed; grep/find/curl/tree present).
- In flight: Phase 4 research DONE — `docs/design/research-log.md` rewritten with 21 cited entries (2026-11-04). WebSearch in this env returns knowledge-only (no live links) — logged as LEAD, not evidence; 4 entries VERIFIED via WebFetch (threejs tone-mapping constants incl. AgXToneMapping, WCAG 2.2 SC 1.4.3/1.4.11/2.2.2, Book of Shaders ch11+ch13 fbm/domain-warping). Blocked: raw.githubusercontent.com, iquilezles article URLs (404) — listed as verification debt. Still blocked on explicit approval: cleanup moves + .gitignore fix, package installs, Phase 5 doc approval (gates Phase 6 code).
- Baselines recorded (2026-11-04): BackEnd jest 58/58 suites, 625/625 tests PASS (exit 0); FrontEnd vitest 43/43 tests PASS but 1 file fails to load (`tests/cosmic-components.test.jsx`, known-red E8/X3); emoji guard 116 hits (X2); sync-registry lists stray files (report section b).
- Blockers: none. Uncommitted work on branch: M1/M2/M3 modified files + untracked cosmic/AI-quiz files (see `git status --short`).
- Key finding already: root `.gitignore` contains `*.md` — ALL markdown (CLAUDE.md, docs/, .agent/) is git-ignored. Docs are invisible to git. Recorded in DECISIONS.md; fix pending approval.
- Note from last agent (previous session): M3 integration finished, backend 625 tests + frontend 35 tests reported green; 3 new cosmic test files exist under `FrontEnd/tests/` and reference a not-yet-existing `CourseSpaceJourneyWorld` — expected red until fixed (scheduled, not yet approved).
- Last session time: 2026-11-04 (this session).
