# G1 draft QA report — Deck v4

Written for the founder reviewing the TBI-GEU submission. This is a usable draft, not final approval or a claim of validated demand.

## Latest files

- v4/Deck_v4.pdf: 14 image-backed pages, 2,083,629 bytes.
- v4/Deck_v4.pptx: 14 slides, 580,759 bytes; exported through the SN presentation exporter.
- v4/contact-sheet.png: all 14 latest slides, visually opened.
- v4/speaker-notes.md: 647 words for the main pitch and a 300-second timing allocation; backup notes are separate.
- ../models/pitch-model.xlsx: 93 rows across 9 sheets, 181 formulas. Actual bills remain missing.
- ../models/use-of-funds.xlsx: itemized allocation and the reduced-funding ladder.
- q-and-a-one-page.md, facts-needed.md and submission-checklist.md.

## Verified technical checks

| Check | Result |
|---|---|
| Structure | PASS: cover, organizer topics 01–10, three clearly labelled Q&A backups |
| PPTX export | PASS: 14 converted, zero failed |
| PDF page count | PASS: 14 |
| Speaker notes in PPTX | PASS: 14 note parts; XML well-formed |
| Exported type sizes | PASS structural: no explicit font below 12 pt; headline/body design floors 33/18 pt |
| Native chart | PASS: one editable funding chart; economics shown as a table rather than the requested waterfall |
| Geometry checker | Zero outside-canvas/horizontal-overflow candidates; does not establish zero intersections |
| Text contrast | Ink 13.66:1; muted 5.84:1; primary 4.69:1; warm 5.41:1 against paper |
| Chart colors | Two-color light palette passed lightness, chroma, CVD separation and contrast checks |
| Funding arithmetic | PASS: full allocation Rs 2,00,000; ladders total Rs 1,00,000 / 1,50,000 / 2,00,000 |
| Independent scenario arithmetic | Core CM Rs 50.69; higher-tier Rs 114.02; session Rs 78.52; mixed-tier break-even 237 |
| Preservation | 1,190 protected safe files match the original main snapshot; allowed control/side files and secrets excluded |
| Offline preview | Opens and advances; raster preview, not the stock portable-font player |

The notes are three words below the requested 650-word lower bound. They fit the proposed five-minute timing, but no actual rehearsal was performed.

## Actual critique passes and fixes

1. Initial v0 contact sheet and full slides: found overlapping product images/headlines, image-edge overflow, unreadable image caption, footer collisions on progress/team/method/risks, and clipped/wrapped funding labels. Bounded image slots, captions outside images, table spacing and chart gutters corrected these. The session tax calculation was also corrected from Rs 101.40 to Rs 78.52.
2. Fresh v1 contact sheet: found a mojibake discovery headline, market-annotation overlap and the backup table's final row colliding with an estimate. Corrected the data encoding and spacing; shortened the explanatory annotation without hiding its assumptions.
3. Fresh v2 review plus an independent reader: no obvious remaining contact-sheet clipping; full-resolution slide 12 was clear. The independent reader found that 237 learners was mixed-tier break-even, not Core-only. v3 explicitly labelled the 80% Core / 20% Premium mix. Core-only break-even would be 296.
4. Final v4: text contrast for colored annotations was strengthened and all slides rebuilt. The final contact sheet and full business slide were opened; the layout remained stable.

The requirement to list and fix ten visual flaws in every pass is NOT met literally: later passes had fewer genuine defects. No fake flaws or passing evidence were invented. Squint/grayscale/200% projection tests were not separately rendered.

## Acceptance checklist — draft versus final

| Requirement | Draft | Final hold |
|---|---|---|
| Cover + 10 topics + at most 3 backups | PASS | Founder review of actual submission limits |
| Real discovery with sample details | Visible placeholders only | NOT PROVIDED; cannot claim validated problem–solution fit |
| Bottom-up market and sharp ICP | PARTIAL: proposed adult GEU skill cohort | Relevant official count, branches/years/skill not confirmed |
| Unit economics, break-even, runway | Formula-based estimates; separate 20% subscription and 15% session rules | Actual costs, tax basis, quote and cash confirmation required |
| 90-day milestones and itemized funding ladder | PASS as proposals/targets | Owners and commitments remain missing |
| Built versus next and weaknesses | PASS with source-only/historical prototype labels | Current live demo NOT RUN |
| Premium light design, readable type, PDF/PPTX | Usable browser draft; contrast checks passed | PowerPoint/LibreOffice rendering not tested |
| Notes, Q&A, contact sheet, QA, model | PASS existence | Final G2 approval not received |
| No secrets/respondent contacts/app edits | PASS scoped preservation and selected captures | Not an exhaustive historical repository privacy audit |

## Unverified or incomplete work

- No primary survey/interview dataset, real waitlist, revenue, pilot or mentor commitment has been supplied.
- No current live demonstration, fresh product-screen capture, AI accuracy assessment or paid settlement test was run.
- No official beachhead population or real INR equipment/legal/hosting quotes were obtained. Existing evidence pack reused; Razorpay and Cloudflare public pricing are secondary baselines, not merchant quotes. FX, usage, AI/support and fixed costs are explicitly estimated.
- PowerPoint rendering and Office workbook recalculation are NOT RUN. PDF is an exact image-backed copy of browser renders, not searchable/editable text or proof of PPTX pixel parity.
- The SN portable-font/player build failed on its canonical render-evidence requirement. Its renderer imports Unix `fcntl`; a Windows adaptation was not completed. A separate raster preview is labelled as such, not a fabricated stock-build pass.
- The copied exporter has two dependency advisories after a safe audit-fix attempt: image-size high and ECharts moderate. Only trusted local PNG/HTML inputs were used. No force or major upgrade was performed.
- Screenshot candidates were catalogued, but only two product crops were visually selected. Test-data statistics are not traction. No team photos were invented.
- Some required customer-path screenshots remain visibly missing. No fake UI was created.
- Funding runway is not a proven number: restricted pilot allocations must not be counted again as unrestricted cash. The workbook separates scenario cash runway from designated pilot spending.
- Submission cutoff/format/size and mandatory coaching attendance are still unconfirmed. Working fallback is 11:30 PM IST on 14 November; no submission was performed.

## State and gates

G1 awaits the founder's typed APPROVE or REVISE. G2 and G-END have not occurred. The main Identity Worlds project and the separate proxy toolkit remain parked. No application code, source prices, main gate, commit, stash, Git exclusion or external publication was changed by this deck sprint.
