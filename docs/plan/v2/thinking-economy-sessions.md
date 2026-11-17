# D thinking - separate virtual economies and reliable session money

Date: 2026-11-07. Task: FP2-D. Status: PROPOSED economics/policies; no money flow or safety policy finalized.
Audience: founder, engineers and qualified finance/safety reviewers before master-plan drafting.
[Skill: brainstorming] [Skill: writing-plans] [Skill: sn-da-excel-workflow]

Basis: [existing ledger/payment audit](01-existing-system-audit.md), [ledger evidence](research-marketplace-economy.md), [India legal/safety unknowns](research-india-safety.md), [call costs/terms](research-notes-calls.md). The current MoneyLedger sequential row loop, webhook receipt-before-business update and completed/released-before-payout intent are not atomic recovery guarantees. A queued payout is not bank transfer. No live checkout, refund, payout, database or provider operation ran here.

## F5: economy choices and recommendation

A common convertible wallet blurs identities and creates cash/fairness/abuse obligations. Unlimited completion rewards accurately recorded in a ledger can still inflate supply. Expiring rewards, streak purchases or purchasable rank/learning advantages create pressure. Recommend three nonconvertible virtual asset IDs, source-authoritative bounded issuance, optional cosmetic/organization sinks and no real-money wall crossing by default. Visible currency names/art and actual faucet/sink rates require founder approval; the model uses identity labels only.

**No purchases of unfair learning, rank, review, grading or allocation advantage.** Essential accessibility, corrections/support, basic export/rights, consent, prerequisite explanations and a functioning course remain product obligations, not token sinks. No loot boxes, randomized cash rewards, gambling, paid streak repair, emotional dependence or minor payment pressure. Cash/session discounts, donations, pledges, bounty cash-out and interidentity conversion remain separate blocked proposals, not silently included.

### Exact synthetic wallet model

All amounts are integer virtual units. For an identity/archetype/month, with opening O, requested weekly rate R, weekly cap C, active weeks W, balance cap B, faucet multiplier f and optional monthly sink request S with multiplier s:

`requested = min(C, floor(R*f))*W`; `issued = max(0,min(B-O,requested))`; `spent = max(0,min(O+issued,floor(S*s)))`; `close = O+issued-spent`; `unissuedAtCap=requested-issued`.

Initial balances zero; W=4 each of twelve months is a deliberately simple 48-active-week assumption, not a calendar or engagement forecast. No negative balances or expiration; remaining capacity is visible when an optional award cannot issue. The earning/sink scenario inputs are not catalog prices or measured behavior. Actual grants must derive from approved source events and semantic caps, not a client-supplied R.

| Identity | Weekly cap / balance cap | Casual requested weekly / monthly sink | Steady | Intensive |
|---|---|---|---|---|
| Student | 100 / 2,000 | 40 / 80 | 80 / 250 | 120 / 380 (weekly request clipped) |
| Mentor | 150 / 3,000 | 25 / 40 | 75 / 160 | 180 / 550 (clipped) |
| Peer | 75 / 1,500 | 15 / 40 | 45 / 160 | 90 / 260 (clipped) |

The executed [workbook](models/thinking-simulations.xlsx) has 108 baseline months and 432 sensitivity months (nine identity/archetypes, twelve months, four scenarios). Baseline year-end balances: Student 960/840/240; Mentor 720/1,680/600; Peer 240/240/480. Combined +20% requested earning and -20% optional spending yields Student 1,536/1,800/1,152; Mentor 1,056/2,784/1,920; Peer 480/1,056/1,104. These are synthetic balances, not inflation forecasts or user budgets. Intensives at weekly caps cannot earn more merely from a +20% rate; sink demand still changes accumulation.

