# Feature Cards 02 - cooperative clarity and recoverable access

Date: 2026-11-07. Task: FP2-C2. Status: PROPOSED; no implementation or release approval.
Audience: engineers evaluating Feature Pack 2 and the founder deciding scope.
[Skill: brainstorming]

The [shared implementation contract](feature-card-pack-01.md#shared-implementation-contract-for-all-fourteen-cards) applies to every card: proposed schemas/endpoints, authorization/versioning/idempotency, durable state, revocation, optional participation, no rewards for activity, static/reduced-motion equivalents and future acceptance tests. Evidence codes use [the qualitative corpus](research-pain-points.md), not population claims. [CSV](models/feature-lab-candidates.csv) retains raw score dimensions/provenance; safe card slices override generic ideation summaries, not source history.

## X-023 - Confusion Splitter

**Problem/evidence.** P-005 reports distracting multiple-choice formatting. Student job: distinguish presentation friction from uncertainty about the concept. Score 69.75/100, S, W1; narrow UI reuse is strong but usefulness needs user testing.

**Flow and numbered mechanics.**
1. For one low-stakes mentor-authored item, learner chooses “Try a plain layout.” Do not change a graded assessment already in progress.
2. Preserve item/version, stable option IDs and semantic content; render the same choices with simpler spacing and no extra decoration. Keyboard order and accessible labels remain equivalent.
3. Store the two layout selections separately, without treating a changed choice as cheating or an ability deficit.
4. Let learner label “layout was clearer,” “concept still unclear,” “both,” or “not sure.” No disability/diagnostic inference.
5. Offer a concept explanation or a presentation issue report according to the explicit label; report attachment needs preview/consent and no full account screenshot.

**Signature/habit.** “A formatting problem is not an ability label.” The side-by-side semantic comparison is an immediate payoff; recurring investment is an optional clearer-layout preference, not a diagnostic profile.

**Schema/API/events.** `LayoutComparison{learnerId, itemVersionId, originalChoiceId, plainChoiceId, selfLabel, preferredLayout}`; proposed `POST /learning/layout-comparisons`, `PATCH .../:id/label`. Events `layout_comparison.saved/report_requested`; raw answers and labels are owner-only. Never feed these records into F2 rater credibility or F4 ranking.

**Slices/reuse/economics.** Minimum: one low-stakes item with two equivalent layouts. V1: learner preference and mentor-reviewed formatting queue. V2: richer accessible alternatives only after semantic-fidelity tests. Reuse corrected quizzes/CSS, not a second grading engine. No cash or virtual value; content QA/design time is the cost, with no promised conversion uplift.

**Safety/acceptance.** Test option reordering, math/code rendering, language expansion, duplicate click, unavailable item, preferred-layout persistence, screen reader and grading isolation. If content differs, the comparison is invalid and must not imply improvement.

**Metrics/risks/questions.** Primary: self-reported clarity plus equivalent-task comprehension; countermetrics: semantic mismatch, false report load, extra interactions. Risk: plain layout accidentally changes question cues. Decision: which item types can guarantee equivalence and who reviews reports?

## X-042 - Assumption Duet

**Problem/evidence.** P-010/P-011 describe missing scaffolding and stalled conversation; peer overlay is a cross-domain/game-design hypothesis, not established remedy. Student/Peer job: see where two explanations need different prerequisite bridges. Score 70/100, M, W2; proposed wow candidate.

**Flow and numbered mechanics.**
1. Two consenting adults voluntarily join a private exercise using one mentor-approved explanation and immutable Board snapshot. No open matchmaking or live video in the minimum.
2. Each independently annotates a bounded set of prerequisite assumptions using stable anchor IDs; reveal only after both submit or choose to reveal. Neither is graded against the other.
3. Overlay labeled paths with pattern/shape plus text, not color alone. Differences mean “different assumptions,” not “weak learner.”
4. Partners choose one missing bridge and attach a question for authorized mentor review. They may decline or leave without penalty.
5. Mentor supplies a source-backed clarification; each learner privately records whether it resolved their question. Partner cannot access a learner's notebook.

**Signature/habit.** “Your paths diverged here; this bridge connects them.” At most 400 ms overlap reveal with skip and static comparison; no audio. Bounded joint repair is the reward, a new explanation is optional investment.

**Schema/API/events.** `DuetExercise{scopeId, explanationVersion, boardSnapshotId, participantIds[2], grants, state}`; `DuetAnnotation{exerciseId, ownerId, anchorIds[], assumptionText, revealConsent}`; `BridgeReview{exerciseId, sourceRefs, resolution}`. Proposed `POST /learning/duets`, `POST .../:id/annotations`, `POST .../:id/reveal`. Emit `duet.revealed/bridge_reviewed`; permissions are enforced outside raw socket room joins.

**Slices/reuse/economics.** Minimum: asynchronous private snapshot and paired annotations. V1: mentor review with decline/availability queue. V2: bounded crews only after moderation/call/consent gates. Reuse canonical Board/Q&A/Motion after membership/revision repair. No currency/money; storage and mentor/moderator time are costs, no new SFU required.

**Safety/acceptance.** Test one partner leaves, unauthorized invite, stale snapshot, abusive annotation, redaction, blocked partner and reveal timeout without auto-disclosure. No public misconception map; minors/live extensions deferred, not assumed lawful.

**Metrics/risks/questions.** Bridge-resolution utility and independent transfer tasks, not partner volume. Countermetrics: dropouts, pressure, moderation backlog and unfair explanation ownership. Decision: review workload and whether adult asynchronous cooperation should remain the whole scope.

## X-049 - Cohort Question Quilt

**Problem/evidence.** Cohort/pain/SCAMPER hypothesis without direct cited complaint. Student/Peer/mentor job: turn shared confusion into one useful explanation without exposing struggling individuals. Score 70/100, L, W2. Raw REVIEW status is preserved; proposed PASS applies only to this narrow consenting-adult slice and is not policy/compliance approval.

**Flow and numbered mechanics.**
1. Invite an existing consenting-adult course cohort to submit private category cards. Explain exactly what a mentor can read and what may appear in a recap; no participation incentive.
2. Minimum collects mentor-defined category IDs, not student free text, public identity or progress details. Each member can contribute at most one count per category per recap and withdraw before publication.
3. Compute distinct authorized contributors server-side. Suppress the entire recap below ten contributors and suppress any category below ten; no counts, rare category labels or individual drilldowns are shown. Ten is a proposed suppression parameter, not an anonymity guarantee.
4. Mentor authors a general explanation from qualifying categories. Publication requires a preview/review check for contextual re-identification; remove source cards and demographic facets from learner-facing output.
5. Recap carries course/version and an explicit “mentor summary” label, not an AI/crowd-consensus truth claim. Students can privately ask whether the explanation helps, through separate authorized Q&A.

**Signature/habit.** “A difficulty gets explained without naming who struggled.” One digest per selected teaching unit is proposed, never repeated small-group probing. Questions generate a useful recap, not competitive collection.

**Schema/API/events.** `ConfusionCategory{courseVersion, mentorId, label}`; `CohortCard{cohortId, ownerId, categoryId, consentVersion, withdrawnAt}`; `QuiltRecap{cohortId, courseVersion, categoryRefs, authorId, suppressionCheckedAt, reviewedBy, text, status}`. Proposed `POST /cohorts/:id/confusion-cards`, `POST /cohorts/:id/recaps`; emit `recap.reviewed/published`. Private raw contributions never enter broad analytics/export.

**Slices/reuse/economics.** Minimum: adult category-only cards and mentor-authored suppressed recap. V1: carefully evaluated text submissions with separately approved purpose/access/retention, not assumed expansion. V2: larger moderated cohorts only after child/privacy review. Reuse taxonomy/Q&A/course scopes; no leaderboard or live branch. No fee/currency; authoring, privacy review and moderation workload may dominate benefit.

**Safety/acceptance.** Test nine versus ten distinct contributors, duplicate accounts, contributor withdrawal between check/publish, inference through repeated recaps, small category, identifiable mentor prose, role change and cohort closure. Recheck threshold/authorization atomically at publish; fail closed.

**Metrics/risks/questions.** Explanation utility and private follow-up task outcomes. Countermetrics: suppression frequency, re-identification reports, low participation and author time. Decision: suppression and consent review by a competent privacy/safety owner; do not ship from an editorial PASS flag alone.

## X-059 - Pocket Readiness Stamp

**Problem/evidence.** P-014/P-022 report incomplete offline downloads and desktop-only interruptions. Student job: know exactly what is available before disconnection. Score 69.5/100, M, W2; existing PWA is reusable but cache/entitlement repairs are prerequisites.

**Flow and numbered mechanics.**
1. Learner explicitly prepares one permitted text lesson. Fetch a server-authoritative versioned manifest listing required assets, entitlement dependencies and online-only operations.
2. Cache only assets permitted by the approved content/licensing policy; verify expected byte length/hash when available and maintain account-scoped availability receipts.
3. Present each component as available locally, unavailable, needs online entitlement check, or unsupported on this device. “Ready” requires all mandatory permitted components verified; optional missing items remain plainly visible.
4. Save a semantic bookmark plus lesson version. On reconnect, reconcile stale content and queued private notes; do not invent graded quiz completion or payment/session status offline.
5. Account switch, sign-out, revocation and storage eviction invalidate local readiness. A stamp is a momentary check, not a durability or indefinite-access guarantee.

**Signature/habit.** “This diagram is missing before you go offline.” Readiness is practical preparation; return investment is a bookmark, not a download collection.

**Schema/API/events.** `LessonManifest{lessonVersion, requiredAssets[], optionalAssets[], onlineActions[], permissionVersion}`; `ReadinessReceipt{ownerId, manifestId, verifiedAssets[], checkedAt, deviceScope, state}`. Proposed `GET /learning/lessons/:id/manifest`, `POST /learning/readiness-receipts`; local cache adapter is not server entitlement authority. Events `readiness.checked/reconciled` contain no paid media URL.

**Slices/reuse/economics.** Minimum: one permitted text lesson plus bookmark. V1: verified limited asset bundle and recovery UI. V2: licensed media caching after policy/device/storage tests. Reuse PWA/resources/progress, not another offline payment model. No new money; download/storage/bandwidth costs require measured usage and license confirmation.

**Safety/acceptance.** Test eviction, interrupted download, hash mismatch, revoked grant, shared device, clock skew, old lesson anchor and offline button for unsupported quiz. No “offline paid session” or invisible DRM promise.

**Metrics/risks/questions.** Manifest accuracy and successful permitted offline task completion; countermetrics stale receipts, storage failure, data usage and access leakage. Decision: offline content rights and entitlement expiry behavior remain unresolved.

## X-066 - Help Handoff Capsule

**Problem/evidence.** P-001/P-020 report ineffective support and paid assessment access failure. Student/mentor job: explain once to successive accountable human owners. Score 71.75/100, M, W1; strong reuse but workflow/privacy repairs required.

**Flow and numbered mechanics.**
1. From an entitlement problem, create a minimal issue summary with user-selected course/session references and nonsecret status labels. Never automatically attach credentials, payment identifiers, recordings, messages or broad account dumps.
2. Preview the exact capsule; learner edits/redacts and consents before submission. Server retrieves narrowly authorized status facts rather than trusting client assertions.
3. Assign a named support function/owner and display current status without inventing a response SLA. One active owner at a time; transfer saves a durable receipt with reason and next authorized queue.
4. Next owner reads the same approved capsule, not all learner work. New attachments require fresh preview/consent; mentor recipients cannot see billing/support-only fields.
5. Close with an explanation and optional reopen/appeal. Closure does not change refunds, enrollment or ratings; those remain canonical business processes.

**Signature/habit.** “The next reviewer has the context you already approved.” Useful continuity is the reward; no required positive rating or retention campaign after support.

**Schema/API/events.** `SupportCapsule{ownerId, issueType, approvedFields, resourceRefs[], consentVersion, state}`; `SupportAssignment{capsuleId, queueId, assigneeId, version, transferReason}`; `SupportReceipt{capsuleId, action, actorId, fieldScope, outcome}`. Proposed `POST /support/capsules`, `POST .../:id/transfer`, `POST .../:id/reopen`; events `capsule.approved/transferred/closed`. Atomic assignment/version guard prevents two owners silently overwriting each other.

**Slices/reuse/economics.** Minimum: one entitlement issue, reviewed context, accountable manual queue. V1: role-scoped transfers and redaction/reopen. V2: additional issue types only after policy/training and staffing review. Reuse enrollment/session snapshots and moderation permissions. No new cash/virtual reward; support time and audit storage are costs, not a guarantee of resolution.

**Safety/acceptance.** Test unauthorized recipient, transfer retry, no available agent, abusive attachment, wrong reference, learner withdrawal, staff role loss and unresolved closure. Preserve only approved minimal receipts under future retention/hold policy.

**Metrics/risks/questions.** Verified problem resolution and repeated explanation burden; countermetrics reopen rate, private-data exposure, queue age and staff workload. Decision: staffing/accountability and escalation policy before a public promise.
