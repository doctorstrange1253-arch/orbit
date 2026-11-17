# Local identity capture tool implementation plan and installed capabilities

> For agentic workers: use the available executing-plans guidance for inline tooling work; user canonical paths, no-commit/no-product-source restrictions and the A2 scope override stock workspace/commit defaults. Steps below are checkable setup/evidence tasks, not the Phase C visual design or product slice plan.

**Date:** 2026-11-09. **Task:** IW-A2. **Goal:** remove the missing UI-skill/capture-tool blockers and collect reproducible evidence of the actual existing frontend without touching product code or contacting real application services.

**Architecture:** render an isolated build of the existing frontend behind an owned loopback static server. A fresh browser context receives explicitly synthetic account/course/API responses, blocks external application/WebSocket traffic and loads only inspected public font assets already requested by the app. Pure safety guards are tested first; screenshots, interaction/axe/geometry/limited performance observations remain separate from production acceptance.

**Tech stack:** existing Node, Vite, Playwright1.64.1, Chromium156.0.8078.4 and installed axe-core Playwright adapter. No new frontend/backend dependency or OS browser installation needed after actual launch/render probe.

**Spec:** user A2 setup authorization recorded in [DECISIONS](../../../.agent/DECISIONS.md), [current source audit](01-ui-audit.md), and [canonical paths](../../../.agent/PATHS.md). Actual app source/data/hooks remain unchanged until the new CP-C. Inline execution method is already established; this mechanical setup does not require another execution-method choice.

## Global constraints

- Student = Multiverse; Mentor = Dimensions; Peer = Space is the future design direction, not this build's completed world claim.
- No product source/quote data/new art/stable ID/DB/money/safety policy changes or phase merging.
- No credentials/environment-file content, hosted DB/payment/provider operations, destructive Git/file actions, commits/pushes, global profiles or uninspected downloaded scripts.
- Local server/browser installation and execution are now authorized for this task only; prefer already installed tooling, bind loopback, close only owned processes.
- All app/API/socket/remote user-content traffic is blocked or synthetic-fixture served. Public fonts explicitly referenced by the existing app may be fetched without auth/config and cached with provenance; no new font/palette choice or OS font installation.
- Synthetic fixtures are not production authentication, source provenance, money/grade/recording authority or real learner outcomes.
- Every screenshot/evidence file gets a new run-specific path; old source audits/checkpoints/captures remain preserved. No emoji or new code comments in authored helpers/reports/installed adapted skills.

## Installed skills: actual verification

