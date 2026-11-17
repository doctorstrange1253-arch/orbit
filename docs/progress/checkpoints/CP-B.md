# CHECKPOINT CP-B: Phase B - existing-system audit: COMPLETE

Date: 2026-11-06. Task: FP2-B. Branch: feature/orbit-v3-foundation.
GATE: WAITING_FOR_APPROVAL (CP-B).
Audience: the founder and engineers continuing Feature Pack 2.
[Skill: systematic-debugging] [Skill: verification-before-completion]

Completion is under the user-selected targeted-verification scope. It does not mean production readiness, all hypotheses confirmed, or all eight workflow passes completed.

## 1. What was done

- Audited all 14 requested existing-system areas through source, route, model, worker, UI and test inspection.
- Compared existing plan/design/milestone documents against connected code rather than trusting completion labels.
- Started four source audits with independent verification; stopped the two outstanding verifiers when the user selected "Stop and finish (Recommended)" after the long runtime.
- Preserved all six returned reports and performed targeted coordinator checks on high-impact remaining claims.
- Completed an F1-F9 reuse/extend/rebuild map, preserving equal importance for the later Feature Lab.
- Created separate league, currency and whiteboard finding sections, with explicit verification status on every entry.
- Kept rejected hypotheses, deliberate policies, future gaps and duplicate aliases separate from established source defects.
- Checked application preservation, document structure, source links and line bounds without executing or modifying the application.

## 2. Files created or changed

Deliverables, verified to exist before this checkpoint is posted:

- [docs/plan/v2/01-existing-system-audit.md](../../plan/v2/01-existing-system-audit.md): 14-area inventory, reuse map, risks, historical-document corrections and verification limits; 38,550 bytes / 220 lines.
- [docs/plan/v2/01-audit-findings.md](../../plan/v2/01-audit-findings.md): detailed confidence-labeled catalog; 62,445 bytes / 187 lines.
- [docs/progress/checkpoints/CP-B.md](CP-B.md): this checkpoint and approval request.

Updated control files:

- [.agent/STATE.md](../../../.agent/STATE.md), [.agent/HANDOFF.md](../../../.agent/HANDOFF.md), [.agent/TASKS.md](../../../.agent/TASKS.md).
- [.agent/FILE_REGISTRY.md](../../../.agent/FILE_REGISTRY.md), [.agent/PATHS.md](../../../.agent/PATHS.md), [.agent/DECISIONS.md](../../../.agent/DECISIONS.md).
- [.agent/ERRORS.md](../../../.agent/ERRORS.md), [.agent/ENVIRONMENT.md](../../../.agent/ENVIRONMENT.md), [.agent/SESSION_LOG.md](../../../.agent/SESSION_LOG.md).

No application code, package, migration, database record, deployed service or Git commit changed. Existing uncommitted application work was preserved.

## 3. Ten key findings or decisions so far

1. **Reuse is substantial, integration is incomplete.** Existing dashboards, progression, recorder, whiteboard, demand UI, authoring and motion should not be treated as blank-slate features or as fully accepted products.
2. **Progression is fragmented.** Orbit leagues, Cosmic reputation, Gameology/Pulse and Mentor Pact coexist; there is one shared Photon wallet, not three isolated currencies. Client-controlled XP and conflicting rollover/wallet writes are source-checked issues.
3. **Privacy boundaries need work.** Skill discovery can include private joined User fields; spotlight queries can surface hidden review text; SPA account switching can retain private cached results.
4. **The shared whiteboard is real but unsafe to extend blindly.** Eleven independent source findings cover authorization, lifecycle, persistence, convergence and input/resize handling. Current ephemeral call-board lifetime is intentional, not itself a bug.
5. **Monetization is not end-to-end operational.** Subscription checkout returns 503/501; session payouts queue ledger intent rather than transfer to a bank; payment/refund/ledger recovery has concrete source failure paths.
6. **Demand has two disconnected systems.** CourseRequest claims and Signal Flare fan-out are separate. Flare delivery is ranked/capped, not every mentor globally, but it lacks the required allocation/claim lifecycle.
7. **Ratings are only partially suitable for the new plan.** Peer ratings are not completed-call-only, session aggregates have unresolved findings, and course rating counters do not establish a functioning verified course-review pipeline.
8. **Core learning/call UI contracts are broken.** The paid session wrapper renders the generic lobby rather than its supplied transport, and CoachQuiz's payload/grading contract does not match the backend.
9. **Recorder exists; the full studio does not.** Chapters, teleprompter, layouts and cuts are implemented, but durable recovery, shared-board integration, private notes and timestamped quiz checkpoints are not established. Visible Ollama quiz controls target an unmounted router with additional dormant defects.
10. **Readiness remains unverified.** Existing animation/tokens can be extended, but no fresh browser/device/performance acceptance, payment-provider operation, legal/tax verification or deployed-state inspection was performed. Historical milestone and financial totals are not reliable evidence.

Exact paths, source ranges and concrete failure scenarios live in the audit and catalog. These findings are not claims of actual exploitation, live loss or measured production outages.

## 4. Verified versus unverified

