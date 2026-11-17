# Open work - live indexing ledger
Status: CP-IDX handover; WAITING_FOR_APPROVAL. This backlog does not authorize implementation or the listed gated work.
Current authority: Identity Worlds Phase C / IW-C-MLOCK. Steps1-3 are authorized; stop at CP-IDX. CP-W0 and new CP-C are unapproved. M4 additionally requires TOOLING OK.
Owner key: coordinator = this main session with verified RUNLOCK; founder = user; qualified reviewer = relevant independent/professional validation, not assumed available.

| ID | Remaining work | Status | Evidence / next verification | Owner / gate |
|---|---|---|---|---|
| IDX-01 | Complete every eligible file at its assigned depth | COMPLETE:972/972 | Manifest2644 =972eligible +1672excluded; explicit read receipts | Coordinator / source indexing complete |
| IDX-02 | Reconcile manifest, digest and exclusion counts | COMPLETE for declared scope | Independent traversal/count check:2644files,972eligible/1672excluded, zero omissions;51subtrees explicitly not enumerated | Coordinator / verified source inventory |
| IDX-03 | Recheck10 randomly chosen digests against source | COMPLETE, sampled source comparison | SPOT_CHECKS.md;10matches, no material mismatch;42separate line-count conventions normalized | Coordinator / no runtime proof |
| IDX-04 | Trace actual mounted product flows and write PROJECT_BRIEF | COMPLETE with explicit source/runtime limits | Four final review returns reconciled; false orphan warnings qualified, quiz/access/payment gaps explicit | Coordinator / source brief |
| IDX-05 | Present CP-IDX and wait | READY_FOR_HANDOVER | No M1 starts until typed approval | Founder |
| M1-a | Resolve two naming d5 passages, one targeted fetch each or UNVERIFIED | GATED | User continuity; side STATE.md:30; original missing sources are Arqade207965 and Meta30982 | Coordinator / after CP-IDX |
| M1-b | Rerun only course d3 and repair d2 ji_leakage_2022 source reference | GATED | side/shark-tank/STATE.md:31-32; exclude completed d1,d4,d5,d6,d7 | Coordinator / after CP-IDX |
| M1-c | Integrate retained journey3FIX/3CHECK, then independently review all nine gaps | GATED | side/main-snapshot.md:23; integrated result failed504/null | Coordinator/reviewer / after CP-IDX |
| M1-d | Decide whether process-settlement investigation is still needed; at most one bounded run | GATED | main-snapshot.md:23-24; prior503/zero findings supplies no usable conclusion about defects or safety | Coordinator / after CP-IDX; no tooling fixes without M4 |
| M1-e | Official research validation, independent review and convergence | NOT_RUN/GATED | Naming/course returns are not accepted evidence; no completed-stage replay | Coordinator/reviewer / CP-RC |
| M2-01 | Independently re-review corrected designs03 and04 | GATED | docs/design/v3/03-identity-switcher-spec.md;04-transition-spec.md:218; review debt explicit | Reviewer / after CP-IDX and research closure |
| M2-02 | Materialize canonical designs06-10 from retained and newly verified results | GATED | Mission.md:92; files absent from current manifest | Coordinator / design-only |
| M2-03 | Select world, league, leaderboard and currency names | UNSELECTED | DECISIONS.md:436-439; historical Celestial Reach rejected; comparison non-binding | Founder |
| M2-04 | Choose thought count policy, numeric timing, entry behavior and preference storage | OPEN | DECISIONS.md:390-405; cinematic5-6default already chosen, do not reopen it | Founder |
| M2-05 | Resolve quote editorial selection, representation, editions and distribution rights | OPEN |05-quotes-pool.md:15,31,160;45candidates,zero approved for display | Founder/qualified review |
| M2-06 | Choose feature flags, stable-ID versus display-alias handling and screen scope | OPEN |03/04/02 drafts and mission; no migration or screen cut selected | Founder |
| M3-01 | Write research digest and work plan; post CP-W0 | GATED | User M3; mission/paths identify destinations | Coordinator then founder |
| M3-02 | Prepare and post new v3CP-C | GATED | CP-W0 is additional, not a substitute | Coordinator then founder |
| APP-01 | Application implementation or pausedFP2/F7 resumption | NOT_AUTHORIZED | Current prompt, mission and CLAUDE current override | Founder / CP-W0 plus newCP-C and applicable scope |
| M4-01 | Finish descendants/cleanup verification and async log-I/O contracts | PARKED | main-snapshot.md:24; source-only findings and old tests not complete proof | TOOLING OK required |
| M4-02 | Finish relauncher CLI/receipt edges and independent whole-tool review | PARKED | CAPABILITIES.md:22-24; no host activation proof | TOOLING OK required |
| M4-03 | Install hooks or activate relauncher | NOT_AUTHORIZED | Explicit separate approval required even after tooling tests | Founder |
| S-01 | Side pitch G1 founder review and missing facts | OUT_OF_SCOPE | side/shark-tank/STATE.md:3-11; latestDeck_v4; G2/G-END unopened | Founder/side session; SHARK FIRST or DO BOTH |
| FIN-01 | Reconcile source pricing/accounting with intended subscription/session rules | DRIFT_CONFIRMED; policy/implementation gated | Sourcecatalog599/1299/2199,25%UIcopy,20%seedcut and503/501checkout; retain20/80subscription and15%session intent | Founder/qualified review and implementation gates |
| FIN-02 | Resolve allocation basis, tax, fees, eligibility, periods, refund/provider and cost proof | OPEN | DECISIONS.md:255-275; targets599/1199 are intent, not legal/provider/profit evidence | Founder/qualified review |
| SRC-01 | Verify and later repair missing participant check in video end | SOURCE_CONFIRMED; runtime NOT_RUN | BackEnd/routes/videoRoutes.js:133-145; mounted BackEnd/server.js:722; authenticated caller supplies another callId and handler has no participant predicate | Implementation gate |
| SRC-02 | Reconcile LinkedIn OAuth callback user shape | SOURCE_CONFIRMED; runtime NOT_RUN | BackEnd/config/passport.js:87-88 passes findOrCreateUser wrapper; routes/oauthRoutes.js:28-36 expects user document | Implementation gate |
| SRC-03 | Verify role-refresh path exception against router-relative req.path | SOURCE_MISMATCH; runtime NOT_RUN | middleware/auth.js:73-75 expects /user/roles or /api/user/roles; routes/userRoutes.js:36 mounted /api/user at server:719 | Implementation gate |
| SRC-04 | Restrict client XP authority and make awards recoverable | SOURCE_CONFIRMED; runtime NOT_RUN | gameologyController.js:115-120 forwards metadata; gameologyService.js:205-207 accepts xpOverride; mounted server:732, route/award authenticated only | Implementation gate |
| SRC-05 | Recover session completion if payout fails after status save | SOURCE_CONFIRMED failure ordering; injected failure NOT_RUN | sessionsController.js:428-443 saves completed/released then payout; retry rejected by terminal state | Implementation gate |
| SRC-06 | Make webhook deduplication survive interrupted dispatch | SOURCE_CONFIRMED failure ordering; injected failure NOT_RUN | sessionsController.js:563-597 inserts dedupe before updates; retry acknowledges duplicate without dispatch | Implementation gate |
| SRC-07 | Reconcile tax-exclusive period gross with splitTax | SOURCE_CONFIRMED arithmetic path; runtime NOT_RUN | billingPlans.js:108-117 computes gross+tax;131-145 discards computedgross; source paid seeds currently taxinclusive | Implementation gate / accounting review |
| SRC-08 | Reconcile two independent demand systems and advertised wave ranking | SOURCE_CONFIRMED | courseRequestController.js:89labels50claimeligible but116permits25; signalFlareService.js:7threshold5,105-132ranks topic/genre coverage and sends top40, not confidence-rated staged waves | Design/implementation gates |
| SRC-09 | Review failed notification cooldown and request completion recovery | SOURCE_CONFIRMED localordering; runtime NOT_RUN | signalFlareService.js:134-151 suppresses senderrors then stamps14daycooldown | Implementation gate |
| SRC-10 | Repair learner quiz transport and server-authoritative grading integration | SOURCE_CONFIRMED; runtime NOT_RUN | CoachQuiz.jsx:47,65-86;CourseLearn.jsx:289-294;courseController.js:82-90,951-952 | Implementation gate; do not expose answer keys |
| SRC-11 | Unify actual course access/completion with approved subscription/prerequisite rules | SOURCE_CONFIRMED disconnect; policy remains gated | courseController.js:539-555,793-825,1141-1145 versusbillingRoutes.js:137-147 | Founder policy and implementation gate |
| SRC-12 | Fail closed on missing production payment credentials and truthful payout state | SOURCE_CONFIRMED; actualconfiguration unread | payment/index.js:35-44,100-102,158-165 | Implementation/provider gates |
| SRC-13 | Correct paid-room cleanup authentication | SOURCE_CONFIRMED; runtime NOT_RUN | OrbitSessionRoom.jsx:69-73 headerlessbeacon versus bearer-authcompletionroute | Implementation gate |
| SRC-14 | Preserve retake footage truth, Board convergence and notification catch-up limits | SOURCE_CONFIRMED boundaries; runtime NOT_RUN | PROJECT_BRIEF.md studio/Board/notification rows and per-fileledger | Design/implementation gates |

