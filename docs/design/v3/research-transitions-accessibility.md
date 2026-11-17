# Identity Worlds research: transitions and accessibility

**Phase:** B, IW-B. **Access date:** 2026-11-09. **Coverage:** B1 eight opened sources; B6 seven opened sources. Research implications only, not C design or app acceptance.

The sources below were retrieved as actual bodies, not accepted from search summaries. Main independently checked all 15 body byte counts/SHA256 records, exact excerpt matches and short surrounding contexts. [Evidence packet](../../../.agent/scratch/iw-b-transit-20261109-myTPgP/evidence-packet.json) retains URLs, dates, raw/text paths, retrieval metadata and queries. The [central ledger](research-log.md) records scope and cross-topic coverage. W3C Understanding pages are informative explanations; do not label them the normative standard itself.

## 1. Transition/loading findings: B1

| Question | Source-supported finding | Boundary for later decisions |
|---|---|---|
| What is a wait for? | T1/T2 distinguish responsiveness, attention and feedback during work. Their UX guidance supports visible, truthful progress when work takes time | Nielsen's historical 0.1/1/10-second heuristics are not experimentally derived Orbit budgets or mandated cinematic lengths |
| Is loading the same as arrival? | T4 separates background scene loading from activation. T5 separates update-callback completion, animation readiness and animation completion | None independently establishes every destination API, font, world asset or settled interaction state |
| What should preload? | T3 recommends selective critical-resource preload; T6 describes how hard references can pull an entire asset graph into startup | Preloading everything is not a general optimization. Critical versus optional resources is a later design/measurement decision |
| Are tips/quotes useful? | T7 documents separate background, loading, tip and layout components in a real loading-screen implementation | This shows a composition mechanism, not evidence that quotations improve learning or justify delaying a ready destination |
| What does Skip mean? | T5 explicitly says skipping the view-transition animation does not skip its DOM-update callback | Visual skip, route choice, cancellation and completion must not be conflated. No current Orbit cancellation behavior was proved |
| What can cancel? | T8 documents supported asynchronous cancellation, including fetch/body consumption/streams | It does not automatically cancel arbitrary promises, GPU preparation, other providers or already-completed operations |

### Research interpretation

Separate actual destination work, optional presentation and arrival checks. The existing A2 slow-load observation supports this distinction: overlay clearance preceded a narrow route/heading/GET readiness observation by about 6.4 seconds. That observation does not select another timer or certify all critical assets. A readiness-driven approach is a candidate for C analysis, not a new implementation here.

A useful research distinction is a loading indicator that communicates real ongoing work versus a cinematic that is optional. Quotes may occupy an unavoidable wait, but no opened experiment establishes the effect of quotations on perceived performance or learning. A fixed minimum wait, adaptive pacing, timeout, retry and cancellation remain unselected product decisions. Failure and genuinely empty content must remain separate states; a quotation cannot substitute for an error explanation.

Unity/Epic mechanisms illustrate separation of loading and activation/resource references. They are engine references, not browser APIs or recipes that can be copied directly into Orbit. The AsyncLoadingScreen README is third-party implementation evidence; no plugin was installed or executed. Its URL is a moving branch, not a pinned release recommendation.

## 2. Transition/loading source register

Every access: 2026-11-09. Each counted source returned HTTP200, or successful gh API retrieval for T7. UNDATED means no publication date was established. Update dates are not substituted for publication dates.