| Skill | Trusted pinned source | Installed status / modification |
|---|---|---|
| frontend-design | [Anthropic source at2c5958e](https://github.com/anthropics/skills/blob/2c5958ecac7cee2b583967a2c4981d0f4a75c579/skills/frontend-design/SKILL.md) | Installed in the user skill catalog,9390bytes/SHA256d91970639e9f5c37682ac7ab60094d35f1c7c1f38d731bd56396563aee10c1d3; bytes unchanged, LICENSE.txt and provenance retained; actual runtime Skill invocation succeeded. |
| design-critique | [Anthropic source ate050c2e](https://github.com/anthropics/knowledge-work-plugins/blob/e050c2ec856373787143d7057663a6ebd1277df3/design/skills/design-critique/SKILL.md) | Installed under its actual name, local4160bytes/SHA256190e0c7c555f325280672ddcf088d1c60308120580e97068e37a4671028e8c29; removed three decorative severity pictographs, bundled CONNECTORS.md/local link and prominent modification notice; framework/severity wording retained; actual runtime Skill invocation succeeded. |

Installed locations: [frontend-design](file:///C:/Users/Dell/.claude/skills/frontend-design/SKILL.md), [design-critique](file:///C:/Users/Dell/.claude/skills/design-critique/SKILL.md), with local-machine-only provenance/license files in their directories. No existing skill files were overwritten. The runtime now advertises both names; this is not merely a filesystem-presence claim.

Raw upstream data-only copies were inspected in an isolated scratch source directory, never executed as scripts. Upstream frontend license is10174bytes/SHA2560d542e0c8804e39aa7f37eb00da5a762149dc682d7829451287e11b938e94594. Critique root license is11607bytes/SHA256a6946284993aeec75c7d75906064b66210c46051e562077efb30eb6dcfe72e26, including unusual trailing upstream prose retained verbatim. Both files declare Apache2 terms; no publisher endorsement, app-asset rights or legal/publication clearance is inferred.

Source retrieval occurred on2026-11-08 during the setup session; this report records the work on2026-11-09. [Frontend license](https://github.com/anthropics/skills/blob/2c5958ecac7cee2b583967a2c4981d0f4a75c579/skills/frontend-design/LICENSE.txt), [critique repository license](https://github.com/anthropics/knowledge-work-plugins/blob/e050c2ec856373787143d7057663a6ebd1277df3/LICENSE), [connector guidance](https://github.com/anthropics/knowledge-work-plugins/blob/e050c2ec856373787143d7057663a6ebd1277df3/design/CONNECTORS.md). Search listing was a [discovery lead](https://claudeskills.info/skills/anthropics/knowledge-work-plugins/design-critique/), not the source used for installation.

No Figma/Slack/analytics/feedback connector was configured; optional placeholders are irrelevant to local screenshot critique. The mandatory skills will be applied to actual captured existing UI, not used to invent a Phase C layout now.

## Operational browser and documentation evidence

Actual existing Chromium executable was found and launched headlessly; a local DOM rendering interaction passed and the browser closed. Version156.0.8078.4. This proves engine launch/render capability, not the Orbit screen matrix or real-GPU performance. Installed Playwright package is1.64.1; native package/API declarations were read. No package lock was modified.

Context7 basic public library discovery/context returned Playwright docs; no API key/credential setup or paid call. [BrowserContext WebSocket routing documentation](https://github.com/microsoft/playwright/blob/main/docs/src/api/class-browsercontext.md) says routing applies to sockets created after registration, so register context.routeWebSocket before any page. Fixture socket handlers never call connectToServer. Documentation is current source access, not a tested network-isolation result until the harness runs.

No verified project launch skill existed at the checked project skill directories. The run skill's actual-app requirement is preserved: the helper must launch the real frontend, navigate/click it, capture and read images. It must not substitute a mock component tree or a console-only import. Using the installed Node Playwright API instead of adding an unnecessary CLI/browser stack is an explicit Windows/local-tooling choice.

## Review focus

1. Encoded path traversal, backslashes/NUL and environment/credential paths must never read outside the isolated build root.
2. Same hostname at another port, external API/socket hosts, credential-bearing URLs and spoofed font domains must never be forwarded.
3. Fixture level count must reject noninteger/nonfinite/nonpositive/>300 values; no unbounded stress allocation.
4. Missing API fixture paths or failed captures must be recorded as harness/coverage gaps, not silently fulfilled as healthy product data or hidden from the report.
5. Browser/server failures must close owned resources and retain terminal failure evidence; screenshot existence alone is not proof the intended page/state rendered.

## Task1: pure guard contract and capture orchestration

**Planned files (created only after observed RED):** scripts/agent/identity-ui-capture.mjs. **Test first:** scripts/agent/identity-ui-capture.test.mjs. **Synthetic data:** scripts/agent/identity-ui-fixtures.json. These are agent verification tools, not application or quote-pool implementation. Exact paths are ledgered and verified absent before creation.

**Interfaces:** safeAssetPath(root, pathname) returns a path strictly under root or null; networkKind(url, localOrigin) returns local/font/block with strict scheme/host/port/credentials checks; checkedLevelCount(value) returns a safe1-300 integer or throws. Importing the module starts no browser/server/build and reads no fixtures or environment credentials. CLI execution alone drives the actual app.

- [x] Write literal positive/negative Node tests for these three boundaries; expected paths/classifications/counts independently derived, no mock/source-string assertions.
- [x] Run the exact Node test before implementation; retained observed28missing-helper RED.
- [x] Implement minimal guards plus owned capture orchestration; no product code or alternate mock UI.
- [x] Run the same28tests GREEN and compatible37tool regressions. Later installed-loader regression observed RED1fail/28pass then all38tool tests GREEN after actual CommonJS export-shape correction; full app/provider/DB suites remain excluded.
- [x] Validate syntax, file metadata/first lines/character rules, register/log each actual tool/data file.
- [x] Commit: SKIPPED, not authorized; no branch/worktree/stash/reset or deletion.

## Task2: actual frontend captures and interactions

**Consumes:** existing frontend source and inspected fixture shapes; safe guards above; installed Playwright/axe. **Produces:** new run-specific PNGs and machine-readable evidence under the canonical identity-worlds capture directory; fresh build/cache/font/log data in excluded scratch only.

- [x] Build current frontend in a unique scratch output with envDir false, FCM-readiness probe/writer bypassed in memory and API/socket URL bindings local. Existing source/config/dist/locks unchanged; successful build retained/reused.
- [x] Bind owned static servers to127.0.0.1 with dynamically allocated ports; static guards tested and owned closed ports probed.
- [x] Create fresh isolated contexts with synthetic auth state, service workers blocked, app/API traffic fixture-served and external WebSockets closed before page creation. Allowed existing public font URL/hash downloads recorded separately; no remote user-content requests or real credentials.
- [x] Attempt all49selected routes at360/768/1280;147/147screen-width slots have some image. Separate original fixture gaps, failed/empty/pending/locked/light states and capture failures; CourseDetail1280full-page evidence is still incomplete.
- [x] Execute bounded nav/Tab/Escape/ARIA/CSS2x, identity/normal-slow-failed-reduced transit and1/30/100/300journey attempts. Later targeted2D/fallback cases record route results despite optional screenshot failures; no clean-UI acceptance.
- [x] Collect whole-page axe and geometry/ARIA evidence without rule exclusions: five initial scans plus later Profile and Student scans retain violations/incomplete checks. Finite JS/frame/heap observations are not device/GPU/production memory certification.
- [x] Close owned browser/server resources after actual runs and verify the ten owned ports closed. This does not establish machine-wide process absence.

## Task3: actual skill-led critique and revised gate

**Outputs:** the already-ledgered visual-evidence report and revised CP-A-r2. No future design/research placeholders.

- [x] Open representative actual captures and apply both installed/invoked skills to first impression, usability, hierarchy, consistency and accessibility; findings, positives and three priorities are in the visual report. Not every PNG was visually inspected.
- [x] Link source and actual captures/measurements; separate observed from inferred and synthetic from live. No new world or invented score.
- [x] Fresh786non-environment application and66historical-artifact aggregates match the original baselines; branch/full HEAD unchanged. Environment/ignored/hosted scope remains outside proof.
- [x] Prepare and register the revised CP-A-r2; retain scoped verification evidence and stop for typed approval on posting. No B/C/D/source implementation automatically begins.

## Current verified versus pending status

Verified on2026-11-09: both genuine skills installed/runtime-invoked; existing Chromium/browser stack reused without dependency installation. The real isolated build was reused across ten retained runs.211PNG files include duplicates/diagnostic images; all147selected49-screen/three-width slots have some image, not full-state/full-page acceptance. Seven known whole-page axe scans retain violations/incomplete rules. All ten owned loopback ports have closed-probe evidence. Tooling contracts progressed from observed RED to latest62capture/full71tool GREEN with syntax and control-character checks. Current helper58954bytes/597lines/SHA256cda3a298807ff388b84caa075af1276db5c42d3b4035e508c07928c3ab03d06d; test18351bytes/326lines/SHA25652554990506b5e240c25abed79af9f123827eca1fa19e03950d28d81eeab0cd6; fixture8118bytes/SHA256263d595849453bc54eeca0d8756fb6c6cc830e07a07c2e31b5f288d76e36810c. Fresh786non-environment app and66historical-artifact fingerprints match baselines; original v3CP-A preserved. The [visual evidence report](01-ui-visual-evidence.md) records actual failed controls, light-theme/readability issues, early slow-load overlay clearance, finite graphics/heap observations and2D route/keyboard outcomes. No2DPNG from the targeted follow-up succeeded; CourseDetail1280full-page capture,3D travel, settled selected states and native SR/zoom/device/GPU/full-memory/live authority remain incomplete or outside scope. The [revised checkpoint](../../progress/checkpoints/v3/CP-A-r2.md) records the B-only approval boundary; it is not self-approved.