Sensitivity reveals that less optional spending can cause accumulation even when issuance is capped; never solve this by compelled spending or expiry. Monitor issuance, distinct active earners, sink uptake, outstanding liabilities/units, distribution, capped-award frequency and abuse reversals separately. No target inflation or monetary value is established by the nine archetypes. Evaluate more pessimistic low-sink/low-activity scenarios and optional sink utility before final economy choice.

### Ledger invariant and recovery proposal

For every transaction and asset, posted debits equal posted credits; asset precision never changes in place. Accounts distinguish issuance/treasury, user available, pending reservations, optional sinks and reversals. Minting records a matching system issuance leg, not unexplained balance creation. No same-account transfer or noninteger/nonpositive amount. Cross-asset transfer requires a separately approved conversion policy; none exists by default.

Server mutation checks actor/identity/source authorization and per-source/category/weekly/balance caps before an atomic commit. Both durable operation ID and semantic `(asset, sourceEvent, benefitType, owner)` uniqueness are required; a new operation ID cannot award the same source again. A transaction-level atomic boundary commits both legs, source consumption, balance projection and outbox or rolls all back. Projection rebuild/reconciliation must recover from immutable posted history, not overwrite whole identity snapshots.

Pending transfer resolves exactly once to posted/voided/expired. Reversal is an additive linked transaction, not deletion/edit of history. If a reward has already been spent, do not create a silent negative child/user balance or invent automatic debt collection: hold the correction for an approved recovery/appeal process, cap/freeze future issuance only under finalized policy, and retain minimal accountable evidence. Model abstract tests demonstrate unspent reversal and reject spent-balance reversal; they do not prove the current database can do this atomically.

### F5 edge cases - analytical expectations

| Case | Expected invariant |
|---|---|
| 1 Client arbitrary amount/source | Reject; derive authorized grant server-side |
| 2 Same source, different request IDs | Semantic dedup, one grant only |
| 3 Failure after one leg | Atomic/recoverable transaction, no half-post or unbacked projection |
| 4 Concurrent gift/shop/full snapshot | Source/available balance checks and atomic commit; no stale overwrite |
| 5 Insufficient available balance | Reject/pending explicitly, never negative available balance |
| 6 Asset/identity switch | Separate ledgers/cache/source keys; no conversion by UI state |
| 7 Award cap reached | Visible unissued amount/remaining capacity, no token debt or false success |
| 8 Optional sink never used | Model accumulation honestly; no expiry/FOMO/compelled spending |
| 9 Refund/reversal of unspent award | Linked balanced correction exactly once |
| 10 Reversal after spend | Approved pending recovery/appeal, no silent clawback/negative minor balance |
| 11 Pending transfer timeout versus post | One mutually exclusive resolution, idempotent recovery |
| 12 Fraud/brigading/duplicate helpers | Evidence review and source independence, not volume/rank paid status |
| 13 Price/precision migration | New approved asset/version and reconciliation, not float scale rewrite |
| 14 Earned token cash-out/discount request | Block by default; explicit new-money/legal decision needed |
| 15 Minor/public gifting pressure | Age/purpose/safeguarding review before inclusion, no bought learning advantage |
| 16 Worker crash/replay/rebuild | Durable outbox and reconciliation, never recompute arbitrary awards from client events |

## F7: booking/payment/consent states before media choice

P2P can be cheap under favorable connectivity but still needs TURN/reliability/support; managed media meters participant time, recording/composition/bandwidth/storage differently; self-host SFU moves operational cost rather than eliminating it. No India reliability winner or all-in vendor quote is established. Recommend a provider-neutral call-room/recording/Board contract and measured authorized adult pilots before choosing transport; no provider installation or call runs in D.

Scheduling proposal: mentor owns UTC availability windows, displayed in both participants' selected zones; fixed duration/buffers are explicit per booking, not guessed from offsets. Reserve a slot atomically before payment initiation with an expiry/intent ID; payment success after reservation expiry cannot silently double-book. Paid-session integration must consume correct room/session authority, not a default lobby component with the wrong route parameter.

