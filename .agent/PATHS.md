# PATHS — directory contract (from actual structure, 2026-11-04)

Project-relative paths, forward slashes. One concept, one location.

| Kind | Canonical directory | Naming rule | Example |
|---|---|---|---|
| Backend API code | `BackEnd/` — `controllers/`, `routes/`, `middleware/`, `services/`, `models/`, `config/` | camelCase files, one concern per file | `BackEnd/models/Quiz.js` |
| Backend tests | `BackEnd/tests/` | `*.test.js` | `BackEnd/tests/billingPlans.test.js` |
| Backend scripts | `BackEnd/scripts/` | kebab-case `.js` | `BackEnd/scripts/seedAdmin.js` |
| Frontend pages/routes | `FrontEnd/src/pages/` (+ `pages/mentor`, `pages/student`, `pages/peer`) | PascalCase `.jsx` | `FrontEnd/src/pages/CourseLearn.jsx` |
| Frontend components | `FrontEnd/src/components/` (+ subfolders per domain) | PascalCase `.jsx` | `FrontEnd/src/components/cosmic/lookDevShell.jsx` |
| 3D scene code | `FrontEnd/src/cosmic/` | PascalCase `.jsx` | `FrontEnd/src/cosmic/CourseSpaceJourney3D.jsx` |
| GLSL shaders | `FrontEnd/src/cosmic/shaders/` (create when first needed) | kebab-case `.glsl` | `FrontEnd/src/cosmic/shaders/planet.glsl` |
| Icons / badge SVG | `FrontEnd/src/cosmic/` for game art; component icons inline or `FrontEnd/src/components/icons/` (create when first needed) | PascalCase `.jsx` exporting SVG | `FrontEnd/src/cosmic/itemIcons.jsx` |
| Design tokens | `FrontEnd/src/` CSS (`index.css`, `App.css`) + typed tokens file when created | kebab-case CSS vars | `FrontEnd/src/index.css` |
| Hooks | `FrontEnd/src/hooks/` | `useX.js(x)` | `FrontEnd/src/hooks/useQualityTier.js` |
| Stores | `FrontEnd/src/store/` | camelCase `*Store.js` | `FrontEnd/src/store/themeStore.js` |
| Frontend services | `FrontEnd/src/services/` | camelCase `.js` | `FrontEnd/src/services/aiQuiz.js` |
| Frontend tests | `FrontEnd/tests/` | `*.test.jsx` | `FrontEnd/tests/CourseSpaceJourney3D.test.jsx` |
| Agent state | `.agent/` | fixed names: STATE, PATHS, FILE_REGISTRY, TASKS, DECISIONS, ERRORS, ENVIRONMENT, HANDOFF, SESSION_LOG | `.agent/STATE.md` |
| Agent scripts | `scripts/agent/` | kebab-case `.js` | `scripts/agent/probe-env.js` |
| Agent script tests | `scripts/agent/` | Node built-in test runner, `*.test.js` | `scripts/agent/run.test.js` |
| Scratch | `.agent/scratch/` only; delete or promote before task done | any | `.agent/scratch/last-run.log` |
| Quarantine | `.agent/quarantine/` only; never delete without user approval | keep original relative path under it | `.agent/quarantine/FrontEnd/_moment_up.png` |
| Docs — plan | `docs/plan/` | `NN-name.md` | `docs/plan/06-dynamic-3d-space-ui.md` |
| Docs — design | `docs/design/` | `NN-name.md` | `docs/design/03-3d-world-spec.md` |
| Docs — progress | `docs/progress/` | kebab `.md` | `docs/progress/recovery-report.md` |
| Screenshots / captures | `docs/progress/screenshots/`, `docs/design/lab-captures/` | kebab names with size | `docs/design/lab-captures/planet-lab-1920.png` |
| Static assets | `FrontEnd/public/`, `FrontEnd/assets/`, `marketing/` | kebab | `marketing/orbit-launch.html` |
| Root-level files | only config: `vercel.json`, `.gitignore`; logs and reports do NOT belong at root | — | see recovery report |

Rules: no `utils2`, `final`, `new`, `copy`, `old`, `v2`, `backup`, `tmp`, `untitled`, and no `_`-prefixed scratch files outside `.agent/scratch/`. If a kind has no location yet, record the decision in `.agent/DECISIONS.md` + this file first, then create.
