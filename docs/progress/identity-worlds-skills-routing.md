# Identity Worlds: skill discovery and routing

Date: 2026-11-08. Task: IW-R. Phase: R only. This is static recovery evidence, not UI design, an installation request or permission to start a later phase.

## Discovery evidence and limits

- Native bounded Glob searches were followed by hidden-aware filesystem traversal and exact metadata checks rather than interpreting "no files found" as absence.
- Checked active locations: repository D:/orbit-main/orbit-main, parent D:/orbit-main/.claude, home C:/Users/Dell/.claude/skills and plugins, and repository .claude/.agents. Parent .agents and project .claude/.agents were absent at their exact paths.
- Traversal visited 372 directories, omitting dependency, build, cache, Git, agent-scratch/quarantine and downloaded-clone trees. Symlinks/environment paths were not followed. This is not a machine-wide search.
- Found 104 home SKILL.md files: 57 top-level and 47 nested capabilities. Contents were readable for inventory; full semantic/runtime/service/dependency readiness was not tested.
- No INSTALLED_SKILLS.md was found within the checked scope. No substitute manifest, skill or tooling was created. Historical [routing](skills-routing.md) and [FP2 routing](../plan/v2/skills-routing.md) remain preserved, not treated as current readiness evidence.
- Runtime advertises the 57 top-level names and 13 additional names below. Additional runtime routes have no local skill-file validation in this check. A runtime route is not proof of service credentials or browser availability.

## Mandatory UI skills: unresolved

| Skill | Where it applies | Use Yes/No | Availability / boundary |
|---|---|---|---|
| frontend-design | C screen/world visual specifications; D Student/Mentor visual rebuild | Yes | Required by the user, but neither runtime-advertised nor found in checked active locations. BLOCKED; do not invent invocation or substitute silently. |
| design-critique | A evidence-based visual critique; C design evaluation; D slice visual acceptance | Yes | Required by the user, but neither runtime-advertised nor found in checked active locations. BLOCKED; obtain an actual available route/location before its work. |

Recommendation: make both required skills available through an approved, trusted setup before their dependent work. No installation was performed in R. CP-R approval does not itself waive these requirements or authorize an installation. Static route/source inventory can be distinguished from unavailable skill-led visual critique; do not call the latter complete.

## Routing convention

"Yes" means relevant to the gated task, not invoked now. Only verification-before-completion was newly invoked during R. Historical skill invocations do not authorize repeating setup or resuming FP2 execution. "No" means not needed or incompatible with this scope. Read the applicable body at the approved phase; user rules override stock commit/workspace/server/install/output defaults.

All 57 top-level files below are at C:/Users/Dell/.claude/skills/<skill-name>/SKILL.md. This is a local filesystem pointer, not a portable public source URL.

## Top-level installed skills