### Proposed state/financial authorities

| Boundary | Required state/evidence | Do not claim |
|---|---|---|
| Availability -> held | Exclusive server slot hold, UTC start/duration, agreed rate/currency and expiry | Pending checkout reserves nothing indefinitely |
| Held -> payment_pending | Durable provider intent/source receipt, idempotency, terms version | Frontend success callback is payment capture |
| Payment_pending -> captured | Authenticated verified provider event, recoverable business handler | A webhook receipt alone completes the booking |
| Captured -> confirmed | Valid hold/session, consent/safety eligibility, invoice/tax requirements checked | Paid but expired hold is automatically usable |
| Confirmed -> in_session | Authorized participant/room lifetime, device check, shared tools | Generic socket join confers paid room access |
| In_session -> completion_review | Actual attendance/technical/consent evidence, accountable dispute window policy | A client call-ended event releases funds |
| Completion_review -> mentor_payable | Approved completion or resolution, balanced obligations/reserves | Saving completed/released before recoverable payout intent is safe |
| Mentor_payable -> payout_initiated | Durable approved provider instruction with idempotency/reconciliation | MoneyLedger intent equals bank payout |
| Payout_initiated -> paid | Confirmed provider/bank settlement evidence and amount reconciliation | Queue success is deposited cash |
| Cancel/refund/dispute/chargeback | Versioned exclusive resolution, fund position, recovery authority and case history | One refund status automatically coordinates every released/paid obligation |

Proposed reschedule/cancel/no-show/technical remedies must say who initiated, timing, evidence, refundable basis, fee treatment, availability release and appeal. No automatic financial penalty from one missing packet or unsupported timezone assumption. Record only with explicit mutual consent, separate purpose/visibility/retention and clear active indicator; withdrawal stops new recording and triggers policy-defined handling of earlier authorized content. Calls remain usable without recording. Minor/guardian/off-platform/contact/emergency/mandatory-reporting rules need competent review and founder approval; the research is not a complete tutoring safety policy.

### Three rate-point synthetic economics

Mentor sets rate; sessions are optional and learner-chosen. Scenarios INR 500/1,500/3,000 are illustrative, not recommended prices or minimum rate. Platform nominal share 15%, mentor gross obligation is the remaining 85%, rounded in integer paise with residual assigned so total conserves. Unknown taxes/withholding/invoice/legal bases are separate and not silently zero.

Assumed platform costs for this comparison only: gateway 2% of gross + INR 5; media/TURN allowance INR 8; support INR 20; risk allowance INR 10. These are arbitrary scenario inputs, not provider prices, tax rates or approved allocation. Under the illustrated platform-cost absorption, `contribution = .15*P - (.02*P+5) -8-20-10 = .13*P-43`, before unknown tax/other overhead. Absorption/reserve/risk policy is not finalized by this model.

| Synthetic mentor rate INR | Platform gross share | Mentor gross obligation, not paid | Illustrative platform contribution before unknown costs |
|---|---|---|---|
| 500 | 75 | 425 | 22 |
| 1,500 | 225 | 1,275 | 152 |
| 3,000 | 450 | 2,550 | 347 |

An additional 1.01-INR minor-unit boundary conserves 0.15 platform + 0.86 mentor but gives -42.87 illustrative platform contribution. It is a precision/stress test, not an allowable real checkout/minimum-price recommendation. Algebraic break-even is about INR 330.77 under these assumptions; real minimum rate/fees cannot be chosen without measured costs and legal/tax/provider terms. Support/risk allowances are not audited claim probabilities or automatic paid reserves.

### Subscription rule must not be mixed with sessions

Keep subscription platform share 20% and mentor pool 80% for enrolled courses' mentors. Recognized allocation base, partial months/refunds/seat changes and exact split method remain decisions. Compare equal enrolled-course allocation with equal unique-mentor allocation and outcome-aware weighting only if the user's enrolled-course constraint is retained; do not silently pay only engaged seats or adopt dormant settlement code as specification.

