# Feature Cards 01 - learner reasoning and continuity

Date: 2026-11-07. Task: FP2-C2. Status: PROPOSED; no implementation or release approval.
Audience: engineers evaluating Feature Pack 2, with the founder deciding scope.
[Skill: brainstorming]

## Shared implementation contract for all fourteen cards

These are minimum-slice specifications, not claims that the named schema or endpoints exist. Reuse the audited system after prerequisite repairs; do not create parallel identity, entitlement, rating, wallet, Board or notification authorities. Full core F1-F8 design and final retention/safety/money decisions remain later gated work.

- Evidence: P codes refer to [the source-reported corpus](research-pain-points.md); LE source codes refer to [learning evidence](research-learning-evidence.md). These are reported problems or scoped studies, not proof of a current defect, intervention effect or prevalence. Empty evidence references mean a job/game-design hypothesis, not an invented interview.
- All new records carry `id, ownerId, scopeId, scopeType, version, state, createdAt, updatedAt, provenance, schemaVersion`. Use opaque IDs; schema names below are proposals. Sensitive text is private by default. No reviewer receives an unrestricted User/document join.
- Proposed mutations require authentication, server-side scope/role/entitlement checks, a unique `(actorId, action, idempotencyKey)` and an expected version. Replayed success returns the original receipt; conflicting reuse is rejected. Stale edits return 409; unauthorized/nonexistent resource reads return a nonenumerating 404. Revocation is checked at read/export time, not just when a link is issued.
- The UI exposes empty, draft, saving, saved, offline/read-only, stale-version, permission-revoked, unavailable, deleted and retry states. Never show success before a durable response. Local private drafts must be partitioned by account and cleared on sign-out/shared-device exit. Basic export/delete/appeal rights are not paid perks.
- Use an outbox or equivalent recoverable transaction boundary for event emission; workers deduplicate by event ID. Analytics payloads contain IDs/category/version, not raw misconceptions, support text or payment identifiers. The aggregate authorization and suppression requirements in each card apply before analytics export.
- Each workflow is optional; reminders require affirmative choice and obey a shared attention budget. No XP/currency/rank/rating boost for submissions, attendance, sharing, praise or repeated failures. No random rewards, streak loss, bought advantage or scarcity claims.
- Signature moments use existing CSS/Motion/token surfaces. Sound is off. No forced ceremony. Proposed ordinary reveal: 180 ms opacity/state change; compare transition: at most 400 ms; both cancelable with immediate static equivalent. Reduced motion uses an instant state update; nothing flashes. Three is not a dependency for understanding or completion. These are proposed feature-level defaults, not finalized F8 choreography.
- Erasure, retention and legal holds need approved purpose-specific policy. Until decided, no indefinite retention assumption; gate shipping on a documented schedule and deletion/hold tests. Deleted source content leaves only the minimal authorized tombstone needed for integrity, never publicly reconstructed text.
- Acceptance for every card includes cross-account access denial, stale edit/retry, deletion/revocation, account switch, keyboard/screen-reader use, reduced-motion/static equivalence and event deduplication. Runtime tests are future implementation work and were not run here.

## X-001 - Detour With Return Key

**Problem/evidence.** A learner cannot use unfamiliar material without its missing prerequisite (P-010). Detours commonly lose the original question; that latter failure is a coordinator hypothesis. Student job: repair just the missing bridge and return, not restart the course. Baseline score 66.25/100, L effort, proposed W2; branch authoring and version alignment lower feasibility. Nine dimension scores are editable in [CSV](models/feature-lab-candidates.csv).

**Flow and numbered mechanics.**
1. At a mentor-marked prerequisite link, the learner saves an optional prediction/question and chooses detour or continue. No ability diagnosis is inferred from a wrong answer.
2. Save the original course/lesson version and semantic anchor before navigation; allow one active detour in the minimum to prevent a maze.
3. Open one mentor-authored prerequisite resource that the learner is entitled to read. An inaccessible resource offers a safe explanation of unavailability, not an upsell barrier to returning.
4. On return, show the saved question beside the resource evidence and ask what changed. Learner may answer, skip, resume original, or abandon the detour.
5. Save the revision separately from the original prediction. Resource edits invalidate recommendations, not earlier reasoning.

