# Identity Worlds: actual existing-UI evidence and critique

**Date:** 2026-11-09. **Task:** IW-A2, Phase A evidence revision. **Status:** evidence round complete with retained failures and explicit limits. Approval boundary: [CP-A-r2](../../progress/checkpoints/v3/CP-A-r2.md), not design approval.

This report is for the founder and the designers/engineers preparing the later Identity Worlds redesign. It records the existing application, not a new Multiverse/Dimensions implementation. Student = Multiverse, Mentor = Dimensions and Peer = Space remain the approved direction for later gated design. No product code, art, quotations, identifiers, business rules or historical artifacts were changed to make these captures pass.

## 1. Evidence and authorization boundary

The genuine local setup directive reopened A evidence only. [Current rules](../../../CLAUDE.md#L42-L46), [source audit](01-ui-audit.md), [tool provenance and execution plan](installed-skills-and-capture-tooling.md), [capture helper](../../../scripts/agent/identity-ui-capture.mjs), [synthetic inputs](../../../scripts/agent/identity-ui-fixtures.json) and [contract tests](../../../scripts/agent/identity-ui-capture.test.mjs) are the reproducibility inputs.

- The real existing React/Vite frontend was compiled into an isolated scratch build. The original plugins/options were retained; FCM readiness and environment-file loading were bypassed in memory, with local API/socket bindings. Product config/dist/source/locks were not written.
- Owned servers bound only to 127.0.0.1 at fresh dynamic ports. Browser service workers were blocked. All API GETs were synthetic responses; non-GET mutations were rejected. Unknown endpoints returned explicit 501 and were recorded.
- External application/provider/user-content/RTC traffic was not forwarded. WebSockets were intercepted before pages and closed without connecting to a server. Only the exact owned local origin and inspected existing public font host/path requests were permitted.
- Synthetic accounts, learner progress, monetary values, division states and records are test data, not production identity/authorization, actual educational outcomes or financial-policy acceptance.
- Browser: installed Playwright 1.64.1 and headless Chromium 156.0.8078.4. Software WebGL uses SwiftShader. Default contexts request reduced motion, locale en-IN and sound/music off.
- Viewports: 360x740, 768x1024 and 1280x800 CSS pixels. Full-page PNG dimensions can be wider/taller than the viewport when the current document overflows; those dimensions are evidence, not responsive success.
- No human screen reader, physical mobile/GPU, real authentication/backend/DB/payment/provider/RTC or full-process-memory certification is implied. Screenshot existence and an exit-zero driver are not whole-application acceptance.

## 2. Preserved run ledger

| Run | Requested coverage | Actual result | Important limits |
|---|---|---|---|
| [iw-a2-20261108-be84ac1c](../../progress/screenshots/identity-worlds/iw-a2-20261108-be84ac1c/capture-results.json) | Initial smoke | Build succeeded; 0 images; terminal loader failure | Playwright/axe CommonJS export mismatch diagnosed from the real report, repaired test-first; original report/build preserved |
| [iw-a2-20261109-bc5341f4](../../progress/screenshots/identity-worlds/iw-a2-20261109-bc5341f4/capture-results.json) | Five existing screens x three widths | 15 valid PNGs, all intended routes, 0 pageerrors/crashes; 306.7s driver duration | Five full-page axe scans with violations; 15 recorded requests for one existing OpenSans URL returning 404; one missing synthetic honours endpoint |
| [iw-a2-20261109-35f63857](../../progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/capture-results.json) | Fourteen Mentor routes x three widths | 40/42 images; intended routes matched for all saved pages; 0 saved-page errors/crashes; 303.5s | Screenshot timeouts: Mentor Media at 360 and Mentor Sessions at 1280. Missing taxonomy/fp-rate fixtures. Requested 360px Apply/Hub images are 520px wide; Analytics is 429px wide |

The [Student/shared batch](../../progress/screenshots/identity-worlds/iw-a2-20261109-f1fc848e/capture-results.json) completed46/48 captures in447.3s, including successful retries for Mentor Media360 and Mentor Sessions1280. CourseDetail768/1280 screenshot attempts timed out. Courses displayed its error boundary at all three widths. The preserved [focused diagnostic](../../progress/screenshots/identity-worlds/iw-a2-20261109-739f2cce/capture-results.json) confirmed React31: synthetic category objects reached the option/select renderer, which expects string items. This was a fixture contract failure, not a product defect; actual service/backend consumers corroborated the correction. Private/public knowledge GET paths and empty stars/edges/clusters/path/meta shapes were separately corrected test-first.

The [remaining/recheck pack](../../progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/capture-results.json) completed59/60 in375.0s: sixteen remaining routes plus Courses/CourseDetail/private/public skill-map rechecks at all three widths. It recorded zero missing fixtures, saved-page crashes/pageerrors, requested-route mismatches or measured document-width overflow. All-width Courses rendered normally; skill maps showed explicitly empty synthetic knowledge states; CourseDetail768 recovered. Retained observations: sixty requests failing for the existing font URL, intentionally denied Peer calls socket400 console messages, and one CourseDetail1280 full-page screenshot timeout after fonts loaded. Zero pageerrors does not mean zero console errors.

The [focused viewport pack](../../progress/screenshots/identity-worlds/iw-a2-20261109-92da7547/capture-results.json) completed exit0/17.6s with one healthy CourseDetail1280x800 PNG of a4491px document. Its selection and screenshot explicitly say viewport-only, with pre-screenshot geometry retained. All49 selected screens have now been attempted at360/768/1280;147/147selected slots have at least one image,162PNG files including duplicates/diagnostic. This is NOT full-page coverage or runtime acceptance: CourseDetail1280 full-page evidence remains incomplete and its timeout root cause unclassified. Earlier failures and original boundary images remain preserved.

Owned ports64778/59217/60634/61678/62008/57745/65513/64853/58805 returned ECONNREFUSED on fresh probes after their respective runs. Browser/server finally cleanup and driver exits were observed; the probes establish that those listeners are closed, not a machine-wide absence of browser processes.

The [state/stress pack](../../progress/screenshots/identity-worlds/iw-a2-20261109-0c7f4bfb/capture-results.json) completed exit0/243.4s with25verified PNGs: six empty/failure/pending/locked/light states and one switcher attempt at each width, plus four1280px journey scenes. It retained25font-request failures and no missing fixtures. State/stress records have empty page-error arrays; the older switcher records have no page-error/crash field, so they are not counted as error-free. Total retained PNG files reached187.

The [runtime pack](../../progress/screenshots/identity-worlds/iw-a2-20261109-7cf5d245/capture-results.json) completed exit0/426.0s with20verified viewport-only PNGs,14font-request failures,6journey-action failures and4incomplete journey cases; no missing fixtures. All20byte/hash/dimension/registry records and input hashes matched. The declared420s observation budget ended at420093ms, explicitly skipping WebGL-unavailable and reduced-motion journey probes. Exit zero means the report was produced, not that actions passed. Total retained PNG files reached207 before the separately scoped recovery run;147/147selected screen-width slots still means some image, not every state or full-page coverage.

### First smoke image index

All fifteen first-smoke images were actually opened for visual inspection, not merely checked for PNG headers.

| Existing screen | 360 | 768 | 1280 | PNG heights in the same order |
|---|---|---|---|---|
| Student Universe | [image](../../progress/screenshots/identity-worlds/iw-a2-20261109-bc5341f4/student-universe-360.png) | [image](../../progress/screenshots/identity-worlds/iw-a2-20261109-bc5341f4/student-universe-768.png) | [image](../../progress/screenshots/identity-worlds/iw-a2-20261109-bc5341f4/student-universe-1280.png) | 1194 / 1032 / 1114 |
| Student Learning | [image](../../progress/screenshots/identity-worlds/iw-a2-20261109-bc5341f4/student-learning-360.png) | [image](../../progress/screenshots/identity-worlds/iw-a2-20261109-bc5341f4/student-learning-768.png) | [image](../../progress/screenshots/identity-worlds/iw-a2-20261109-bc5341f4/student-learning-1280.png) | 1438 / 1089 / 1170 |
| Student Certificates | [image](../../progress/screenshots/identity-worlds/iw-a2-20261109-bc5341f4/student-certificates-360.png) | [image](../../progress/screenshots/identity-worlds/iw-a2-20261109-bc5341f4/student-certificates-768.png) | [image](../../progress/screenshots/identity-worlds/iw-a2-20261109-bc5341f4/student-certificates-1280.png) | 937 / 1024 / 800 |
| Mentor Observatory | [image](../../progress/screenshots/identity-worlds/iw-a2-20261109-bc5341f4/mentor-observatory-360.png) | [image](../../progress/screenshots/identity-worlds/iw-a2-20261109-bc5341f4/mentor-observatory-768.png) | [image](../../progress/screenshots/identity-worlds/iw-a2-20261109-bc5341f4/mentor-observatory-1280.png) | 3036 / 2435 / 2720 |
| Peer Dashboard | [image](../../progress/screenshots/identity-worlds/iw-a2-20261109-bc5341f4/peer-dashboard-360.png) | [image](../../progress/screenshots/identity-worlds/iw-a2-20261109-bc5341f4/peer-dashboard-768.png) | [image](../../progress/screenshots/identity-worlds/iw-a2-20261109-bc5341f4/peer-dashboard-1280.png) | 1722 / 1463 / 1600 |

## 3. Actual skill application

Both genuine frontend-design and design-critique skills were installed from pinned official sources and actually runtime-invoked earlier in A2. Their licenses, exact local adaptations and hashes are retained in the [tooling manifest](installed-skills-and-capture-tooling.md#installed-skills-actual-verification). Their continuing guidance was read and applied to real images here; setup was not repeated.

The critique follows first impression, usability, hierarchy, consistency and accessibility, acknowledges positives, and ranks three recommendations. Frontend-design informs intentional, subject-specific visual hierarchy rather than a generic reskin. New palettes, layouts, components and original art are deferred to Phase C/D; these recommendations are not approval to implement them. No visual score or external user-feedback evidence was invented.

## 4. Design critique: existing Student screens

### Overall impression

The warm orange/yellow headline dominates all three Student surfaces. The current learning purpose is legible, but Universe is still a small course-planet row inside a large bordered field rather than evidence of the requested Multiverse. Learning and Certificates read as editorial ledgers with muted uppercase metadata.

### Usability

| Finding | Severity | Recommendation for the later design |
|---|---|---|
| Universe presents a clear next lesson and Resume action, but the completed synthetic planet is substantially brighter than the active one; titles truncate on every inspected width | Moderate | Make the next meaningful learning action and course identity readable without relying on brightness or a tiny truncated planet caption |
| Learning preserves separate In progress, Finished and Not started groups, but at 360px the course title wraps into a narrow column between thumbnail and CTA, with 9px-scale tracked metadata underneath | Moderate | Preserve those useful states while designing a mobile reading order that prioritizes course title, progress and action; do not adopt the current composition |
| Existing identity chip is visible in the desktop header but not in the closed 360/768px captures | Critical relative to the overhaul's always-reachable switcher requirement | Verify actual mobile menu/keyboard behavior before stating reachability; later design must make identity discoverability independent of a hidden desktop chip |

### Hierarchy and consistency

- First fixation: the oversized warm headline, then status/action or stat cards. The headlines are consistent across the three screens; this is a useful recognizable relationship, not a proposed final world system.
- Universe has substantial unused vertical field beneath three planets, even at 768/1280px. That space competes with the actionable course summary without adding inspected navigation or content.
- Learning's section names and progress bars provide a clear state grouping. Certificates exposes one synthetic earned record, its date and a View action.
- Dark ink, purple-tinted cards, thin rules and uppercase micro-labels span Student and Mentor, while the orange headline differs from Mentor's violet-blue hero. Color difference alone does not establish distinct worlds or an advanced scene system.

### Accessibility and positives

Axe found contrast and accessible-name defects in the exact nodes below; some contrast checks were incomplete. Readability concern is supported by real small-font measurements, not a whole-screen contrast guess. Touch-target compliance, mobile switcher reachability and screen-reader behavior are still unverified. Useful reusable logic includes clear progress groupings, next-lesson selection and an earned-certificate route; their existing visual compositions are not prescribed for reuse.

## 5. Design critique: existing Mentor Observatory

### Overall impression

The violet-blue Observatory hero and Live Mentor status identify the destination. The page then expands into Pact divisions, a signature sphere, learner constellation and a long weekly ranking roll. The work-oriented course links come after the competitive material, so the inspected hierarchy favors standing over teaching management.

| Finding | Severity | Recommendation for the later design |
|---|---|---|
| Six Pact division labels visibly crowd/overlap at 360px | Moderate | Design a bounded mobile progression treatment with readable labels; verify overflow rather than shrink text to conceal it |
| The twelve-row synthetic ranking roll consumes a large portion of the 3036px mobile page, before workshop links | Moderate | Reassess teaching actions versus competition in the later Dimensions hierarchy; retain actual data logic, not the current roll composition |
| Very small muted honours/ranking metadata fails measured contrast in the desktop scan | Critical accessibility issue | Build readable contrast/tokens and semantics into the approved design, with whole-panel verification rather than rule exclusions |

The recognizable mentor status, learner/course counts and teaching/workshop destinations are useful. The signature and learner-field metaphors are existing evidence, not original new Dimensions artwork. Honours totals in this first pack are fallback values because the synthetic endpoint was missing; they do not prove production honours or an empty real account.

## 6. Design critique: preserved Peer surface

The current Peer dashboard has a distinct cyan/editorial rhythm: personal greeting, weekly summary, Add Skill action, skill card, calendar strip and issue footer. Its existing product is protected, not a new redesign target in A2.

- Positive: the primary Add Skill control is prominent and the reading sequence is coherent at 768/1280px.
- Moderate: seven calendar cells are visibly crowded at 360px; treat that as current responsive evidence, not authority to overhaul Peer now.
- Critical accessibility observation: the desktop axe scan found one unnamed button and calendar/header accessible-name/landmark violations. These require later authorized correction or shared-shell work, not a hidden audit-time fix.
- The blank offered/wanted pills and zero displayed activity XP in the original pack are synthetic contract gaps. The helper was corrected to supply actual consumed skillOffered/skillWanted and xpAwarded fields; the original images are preserved and these are not asserted production data bugs.
- An existing editorial aphorism is visible. Capturing legacy copy does not verify attribution or supply the future quotation pool; real quotation verification belongs to B.

## 7. Full-page axe evidence, not compliance certification

The five first-smoke scans ran on the whole 1280px page. Counts are rule-node counts per page, not unique defects or a severity score. Exact selectors, failure summaries and incomplete checks are retained in the [machine report](../../progress/screenshots/identity-worlds/iw-a2-20261109-bc5341f4/capture-results.json).

| Screen | Retained violation rules and node counts |
|---|---|
| Student Universe | color-contrast 3; label-content-name-mismatch 6; nested-interactive 1; region 1 |
| Student Learning | color-contrast 2; label-content-name-mismatch 3; nested-interactive 1; region 1 |
| Student Certificates | label-content-name-mismatch 3; nested-interactive 1; region 1 |
| Mentor Observatory | color-contrast 20; label-content-name-mismatch 3; nested-interactive 1; region 1 |
| Peer Dashboard | button-name 1; label-content-name-mismatch 11; landmark-banner-is-top-level 1; landmark-no-duplicate-banner 1; landmark-unique 1; nested-interactive 1; region 1 |

Concrete measured examples:

1. Universe planet-caption percentage labels: approximately 9px normal text, foreground #6a6b70 over #060810, measured 3.76:1 versus the scan's expected 4.5:1.
2. Learning touched-date metadata: approximately 9.28px bold text, #66676c over #060810, measured 3.54:1 versus 4.5:1.
3. Mentor honours metadata: approximately 8.96px bold text, #2e3036 over #060810, measured 1.51:1 versus 4.5:1; multiple ranking links measured 3.54:1.
4. Shared header targets include the Photons link, desktop role control and an SVG with focusable descendants. The latter is the nested-interactive result, not a fabricated nested role-button diagnosis.
5. Peer targets include calendar day buttons, a button matched by .p-1.5, duplicate/nested banner landmarks, and shared header/Canvas issues. The unnamed button's exact semantic purpose has not yet been reproduced by interaction.

Every page retained incomplete color-contrast checks. Learning also retained an incomplete aria-prohibited-attr check. No troublesome rule or panel was removed to manufacture a pass. Axe cannot certify keyboard, voice input, assistive technology, WebGL content, every rendered gradient or full WCAG conformance.

## 8. Synthetic contract corrections and retained failures

| Synthetic gap | Inspected consumer | Tooling-only correction |
|---|---|---|
| Missing honours GET | [HonoursStrip:28-36](../../../FrontEnd/src/components/mentor/HonoursStrip.jsx#L28-L36) | Explicit totals/byTier/items/canHonourToday empty response |
| Offered/wanted skill labels absent | [SkillCard](../../../FrontEnd/src/components/skills/SkillCard.jsx) | Added synthetic labels without changing product data |
| Flat Orbit streak, missing freeze/milestones | [Orbit:85-93](../../../FrontEnd/src/pages/Orbit.jsx#L85-L93) | Nested streak/freeze and explicit empty milestones |
| Missing league metadata and actual duel path | [LeaguePanel:49-66](../../../FrontEnd/src/cosmic/LeaguePanel.jsx#L49-L66), [useDuels:7-13](../../../FrontEnd/src/cosmic/useDuels.js#L7-L13) | Explicit synthetic empty division/standings and /orbit/duels/me response; existing backend labels/constants, not a migration |
| Achievement title and history XP fields absent | [Gameology:146-155](../../../FrontEnd/src/pages/Gameology.jsx#L146-L155), [Gameology:190-202](../../../FrontEnd/src/pages/Gameology.jsx#L190-L202) | Derived title from original name and xpAwarded from original xp |
| Positive streak had no activity date | [useStreak:15-28](../../../FrontEnd/src/hooks/useStreak.js#L15-L28) | Date derived from generated supplied lesson history; null for empty history |
| Shop descriptions/categories absent | [Shop:180-181](../../../FrontEnd/src/pages/Shop.jsx#L180-L181), [Shop:259-260](../../../FrontEnd/src/pages/Shop.jsx#L259-L260) | Derived hint and inspected identity/themes category mappings |
| Editor enrollment rows were learner summaries | [CourseEditor:348-378](../../../FrontEnd/src/pages/mentor/CourseEditor.jsx#L348-L378) | Enrollment fields derived from existing synthetic peers/course outcomes; interaction-only tab not claimed captured |

Tests were written and observed failing before correction. The first new rejection tests initially passed incorrectly by accepting a missing-function TypeError; an explicit function-existence precondition was added before implementation. Pinned fixture/selection RED was 29/38 passing, then 38/38 GREEN and 47 full tool tests GREEN. Six subsequent fixture tests produced 38/44 passing RED, then all 53 tool tests GREEN. These are tooling contracts, not application test-suite or live-provider acceptance.

The old OpenSans binary URL returned HTTP 404; fifteen first-smoke request records refer to that one URL. Other public fonts loaded. The exact fallback impact is unverified, so neither total typography failure nor correct intended rendering is asserted. Product font source was not changed.

Mentor Media 360 and Mentor Sessions 1280 screenshot attempts timed out after fonts reported loaded. This is capture incompleteness, not a reproduced page crash or proof of one root cause. The missing taxonomy/fp-rate endpoints are separately inspected fixture gaps; later runs must retain any retries and their actual results.

## 9. Later-image critique: states, light theme and secondary surfaces

These are representative opened images, not a claim that every retained PNG was visually reviewed. All15smoke images, the original diagnostic, five later catalog/detail/apply/empty-map images,11of25state/stress images and six runtime images have been opened. Some were reread for this written critique; rereading does not increase coverage.

| Observed surface | Finding and severity | What works / later design recommendation |
|---|---|---|
| [Student light360](../../progress/screenshots/identity-worlds/iw-a2-20261109-0c7f4bfb/student-light-360.png) | Critical readability concern: very pale secondary copy on the pale-blue background; dark metric numbers inside retained dark cards | The next-lesson and course grouping remain recognizable. Require coherent foreground/surface token pairs in both themes; no contrast ratio is inferred from this image alone |
| [Mentor light1280](../../progress/screenshots/identity-worlds/iw-a2-20261109-0c7f4bfb/mentor-light-1280.png) | Critical readability concern: division labels, signature description and most ranking-row text nearly disappear, while the hero and learner field retain dark surfaces | The hero and personal ranking row provide useful hierarchy. Theme the full composition rather than changing the page background alone |
| [Mobile drawer360](../../progress/screenshots/identity-worlds/iw-a2-20261109-0c7f4bfb/switcher-open-attempt-360.png) | Critical identity reachability gap: opened navigation lists Student destinations but no identity selector; the translucent drawer overlays the hero | Navigation destinations are grouped and Escape behavior is separately observed. Identity choice must remain reachable independently of this desktop-only control |
| [Failed Student360](../../progress/screenshots/identity-worlds/iw-a2-20261109-0c7f4bfb/student-failed-360.png), [failed transit1280](../../progress/screenshots/identity-worlds/iw-a2-20261109-7cf5d245/transit-failed-1280.png) | Critical state-communication defect in the synthetic failure:503enrollment responses display the same empty-universe enrollment invitation as a genuinely empty fixture | Browse courses/mentors are useful empty-state actions, but failure needs distinct explanation and recovery. At360, failed and empty PNG hashes were identical; other widths have matching recorded headings/copy, not identical bytes |
| [Pending360](../../progress/screenshots/identity-worlds/iw-a2-20261109-0c7f4bfb/mentor-pending-360.png), [locked360](../../progress/screenshots/identity-worlds/iw-a2-20261109-0c7f4bfb/mentor-locked-360.png) | The application-under-review and missing-role states are distinct and remain on /mentor/observatory; this is not a tested role-acquisition flow | Preserve the distinction. These are actual guards rendered with synthetic account state, not fabricated menu options or live approval evidence |
| [Mentor Apply requested360](../../progress/screenshots/identity-worlds/iw-a2-20261109-35f63857/mentor-apply-360.png) | Moderate responsive/density finding: actual PNG width520, long profile/rate/availability form and very dense hourly grid | Grouped fields and live preview convey purpose. Retain data logic; do not call the wider image a successful360px layout or validate its displayed monetary promises |
| [CourseDetail768](../../progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/course-detail-768.png), [1280viewport](../../progress/screenshots/identity-worlds/iw-a2-20261109-92da7547/course-detail-1280.png) | Moderate hierarchy finding: hero/Continue learning leads into both a tall trajectory and another course map; two navigation representations lengthen the page | The course, mentor and learning action are clear. This page is a different composition from the R3F CourseLearn scene; its unresolved1280full-page timeout is not assigned to the journey renderer |
| [Empty skill map1280](../../progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/skill-map-1280.png), [catalog360](../../progress/screenshots/identity-worlds/iw-a2-20261109-788b630d/courses-360.png) | The explicit empty knowledge state offers a clear Browse courses action; healthy catalog rechecks followed fixture correction | No populated concept-map rendering, graph navigation or production knowledge quality is demonstrated |
| [Identity1280](../../progress/screenshots/identity-worlds/iw-a2-20261109-7cf5d245/runtime-identity-before-1280.png) | Moderate coherence finding: three colored identity bodies are clear, but the shared shell still shows Peer navigation while the role chip shows Mentor | This supports separating route context from membership/identity presentation. Legacy world labels in the image are not new branding decisions |

### Journey visual hierarchy

The [1-level](../../progress/screenshots/identity-worlds/iw-a2-20261109-0c7f4bfb/journey-1-levels-1280.png), [30-level](../../progress/screenshots/identity-worlds/iw-a2-20261109-0c7f4bfb/journey-30-levels-1280.png), [100-level](../../progress/screenshots/identity-worlds/iw-a2-20261109-0c7f4bfb/journey-100-levels-1280.png) and [300-level](../../progress/screenshots/identity-worlds/iw-a2-20261109-0c7f4bfb/journey-300-levels-1280.png) images were all opened. One level has generous separation. At30the labels and station/planet shapes overlap; at100and300the scene becomes a dense text/object cluster with clipped content at its edges. This is a **critical scalability/usability finding for the requested long journey**, not proof of a renderer crash, GPU leak or failed travel. The visible fallback toggle and textual lesson rail are useful alternative entry points; their action outcomes are recorded separately below. Later design must make current/next learning targets legible rather than use all-node density as evidence of an advanced world.

## 10. Keyboard, ARIA, switcher and simulated reflow

The completed7cf5d245report holds browser-computed ARIA strings and16natural Tab observations per width. These were not human screen-reader sessions.

| Probe | Actual observation | Limit |
|---|---|---|
|360/768navigation | Drawer opened; no visible Switch window button or identity menu. Escape returned focus to Open menu | Identity-menu arrows, focus trap and Escape restoration cannot be tested on a menu that did not open |
|1280navigation | One visible trigger; ordinary click went from /student/universe to /profile; sampled menuVisible=false | Does not rule out a transient menu between samples. Source nests the control in the Profile link: [Navbar:365-374](../../../FrontEnd/src/components/layout/Navbar.jsx#L365-L374) |
|16-Tab sequences | None reached Switch window; desktop ended at the parent Profile link. Several focused SVG groups/course buttons have computed outline-style none | Not proof of invisible focus, because border/paint alternatives were not evaluated. Not proof of unreachability after the16th Tab |
|Selected identity ARIA | Seven snapshots expose all three named choice buttons, the selected description and Begin; no pressed/selected/radio markers | Clicks activated the choices. No native spoken-announcement failure is claimed |
|CSS2x at360 | scrollWidth/clientWidth365/360,height2718; focused Open menu rectangle x399.984,width4,height60, outside the viewport. [Image](../../progress/screenshots/identity-worlds/iw-a2-20261109-7cf5d245/runtime-reflow-css2x-360.png) shows clipped headline/header | Explicit CSS zoom simulation, not native200%browser zoom or a WCAG certification |
|CSS2x at768 | scrollWidth/clientWidth768/768,height2244 | Width equality does not prove every control is reachable |
|CSS2x/axe at1280 | First run measured /profile after the unexpected navigation: widths1280/1280,height5413. Axe ran after restoring CSS zoom | Preserve as Profile evidence, not Student reflow or zoomed axe coverage |

The extra full-page Profile axe scan retained button-name1,color-contrast13,label-content-name-mismatch3,nested-interactive1,region1 rule-node counts, plus incomplete color-contrast evaluation. These are additional findings, not a clean accessibility result.

Observer corrections are explicit: the360pre-choice image captured a loading spinner, and four baseline choice arrays were empty before the controls later appeared; these are timing gaps, not absent identities. The original Peer trace expected My Orbit as a heading, but that text is document metadata and the displayed heading is a greeting. Peer reached its route and fulfilled /skills/my200; its original readiness=null is an observer mismatch, not a demonstrated loading failure. Targeted recovery waits for choice controls, uses the actual Add a new skill action as the narrow Peer marker and re-anchors Student before reflow. Original results remain immutable.

## 11. Identity routing and transit timing

Numbers below are **first sampled observations in milliseconds**, not exact animation duration or paint timestamps. The observer clock starts after the selected ARIA snapshot and before the Begin click; browser evaluation, actionability waits and250ms polling add overhead. Readiness means destination path plus its heading/control and a same-context fulfilled200core GET. It is not critical-asset, chunk, scene or full-app readiness.

| Case | First destination route | First narrow readiness | First detector-clear after an overlay | Interpretation |
|---|---:|---:|---:|---|
|Mentor choice360,reduced context |3077|3652|Not observed|24samples matched no overlay; do not invent its removal time |
|Student choice768,reduced context |3094|3632|3898|Destination and core GET observed |
|Peer choice1280,reduced context |3399|Invalid oracle: null|4444|Route and /skills/my200observed; preserve original null |
|Student normal1280 |3105|3433|3698|Clearance followed the narrow ready sample |
|Student slow1280 |3012|10003|3574|Overlay detector cleared6429ms before narrow readiness; the required GET took6522ms |
|Student failure1280 |3098|Not reached|3639|Three configured503responses; empty-enrollment heading appeared by6652ms; readiness remained false through11159ms |
|Student reduced motion1280 |2962|3231|3490|An aria-hidden fixed overlay still matched308-3231ms; empty text does not mean no curtain |

Normal motion matched a role=status overlay. The detector only examines large fixed divs atz200-300with nonzero opacity; first detector-clear is not necessarily DOM removal or perceptual clearance of every layer. Captured legacy thought strings are deliberately not reproduced as verified quotations. No new quotation pool was researched or authored.

Source timers remain separate: the old window overlay hides after1000ms; the newer identity transit uses3000ms; IdentitySelection has a2600ms fallback; the normal-motion Begin reveal waits1200ms. Observed tap-to-Begin times include browser/action/reveal overhead and do not isolate those timers. Shared-route identity priority can also make a Mentor selection a no-op before the fallback; route arrival is not proof that every store transition ran. The [source audit section6](01-ui-audit.md#6-transitionloading-audit-actual-flow) retains the exact source references and distinctions.

## 12. Finite journey, context-loss and memory evidence

The original0c7f4bfbframe probes recorded8/7/8/8RAF callbacks over2.029/5.568/5.239/4.477seconds for1/30/100/300levels. Corresponding JS heap samples were22,532,103 /53,284,692 /100,792,151 /247,949,922bytes. These are different contexts and short software-renderer observations, **not average game FPS, leak measurements or GPU memory**. A4s fallback timer did not guarantee a4s wall-clock bound. Early has3d=false at30/100/300does not contradict later3D images: the early check preceded eventual scene readiness.

### 7cf5d245 action outcomes

| Levels |3D first/middle/final/reverse |2D observations | Outcome |
|---|---|---|---|
|1|First/middle had no label at the immediate check; final/reverse later found the already-selected label |All four positions were the same already-selected level; map ARIA and pressed state recorded |No travel can be established from one level; later2D screenshot timed out |
|30|First/reverse already selected; middle15and final30ordinary clicks timed out at5s |Toggle action timed out at7s; no post-toggle map observation |No completed forward/reverse travel |
|100|First label absent initially but present at reverse; middle50/final100ordinary clicks timed out |Toggle action timed out at7s; post-timeout mode unknown |Do not label the mode unchanged or blame Shuttle arrival |
|300|First label absent initially but present at reverse; middle150/final300ordinary clicks timed out |Remaining33220ms case budget expired before a2D result |No completed forward/reverse travel |

All20selection records began/ended on lesson-1:4early absent-label records,6action-incomplete records and10already-selected shortcuts. The six click logs reported instability, not destination-URL wait timeouts. Source routes normal3D selection through the Shuttle arrival callback and2Dselection directly, but this run did not demonstrate a trajectory, visual arrival or camera travel. [World:171-186](../../../FrontEnd/src/cosmic/CourseSpaceJourneyWorld.jsx#L171-L186), [World:239-242](../../../FrontEnd/src/cosmic/CourseSpaceJourneyWorld.jsx#L239-L242), [Shuttle:150-177](../../../FrontEnd/src/cosmic/Shuttle.jsx#L150-L177).

The1/30/100cases also retained removeChild page-error messages; the300case's recorded page-error array was empty. The report does not timestamp those errors or prove whether they caused, or followed, a toggle/capture failure. They are not erased because the driver exited0.

### Controlled graphics loss and finite heap

At30levels, WEBGL_lose_context was available. The deliberately injected loss showed the [graphics-loss alert](../../progress/screenshots/identity-worlds/iw-a2-20261109-7cf5d245/runtime-context-lost-1280.png), then loss/restored events were recorded at52034/59539.900ms. The7505.900ms interval includes a screenshot before explicit restoreContext; **it is not automatic recovery latency**. The restored capped text omitted the alert, but no dedicated post-restore visibility, fresh-frame, resumed-input or travel test was performed.

Five post-restore JS-heap samples in the same30-level context were45,389,252 /43,490,365 /44,243,242 /44,960,259 /45,724,364bytes over20.412seconds by pre-evaluation timestamps. All stayed on lesson-1with665DOM elements and two canvases. No controlled GC or repeated travel occurred. This establishes neither a leak nor leak freedom, long-duration stability, full-process/GPU memory bounds or physical-device performance.

WebGL-unavailable and reduced-motion journey cases were explicitly skipped by this run's budget. The targeted follow-up isolates those cases and2D1/100/300rather than rerunning the expensive3Dwork. Its outcomes must be recorded separately, not backfilled into this original report.

## 13. Targeted recovery results: 0df3369e

The [targeted report](../../progress/screenshots/identity-worlds/iw-a2-20261109-0df3369e/capture-results.json) completed with observations in 321.8s (302656ms runtime scope). Only seven selected 1280px cases ran; eight normal-transit/3D cases were explicitly excluded, not repeated. No selected case was skipped. Four PNGs were saved and verified by byte count, hash, dimensions and registry row; all four were opened. They are the switcher/Profile result, Student CSS2x reflow, ready identity choice screen and Peer destination. **211 PNG files are retained overall.** The owned60820listener returned ECONNREFUSED; input hashes matched the helper and fixture.

- **Corrected Peer observation:** all three choices were present before selection, each160x219; Peer route first sampled at3661ms, narrow Add a new skill/GET readiness at4105ms, first overlay-detector clear also4105ms. The original null readiness remains preserved in7cf5d245.
- **Re-anchored Student reflow:** desktop trigger still navigated to Profile. The observer then explicitly returned to Student before CSS2x: widths1280/1280, document height2228. The [actual image](../../progress/screenshots/identity-worlds/iw-a2-20261109-0df3369e/runtime-reflow-css2x-1280.png) shows the enlarged header with its horizontal navigation clipped; width equality is not whole-interface reflow acceptance. An unzoomed whole-page Student axe scan retained color-contrast3,label-content-name-mismatch6,nested-interactive1,region1 and incomplete color-contrast evaluation.

| Targeted case | Actual DOM/route evidence | Remaining limitation |
|---|---|---|
|WebGL unavailable,30levels |2D region appeared;3D toggle disabled. Ordinary clicks reached15then30then1 |No eligible unselected fully in-viewport map button was found within40natural Tabs; no keyboard activation claim |
|Reduced motion,30levels |2D region appeared;3D toggle was not disabled. Ordinary clicks reached15then30then1. One natural Tab focused a visible level2button; Enter reached its route |Case later exceeded65000ms while completing evidence; screenshot step encountered closed context. Partial action evidence survives, not a complete-case pass |
|WebGL unavailable,1level |2D region and disabled toggle; all four positions are the same already-selected level1 |Nontrivial travel and next-level keyboard case are not applicable |
|WebGL unavailable,100levels |2D region,disabled toggle; ordinary clicks reached50then100then1 |No eligible unselected fully visible map target within40Tabs; not proof that no keyboard route exists |
|WebGL unavailable,300levels |2D region,disabled toggle; ordinary clicks reached150then300then1 |Same40Tab bound; no physical-device or full-memory claim |

The12nontrivial pointer selections reached their requested URLs. Immediate aria-pressed reads were frequently false after the URL changed, so **route completion is not synchronized selected-state, scene or content-ready proof**. The helper did not wait for settled pressed state. Only the reduced-motion level2keyboard activation completed; the other bounded searches are inconclusive about general keyboard reachability.

There are **no new2D PNGs from this pack**. Four optional2D screenshot attempts timed out after20s; the reduced-motion capture encountered the closed context after its case deadline. The report retains8font-request failures,5runtime-capture failures and1runtime deadline failure. All seven recorded page-error arrays are empty; console errors remain. The separate capture errors do not invalidate already recorded DOM/ARIA/routes, and those observations do not substitute for missing rendered images. No product fix, forced click, hidden-element focus or layout modification was used to obtain the route outcomes.

## 14. Current priorities and remaining proof

1. **Reachable identity navigation and an accessible shared shell** — retain the actual mobile absence/desktop redirect and ARIA/contrast findings; later implement corrections only in the approved product slice.
2. **Readable, task-led worlds in both themes** — redesign Student/Mentor around learning/teaching actions, coherent light/dark token pairs and a legible long-journey hierarchy; preserve Peer and actual data/hooks.
3. **Honest readiness and bounded navigation** — treat the slow-data clearance gap, failure/empty conflation, unstable targets and finite-resource observations as design inputs, not acceptance of fixed timers or all-node rendering.

Scoped verification and the approval boundary are recorded in [CP-A-r2](../../progress/checkpoints/v3/CP-A-r2.md); targeted recovery is complete with the failures above. Fresh byte fingerprints match all786non-environment application files and66historical artifacts. Three environment paths were excluded before reads; the tracked Android example template was hashed as baseline data, not loaded as credential configuration. The original v3CP-A remains8355bytes with SHA256eeca4d3ff5abd6ebe6088c2ce92d77294fd37201349013df20dc5cd6b8a3a640. Hashes are preservation checks, not backups or feature correctness. The49-screen/three-width matrix has images for all147selected slots, but not every substate, leaderboard tab, recorder review, populated skill map or nested dynamic view was exercised or visually inspected. CourseDetail1280full-page capture remains unresolved. No infinite-curtain, native browser zoom/SR, device/GPU/full-memory, production-authority, real payment/media/provider or entire UI acceptance can be obtained from these synthetic captures.

No Phase B research or Phase C design has started. No approval of CP-A-r2 is inferred from tool results or this report.
