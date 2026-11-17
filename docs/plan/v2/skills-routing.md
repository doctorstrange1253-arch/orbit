# Feature Pack 2 - skills routing

Date: 2026-11-06. Task: FP2-A. Scope: Phase A only; no application audit or product research has started.
Audience: the founder and engineers/agents continuing this gated planning task.
[Skill: brainstorming] [Skill: verification-before-completion] [Skill: systematic-debugging]

## 1. Governing boundary

This is a routing document, not a product design, implementation approval, or claim that every skill runs. Read [STATE](../../../.agent/STATE.md) before continuing. CP-A approval opens Phase B only. The older implementation work is parked; do not restart its workflows, servers, tests or builds.

Only authorized plan/design/model/checkpoint documents and agent state may change. No application edits, package or skill installation/update, migrations, commits, moves/deletions, servers/watchers, paid services or downloaded-script execution. Generic skill defaults cannot override these restrictions. No branding, money-flow, safety-policy, scope or extra-feature choice has been finalized here. The user's 15% session platform share and separate 20% subscription share are constraints, not alternatives to blend.

The received prompt ends during Phase C topic 12. F1-F9 and the gate map are present; detailed remaining phase text is UNAVAILABLE. Resolve that input gap before relying on unseen instructions, not by inventing them.

## 2. Discovery and validation evidence

### Facts observed on disk

The skill path notation below is an exact expansion rule, not a search guess:

```text
H = C:/Users/Dell/.claude/skills
Top-level skill source = H/<Skill>/SKILL.md
E = H/sn-da-excel-workflow/capability
N = H/sn-da-non-spreadsheet-analysis/capability
R = D:/orbit-main/tmp-r3f/skills
T = D:/orbit-main/tmp-threejs/skills/source
W = D:/orbit-main/tmp-webshaders/skills
```

- 57 top-level home skills, all also named in the current runtime skill listing.
- 47 nested capability documents: 44 Excel capabilities and 3 non-spreadsheet capabilities. These are reference documents, not separately registered Skill calls.
- 104/104 home SKILL.md files passed structural inspection, independently repeated by the main agent with Node built-ins: readable nonempty file, frontmatter delimiters, nonempty name/description fields, and nonempty body. No full YAML-schema validation or runtime test was performed.
- 13 additional runtime-advertised skills have no file validation in this inventory. Their availability descriptions are known; their on-disk SKILL.md validity is UNVERIFIED, not failed. Load their actual instructions before use.
- 38 SKILL.md documents in pre-existing downloaded source clones passed the discovery agent's structural check. They are not additional installed/registered skills. No clone script ran or was promoted into the home skill directory.
- Older routing documents exist at [docs/plan/01-skill-routing.md](../01-skill-routing.md) and [docs/progress/skills-routing.md](../../progress/skills-routing.md). They are preserved. Their former exclusion of spreadsheets and academic/community research does not fit this task; their old counts are not reused.

### Bounded search, not an absence claim

Direct probes returned NOT_AT_EXACT_PATH for these candidate directories:

```text
C:/Users/Dell/claude-skills
C:/Users/claude-skills
C:/claude-skills
D:/claude-skills
D:/orbit-main/claude-skills
D:/orbit-main/orbit-main/claude-skills
D:/orbit-main/.claude/skills
D:/orbit-main/orbit-main/.claude/skills
```

A hidden-aware bounded walk visited 2,788 directories: home to depth 4 (including Desktop/Downloads where present), D:/orbit-main to depth 6 (including project hidden directories and .agent/scratch), and direct children of C:/Users, C:/ and D:/. It found no claude-skills directory or INSTALLED_SKILLS.md in that scope. A complete scoped traversal of H also found no INSTALLED_SKILLS.md. Exclusions: node_modules, .git, AppData, .cache, .npm, .gradle, .m2, .vscode, .android, venv, .venv, build, dist, Library, projects, history and sessions. No claim about excluded locations, deeper trees, other branches, worktrees or stashes is made. No missing file is being recreated.

