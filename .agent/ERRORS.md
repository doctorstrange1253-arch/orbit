# ERRORS — mistakes and tool failures (read at session start)

| # | Category | Symptom | Root cause | Working alternative |
|---|---|---|---|---|
| E1 | tool failure | `cd D:\orbit-main\...` in Bash tool: "No such file or directory" | Bash tool is Git Bash; backslash drive paths mangled | use forward slashes `d:/orbit-main/...` or POSIX `/d/orbit-main/...` |
| E2 | tool failure | `npx vitest run` from repo root ran BackEnd jest tests and failed with "describe is not defined" | root has node_modules; vitest scanned both BackEnd and FrontEnd | run `npm test` inside `FrontEnd/` (vitest) and `BackEnd/` (jest) separately |
| E3 | tool failure | `command -v X` inside Node execSync returned nothing on win32 | Node spawns cmd.exe, not bash; `command -v` is a bash builtin | use `where X` on win32 in probe-env.js |
| E4 | tool failure | `find . -mtime -14` from repo root timed out (120s) twice, moved to background | root `node_modules/` is huge; `-not -path` filters results but still traverses | scope find to small dirs, or use `git ls-files`; do not run unscoped find at root |
| E5 | environment | `rg` not installed | — | use `grep -rn`; `scripts/agent/find-file.js` is the dependency-free walker |
| E6 | earlier agent | `.gitignore` contains `*.md` | all markdown ignored by git, incl. docs/ and .agent/ | fix pending approval (D2) |
| E7 | earlier agent | stray root files: `build-*.log`, `AUDIT_PLAN.md`, `AUDIT_REPORT.md`; stray `FrontEnd/_moment_*`; stray `D:/orbit-main/tmp-*` clones | scratch written to wrong cwd | quarantine proposals in recovery report, pending approval |
| E8 | earlier agent (this session, earlier turn) | `FrontEnd/tests/cosmic-components.test.jsx` imported non-existent `../src/cosmic/CourseSpaceJourneyWorld`; `PlanetGenerator` default export returned a plain object, not JSX | test written before component contract settled | FIXED 2026-11-04: test imports real `CourseSpaceJourney3D`, PlanetGenerator test asserts the pure fn; suite now 48/48 green |
| E9 | tool failure | `npm install -D @react-three/perf` → 404 not found | package name wrong; real name is `r3f-perf` | use `r3f-perf` (D9); installed ^7.2.3 |
| E10 | this session | test stub `Object.defineProperty(document,'createElement', v => document.createElement(tag))` → infinite recursion | stub called itself | removed stub; jsdom has createElement |
| E11 | this session | `useQualityTier` called `navigator.hardwareConcurrency()` (it is a number, not a function) → TypeError in real browsers too; `twinkleBackdrop` used named import of a default-export hook; `StarfieldBackdrop` used `<ShaderMaterial>` needing the class in scope | wrong API/import/intrinsic usage | fixed all three; vitest 48/48 pass 2026-11-04 |
| E12 | this session | `.gitignore` had `*.md` → all docs invisible to git | earlier mistake | FIXED 2026-11-04 with user approval (D2/D8); `.agent/scratch/` + `.agent/quarantine/` now ignored instead |
| E13 | this session | stray root/FrontEnd/BackEnd scratch files (build-*.log, AUDIT_*.md, FrontEnd/_moment_*, BackEnd/test-*.js) | scratch written to wrong cwd | FIXED 2026-11-04 with approval: AUDIT_* → docs/progress/, rest → .agent/quarantine/ |
