# D thinking - Signal Flare allocation and credible ratings

Date: 2026-11-07. Task: FP2-D. Status: PROPOSED mechanisms and synthetic assumptions; no policy finalized.
Audience: founder and engineers evaluating F1/F2 before master-plan drafting.
[Skill: brainstorming] [Skill: writing-plans]

Sources: [current audit](01-existing-system-audit.md), [ranking/accounting/notification evidence](research-marketplace-economy.md), [learning evidence](research-learning-evidence.md). Binary Wilson is not a five-star-mean formula; vendor engagement results do not prove learning, optimal notification frequency or allocation fairness. Existing request and flare lifecycles are separate and inconsistent; this proposal is not a migration or repair authorization.

## F1 alternatives and recommendation

A global broadcast produces avoidable duplicate effort and notification load. Pure highest-score sequential allocation can starve qualified newcomers and punish time zones. Random invitations ignore competence and make outcomes hard to explain. Recommend qualified, exposure-aware small waves with exclusive atomic claims, explicit timeout/fallback and protected exploration under a competence floor. Parameters below are modeling proposals, not approved safety/scope/money policy or optimized constants.

### Separate facts and authorities

- Request records preserve member text; proposed clustering suggests merges using outcome, prerequisite level, language and scope. Never strip original content or force a semantic merge. Human/requester review preserves origin IDs and permits split/appeal.
- Interest is one server-eligible member signal per request cluster, not paid demand, enrollment or pledge. Eligibility checks account abuse constraints, duplicate source and ownership; it is not invented government verification.
- Synthetic threshold proposal: 50 distinct eligible current interests within 45 days, then qualification/abuse review. Threshold crossing emits a recoverable opportunity event; it does not claim a mentor is notified until delivery succeeds.
- Qualified mentor proposal: relevant expertise checklist >=0.60, valid account/role, no unresolved disqualifying safety sanction, opt-in availability and fewer than one active production claim. Expertise review and sanction/appeal rules need approval; league level or purchased cosmetics cannot bypass this floor.
- Ranking, notification eligibility, claim authority and course publication are different decisions. An invitation never gives ownership. One mentor can acknowledge an offer but only one committed claim exists per request/version.

### Exact provisional scoring

All components lie in [0,1]. `S = 100*(0.35 Q + 0.30 E + 0.15 R + 0.10 P + 0.05 T + 0.05 F)`.

| Component | Definition / data boundary | Missing-data behavior |
|---|---|---|
| Q teaching-quality evidence | `(starLowerProxy-1)/4`, clipped; F2 eligible versioned evidence only; outcomes displayed separately | No eligible ratings: 0.50 synthetic neutral, labeled unknown, not a displayed public rating |
| E expertise fit | Reviewed relevant prerequisite/outcome checklist, fixed before offer | Unknown/unreviewed fit fails qualification rather than being inferred from popularity |
| R fulfillment reliability | `(onTimeMilestones+2)/(dueMilestones+3)`; only accountable accepted commitments, excused technical/policy delays separate | No due milestones: 2/3 prior, unknown label; not an earned reliability claim |
| P responsiveness | `(acknowledgedInWindow+2)/(eligibleDeliveredOffers+4)`; notification delivery and availability checked first | No offers: 1/2 prior; failed delivery/quiet hours not a nonresponse |
| T recency | `max(0.20, 2^(-daysSinceConfirmedAvailability/30))` | Unconfirmed availability means do not invite; no location/online surveillance required |
| F exposure fairness | `1/(1+eligibleOffersInLast7Days)` | New qualified mentor gets 1; prior offers cannot be erased by account switching |

Synthetic component examples, to be reproduced by the model: Established `(Q,E,R,P,T,F)=(.91,.90,.90,.80,.90,.20)` -> 85.85; Specialist `(.85,1,.75,.90,.70,.50)` -> 86.00; New qualified `(.50,.90,2/3,.50,1,1)` -> 69.50. These are invented scenario inputs explicitly labeled synthetic, not real mentors or measured weights. Newcomer opportunity comes from exploration, not pretending one review proves quality.

### Waves and timers

For N currently qualified available mentors: `primary=min(N, max(1, ceil(N/30)), 3)`; first fallback `min(5, N-primary)`; subsequent fallback batches <=5 until exhausted or opportunity expires. Each offered actor receives at most one offer for the request/version. Synthetic 3/15/80 cases therefore begin with primary 1/1/3 and fallback 2/5/5, not all-at-once messages.