### Meaning of Use

- Yes: directly applicable guidance, invoked when its phase/trigger is reached; not permission to start that phase now.
- Partial: relevant methodology or conditional use, with prohibited operations, missing dependencies or untested service access explicitly excluded.
- No: no current mandate or an incompatible execution path; each row explains why. Reconsider only if the user's scope or observed inputs change.

## 3. Top-level home routing: 57 skills

Every Skill below has the exact source H/<Skill>/SKILL.md, structurally checked on 2026-11-06. Phase letters refer to the user's gates. F1-F9 refer to Feature Pack 2, not the older implementation task IDs.

| Skill | Purpose | Where it applies | Use Yes/No/Partial | Reason |
|---|---|---|---|---|
| brainstorming | Clarify intent, alternatives and design decisions | A process boundaries; C2 invention; D/E/F decisions | Partial | Keep proposals distinct from approval; no spike, browser companion, extra output directory or implementation handoff |
| context7 | Current library documentation lookup | C technology comparison; E API confirmation | Partial | Endpoint access untested; use discovered library IDs and actual sources; no invented API or paid fallback |
| executing-plans | Implement a prepared plan | Later separate implementation task | No | Application implementation is explicitly forbidden here |
| r3f-animation | Frame-loop animation, damping and clips | B motion audit; C/E F8 specification | Partial | Review/specify only; do not animate or profile the running app |
| r3f-interaction | Picking, input and camera interaction | B reuse audit; E F8 accessibility/control specs | Partial | Specify DOM alternatives and ownership; no component edits |
| r3f-postprocessing | Composer and screen-space effects | B/C/E F8 cost and visual budgets | Partial | No renderer changes, installs or measured-performance claims |
| r3f-shaders | Custom material and procedural shader guidance | B/C/E F8 art specification | Partial | Design/review guidance only; no shader assets or code changes |
| receiving-code-review | Verify feedback before accepting it | B audit; D/E critique | Partial | Confirm claims and preserve uncertainty; do not apply code fixes |
| requesting-code-review | Independent review framing | B audit and E document review | Partial | Review only within the open phase; no merge/implementation actions |
| skill-creator | Author or improve skills | Only a separately requested skill task | No | No project-specific skill is needed now; shared skill directory is read-only |
| sn-code-video | Code-driven video production | E F8 and live-ops storyboard/timing concepts | Partial | Not a general web-app design skill; no MP4/render/server deliverable authorized |
| sn-da-excel-workflow | Workbook analysis, filtering and export | C2 idea scoring; D/E F5/F6/F7 models | Partial | Required methodology, but Python packages absent from isolated interpreter; paths and formula validation need adaptation |
| sn-da-image-caption | Extract evidence from images | B/C only if screenshot/chart evidence is needed | Partial | Native Read replaces service upload/cache script; preserve uncertain visual readings |
| sn-da-large-file-analysis | Streaming large spreadsheet analysis | Conditional on real data size | No | Planned idea/economy models are not large datasets; reload if actual inputs trigger its size rules |
| sn-da-non-spreadsheet-analysis | Extract PDF/Word/PPT information | C primary papers or legal-source documents | Partial | Source extraction only when needed; native PDF Read first, no report/deck production |
| sn-deep-research | Multi-source evidence and critical synthesis | C, feeding C2 | Partial | Stock WebUI/output/runner conflicts and missing helpers; reuse evidence discipline with native permitted tools |
| sn-deepresearch-cli | Install and launch research harness | None in this task | No | Global installs, configuration and browser/server preparation are prohibited |
| sn-image-base | External image/vision service layer | None | No | External generation/upload services are not authorized |
| sn-image-doctor | Configure image service environment | None | No | Credential and environment changes are outside scope |
| sn-image-imitate | Generate reference-style images | None | No | No generated imitation artwork requested; originality and no paid calls are constraints |
| sn-image-resume | Create resume images | None | No | Resume production is unrelated to the product plan |
| sn-infographic | Generate infographic assets | None | No | Requested artifacts are Markdown/Mermaid and editable models, not generated image reports |
| sn-md-to-html-report | Turn reports into HTML publications | Only if user later requests a shareable version | No | HTML report not requested; do not add a second delivery format |
| sn-motion-html | Build continuous-shot media stories | None | No | Produces a media/HTML experience rather than an application planning specification |
| sn-ppt-creative | Image-first slides | None | No | No presentation requested |
| sn-ppt-dazzle | Animated HTML slide deck | None | No | No slide deck requested |
| sn-ppt-doctor | Diagnose slide-rendering tooling | None | No | No PPT setup/export task |
| sn-ppt-entry | Initialize presentation task | None | No | Would create an unrequested presentation workspace |
| sn-ppt-standard | Render slides and package PPTX | None | No | Slide rendering and PPTX output are outside scope |
| sn-ppt-story | Prepare slide narrative | None | No | No presentation task pack or deck outline required |
| sn-ppt-tools | Presentation search/media helpers | None | No | No PPT pipeline; external service helpers not needed |
| sn-ppt-workbench | Interactive slide workbench | None | No | No slides, and starting a workbench server is forbidden |
| sn-prepare-citations | Deduplicate and number references | C/E citation quality control | Partial | Apply text-level discipline; no downloaded script, no citation of unopened sources |
| sn-proactive-agent | Install/start proactive agent | None | No | Installation and autonomous continuation conflict with this mandate |
| sn-report-format-discovery | Select report format | None | No | User already selected documents and editable spreadsheets |
| sn-research-report | Decision-oriented report structure | C syntheses; E plan evidence | Yes | Comparison and uncertainty structure suits the required written outputs |
| sn-search-academic | Scholarly search and citation tracing | C F1/F2/F3/F4/F9 evidence | Partial | Use native search/fetch rather than bundled crawlers or dependency installation |
| sn-search-code | Repositories, issues and developer discussion | C F6/F7 technology evidence | Partial | Use gh for GitHub and native tools elsewhere; not a substitute for local source audit |
| sn-search-finance | Securities and financial-market data | None | No | Market tickers do not establish Indian marketplace tax or payment rules |
| sn-search-image | Service-backed image discovery | None | No | Serper credential/service script not authorized; public reference pages can support design research |
| sn-search-market-cn | China-market official sources | None | No | Does not answer the India-first regulatory scope |
| sn-search-social-cn | Chinese social-platform search | None currently | No | Not needed for the specified pain-point coverage; avoid additional cookie/API dependencies |
| sn-search-social-en | Public English community evidence | C F9 pain-point mining | Partial | Public pages only; no paid/authenticated script or fabricated user quotations |
| sn-search-social-media | Public communities, news and trends | C F9 triangulation | Partial | Reuse source selection; execute native tools, not bundled scripts |
| sn-search-year-report | Official company disclosures | C only when directly relevant | Partial | Conditional corroboration, not a substitute for current official pricing pages |
| sn-team-harness | Explain collaboration harness | None | No | Harness introduction/setup is not the requested product work |
| sn-update | Update skill bundle | None | No | User explicitly forbids skill updates during this task |
| systematic-debugging | Evidence and root-cause investigation | A tool failures; B audit findings | Partial | Investigate without app instrumentation, code repairs or running test suites |
| tabbit | Browser launcher and isolated workspace | None currently | No | Documented launcher not at exact path; do not install/start browser infrastructure |
| test-driven-development | Test-first implementation discipline | E acceptance-test planning only | Partial | Specify future tests; no application test files, execution or implementation now |
| threejs-agents-model-optimizer | Transform/compress 3D assets | Later asset implementation task | No | No mesh/texture transformation or optimization pipeline authorized |
| threejs-core-math | Vector/matrix/rotation correctness | B audit; E F8 mathematical specs | Partial | Review/specify only; no app mutation |
| threejs-errors-performance | Memory/draw-call/performance discipline | B/C/E F8 risks and budgets | Partial | Targets and future measurement procedures, not unperformed profiling claims |
| threejs-impl-animation | Animation clips and lifecycle | E F8 if clips are proposed | Partial | Conditional architecture guidance; no clip pipeline execution |
| threejs-syntax-controls | Camera-control lifecycle | B/E interaction and fallback specs | Partial | Review input ownership and accessible alternatives without editing controls |
| verification-before-completion | Fresh evidence before claims | A through final plan lock | Yes | Document checks and explicit unknowns, not inherited app-test success |
| writing-plans | Engineer-ready tasks and interfaces | D/E implementation specifications | Partial | Use authorized paths and user gates; commits/execution remain a separate task |

