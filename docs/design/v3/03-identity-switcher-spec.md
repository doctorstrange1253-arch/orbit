# Identity Worlds: identity switcher specification

**Phase:** C, IW-C. **Date:** 2026-11-10. **Status:** Design draft; implementation requires the new CP-C approval. Interaction/layout choices below are designer proposals, not rendered acceptance or new membership policy.

## 1. Intent and authority

Make the current identity understandable and switching deliberately accessible on desktop, tablet and phone. A person can hold multiple account roles; choosing a visual world does not acquire a role, purchase access, change balances or alter earned history.

Confirmed mapping: **Student = Multiverse, Mentor = Dimensions, Peer = Space**. Use the selected Artifacts + Projection foundation and the shared type/opaque working surfaces in the [world bible](02-world-bible.md). The founder chose default cinematic entry with 5–6 verified thoughts and a selectable Fast/normal mode; this selector must not silently make its own entries Fast. Exact transition timing, natural-completion entry behavior and quote rights remain open in the separately developing transition contract. See the [actual default decision](../../../.agent/DECISIONS.md#c-transition-default-chosen---2026-11-10).

Non-goals: changing role IDs or permissions; making a subscription/role-addition flow; replacing Peer Space; imposing a new league/currency name; implementing route preparation, recording recovery or quotation data in C. Stable-ID strategy and final public branding still need the later impact/retheming decisions.

## 2. Current source and problems to replace

| Inspected source fact | Exact anchor | Design consequence |
|---|---|---|
| Both the single-role label and multi-role switcher are hidden below xl | [RoleSwitcher:143-175](../../../FrontEnd/src/components/layout/RoleSwitcher.jsx#L143-L175) | Availability cannot depend on the desktop breakpoint or number of roles |
| Desktop RoleSwitcher is a child of the Profile link | [Navbar:365-374](../../../FrontEnd/src/components/layout/Navbar.jsx#L365-L374) | Profile and switcher must be separate interactive siblings |
| Mobile drawer mounts the same hidden switcher | [Navbar:458-489](../../../FrontEnd/src/components/layout/Navbar.jsx#L458-L489) | Putting it in a drawer alone does not resolve its hidden state |
| Current pick starts the older overlay and navigates immediately | [RoleSwitcher:161-172](../../../FrontEnd/src/components/layout/RoleSwitcher.jsx#L161-L172) | One guarded entry intent replaces simultaneous overlay/navigation triggers |
| A 600ms pointer hold navigates to the full identity page | [RoleSwitcher:118-141](../../../FrontEnd/src/components/layout/RoleSwitcher.jsx#L118-L141) | No essential action requires a hold or hidden gesture |
| Chip shared-page fallback uses last-window storage then Mentor/Student priority | [RoleSwitcher:68-87](../../../FrontEnd/src/components/layout/RoleSwitcher.jsx#L68-L87) | Route identity, retained context and membership must not be conflated |
| Navbar and useSoul have different shared-page context behavior | [Navbar:158-177](../../../FrontEnd/src/components/layout/Navbar.jsx#L158-L177), [useSoul:30-40](../../../FrontEnd/src/hooks/useSoul.js#L30-L40) | Future shared context must be resolved once, not by competing component priorities |
| Current /identity has its own choice and 2600ms fallback navigation | [IdentitySelection:28-46](../../../FrontEnd/src/pages/IdentitySelection.jsx#L28-L46) | Full-page choice must use the same future guard/coordinator, not another timer |
| App watches changed path identity and also starts transit | [App:296-306](../../../FrontEnd/src/App.jsx#L296-L306) | Route observation must not launch a second ceremony after commit |
| Visual Peer id is peer, while account role is peer_learner | [registry:24-69](../../../FrontEnd/src/soul/registry.js#L24-L69) | Explicit translation, never an assumed equality of all identifiers |
| Mentor home and recorder have a role guard; /mentor/apply does not | [App:809-824](../../../FrontEnd/src/App.jsx#L809-L824) | Application access is not Mentor workspace access |
| Current client RoleGuard checks role arrays and renders a Settings link | [RoleGuard:25-42](../../../FrontEnd/src/components/common/RoleGuard.jsx#L25-L42), [RoleGuard:50-76](../../../FrontEnd/src/components/common/RoleGuard.jsx#L50-L76) | Source-visible client checks are not production authority, instant-addition or price evidence |
| Recorder unmount stops recorder/RAF/streams and revokes part URLs | [Recorder:122-131](../../../FrontEnd/src/pages/mentor/Recorder.jsx#L122-L131) | Guard before unmount; a visual switch cannot promise to preserve in-memory capture afterward |

The [A2 evidence](01-ui-visual-evidence.md) retains actual mobile absence and desktop Profile navigation observations. This specification does not claim those defects are repaired. Comments about timing, permission or reduced motion do not override executed source behavior.

## 3. Proposed form and visual grammar

**One ordinary chooser dialog, responsive placement.** A compact, independent header button opens an opaque anchored dialog on wide layouts; the same semantics/content become a bounded sheet on narrow layouts. This is a designer choice within the selected foundation, not a separately approved final screen.

Alternatives considered: a full-page ceremony on every opening makes routine inspection expensive; keeping the old tiny menu preserves the nested-link/mobile/gesture problems; a moving three-world carousel makes eligibility and controls depend on scenery. The proposed chooser spends the visual distinction on three small settled silhouettes and lets the entry transition carry the spectacle.

- Header trigger: visible current identity text, a small bespoke settled symbol and a disclosure affordance. Proposed accessible name: "Choose identity. Current: Student, Multiverse" for that actual context. Profile has its own link and hit area.
- Student symbol: enclosed cutaway aperture. Mentor: open bridged planes. Peer: preserved Space emblem. These are art descriptions, not new assets; accessible adjacent text carries identity and state.
- Text/actions stay upright, left aligned and opaque. No orbiting targets, looping glows, perspective labels, thumbnail hover journeys or numbers pretending to be rank.
- Use the world-bible Poppins/Open Sans hierarchy, ink/porcelain/raised-slate text surfaces and identity accents only in their permitted roles. No new palette or chart encoding is defined here. Identity color is not access status.
- Suggested wide dialog width is 360px when it fits, constrained by viewport gutters; narrow layouts use the available width with proposed 16px side gutters. These are design references, not locked breakpoints.
- Proposed control targets are at least 44px in both dimensions. Identity names/world descriptors and availability reasons wrap; they are never reduced to a color dot or inaccessible ellipsis.

```text
Wide header
[Orbit] [section navigation]     [Student / Multiverse] [Profile]
                                      chooser trigger

Choose identity                                      [Close]
[enclosed aperture] Student     Multiverse    Current
[open joined planes] Mentor    Dimensions    [actual state]
[preserved emblem] Peer        Space         [actual state]
[Explore identities]        [Transition preference control]

Narrow header
[Orbit] [Student / Multiverse] [Sections]

Choose identity                                      [Close]
[Student / Multiverse] [actual state or entry action]
[Mentor / Dimensions] [actual state or entry action]
[Peer / Space]        [actual state or entry action]
[Explore identities]
Transition: [Cinematic selected] [Fast]
```

The sketches describe structure, not a particular account's entitlements. Proposed fixed row order is Student, Mentor, Peer; it is not a ladder or relative status. Each row is a list item with ordinary buttons/links where an action is supported, not an ARIA menu, listbox or radio pretending navigation is a form value.

## 4. Context and destination rules

Proposed selector context has three separate facts: route world, last successfully entered world for the current account/session, and destination eligibility. Selection/preparation does not update the committed context.

1. A canonical world route resolves its visual context from the actual supported route, using segment boundaries rather than a loose prefix match. Current aliases /courses, /gameology and /skill-map belong to Student in [registry:75-92](../../../FrontEnd/src/soul/registry.js#L75-L92); future routing must preserve supported exceptions such as the public skill-map route.
2. On a shared page, use the last successfully committed world only if it belongs to the current account/session context. Do not take a stale prior-account storage value or silently choose Mentor because it is the highest-priority membership.
3. With no valid retained context, show a neutral Account/Choose identity control rather than invent a current world. This does not alter the current login landing policy in [authStore:44-55](../../../FrontEnd/src/store/authStore.js#L44-L55).
4. A route can have Student/Mentor visual context while access is blocked, unknown or public-only. Current is an independent route-context marker, not an eligibility state. Keep that marker beside the actual reason; its row is readable noninteractive content unless Current and workspace eligibility are both confirmed. Do not imply membership or quietly rebrand it as an authorized Peer destination. Close always remains available.
5. The proposed home actions reuse the current Peer /peer/dashboard, Mentor /mentor/observatory and Student /student/universe destinations in [registry:24-69](../../../FrontEnd/src/soul/registry.js#L24-L69). This is a low-risk proposal, not final ID migration approval.
6. Activating a confirmed Current row closes the chooser and returns focus without navigating or restarting cinema. A blocked/unknown/public-only Current row has no close-only row button or Enter action; its marker/reason remain readable. An explicit home link, if needed on a child/shared page, is a separate guarded navigation action requiring destination eligibility; it must not discard that page's work.
7. Explore identities reuses /identity only after the same source-work guard. Browsing is ordinary guarded navigation, not entry into a role or a second cinematic. The later page refit has an explicit Return action to a validated, current-session originating location; direct visits without that context use a supported eligible home/back destination rather than an untrusted return URL. That Return is guarded if browsing itself acquires destructive work. The full-page Current row is descriptive; Open home is a separate eligible, guarded action. Remove both the current mount-time unconditional transit cancellation and fallback navigation timer from that refit; viewing descriptions must not cancel another attempt, add roles or reveal protected data. Opening the chooser itself does not run a transition.

No local storage value, visual emblem or role-array fallback proves fresh authorization. Read-only eligibility must reuse supported session/policy sources; unverified access stays unknown, not available. Detailed authority/cache/readiness lifecycle belongs to the transition contract, not a new backend policy in this document.

## 5. Availability and chooser states

| State | Visible behavior | Allowed action / boundary |
|---|---|---|
| Closed | Actual current context in the reachable header control | Open chooser; no network mutation or cinematic |
| Open | Title, Close, three labeled rows, supported actions, transition preference | Inspect without changing identity |
| Current and confirmed | Current word plus non-color mark distinct from focus; route context and eligibility both confirmed | Row closes chooser; no home redirect |
| Current but blocked, unknown or public-only | Independent Current context marker plus the truthful reason; readable noninteractive row | No row Enter or close-only button; use the dialog Close control |
| Available destination | Identity/world and plain Enter action | Emit one guarded entry intent; recheck before commitment |
| Eligibility checking | "Checking access" in affected row; other confirmed rows remain usable | No speculative Enter for that row; Close remains available |
| Unavailable / role not held | Verified reason, not a price or claim of instant activation | No workspace entry; separate supported explanation/settings link if applicable |
| Application pending | Authoritative pending message when actually supplied | Separate View application action to /mentor/apply only where supported; never a recorder shortcut |
| Eligibility error | "Access could not be checked" with supported Retry | Not a locked/subscription-expired claim; no private preparation on a guess |
| Guard needed | Source-specific leave warning after destination selection | Stay or an explicit source-supported resolution; no source cover/unmount yet |
| Preparing destination | Chooser hands off to the single transition region | Truthful status, Cancel and preparation controls from the transition contract |
| Destination failed | Coordinator retains actionable failure/source context | Retry/Cancel according to actual state, not successful empty arrival |

Unavailable rows remain readable noninteractive list content with their reason; do not create a disabled giant button whose explanation cannot be reached. A separate explanation link is a sibling, not an interactive child of an Enter button. If a state/recovery route is not supported, show the honest reason without inventing an application, billing or upgrade action.

One-role accounts still have a reachable chooser for current-context inspection and descriptions; this does not imply the two other roles are purchasable, pending or unlocked. Signed-out use stays within existing authentication boundaries and contains no cached private eligibility.

Proposed S2 release prerequisite: align the client denial/explanation surfaces reached from the chooser with these known/unknown states and supported actions. Remove unsupported instant-activation claims; a missing/stale role payload cannot be presented as verified workspace access merely through a client fallback. This is client status/copy consistency assigned to the screen/impact/slice specifications, not a new role-addition flow, server policy, stored-role migration or billing feature. Do not ship the chooser's truthful uncertainty alongside a contradictory denial page.

## 6. Interaction, keyboard and assistive technology

Proposed wide and narrow choosers share modal dialog semantics, not the old role=menu contract. Visually anchored placement does not change keyboard behavior.

- Trigger is a real button with aria-haspopup=dialog, aria-expanded and aria-controls referring to the mounted chooser. It is outside Profile/brand links and outside clipped header overflow; a future overlay layer can position it without changing reading order.
- Enter/Space opens it once. Focus moves to its titled introduction, programmatically focusable, followed in ordinary Tab order by Close, available row actions, explanation links and supporting controls. No arrow-key requirement is invented for a simple list of buttons.
- Tab/Shift+Tab stay within the open modal. The page behind it is inert; closing restores its prior inert/scroll state. Reuse supported dialog primitives or implement/test the full behavior later; a role attribute alone is not acceptance.
- Escape dismisses the chooser and returns focus to the connected, enabled trigger. If that node no longer exists, use a safe source-page heading/navigation fallback, never a detached element. Outside-pointer dismissal is allowed for the chooser only.
- Action classes have explicit focus/close behavior. Current/Close/Escape/outside dismissal closes and restores source focus without navigation. Retry updates the relevant access check in place; preference changes remain in the chooser and never enter a world. Neither steals focus or dismisses the chooser. A workspace Enter action transfers focus to the source guard when required, then to the single transition. Explore/Settings/explanation/View application/Return links guard destructive source work, then use ordinary destination-page focus; they are not workspace-entry shortcuts. If an action truly enters another workspace, classify it as workspace Enter and honor Cinematic/Fast rather than secretly bypassing the default. Do not flash focus back to the header between a guard and its next region. Only one modal owns focus at a time.
- The shell closes an already-open Sections drawer before opening the chooser, without its legacy hamburger-focus restoration racing the chooser introduction. The chooser becomes the sole dismissal/focus owner; its Close restores the independent header chooser trigger, not the hamburger. Do not automatically reopen the drawer. Existing drawer Escape/outside listeners cannot remain active behind the chooser.
- Guard dismissal, cinematic Skip, Cancel and Enter now are different actions. This chooser does not assign Escape/outside-dismiss semantics to the transition or silently cancel capture. The transition contract owns that interaction.
- Decorative silhouettes are hidden from assistive technology when adjacent text already names them. Current, eligibility and keyboard focus have distinct text/non-color cues. Display order and Tab order agree.
- Use one concise announcement for meaningful access-check/error state changes; not live announcements for each art detail or every re-render. Error reasons remain ordinary readable content and are associated with their relevant action.
- Retarget, logout, route teardown and browser history invalidate stale dialog callbacks. No delayed close/focus/navigation from an old attempt can act on a newer chooser or another session.

The [B accessibility annex](research-transitions-accessibility.md#4-accessibility-source-register) supports focus-order/status/motion questions, not native screen-reader or WCAG certification. Screen-reader detection is never a policy input.

## 7. Source-work preservation before entry

Every app-owned in-app navigation that can unmount or replace destructive source work uses the same future protection boundary, whether or not it changes worlds: chooser/home/Explore/full-identity actions, Profile, section navigation, Settings/explanation/View application links, back/forward and supported programmatic navigation. Inspect the real source state before covering or unmounting it. Dismissal, Retry and preference edits are not navigation and need no leave guard. This broader interception is preservation work, not permission to redesign those destination pages or policies; the impact/slice documents must assign its shell and source integrations explicitly. Browser/tab/OS termination and crash recovery are outside an in-app guard guarantee and retain their separate recovery requirements.

- Dirty editor: Stay is the safe default. Save and continue exists only when the source already supports a confirmed save; failed/pending save stays at the source. Explicit discard, if offered, must name the loss and require a deliberate source-supported choice. This spec does not grant autosave or invent recovery.
- Active quiz/attempt: do not auto-submit, reset answers or treat a preserved-looking screenshot as retained state. If safe continuation/exit is not supported, block the switch and explain how to finish or deliberately leave through existing controls.
- Countdown, recording, paused recording, processing, review with unsaved parts or active media sources: no automatic stop, publish, device request or unmount. Offer Stay/Return to recording controls. Finish/save or source-stop decisions happen explicitly in the recorder; re-evaluate the guard afterward.
- Source capture may have permissions and live tracks before actual recording. A role change is not consent to keep or stop them invisibly. No cross-world background-recording capability is introduced.
- Pending upload/save: never report a successful save from transfer completion alone or detach a source operation without a supported ownership/recovery mechanism. If preservation cannot be proved, switching remains blocked.
- No guard means no known destructive source state, not an excuse to run mounted destination effects in the background. Preparation remains read-only and never requests camera/microphone/display capture.

The source remains available until the transition coordinator can safely commit. Whether the router can preserve particular mounted source/history cases is an implementation feasibility check; if it cannot, that trigger must be guarded/blocked rather than covered by a false persistence claim.

## 8. Responsive, motion and preference behavior

The header trigger is present at the 1280/768/360 design references, including when the section drawer is closed. On constrained headers, relocate nonessential profile/streak controls to ordinary section navigation before compressing the identity label/hit area. The shared Peer page composition outside these controls remains preserved.

The chooser sheet respects safe areas and the visual viewport. Close/title remain discoverable; one normal content scroll region exposes every row/action, with focus scrolled into view. Do not stack it inside the section drawer, trap it below a sticky transport dock, or require an unreachable nested scroll. A soft keyboard, 200% native zoom, short landscape viewport and long translated labels are explicit later checks, not claimed passes.

A single restrained opacity opening is optional; a truly static opening must also exist. Reduced motion removes nonessential movement independently of the saved Cinematic/Fast choice. No scene/capture audio starts merely because the chooser opened.

Cinematic/Fast is a labeled preference control, separate from the identity actions. Cinematic remains the chosen default when no preference exists. Changing that control persists only the presentation preference under the future agreed storage strategy; it does not enter a world, add a role or change eligibility. Unknown/failed persistence must not be advertised as synced across accounts/devices. The exact preference storage and transition mechanics are still design proposals.

## 9. Proposed acceptance scenarios: NOT RUN

| Case | Given / when | Required observable result |
|---|---|---|
| S01 | At each 1280/768/360 reference, section drawer closed; open chooser | Visible reachable trigger; titled chooser; no route/account change |
| S02 | Desktop Profile next to chooser; activate either | Profile alone opens Profile; chooser alone opens dialog; no nested action propagation |
| S03 | One-role account; inspect chooser | Current is readable; unavailable/unknown rows do not become Enter or invented upgrade offers |
| S04 | Pointer, Enter and Space each open chooser | Exactly one opening; no long-press delay or separate ceremony |
| S05 | Modal open; Tab/Shift+Tab, Escape and outside pointer | Focus stays in dialog while open; dismissal restores safe source focus and page inert/scroll state |
| S06 | Current row on a child route; activate row | Close only; source route/work preserved; zero transition/duplicate history entries |
| S07 | Shared page after valid Peer entry; inspect context | Peer context, not Mentor-priority fallback; membership is shown separately |
| S08 | Shared page with prior-account storage/no valid context | Neutral context; no prior-account identity/eligibility/private data reused |
| S09 | Eligibility checking/error/pending/unavailable separately | Distinct truthful reason/action; none is falsely confirmed workspace access |
| S10 | Pending Mentor application; use supported View application | /mentor/apply guard path; no protected recorder mount or role mutation |
| S11 | Dirty editor; switch then Stay, failed Save, confirmed Save | Stay/failure preserve source; only confirmed source-supported resolution permits a new intent |
| S12 | Active quiz/countdown/recording/paused/review/active tracks | No submit/stop/unmount/device request; unsupported preservation blocks switching |
| S13 | Available cross-world choice; trigger again or later route watcher | One coordinator intent/commit, not duplicate overlays/timers; late old callbacks ignored |
| S14 | Cancel before commitment; source mounted | Original location/work remains; safe focus restored; no target history push |
| S15 | Logout/account change during eligibility or preparation | Old callbacks/contexts invalidated; no private target arrival or stale focus restoration |
| S16 | Reduced motion toggled and Fast preference changed | Static equivalent when requested; no automatic Fast assignment; Cinematic default remains otherwise |
| S17 | Native 200% zoom, long labels, short landscape, keyboard open | Labels/reasons/Close/actions reachable without clipping, overlapping controls or trapped scroll |
| S18 | Destination core failure versus valid empty success | Different visible states; failure never becomes successful empty arrival |
| S19 | Full /identity choice or guarded cross-world deep link | Same source-work/eligibility boundary; no fallback timer bypass |
| S20 | Scenic rendering/thumbnail failure | Text and controls still usable; no eligibility change or source/recording dependency |
| S21 | Dirty recorder/editor; Profile, section, Settings, View application or back/forward would unmount it | Same protection boundary as a world switch; no silent loss through a non-world exit |
| S22 | Blocked/unknown/public-only route has a Current world marker | Reason remains readable; row has no workspace Enter/close-only action; dialog Close remains usable |
| S23 | Browse /identity, Return, direct visit and a prior transit callback | Validated current-session return or supported eligible fallback; no mount-cancel or timer bypass; Current is descriptive with a separate guarded Home action |
| S24 | Sections drawer open; open and close header chooser | Drawer closes once; chooser alone owns focus/dismissal; no hamburger restoration race or automatic drawer reopening |
| S25 | Retry or presentation preference activated inside chooser | Chooser/focus stay in place; no navigation, guard or unintended transition; real workspace Enter still honors selected mode |
| S26 | Missing/stale eligibility reaches chooser and client denial surface | Consistent unknown/blocked reason and supported actions; no verified Peer access or instant-role-activation claim inferred from a fallback |

## 10. Remaining decisions and verification boundary

Designer proposals settled for this draft: separate header control; one dialog contract with responsive placement; text-first settled silhouettes; explicit Current no-op; neutral unknown shared context; safe Stay/block defaults for destructive work. These can be revised at CP-C and are not attributed to the founder as exact requirements.

Owner decisions remain public names, final screen cuts/merges, preference-storage/flag/ID strategy, transition duration/count/entry contract, rights-cleared quotation pool and sound policy. This document deliberately specifies neither paid role activation nor additional recorder/quiz capabilities.

The fresh builder review inspected the draft and relevant selector/router/guard/recorder sources, then identified six planning gaps. Main resolved them as designer proposals: protection for every destructive in-app exit, independent Current/eligibility state, denial-surface consistency as an S2 prerequisite, explicit full-page browsing/Return/Home behavior, action-class-specific focus/dismissal, and drawer-to-chooser ownership. S21–S26 make those corrections observable. The corrected draft was not independently re-reviewed; this is not a blanket buildability or runtime acceptance claim.

Verified input: current RoleSwitcher, Navbar, registry, authStore, useSoul, IdentitySelection, client RoleGuard, named App route/transit sections and recorder unmount section were read. Not inspected for this draft: all backend authorization/pending-state producers, every editor/quiz persistence path, router blocker feasibility, native dialog/browser/device behavior or actual media recovery. All scenarios are future checks, not test results. No application source, assets or data were changed.