| ID | Opened source / provenance | Continuous verified excerpt |
|---|---|---|
| T1 | [NN/g, Response Time Limits](https://www.nngroup.com/articles/response-times-3-important-limits/), Jakob Nielsen,1993-01-01; historical independent practitioner guidance | "10 seconds is about the limit for keeping the user's attention focused on the dialogue." |
| T2 | [NN/g, Progress Indicators](https://www.nngroup.com/articles/progress-indicators/), Katie Sherwin,2014-10-26; practitioner guidance, not an opened experiment | "Wait animations, such as percent-done bars and spinners, inform users of the current working state" |
| T3 | [web.dev, Preload critical assets](https://web.dev/articles/preload-critical-assets), publication UNDATED; metadata dateModified2018-11-05; Google documentation | "it's important to use preload sparingly and only preload the most critical resources." |
| T4 | [Unity, allowSceneActivation](https://docs.unity.com/en-us/engine/6000.3/script-reference/unityengine/asyncoperation/allowsceneactivation), Unity6000.3, UNDATED; vendor API docs | "When allowSceneActivation is false, Unity stops AsyncOperation.progress at 0.9, and AsyncOperation.isDone remains false." |
| T5 | [MDN, ViewTransition](https://developer.mozilla.org/en-US/docs/Web/API/ViewTransition), publication UNDATED; modified2026-06-19; maintained API reference | "Skips the animation part of the view transition, but doesn't skip running the document.startViewTransition() callback that updates the DOM." |
| T6 | [Epic, Asynchronous Asset Loading](https://dev.epicgames.com/documentation/unreal-engine/asynchronous-asset-loading-in-unreal-engine?lang=en-US), UNDATED; title identifies UnrealEngine5.9; vendor docs | "If you are not careful, you can end up loading 100% of your assets at game startup time." |
| T7 | [AsyncLoadingScreen README](https://github.com/truong-bui/AsyncLoadingScreen/blob/master/README.md), UNDATED; primary third-party implementation documentation, gh retrieval | "Async Loading Screen has four main components: Background, Loading Widget, Tip Widget, and Layout." |
| T8 | [MDN, AbortController.abort](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort), publication UNDATED; modified2025-09-17; maintained API reference | "The abort() method of the AbortController interface aborts an asynchronous operation before it has completed." |

T4 was discovered at docs.unity3d.com/6000.3/Documentation/ScriptReference/AsyncOperation-allowSceneActivation.html and redirected to the linked canonical URL. Both forms are retained in the evidence packet. T7 is an example, not empirical UX proof; its screenshot/assets were not extracted.

## 3. Accessible-transition findings: B6

| Concern | Source scope | Implication and limitation |
|---|---|---|
| Interaction-triggered motion | A1: SC2.3.3,AAA, allows disabling nonessential interaction motion | Reduced-motion handling needs more than faster animation. The source does not prescribe a particular fallback, duration or Orbit implementation |
| Flashing | A6: SC2.3.1,A; A2: SC2.3.2,AAA | The A rule includes a below-threshold alternative; the AAA rule does not. Do not flatten them into one universal flash limit or assume slow motion removes flashes |
| Automatic movement/updates | A5: SC2.2.2,A | Moving/blinking/scrolling content has automatic-start, over-five-second and parallel-content conditions; auto-updating is a distinct clause |
| Focus | A3: SC2.4.3,A | Sequential navigation must preserve meaning and operability. This is not an automatically chosen destination-focus target or proof of a working identity menu |
| Status information | A4: SC4.1.3,AA | Important non-focused status changes can be programmatically exposed without moving focus. Status messages and context-changing navigation are not interchangeable |
| User time limits | A7: SC2.2.1,A | Time limits have turn-off, adjustment or extension alternatives and exceptions. Source guidance is not proof that a current Orbit timer is adjustable |

### Conditions that must not be omitted

- A5's moving/blinking/scrolling clause requires all three stated conditions. Its auto-updating clause is separate. The loading/preload exception described by the explanatory page is conditional: interaction is unavailable during that phase for all users and absence of a progress indication could make content appear frozen/broken. It is not permission to insert an unnecessary cinematic wait.
- A6's general/red-flash thresholds and A2's stricter AAA rule are different. An actual visual composition still needs flash evaluation; motion preference alone is insufficient.
- A4 concerns status messages without focus or a context change. It does not establish that every route arrival, visual tip or rotating quote belongs in a live region. Announcement usefulness, repetition and interruption must be tested with assistive technology later.
- A3's meaningful order requirement does not imply a focus trap around every loading view. Menu-trigger focus, underlying interactivity, cancellation and destination focus require a coherent interaction model, then actual keyboard/assistive-technology tests.
- A7 contains adjustment/extension and exception detail. Do not quote its turn-off option as the only permissible behavior or conflate operation timeouts with user-response limits.

## 4. Accessibility source register

All seven are official W3C informative explanations quoting their criteria; publication dates UNDATED, accessed2026-11-09. Level labels below are those of the criterion, not a declaration of Orbit conformance.

| ID | Opened source / level | Continuous verified excerpt |
|---|---|---|
| A1 | [Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions),2.3.3/AAA | "Motion animation triggered by interaction can be disabled, unless the animation is essential to the functionality or the information being conveyed." |
| A2 | [Three Flashes](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes.html),2.3.2/AAA | "Web pages do not contain anything that flashes more than three times in any one second period." |
| A3 | [Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order),2.4.3/A | "focusable components receive focus in an order that preserves meaning and operability." |
| A4 | [Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages),4.1.3/AA | "such that they can be presented to the user by assistive technologies without receiving focus." |
| A5 | [Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide),2.2.2/A | "there is a mechanism for the user to pause , stop, or hide it" |
| A6 | [Three Flashes or Below Threshold](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold),2.3.1/A | "or the flash is below the general flash and red flash thresholds" |
| A7 | [Timing Adjustable](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable),2.2.1/A | "The user is allowed to turn off the time limit before encountering it" |

The W3C Understanding index was opened for real hyperlink discovery but is not an additional counted quality source. Initial coordinator APG menu-button retrieval is separately in the central log, not counted toward these seven.

## 5. Discovery/open ledger

All queries/accesses2026-11-09; each final source's URL/status/hash/body path is in the evidence packet and registers above.

| Query / action | Outcome |
|---|---|
| site.w3.org WAI WCAG22 Understanding animation-from-interactions status-messages focus-order three-flashes | Discovery succeeded; actual bodies checked |
| site.unity3d.com Manual LoadSceneAsync loading allowSceneActivation progress 0.9 | Discovery succeeded; Unity redirect retained |
| site.developer.mozilla.org View Transition API skipTransition updateCallbackDone ready finished | Discovery succeeded; MDN body checked |
| site.nngroup.com response times three important limits progress indicators loading animation | Discovery succeeded; two articles opened |
| site.w3.org/WAI/WCAG22/Understanding "Focus Order" "Status Messages" | Discovery succeeded |
| site.w3.org/WAI/WCAG22/Understanding "Three Flashes or Below Threshold" "Pause, Stop, Hide" | Search failed with token-rate limit; actual W3C index links supplied candidates, direct opens succeeded |
| site.web.dev articles preload critical assets resource hints fetchpriority prefetch | Discovery succeeded; preload source opened |
| site.dev.epicgames.com documentation asynchronous asset loading Unreal Engine loading screens | Discovery succeeded; actual Epic article checked |
| site.developer.mozilla.org AbortController abort fetching response bodies streams | Discovery succeeded; actual MDN reference checked |
| gh API: AsyncLoadingScreen README | Text retrieved; no plugin/script execution |
| Context7 MDN discovery/context | Auxiliary retrieval worked; aggregation is not an extra counted primary source |

## 6. What this round does not establish

No perceived-performance/quote-effect experiment, native screen-reader result, physical-device result, complete-asset readiness, cancellation implementation, flash-test result or WCAG conformance is established. No final C transit duration, layout, palette, focus target, sound, quote-rotation policy or new app behavior is selected. Preserve the A2 failure/coverage record; source guidance explains design questions, not completed repairs.