Proposed protected exploration: with primary size >=2, reserve at most one slot for a qualified newcomer (fewer than three delivered offers) within 20 score points of best; choose greatest exposure debt then stable ID. With primary size one, permit that exploration only on every fourth opportunity in a subject sequence. No low-fit mentor is promoted by this rule. Sequence/debt/window are server facts and auditable; distribution and competence thresholds require pilot/approval. Ranking ties: S, then E, then oldest eligible-offer timestamp, then stable mentor ID; no currency or paid ranking.

Proposed primary acknowledgment window 20 minutes, fallback window 20 minutes, with all deadlines UTC/server-authoritative. Quiet-hours delivery defers eligibility rather than consuming a mentor's window invisibly. Offer states distinguish queued/delivered/acknowledged/declined/expired/canceled. A maximum opportunity age of 72 hours limits repeated waves; after that show no claimant rather than fabricate progress. These durations are assumptions, not optimal or scientifically safe settings.

On a valid accept, atomically compare request/version state, offer/grant expiry, claimant availability and claim capacity; create exactly one claim and outbox receipt. Concurrent losers receive an explicit already-claimed outcome; canceled/expired offers cannot later win. Retries use operation and semantic `(requestVersion, mentor, action)` keys. State persists before notification cancellation, with recoverable workers. No application/database operation is run here.

### Full proposed lifecycle

| State / transition | Authority and condition | Student/mentor truthful feedback | Recovery boundary |
|---|---|---|---|
| requested -> gathering | Valid request, human scope/merge review | Interest count, scope and sources; no earnings promise | Preserve original content/version and deduplicate votes |
| gathering -> threshold_met | 50 current eligible distinct signals, proposed abuse gate | Threshold met; allocation not yet delivered | Atomic threshold/outbox; reverse eligibility without deleting votes |
| threshold_met -> flare_open | Qualified available supply and approved scope | Seeking a qualified mentor, recipient count private | N=0 stays pending supply, not fake notification |
| flare_open -> offered | Small wave persisted and actually delivered | Offer deadline/source/estimated scope; earning estimate labeled assumption | Delivery retries do not multiply offers or consume failed-delivery windows |
| offered -> claimed | Exclusive atomic accept and valid capacity | Named claimant, next milestone/deadline | One winning claim/version; cancel other offers recoverably |
| claimed -> outline_submitted | Proposed outline due 72 hours after claim; mentor approves scope | Outline pending review, not production complete | Version/ownership check, explicit request for deadline adjustment |
| outline_submitted -> outline_approved | Authorized reviewer/requester process, rights/scope check | Reviewed outline, promised milestones not course | Review timeout/escalation policy still to approve |
| outline_approved -> production | Milestone plan accepted, one active production claim | Actual milestone evidence and dates, not fake percentage | Proposed progress heartbeat every seven days; absence triggers review, not automatic accusation |
| production -> review | Complete candidate course/rights/captions/checkpoints | Content under review; entitlement not yet granted | Failed processing/QA stays review/repair |
| review -> published | Canonical publication authority, ownership and quality checks | Available course, verified actual access | Outbox/index/media permissions coordinated |
| flare_open -> expired | Supply/waves exhausted or 72-hour opportunity age | No claimant; optional re-open/re-scope | No automatic spending or revenue guarantee |
| claimed/production -> abandonment_review | Voluntary withdrawal, missed accountable milestone, safety/technical review | Paused/reviewing next owner, no public blame | Preserve approved artifacts and contribution rights |
| abandonment_review -> reassignment | Authorized decision, prior claim revoked, new version/ownership grant | New claimant and revised schedule; original evidence retained | Old mentor cannot publish under revoked grant; no double-active claims |

Detailed schema/API/events/Mermaid/UI copy belong to the later master-plan refinement. D establishes transition/authority choices and counterexamples, not implementation task files. Pledges, guarantees and paid co-creation remain REVIEW: funding/refunds/rights/fairness and legal obligations are unresolved. Honest earning preview can show a range under explicit assumed enrollment/rate/cost inputs, but cannot label interest as guaranteed sales or alter fixed session/subscription shares.

### F1 adversarial cases - analytically reviewed, not runtime tests