| Skill | Where it applies | Use Yes/No | Current boundary |
|---|---|---|---|
| brainstorming | C consequential design choices and founder recommendations | Yes | Already loaded historically; no creative work or new design discussion in R. |
| context7 | B/C/D current framework API verification | Yes | Use only available authorized docs access; no paid credential setup or unverified API assumptions. |
| executing-plans | D approved small implementation tasks | Yes | PAUSED until new CP-C; no stock workspace/commit/cleanup actions without permission. |
| r3f-animation | C/D world entrances, parallax and shuttle motion | Yes | Later-phase guidance only; no animation specification/code in R. |
| r3f-interaction | C/D world controls and scene interaction accessibility | Yes | Later approved interaction tasks only. |
| r3f-postprocessing | C/D bounded blur/depth/render effects | Yes | Reuse installed stack subject to measured performance and reduced motion. |
| r3f-shaders | C/D original backgrounds and procedural world art | Yes | No shader design or modification in R. |
| receiving-code-review | D adjudicating actual review feedback | Yes | Do not restart the completed C01 review. |
| requesting-code-review | D approved slice review gates | Yes | No code-review launch in R or inferred review completeness. |
| skill-creator | Creating or modifying skill packages | No | User requested skill discovery, not fabricated replacement skills. |
| sn-code-video | Rendered explanatory or promotional films | No | This task is an application visual redesign, not a video deliverable. |
| sn-da-excel-workflow | Spreadsheet/data-analysis outputs | No | Existing models preserved; no model analysis/output in R. |
| sn-da-image-caption | Image-to-data extraction | No | Paid/service-backed caption execution not authorized; later screenshots use native visual reading if available. |
| sn-da-large-file-analysis | Large spreadsheet datasets | No | No such analysis requested. |
| sn-da-non-spreadsheet-analysis | Word/PDF/PPT extraction | No | No new document-format extraction required in R. |
| sn-deep-research | B cited multi-source research and quote attribution | Yes | Invoke at B after CP-A, not now; no service/install/server pipeline. |
| sn-deepresearch-cli | Automated installation and research launch | No | Stock install/upgrade/harness/WebUI steps conflict with constraints. |
| sn-image-base | Hosted image/backend APIs | No | Paid/provider calls and generated franchise-like assets are not authorized. |
| sn-image-doctor | Credential/dependency setup for image services | No | No .env/credential changes or installations. |
| sn-image-imitate | Reference-style image generation | No | User requires bespoke world art; no imitation/service generation scope. |
| sn-image-resume | Resume image generation | No | Unrelated. |
| sn-infographic | Hosted infographic generation | No | Not requested; original application art will be specified separately. |
| sn-md-to-html-report | Publishing a designed HTML report | No | Canonical deliverables are Markdown; no extra report medium. |
| sn-motion-html | Continuous-shot multimedia narratives | No | Not a general app redesign tool; avoid media/provider pipeline. |
| sn-ppt-creative | Image-first slides | No | No slides requested. |
| sn-ppt-dazzle | Animated HTML slide deck | No | No deck or workbench/server. |
| sn-ppt-doctor | PPT setup diagnostics | No | Unrelated. |
| sn-ppt-entry | Presentation setup | No | No presentation artifacts. |
| sn-ppt-standard | HTML/PPTX slide generation | No | No additional output/installation. |
| sn-ppt-story | Slide outline construction | No | Unrelated. |
| sn-ppt-tools | PPT search/image tools | No | No deck and no paid image service. |
| sn-ppt-workbench | PPT browser preview | No | No workbench/server. |
| sn-prepare-citations | B/C citation deduplication if required | Yes | Preserve per-quote primary provenance; do not turn leads into verified citations. |
| sn-proactive-agent | Installing a proactive daemon | No | No daemon/watchers/installation. |
| sn-report-format-discovery | Choosing an unspecified report format | No | User fixed document paths and formats. |
| sn-research-report | B concise evidence-log structure | Yes | Follow user research-log output; no generic extra report tree. |
| sn-search-academic | B learning/collaboration/teaching primary-source discovery | Yes | No dependency/credential installation; citations need actual opened passages. |
| sn-search-code | B technical loading/parallax/accessibility sources | Yes | Do not execute stock downloaded/helper scripts or use authenticated search without authorization. |
| sn-search-finance | Market/financial data retrieval | No | Money model is preserved, not researched or changed by this task. |
| sn-search-image | Image discovery service | No | Not needed for bespoke assets; no paid search/provider setup. |
| sn-search-market-cn | Chinese market/regulatory research | No | No applicable research question. |
| sn-search-social-cn | Social-platform research | No | Quote verification requires reliable attribution, not social snippets. |
| sn-search-social-en | Social-platform research | No | Not an acceptable replacement for primary quotation evidence. |
| sn-search-social-media | Community/trend search | No | No prevalence claims or social-based quote attribution needed. |
| sn-search-year-report | Financial reports | No | Unrelated to the world-design scope. |
| sn-team-harness | Team Harness introduction/setup | No | No orchestration/workspace setup requested. |
| sn-update | Updating SenseNova packages | No | No update authorization. |
| systematic-debugging | R failed checks if encountered; A source evidence; D reproduced defects | Yes | No application fix in R/A/B/C; record failures and limits, do not restart old investigations. |
| tabbit | A later captures if authorized tooling exists | No | Not run in R; no new browser backend/server/setup. Requires explicit capability/permission resolution for captures. |
| test-driven-development | D approved source implementation | Yes | No new test or source behavior written in R. |
| threejs-agents-model-optimizer | C/D asset budgets and eventual model optimization | Yes | Conditional on actual modeled assets; no stock CLI install or asset transformation now. |
| threejs-core-math | C/D seed/chunk/travel coordinate contracts | Yes | No journey algorithm design in R. |
| threejs-errors-performance | A evidence review; C budget specification; D measured long-run tests | Yes | Old screenshots/build sizes do not prove bounded memory or real-device performance. |
| threejs-impl-animation | C/D scene/world animation integration | Yes | Existing R3F/Motion stack preferred; no added library by default. |
| threejs-syntax-controls | C/D camera/controls if required | Yes | Original interaction work stays preserved until approved changes. |
| verification-before-completion | R fresh evidence; all posted gate claims | Yes | INVOKED in R; scoped commands with explicit exclusions, not full restricted verify.js. |
| writing-plans | C approved slice-plan specification | Yes | No later-phase plan in R; use canonical user paths and no automatic commits. |