## 4. Runtime-advertised additions: 13, file validation UNVERIFIED

The current session advertises these names, but discovery did not inspect their on-disk SKILL.md. Do not mark them missing, fabricate a path, or silently treat them as fully validated. The prior loaded workflow-authoring guidance is not permission to orchestrate.

| Skill | Purpose | Where it applies | Use Yes/No/Partial | Reason |
|---|---|---|---|---|
| dataviz | Accessible chart/visualization design | C2/D/E model charts and proposed analytics | Partial | Mandatory before actual chart design; load full body then; no chart made in A |
| update-config | Harness settings and hooks | None | No | No settings, permissions or hook changes requested |
| keybindings-help | Configure keyboard bindings | None | No | Editor/harness keybindings are outside product planning |
| code-review | Code review with verification | B only if explicitly scoped read-only | Partial | No --fix, PR comments or broad unrelated review; load recipe before use |
| simplify | Review and apply code simplification | None | No | Applies application edits, which are forbidden |
| fewer-permission-prompts | Change command allowlists | None | No | Permission/configuration changes are prohibited |
| loop | Schedule recurring work | None | No | No recurring task requested; must not bypass approval gates |
| claude-api | Anthropic API guidance | None currently | No | User's AI feature explicitly names local Ollama; no provider switch authorized |
| workflow-authoring | Multi-agent orchestration instructions | Conditional within an approved phase | Partial | Ultracode is off; a separate explicit workflow opt-in is required |
| run | Launch and use the app | None | No | Servers/watchers and application execution are prohibited |
| plugin-authoring | Modify harness interface/behavior | None | No | Harness modifications are unrelated and outside writable scope |
| init | Initialize codebase instructions | None | No | CLAUDE.md already exists; only the requested marked addition is needed |
| security-review | Review pending code security | B only when scoped to audit requirements | Partial | Read-only evidence only; no broad pending-diff action or remediation |