**Signature/habit.** “Your original question, with a new way to answer it.” The return comparison is the payoff; ordinary study is the trigger, optional question investment enables later retrieval. No compulsory detour-completion loop.

**Schema/API/events.** `DetourLink{sourceLessonVersion, sourceAnchor, prerequisiteResourceVersion, mentorId, status}`; `DetourVisit{learnerId, linkId, originAnchor, prediction, revision, returnedAt}`. Proposed `POST /learning/detours`, `PATCH /learning/detours/:id/return`; emit `detour.started/returned/abandoned`. Only authoring mentors edit links; learner visits are owner-private.

**Slices/reuse/economics.** Minimum: one curated branch and explicit return prompt. V1: bounded prerequisite map plus stale-link repair. V2: learner-proposed links after human review, not automatic adaptive diagnosis. Extend CourseLearn/resources and canonical progress; do not duplicate the course graph. No money or virtual issuance; authoring/review time is the cost, vendor price unknown.

**Safety/acceptance.** Private predictions, reversible suggestions, accessible alternatives. Test inaccessible/deleted prerequisites, changed origin lesson, restart midway, return without writing and wrong-account draft. No forced regrading or completion reward.

**Metrics/risks/questions.** Primary: optional return followed by an independently scored transfer task; secondary: successful anchor return. Countermetrics: detour abandonment, navigation time and author maintenance. Risk: extra work becomes a barrier. Decision: who maintains prerequisite mappings, and how much mentor authoring capacity exists?

## X-002 - Twin-Clock Review

**Problem/evidence.** Confidence and delayed recall need separate measurements (LE-S07/LE-S12; see the scoped science note, not a platform efficacy claim). Student job: discover what still needs practice without losing standing. Score 68/100, M, W1; private recurring value is plausible, learning uplift unproven.

**Flow and numbered mechanics.**
1. After a low-stakes attempt, offer a private confidence note on a three-label scale and explain that confidence is not a grade.
2. Learner may schedule one revisit, choose a date, or choose no reminder. Default schedule is unset; time intervals require later content/science validation.
3. At revisit, serve a mentor-authored equivalent item with a stable rubric before revealing the earlier answer/confidence.
4. Compare attempt outcomes and confidence as separate labeled facts. If they differ, offer explanation/review, not a penalty or inferred trait.
5. Learner can reschedule, dismiss or delete the review; missed dates never reduce leagues, streaks or currency.

**Signature/habit.** “Confidence and recall can disagree. Nothing is lost.” A chosen revisit reveals useful evidence; optional next review is the investment. Display timestamps as the two clocks, not a countdown meter.

**Schema/API/events.** `ReviewPair{learnerId, itemFamilyId, rubricVersion, attemptIds[2], confidenceLabel, requestedRevisitAt, reminderConsent, state}`. Proposed `POST /learning/review-pairs`, `PATCH /learning/review-pairs/:id/schedule`, `POST .../:id/revisit`. Events `review_pair.created/revisited/dismissed`; no answer or confidence in analytics exports.

**Slices/reuse/economics.** Minimum: two low-stakes attempts and one optional reminder. V1: mistake-notebook selection and deduplicated scheduling. V2: interleaved task families after validation; no black-box mastery score. Reuse corrected quiz authority, private notes and common reminder dispatcher. No money/rewards; question authoring and delivery cost must be measured, not assumed zero.

**Safety/acceptance.** Delete confidence history, refuse cross-account access, do not show peers the mismatch. Test daylight-saving/time-zone change, late revisit, disabled push, duplicate attempt, rubric replacement and partial offline save.

**Metrics/risks/questions.** Delayed rubric-scored recall is primary; return visits alone do not count as success. Track calibration only privately and with enough comparable tasks; fatigue, opt-outs and question exposure are countermetrics. Risk: equivalent items are not equivalent. Decision: content team ownership of task families and calibration criteria.

## X-003 - Assumption Passport

**Problem/evidence.** Disputed material/assessment accuracy and unhelpful error feedback (P-004, LE-S11) suggest a need to preserve reasoning, not just mark answers wrong. Student job: revise a specific assumption across contexts. Score 69.75/100, M, W1; no claim that the learner's explanation is automatically correct or diagnosable.

