# Feature Cards 03 - mentor evidence, sustainable repair and version trust

Date: 2026-11-07. Task: FP2-C2. Status: PROPOSED; no implementation or release approval.
Audience: engineers evaluating Feature Pack 2 and the founder deciding scope.
[Skill: brainstorming]

The [shared contract](feature-card-pack-01.md#shared-implementation-contract-for-all-fourteen-cards) applies. These five cards are coordinator-authored, not output from the failed mentor pass. Specific slices here replace generic ideation summaries for design use while [CSV](models/feature-lab-candidates.csv) preserves provenance and editable scores. [P evidence](research-pain-points.md) is qualitative, concentrated and not proof of the proposed solution. Schemas/endpoints/events are proposed contracts, not audited existing APIs.

## X-073 - Outline Evidence Ballot

**Problem/evidence.** P-023/P-033 describe upfront production effort and disappearing opportunities. Mentor/requester job: test whether an outline teaches the intended outcome before costly production. Score 77.5/100, M, W2; proposed wow. This is evidence collection, not a replacement for F1 allocation or a paid pledge.

**Flow and numbered mechanics.**
1. After canonical authorized claim/outline state, mentor posts one short sample task, expected outcome and rubric with an outline version. Production timing/ownership still follows F1, not this feature.
2. Consenting adult requesters choose to attempt it or skip. One contribution per learner/task version; no XP, discount, paid priority or extra allocation weight.
3. Keep willingness/interest, task evidence and requested change separate. An unattempted interest click is not demonstrated learning demand.
4. Mentor reviews private submissions in a bounded queue, creates an aggregate rationale and publishes one outline revision/change explanation without learner identities or rare excerpts.
5. Freeze the pilot record when the canonical outline changes. “Insufficient evidence” is a valid result; the ballot cannot automatically publish, cancel a claim, extend deadlines or promise earnings.

**Signature/habit.** “Your attempt changed the outline here.” Request outcome, attempt sample, see an evidenced adjustment; later learning may generate another demand. Static version diff is complete; at most 400 ms optional compare reveal.

**Schema/API/events.** `OutlinePilot{requestId, claimId, mentorId, outlineVersion, taskVersion, rubricVersion, state}`; `PilotAttempt{pilotId, learnerId, answerRef, consentVersion, selfReport}`; `OutlineEvidenceDecision{pilotId, previousVersion, nextVersion, aggregateReason, reviewedAt}`. Proposed `POST /requests/:id/outline-pilots`, `POST /outline-pilots/:id/attempts`, `POST .../:id/decision`. Emit `outline_pilot.reviewed/outline_revision_linked`; canonical F1 service alone performs lifecycle transitions.

**Slices/reuse/economics.** Minimum: one task, manual mentor review and nonidentifying revision rationale. V1: bounded task/feedback collection plus explicit low-sample labels. V2: co-creation proposals only after rights/payment decisions, not silently included. Reuse CourseRequest/SignalFlare consolidation and quiz/resources after authority repair. No cash/virtual faucet; mentor authoring/review cost is visible, no production/earnings guarantee.

**Safety/acceptance.** Test brigaded contributions, wrong claimant, expired/reassigned claim, stolen draft, role/entitlement change, no attempts and sensitive answer. Fairness cannot depend on ability to participate in the pilot; no public minority-result inference.

**Metrics/risks/questions.** Useful outline changes and later aligned task outcomes; countermetrics duplicate unpaid labor, reviewer load, participation skew, claim delays. Decision: authorized adult pilot population and review-capacity cap; no numeric sample threshold is treated as evidence of validity.

## X-079 - Mentor Next Fix

**Problem/evidence.** P-026/P-029 report unexplained ratings and maintenance workload. Mentor job: choose one useful repair from evidence rather than chase every star. Score 83.25/100, M, W1; high supply/learner/reuse hypothesis, not proven uplift.

**Flow and numbered mechanics.**
1. Owner mentor opens a course/version view combining permissioned issue categories and aggregate assessment friction. Raw learner histories and hidden reviews are excluded; F2 moderation/visibility authority remains canonical.
2. Separate evidence facts, sample size, age and uncertainty from the suggested action. No diagnosis from one wrong answer or an unexplained star.
3. Mentor selects one active repair, records expected outcome and a check method; maximum one active experiment per course in the minimum, not a compulsory quota.
4. Publish through canonical authoring/review; link prior/next content versions and leave earlier attempts intact. The feature does not automatically edit course content.
5. Ask for optional neutral follow-up only within approved privacy/attention rules, then close as improved, not improved, insufficient evidence or abandoned. Never demand revised stars or retaliate against complainants.

**Signature/habit.** “One fix, with the evidence that led to it.” Work becomes finite and inspectable; an observed unresolved friction can trigger the next voluntary repair. X-071/X-095/X-091 variants are not extra release slots.

**Schema/API/events.** `RepairCandidate{courseVersion, category, aggregateEvidenceRefs, sampleMetadata}`; `RepairExperiment{mentorId, courseId, hypothesis, chosenAction, sourceVersion, resultVersion, outcomeCheck, state}`; `RepairReceipt{experimentId, evidenceWindow, observation, uncertainty, disposition}`. Proposed `POST /mentor/courses/:id/repair-experiments`, `PATCH .../:id/outcome`; events `repair.selected/version_linked/closed`. The minimum is manual evidence review, not predictive AI.

**Slices/reuse/economics.** Minimum: one owner-scoped issue category, repair and outcome receipt. V1: aggregated F2/F6 evidence with audited suppression/permissions. V2: prioritized suggestions after evaluation; no popularity score or purchased quality label. Reuse rating/Q&A/authoring/version services. No cash/rewards; aggregation, review and support labor are measurable costs.

**Safety/acceptance.** Test hidden/deleted reviews, tiny cohort, conflicting evidence, abusive issue, old rubric, failed publication and duplicated closure. Fail closed when aggregate evidence cannot be safely shown; display unavailable rather than a fabricated zero.

**Metrics/risks/questions.** Verified repair resolution and version-specific learning outcome, alongside mentor time saved; countermetrics reopens, review retaliation, repeated polling and workload. Risk: correlation looks like improvement. Decision: outcome attribution and safe aggregate thresholds before automated recommendations.

## X-080 - Earnings Explain

**Problem/evidence.** P-025/P-028 report perceived low value and uncertain earnings. Mentor job: understand a number's provenance and current status. Score 71.25/100, S, W1. S covers a truthful read-only explanation slice, not repairing settlement or building payouts.

**Flow and numbered mechanics.**
1. Mentor selects one owned statement/transaction. Label source, period, currency, amount precision and current status: projected, recorded, pending obligation, payable, initiated, actually paid, reversed or unknown.
2. Keep two independent explanation templates. Optional mentor-priced session platform share is 15%; subscription platform share is 20%, with the other 80% for enrolled courses' mentors under an allocation method still to be approved. Never apply one template to the other.
3. Show only established line items and exact source references. Fees/taxes/refunds/withholding/allocation are separate; unknown values stay unknown, never silently zero. “Queued payout” is not bank transfer.
4. Display reconciliation/version status. If a source chain is incomplete or the disabled checkout/settlement cannot provide facts, show unavailable/manual explanation with limitations, not a fabricated statement.
5. Offer a reviewed support capsule to question a number; this cannot initiate payout, override a ledger, change rates or adjudicate tax/refund rules.

**Signature/habit.** “This amount is recorded; this amount is only an estimate.” The useful payoff is clarity, not an earnings-animation celebration. Optional periodic inspection, never a daily revenue-check habit.

**Schema/API/events.** `StatementExplanation{mentorId, statementRef, moneyFlowType, currency, period, sourceLineRefs[], sourceVersion, reconciliationState, unknownFields[], explainedAt}`. Proposed `GET /mentor/statements/:id/explanation`; manual draft approval separate from canonical ledger. Event `statement_explanation.viewed/queried` excludes monetary identifiers in broad analytics. No new transaction table replaces MoneyLedger.

**Slices/reuse/economics.** Minimum: one source-backed read-only explanation with unresolved fields clearly labeled. V1: reconciled statement views after ledger/webhook/payout repairs. V2: optional scenario estimates with editable assumptions, never an income guarantee. No money-flow change, currency conversion or virtual issuance. Reuse payment/billing/MoneyLedger sources, but audited atomicity/reconciliation defects must not be hidden. Accounting/support review and reconciliation cost remain unknown.

**Safety/acceptance.** Test cross-mentor access, session/subscription misclassification, minor-unit rounding, missing tax, reversal, incomplete row chain, stale cache and queued-only payout. Approved financial fixtures must reconcile before any “paid” label is exposed.

**Metrics/risks/questions.** Statement comprehension/reconciliation match, unresolved questions and staff explanation time; not revenue uplift. Risks: false certainty, stale source facts, advice mistaken for tax guidance. Decision: legal/accounting confirmation and exact subscription allocation method remain blockers for final money design, not this read-only hypothesis.

## X-087 - Teaching Pattern Library

**Problem/evidence.** P-010/P-026 suggest missing scaffolding and unhelpful feedback. Mentor/Peer job: reuse an explanation with its assumptions and limits, not copy a context-free answer. Score 77.5/100, M, W2; strong differentiated reuse hypothesis.

**Flow and numbered mechanics.**
1. A mentor drafts a pattern with intended audience, prerequisite assumptions, teaching goal, example, counterexample, source/rights and known failure context.
2. Review within an authorized small adult group. Peer feedback is scoped, voluntary and attributed only by permission; no earned role/reputation from volume.
3. Another mentor forks a permitted version, changes its context/example and explicitly checks assumptions. Preserve source/version lineage and rights; a fork is not automatically reviewed.
4. Publish in the mentor's course through canonical review. A visible “works when / fails when” pair accompanies the explanation, not a universal best-practice stamp.
5. If a source is withdrawn or challenged, mark descendants for review without deleting learner work; human rights/correction review has appeal and no automatic plagiarism accusation.

**Signature/habit.** “Borrow the explanation, not its hidden assumptions.” Teaching need triggers a bounded fork; later evidence can contribute a reviewed counterexample. No endless community feed is necessary.

**Schema/API/events.** `TeachingPattern{authorId, goal, audienceScope, assumptions[], exampleRefs[], counterexampleRefs[], sourceRefs[], rightsState, reviewState, version}`; `PatternFork{parentVersionId, ownerId, changedContext, rightsCheck, reviewedAt}`. Proposed `POST /mentor/patterns`, `POST .../:id/forks`, `POST .../:id/review`; events `pattern.forked/reviewed/source_flagged`. Public publication needs a distinct rights/moderation gate.

**Slices/reuse/economics.** Minimum: owner library plus one authorized reviewed fork. V1: bounded adult mentor collection with source/rights review. V2: curated commons only after governance/licensing/staffing approval. Reuse resources/notes/Q&A/course review; no new editor or badge economy. No royalties or fee changes proposed by the minimum; curation, review and license enforcement are costs.

**Safety/acceptance.** Test unlicensed fork, changed parent, withdrawn source, misleading counterexample, unauthorized reviewer, appeal and personal learner data in examples. Copy/export enforces rights at action time; citations alone do not grant permission.

**Metrics/risks/questions.** Authoring effort and learner transfer outcomes in reused contexts; countermetrics unsupported copies, correction backlog, reviewer load. Risk: a library spreads one wrong explanation widely. Decision: maintainers, rights policy and review criteria; no professional-assurance claim from a pattern label.

## X-090 - Learner Safe Course Refit

**Problem/evidence.** P-004/P-016 report accuracy problems and lost study position. Mentor/student job: update a course without erasing reasoning, bookmarks or assessment context. Score 83.75/100, L, W3; proposed wow and highest model priority, but versioning infrastructure/operations justify late release.

**Flow and numbered mechanics.**
1. Mentor prepares a new immutable course/lesson/rubric version and maps old semantic anchors to new ones. Each mapping is exact, approximate, removed or unknown; no silent guessed mapping.
2. Preview which authorized learner artifacts may be affected using counts/categories, not unrestricted private text. Old attempts remain tied to old rubrics; no forced regrading.
3. Learner receives an optional, neutral change explanation with keep-current, inspect-new and choose-new-path actions. Critical content/rights/safety removal follows an approved policy, not a blanket promise of perpetual old access.
4. On chosen transition, preserve old refs and record a new resume anchor. Unmapped anchors open a repair tray; never jump invisibly or overwrite the original bookmark.
5. Roll back by choosing the previous available path; respect access/rights revocation. Course-version retirement needs a separately approved support/retention process. X-084 launch-log variant is included, not a second feature.

**Signature/habit.** “The course changed; your earlier reasoning did not disappear.” A semantic change preview, not spectacular travel, earns trust. Optional review of meaningful changes closes the teaching/learning repair loop.

**Schema/API/events.** `CourseVersion{courseId, parentId, contentRefs, rubricRefs, publicationState}`; `AnchorMap{oldVersion, newVersion, oldAnchor, newAnchor, mappingQuality, reviewedBy}`; `LearnerPathChoice{ownerId, oldVersion, newVersion, oldResumeRef, selectedResumeRef, choice, receiptVersion}`. Proposed `POST /mentor/courses/:id/refit-previews`, `POST /learning/refits/:id/choose-path`; emit `refit.published/path_chosen/mapping_unresolved`. Canonical publication authority controls availability, not this UI.

**Slices/reuse/economics.** Minimum: one lesson-version mapping, private attempt preservation and explicit path choice. V1: course-wide anchor/rubric map with repair/rollback receipts. V2: collaborative major refits after authoring/legal/support review. Reuse F6 anchors/notes, F2 eligibility versions and course review. No fee/currency; retained versions/storage and support/mapping labor can be substantial. No fictitious cost/hour or old-version entitlement guarantee.

**Safety/acceptance.** Test removed lesson, wrong map, old assessment disputes, revoked old media, partial transition, duplicate choice, simultaneous publication and rollback. Preserve old attempt evidence under approved holds without exposing removed content.

**Metrics/risks/questions.** Resume accuracy, retained reasoning access where authorized and transition comprehension; countermetrics unmapped anchors, support burden, stale unsafe material and coerced upgrades. Decision: version-retirement/critical-removal policy and storage/review budget. Do not release merely because this candidate ranks first.