| Case | Expected invariant / outcome |
|---|---|
| 1 N=0 qualified | Pending supply, no offer/claim or fictional notified count |
| 2 N=3 | One primary, at most two fallback, distinct recipients |
| 3 N=15 | One primary, bounded fallback batches, exposure rotation auditable |
| 4 N=80 | Three primary including eligible exploration when available; first fallback at most five |
| 5 Two simultaneous accepts | Exactly one committed claim, explicit loser outcome |
| 6 Retry after network loss | Same committed claim/receipt, never a second grant |
| 7 Late accept after expiry | Rejected using server deadline, not client clock |
| 8 Primary never actually delivered | No responsiveness penalty or invisible deadline; delivery failure visible |
| 9 Member brigading/Sybil interest | Flag/review and distinct-source checks; uncertain evidence cannot fund production automatically |
| 10 Similar language/level requests | Suggest, not force merge; preserve origin/split/appeal |
| 11 Mentor hoards claims | Global active-claim capacity checked atomically across requests |
| 12 Established mentor absent/quiet hours | Exclude/defer invitation, not punish unknown responsiveness |
| 13 New qualified versus incumbent | Explicit bounded exploration, no bought or low-fit priority |
| 14 Scope expands after acceptance | Version/new agreement required, not silent free work |
| 15 Abandonment/reassignment then old publish | Old ownership grant invalid; preserved work/rights handled by approved process |
| 16 Refund/pledge request without funding rules | No invented payout or guarantee; money branch blocked |
| 17 Abuse/safety sanction appealed | Disqualification scope/policy human-reviewed; not inferred from low stars |
| 18 Worker crash after claim save | Durable outbox recovers cancellations/progress notification; no ownership ambiguity |

## F2 alternatives and recommendation

Raw averages fail the one-versus-300 requirement; binary Wilson incorrectly treats a star mean as a Bernoulli proportion. Recommend a star-histogram Dirichlet shrinkage and explicitly labeled approximate uncertainty proxy, alongside actual count/mean/distribution/recency/outcomes. An exact posterior-quantile method can be compared later; the normal proxy is not an exact 90% guarantee, especially with sparse or skewed evidence.

### Exact provisional star model

For stars k=1..5, prior vector `a0=(1,1,2,9,7)`, prior mass 20 and mean 4.00. A deliberately chosen prior is a design assumption, not observed platform quality. Each verified review contributes `w=2^(-ageDays/180)`; confirmed fraud contributes zero under an appealable decision, not arbitrary client/rater-rank weights. Fractional recency pseudocounts are generalized discounted evidence, not an ordinary independent-sample posterior proof.

`a_k=a0_k+sum(w_j for eligible reviews with star k)`; `A=sum(a_k)`; `mu=sum(k*a_k)/A`; `V=(sum(k*k*a_k)/A-mu*mu)/(A+1)`; `sigma=sqrt(max(0,V))`; `L=clip(mu-1.2815515655*sigma,1,5)`; allocation quality `Q=(L-1)/4`.

L is an approximate risk-adjusted sorting proxy. Display actual mean/count/histogram separately; no eligible reviews means UNRATED and no public rank from a prior alone. Do not silently reward a one-star safety complaint by aging it away: safety cases/appeals are separate from the aggregate rating. Sensitivity must vary prior mass/mean, risk multiplier and age, not report one tuned result as fact.

Synthetic scenario histograms: one perfect `[0,0,0,0,1]`; established `[1,2,7,66,224]` (300, raw mean exactly 4.7); five perfect `[0,0,0,0,5]`; mixed `[5,5,10,30,50]` (100); low stable `[50,25,15,5,5]` (100); established aged 360 days. Exact numerical outputs are to be generated/independently checked, not guessed here. The established fresh proxy must exceed the single-perfect proxy. Learning-outcome checks must compare similar rubric/version/task cohorts and uncertainty, never equate high ratings with mastery.

### Eligibility, timing, edits and friction proposal

One active course review per learner/course, with reviewed lesson/version and eligibility provenance. Proposed eligibility: authenticated real enrollment plus either two server-graded attempts or a defined learning checkpoint; watch duration alone is insufficient. Optional session review uses actual completed authorized session, not course eligibility. Self/coauthor/conflicted-party reviews excluded by explicit disclosed rules; refund does not automatically erase an otherwise valid learning experience.

