# Legacy design document digest
Batch docs-design-001; 10 files fully read by returned workflow whm8t8eo4, then digest reviewed by main. Document claims only; source/runtime/external validation NOT_RUN.
path | lines | role | main ideas | depends on | risks / status
--- | ---: | --- | --- | --- | ---
docs/design/00-art-direction.md | 42 | Legacy observatory art direction | Palette, PBR, 3D/2D topology parity | Shared tokens, R3F, SVG | Historical solar framing is superseded for Student/Mentor; no current naming approval or rendered contrast proof. | READ:FULL
docs/design/01-design-tokens.md | 39 | Legacy token proposals | Typography, 4px scale, glass, motion, reduced motion | Tailwind, Motion, R3F | Hardcoded slate versus all-token QA; secondary color undefined; large versus medium blur inconsistency. | READ:FULL
docs/design/02-icon-and-badge-system.md | 32 | Vector icon grammar | Lucide/custom24px SVG, chevrons/shields/coins/streaks | currentColor, gold gradient | Orbit Credits is historical, not selected; accessibility contracts incomplete. | READ:FULL
docs/design/03-3d-world-spec.md | 24 | Finite course scene proposal | Deterministic planets/eight archetypes, stations, mastery boss, spline shuttle | Three/R3F, OrbitControls | No reorder-safe progress remapping despite research attribution; newer foundation absent. | READ:FULL
docs/design/04-ui-screens-spec.md | 28 | Legacy eight-screen inventory | Course/player/quiz/ceremony/mentor/billing/profile | Course and billing flows | Historical labels/tiers; current identity mapping and distinct session economics not specified. | READ:FULL
docs/design/05-performance-and-quality-tiers.md | 25 | Performance targets | Ultra/High60fps, Medium30fps, LowSVG, disposal/lazy loading | R3F, postprocessing, SVG | Targets unmeasured; Medium bloom conflicts with tooling Ultra/High-only; DPR/adaptation incomplete. | READ:FULL
docs/design/06-design-qa-checklist.md | 23 | Unchecked acceptance list | Tokens, fallback, motion, keyboard, AI review, errors/tests | Design specs and future device/test evidence | All13checks unchecked; fixed625/35test counts are stale expectations. | READ:FULL
docs/design/07-look-dev-lab-spec.md | 56 | Seven internal labs | Star/planet/shuttle/station/UI/FX/accessibility, Leva/captures | DEV routes, fixtures | Four planet archetypes versus eight in world spec; no current capture/commit authority. | READ:FULL
docs/design/research-log.md | 50 | Historical21-entry evidence ledger | VERIFIED/LEAD/BLOCKED classification; five debts | External references and intended consumers | Companion-spec attribution overstates DPR/contrast/remapping coverage; no external revalidation. | READ:FULL
docs/design/tooling.md | 74 | Dated setup and capability record | WebGLRenderer, lazy3D, one2Dmotion system | Three/Fiber/Drei/Motion/Playwright/axe | Pending-install heading conflicts with installed rows; software rendering not device proof. | READ:FULL

## Document drift candidates
- docs/design/05-performance-and-quality-tiers.md:15 versus docs/design/tooling.md:50: Medium bloom versus Ultra/High-only postprocessing.
- docs/design/research-log.md:25,27,36: cited companion specs do not contain the attributed full contracts.
- docs/design/research-log.md:29,48: ledger-signature assurance coexists with unresolved current signature verification.
These are returned document observations; final DRIFT will separate historical proposals from current defects.