## Newly observed document issues, not reproduced application defects
- Old milestone Done and AI-mount claims are contradicted by current server/routes and checkout source; see PROJECT_BRIEF and DRIFT.
- v2Signal Flare accept pseudocode versus promised no_change behavior, and excused review outcome mapping, need document reconciliation.
- v2Mentor decision register calls category caps rates; preserve actual numeric distinctions rather than changing rewards.
- v2Student cohort comparisons use issued points affected by prior credit and global-cap arrival order; fairness policy remains open.
- Pitch planning slide03 header contains an encoding artifact while its current HTML title is clean. Side-only review, no edit here.
- Historical v2 master-plan correction notes may already be addressed in companion files. Reconcile before counting them as current gaps.

## Complete per-file follow-up ledger
[source-observations.ndjson](source-observations.ndjson) retains690per-file nonempty application/script/test/Android/marketing risk or limitation records from the module digests, with file, digest-line pointer, status, owner and required gate. It includes hypotheses, missing tests, policy holds and operational caveats, not that many proven bugs. The high-priority SRC rows above are a subset, not a waiver of the rest. No observation is silently discarded or marked fixed by indexing.

No historical test, source count, scenario or reviewer claim in this ledger is a fresh runtime result. Confirm source observations before repairs; application implementation remains gated, and recovery-tool fixes additionally require TOOLING OK.