## Additional runtime-advertised routes

Local file bodies for these routes were not verified by filesystem discovery. Availability below means listed by the current runtime only.

| Skill | Where it applies | Use Yes/No | Boundary |
|---|---|---|---|
| dataviz | C/D leaderboard/dashboard/stat-visualization work | Yes | Load before that design/code, not for this factual recovery table. No charts/stat tiles created in R. |
| update-config | Harness settings/hooks/permissions | No | No config or permission changes requested. |
| keybindings-help | Editor/CLI keybindings | No | Unrelated to app keyboard accessibility. |
| code-review | D source correctness review | Yes | Only approved slice scope; no expensive review or fixes in R. |
| simplify | D approved changed-code cleanup | No | No source cleanup in R; future scope must remain within slice budgets. |
| fewer-permission-prompts | Permission allowlist edits | No | No settings changes or blanket approvals. |
| loop | Repeated/recurring tasks | No | No recurring work requested; stop at gates. |
| claude-api | Claude application integration | No | No Claude provider change/integration in this task. |
| workflow-authoring | Explicitly opted-in future orchestration | No | Ultracode OFF; no workflow opt-in for R. Already-loaded reference does not authorize orchestration. |
| run | Application launch/browser confirmation | No | Existing no-server/watcher rule wins. No run/preview/screenshot server in R. |
| plugin-authoring | CLI/editor interface modifications | No | Not application UI work. |
| init | New CLAUDE bootstrap | No | Existing CLAUDE/state files were found and preserved. |
| security-review | Future approved security acceptance, if requested | No | No fresh security audit requested in R; preserve prior fail-closed contracts. |

## Nested capability inventory

These 47 files were discovered/read for metadata but not invoked. Use No for R and the current world-design task unless a later explicitly approved artifact requires them. Their parents route specialized work; nested names are not assumed directly invocable runtime skills.

| Parent / subdirectory | Count | Where it applies | Use Yes/No |
|---|---:|---|---|
| sn-da-excel-workflow/capability/excel-cell-coloring | 5 | Spreadsheet cell styling | No |
| sn-da-excel-workflow/capability/excel-conditional-formatting | 1 | Spreadsheet distribution/formatting | No |
| sn-da-excel-workflow/capability/excel-data-analysis | 6 | Spreadsheet comparison/group/KPI/pivot/time/trend | No |
| sn-da-excel-workflow/capability/excel-data-cleaning | 6 | Spreadsheet cleaning/types/outliers | No |
| sn-da-excel-workflow/capability/excel-data-filtering | 4 | Spreadsheet conditional/range filtering | No |
| sn-da-excel-workflow/capability/excel-data-statistics | 4 | Spreadsheet basic/category/group/percentage statistics | No |
| sn-da-excel-workflow/capability/excel-data-visualization | 6 | Spreadsheet charts | No |
| sn-da-excel-workflow/capability/excel-reading | 7 | Single/multi/range/large spreadsheet reads | No |
| sn-da-excel-workflow/capability/excel-result-export | 4 | Spreadsheet export/formatting | No |
| sn-da-excel-workflow/capability/excel-table-styling | 1 | Spreadsheet table styling | No |
| sn-da-non-spreadsheet-analysis/capability | 3 | PDF/PPT/Word analysis | No |

Counts reconcile: 44 spreadsheet plus 3 non-spreadsheet capabilities = 47 nested; 57 top-level plus 47 nested = 104 local files. No spreadsheet or document-provider pipeline ran.

## Gate routing

R now closes with a factual checkpoint. A requires typed CP-R approval and resolution of unavailable critique/capture capabilities for their dependent work. B opens only after CP-A, C after CP-B, and application implementation only after the new CP-C. No missing mandatory skill is silently replaced by brainstorming, requesting-code-review, dataviz or a generic agent.
