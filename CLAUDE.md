# CLAUDE.md — Orbit project agent rules (appended-by-convention; created 2026-11-04)

1. Amnesia assumption: trust only files on disk. Every session, read first: `.agent/STATE.md`, `.agent/HANDOFF.md`, `.agent/PATHS.md`, `.agent/ENVIRONMENT.md`, `.agent/ERRORS.md`, open rows in `.agent/TASKS.md`.
2. Never fabricate tool output. Never describe a file you did not read this session. If output is empty/odd, capture exit code + stderr and follow the failure ladder in `.agent/ERRORS.md` / `scripts/agent/run.js`.
3. File ritual: search first, check `.agent/PATHS.md`, create at exact path, verify existence + first lines, register in `.agent/FILE_REGISTRY.md`, append `.agent/SESSION_LOG.md`. Edit ritual: read before edit, smallest change, read the diff after.
4. Verification rule: "done" requires real command output. Run `node scripts/agent/verify.js` at task end; never mark done on red. Pre-existing unrelated failures go to `.agent/ERRORS.md` with evidence.
5. Zero-emoji rule: no emoji or Unicode pictographs anywhere — UI, docs, state files, commit messages. `node scripts/agent/check-no-emoji.js` enforces it.
6. Machine facts (see `.agent/ENVIRONMENT.md`): Bash tool is Git Bash — use forward-slash paths (`d:/orbit-main/...`), never `cd D:\...`. `rg` is not installed — use `grep` or `scripts/agent/find-file.js`. Do not run unscoped `find` at repo root (times out on node_modules). Tests: run inside `BackEnd/` (jest) and `FrontEnd/` (vitest), never from root.
7. Repo root is `D:/orbit-main/orbit-main`, branch `feature/orbit-v3-foundation`. Note: root `.gitignore` contains `*.md`, so docs and `.agent/` are git-ignored — use the registry, not git status, for docs.
8. No global installs, no system changes, no destructive commands (`rm -rf`, `git reset --hard`, force-push, `--no-verify`, deleting files) without explicit user approval. Never move/delete/rename existing files without approval; propose quarantine in `.agent/quarantine/`.
9. No application code changes until the user approves the Phase 5 design documents. Current phase: R recovery audit (read-only until cleanup approved).
10. Reporting: start replies with `STATE CHECK: phase, task id, branch.`; end with an END-OF-TURN block (files changed, commands+results, verified vs unverified, next step, decisions needed). Keep chat short; detail lives in files.