Prompt once after an eligible meaningful checkpoint, never block access/exit/refund. Optional overall 1-5 stars plus one selected dimension (clarity, accuracy, usefulness) and optional text; do not require every dimension or long written critique. Permit a proposed 30-day edit window with version history, changed-review labeling and cooldown against repeated harassment. Session/course timing and final windows require founder/safety approval.

Mentor may reply once per review thread, with edits/history and neutral moderation; no access to private grade/error histories or reviewer contacts for retaliation. Hide abusive identifying text while retaining safe rating/history according to approved policy; appeals record scope/reason/outcome, not secret suppression. Quarantine suspected coordinated fraud pending review; count flags are not proof. Rater credibility must not become a purchasable status or penalize minors/new users by popularity. Serious correctness/rights/safety issues route to authorized case review outside the star score.

### F2 edge cases - analytical expectations

| Case | Expected invariant / outcome |
|---|---|
| 1 Single 5 versus 300 mean 4.7 | Star-aware shrinkage/uncertainty keeps established evidence stronger under modeled assumptions |
| 2 No reviews | UNRATED; prior alone never creates public ranking |
| 3 Five stars only, sparse | Distribution/count visible; uncertainty not hidden |
| 4 Old reviews | Recency lowers evidence weight; age window visible; safety case not erased |
| 5 Reviewer account switch/cache | Private eligibility/data scoped to current account; no cached review leakage |
| 6 Refund after valid learning | Eligibility evaluated from actual experience, no automatic favorable-review requirement |
| 7 Ineligible/free preview | Cannot submit verified review by client assertion; checkpoint rules explicit |
| 8 Self/coauthor/conflict | No credibility boost from own controlled identities |
| 9 Brigaded/collusive reviews | Human review/quarantine/appeal; correlation/uncertainty disclosed rather than fabricated proof |
| 10 Hidden or deleted review | Public query/rank obeys moderation visibility; minimal audit retention policy still required |
| 11 Review edit/race/retry | One active versioned review and idempotent receipt; stale edit conflict |
| 12 Mentor retaliation/contact request | Deny private history/contact access, report/appeal without rating pressure |
| 13 Graded accuracy dispute | Route independent versioned assessment review; no automatic star censorship |
| 14 Multiple course versions | Review's experienced version remains visible; new content cannot inherit implied approval blindly |
| 15 Sparse outcome cohorts | Suppress/unknown, no public learner profiling or causal improvement claim |

### Executed and independently checked synthetic examples

| Synthetic case | Count / age days | Posterior mean | Approximate lower proxy | Interpretation |
|---|---|---|---|---|
| Single perfect | 1 / 0 | 4.047619 | 3.761973 | Raw mean 5 is not strong teaching-quality evidence |
| Established 4.7 | 300 / 0 | 4.656250 | 4.610277 | Exact raw mean 4.7; stronger than one perfect review |
| Five perfect | 5 / 0 | 4.200000 | 3.943690 | Shrinkage/uncertainty still visible |
| Mixed | 100 / 0 | 4.125000 | 3.996878 | Histogram information retained, not converted to binary votes |
| Low stable | 100 / 0 | 2.250000 | 2.090647 | Prior cannot erase substantial poor evidence |
| Established aged | 300 / 360 | 4.552632 | 4.453121 | Discounted evidence/age changes confidence; safety cases separate |
| Unrated | 0 | 4.000000 prior only | UNRATED | No public prior-only rating/rank |

Seven cases and 28 prior/risk/age variants were generated and independently recomputed with rational/decimal arithmetic. Three mentor component examples reproduce 85.85/86.00/69.50, and qualified populations 3/15/80 have primary 1/1/3 and first fallback 2/5/5. Scenario recipient flags are recorded decisions, not automatically reranked when workbook score inputs change. Serialized abstract accept/retry/expiry tests prove only the toy invariant, not actual database concurrency, delivery success or cross-request capacity. [Workbook](models/thinking-simulations.xlsx), [recorded CSV](models/thinking-simulation-results.csv) and [recipe](thinking-model-recipe.md) preserve exact assumptions; Office recalculation remains unverified.

## Decisions to carry to CP-D

Thresholds, competence/exploration windows, recipient/time caps, reliability excuses, rating prior/risk/recency/eligibility/edit policy, moderation/appeals, earning-preview scope and learning-outcome validation all need explicit approval/calibration. No money/safety/branding/release decision is finalized by this mechanism analysis. Model results are synthetic and integration tests remain unexecuted.