## 5. Nested capabilities: validated references, not callable aliases

All paths in this section resolve to <base>/<relative path>/SKILL.md. Each was independently structure-checked. Read the relevant full document at use time; a name does not prove its examples are appropriate. These rows route the capability, not a new phase.

| Base / relative path | Purpose | Where | Use | Reason |
|---|---|---|---|---|
| E / excel-reading/single-sheet-reading | Read one sheet | C2/D/E models | Partial | Inspect inputs/formulas without relying only on cached values |
| E / excel-reading/multi-sheet-reading | Read workbook sheets | C2/D/E models | Partial | Required cross-sheet consistency checks; packages unavailable here |
| E / excel-reading/specific-sheet-reading | Select named sheets | C2/D/E models | Partial | Separate assumptions, scenarios and outputs |
| E / excel-reading/range-reading | Bounded reads | C2/D/E checks | Partial | Inspect model ranges without dumping all data |
| E / excel-reading/structured-header-reading | Identify structured headers | C2/D/E models | Partial | Stable column and unit semantics |
| E / excel-reading/multi-file-reading | Combine workbooks | Conditional E consistency checks | Partial | Only if cross-model inputs require it |
| E / excel-reading/large-excel-reading | Large-file reads | Conditional | No | No large input established; activate on measured size |
| E / excel-data-cleaning/duplicate-removal | Deduplicate records | C2 idea IDs | Partial | Keep provenance and explicit merges; do not erase distinct ideas |
| E / excel-data-cleaning/invalid-data-cleaning | Validate values | C2/D/E assumptions | Partial | Flag errors, never silently discard source data |
| E / excel-data-cleaning/missing-value-handling | Missing inputs | C2/D/E models | Partial | Unknown is not zero; document assumptions |
| E / excel-data-cleaning/numeric-format-normalization | Consistent units/types | C2/D/E models | Partial | Percent, currency, time and integer semantics must remain explicit |
| E / excel-data-cleaning/outlier-detection | Detect unusual values | D sensitivities | Partial | Flag for review, not automatic removal |
| E / excel-data-cleaning/text-normalization | Normalize labels | C2 long-list | Partial | Preserve English/Hindi and original evidence; reject Chinese-only example |
| E / excel-data-filtering/category-filtering | Group categories | C2 identities/lenses | Partial | Every idea remains traceable |
| E / excel-data-filtering/condition-filtering | Rule-based filtering | C2 shortlist | Partial | Ethics hard filter cannot become merely a weighted score |
| E / excel-data-filtering/range-filtering | Select ranges | D sensitivities | Partial | Explicit boundaries and assumptions |
| E / excel-data-filtering/threshold-filtering | Threshold rules | C2/D models | Partial | Proposed thresholds, not approved product mechanics |
| E / excel-data-analysis/comparison-analysis | Compare scenarios | C2/D | Partial | Required alternative and sensitivity comparisons |
| E / excel-data-analysis/group-by-analysis | Group results | C2/D | Partial | Identity, cohort and scenario breakdowns |
| E / excel-data-analysis/kpi-metric-analysis | Summarize metrics | D/E | Partial | Define denominators and distinguish targets from observed results |
| E / excel-data-analysis/pivot-table-analysis | Cross-tab summaries | C2/D conditional | Partial | Only where a pivot improves explainability |
| E / excel-data-analysis/time-series-analysis | Time-series models | D 12-month currencies | Partial | Assumptions drive formulas, not static result tables |
| E / excel-data-analysis/trend-analysis | Interpret trends | D | Partial | Simulation output is not a forecast claim |
| E / excel-data-statistics/basic-statistics | Descriptive checks | C2/D | Partial | Preserve sample sizes and uncertainty |
| E / excel-data-statistics/category-statistics | Category summaries | C2/D | Partial | Audit coverage across identities and feature groups |
| E / excel-data-statistics/grouped-statistics | Group metrics | C2/D | Partial | Avoid hiding poor subgroup outcomes |
| E / excel-data-statistics/percentage-calculation | Shares and rates | D F5/F7 | Partial | Keep 15% sessions separate from 20% subscriptions; taxes need evidence |
| E / excel-data-visualization/bar-chart-visualization | Compare categories | C2/D optional charts | Partial | Load dataviz first; do not choose visual form prematurely |
| E / excel-data-visualization/line-chart-visualization | Show time changes | D optional charts | Partial | Useful for 12-month scenarios if rendering support exists |
| E / excel-data-visualization/scatter-plot-visualization | Show tradeoffs | C2 optional charts | Partial | May expose feasibility/impact tradeoffs; no invented data |
| E / excel-data-visualization/stacked-chart-visualization | Show composition | D optional charts | Partial | Only with readable composition and denominators |
| E / excel-data-visualization/histogram-visualization | Show distributions | D conditional | Partial | Only if actual simulation sample data supports it |
| E / excel-data-visualization/pie-chart-visualization | Part-to-whole chart | None currently | No | No need for pie charts; tables/bars better preserve close comparisons |
| E / excel-cell-coloring/category-coloring | Distinguish categories | C2/D/E workbooks | Partial | Accessible non-color labels required |
| E / excel-cell-coloring/duplicate-value-coloring | Flag duplicate IDs | C2 workbook QA | Partial | Flag, do not delete |
| E / excel-cell-coloring/outlier-coloring | Flag unusual outputs | D workbook QA | Partial | Visual warning only, no automatic exclusion |
| E / excel-cell-coloring/threshold-cell-coloring | Flag threshold crossings | D workbook QA | Partial | Explain thresholds; not alarmist styling |
| E / excel-cell-coloring/top-value-coloring | Highlight rank | C2 shortlist QA | Partial | Include sensitivity and ethics results; not just highest score |
| E / excel-conditional-formatting/data-bar-formatting | In-cell comparison | C2/D conditional | Partial | Optional, with numerical values retained |
| E / excel-result-export/single-sheet-export | Export data | C2/D | Partial | Useful supplemental view, not replacement for multi-sheet formulas |
| E / excel-result-export/formatted-export | Format workbook | C2/D/E | Partial | Value-export examples do not establish live recalculation |
| E / excel-result-export/chart-embedded-export | Embed charts | C2/D conditional | Partial | Only after supported chart creation and dataviz review |
| E / excel-result-export/report-generation-export | Assemble report sheets | C2/D/E | Partial | Use authorized model path; no extra publication artifact |
| E / excel-table-styling/table-theme-styling | Consistent tables | C2/D/E | Partial | Legible input/formula/output distinctions |
| N / pdf-analysis | Extract PDF evidence | C official sources/papers | Partial | Native Read with page ranges first; no downloaded script execution |
| N / word-analysis | Extract Word evidence | Conditional C | No | No Word input currently supplied; activate only if encountered |
| N / ppt-analysis | Extract slides | Conditional C | No | No slide input supplied or requested |

