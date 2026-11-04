# HANDOFF — read next session

Exact next step: finish R3 (write remaining scripts/agent/*.js: run, find-file, where, sync-registry, check-no-emoji, verify), then R4 run baselines from the correct directories:
- BackEnd: `cd BackEnd && npm test` (jest --maxWorkers=2)
- FrontEnd: `cd FrontEnd && npm test` (vitest run)
Never run vitest from repo root (E2). Never `cd D:\...` with backslashes in the Bash tool (E1) — use `d:/...` or `/d/...`.
Then R5 write `docs/progress/recovery-report.md`, R6 stop and ask for cleanup approval. Do NOT move/delete/rename anything before approval (R6). Do NOT write application code until Phase 5 design docs are approved by the user.

Files in flight: all `.agent/*` and `scripts/agent/probe-env.js` are new and uncommitted; git branch `feature/orbit-v3-foundation` also carries M1-M3 modifications from earlier sessions.

Traps to avoid: root `.gitignore` has `*.md` so all docs are invisible to git (D2) — use the registry, not git status, to find docs. `find` at repo root times out on node_modules (E4) — scope it or use git ls-files. `rg` is not installed (E5).

Known red baseline: FrontEnd/tests/cosmic-components.test.jsx imports a missing module (E8) — expected to fail until the component contract is fixed; do not "fix" by deleting the test without approval.
