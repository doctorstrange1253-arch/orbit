# D thinking - Mentor and Student progression without reward authority leaks

Date: 2026-11-07. Task: FP2-D. Status: PROPOSED formulas/caps/decay/tiers; not approved visible leagues or safety policy.
Audience: founder and engineers evaluating F3/F4 before master-plan drafting.
[Skill: brainstorming] [Skill: writing-plans]

Basis: [current audit](01-existing-system-audit.md) identified client XP override, mismatched events, read-time rollover and nonrecoverable award chains. [Learning/behavior research](research-learning-evidence.md) and [marketplace evidence](research-marketplace-economy.md) do not validate game mechanics, mastery effects or final cohort policy. Do not transplant historical fee/currency/lore assumptions or reward raw engagement.

## Design alternatives and separation

Pure activity points reward easy grinding and spam. Pure outcome scores can discourage beginners, exclude unfamiliar subjects and overclaim causality. A recommended proposal combines capped verified contributions, explicit task/rubric versions, bounded improvement evidence and private opt-out; leagues remain optional contextual comparison, not proof of competence. Student/Mentor/Peer identity totals and wallets are distinct. Public learner errors, purchased ranks, rating rewards or compulsory attendance are prohibited variants.

Tier identifiers below are internal placeholders T0-T4, not visible league names, franchise themes or founder-approved art. Original Multiverse theming must explain real actions and use original geometry/marks; three full naming/art directions, thirty missions per relevant identity and forty bespoke mentor badges are later E catalog work, not invented as completed here.

## F3 Mentor point proposal

| Verified contribution | Points per independent event | Weekly category cap | Authority/abuse boundary |
|---|---|---|---|
| Reviewed useful lesson publication | 30 | 120 | Canonical publication + rights/QA; splitting one lesson does not create extra semantic events |
| Validated learning/repair outcome receipt | 40 | 160 | Authorized versioned rubric/outcome review; not stars, anecdotes or causal claims from before/after alone |
| Accountable on-time claim milestone | 20 | 80 | F1 accepted milestone/version, excused delays separate, never retroactive deadline changes |
| Reviewed helpful explanation resolution | 10 | 60 | One resolved source question, not message count or positive review request |
| Rights-reviewed reusable teaching pattern | 10 | 40 | Bounded authorized review, distinct contribution, no copied/stolen artifacts |

`weekPoints=min(400, sum(min(categoryCount*rate, categoryCap)))`. Category caps total 460. The initial draft mistakenly totaled them as 560 and proposed a nonbinding 500 overall cap; the synthetic run exposed that error. Recommend testing a 400 overall cap so independent categories remain bounded without rewarding maximum volume. This revision is a proposal, not finalized league policy. No points from client-provided overrides, purchases, follower count, attendance, course price, free enrollment or ratings. Outcome event authenticity and reviewer workload remain external validation/approval questions.

Proposed standing: `standing=(W0+0.70*W1+0.49*W2+0.343*W3)/2.533`, each Wj capped weekly points, missing/inactive weeks zero. Only rolling four-week standing decays; lifetime verified history/bespoke earned art is preserved unless an appealable fraud/rights decision revokes a specific award. This decay is a modeling preference, not behavioral science. Pause/opt-out removes competitive display and prompts but does not freeze an advantage in active ranking; rejoin shows current rolling standing. No shame/public absence label.

Proposed internal T0/T1/T2/T3/T4 cutoffs 0/100/200/300/400; exact >= comparison and rounding specified before awards. Public standing may be shown only under approved opt-in/access policy; quality/confidence context remains separate. F1 does not grant qualification from these tiers: expertise, reliable accepted commitments and teaching evidence decide; league activity is not a purchased opportunity multiplier.

Perks proposal: organizational workspace presets, optional original visual themes and nonexclusive helpful explanations of analytics. Essential accessibility, refunds/support, rights/export, truthful earnings and quality moderation remain free functional foundations. No fee reductions, paid allocation, improved ratings, cash conversion, priority minor access or reduced safety scrutiny. If a money perk is later considered, economics and explicit founder/legal approval are required; fixed session/subscription shares are not adjusted by tiers.

### Mission and badge discipline to carry into E

A mission specifies actor, real learning/teaching job, source event, eligibility, version, independent completion criteria, source-level/global caps, reversal and abuse rule. A badge specifies stable key, bespoke original SVG construction, criterion, evidence window, visibility, revocation/appeal, accessibility label and no paid advantage. Quantity alone cannot satisfy these templates.

Test archetypes: publish one reviewed explanation; repair a missing resource with an authorized alternative; preserve a justified before/after revision; contribute a counterexample with rights; finish an accepted milestone on time; improve a teaching draft after bounded review. These six archetypes are not claimed as the full thirty/forty catalog. Repeated uploads/replies, facile task duplication, coerced praise and rewards for attendance are rejected. Crews/subject rankings require membership, moderation, task-comparability and privacy gates; no instant broad social network is assumed.

### F3 edge cases - analytical expectations

