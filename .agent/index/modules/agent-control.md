# Agent control digest
Current batch only. Full reads noted explicitly; large historical logs remain bounded by user instruction. Source counts are measured at the initial indexing snapshot and can grow with authorized bookkeeping.
path | lines | read scope | role / main ideas | depends on | risks / status
--- | ---: | --- | --- | --- | ---
.agent/CAPABILITIES.md | 26 | full1-26 | Historical tool self-tests; distinguishes software rendering,localfixtures and uninstalledhooks | ENVIRONMENT,journal,tooling logs | Research counts and supervisor/hook counts stale; no new tests or universal recovery proof. | READ:FULL
.agent/ENVIRONMENT.md | 225 | full1-200,201-225 | Machine/path facts plus dated A/B/C/FP2/setup/test evidence | Tool logs,packages,commands | Dense history; original no-rg/missingPDF notes superseded; current versions not all re-probed. | READ:FULL
.agent/MISSION.md | 112 | full1-112 | v1.4mission,locked worlds/foundation/cinematicdefault,economics,gates,quality | DECISIONS/STATE/HANDOFF/designs | Status/next-step at93-94stale; current prompt blocksM1untilCP-IDX andM4untilTOOLING OK. Preserve mission unchanged. | READ:FULL
.agent/PATHS.md | 160 | full original1-157 plus current authoredappend | Canonical directories and dated exceptions | Registry/DECISIONS/user approvals | Old path permission statements historical; newindexcontract explicit; snapshots immutable. | READ:FULL
.agent/RESUME_MAIN.md | 32 | authored and metadata verified | Current bounded recovery pointer | Index/progress,currentlock/gates | Living record; update every25calls; no completion until coverage verified. | READ:FULL
.agent/RESUME_PROMPT.md | 20 | full1-20 | Historical gate-preserving restart prompt | Mission/state/lock/supervisor | Reads/fullreloadcadence superseded by current bounded25-call instructions; does not activate recovery. | READ:FULL
.agent/RUNLOCK | 8 | originalfull and acquiredwrite verified | Current writer host11176/start10:49:42.6085400Z | supervisor-state.acquire/identity | Recheck before writing; old4312confirmeddead,archived; no liveowner takeover. | READ:FULL
.agent/TASKS.md | 141 | full1-141 | Task history including pausedF7/FP2,activeCdesign/research/tooling | Plans,receipts,checkpoints | Many RUNNING/checkbox/testcount claims stale; modern approvals not inferred from old tasks. | READ:FULL
.agent/STATE.md | 197 | head1-40 only | Historical parking/currentCgate and stale running statuses | Mission,snapshot,side state | Protected partial read; current authority is user Steps1-3; no rewrite. | READ:BOUNDED
.agent/HANDOFF.md | 295 | head1-40 only | Historical recovery and retained workflow pointers | Mission/journals/scratch | Protected partial read; owner/researchstatuses stale; not resumedtranscript. | READ:BOUNDED
.agent/ERRORS.md | 190 | head1-12,tail30 plus IDX-E01 | Failure/cause/alternative ledger | Real logs/commands | Protected partial read; currenttasklist pathconversion resolved once; historical failures not retested. | READ:BOUNDED
.agent/FILE_REGISTRY.md | 793 | head1-40,tail8 | Literalpath registry; metadata not featureproof | Createdfiles/task/evidence records | Protected partial read; historicalhashes/owner/counts stale; newindexfiles queuedforbatchregistration. | READ:BOUNDED
.agent/RUN_JOURNAL.md | 141 | head1-10,tail30 | START/DONE/FAIL/CLEAN-END ledger | Actualsteps/lease | Protected partial read; unmatchedSTART not automaticcrash; currentfresh-indexSTART logged. | READ:BOUNDED

.agent/DECISIONS.md | 556 | full in six bounded parts1-100,101-200,201-300,301-380,381-470,471-553 | Exact user decisions and historical approvals, reversals, money intent and technical rulings | Mission/plans/real evidence | Currentworld/foundation/default supersede older direction; names unselected; price/Core/Premium intent does not prove accounting/provider policy; no current application permission. | READ:FULL

.agent/SESSION_LOG.md | 570 | full in bounded parts; main1-440, returned reader441-569 | Historical task, evidence, failure, capture and gate chronology from November4-15 | Plans, actual command logs, workflow returns, side records | Synthetic captures are not traction; historical tests not rerun; old launch/status/owner claims are stale. Tail reader stopped before seven progress files because combined input exceeded80KB; those remain unread. | READ:FULL

All15eligible control files now have assigned-depth digests. Protected histories retain only the stated head/tail coverage; no full-history completion claimed.
Current side state read for Step1: TBI-GEU G1 WAITING_FOR_APPROVAL, latestDeck_v4, stronger than digestST-3unfinished claim. Side full module remains pending title/status inventory and protected snapshot slices.