## 6. Downloaded source clones: all No for active execution

These are discovered reference copies, not active skill registrations. Existing registered equivalents take precedence. Their shared No reason is that installing/promoting them or executing downloaded scripts is prohibited; duplicate copies must not inflate capability counts. Full implementation-oriented bodies were not used for product decisions.

| Exact path expansion | SKILL.md directories | Use | Concrete reason |
|---|---|---|---|
| R/<name>/SKILL.md | r3f-animation, r3f-fundamentals, r3f-geometry, r3f-interaction, r3f-lighting, r3f-loaders, r3f-materials, r3f-physics, r3f-postprocessing, r3f-shaders, r3f-textures | No | 11 source copies; no installation or downloaded execution |
| T/threejs-agents/<name>/SKILL.md | threejs-agents-model-optimizer, threejs-agents-scene-builder | No | 2 source copies, not active registrations |
| T/threejs-core/<name>/SKILL.md | threejs-core-math, threejs-core-raycaster, threejs-core-renderer, threejs-core-scene-graph | No | 4 source copies; home versions cover applicable review guidance |
| T/threejs-errors/<name>/SKILL.md | threejs-errors-performance, threejs-errors-rendering | No | 2 source copies; no new renderer-debugging task |
| T/threejs-impl/<name>/SKILL.md | threejs-impl-animation, threejs-impl-audio, threejs-impl-drei, threejs-impl-ifc-viewer, threejs-impl-lighting, threejs-impl-physics, threejs-impl-post-processing, threejs-impl-react-three-fiber, threejs-impl-shadows, threejs-impl-webgpu, threejs-impl-xr | No | 11 source copies; no app/asset implementation or extra platform scope |
| T/threejs-syntax/<name>/SKILL.md | threejs-syntax-controls, threejs-syntax-geometries, threejs-syntax-loaders, threejs-syntax-materials, threejs-syntax-shaders | No | 5 source copies; do not promote downloaded dependencies |
| D:/orbit-main/tmp-threejs/tmp-auditor/SKILL.md | tmp-auditor | No | Unregistered nested source artifact |
| D:/orbit-main/tmp-threejs/tmp-playwright/skills/playwright-skill/SKILL.md | playwright-skill | No | Unregistered downloaded browser tooling; no execution |
| W/web-shaders/SKILL.md | web-shaders | No | Unregistered source copy; no new shader implementation |