| Case | Invariant / expected outcome |
|---|---|
| 1 Client supplies XP override | Ignore/reject client amount; derive reward from authorized canonical event |
| 2 Same event retries with new request IDs | Semantic source dedup prevents duplicate totals |
| 3 Ledger/event insertion fails after total update | Atomic/recoverable boundary, no unbacked standing; never copy current sequential behavior |
| 4 Split lessons/milestones | Reviewed semantic contribution identity prevents cap evasion |
| 5 Weekly rollover read before worker | One canonical adjudication/version boundary, no read-time source reset |
| 6 Global/category caps collide | Overall 400 clips total; category maxima total 460, not 560 |
| 7 Missed week/rest/opt-out | Rolling standing decays consistently; lifetime artifacts retained, no public shame |
| 8 Appeal/fraud correction | Specific reversal with history, not deleting member work wholesale |
| 9 Quality response versus spam messages | One reviewed resolution source event, not count-based chatting |
| 10 New mentor without ratings | Expertise/availability exploration independent of low league activity |
| 11 Crew/subject comparison | Authorized bounded cohort and comparable evidence; no private learner leakage |
| 12 Paid perk request | No fee/share/rank/claim advantage without separate explicit economics approval |
| 13 Delayed/technical milestone failure | Approved excuse classification, not instant irreversible penalty |
| 14 Role/account switch | Correct actor identity ledger/cache; no copying Mentor points to Student/Peer |

## F4 Student scoring proposal

### Attempt quality, not speed or completion volume

For a low-stakes calibrated task family with at least five independently scored items: `p=correctItems/itemCount`; `g=mean(chanceBaselinePerItem)` (e.g. 1/k for k equally plausible independent multiple-choice options; free-response baseline zero only if justified); `C=clip((p-g)/(1-g),0,1)`. If g>=1 or rubric/item validity is unknown, no normalized league claim. The clipped estimator has sampling bias and is not a statistical proof of mastery; item/task calibration and correlated guessing remain gaps.

Difficulty proposal `D=0.8/1.0/1.2` for reviewed easy/standard/hard task bands. Bands are fixed/versioned before participation; not inferred from time spent, mentor popularity, course price or learner's age. Proposed task value `V=min(24, roundHalfUp(20*D*C))`. No speed multiplier, time farming or random reward. For retakes, `credit=max(0,V-previousCreditedBestForFamily)`; total family credit never exceeds 24 for the same semantic family/version policy. A renamed/regenerated copy is not a new family. Legitimate rubric revisions require an explicit equivalence/regrade policy, never forced regrading.

Proposed weekly caps: verified family credits 200 overall, at most 80 from one course; verified meaningful unit completion 40 (not video autoplay alone); approved independent transfer tasks 60; chosen delayed review 40; total 300. Duplicate completion/retakes cannot reset family credit every week. Transfer/review events require independently authored/rubric-scored semantic tasks with policy-defined intervals; exact mission catalogs and calibration are E/external work. Easy-course grinding is bounded but breadth alone does not establish learning.

Synthetic checks to run: at-chance p=.25/g=.25 -> zero C; standard p=.80/g=.25 -> C=.733333 and V=15; hard same p/g -> V=18; previous best 15 then retake V18 -> only 3 incremental; unchanged repeat -> zero; perfect easy -> V16, standard20, hard24. These are illustrative inputs, not measured task difficulty or student scores.

### Cohorts/cycles/protection proposal

Use opt-in comparable cohorts by course/task band and chosen participation window, not public global minors' rankings. New entrants complete a proposed three distinct calibrated families before ranking; unqualified/unknown data appears unranked, not zero ability. Personal-best view is private by default and can be the entire experience.

Proposed weekly cycle: top 20% of qualified opt-in participants eligible to move one internal tier; bottom 10% eligible to move one down after a completed participation cycle, with first-cycle promotion/relegation protection and an explicit opt-out. Small cohorts (<10 qualified) produce no competitive movement. Percentile ties are shared; no stable-ID punitive tie breaking for relegation. Protected participants' outcomes do not force an artificial replacement quota. Exact cohort sizing/fairness/minor-access rules require approval; these are simulated choices, not safety policy.

No public absence, countdown loss pressure, bought protection or fee-linked difficulty. Student league comparison and Peer identity progression/currency are distinct. Relegation affects only optional current comparison, not access, lifetime learning records, badges or earned balances. Illness/offline/late entry should allow private participation without compelled catch-up.

### F4 edge cases - analytical expectations

| Case | Invariant / expected outcome |
|---|---|
| 1 Random guessing | Chance-adjusted quality exposed with uncertainty, no mastery assertion from a lucky small sample |
| 2 Fewer than five/invalid items | No comparative league claim; task still usable privately |
| 3 Easy-course repeated grinding | Same family credit capped, course/global caps limit volume |
| 4 Identical retake | Zero incremental credit |
| 5 Genuine improved retake | Only positive best-value delta, no double credit |
| 6 Renamed/generated copy | Semantic family identity prevents reset |
| 7 Hard versus easy course | Predeclared calibrated band, not payment/age/time-based multiplier |
| 8 Quiz client claims pass | Server rubric/attempt authority decides; local callback never grants progression |
| 9 Completion without learning event | Completion cap separate; autoplay/watch time not mastery |
| 10 Minor/default visibility | Private/personal-best, no public ranking by default |
| 11 Late/small cohort | Qualification/protection/no movement rather than forced demotion |
| 12 Percentile ties | Shared eligibility, no arbitrary ID-based penalty |
| 13 Offline/client clock/speed | No time-derived rewards; canonical version/outbox reconciliation |
| 14 Cheating/collusion allegation | Evidence review and appeal, no disability/identity inference from score alone |
| 15 Task/rubric update | Preserve attempted version and explicitly chosen mapping; no silent regrade |
| 16 Rest/opt-out/account switch | No public loss pressure, correct identity isolation, lifetime records preserved |

## Decisions and falsification

If points can be earned without independently useful work, if review labor exceeds capacity, or if comparison worsens learning/pressure, simplify to private verified progress rather than adding reward intensity. Founder must choose names/art/perks/caps/cohorts/promotion/decay and safety scope; competent review and task calibration must precede release. Numerical model assertions are synthetic, not current app tests. Full mission/badge inventories and approved UI/API/motion specification remain later E work.
