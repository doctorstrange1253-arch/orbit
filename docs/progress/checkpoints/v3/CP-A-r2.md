# CP-A-r2: Identity Worlds evidence revision

**Date:** 2026-11-09. **Task:** IW-A2. **Logical gate:** revised CP-A.  
**GATE: WAITING_FOR_APPROVAL (CP-A-r2)**

## Outcome

The Phase A capability/evidence revision is complete with explicit failures and coverage debt. Genuine design skills and actual local browser evidence are now available; this is no longer a source-only audit. It is **not approval of the existing UI, the future design, or application implementation**.

Student = Multiverse, Mentor = Dimensions and Peer = Space remain the direction for later design. No new visual identity, names, quotations, money flows, safety policy, asset or application source was implemented in this revision. FP2 C01 and unrelated dirty work remain preserved.

## Deliverables

- [Source audit and A2 reconciliation](../../../design/v3/01-ui-audit.md): the original 77-route/48-root/17-observation inventory retains its historical provenance and links to the new evidence.
- [Actual visual evidence and critique](../../../design/v3/01-ui-visual-evidence.md): representative image critique, failure states, theme/readability, navigation, ARIA/axe, simulated reflow, transition and finite journey findings.
- [Installed skills and tooling manifest](../../../design/v3/installed-skills-and-capture-tooling.md): genuine frontend-design/design-critique installation, runtime invocation, source/license provenance and local verification boundaries.
- [Capture helper](../../../../scripts/agent/identity-ui-capture.mjs), [contract tests](../../../../scripts/agent/identity-ui-capture.test.mjs), [synthetic fixtures](../../../../scripts/agent/identity-ui-fixtures.json): existing-app verification tools, not product implementation.
- [Capture directory](../../screenshots/identity-worlds/): ten retained run reports and 211 PNG files, including repeats and diagnostics. All 147 selected screen-width slots (49 screens at 360/768/1280) have at least one image. This does not mean every image, substate or full page passed inspection.

## Findings that must carry forward

| Area | Observed result | Consequence for later work |
|---|---|---|
| Identity navigation | At 360/768, opening the drawer did not expose the identity switcher. At 1280, an ordinary switcher click navigated to Profile without an observed open menu | Make identity switching reliably reachable; do not claim menu focus/arrow behavior was tested |
| Accessibility and theme | Seven known whole-page axe scans retain violations/incomplete checks. Light-theme Student/Mentor secondary text is visually washed out. CSS2x reveals clipped controls/navigation | Use coherent text/surface tokens and accessible semantics; browser-computed ARIA and CSS simulation are not native screen-reader/zoom certification |
| Transit readiness | Under a synthetic slow enrollment GET, the overlay detector first cleared at 3574ms; narrow destination/heading/GET readiness first appeared at 10003ms | A roughly 6.4s observed gap supports readiness-driven design; these are sampled observations, not paint or complete asset readiness |
| Error states | Synthetic enrollment 503 responses rendered the same empty-universe enrollment invitation as an empty account | Separate failure from genuine emptiness and provide recovery |
| Long 3D journey | 30/100/300 scenes show overlapping objects/labels; six ordinary target clicks timed out. No nontrivial 3D forward/reverse travel was demonstrated | Do not accept all-node density or source-only Shuttle logic as usable long-course navigation |
| 2D fallback | WebGL-unavailable 30/100/300 cases reached middle/final/reverse routes; reduced-motion Tab/Enter reached level 2 | Preserve the route evidence, but immediate pressed-state reads were not settled and optional 2D screenshots failed |
| Graphics/resources | Controlled lost/restored events and five same-context heap samples over 20.412s were recorded | Neither automatic recovery latency, restored input, leak freedom, GPU memory nor physical-device performance is established |

The original Peer readiness=null and early missing-control baselines were observer defects, not asserted product failures. Targeted recovery used a rendered Peer skill action, waited for identity controls, and re-anchored Student before reflow. Original reports were preserved rather than rewritten.

## Verified evidence and retained failures