## 7. Execution constraints and capability gaps

### Verified static facts, with source anchors

1. H/sn-deep-research/SKILL.md:74-83 defaults to a new report directory outside approved paths; :103-138 requires a progress WebUI, with host 0.0.0.0. Its referenced sn-ppt-standard/scripts/progress_event.py and launch_workbench.py were not at those exact paths; scoped discovery found neither filename under H. Do not run this pipeline. Its evidence gathering, review and uncertainty discipline remains useful.
2. H/sn-deepresearch-cli/SKILL.md:28-54 describes global installation/configuration, :63-68 another adapter install, and :115-126 browser preparation. No part of that setup was executed.
3. H/sn-da-excel-workflow/SKILL.md:15-21 requires openpyxl for reading; :56-61 uses pandas/pyarrow; :57 and :130-133 use /tmp and /mnt/data. Its :89-95 Chinese-only cleaning example is inappropriate for this product's English/Hindi data. Do not copy it.
4. H/sn-da-excel-workflow/capability/excel-result-export/formatted-export/SKILL.md:52-72 illustrates value export/formatting, not proof of formula recalculation. A CSV or table of computed numbers alone cannot satisfy the user's editable spreadsheet requirement.
5. H/sn-da-image-caption/SKILL.md:3 says no extra key, while :18 requires a configured API key. The caption script uses external transmission and a skill-directory cache. No upload or script execution is permitted; native Read is the fallback.
6. H/context7/SKILL.md:19 and :37 give API lookup patterns; :85 claims basic access without a key. Those are skill claims, not a successful live request in Phase A. jq is absent on the current PATH; Node built-in JSON parsing is available. No Context7 call was made.
7. H/sn-search-academic/SKILL.md:39-55 contains dependency/browser setup. Search wrappers depend on packages such as httpx. H/sn-search-social-en/SKILL.md:18-20 identifies authenticated service paths. Use native public-source tools and gh for GitHub, without wrapper execution or new credentials.
8. H/sn-code-video/SKILL.md:3 excludes general web apps and :78 references a serving capture helper. It can inform timing/storyboards, not replace frontend-design expertise or authorize rendering.
9. H/brainstorming/SKILL.md:26-32 requires design approval before implementation; H/writing-plans/SKILL.md:16-17 allows user-selected output paths, :45-50 includes implementation/commit steps. Preserve design discipline; omit all current execution and commit actions.
10. H/verification-before-completion/SKILL.md:14-33 requires fresh evidence. H/systematic-debugging/SKILL.md:48-68 requires investigation before fixes. Here evidence is document/state validation and source inspection, not unrun application tests or a forced reproduction that writes files.

