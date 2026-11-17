# Identity Worlds: world bible

**Phase:** C, IW-C. **Date:** 2026-11-10. **Status:** Design draft; direction selected, detailed specification not yet approved. No application code or assets produced. New CP-C approval is still required before implementation.

## 1. Selected direction and scope

The founder selected **Artifacts + Projection** and requested a coherent blend of the strongest other concepts, especially an exceptional Mentor studio. The confirmed worlds are **Student = Multiverse, Mentor = Dimensions, Peer = Space**. These assignments are not reopened.

The proposed blend has one hierarchy:

1. Crafted artifacts, apertures and projection planes supply the identity and structure.
2. Architectural depth enriches entrances and chamber edges, not routine controls.
3. Restrained fluid atmosphere exists inside decorative world interiors, never behind reading, editing or recording surfaces.

This blend allocation, artwork, palette, layout numbers and sound treatment are designer proposals. The founder chose the foundation and, separately, **default cinematic transitions with 5–6 verified thoughts and selectable Fast/normal mode**. Exact cadence/maximum duration, names, ladder reconciliation, final quote pool/rights, feature flag, ID strategy and screen merges remain open. See the [decision record](../../../.agent/DECISIONS.md#c-visual-direction-selected---2026-11-10) and [transition-default choice](../../../.agent/DECISIONS.md#c-transition-default-chosen---2026-11-10).

### Alternatives and tradeoffs

| Considered direction | What survives in the selected blend | What is not carried forward |
|---|---|---|
| Artifacts + Projection | Independent Student realities versus connected Mentor projection sections; crafted original silhouettes and readable foreground | An attractive hero above otherwise undifferentiated utilities |
| Horizon + Chambers | Spatial depth and a striking studio entrance around a stable work surface | Mandatory free movement, deep corridors as navigation, moving controls |
| Fluid Cosmos | A restrained atmospheric layer inside a few distant apertures | Full-screen refraction, moire, perpetual swirling or fields beneath text/video |

Bespoke composition costs more art direction than tint variants. This is intentional, but elaborate backgrounds are not prerequisites for access, meaningful progress, or supported recording. The [A2 audit](01-ui-audit.md) and [visual evidence](01-ui-visual-evidence.md) remain failures/observations to address later, not proof this design already works.

## 2. Non-negotiable composition rules

- Every task groups its title, real status/progress and first supported action in one upright, opaque task zone. Decorative acreage yields to that zone on short or narrow screens.
- A Student world has its own bounded interior and horizon. Mentor sections share connected planes and a common architectural datum. Both must remain distinguishable in still images and grayscale, not just through color.
- Tables, editor content, video, fields and numerical comparisons are never skewed into perspective. The surrounding frame can suggest depth; the functional plane stays flat.
- Peer composition, existing Space identity, Photon, earned history and member text are preserved. Shared spacing/type/control accessibility and switcher harmonization do not authorize a global Peer redesign.
- World art is bespoke SVG, procedural or modeled work produced only in the later approved implementation scope. No emoji, third-party pictographic substitutes, copied game assets or generated attribution claims.
- Division, leaderboard rank, score, course difficulty, commercial course class and spendable balance are different facts. Neither decorative size/facet count nor brighter art creates authority or progress.

## 3. Proposed shared tokens

The six base colors below are a draft palette, not an approved global replacement. They adapt existing shared token roles rather than introducing a second application theme engine. The current Poppins/Open Sans roles and radius20 input are directly declared in [index.css:27-46](../../../FrontEnd/src/index.css#L27-L46). Existing dark surfaces are translucent and muted text uses opacity, as shown in [index.css:64-83](../../../FrontEnd/src/index.css#L64-L83); these are source facts, not proposed readability guarantees.

| Design token role | Proposed value | Permitted purpose |
|---|---|---|
| Ink | #172638 | Student/Mentor dark base; light-mode primary text |
| Porcelain | #E6ECEF | Light reading surface; dark-mode primary text |
| Raised slate | #25384B | One opaque raised dark surface; selected from the returned neutral variants |
| Student iris | #B6A0DE | Student identity rim/selection accents, not rank magnitude or success |
| Mentor glacial cyan | #87C7CC | Connected Mentor seams/selection accents, not recording or save status |
| Material brass | #BFA677 | Sparse crafted joints and decorative inlays, never paid access or reward meaning |

Secondary text proposes #AABCC8 on the two dark surfaces and #415A6B on porcelain. These are dedicated readable text shades, not additional series or identity colors. Accent-filled controls use ink text; light-mode text does not use pale iris/cyan. No essential text or focus ring relies on a translucent overlay, gradient or distant scene beneath it. Status roles remain distinct from identity accents, with explicit words and bespoke non-color indicators; their full interactive palette must be specified and tested with the screen designs.

### Verified flat pairs, not rendered acceptance

A local standard sRGB luminance calculation passed same-color1 and black/white21 sanity cases plus eleven specified pairs. [Calculation log](../../../.agent/scratch/iw-c-world-token-flat-pairs-1794253565917-2da7140c.log): exit0, empty stderr. Values below are rounded; comparisons used unrounded results.

| Foreground / opaque background | Ratio | Intended role |
|---|---:|---|
| Porcelain / ink |12.846 | Dark primary text |
| Porcelain / raised slate |10.086 | Dark raised-panel primary text |
| #AABCC8 / ink |7.832 | Dark secondary text |
| #AABCC8 / raised slate |6.149 | Dark raised-panel secondary text |
| Ink / porcelain |12.846 | Light primary text |
| #415A6B / porcelain |6.073 | Light secondary text |
| Ink / Student iris |6.618 | Student accent-filled control text |
| Ink / Mentor cyan |8.077 | Mentor accent-filled control text |
| Ink / brass |6.519 | A permitted filled-control text pair, not an eligibility signal |
| Porcelain / ink; ink / porcelain |12.846 each | Two tested focus-background pairs |

These calculations do not validate CVD separation, control boundaries against every neighbor, focus appearance, disabled states, antialiasing, scenes, flash behavior or WCAG conformance. Later categorical charts require the actual dataviz palette checks and non-color encoding; this palette is not a chart-series palette. Known A2 font404s and low-contrast states are not repaired by this document.

### Type, spacing and working surfaces

| Role | Proposed rule |
|---|---|
| World/task title | Poppins600;40/48px at wide reference,32/40 at tablet,28/36 at narrow |
| Section title | Poppins600,22/30px |
| Body and controls | Open Sans16/24px; secondary information14/20px, not tiny atmospheric captions |
| Numbers | Tabular numerals; comparable columns right-aligned, labels in ordinary text ink |
| Timer/code | Existing JetBrains Mono role only for genuine time/code; no pervasive mono uppercase labels |
| Rhythm |8px base spacing;24px major gaps,16px compact gaps; content around72characters per prose line |
| Hit targets | Proposed44px minimum in the main control layouts; visible keyboard focus separate from selection |
| Functional surfaces | Quiet20px rounded opaque containers where a container is needed; forms/tables are not chopped into identical cards |

Reference widths1280/768/360 describe design checks, not locked implementation breakpoints or tested reflow. Native zoom, keyboard-open layout, localization and longer source content still require verification. Do not crop certificate/member content or repurpose its special font rules merely to impose world styling.

## 4. Student Multiverse

**Concept:** several genuinely separate realities viewed through crafted artifacts. Courses and learning destinations are identified by their real names and actions; artwork is not a substitute navigation puzzle.

**Geometry/background:** asymmetric enclosed bezels hold different interior spatial rules. Illustrative art descriptions include terrain hanging beneath a slit horizon, a small foreground arch enclosing a much larger sky staircase, or a vertical sea folding into a horizontal floor. These are not public world names, league assignments, scientific claims or new course branches. Distinct horizon, mass, cut profile and negative space establish variety. No scenic bridges imply prerequisites between unrelated courses.

**Content composition:** the active destination's rim has a cut foot adjoining its solid task dock. Course title, existing progress and Continue remain contiguous. A secondary artifact can preview another existing destination, but cannot push the primary action below a decorative hero. Content can precede artwork on a short screen.

**Palette/type accent:** iris highlights Student identity and the selected aperture; porcelain/ink carry all reading. Poppins title and Open Sans content remain shared. Sparse brass belongs to the artifact construction, not grade or purchasable superiority.

**Emblem:** enclosed cutaway aperture with a solid negative-space interior, distinct from Mentor's open joined planes. Small forms simplify; adjacent labels carry division/order, not notch counts or hue alone. Exact artwork and name mapping remain unselected.

**Motion/sound proposal:** a deliberate world entry opens one rim onto its impossible interior and settles. Normal action feedback stays local and immediate. Optional material-latch/airy-tail sound respects existing audio preferences; silence remains fully usable. Reduced-motion presentation shows the settled cutaway without camera travel.

## 5. Mentor Dimensions

**Concept:** one authored teaching space revealed through connected, intersecting sections. Unlike Student's separate universes, the Mentor structure shares a floor datum, structural ribs and a seam that appears near and deep.

**Geometry/background:** visible joints connect teaching workspaces without turning every section into an orbiting planet. Projection frames expose different sections of the same chamber; the metaphor does not grant new data relationships, content access or a physical four-dimensional simulation.

**Content composition:** course management, mission control and studio work sit on upright opaque planes aligned to the shared seam. The full screen can express a connected structure while its actual tables, form fields and preview stay rectilinear and quiet.

**Palette/type accent:** glacial cyan marks intersections/identity; brass occurs at occasional joints. Body text never uses the pale scene accents on light backgrounds. Shared type scale creates reading continuity without identical whole-page geometry.

**Emblem:** two open bridged planes meeting at a fixed node. It remains recognizable as an open structure in a monochrome small rendering; division labels and actual state remain adjacent. Decorative intersections are not a new ladder count.

**Motion/sound proposal:** planes unfold once toward their common seam at entry, then settle. Optional two resolving notes are not a status signal. Scenic motion and scene/UI sounds are suppressed during active capture; this is a future behavior requirement, not proof of current audio isolation. Sources and transport controls do not move with the architecture.

## 6. Peer Space: preserve and harmonize

Retain the existing Space backdrop/composition, established emblem, Photon and history. Current Peer palette input is Pulsar cyan#22d3ee/teal#0d9488 in [palette.js:31-36](../../../FrontEnd/src/soul/palette.js#L31-L36), connected to peer by [palette.js:56-59](../../../FrontEnd/src/soul/palette.js#L56-L59). These are preserved source colors, not newly validated text pairs.

Use the shared Poppins/Open Sans roles and safe opaque switcher/control surfaces without changing Peer content layout wholesale. Preserve existing sound preferences and Space motion character; the new identity transition must have the same static/skip/status access as other destinations. Do not introduce a third new lore/art system, rename member-generated text, convert Photon or replace earned history. Shared-page active-world context requires the later switcher/screen specifications, not implicit Mentor-priority branding.

## 7. Whole-surface identity, not only a hero

| Surface | Student composition | Mentor composition | Invariant |
|---|---|---|---|
| Playground | A bounded bezel around the complete exercise area, task dock at its cut foot; unrelated destinations stay visually separate | Connected frame joins prompt/work/result panes along one structural datum | Editor, preview, actions and results remain flat; no scenic overlays or changed grading |
| League | One current-division artifact above a complete source-ordered ladder strip, with independent framed sections | Division summary and ladder align on a continuous connected plane | Real order/count, text/ordinal/state; no invented progress |
| Leaderboard | Independent silhouette anchors the caption/title at a table edge; task/status stay contiguous | Caption/current context join the same plane as comparison columns | Semantic rank/name/score fields, real source ordering; not color/brightness ranking |
| Missions | Each coherent source task has a cut-foot title/status/action group; decorative universes do not invent dependencies | Connected content surfaces express real grouping only, with ordinary task rows | Existing prerequisite order and eligibility; empty/error/not-ranked remain distinct |
| Badges and shop | Enclosed aperture-cut badge; item description/price/action attached to an individual specimen surface | Open projection-frame badge; item surfaces join a shared shelf with distinct readable rows | No mystery balance, bought rank, conversion, changed item terms or count mapping |
| Currency | Proposed distinct compact split-tail artifact silhouette | Proposed compact core held by intersecting planes | Currency is not a division badge; balance/denomination/name remain explicit |

This is outer composition grammar, not permission to change data, route inventory, score thresholds or wallet mechanics. Current Student source has eight ordered slugs in [tierMeta.js:18-42](../../../FrontEnd/src/soul/league/tierMeta.js#L18-L42); Mentor has six in [pact.js:16-23](../../../FrontEnd/src/services/pact.js#L16-L23). Historical Comet/Stellar five-stage name ideas are a separate input, not an approved merge. Comet League/Comet Sparks and Stellar League/Solar Cores are historical selected labels, not proof those economies are shipped. The [audit currency row](01-ui-audit.md#L275-L278) records the existing shared Photon/legacy source. The retheming and impact documents must resolve this explicitly with the founder.

### Paired non-hero sketches

```text
Student playground                    Mentor playground
 / independent exercise bezel \       /------ continuous seam ------/
| [prompt] [upright editor]     |      | [prompt] | [upright editor] |
 \__ task dock _______________/       |_________|__________________|
 [title + status + action]              [title + status + action]
 [result, when supported]              /---- joined result plane ---/

Student league                        Mentor league
 [division artifact + title]           / [division title] --- seam --/
 [source-ordered ladder]               | [source-ordered ladder]    |
 [caption + semantic table]            | [caption + semantic table] |
```

No numbers above are fabricated examples. On narrow layouts, preserve every required field and header/cell relation; use a labeled table-scroll region where needed rather than convert comparison facts into ambiguous decorative cards. Art size never stands for mastery, ranking or entitlement.

## 8. Mentor production chamber

### Experience and rendering boundary

The entrance suggests a deep asymmetric aperture: offset frames align around a large matte video well, with a controlled horizon in side apertures. Once inside, it feels like a purpose-built teaching instrument rather than a control maze. Detail concentrates at the chamber perimeter; recorded content is the focal artifact.

**Studio depth is a decorative 2D illusion outside the untransformed preview and conventional DOM controls.** Layered illustrations, restrained perspective on noninteractive chrome and one entry reveal may suggest a chamber; capture/navigation must work if scenic rendering is absent or fails. The recording preview is never used as a texture on a 3D surface. A separate later course-journey renderer cannot become a dependency of recording.

### Existing seams verified by source, not runtime

| Source-visible behavior | Exact anchor | Design treatment / limit |
|---|---|---|
| Canvas2D composed preview;1280×720 source dimensions | [Recorder:22-24](../../../FrontEnd/src/pages/mentor/Recorder.jsx#L22-L24), [Recorder:133-163](../../../FrontEnd/src/pages/mentor/Recorder.jsx#L133-L163) | Preserve undistorted16:9 content and intentionally composed screen/camera/Board pixels |
| Explicit display/camera/microphone request | [Recorder:165-188](../../../FrontEnd/src/pages/mentor/Recorder.jsx#L165-L188) | Entry alone never starts permission requests; selected source controls remain explicit |
| Four layout presets and composition math | [recorderStage:1-43](../../../FrontEnd/src/studio/recorderStage.js#L1-L43), [recorderStage:75-83](../../../FrontEnd/src/studio/recorderStage.js#L75-L83) | Keep Solo/Screen/Split/Spotlight, not new capture capabilities |
| Pause/resume/stop, chapter split, retake-cut metadata | [Recorder:319-386](../../../FrontEnd/src/pages/mentor/Recorder.jsx#L319-L386) | Maintain supported actions and exact state distinctions; cut metadata is not rendered-file parity proof |
| DOM teleprompter | [Teleprompter:53-94](../../../FrontEnd/src/components/mentor/Teleprompter.jsx#L53-L94) | Tools/readable script stay conventional; no projected or shimmered text |
| Review fields, playback and save failure/status UI | [RecorderReview:24-55](../../../FrontEnd/src/components/mentor/RecorderReview.jsx#L24-L55), [RecorderReview:87-164](../../../FrontEnd/src/components/mentor/RecorderReview.jsx#L87-L164) | Actual lesson title/description review and source-backed states, no automatic publication claim |
| Sequential upload/addLesson flow | [Recorder:438-464](../../../FrontEnd/src/pages/mentor/Recorder.jsx#L438-L464) | Keep actual ordering/status; do not advertise resumable, parallel or guaranteed server saves |

These are code inspection facts, not browser/media/playback/recovery acceptance. Historical [capture plan](../../plan/v2/11-studio-capture.md#L3-L25), [notes/Board plan](../../plan/v2/12-studio-notes-whiteboard.md#L3-L30) and [studio UX](../v2/studio-ux.md#L22-L55) describe further proposals. Crash-safe journals, resumable upload, authoritative shared Board, private learner notes, AI processing and reviewed publication are not features granted by a visual refit. Preserve those requirements and their separate implementation/privacy/policy gates; do not mark them shipped or delete them from the longer roadmap.

### Stable working hierarchy

- Wide: roughly two-thirds of the available working-row width for preview, one-third for source/preset/script controls. This ratio yields when actual labels or useful preview size require it.
- Preview-adjacent task dock groups title, actual state/elapsed time and the context-appropriate primary action. Stop has a persistent dedicated labeled slot while supported; it is never a moving decorative button.
- Source selection/presets, local drawing, teleprompter settings and chapter/retake controls remain separately grouped. Visual focus cannot stop capture, silently change devices or rearrange transport targets.
- Tablet/narrow: preview and essential state/transport first, secondary controls in normal document flow. Proposed dock stickiness must leave reserved space and not obscure focused inputs, error messages, the keyboard or meaningful preview content. No nested scrolling is required merely to reach Stop.
- Review is a quiet editing desk in the same chamber, not another forced cinematic. Keep playback, metadata/title edits and actual upload action/status legible; unknown or failed transfer is not zero progress or success.

```text
Studio wide
[role/world + task title]             [actual state / elapsed]
[flat16:9 preview, ~2/3 row]           [sources / four presets]
[stable primary slot] [Stop]          [script / drawing tools]
[chapter / retake metadata]           [ordinary supporting content]

Studio narrow
[task title + actual state / elapsed]
[flat16:9 preview]
[stable primary slot] [Stop]
[sources / presets]
[script / drawing / chapter tools]
```

The drawing canvas is an intentional compositor input; room chrome and DOM teleprompter are not. However, a selected display/tab can contain studio UI and recursive preview. The design must explain that source boundary; it cannot promise automatic exclusion of chrome, prompter or system audio. Preview/source permission is distinct from recording and publication consent. Decorative audio/motion suppression is a proposed requirement, not existing capture-isolation proof.

## 9. Layout and state rules across modes

At the1280reference, a proposed Student7:5split means **horizontal available row widths** for the active artifact illustration versus its contiguous task/content panel. It is not hero height or a quota for scenery. Title/status/action are one panel; if a short viewport cannot present them usefully, artwork shrinks or follows the task. At768, stage/task dock stack before secondary content. At360,16pxgutters and a compact settled symbol suffice; never shrink a complete desktop world and its hit targets into the phone.

| State | Proposed visible meaning | Must not imply |
|---|---|---|
| Actual preparation | Source-backed loading text/indeterminate indicator; percentage only with meaningful measured total | A cinematic frame count is data progress |
| Ready during cinema | Clear readiness and an available entry action, separate from remaining thoughts | Data is still loading merely because an optional presentation continues |
| Empty | Genuine no-content result plus supported next action | Network failure, ineligibility or zero skill |
| Error | Plain failure and a supported recovery action on the task dock | Locked identity or successful empty data |
| Current/selected | Label and shape/outline, distinct from keyboard focus | A decorative glow grants membership or rank |
| Locked/pending/unavailable | Supplied authoritative state and safe explanation | A client-world choice unlocks a role or a missing value equals lowest tier |

## 10. Cinematic and accessible presentation

The founder chose default5–6verified thoughts with destination-world animation; Fast/normal mode is selectable. The new transition document must honor that default rather than silently restore the earlier adaptive-default suggestion. Preparation, presentation completion and route arrival are different states. Main proposes truthful Ready/Enter now and a visual Skip; these do not make failed or pending preparation complete.

Student entrance opens a bounded reality. Mentor entrance aligns intersecting sections into a connected chamber. Peer resolves into its preserved Space scene. The outer transition and studio entrance must compose into one experience rather than stack two unavoidable holds. Exact durations, max automatic-presentation time, pause/manual quote-reading and the final eligible pool are still being specified, not fixed by this world bible.

Reduced motion suppresses nonessential spatial animation independently of the chosen mode; a user can still have readable static thoughts and controls. Low-end mode removes costly atmosphere without removing destinations, prerequisites or the Space shuttle/module-gate meaning. In active recording and serious work, scenic elements settle. Numeric budgets and device tests belong in the later transition/journey/slice specs; no60fps, flat-memory or flash-safety result is claimed here.

Only genuine source-verified thoughts may appear. The [B candidate pool](research-quote-candidates.md) includes clauses, edition/translation context and territorial-rights holds. The default does not authorize rewriting historical words into cosmology slogans, silently clearing rights or converting original UI copy into an attributed quotation. Relevant learning/collaboration/teaching context matters more than inserting the word dimension.

## 11. Draft verification and remaining decisions

The selected-blend workflow returned three proposals, synthesis and critique. Some contributors read wrong non-nested/old-download paths; their proposals were not independent source verification. Main used the correct nested paths above. Before saving this draft, main incorporated all three concrete critique corrections: independent decorative studio rendering, paired non-hero world composition, and clarified horizontal proportions subordinate to task access. One raised-slate proposal was chosen for consistency; no three competing neutral systems remain.

Verified so far: actual cited source inspection, returned proposal/critique review and eleven opaque text/focus pair calculations. Not verified: rendered hierarchy, original-art clearance, CVD/status/control-boundary contrast, actual reflow/native zoom, keyboard/assistive technology, media/capture/audio isolation, flash limits, low-end behavior, resource budgets or whole-app acceptance. No application or asset changes were made.

Remaining founder choices include public league/currency/mission naming, eight/six-source versus historic five-stage ladder reconciliation, exact thought cadence and maximum automatic duration, final sound treatment, feature flag, stable-ID/display-label approach, screen cuts/merges and final CP-C design approval. The visual foundation and cinematic default are already chosen and should not be asked again. This is the first of the nine C design documents, not completion of Phase C.
