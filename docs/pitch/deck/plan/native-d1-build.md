# Dense ten-slide D1 Implementation Plan
> **For agentic workers:** Execute inline; the user specified native editable PPTX and opted out of further questions. No application implementation or commits.

**Goal:** Produce exactly ten dense, evidence-qualified READ slides, editable PPTX, vector PDF, presentation-safe PPTX, notes and verified D1 review artifacts.
**Architecture:** One canonical outline and explicit panel data feed a native PptxGenJS renderer. A 12-column / 6-row layout tiles six numbered panels per content slide. Measured text wrapping rejects overflow rather than shrinking fonts. All outputs are regenerated from inputs.
**Tech Stack:** Existing isolated PptxGenJS 4.0.1, Sharp 0.35.5, ExcelJS 4.4.0; isolated Pillow for font measurement; LibreOffice 26.8.3.1 and Poppler 25.07.0.
**Spec:** ../DECK_SPEC.md. Business content/order retained; composite panels split to six modules; hero spans five columns by three rows to exceed 18%.

## Global Constraints
- Exactly ten main slides: TITLE, PROBLEM, CUSTOMERS, SOLUTION · HOW IT WORKS, PROGRESS, MARKET, MONEY, PLAN, TEAM, ASK.
- 13.333 x 7.5 in, body 12.633 x 5.82 in; 12 columns / 6 rows; 0.12 in gutters; 0.10 in panel padding.
- Content slides: six to ten modules, 160–300 substantive words, at least ten quantitative items and two non-text visuals, hero at least 18%, panel coverage at least 93%.
- Fonts: Segoe UI / Semibold; body and tables 11.5 pt, module titles 10 pt, headline 28 pt, hero 72 pt; chips/source/footer 8 pt. No autofit shrinking.
- Prototype screens use synthetic data, retained build, no backend/DB/provider operations. No new capture/research replay.
- Published completion is historical context, prices dated observations; every target/cost scenario visibly estimated. No primary survey/interview results, paying customers or bank transfers invented.
- Founder names, target campus, costs, balance, hours, contact and deadline stay unknown; no fake identities or filler markers.
- Stop at D1, not submission/final pack. M-0/M1 deferred; no application dependencies/recovery tools/settings edits.

## Review Focus
- Overflow in narrow panels: measured font widths and line heights; reject long unbreakable words and over-capacity text.
- Source ambiguity: every panel lists source IDs; number registry includes units, evidence class and assumption/status.
- Cost double counting: workbook separates recurring fixed cost, variable cost and one-time launch uses; funding excludes speculative revenue.
- Editability and render fidelity: inspect native PPTX XML, vector/searchable PDF, image sizing and presentation-safe slide/notes counts.
- Truth on incomplete product: source-visible is not live, screenshots not traction, queued payouts not bank settlement.

### Task 1: Content and model
**Files:** outline.md, task_pack.json, info_pack.json, deck-data.json, sources.json, deck-layout.json, ../funding-proposal.md, ../models/launch-budget.xlsx.
- [ ] Rewrite the single outline with ten continuous pages and source-qualified takeaways.
- [ ] Define six-panel content with visible facts/estimates, source IDs, explanatory notes and quantitative registry.
- [ ] Use INR100,000 as a delegated proposal derived from seven explicit estimate lines, not the INR200,000 ceiling.
- [ ] Generate formula workbook; assert Core contribution 50.69 rounded under the retained scenario and allocation sum 100,000; real cash stays unknown.

### Task 2: Native renderer and checks
**Files:** build_deck.mjs, native/render.mjs, native/contracts.mjs, native/contracts.test.mjs, native/measure_text.py.
- [ ] Write behavior tests for overlapping/out-of-grid panels, missing sources, font/slot overflow and financial basis; run RED before contracts implementation.
- [ ] Implement measured wrapping at fixed font sizes; fail on width/height/character overflow.
- [ ] Render native shapes/text/tables/images and notes; preserve v0-v4 and reject overwrite of existing output version.
- [ ] Generate machine-readable layout/number/text report; run all isolated deck tests, not application suite.

### Task 3: Render and D1 QA
**Files:** versions/v5/*, qa/*, ../checkpoints/D1.md.
- [ ] Convert actual PPTX to PDF with LibreOffice; render all ten pages at 200 dpi and produce contact sheet and small previews.
- [ ] Create presentation-safe image-slide PPTX with identical notes; inspect ten slide/notes counts.
- [ ] Run automated tiling, content, text, font, source, financial and image checks; preserve failures before fixes.
- [ ] Main visually checks all slides in three passes; two read-only PNG critics return independent feedback; verify and resolve genuine defects.
- [ ] Refresh canonical state/resume paths; post D1 with real artifact links, unknown founder facts and deferred Job M status. No submission or final backup build.
