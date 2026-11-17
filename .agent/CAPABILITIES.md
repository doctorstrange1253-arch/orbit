# CAPABILITIES

Version1.0 bootstrap,2026-11-12. Status is scoped evidence, not a universal guarantee. New self-tests in progress under IW-C-MLOCK step2; retest only after environment change or an actual failure.

| Capability | Status | Actual evidence / workaround |
|---|---|---|
| OS/shell/repository | WORKS |2026-11-12Nodev24.21.0reportswin32; actual Bash ancestry through Git Bash to claude.exe; git branch/fullHEAD/status/diffexit0. Nested root D:/orbit-main/orbit-main |
| Dedicated read/write/edit | WORKS |Actual governing reads,MISSION104lines/RUN_JOURNAL creations and exact CLAUDE/STATE/ledger edits succeeded; metadata/first lines and12line pin checked |
| CRLF/encoding | PARTIAL |E142LF-only checker failed; normalize CRLF in validators, preserve source bytes. UTF8/current authored character checks pass; do not infer corruption from console encoding |
|300line chunked file | WORKS |Dedicated150line Write plus150new-line Edit;300ordered NDJSON values and syntax checked,1092bytes. Evidence scratch/iw-mission-20261112-gEXz4j/chunk-result.json |
| Web search | PARTIAL |Native self-test failed Responses upstream stream ended before a terminal event; no results. Switched method: Python-I-Bstandard-library MediaWikiHTTP200/two discovery titles at08:10:36UTC. Discovery is not claim evidence |
| Web fetch | WORKS |Opened official https://playwright.dev/docs/api/class-browsertype on2026-11-12; headless/loopback launchServer documentation returned; installed type declarations inspected before use |
| Image viewing | WORKS |Read browser-probe.png:640x480,7797bytes; visible heading,synthetic text,Activated button and blue WebGL rectangle. Not product visual acceptance |
| Headless screenshot | WORKS |Real Playwright/Chromium156.0.8078.4local fixture/button/capture; exit0/6.8s/empty stderr, browserPID2732/loopbackRPC59332both stopped/closed. Log iw-mission-browser-capability-1794471973350-575a4c83.log |
| WebGL/GPU | PARTIAL |WebGL2available,error0,readPixels[64,128,191,255]. ANGLE/SwiftShader: software-rendered, not representative. Real hardware/mobile performance NOT_RUN |
| Installation/network | WORKS_SCOPED |Official npm metadataHTTP200,is-number7.0.0MIT inspected; isolated --ignore-scripts/--no-save/--no-package-lock install exit0/7.2s,4real smoke cases pass at08:43:39UTC. Scratch only,0app bundle bytes; no project/global install |
| Subagents/workflows | PARTIAL_RETAINED_RESULTS |Naming/course/journey retain2/1/6returns;old scratch-writing runs stopped for single-writer rule. Naming options retain6family/critique returns;comparison stopped,supervisorreviewfailed504/0returns. Read-only pending inventorywu52mlo0c launched, actual report pending. Previous writer8396confirmeddead14:00UTC;currenthost2928 acquired14:03UTC. Missing-stage launches still pending;no recovered result/quota repair or gate approval inferred |
| MCP | WORKS_SCOPED |VSCode diagnostics returned the requested run.js URI with empty diagnostics. This proves the tool call, not compiler coverage or all-file correctness; no MCP installation |
| Native memory | PARTIAL |Persistent file-memory pointer written and indexed; no dedicated native memory tool exposed |
| Output limits | PARTIAL |16272byte104line mission written/verified. This is an observed lower bound, not a maximum. Write chunks<=150lines; large tool output can be truncated/persisted |
| Context behavior | PARTIAL |Actual prior compaction summaries/model switches require file reload; exact limit/retention cannot be experimentally guaranteed from this turn. Mission/state/handoff/journal are authority |
| Command supervisor | PARTIAL_KNOWN_SAFETY_GAPS |Historical99suite/20supervisor cases and3stdin cases passed in their earlier scopes. Existing source-only reviewer returned10claims;8original regressions reproduced then individuallyGREEN. Saved reviewerw5avc2c00failed504/0returns,not pending. Updated combined suite and corrected independent review NOT_RUN; anonymous legacy checkpoint compatibility, surviving descendants and asynchronous log-I/O remain unclosed. Hooks/launcher must not be activated; existingrun.jsunchanged |
| Recovery lifecycle hooks | WORKS_LOCAL_NOT_INSTALLED |recovery-hooks.js and8isolated synthetic-event/CLI tests pass,exit0/7.4s at iw-recovery-hooks-green-1794481493413-100c951c.log;syntax/metadata verified11:06:43UTC. No settings installation,real host firing,race certification or automatic session takeover proof |
| Agent relaunch | WORKS_LOCAL_INTEGRATION_PENDING |Exact-session launcher API18synthetic-childtests pass,exit0/68.3s,log iw-relaunch-green-attempt-1794485286145-26678bf1.log;syntax/metadata verified12:11:43UTC. Boundedstdin3testsGREEN. CLIentry,normal-stop/receipt edges,hosttakeover andindependentreview remain pending;no real model call,configurationactivation or deadVSCode resurrection |

No application runtime acceptance, real device performance, live services, member data, credentials or paid model calls are part of these capability probes. Detailed evidence paths/results will replace pending cells after actual tests.
