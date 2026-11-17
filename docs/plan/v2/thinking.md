# Phase D - mechanism thinking and synthetic simulations

Date: 2026-11-07. Task: FP2-D. GATE: WAITING_FOR_APPROVAL (CP-D). Status: received reasoning/model round complete; verification limits retained.
Audience: the founder and engineers evaluating Feature Pack 2 before master-plan drafting.
[Skill: brainstorming] [Skill: writing-plans] [Skill: sn-da-excel-workflow]

## Scope and method

Typed CP-C2 approval opens D only. All parameters, names, money/safety policy and release membership below are proposals. No application edits/imports/tests/builds, packages, migrations, servers/watchers, paid services or commits. Phase E implementation/master-plan tasks remain gated. The original detailed phase tail is unavailable after C topic 12; this round uses the received F1-F9 requirements without inventing unseen D instructions.

Methods: identify the user job and authority boundary; compare viable alternatives; specify a falsifiable proposed formula/state invariant; simulate synthetic boundary inputs; inspect counterexamples and costs; keep uncertainty/approval questions explicit. Numerical simulation is not real-user evidence, runtime acceptance, benchmark, legal review or a revenue forecast.

The historical [thinking document](../thinking.md) is preserved but not authoritative. Its unsupported competitor shares, monetary forecasts, installed-stack absence, identity-collapse recommendation and tax assertions are not adopted. [Current audit](01-existing-system-audit.md), [research register](research-source-register.md), [research gaps](research-log.md) and [C2 proposal portfolio](feature-lab.md) are the basis. Confirm audit A/U hypotheses before repairs; no repairs are performed here.

## Invariants before differentiation

1. Authentication, role identity, resource ownership, entitlement, grading/reward authority, room/document membership and media signing are server-authoritative, separate checks. A decorative identity transition never grants authority.
2. Request interest, qualified opportunity, exclusive claim, publication permission and monetary commitment are different states. Do not turn an interest count into promised sales or an alert into ownership.
3. Review facts, learning outcomes, reputation confidence and league activity have different scopes. Popularity or currency cannot buy credibility, learning scores or allocation.
4. One authoritative currency/asset ledger per distinct asset; every mutation balances, deduplicates both operation ID and semantic source, and has recoverable commit/outbox boundaries. Payment receipt is not business completion or bank transfer.
5. Recording local durability, uploaded bytes, validated processed assets and publishable course media are separate acknowledgments. No false recovery or offline availability promise.
6. Shared Board operations/notes/quiz anchors require the same canonical resource-version and consent/access contracts across studio, mentor calls and Peer calls. No parallel bypass through generic socket room joins.
7. Minors are not publicly ranked by default; adult pilots do not validate child access. Recording requires explicit mutual consent, purpose and revocation/retention handling. Legal current applicability remains unresolved.
8. Every meaningful motion has a nonanimated, sound-off, keyboard-accessible equivalent; a ceremony cannot block cancellation, payments, consent or learning progress.
9. Optional mentor-priced sessions retain 15% platform share; subscriptions separately retain 20%, other 80% for enrolled-course mentors under allocation to approve. Cost assumptions and pending taxes never silently change these constraints.
10. Extras strengthen the same flywheel rather than adding competing wallets, ratings, editors, networks or obligatory engagement loops. Founder approval is still needed for which options enter the final plan.

## Current D coverage contract