**Flow and numbered mechanics.**
1. Learner selects a low-stakes mistake and writes an optional “I assumed…” statement; preserve the actual item/rubric version.
2. A mentor can supply a correction and source anchor within their authorized course; learner can contest it without affecting rating or access.
3. Save original assumption, correction and counterexample as distinct versioned fields, with “unreviewed/mentor reviewed/disputed” labels.
4. In a later mentor-authored transfer context, offer the earlier assumption before the new attempt; learner chooses keep, revise or unsure.
5. Keep the revision chain private and deletable. Never turn its size into a league score, ability label or public error collection.

**Signature/habit.** “This assumption worked there; does it work here?” Re-encounter is useful retrieval, not collection completion. The selected counterexample, rather than a badge, marks progress.

**Schema/API/events.** `AssumptionEntry{learnerId, sourceAttemptId, sourceVersion, originalText, revisions[], correctionRef, reviewState, counterexampleRefs[]}`. Proposed `POST /learning/assumptions`, `PATCH .../:id`, `POST .../:id/contest`; emit `assumption.created/revised/contested`. Mentor comments are separately owned records with withdrawal state.

**Slices/reuse/economics.** Minimum: one private explanation, mentor correction and counterexample. V1: source-linked notebook retrieval and export. V2: bounded concept grouping, with human confirmation rather than automatic misconception profiling. Reuse Q&A/resources and F6 notebook contract. No currency/money; mentor review workload is the main variable cost.

**Safety/acceptance.** No minor's error history exposed; private minimum is not final approval of all-age use. Test incorrect correction/appeal, changed rubric, withdrawn comment, deleted attempt and exported redaction. A rejected correction cannot silently remain “reviewed.”

**Metrics/risks/questions.** Transfer-task outcome and helpful correction acceptance; count disputes, review backlog and private deletion friction. Risks: wrong mentor diagnosis, excessive writing, sensitive self-disclosure. Decision: reviewer scope and workload cap; proposal is one open correction request per entry, with clear unavailable state rather than promised SLA.

## X-012 - Revision Exhibit

**Problem/evidence.** Job/game-design/shareability hypothesis, with no direct pain-source reference. Student/Peer job: explain how their work improved, not display a polished trophy without learning context. Score 65.5/100, M, W2; lower evidence confidence and new permissions reduce priority.

**Flow and numbered mechanics.**
1. Save one private artifact and a learner-authored initial reasoning statement; upload rights and malware/media constraints remain required foundations.
2. Optionally invite one consenting adult reviewer to a specifically scoped copy; invitation expires/revokes, not general profile access.
3. Learner creates a revised artifact and explains the change, keeping feedback attribution optional with separate permission.
4. Compare initial/revised layers; sharing is absent in the minimum. Later sharing previews every visible layer and excludes metadata/private feedback by default.
5. Source deletion or feedback withdrawal removes access to that layer; a share cannot silently reconstruct it from caches.

**Signature/habit.** The exhibit's center is “Why I changed it,” not a score. A finished revision can inspire another challenge; no feed, like tally or completion compulsion.

**Schema/API/events.** `RevisionExhibit{ownerId, artifactVersionRefs[], reasoningVersions[], feedbackRefs[], selectedLayers[], shareState}`; `ExhibitGrant{resourceId, recipientId, layers, expiresAt, revokedAt}` for later adult pilot. Proposed `POST /learning/exhibits`, `PATCH .../:id/layers`, `POST .../:id/revoke`. Emit `exhibit.revised/grant_revoked`; never log raw artifacts.

**Slices/reuse/economics.** Minimum: private before/after artifact and explanation. V1: scoped adult feedback/redaction/export. V2: opt-in curated showcase after rights/moderation gate; public minors excluded by default. Reuse media/resource anchors and existing card components; no competing social network. No fee/currency; storage, moderation and rights review are costs requiring measured limits.

**Safety/acceptance.** Test stolen work allegation, reviewer withdrawal, hidden EXIF/identifiers, shared link after revoke, accidental layer inclusion, upload failure and static/keyboard comparison. No submission-based rank or compelled sharing.

**Metrics/risks/questions.** Rubric-scored reasoning revision and creator-rated utility; not likes. Countermetrics: moderation burden, accidental disclosure, sharing regret. Risk: polished artifacts favor well-resourced learners. Decision: supported artifact formats/size limits and whether any public showcase should exist at all.
