# Tooling Stack — verified decisions (Phase 3 of mandate)

**Owner**: Staff Frontend Engineer + Principal Architect
**Status**: verified against package.json/node_modules on 2026-11-04; installs pending user approval where marked
**Rule applied**: runtime tools adding >30 KB gzipped need explicit approval; dev-only tools install as devDependencies; nothing global/system-level without asking.

## 1. Verified installed runtime deps (FrontEnd, read from package.json + node_modules 2026-11-04)

| Tool | Installed version | License | Role | Decision | Reason |
|---|---|---|---|---|---|
| three | ^0.187.0 (r187) | MIT | runtime | INSTALLED — keep | Core WebGL engine; skills require r160+, r187 fine. Note: r187 defaults may include WebGPU paths — we stay on WebGLRenderer |
| @react-three/fiber | 9.8.2 | MIT | runtime | INSTALLED — keep | Matches r3f-* skills (Fiber 9 / React 19) |
| @react-three/drei | 10.7.9 | MIT | runtime | INSTALLED — keep | OrbitControls/Stars/Html/Float; bundle is heavy — load the 3D world via lazy chunk (already scaffolded) |
| react / react-dom | 19.2.7 | MIT | runtime | INSTALLED | |
| vite | ^8.0.12 | MIT | build | INSTALLED | |
| tailwindcss | ^4.3.0 | MIT | build | INSTALLED | |
| framer-motion | ^12.40.0 | MIT | runtime | INSTALLED — keep as the ONE 2D animation system | Mandate picks one animation system; Motion already used app-wide |
| zustand / @tanstack/react-query / axios / lucide-react | ^5 / ^5.101 / ^1.17 / ^1.17 | MIT | runtime | INSTALLED | existing app stack |

## 2. Pending approval (NOT installed)

| Tool | Purpose | Dev/Runtime | Version to use | License | Size (gz, est.) | Decision | Reason |
|---|---|---|---|---|---|---|---|
| @react-three/postprocessing + postprocessing | Bloom, AgX tone mapping, vignette, grain | runtime | INSTALLED @react-three/postprocessing ^3.2.2 + postprocessing ^6.39.6 (2026-11-04, user-approved) | MIT | ~35-45 KB gz combined | INSTALLED | Cinematic look-dev core; tier-gated (Ultra/High only). NOTE: skill-pinned 3.1 resolved to 3.2.2 — peer-compatible with fiber 9.8.2 |
| leva | Look-Dev Lab live sliders | dev-only | INSTALLED leva ^0.10.1 (2026-11-04, approved) | MIT | 0 (dev) | INSTALLED | Planet/Star/Shuttle lab controls |
| r3f-perf | FPS/draw-call/triangle overlay | dev-only | INSTALLED r3f-perf ^7.2.3 (2026-11-04, approved). CORRECTION: `@react-three/perf` does not exist on the registry (404) — the real package is `r3f-perf` | MIT | 0 (dev) | INSTALLED | Quality-tier verification on Android target |
| playwright | Visual QA screenshots 360/768/1280/1920 | dev-only | INSTALLED playwright ^1.64.1 (2026-11-04, approved) + chromium binary downloaded (`npx playwright install chromium`, exit 0) | Apache-2.0 | 0 (dev); browser binary ~150 MB in ~/.cache/ms-playwright | INSTALLED | E2E + captures to docs/progress/screenshots/ |
| axe-core | Accessibility scan (WCAG 2.2 AA) | dev-only | INSTALLED axe-core ^4.14.0 (2026-11-04, approved) | MPL-2.0 | 0 (dev) | INSTALLED | Keyboard-only pass still manual |
| Storybook | Component workbench | dev-only | ^8/9 | MIT | 0 (dev) | DEFERRED | The Look-Dev Lab route (07-look-dev-lab-spec.md) covers the component workbench need for this milestone; revisit if UI redesign exceeds lab scope |
| @gltf-transform/cli + ktx2 | Draco/KTX2 pipeline | dev-only | latest | MIT | 0 (dev) | DEFERRED until a GLTF hero asset is adopted | Shuttle is parametric first (threejs-agents-model-optimizer skill held in reserve) |
| spectorjs | WebGL frame capture | dev-only | — | — | 0 (dev) | DEFERRED | @react-three/perf overlay covers frame stats; Spector only if a specific frame must be inspected |

## 3. Capability check (what this machine/session actually has — 2026-11-04)

Have: Bash (Git Bash) + PowerShell tools, git 2.56, node v24.21.0, npm 11.19.0, python 3.14.8, curl, WebSearch + WebFetch tools, Agent subagents (claude / Explore / Plan / general-purpose / claude-code-guide), Skill tool (53 skills routed in docs/progress/skills-routing.md), VSCode diagnostics MCP (`mcp__claude-vscode__getDiagnostics`), no rg (use grep/find-file.js).

Missing and how to enable:
- Browser automation / screenshots: install playwright devDep + `npx playwright install chromium` (large binary — ask first). Alternative present: `tabbit` skill (Playwright workspace) once playwright exists.
- Figma MCP: not connected — no token configured. Not required: design source of truth is tokens + code per mandate 3.E.
- Blender / Blender MCP: not installed (system-level — ask). Not required if shuttle stays parametric.
- GPU/render stats on real device: none — headless captures are not representative (mandate 5.10); ask user for a real-device pass when perf budgets matter.
- Spector.js frame capture: not installed (dev-only, defer).

## 4. Web-verified facts used

- r3f-postprocessing skill pins @react-three/postprocessing 3.1 + postprocessing 6.39 for Fiber 9.7/WebGL (read from SKILL.md 2026-11-04).
- threejs-* skills (OpenAEC-Foundation v1.0, MIT) require three r160+; project has r187.
- Licenses above from each package's LICENSE/package.json metadata; re-verify with a license-checker pass in Phase 3.F before any external asset is committed.