| Area | Reasoning deliverable | Numerical/scenario check | Remaining E or external work |
|---|---|---|---|
| F1 Signal Flare | Proposed score, qualification/exposure, claim/outline/reassignment lifecycle, honest demand/earning scope | Three mentor examples; populations 3/15/80; concurrency/retry/timeout counterexamples; at least 15 edge cases | Final notification/threshold/fairness policy, full API/schema/copy master-plan detail and real pilot |
| F2 Ratings | Star-aware uncertainty/recency, eligibility/edit/moderation/appeal/rater-fraud boundaries | At least five histograms including one 5 versus 300 averaging 4.7; prior/age/risk sensitivity; at least 12 edges | Calibration, final policies, learning-outcome validation and UX fatigue tests |
| F3 Mentor Playground | Proposed capped quality-linked points/decay/tiers, fair claim separation, mission/badge integrity rules | Award caps, decay/pause, distinct-role cases; at least 12 edges | Thirty-mission/forty-badge full catalogs, three visible naming/art directions and founder choice in E |
| F4 Student Playground | Chance/difficulty/retake normalization, course/family caps, private/cohort progression | Guessing/easy grinding/retake/late-cycle cases; at least 12 edges | Thirty full missions, task calibration, cohort/safety choices and accessibility/device validation |
| F5 Currencies | Separate optional virtual assets, faucets/sinks/caps, atomic/reversal/idempotency model | Twelve months for three archetypes per identity, sensitivities and conservation; at least 12 edges | Final economic names/rates/sinks, actual ledger integration/migration and abuse pilot |
| F6 Studio | Capability/recovery/time-map/editor/Board/build-integrate trade-offs and grounded draft gates | Buffer/time-map/clock/processing cost assumptions; at least 20 edges | Full support matrix/vendor terms, state/copy/asset/pipeline master-plan, device tests and chosen integration |
| F7 Sessions | Booking/payment/payout/consent safety states, reliable media comparison and legal blockers | Three synthetic rate points, refund/release/chargeback conservation; at least 20 financial edges | Qualified India legal/accounting/provider confirmation, final cost/risk policy, operational safeguarding |
| F8 Motion | Meaning/trigger/cancel/accessibility/budget rules and cross-system coherence | Durations/frame budgets and interruption/degradation checks | Full moment inventory/easing/assets/sound master-plan and measured real-device acceptance |
| F9 Extras | Challenge portfolio/wow/waves, dependencies, labor/evidence/ethics failure tests | Existing 22-scenario score model plus capacity/reuse/uncertainty tests | Final membership/name/lore/cadence decisions, broader evidence and pilots |

## Actual D artifacts and results

- [F1/F2 reasoning](thinking-signal-ratings.md): exact provisional score/eligibility/recency/claim lifecycle, three mentor examples, seven rating histograms/28 sensitivity cases and 18/15 analytical edges.
- [F3/F4 reasoning](thinking-playgrounds.md): corrected 400 global mentor cap under 460 category total, decay/tiers, chance/difficulty/best-delta scoring, private/cohort/protection rules and 14/16 analytical edges; full mission/badge catalogs explicitly remain E work.
- [F5/F7 reasoning](thinking-economy-sessions.md): three separate virtual economies, atomic/semantic ledger boundaries, 108 baseline/432 sensitivity wallet months, three synthetic rate-point economics, subscription separation and 16/25 analytical edges.
- [F6/F8 reasoning](thinking-studio-motion.md): capability/degradation/recovery/time-map/Board/editor/grounding/motion trade-offs, source-70-to-output-50 mapping, raw-buffer arithmetic/published-meter subtotal and 26 analytical studio cases.
- [F9 trade-offs](thinking-feature-tradeoffs.md): every proposed 25/wow option challenged, three capacity scenarios and coherent scope alternatives without silently changing membership/names.
- [Trusted model recipe](thinking-model-recipe.md), [editable workbook](models/thinking-simulations.xlsx) and [recorded CSV](models/thinking-simulation-results.csv): nineteen sheets/240 result rows/3,817 live formulas; 601 recorded abstract/numeric assertions, including repeated wallet cap steps, not 601 independent product/security tests.

The first model run found an arithmetic error: original mentor category caps total 460, not 560, making 500 global nonbinding. Corrected to a proposed binding 400 global cap without increasing category rewards; preserved failure E55. The corrected run passed, and bounded independent rational/decimal checks matched 3,839 numeric caches: rating/allocation/mentor 275; student/wallet 3,486; money/media/clock 78. Full Office-engine recalculation/rendering and spreadsheet negative/type input validation are not certified; invalid inputs must be reviewed/rejected. Recipient flags/abstract Checks are run snapshots, not live app behavior or automatically recomputed scope.