Synthetic recognized basis INR 1,000 yields platform 200 and pool 800; equal-course comparison for 2/5/10 enrolled seats yields 400/160/80 per course. A mentor owning multiple enrolled courses receives multiple course weights in that comparison; equal-mentor policy differs. Aggregate weights must sum to one, every beneficiary must be eligible under approved enrollment rules, residual paise allocated deterministically/retained visibly, and all shares/refunds reconcile. These amounts are not the current coded subscription prices or an approved split method.

### F7 financial edge cases - analytical expectations

| Case | Required outcome/invariant |
|---|---|
| 1 Simultaneous bookings same slot | One exclusive hold; loser cannot capture a second valid booking |
| 2 Hold expires while capture arrives | Recover payment to explicit resolution/refund/rebooking, no silent slot conflict |
| 3 Provider retry/duplicate webhook | Same receipt plus recoverable business processing, no duplicate capture/release |
| 4 Webhook receipt saved, business handler crashes | Retry recovers handler rather than permanently suppressing work |
| 5 Capture without confirmation | Visible paid-pending-resolution state and accountable recovery |
| 6 Client success/call-ended spoof | Cannot capture, complete or release money by client assertion |
| 7 Cancel before/after capture | State-specific full/partial resolution, no fee/refund rule invented |
| 8 Mentor no-show | Evidence and approved remedy/appeal, no automatic payout |
| 9 Learner no-show | Agreed versioned policy/evidence, no unapproved penalty |
| 10 Reschedule/rate change | New agreed terms/hold, not silent extra charge or old slot retained |
| 11 DST/zone/buffer overlap | UTC reservation/duration authoritative; both parties see agreed time |
| 12 Technical failure/TURN outage | Technical evidence and approved remedy, not attendance assumed from one connection |
| 13 Completion saved, payout queue fails | Recoverable obligation/outbox, no stranded invisible mentor payable |
| 14 Payout retry/unknown result | Reconcile provider instruction before retry, no duplicate bank transfer |
| 15 Refund before release | Balanced linked reversal once, refund progress distinct from settled confirmation |
| 16 Refund after payable/paid | Approved fund-position/recovery policy, no unfunded negative ledger shortcut |
| 17 Chargeback after payout | Reserve/recovery/dispute scope, no invented automatic mentor debit |
| 18 Partial refund/provider fee irrecoverable | Approved fee/basis allocation and reconciliation, not 15% blindly applied to unrelated base |
| 19 Taxes/withholding/KYC/invoice unknown | Block final money design/launch; never copy familiar unverified rates/sections |
| 20 Integer paise/residual | Shares sum to actual recognized basis, deterministic approved rounding |
| 21 Session/subscription mixed row | Separate moneyFlowType/ledger rules; 15% never used for subscription pool |
| 22 Consent withdrawn/recording absent | Call/remedy based on authorized nonrecording evidence; no forced recording for payout |
| 23 Minor/guardian eligibility unresolved | No assumption of legal/safeguarding readiness from adult pilot or education label |
| 24 Live payment mock fallback | Production cannot silently accept mock authority; require explicit safe mode/guard |
| 25 Staff dispute/role loss/account switch | Narrow case/field access, revocation and audit; no private billing leakage |

## What the executed model proves and does not prove

Model asserts synthetic two-leg conservation, operation/source dedup, failure-before-commit, insufficient/cross-asset spend rejection, additive unspent reversal, integer-share/refund arithmetic and 540 wallet cap/nonnegative scenario steps. These are abstract/numeric checks, not current Mongo transactions, provider behavior, underwriting, tax compliance or actual inflation outcomes. Workbook live formulas/inputs still need an actual spreadsheet-engine run; full legal/accounting/safety/vendor evidence and staffing remain launch blockers.