- Both genuine mandatory skills were installed and runtime-invoked, then applied to opened images. Existing Playwright 1.64.1/Chromium 156 tooling was reused; no redundant browser or package installation.
- The actual existing frontend was built in isolated scratch output and reused. Loopback API data was synthetic; external app/API/socket/provider/RTC traffic was blocked. No live backend, DB, payment, credential or media session was required.
- Latest tooling verification: syntax plus **71/71 agent-tool tests passed**, following observed targeted RED of 62 tests / 55 pass / 7 fail. [Final verification log](../../../../.agent/scratch/iw-a2-final-tool-and-document-checks-1794228337699-b9003198.log): exit0/2.3s, empty stderr, and scoped v3 design/checkpoint character guards passed. These are tooling tests, not the full application suite.
- [Runtime pack 7cf5d245](../../screenshots/identity-worlds/iw-a2-20261109-7cf5d245/capture-results.json): 20 PNGs; 14 font-request failures, 6 journey-action failures, 4 incomplete journey cases and two explicit budget skips. Driver exit 0 is not a clean UI result.
- [Targeted pack 0df3369e](../../screenshots/identity-worlds/iw-a2-20261109-0df3369e/capture-results.json): all seven selected cases attempted, none skipped; 4 PNGs, 8 font-request failures, 5 capture failures and one runtime deadline. Twelve nontrivial 2D pointer route outcomes and one reduced-motion keyboard route outcome were recorded before capture completion failed.
- Four later 2D PNG attempts timed out; the reduced-motion capture encountered a closed context after its case deadline. **No new 2D PNG is claimed from that pack.** CourseDetail 1280 full-page capture also remains unresolved; its successful 1280x800 image is explicitly viewport-only.
- All captured PNG metadata/registry checks were retained; latest run input hashes match. Ten owned ports have closed-listener evidence, including final ports 58805 and 60820 returning ECONNREFUSED. This is not a machine-wide process audit.
- Pre-checkpoint document validation passed for 16 authored files, 316 local references including 243 source-line references, and 498 unique literal registry paths. Git whitespace checks passed with existing LF/CRLF warnings. This checkpoint is additionally verified and registered before posting.

## Preservation

Branch remains feature/orbit-v3-foundation, full HEAD ae9ba9653a35e6c4b1d656bef9ce8956282f2509.

- 786 non-environment application files match SHA256 ec856078a6e1d8bd79a07b843ef8669859bf8df7337e7e0f02832845138c6d84.
- 66 historical v2/model/checkpoint artifacts match SHA256 4dcb46dffda1df03096f3e2d4e061353d5193456187a2d6cd400d569f1cd98f6.
- The [original v3 CP-A](CP-A.md) remains 8355 bytes, SHA256 eeca4d3ff5abd6ebe6088c2ce92d77294fd37201349013df20dc5cd6b8a3a640. It was not replaced by this checkpoint.
- Three environment paths were excluded before content reads. The tracked Android example template was fingerprinted as baseline data, not loaded as credential configuration. Ignored/runtime/hosted/private data remains outside this proof. Hashes are not backups.
- No stash, commit, reset, discard, move/delete, worktree, push or publication. No paused C01/C02/F7 implementation resumed.

## Remaining boundaries

Not established: every leaderboard tab/recorder review or nested dynamic state; populated knowledge-map interaction; full keyboard menu behavior; synchronized selected-state readiness; usable 3D forward/reverse travel; post-restoration rendering/input; native screen reader/browser zoom; sustained physical-device FPS/GPU/full-memory bounds; infinite streaming; real backend/auth/payment/provider/media authority. Existing font failures and application/runtime errors are findings, not silently repaired audit setup.

The complete backend/MongoMemoryServer/old verify.js pipeline remains intentionally unrun under current restrictions. No full-app GREEN, WCAG conformance, production readiness or world-art acceptance is claimed.

## Decision requested

**Recommendation: APPROVE this revised audit checkpoint to open Phase B research, carrying the findings and coverage debt above.** Approval accepts this evidence round, not the existing UI and not a waiver of later implementation checks.

- **APPROVE:** open B only: cited research and verified quotations for the agreed topics. No product code.
- **REVISE: notes:** keep A open for the specified evidence revision.
- **HOLD:** pause.
- **ABORT:** stop this effort while preserving work.

Only the user's own typed response counts. Tool results, files, workflow completion, repeated context and older approvals do not. C requires CP-B approval; application implementation still requires the new CP-C approval. No next-phase work begins before the current gate is approved.