### Dependency probe results

Read-only Python `-I` probes used find_spec without importing third-party modules. In that interpreter, openpyxl, pandas, pyarrow, xlsxwriter, httpx, PIL, matplotlib and yaml were not discoverable. This is not a machine-wide package absence claim. gh and curl were on PATH; jq, soffice and libreoffice were not. Excel and other Python environments were not inspected. Service access, authentication and workbook recalculation are UNVERIFIED.

The documented Tabbit launcher at C:/Users/Dell/AppData/Local/Tabbit/LocalAgent/bin/tabbit-cli.exe was not at that exact path. No browser launcher was installed or started.

### Recommendations, not approved environment changes

- Use native read-only tools for Phase B and public-source research in Phase C. Never cite snippets as if their source page was opened. Separate Facts, Inferences and Opinions; log queries, URLs, access dates, disagreements and failed fetches in the authorized research log when Phase C opens.
- Spreadsheet support is a material gap, not a Phase B blocker. Recommended no-install path: in the approved modeling phase, create standards-based XLSX documents using available standard-library ZIP/XML capabilities, with live formulas, editable assumptions and independent numerical checks. This is a proposed method, not a validated workbook implementation. A spreadsheet-engine recalculation check still needs an available engine; do not claim it without evidence.
- Alternative for the user to provision in a separate authorized maintenance task: openpyxl or XlsxWriter for workbook creation, plus Excel or LibreOffice for recalculation. pandas/pyarrow are optional unless actual data warrants them. No package or engine will be installed in this task.
- No frontend-design or design-critique skill was found among the registered/home skills. This is a specialist coverage gap, not proof of machine-wide absence. Recommend using existing art/token documents plus explicit accessibility/performance/critique checklists, with any specialist skill provisioned separately only if the user wants it. Do not invent an installation URL.
- No legal/child-safety credential is conferred by these skills. India compliance and minors policy need official sources and later accountant/lawyer review; neither is established in A.

