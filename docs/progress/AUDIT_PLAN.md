# Skill Routing Table

| Skill | Purpose (from SKILL.md) | Applies to (area / phase) | Use: Yes / No / Partial | Reason |
|---|---|---|---|---|
| `sn-code-video` | Create and revise code-driven videos with Canvas, SVG, etc. | Phase 2.9 (Product Critique / Marketing asset review) | Partial | The project has marketing HTML/SVGs and launch video scripts (`docs/launch-video-script.md`), but not full code video generation code. |
| `sn-da-excel-workflow` | Excel 数据分析多步编排器。 | Phase 2.8 / 2.10 (Data analysis / hygiene) | No | No Excel/CSV files in the core codebase requiring multi-step Excel workflow processing. |
| `sn-da-image-caption` | 图片理解与数据提取 skill。 | Phase 2.8 / 2.9 (Image analysis) | No | No primary image analysis or data extraction from images required. |
| `sn-da-large-file-analysis` | 万行以上 Excel 数据集的高性能分析引擎。 | Phase 2.8 (Large file data analysis) | No | No large datasets/Excel files in repository. |
| `sn-da-non-spreadsheet-analysis` | Word / PDF / PPT 文档解析与数据分析引擎。 | Phase 2.7 / 2.10 (Document parsing) | Partial | There are documentation files (e.g. `docs/launch-video-script.md`), but no PDF/Word/PPT docs to parse. |
| `sn-deep-research` | 用于用户请求深度研究、系统性研究、竞品分析等。 | Phase 2.9 (Product critique & competitive review) | Partial | Useful for evaluating product positioning, but not doing external market research. |
| `sn-deepresearch-cli` | 一键启用 SenseNova-Skills-DeepResearch。 | Phase 2.9 | No | Not conducting external market/industry deep research. |
| `sn-image-base` | Base-layer skill for image generation/recognition. | Phase 2.9 (UI asset review) | No | Low-level API library, not applicable to repo audit directly. |
| `sn-image-doctor` | Environment diagnostic skill for image-base. | Phase 2.9 | No | Environment check not required. |
| `sn-image-imitate` | Generates a new image imitating reference style. | Phase 2.9 | No | Not generating images. |
| `sn-image-resume` | Generates a designed portfolio-resume image. | Phase 2.9 | No | Not generating resumes. |
| `sn-infographic` | Generates professional infographics. | Phase 2.9 (Marketing / presentation review) | Partial | Marketing HTML templates exist (`marketing/`), could be referenced. |
| `sn-md-to-html-report` | 将 Markdown 报告、研究笔记等重组为自包含 HTML 专题页。 | Phase 2.7 / Deliverable (Report generation) | Yes | Used to format the final audit report into an editorial HTML special page if requested, or to structure clean markdown reports. |
| `sn-motion-html` | Build continuous-shot motion-driven HTML stories. | Phase 2.9 (Marketing assets / UI preview) | Partial | Marketing landing pages (`marketing/orbit-launch.html`) use motion/HTML styling. |
| `sn-ppt-*` (creative, dazzle, doctor, entry, standard, story, tools, workbench) | PPT/Slide deck generation and workbench tools. | Phase 2.7 / 2.9 | No | Not generating presentations. |
| `sn-prepare-citations` | 去重引用，转换为 [N] 编号并追加参考文献。 | Deliverable (Report citations) | Yes | Used to ensure clean reference formatting in the audit report. |
| `sn-proactive-agent` | 安装、启动和使用 Proactive Agent。 | Phase 2.7 (DevEx / operations) | No | Not installing proactive agents. |
| `sn-report-format-discovery` | 用于推荐研究成品形式。 | Deliverable | No | Report format is explicitly specified as Markdown. |
| `sn-research-report` | 用于撰写或组织研究报告结构。 | Phase 2.7 / Deliverable (Report structure) | Yes | Used to structure the audit report professionally. |
| `sn-search-*` (academic, code, finance, image, market-cn, social-cn, social-en, social-media, year-report) | Search capabilities across domains. | Phase 2.4 / 2.6 (External intelligence) | No | Audit is strictly internal/evidence-based on the local repository. |
| `sn-team-harness` | Intro/overview of SenseNova Team Harness. | Phase 2.7 | No | Not part of the project harness. |
| `sn-update` | Update SenseNova Skills. | N/A | No | Skills were just installed. |
| `tabbit` | Control Tabbit Browser in Playwright workspace. | Phase 2.5 (QA / E2E test execution) | Partial | Can be used if running E2E browser tests on the frontend app. |

## Audit Plan
1. **Phase 0 & 1 Completed**: Tree printed, dependencies inspected, package manifests read, skill routing table established.
2. **Phase 2 Deep Analysis**:
   - 2.1 Architecture & Design (Backend Mongoose models/controllers + Frontend React/Zustand structure)
   - 2.2 Code Quality (Linting rules, ESLint, naming, error handling)
   - 2.3 Correctness & Reliability (Transactions, error middleware, async handling)
   - 2.4 Security & Safety (Helmet, sanitization, rate limiting, JWT, auth middleware)
   - 2.5 Testing & QA (Jest tests in backend, Vitest/React Testing Library in frontend)
   - 2.6 Performance & Scalability (Redis caching, socket.io adapter, compression)
   - 2.7 DevEx & Operations (Dockerfiles, Fly.io, Railway, Render configs, CI/CD GitHub Actions)
   - 2.8 Data / ML (AI controller, mlService, knowledge graph)
   - 2.9 Product Critique (Orbit skill-swapping platform review against launch script & UI assets)
   - 2.10 Project Hygiene (Licensing, .gitignore, clutter)
3. **Phase 3 Scoring & Prioritization**: Scorecard and classified findings.
4. **Deliverable**: Write comprehensive audit report to `./AUDIT_REPORT.md`.