Executed synthetic results: single-perfect lower proxy 3.761973 versus established 300/raw-4.7 proxy 4.610277; primary/fallback populations 3/15/80 -> 1/2, 1/5, 3/5. Student unchanged retake zero credit, improving 15-to-18 gives three. Session examples INR 500/1,500/3,000 give illustrative pre-unknown-cost platform contributions 22/152/347 with fixed 15% share; subscription 20% remains separate. Media 5.6/4.6/4.2 published-unit allocated subtotals per new hour are not all-in currency quotes. Virtual baseline and +20% earn/-20% sink cases remain capped/nonnegative under all 540 month steps; not inflation forecasts.

### Decision ledger for CP-D (all pending)

| Decision | Proposed direction | Counterexample/approval boundary |
|---|---|---|
| Allocation | Small qualified waves, exclusive claim, bounded exploration | Timers/thresholds/expertise/fairness/delivery rules not calibrated/approved |
| Ratings | Star-histogram shrinkage with labeled approximate uncertainty and actual counts/outcomes | Prior/recency/risk/eligibility/moderation need validation; normal proxy not exact confidence |
| Mentor progression | 400 overall / 460 category maximum, rolling four-week decay, no fee/rating/claim purchase | Category evidence/workload, pause/visibility/perks/tier names need approval |
| Student progression | Chance/difficulty versioning, best-delta retakes, capped breadth, private/cohort choice | Task calibration/cheating/child comparison/promotions not proven |
| Virtual currencies | Three nonconvertible source-authoritative optional assets, integer balanced ledger | Actual names/rates/sinks/appeals/migration and child-money boundaries pending |
| Money | Fixed separate 15% sessions and 20% subscriptions; recoverable obligations, no queue-as-paid | Tax/current applicability/base/fees/refund/dispute/reserve/KYC/invoice policy unknown |
| Studio/motion | Reuse behind canonical source/grants/clock; honest acknowledgment, static/reduced-motion completion | Full browser/license/device/cost/AI/editor/recording/retention choices pending |
| Extras | Validate small vertical slices/capacity; retain C2 options pending founder scope choice | Fragile/borderline overlap, social privacy and operator labor can outweigh novelty |

All named artifacts above exist/are registered; they are D reasoning/model outputs, not Phase E implementation tasks. Remaining known E deliverables include full API/schema/Mermaid/UI/motion inventories, thirty missions per playground, forty mentor badges, three branding/art directions and engineer-ready build sequencing. Legal/safety/provider/current-tax evidence and actual engine/runtime/device/pilot tests remain external blockers, not fabricated accomplishments. Detailed original D/E/F tail is still unavailable; obtain it before applying unseen instructions. Next is CP-D packaging and a hard stop for typed approval before E.

## Pre-mortem hypotheses and falsification

- Twelve months after a hypothetical launch, mentor supply fails because demand signals promised revenue, duplicate claims consumed labor and no repaired payment authority existed. Falsify by truthful interest/claim states, narrow pilot production, reconciliation and mentor comprehension—not catalog count.
- Learners leave because an impressive world hides broken course access, lost recordings or unclear progress. Falsify through functional recovery/entitlement/anchor tests before visual polish; real-device performance remains unknown.
- Ratings/leagues/currency amplify gaming because client events become money/reputation authority. Falsify with semantic deduplication, bounded source grants, confidence-aware ratings and distinct private practice versus public evidence.
- Adult cooperation expands into unsupported minors/live moderation and re-identification. Falsify by purpose/access/suppression and staffing gates; never infer clearance from an educational label or a proposed PASS score.
- The small team maintains many overlapping extras and lore cycles but cannot repair core learning. Falsify by vertical-slice reuse, one active repair, finite review capacity and honest scope cuts; modeled scores do not measure operating effort.

No likelihood percentages are invented for these hypotheses. The eventual synthesis must distinguish executed model assertions, analytically reviewed scenarios, unexecuted integration checks and launch blockers.
