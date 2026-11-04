# Skills Routing — Orbit V3 (2026-11-04)

Discovery: 53 skills in `~/.claude/skills/` (C:\Users\Dell\.claude\skills), every one has a valid `SKILL.md`. No `INSTALLED_SKILLS.md`, no `claude-skills` dir in home/parents/project, no project `.claude/skills/`. Source clones of the 3D skills sit outside the repo at `D:/orbit-main/tmp-r3f|tmp-threejs|tmp-webshaders` (quarantine decision pending, see recovery report).

Installed-version compatibility (checked against `FrontEnd/package.json` + node_modules, 2026-11-04): React 19.2.7, three ^0.187.0, @react-three/fiber 9.8.2, @react-three/drei 10.7.9, Vite 8, Tailwind 4. The `r3f-*` skills target Fiber 9 / React 19 — compatible. The `threejs-*` skills (OpenAEC-Foundation v1.0, MIT, require three r160+) — compatible with r187. `r3f-postprocessing` targets fiber 9.7 + `@react-three/postprocessing` 3.1 + `postprocessing` 6.39 — NOT yet installed (pending approval, runtime >30KB gz).

## Routing table

| Skill | Purpose | Applies to | Use | Reason |
|---|---|---|---|---|
| r3f-shaders | Custom GLSL/TSL materials, uniforms, vertex deformation | 3D world: planet/star/nebula shaders | Yes [Skill: r3f-shaders] | All hero visuals are custom shaders; skill mandates version checks and lit-material feature selection |
| r3f-animation | useFrame, damping, GLTF clips, demand-loop | Shuttle travel, camera rig, planet rotation | Yes | Spline travel + damped camera follow are core to the level map |
| r3f-interaction | Pointer picking, keyboard input, camera controls | Planet/station selection; keyboard access to 3D | Yes | Skill explicitly requires accessible DOM controls outside Canvas — matches WCAG 2.2 AA requirement |
| r3f-postprocessing | Bloom, selection effects, DoF composer | Cinematic look-dev | Yes | Needs `@react-three/postprocessing` install (approval pending) |
| threejs-core-math | Vector/Matrix/Quaternion correctness | Spline math, camera rig, orbit layout | Yes | Prevents shared-vector mutation and gimbal bugs in seeded layout code |
| threejs-errors-performance | dispose(), draw calls, InstancedMesh, LOD, renderer.info | Quality tiers, 30fps Android budget | Yes | Directly maps to docs/design/05 performance tiers |
| threejs-impl-animation | AnimationMixer, crossfade, tweens | Shuttle state machine (idle/cruise/boost/dock) | Partial | Shuttle will be parametric geometry first; use if any GLTF clip is adopted |
| threejs-syntax-controls | OrbitControls and friends + dispose | Camera controls | Yes | Current prototype uses OrbitControls; must add dispose per tier rules |
| threejs-agents-model-optimizer | Draco/KTX2/gltf-transform pipeline | Hero GLTF assets (only if adopted) | Partial | Decision: procedural/parametric first; keep for a modeled shuttle brief if parametric fails QA |
| context7 | Live library docs via API | Any three/r3f/postprocessing API call | Yes | Anti-invented-API rule: verify against current docs, cite URL in task note |
| verification-before-completion | Run verification before claiming done | Every task | Yes | Matches "no claims without evidence" |
| test-driven-development | Test first, watch fail, minimal code | Phase 6 tasks | Yes | Fixes the known-red cosmic test pattern (E8) properly |
| systematic-debugging | Root cause before fixes | Any bug/test failure | Yes | Two-strikes rule companion |
| writing-plans | Bite-sized implementation plans | Multi-step Phase 6 tasks | Yes | |
| executing-plans | Inline plan execution | Phase 6 | Yes | |
| requesting-code-review / receiving-code-review | Independent review before merge | Milestone ends | Yes | Reviewer gets crafted context, not session history |
| brainstorming | Find what the user actually wants before building | Phase 5 design decisions | Partial | Design docs already exist; use when revisiting the 3-5 open decisions |
| tabbit | Playwright browser control | Visual QA screenshots | Partial | Needs Playwright installed (pending approval; browser binary download needs explicit OK) |
| sn-deep-research, sn-research-report, sn-prepare-citations | Multi-agent research + report structure + citations | Phase 4 deep research log | Yes | Produces cited `docs/design/research-log.md` entries |
| sn-search-code | GitHub/SO/HN/HF search | Occasional external code lookup | Partial | Internal search covered by grep + scripts/agent/find-file.js |
| sn-ppt-*, sn-image-*, sn-motion-html, sn-infographic, sn-da-*, sn-search-{market,social,finance,year-report,academic}, sn-proactive-agent, sn-team-harness, sn-update, sn-code-video, skill-creator, sn-report-format-discovery | Presentations, images, spreadsheets, market/social research, skill management | — | No | No presentations, generated images, spreadsheets, or external market research in this project; deliverables are Markdown in docs/ |
| sn-md-to-html-report | MD → HTML report | — | No | Deliverables stay Markdown under docs/ per PATHS.md |

Rule: if a skill conflicts with the project mandate (Sections 3-6 of the mandate), the mandate wins; flag conflicts in `.agent/DECISIONS.md`. Skill-assisted work is tagged `[Skill: name]` in `.agent/TASKS.md`.