## 8. Per-phase enforcement and feature coverage

Before an approved phase: read STATE; confirm typed gate approval and record exact words in DECISIONS; re-read relevant SKILL.md bodies; load registered skills when their triggers apply; record applicable limitations; tag assisted outputs. If a required behavior conflicts with the mandate, mark Partial and use the stated permitted alternative, not a silent substitute.

| Phase / feature coverage | Routed guidance | Must not happen yet |
|---|---|---|
| A skills only | brainstorming, systematic-debugging, verification-before-completion | No application audit, external research or idea generation |
| B existing-system audit | systematic-debugging; relevant r3f/threejs review; verification-before-completion | No fixes, servers, tests, model creation or Phase C research |
| C F1/F2 demand/reputation | sn-deep-research, sn-search-academic, sn-research-report, sn-prepare-citations | No final ranking weights or allocation decision without evidence/gates |
| C F3/F4/F9 learning and motivation | Academic/community search, report structure | No treating popularity anecdotes as causal learning evidence |
| C F5/F7 economics, India and safety | Primary-source research and structured comparisons | No tax advice, paid calls, money-flow or safety-policy approval by inference |
| C F6/F7 media, whiteboard and notes | context7, sn-search-code, sn-deep-research | No library installation, rebuild or provider contract |
| C2 F9 Feature Lab | brainstorming, Excel workflow, dataviz if charts, research report | No silent reduction of F9 to an appendix; no unapproved shortlist finalization |
| D F1-F9 thinking and simulations | brainstorming, Excel capabilities, writing-plans as applicable | No presenting assumptions or synthetic simulations as observed outcomes |
| E engineering/design specification | writing-plans, TDD planning, r3f/threejs, research/citations, dataviz as triggered | No code execution; all named APIs need audit/research evidence |
| F interview/final update | brainstorming and verification discipline | CP-F approval gates final updates; PLAN LOCKED never means implementation approved |

Full detailed C2/D/E/F instructions must be recovered before applying their missing phase-specific requirements. This table routes the known mandate only, not an invented replacement for the truncated text.

## 9. Phase A acceptance record

- Required discovery locations probed, with bounded negative results documented.
- 57 home and 47 nested skill files independently structurally validated; 13 runtime-only entries explicitly unverified on disk; 38 downloaded source copies kept separate.
- Each top-level runtime skill and nested capability has a Yes/No/Partial route with a concrete reason.
- Dependency and instruction conflicts recorded; no dependency installation, skill editing or external service execution.
- Old routing preserved rather than rewritten; this user-specified v2 document is the current routing for Feature Pack 2.
- App preservation fingerprint and document/gate checks are recorded in [CP-A](../../progress/checkpoints/CP-A.md) and [ENVIRONMENT](../../../.agent/ENVIRONMENT.md). Passing A is not product readiness or research completion.

## 10. Problems and limits

The discovery fork's broad INSTALLED_SKILLS.md Glob timed out after 20 seconds; bounded Node traversal succeeded. Initial Git inspection exceeded its 10-second foreground budget, then completed with exit 0; no duplicate process was started. Git reported existing LF-to-CRLF conversion warnings; no Git setting changed. Static dependency gaps and prompt truncation are documented above and in [ERRORS](../../../.agent/ERRORS.md).

No external factual sources were fetched in A. Product code quality, live tool services, full YAML validity, spreadsheet-engine recalculation, legal facts, prices and later product decisions remain UNVERIFIED. No machine-wide absence or runtime-readiness claim is made.
