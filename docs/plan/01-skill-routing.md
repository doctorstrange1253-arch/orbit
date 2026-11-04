# 01 Skill Routing Table

## Skills Discovered

| Skill | Purpose (from SKILL.md) | Applies to (area / phase) | Use: Yes / No / Partial | Reason |
|---|---|---|---|---|
| `sn-md-to-html-report` | Creates HTML reports from Markdown, preserving facts and reconstructing visual experience | Deliverable (Phase 3 report formatting) | Yes | Report must be in Markdown; may need HTML special page per deliverable structure |
| `sn-prepare-citations` | Goes to deduplicate/number citations, append reference list | Deliverable (Phase 3 report citations) | Yes | Audit findings need numbered citations and reference appendix |
| `sn-research-report` | Selects research report structure based on reader cognitive tasks | Phase 1 orientation, Phase 2 research structuring | Yes | Each research area needs structured template selection |
| `sn-deep-research` | Multi‑agent deep research, competitor analysis, comparative reports | Phase 2 market research (A‑H) | Partial | External competitor data requires live search; not running external research but internal codebase audit |
| `sn-da-excel-workflow` | Excel multi‑step workflow: counting, cleaning, filtering, analysis, export | Phase 2 financial modeling / unit economics | No | Project has financial data in node configs, not Excel spreadsheets |
| `sn-da-non-spreadsheet-analysis` | Word/PDF/PPT document parsing and data extraction | Phase 2 product critique (design language, docs) | Partial | Some design doc PDFs exist, but primary data is code/JS/TS |
| `sn-da-large-file-analysis` | High‑performance analysis of ≥100k row datasets, Parquet streaming | Phase 2 data volume assessment | No | No large datasets present; codebase is moderate size |
| `sn-image-base` | Image generation/recognition (VLM, LLM) — low‑level infra only | Phase 2 UI & visual design (3D space) | No | Not generating or analyzing images directly |
| `sn-image-doctor` | Environment diagnostic for image-base | Phase 2 UI | No | Environment check not required |
| `sn-image-imitate` | Generates image imitating reference style | Phase 2 UI | No | Not generating images |
| `sn-image-resume` | Generates portfolio resume image | Phase 2 UI | No | Not generating resumes |
| `sn-infographic` | Generates professional infographics | Phase 2 product critique / marketing | Partial | Marketing HTML/SVG assets exist but not primary audit focus |
| `sn-motion-html` | Continuous‑shot motion‑driven HTML stories | Phase 2 marketing assets | Partial | `marketing/orbit-launch.html` exists; can reference |
| `sn-ppt-*` (creative, dazzle, doctor, entry, standard, story, tools, workbench) | PPT/slide generation | Phase 2 none | No | Not generating presentations |
| `sn-prepare-citations` | Depreference, number citations, append references | Phase 3 report | Yes | Audit report needs numbered citations |
| `sn-proactive-agent` | Install/start/Use Proactive Agent | Phase 2 DevEx / operations | No | Not installing proactive agents |
| `sn-report-format-discovery` | Recommend research product form | Phase 1 | No | Format explicitly specified as Markdown |
| `sn-research-report` | Write/organize research report structure | Phase 1–3 | Yes | Core structuring skill for all phases |
| `sn-search-*` (academic, code, finance, image, market‑cn, social‑cn, social‑en, social‑media, year‑report) | Search across domains | Phase 1 discovery | No | Audit is strictly internal/evidence‑based on repo; no external search needed |
| `sn-team-harness` | SenseNova Team Harness overview | Phase 2 none | No | Not part of project harness |
| `sn-update` | Update SenseNova Skills | Phase 2 none | No | Skills already installed |
| `tabbit` | Control Tabbit Browser in Playwright workspace | Phase 2 QA / E2E test | Partial | Could help run E2E browser tests on frontend |
| `sn-code-video` | Create code‑driven videos with Canvas/SVG | Phase 2 marketing asset review | Partial | Has video scripts in docs/ but not full generation |

## Routing Table Summary

| Phase / Area | Applicable Skills | Rationale |
|---|---|---|
| **Phase 1 — Orientation / Gap Analysis** | `sn-research-report` (structure), `sn-md-to-html-report` (format) | Determine current product state vs. vision; structure analysis |
| **Phase 2 — Deep Research** | `sn-research-report` (template selection: Full panorama vs. comparison vs. timeline), `sn-da-excel-workflow` (no — no Excel data), `sn-deep-research` (internal evidence only, mark as manual), `tabbit` (optional E2E tests) | Each topic (A‑H) maps to specific template; citation/audit data is manual |
| **Phase 3 — Scoring & Prioritization** | `sn-md-to-html-report` (final deliverable), `sn-prepare-citations` (numbered citations), `sn-research-report` (structural conventions) | Generate scorecard, findings table, deliverable MD |
| **Phase 4 — Audit of Existing Product** | `sn-search-code` (internal search within codebase — relevant for bugs/patterns), `sn-deep-research` (reviewing existing systems docs) | Analyze current bugs, risks, security findings |
| **Phase 5 — Master Plan Deliverables (16 files + 1 visual)** | `sn-md-to-html-report` (plan.md → HTML special page), `sn-prepare-citations` (citations in every deliverable), `sn-research-report` (each deliverable has template choice) | All 16 plan docs + 1 visual overview require structured markdown → possible HTML conversion |
| **Phase 6 — Interview Me** | No skills needed — human‑only step | Structured interview after plan delivery |

## Applied Skills Tracking

- **sn-research-report**: Phase 1 gap analysis structure selection; Phase 2 template mapping; Phase 3 scorecard formatting; Phase 5 deliverable structuring.
- **sn-prepare-citations**: Phase 3 findings citations; Phase 5 reference appendix across all 16 deliverables.
- **sn-md-to-html-report**: Phase 3 optional HTML conversion of final report; Phase 5 plan.md → HTML one‑pager; Phase 6 interview prep materials.
- **tabbit**: Optional — if Phase 4 requires running Playwright E2E tests on the frontend app (video calls, session booking).
- **sn-deep-research**: Marked as **partial** and **manual** — internal codebase evidence used; external market research would need live API/web search configured (Tier 2 env vars not set in this sandbox).