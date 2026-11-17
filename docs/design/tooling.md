# Tooling Stack — verified decisions (Phase 3 of mandate)

**Owner**: Staff Frontend Engineer + Principal Architect
**Status**: verified against package.json/node_modules on 2026-11-04; installs pending user approval where marked
**Historical rule**: runtime tools adding >30 KB gzipped needed explicit approval; dev-only tools installed as devDependencies; global/system-level setup needed approval. The dated addendum below supersedes setup restrictions, not phase gates.

## Mission-lock capability self-test - 2026-11-12

Additive tooling test only, no product dependency or gate change. Reused installed Node24.21.0/npm11.19.0/Git2.56.0/Python3.14.8/rg15.2.0/jq1.8.2and Playwright/Chromium156.0.8078.4. A synthetic local browser interaction and640x480PNG succeeded; WebGL2returned expected clear pixel with ANGLESwiftShader. All graphics evidence is software-rendered, not representative of device performance. Owned browserPID2732/loopbackRPCport59332closed after the test.

To verify package installation without modifying in-progress files, installed only is-number7.0.0from the official npm registry into an isolated .agent/scratch probe directory, with lifecycle scripts/audit/funding/lockfile disabled and separate nonsecret configs/cache. MITlicense and18line runtime source inspected; four real smoke cases pass. No app/global dependency or runtime bundle cost. Exact command/log/result paths: [CAPABILITIES](../../.agent/CAPABILITIES.md) and [ENVIRONMENT](../../.agent/ENVIRONMENT.md#mission-lock-capability-round---2026-11-12). This scratch package is a capability probe, not an adopted application library.

## Cross-phase tooling addendum and preflight - 2026-11-09

Necessary official-source installs/setup are now authorized across all phases; check existing tools first, prefer local scope, inspect licenses and test version plus minimal use. Costly/destructive/private-data actions still require consent. CP-A-r2 remains WAITING_FOR_APPROVAL: preflight only, no app design/implementation or A2 capture replay. Full working commands, paths and logs are in [ENVIRONMENT](../../.agent/ENVIRONMENT.md#cross-phase-addendum-preflight---2026-11-09).

| Tool | Action / purpose | Verification | License / runtime cost |
|---|---|---|---|
| ripgrep15.2.0 | Installed once with WinGet BurntSushi.ripgrep.MSVC, exact version, official source, user scope; standalone text-search CLI | Version, synthetic stdin match2:verified-tool, Bash/Windows discovery all exit0 | MIT/Unlicense; installed MIT terms read;0bytes frontend bundle |
| jq1.8.2 | Installed once with WinGet jqlang.jq, exact version, official source, user scope; standalone JSON CLI | Version, synthetic17+25==42 transformation true, Bash/Windows discovery all exit0 | MIT plus permissive component notices; official tag COPYING read;0bytes frontend bundle |
| Git2.56 / Node24.21 / npm11.19 / Python3.14.8 | Reused; no install | Repository/JSON/package-name/isolated JSON smoke checks pass | No runtime dependency change |
| Playwright1.64.1 / Chromium156.0.8078.4 | Reused; no browser download or dependency change | Synthetic button, WebGL2 pixel,480x240 PNG visually inspected; owned PID15728/port60790 closed | Tool smoke only, not product/device acceptance |
| scripts/agent/run.js | Reused unchanged; no duplicate runner |7/7regressions pass, including timeout and stderr handling | No runtime dependency change |

Both WinGet downloads passed installer-hash verification. User-scope CLI installs avoid modifying the application's package/lock files. WinGet added actual package directories to User PATH, not its empty Links directory; use absolute executables or a process-only PATH refresh in the existing editor. New terminals may require restarting VS Code to inherit the changed PATH. No settings.json, shell profile, app source or lockfile edits; no force flags, paid services or gate approval. Earlier missing-tool/browser claims below are historical, not current preflight findings.

## B research PDF capability - 2026-11-09

Needed for actual inspection of a primary leaderboard paper. Initial pdftoppm/pdfinfo discovery and native PDF Read failed. Installed official Windows Poppler25.07.0-0 once via WinGet oschwartz10612.Poppler, exact version/user scope, verified installer hash;90.2s/exit0. Existing VC++ runtime detected, no app dependency/lock change, runtime bundle cost0bytes. Version25.07.0, real15-page PDF metadata and three page-to-PNG renderings passed; images visually opened.

License: the packager repository is MIT, but Poppler is GPL-2.0-or-later and bundled poppler-data carries Adobe/GPL notices. This is a standalone local research tool, not incorporated or redistributed in the application. Full source/commands/bin path/logs are in [ENVIRONMENT](../../.agent/ENVIRONMENT.md#current-identity-worlds-b-research-access---2026-11-09). Native PDF Read still needs refreshed process PATH; absolute executable rendering plus PNG Read worked, with no editor/profile changes. No repeated install or false native-PDF success.

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