| Category | Evidence / status |
|---|---|
| Source inventory | All 14 requested areas covered; four audit reports preserved |
| Independent review | Demand/money and calls/whiteboard verification reports returned; reputation and experience verifiers were stopped, not completed |
| Targeted checks | Coordinator traced XP authority/schema, league rollover, wallet/gift/duel failure boundaries, role-refresh routing, hidden review quoting, user projection and earlier AI/payment paths |
| Catalog scope | 111 records include 6 aliases, 6 future gaps and 10 rejected hypotheses; NOT 111 proven bugs |
| Verification labels | V53 independent source checks; T13 targeted checks; A27 first-pass only; U2 plausible/unverified; G6 gaps; R10 rejected; totals include aliases |
| Outstanding hypotheses | 29 A/U records explicitly unresolved; they must not be treated as confirmed defects or blindly fixed |
| Document validation | Main audit has 14 area headings; catalog retains all selected records; source links/line bounds and authored character rules checked |
| Application preservation | 782-file beginning/end fingerprint matches; HEAD remains ae9ba9653a35e6c4b1d656bef9ce8956282f2509 |
| Runtime | No application tests/builds/imports, browser sessions, servers, DB/provider/model calls or deployment verification |
| External facts | Prices shown are code values; tax/legal/license/provider claims require Phase C primary sources |

Application fingerprint (sorted git-listed FrontEnd/BackEnd paths, NUL separator and file bytes):

```text
19b7f223d815104e687c453b7b391561dd771db8de61b9bac92b169cb9740388
```

## 5. Problems and tool failures

- The workflow design was over-scoped. At about 119 minutes, six passes had returned and one remaining verifier had made 315 tool calls. Observed execution was two workers at a time. My prior ETA was not reliable.
- The user chose to stop the remaining workers. TaskStop succeeded; all six completed reports remained readable. No replacement workflow was launched and no completed report was discarded.
- Module/file guesses and broad searches caused lookup failures, timeouts or output limits. Actual imports, exact directory listings and bounded/paginated searches resolved them.
- Large recovered JSON reports exceeded the display limit. Complete tool outputs were preserved and recovered by bounded sections; the catalog retains every selected report record.
- Existing LF/CRLF warnings were observed without changing Git settings. No destructive shortcut, package installation or permission change was used.

The process change is concrete: retain the existing evidence, perform only targeted checks needed for claims, and expose unresolved work. Do not start another repository-wide verification pass for this checkpoint.

## 6. Decisions needed

No monetary percentage, visible brand, minor-safety policy or extra-feature shortlist is finalized here. Existing 15% session / 20% subscription constraints remain unchanged.

| ID | Options | Recommendation and why | Consequences |
|---|---|---|---|
| FP2-QB1 | Plan around reuse plus prerequisite repairs; or pursue a broad replacement | Reuse verified building blocks and include critical authority/lifecycle repairs as prerequisites | Preserves existing behavior/art and reduces duplicate work; requires explicit repair acceptance before expansion. Broad replacement adds scope and migration risk without evidence that every component needs it |
| FP2-QB2 | Consolidate current demand systems; or preserve two independent demand lifecycles | Research a consolidated demand model with one clear allocation/claim contract, retaining useful existing UI/data | Reduces conflicting votes, states and notifications. Keeping both requires intentional separation and reconciliation; this is not a decision to delete or migrate data now |
| FP2-QB3 | Continue to Phase C using this scoped audit; revise the audit; or hold | Approve CP-B if the documented verification limits are acceptable | Opens research only. The 29 A/U findings carry forward as verification debt; no automatic repairs or blanket approval of recommendations |

**Input needed:** the original prompt stops during Phase C topic 12. Please supply the remaining text from there through the later phase instructions, preferably in smaller messages. The F1-F9 requirements and gate map are already retained; do not resend folder paths or restart Phase A. Supplying text alone is not checkpoint approval.

## 7. Next phase preview

After explicit CP-B approval only, Phase C will collect current primary-source evidence on marketplace allocation/reputation, progression/motivation, original badge/theming practice, virtual economies, recording/media, collaborative whiteboards, notes editors, one-to-one providers, India payments/compliance, safety/privacy, motion and Feature Lab pain points/learning science.

This is substantial research. Use bounded question-based work packages and source verification, not another unbounded code re-audit. Log every query, opened source, access date, takeaway and disagreement in docs/plan/v2/research-log.md. Prefer at least five quality sources per topic where possible; mark blocked access and unsupported claims UNVERIFIED. Legal/tax/provider prices require current official sources and later professional confirmation. F9 receives equal evidence effort; no invention/shortlist phase begins until CP-C approval.

Skill restrictions from CP-A still apply: no stock research WebUI, package/skill installs, paid calls or undocumented output directories. The missing prompt tail must be recovered before relying on its details.

## END-OF-TURN

- Files: the three deliverables and nine control documents listed above; no application changes.
- Commands/results: TaskStop succeeded; six returned reports recovered; 14-area/catalog/link checks completed; 782-file hash and HEAD unchanged. No app execution or external research.
- Verified: source inventory, specified V/T checks and preservation. Unverified: 29 A/U records plus runtime, deployment, provider, legal and performance acceptance.
- Next: wait for typed approval of CP-B. GATE: WAITING_FOR_APPROVAL (CP-B). Decisions: FP2-QB1/2/3 and missing prompt tail; no Phase C work while waiting.

## 8. Approval request

Reply APPROVE to continue to Phase C: deep research, REVISE: <notes> to change this phase, or HOLD.
