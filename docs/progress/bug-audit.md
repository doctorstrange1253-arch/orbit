# F7 verified bug follow-up

Date: 2026-11-05. Scope: journey, rendering and visual QA at baseline commit `25c40e0`. Workflow `wf_85dd8c43-8a6` completed both reviews and independent verification. Findings below survived verification; this is not a complete security, payment or product audit. No application fix was made by reviewers.

| ID | Severity | Evidence | Failure and corrective action | Effort | Blocks | Status |
|---|---|---|---|---|---|---|
| J01 | High | FrontEnd/src/cosmic/PlanetGenerator.jsx:63-66 | Signed shifts turn valid unsigned seeds into negative or zero planet sizes. Keep unsigned arithmetic and regression-test real ObjectIds and finite geometry. | S | Valid journey rendering | Fixed; three new ID/range regressions pass |
| J02 | High | FrontEnd/src/cosmic/CourseSpaceJourneyWorld.jsx:162-165; FrontEnd/src/pages/CourseLearn.jsx:224 | Selection navigates synchronously and unmounts the shuttle before flight. Navigate on arrival; cover retarget, cancel, remount and reduced motion. | M | Learning journey | Fixed; router arrival/cancellation regressions pass |
| J03 | Medium | FrontEnd/src/cosmic/CourseSpaceJourneyWorld.jsx:280; FrontEnd/src/hooks/useQualityTier.js:21-42 | 3D toggle can override missing WebGL and reach the app error boundary. Separate capability from preference and provide local renderer recovery. | M | Accessible fallback | Fixed; null, throwing and failed renderer regressions pass |
| J04 | Medium | FrontEnd/src/cosmic/CourseSpaceJourneyWorld.jsx:159,185-189 | Camera target ref is never assigned. Publish the shuttle pose and give only one controller camera ownership during flight. | M | Cinematic travel | Pose wiring and damping fixed; unit tests pass, real-route browser check pending |
| J05 | Medium | FrontEnd/src/cosmic/Shuttle.jsx:87; FrontEnd/src/cosmic/CourseSpaceJourneyWorld.jsx:185 | Initial parking omits world position and always chooses the first lesson. Initialize beside the selected lesson. | S | Deep links and resume | Fixed; selected-lesson parking regression passes |
| J06 | Medium | FrontEnd/src/cosmic/CourseSpaceJourneyWorld.jsx:243 | Reduced-motion preference is read once. Subscribe to changes and stop all related motion; preserve deliberate 2D preference. | M | Accessibility | Fixed; live change and listener-cleanup regressions pass |
| R01 | Medium | FrontEnd/src/cosmic/shaders/planet.vert.glsl:11; planet.frag.glsl:72-74 | View-space normals are mixed with world-space lighting. Use a consistent coordinate system and verify camera-independent diffuse illumination. | S | Lighting correctness | Fixed; actual WebGL pixel regression failed at 180, then passed after correction |
| R02 | Medium | FrontEnd/src/cosmic/PlanetSurface.jsx:94,115 | Replaced imperative geometry has no disposal owner. Test replacement and unmount lifecycle, then GPU resource counts. | M | Memory budget | Disposal fixed and lifecycle-tested; real GPU cycling remains to measure |
| R03 | Medium | FrontEnd/src/cosmic/PlanetSurface.jsx:44-58 | Dividing permutation values by 255 collapses bitwise gradient selection. Preserve integer permutation entries and test cross-seed diversity. | S | Procedural variation | Fixed; cross-seed regression passed |
| Q01 | High | FrontEnd/src/cosmic/LookDevLab.jsx:156-176 | Expanded fixed Leva panel and fixed header padding obscure mobile tabs. Reflow controls and test actual pointer/keyboard reachability at all four widths. | M | Mobile QA | Fixed; all four viewport interaction checks passed across two runs; full-panel axe passes |
| Q02 | Medium | FrontEnd/src/App.jsx:143; FrontEnd/dist/sw.js | Unconditional lazy import emits dev Lab/tooling into production and PWA precache. Gate the import itself and validate a fresh production build. | S | Bundle budget | Fixed; fresh build and scan of 110 emitted JS files plus sw.js found no Lab code or precache entry |
| Q03 | High | FrontEnd/tests/e2e/planet.spec.js:27-40; station.spec.js:19-32 | Capture tests can pass without selecting the requested variant and miss console shader errors. Require selection, renderer readiness and error-free render; check travel behavior, not only screenshots. | M | Verification trust | Selection and shader diagnostics hardened; two representative captures pass. Exhaustive motion/visual comparisons remain |

## Reproductions recorded by verification

- J01: course `000000000000000000000001`, lesson `000000000000000000000221` produced zero size and non-finite geometry. Lesson `000000000000000000000006` produced negative size.
- J02: real React/router lifecycle with a mocked Canvas recorded navigation and scene unmount before any flight frame advanced.
- R01: at fixed object/light transforms, changing camera angle changed diffuse N dot L from 1 to approximately 0.
- R02: real R3F reconciliation with a no-op renderer did not dispose geometry passed through the mesh property on replacement.
- R03: fixed-coordinate samples matched across two seeds because fractional permutation entries truncated to almost all zero gradients.
- Q02: independently recovered production build exited 0 and emitted LookDevLab at about 140 KB gzip; the build artifact is evidence, not an approval of its budget.

## Limits and related verification

The reviewers used current-source and in-memory reproductions plus existing screenshots; they did not claim an authenticated end-to-end run or real-device GPU performance. Frontend baseline passes 81 unit tests, but that does not refute these untested paths. Backend passes 625 tests on the one-worker rerun; an earlier local MongoMemoryServer startup timeout is retained in `.agent/STATE.md`. The hosted database's paused status is separate.

The all-site emoji guard and full lint still fail. Those gates must not be excluded or reported as passed. Current renderer/browser work and fixes will be recorded per issue below before the milestone can be accepted.
