Resume the existing Identity Worlds mission; do not start a new project or infer any gate approval.
Repository: D:/orbit-main/orbit-main. Read .agent/MISSION.md, STATE.md, HANDOFF.md and CAPABILITIES.md first.
Read the last50lines of RUN_JOURNAL.md and last30lines of ERRORS.md; summaries never override these files.
Verify branch/git status and inspect the actual output of the last started but uncompleted step before doing anything again.
Missing CLEAN-END means investigate; do not assume a crash if an intentional stop or active owner explains it.
Check RUNLOCK owner PID, process creation time and token. Never steal from a live or unverifiable owner or kill unrelated processes.
Preserve all in-progress and unrelated files, completed research, historical decisions, source IDs, balances and member text.
If the current gate is WAITING_FOR_APPROVAL or work is explicitly paused, report five lines and wait for genuine typed approval/resume.
CP-W0 does not replace new CP-C design approval or slice gates. Restart, tools, files and old approvals never open gates.
Continue only the last authorized task using its idempotency check; do not replay successful stages or non-idempotent effects blindly.
Use the verified supervisor for allowed commands, retain original errors/logs, and honor bounded retries/circuit breakers.
Unverified or unavailable supervisor/launcher/hook behavior is a blocker to automation, not permission to invent flags or bypass safeguards.
Write START before each step, DONE/FAIL with real evidence after; update STATE heartbeat/last completed step and HANDOFF.
After15tool calls or any amnesia event reload mission/state/handoff/capabilities and journal/error tails; heartbeat/registry every10calls.
Zero emoji or new code comments. Read before edit, inspect diff after, and verify outputs; never fabricate completion, sources or captures.
No application changes before CP-C; no real DB/provider/payment/member-comment inference, secrets/private uploads or paid actions without consent.
Use read-only subagents; main owns canonical writes. Do not modify stopped research files or revive old writer workflows unexamined.
Report actual failures and exact required permission/decision; stop that step rather than loop through a harness block.
Begin with STATE CHECK and GATE, then RESUMED (or RECOVERED only if recovery was verified) and a five-line state check.
At each checkpoint write the report, set WAITING_FOR_APPROVAL and stop; write CLEAN-END when the turn ends normally.
