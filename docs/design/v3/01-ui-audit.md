# Identity Worlds UI audit: existing system

Date: 2026-11-08. Task: IW-A. Authorization: user typed APPROVE after posted CP-R, opening Phase A only. Branch: feature/orbit-v3-foundation; HEAD: ae9ba9653a35e6c4b1d656bef9ce8956282f2509.

**A2 revision note,2026-11-09:** the paragraphs below retain the original2026-11-08source-only audit and its then-valid capability restrictions. The user subsequently authorized local skill/setup/browser evidence. Both mandatory skills were installed and runtime-invoked; the real isolated frontend now has images for all147selected49-screen/three-width slots, plus state/runtime probes and actual failures. See the [visual evidence and critique](01-ui-visual-evidence.md) and [tool provenance](installed-skills-and-capture-tooling.md). Historical BLOCKED/NOT_CAPTURED claims are not the current capability status. Application design/implementation, B/C/D and snapshot/publication approval remain gated. The original [v3CP-A](../../progress/checkpoints/v3/CP-A.md) is preserved unchanged; the revision will be posted separately as CP-A-r2.

**Historical2026-11-08outcome: source-audit round complete; required rendered critique/captures BLOCKED.** This is an inventory and evidence audit, not a redesigned visual system or full visual acceptance. No application code, assets, quote data, dependencies, stable IDs or database values were changed. FP2 C01 and unrelated dirty work remain paused/preserved. Snapshot NOT_CREATED; installation, servers/watchers, authenticated provider calls, paid services, migrations and commits remain unauthorized.

## 1. Evidence contract and coverage

- **SOURCE:** directly inspected current source, route declarations or exact filesystem metadata. Structural findings describe concrete code/markup behavior; no browser reproduction is implied.
- **INFERENCE:** consequence derived from that source, requiring rendered/runtime confirmation where stated.
- **HISTORICAL:** existing captures or R test/build results; not fresh A UI/device acceptance.
- **BLOCKED / UNVERIFIED:** unavailable mandatory skill, capture, screen-reader, computed-style, frame/memory or live-route evidence. No invented scores, screenshots or quote provenance.

Inspected all 77 Route declarations in [App.jsx:754-870](../../../FrontEnd/src/App.jsx#L754-L870): 8 Peer-prefixed, 15 Mentor-prefixed, 7 Student-prefixed, 47 other shared/public/redirect/preview declarations. A static extractor also produced 48 selected identity-linked/shared/fallback root-file excerpt inventories; additional full reads cover the primary homes, switch/transit, journey, tokens and selected secondary screens. Excerpts inventory roots/imports/queries/headings/states; they are not an exhaustive review of every nested widget, dynamic admin route, API handler or media/RTC state. The route table below includes public and legacy paths to prevent hidden scope loss.

Current [CLAUDE](../../../CLAUDE.md), [STATE](../../../.agent/STATE.md), [PATHS](../../../.agent/PATHS.md), [DECISIONS](../../../.agent/DECISIONS.md) and [R skill routing](../../progress/identity-worlds-skills-routing.md) govern the work. Student = Multiverse; Mentor = Dimensions; Peer = Space is the new user assignment, not the current code's completed theme. Mandatory frontend-design/design-critique remain absent in checked active locations; no generic agent was substituted for them. One narrowly delegated inventory helper returned no usable evidence; inventory was recovered inline, with failure/encoding limits recorded in [ERRORS](../../../.agent/ERRORS.md).

### Capture capability

Exact C:/Users/Dell/AppData/Local/Tabbit/LocalAgent/bin/tabbit-cli.exe was absent. Read installed Tabbit guidance; did not invoke its launcher, switch browser backends, install tooling or start the application. No other authorized capture route was established. **Fresh 360/768/1280 identity screenshots: NOT_CAPTURED.** Formal skill-led visual hierarchy/consistency/polish critique, browser keyboard/SR/axe checks, computed contrast and runtime performance remain BLOCKED/UNVERIFIED.

PNG-header metadata verified 9 existing progress screenshots and 13 Lab captures. These are historical login/Lab/rank-export evidence: e.g. [login-360](../../progress/screenshots/login-360.png), [Lab-768](../../progress/screenshots/lab-768.png), [shuttle-flight-1280](../lab-captures/shuttle-flight-1280.png). They do not show current authenticated Student/Mentor/Peer pages, the new switcher, a 300-level course or an infinite curtain. No new screenshots were created or visually scored.

## 2. Complete route declaration inventory

P = authenticated ProtectedRoute; M = additional mentor RoleGuard; S = student RoleGuard; SM = student OR mentor; L = shared Layout without ProtectedRoute; O = public-only redirect when authenticated. Client guards are presentation checks, not server authorization proof. Every route below links its current declaration; repeated components/aliases are kept explicitly.

### Peer window: 8 declarations

| Route | Screen root | Guard | Declaration |
|---|---|---|---|
| /peer/dashboard | MyOrbit | P | [App:799](../../../FrontEnd/src/App.jsx#L799) |
| /peer/browse | BrowseSkills | P | [App:800](../../../FrontEnd/src/App.jsx#L800) |
| /peer/matches | Matches | P | [App:801](../../../FrontEnd/src/App.jsx#L801) |
| /peer/connections | Connections | P | [App:802](../../../FrontEnd/src/App.jsx#L802) |
| /peer/nearby | NearbyMap | P | [App:803](../../../FrontEnd/src/App.jsx#L803) |
| /peer/trust | TrustScore | P | [App:804](../../../FrontEnd/src/App.jsx#L804) |
| /peer/calls | VideoCall history/entry | P | [App:805](../../../FrontEnd/src/App.jsx#L805) |
| /peer/calls/:roomId | VideoCall room | P | [App:806](../../../FrontEnd/src/App.jsx#L806) |

### Mentor window: 15 declarations

| Route | Screen root | Guard | Declaration |
|---|---|---|---|
| /mentor/observatory | Mentor Observatory | P+M | [App:809](../../../FrontEnd/src/App.jsx#L809) |
| /mentor/apply | MentorHub application machine | P; intentionally not M | [App:815](../../../FrontEnd/src/App.jsx#L815) |
| /mentor/hub | MentorHub | P+M | [App:816](../../../FrontEnd/src/App.jsx#L816) |
| /mentor/sessions | MentorSessions | P+M | [App:817](../../../FrontEnd/src/App.jsx#L817) |
| /mentor/earnings | Earnings | P+M | [App:818](../../../FrontEnd/src/App.jsx#L818) |
| /mentor/courses | CourseList | P+M | [App:820](../../../FrontEnd/src/App.jsx#L820) |
| /mentor/courses/new | CourseBuilder | P+M | [App:821](../../../FrontEnd/src/App.jsx#L821) |
| /mentor/courses/:id/edit | CourseEditor | P+M | [App:822](../../../FrontEnd/src/App.jsx#L822) |
| /mentor/courses/:id/lessons/:lessonId | LessonEdit | P+M | [App:823](../../../FrontEnd/src/App.jsx#L823) |
| /mentor/recorder | Recorder | P+M | [App:824](../../../FrontEnd/src/App.jsx#L824) |
| /mentor/media | MediaLibrary | P+M | [App:825](../../../FrontEnd/src/App.jsx#L825) |
| /mentor/pact | PactHall | P+M | [App:827](../../../FrontEnd/src/App.jsx#L827) |
| /mentor/moderation | Moderation wrapper/inbox | P+M | [App:829](../../../FrontEnd/src/App.jsx#L829) |
| /mentor/analytics | Analytics | P+M | [App:830](../../../FrontEnd/src/App.jsx#L830) |
| /mentor/students | Students | P+M | [App:831](../../../FrontEnd/src/App.jsx#L831) |

### Student window: 7 declarations

| Route | Screen root | Guard | Declaration |
|---|---|---|---|
| /student/universe | Universe | P+S | [App:834](../../../FrontEnd/src/App.jsx#L834) |
| /student/learning | Learning | P+S | [App:835](../../../FrontEnd/src/App.jsx#L835) |
| /student/certificates | Certificates | P+S | [App:836](../../../FrontEnd/src/App.jsx#L836) |
| /student/sessions | MySessions | P+S | [App:837](../../../FrontEnd/src/App.jsx#L837) |
| /student/mentors | Sessions directory | P+S | [App:838](../../../FrontEnd/src/App.jsx#L838) |
| /student/mentors/:userId | SessionDetail/booking | P+S | [App:839](../../../FrontEnd/src/App.jsx#L839) |
| /student/room/:sessionId | OrbitSessionRoom | P+SM | [App:840](../../../FrontEnd/src/App.jsx#L840) |

### Shared, public, aliases and preview: 47 declarations

| Route | Screen / destination | Guard / disposition | Declaration |
|---|---|---|---|
| / | HomeRoute: web Landing; native role-home/login redirect | Public/native branch | [App:754](../../../FrontEnd/src/App.jsx#L754) |
| /login | Login | O | [App:755](../../../FrontEnd/src/App.jsx#L755) |
| /register | Register | O | [App:756](../../../FrontEnd/src/App.jsx#L756) |
| /signup | /register | Redirect | [App:758](../../../FrontEnd/src/App.jsx#L758) |
| /signin | /login | Redirect | [App:759](../../../FrontEnd/src/App.jsx#L759) |
| /skills | /peer/browse | Redirect | [App:760](../../../FrontEnd/src/App.jsx#L760) |
| /oauth/callback | OAuthCallback | Public/auth callback | [App:761](../../../FrontEnd/src/App.jsx#L761) |
| /forgot-password | ForgotPassword | Public | [App:762](../../../FrontEnd/src/App.jsx#L762) |
| /reset-password/:token | ResetPassword | Public; literal parameter, no token read | [App:763](../../../FrontEnd/src/App.jsx#L763) |
| /profile | Profile | P | [App:766](../../../FrontEnd/src/App.jsx#L766) |
| /profile/:userId | PublicProfile | L | [App:767](../../../FrontEnd/src/App.jsx#L767) |
| /leaderboard | Leaderboard: Cosmic/Gameology/Pact tabs | P | [App:768](../../../FrontEnd/src/App.jsx#L768) |
| /orbit | Orbit | P | [App:769](../../../FrontEnd/src/App.jsx#L769) |
| /orbit/history | MissionLog | P | [App:770](../../../FrontEnd/src/App.jsx#L770) |
| /shop | Shop | P | [App:771](../../../FrontEnd/src/App.jsx#L771) |
| /holobay | HoloBay | P | [App:772](../../../FrontEnd/src/App.jsx#L772) |
| /observatory | Cosmic Observatory, distinct standing screen | P | [App:773](../../../FrontEnd/src/App.jsx#L773) |
| /cosmic-atlas | TierAtlas | L | [App:774](../../../FrontEnd/src/App.jsx#L774) |
| /settings | Settings/RoleSettings | P | [App:775](../../../FrontEnd/src/App.jsx#L775) |
| /courses | CoursesBrowse/WaitingRoom | P | [App:777](../../../FrontEnd/src/App.jsx#L777) |
| /courses/:id | CourseDetail | P | [App:778](../../../FrontEnd/src/App.jsx#L778) |
| /courses/:id/learn | CourseLearn | P | [App:779](../../../FrontEnd/src/App.jsx#L779) |
| /courses/:id/learn/:lessonId | CourseLearn | P | [App:780](../../../FrontEnd/src/App.jsx#L780) |
| /courses/:id/certificate/:certId | CertificatePage | P | [App:781](../../../FrontEnd/src/App.jsx#L781) |
| /plans | Pricing | P | [App:783](../../../FrontEnd/src/App.jsx#L783) |
| /pricing | /plans | Redirect | [App:784](../../../FrontEnd/src/App.jsx#L784) |
| /gameology | Gameology | P | [App:785](../../../FrontEnd/src/App.jsx#L785) |
| /identity | IdentitySelection/IdentityBloom | P, therefore Layout is present | [App:790](../../../FrontEnd/src/App.jsx#L790) |
| /skill-map | SkillMap | P | [App:795](../../../FrontEnd/src/App.jsx#L795) |
| /skill-map/:userId | SkillMapPublic | L | [App:796](../../../FrontEnd/src/App.jsx#L796) |
| /dashboard | /peer/dashboard | Redirect | [App:843](../../../FrontEnd/src/App.jsx#L843) |
| /browse | /peer/browse | Redirect | [App:844](../../../FrontEnd/src/App.jsx#L844) |
| /matches | /peer/matches | Redirect | [App:845](../../../FrontEnd/src/App.jsx#L845) |
| /connections | /peer/connections | Redirect | [App:846](../../../FrontEnd/src/App.jsx#L846) |
| /nearby | /peer/nearby | Redirect | [App:847](../../../FrontEnd/src/App.jsx#L847) |
| /trust | /peer/trust | Redirect | [App:848](../../../FrontEnd/src/App.jsx#L848) |
| /video | /peer/calls | Redirect | [App:849](../../../FrontEnd/src/App.jsx#L849) |
| /call/:roomId | /peer/calls/:roomId | Param-preserving LegacyRedirect | [App:850](../../../FrontEnd/src/App.jsx#L850) |
| /sessions | /student/mentors | Redirect | [App:851](../../../FrontEnd/src/App.jsx#L851) |
| /sessions/:userId | /student/mentors/:userId | Param-preserving LegacyRedirect | [App:852](../../../FrontEnd/src/App.jsx#L852) |
| /session-room/:sessionId | /student/room/:sessionId | Param-preserving LegacyRedirect | [App:853](../../../FrontEnd/src/App.jsx#L853) |
| /my-sessions | /student/universe | Redirect; not sessions history | [App:854](../../../FrontEnd/src/App.jsx#L854) |
| /teach | /mentor/observatory | Redirect | [App:855](../../../FrontEnd/src/App.jsx#L855) |
| /cosmic-gallery | BadgeGallery | L; URL-only QA surface | [App:858](../../../FrontEnd/src/App.jsx#L858) |
| /reveal | OrbitTeaserReveal | Standalone marketing preview | [App:861](../../../FrontEnd/src/App.jsx#L861) |
| /dev/lab | LookDevLab | DEV-only conditional route | [App:865](../../../FrontEnd/src/App.jsx#L865) |
| * | AdminGate with NotFound fallback | Dynamic hidden admin routing not audited | [App:870](../../../FrontEnd/src/App.jsx#L870) |

The route table is source reachability, not proof that authenticated production routes/guards/data work. Preserve parameter encoding in [LegacyRedirect:177-183](../../../FrontEnd/src/App.jsx#L177-L183). [MySkills.jsx](../../../FrontEnd/src/pages/MySkills.jsx) and [AdminDashboard.jsx](../../../FrontEnd/src/pages/AdminDashboard.jsx) exist in the page directory but are not directly routed by these declarations; presence does not authorize deletion. IdentitySelection comments describe a legacy onboarding alias/no chrome, but the actual declarations do not implement /onboarding/role and ProtectedRoute adds Layout; comments are not evidence of runtime behavior.

## 3. Screen-root and state inventory; reuse boundary

The following 48 selected root records cover identity-linked/shared/fallback surfaces. "Reuse" means retain data/domain intent and service/hook interfaces subject to existing authority/privacy validation, not certify every current implementation. Student/Mentor root layouts, hierarchy, cards, badges, decorative art and motion are **replaceable** after the new CP-C; do not start from the current visual composition. Peer roots are **preserve**, with only later shared-token/switcher harmonization. State entries are observed roots, not a full nested-component state matrix.

### Mentor roots: replace visual layer, preserve logic/contracts

| Root / source anchors | Current sections and observed states | Reusable logic / replaceable visual boundary |
|---|---|---|
| [mentor/Observatory:25-78](../../../FrontEnd/src/pages/mentor/Observatory.jsx#L25-L78) | Application state; masthead/new course; league rail; Luminosity Star; honours; learner StarMap; Pact roll/pulse/rivals; workshop links | Profile/learners/courses/pact queries and student derivation reusable; all star/folio/rail layout replaced. Loading/error currently collapse into not_applied, see findings. |
| [MentorHub:77-173](../../../FrontEnd/src/pages/MentorHub.jsx#L77-L173) | Application/loading/error, approved hub, availability and booking/Pact surfaces | Mentor profile/booking queries, application and AvailabilityEditor contracts reusable; old Earn/Teach hub composition replaced. Same root serves apply/hub. |
| [mentor/CourseList:14-80](../../../FrontEnd/src/pages/mentor/CourseList.jsx#L14-L80) | Published/draft cards, loading shelves, empty CTA, edit/publish/unpublish/preview/delete | courses.list/publish/unpublish/remove and stageCount preserved; Studio cards/reveal/icon buttons replaced. Mutation behavior not revalidated here. |
| [mentor/CourseBuilder:12-112](../../../FrontEnd/src/pages/mentor/CourseBuilder.jsx#L12-L112) | Basics/Thumbnail/Lessons/Review; lesson/quiz draft reducer; uploads and AI proposals | Draft schema/reducer/upload/create/addLesson interfaces preserved; stepper/form/genre-picker visual wrapper replaced. Authoring errors/rollback need later full flow evidence. |
| [mentor/CourseEditor:13-65](../../../FrontEnd/src/pages/mentor/CourseEditor.jsx#L13-L65) | Lessons/Q&A/Enrollments/Settings, publication and lesson mutations; Reading the course fallback | courses.detail/lesson CRUD/reorder/Q&A/enrollment contracts reused; tabs/masthead/cards replaced. Error state missing at root. |
| [mentor/LessonEdit:20-117](../../../FrontEnd/src/pages/mentor/LessonEdit.jsx#L20-L117) | Lesson form/quiz/resources, AI proposal/panel, moderation/YellowCard, loading/not-found | Existing save/AI-review/moderation callbacks and unsaved form data preserved; FuturisticBackdrop/Studio layout replaced, unrelated dirty AI work untouched. |
| [mentor/Recorder:22-120](../../../FrontEnd/src/pages/mentor/Recorder.jsx#L22-L120) | idle/countdown/recording/paused/processing/review; source/mic/camera/layout/whiteboard/cuts/parts/teleprompter/save progress | MediaRecorder/stream/cut/record-stage interfaces and local stop intent retained; controls/layout/motion reskinned only after design. No capture/RTC/rights validation in A. |
| [mentor/MediaLibrary:19-110](../../../FrontEnd/src/pages/mentor/MediaLibrary.jsx#L19-L110) | Video list/queue, course/search filters, drop zone, duplicate/type/size rejection, loading/empty and delete confirmation | Course-to-video normalization, queue/upload/delete contracts preserved; Studio grid/filters/motion replaced. No upload or deletion executed. |
| [mentor/MentorSessions:26-133](../../../FrontEnd/src/pages/mentor/MentorSessions.jsx#L26-L133) | Upcoming/Past URL tabs, loading/error/empty, timed bookings/Join/profile | API booking states, useNow grouping and room links reused; cards/status/masthead replaced. |
| [mentor/Earnings:38-110](../../../FrontEnd/src/pages/mentor/Earnings.jsx#L38-L110) | Loading/error/unapproved, lifetime/pending/month totals, six-month series, released/pending and recent payouts | Actual displayed data and accounting contracts preserved; bars/stat/Studio presentation replaced. Existing payout/timing copy is not newly approved policy. |
| [mentor/PactHall:22-160](../../../FrontEnd/src/pages/mentor/PactHall.jsx#L22-L160) | League rail, prior results, weekly group/pulse/rivals, division/rank/held-week stats | usePactMe/usePactHistory and stable tier/group facts reused; folio/badge/rail/copy replaced, score algorithms unchanged. |
| [Moderation:1-24](../../../FrontEnd/src/pages/Moderation.jsx#L1-L24) | Mentor masthead + ModerationInbox leaf | Inbox actions/appeal state live in the leaf; root visual replaced, safety policy/private evidence not redesigned in A. |
| [mentor/Analytics:33-83](../../../FrontEnd/src/pages/mentor/Analytics.jsx#L33-L83) | Loading/no readings; funnel, top stalled lessons, revenue, by-course summaries | Learner/earnings inputs and derivations reused; microtype/bar/stat hierarchy replaced. No population/learning efficacy or money claim verified. |
| [mentor/Students:180-232](../../../FrontEnd/src/pages/mentor/Students.jsx#L180-L232) | Learner roll, totals, search/sort, progress/course rows, loading/empty/no-match | Enrich/filter/sort and learner data contract reused; rows/microtype/tags replaced. Search accessibility/error-state gaps below. |

### Student roots and learning tools: replace visual layer, preserve learning logic

| Root / source anchors | Current sections and observed states | Reusable logic / replaceable visual boundary |
|---|---|---|
| [student/Universe:21-53](../../../FrontEnd/src/pages/student/Universe.jsx#L21-L53) | Hero; conditional next-up/resume; stats; course planets; loading/UniverseEmpty; CameraZoom | Enrollment/next-lesson/progress calculations and course navigation reused; solar-system dashboard, planets, zoom and stat composition replaced for Multiverse. |
| [student/Learning:161-176](../../../FrontEnd/src/pages/student/Learning.jsx#L161-L176) | In progress/Finished/Not started, resume/begin/certificate actions, StageRail, loading/empty | Enrollment grouping, stable course/lesson links and enrichment reused; ledger rows/rules/typography/progress visuals replaced. |
| [student/Certificates:98-150](../../../FrontEnd/src/pages/student/Certificates.jsx#L98-L150) | Earned/Almost there, certificate rows/seal/date/IDs, loading/empty | Certificate IDs, completion/filter/sort/links reused; record layout/seal/copy/visual hierarchy replaced without fabricating issuance. |
| [MySessions:47-120](../../../FrontEnd/src/pages/MySessions.jsx#L47-L120) | Upcoming/Past, booking statuses/Join/rating, loading/error/empty | Session queries/useNow/rating actions preserved; FuturisticBackdrop/cards/tabs replaced. |
| [Sessions:30-42](../../../FrontEnd/src/pages/Sessions.jsx#L30-L42) | Mentor browse/search/filter/sort/cards; loading/error/empty | Mentor directory/search data/booking links preserved; generic cosmic hero/cards replaced. |
| [SessionDetail:30-70](../../../FrontEnd/src/pages/SessionDetail.jsx#L30-L70) | Mentor rating/profile/topics/About, BookingModal, loading/error/not-found | Mentor data and booking contract retained; profile/booking entry visuals replaced, price/safety rules unchanged. |
| [OrbitSessionRoom:31-110](../../../FrontEnd/src/pages/OrbitSessionRoom.jsx#L31-L110) | Load/error/missing/terminal/live room; start/complete/rate; video-call leaf | Session lifecycle/RTC links/rating facts retained; room chrome/world presentation requires approved specification, no lifecycle repair now. |
| [CoursesBrowse:34-111](../../../FrontEnd/src/pages/CoursesBrowse.jsx#L34-L111) | Catalog/category/search/course cards, skeletons, EmptyState or WaitingRoom | Categories/list filters and Signal Flare/WaitingRoom data contracts reused; catalog/empty/loading visuals replaced. |
| [CourseDetail:43-105](../../../FrontEnd/src/pages/CourseDetail.jsx#L43-L105) | Enrollment detail, CourseMap/StageRail/TrajectoryPath, lesson arrival/boss overlays, Q&A | Enrollment/course/lesson and comment/EnrollButton logic retained; journey/detail hierarchy/maps/motion replaced per later spec. |
| [CourseLearn:44-149](../../../FrontEnd/src/pages/CourseLearn.jsx#L44-L149) | card/video/quiz/completion; sidebar/StageRail, 3D/2D map, Q&A, boss/stage-clear/certificate transitions | Learning/query/mutation facts preserved; visual shells and presentation gates require later redesign. See separate journey audit. |
| [CertificatePage:9-44](../../../FrontEnd/src/pages/CertificatePage.jsx#L9-L44) | Loading, not ready, CertificateView, return/download surface | courses.certificate and issued-artifact data retained; surrounding world/loading presentation replaced. No certificate truth inferred from UI. |
| [Gameology:5-17](../../../FrontEnd/src/pages/Gameology.jsx#L5-L17) | Lifetime level/streak, weekly league/threshold/formula, achievements/locked badges/history | useGameology/useStreak, earned facts and score-source separation retained; all Student league/badge/loading/copy visuals rethemed later. |
| [SkillMap:21-46](../../../FrontEnd/src/pages/SkillMap.jsx#L21-L46) | Private concept constellation/filter/share and loading | knowledge/getMySkillMap contract retained; constellation/nodes/share visual layer replaced, data scope unchanged. |
| [SkillMapPublic:18-49](../../../FrontEnd/src/pages/SkillMapPublic.jsx#L18-L49) | Public concept map, loading/unavailable, links/share | Public payload boundary retained; world-specific rendering rethemed without adding private learner notes. |
| [Pricing:223-302](../../../FrontEnd/src/pages/Pricing.jsx#L223-L302) | Billing plans/loading/subscription action and Mentor allocation explanation | billing.plans/subscribe and approved money direction preserved; shared plan visuals need later world context. No amounts/tax/terms changed by A. |

### Peer roots: preserve the existing Space product

| Root / source anchors | Current surface and states | Preservation boundary |
|---|---|---|
| [peer/MyOrbit:69-190](../../../FrontEnd/src/pages/peer/MyOrbit.jsx#L69-L190) | Masthead/hero/Add Skill/skill archive/stats/week/people/review pull quote; skills loading/error/empty/form | Preserve editorial order, SkillForm/Card, history normalization and members' review text. Only shared-token/switcher harmonization later; do not replace with Student/Mentor visual work. |
| [BrowseSkills:49-55](../../../FrontEnd/src/pages/BrowseSkills.jsx#L49-L55) | Skill search/filter/list, online/connection state, swap/rating modals, skeleton/error/empty | Preserve peer matching/search/connection semantics and Space visuals. |
| [Matches:25-78](../../../FrontEnd/src/pages/Matches.jsx#L25-L78) | Reciprocal matches, online/socket state, request/call, loading/error/no-match | Preserve peer match/notification/call logic and presentation. |
| [Connections:23-74](../../../FrontEnd/src/pages/Connections.jsx#L23-L74) | Established/incoming/sent/completed lists; rating/review modals and separate loading/error/empty branches | Preserve connection/wire states, sent-seen tracking and member reviews. |
| [NearbyMap:63-108](../../../FrontEnd/src/pages/NearbyMap.jsx#L63-L108) | Location/radius/search map and list, geolocation rejection, loading | Preserve map/consent/location semantics; not reskinned as Multiverse/Dimensions. Live location not requested. |
| [TrustScore:141-254](../../../FrontEnd/src/pages/TrustScore.jsx#L141-L254) | Trust score/rating/history/activity, skeleton | Preserve distinction between trust, league and learning measures; no ranking algorithm changes. |
| [VideoCall:599-852](../../../FrontEnd/src/pages/VideoCall.jsx#L599-L852) | Call entry/history/delete confirmations; direct-call/whiteboard/share/mic/camera leaves | Preserve Peer call/whiteboard behavior and member text; no call/recording started or reviewed live. |

### Shared/legacy roots: carry identity context without global renames

| Root / source anchors | Surface and observed states | Boundary |
|---|---|---|
| [IdentitySelection:24-52](../../../FrontEnd/src/pages/IdentitySelection.jsx#L24-L52) | IdentityBloom selection + Begin/transit/fallback navigation | Needs new switch/eligibility orchestration; existing globe/bloom visual is not the new spec. No permission mutation from art. |
| [Leaderboard:381-455](../../../FrontEnd/src/pages/Leaderboard.jsx#L381-L455) | Cosmic/Gameology/Pact tabs, permission visibility and empty states | Preserve facts/queries/IDs; expose identity-specific presentation/default context later, without changing score or cohort policy. |
| [Orbit:13-83](../../../FrontEnd/src/pages/Orbit.jsx#L13-L83) | Streak/freeze/preferences, missions, binary stars, league/duel/milestones, loading/error | Existing Peer virtual economy/Space presentation preserved; shared entry context explicitly audited below. |
| [MissionLog:11-200](../../../FrontEnd/src/pages/MissionLog.jsx#L11-L200) | Daily/weekly missions and Photon ledger history, loading/error | Preserve ledger/source truth and Peer history; never globally retheme historical member data. |
| [Shop:20-28](../../../FrontEnd/src/pages/Shop.jsx#L20-L28) | Photon catalog/rarity/buy/equip/store skeleton | Preserve existing Peer shop; no Student/Mentor wallet separation implemented by renaming it. |
| [HoloBay:20-32](../../../FrontEnd/src/pages/HoloBay.jsx#L20-L32) | Cosmetic fitting/share/equip, rarity/owned/locked/readiness | Preserve Peer fitting room/data; future shared tokens/switcher only. |
| [Observatory:17-27](../../../FrontEnd/src/pages/Observatory.jsx#L17-L27) | Separate legacy cosmic standing/coach/quote/disclosures, loading/error/empty | Do not confuse with Mentor home of the same name or merge without later approval. |
| [TierAtlas:12-15](../../../FrontEnd/src/pages/TierAtlas.jsx#L12-L15) | Current cosmic tier/perk/range/badge atlas | Keep stable source IDs; visible naming mapping belongs to C impact analysis. |
| [Profile:99-185](../../../FrontEnd/src/pages/Profile.jsx#L99-L185) | Own profile/role panels/reviews/avatar/cosmetics/languages, loading and edits | Preserve own-data/edit contracts, cosmetics and reviews; shared-world context/visual scope needs C decision, no global profile replacement assumed. |
| [PublicProfile:21-49](../../../FrontEnd/src/pages/PublicProfile.jsx#L21-L49) | Public profile/skills/ratings/Pact/cosmetic standing, loading/error | Preserve public/private boundary and member-created text; no private data added for a world theme. |
| [Settings:147-158](../../../FrontEnd/src/pages/Settings.jsx#L147-L158) | RoleSettings, mode/palette/background/speed, sound/music/notifications/tours/reset | Keep settings secondary; current role mutation is not equivalent to active identity switching. |
| [NotFound:1-64](../../../FrontEnd/src/pages/NotFound.jsx#L1-L64) | Cosmic fallback/navigation surface | Shared fallback world/copy needs later decision; hidden admin portal not within audit coverage. |

Public auth/marketing/DEV preview routes were inventoried for reachability but not formally critiqued. Nested booking/application/media/RTC/moderation/export/whiteboard/accessibility state machines are inventory dependencies, not verified end-to-end in A. The main reuse seams are [courses service:38-92](../../../FrontEnd/src/services/courses.js#L38-L92), [pact service:6-23](../../../FrontEnd/src/services/pact.js#L6-L23), existing auth/roles, TanStack Query and server-committed progression/ledger facts. Reuse requires retaining behavior and addressing known boundaries, never blindly copying current JSX layouts or granting authority from motion.

## 4. Hierarchy, consistency and polish: observed source, not substitute visual critique

| Identity | Actual hierarchy from source | Evidence / audit consequence |
|---|---|---|
| Student | Hero -> optional next-up/resume -> optional stats -> course-planet sky -> CameraZoom | [Universe:62-169](../../../FrontEnd/src/pages/student/Universe.jsx#L62-L169). Course actions/data are useful; the solar-system/ledger/Studio composition is the visual layer to replace, not the new Multiverse design. |
| Mentor | Masthead/new-course action -> league rail -> Luminosity/honours -> StarMap -> roll -> pulse/rivals -> workshop links | [Observatory:140-374](../../../FrontEnd/src/pages/mentor/Observatory.jsx#L140-L374). Teaching/learner facts reusable; celestial signature/folio/league composition will not be reused as the Dimensions visual layer. |
| Peer | Masthead -> hero -> Add Skill/archive -> numbers -> week -> people -> optional member-review quote -> footer | [MyOrbit:104-190](../../../FrontEnd/src/pages/peer/MyOrbit.jsx#L104-L190). Preserve this existing priority and member content, not replace it merely for family resemblance. |
| Shared shell | Sticky compact header, desktop section rail, mobile drawer; max-w-7xl/padding main except calls | [Navbar:268-492](../../../FrontEnd/src/components/layout/Navbar.jsx#L268-L492), [Layout:10-14](../../../FrontEnd/src/components/layout/Layout.jsx#L10-L14). Switcher placement/visibility and shell landmarks need source-backed repair later. |

SOURCE consistency observations: Student roots use max-w-[1180px] and editorial primitives; Mentor roots mix max-w-3xl/4xl/5xl, Studio panels and MentorEditorial; learning pages add FuturisticBackdrop to the global BackgroundEffects layer; fixed dark Studio gradients coexist with light-mode text tokens. Micro labels commonly use 0.54-0.66rem uppercase and strong tracking; actual readability/wrapping needs browser evidence. Wide inline Universe column counts derive from enrollment count rather than viewport; 360px collision/wrapping is UNVERIFIED, not a witnessed screenshot defect.

Formal premium-polish scoring, spacing/visual balance, 360/768/1280 comparisons, actual touch targets, font loading/zoom, color-blind/SR usability, perceived transition smoothness and brand distinctiveness remain **BLOCKED/UNVERIFIED** without the mandatory critique skill and captures. No 1-5/100-point ratings were invented. These source observations do not waive the required design-critique.

## 5. Switcher and identity semantics audit

| ID | Source-supported condition -> consequence | Evidence / confidence |
|---|---|---|
| A-01 | At 360/768px, both single-role and multi-role RoleSwitcher hide themselves with hidden xl styling. Putting it inside the mobile drawer does not override that; it is not reachable there. | [RoleSwitcher:146-175](../../../FrontEnd/src/components/layout/RoleSwitcher.jsx#L146-L175), [Navbar:480-482](../../../FrontEnd/src/components/layout/Navbar.jsx#L480-L482). SOURCE; breakpoint behavior from classes, fresh rendering blocked. |
| A-02 | Desktop RoleSwitcher button/menu is nested inside a Profile NavLink. Its click does not prevent propagation; parent navigation can run and route-change closes the dropdown. Menu also remains inside an overflow-hidden nav container. | [Navbar:282-283](../../../FrontEnd/src/components/layout/Navbar.jsx#L282-L283), [Navbar:365-374](../../../FrontEnd/src/components/layout/Navbar.jsx#L365-L374), [RoleSwitcher:175-235](../../../FrontEnd/src/components/layout/RoleSwitcher.jsx#L175-L235). SOURCE structure; exact click/clipping extent is browser-confirmation debt. No fix made. |
| A-03 | Dropdown maps only held userRoles; no unavailable identity/unlock-condition/pending-verification preview. IdentityBloom separately offers all souls, while useSoul.set checks registry existence/current ID but not held-role eligibility. | [RoleSwitcher:62-87](../../../FrontEnd/src/components/layout/RoleSwitcher.jsx#L62-L87), [RoleSwitcher:222-263](../../../FrontEnd/src/components/layout/RoleSwitcher.jsx#L222-L263), [IdentityBloom:159-167](../../../FrontEnd/src/soul/IdentityBloom.jsx#L159-L167), [useSoul:73-82](../../../FrontEnd/src/hooks/useSoul.js#L73-L82). SOURCE UX mismatch; not a demonstrated server authorization bypass. |
| A-04 | RoleSettings enabling a non-Peer role submits [peer_learner, role], dropping the other role. It optimistically changes membership, not merely the active world. Its separate home mapping differs from authStore. | [RoleSettings:13-17](../../../FrontEnd/src/components/account/RoleSettings.jsx#L13-L17), [RoleSettings:94-116](../../../FrontEnd/src/components/account/RoleSettings.jsx#L94-L116), [RoleSettings:169-191](../../../FrontEnd/src/components/account/RoleSettings.jsx#L169-L191), [authStore:44-55](../../../FrontEnd/src/store/authStore.js#L44-L55). SOURCE; no PATCH executed. New switcher must not reuse membership mutation as navigation. |
| A-05 | On shared pages, Navbar/RoleSwitcher use prior-window sessionStorage, useSoul chooses mentor > student > peer, and App leaves prior soul CSS variables unchanged when URL has no soul. A dual-role account can therefore have inconsistent nav/context/palette. | [Navbar:158-177](../../../FrontEnd/src/components/layout/Navbar.jsx#L158-L177), [useSoul:30-40](../../../FrontEnd/src/hooks/useSoul.js#L30-L40), [App:312-323](../../../FrontEnd/src/App.jsx#L312-L323). SOURCE. Also getLandingRoute selects Student for Mentor+Student, not the hook's priority. |
| A-06 | Menu supplies Escape/focus-return and native buttons, but no Arrow/Home/End focus movement or focus transfer on opening. Long-press-only bloom entry has no equivalent direct keyboard action in this component. | [RoleSwitcher:101-141](../../../FrontEnd/src/components/layout/RoleSwitcher.jsx#L101-L141), [RoleSwitcher:176-263](../../../FrontEnd/src/components/layout/RoleSwitcher.jsx#L176-L263). SOURCE; full keyboard/SR behavior untested. |

Useful existing pieces: role/home metadata, ordinary navigation buttons, aria-expanded/menu roles, Escape focus return, server error descriptions and explicit application-state data. Do not certify RoleGuard as permission authority: [RoleGuard:25-39](../../../FrontEnd/src/components/common/RoleGuard.jsx#L25-L39) reads client roles; live server fences remain a separate requirement. Current/pending/unlock truth must come from approved authoritative data, not world art or client optimistic state.

## 6. Transition/loading audit: actual flow

Existing dropdown flow: RoleSwitcher.pick -> old WindowSwitchStore.start -> immediate navigate -> App pathname watcher -> IdentityTransit.start -> fixed overlay. IdentitySelection uses useSoul.set with delayed onDone plus a separate 2600ms navigation fallback. See [RoleSwitcher:162-171](../../../FrontEnd/src/components/layout/RoleSwitcher.jsx#L162-L171), [App:296-306](../../../FrontEnd/src/App.jsx#L296-L306), [IdentitySelection:34-46](../../../FrontEnd/src/pages/IdentitySelection.jsx#L34-L46). Both old/new overlays are mounted at [App:682-688](../../../FrontEnd/src/App.jsx#L682-L688); comments saying the old one is a no-op do not remove the explicit old trigger.

| ID | Condition -> consequence | Evidence / confidence |
|---|---|---|
| A-07 | IdentityTransit always expires after 3000ms; no route import/data/assets/scene readiness signal gates reveal. Slow load can outlast the ceremony; fast load is held unnecessarily. | [identityStore:17-45](../../../FrontEnd/src/soul/identityStore.js#L17-L45), [App:199-208](../../../FrontEnd/src/App.jsx#L199-L208). SOURCE; actual network timings NOT_RUN. |
| A-08 | Timers are not retained/cleared on cancel or changed destination. A timer created for an earlier transit reads the newest onDone and clears newest state at its own expiry. | [identityStore:28-48](../../../FrontEnd/src/soul/identityStore.js#L28-L48). SOURCE trace: start B one second after A -> A expires at 3s and ends B one second early; not a newly executed regression test. |
| A-09 | New overlay hard-cuts to opaque ink, shows one global thought and has pointer-events-none. It has no skip/cancel/retry/fallback controls or explicit background inertness/focus handoff; underlying UI can remain interactive while hidden. | [TransitSequence:60-107](../../../FrontEnd/src/soul/TransitSequence.jsx#L60-L107). SOURCE structure; SR/pointer interaction requires browser evidence. No destination-specific blur/recede/entrance implemented here. |
| A-10 | Reduced-motion branch changes fade duration/aria-hidden, not the store's 3s hold. Audio invocation occurs in the active effect, and transit cue does not check reduced motion itself. UI sounds default enabled; music defaults off. | [TransitSequence:49-74](../../../FrontEnd/src/soul/TransitSequence.jsx#L49-L74), [soundManager:6-24](../../../FrontEnd/src/utils/soundManager.js#L6-L24), [transitSound:95-100](../../../FrontEnd/src/soul/transitSound.js#L95-L100). SOURCE; audible/autoplay result unmeasured. Optional sound off-by-default not currently met by UI-sound initialization. |

The old overlay uses a five-item quote array, a 1s hide timer and a 2.5s quote interval: [WindowSwitchOverlay:10-53](../../../FrontEnd/src/components/fx/WindowSwitchOverlay.jsx#L10-L53). It cannot establish five-to-six sequential destination quotes within that default lifetime. New [transitThoughts:21-102](../../../FrontEnd/src/soul/transitThoughts.js#L21-L102) contains 30 mixed original/attributed strings with recent-three random selection; no identity pools, structured source/year/verification URL/confidence records. Existing attribution/public-domain comments are **UNVERIFIED**, not proof; no external quote fact-check or new pool was done in A. Do not promote these strings into the required verified data.

There is no explicit real progress accounting, adaptive minimum quote count, maximum slow-load deadline, retry/fallback/cancel/skip strategy or source-of-truth loading coordinator in the inspected transit modules. Route-level React.lazy/Suspense exists, but page/scene readiness is not orchestrated with the timers. Existing upload progress elsewhere is a separate data contract, not evidence the identity transition waits for assets. B researches patterns/verification; C specifies orchestration and data shape; approved implementation later binds them.

## 7. Course journey/background audit: finite scene, not established infinite curtain

### Actual binding

[CourseLearn:219-226](../../../FrontEnd/src/pages/CourseLearn.jsx#L219-L226) lazy-loads CourseSpaceJourneyWorld, passes course.modules when present otherwise all lessons, and navigates from selected node ID. Modules-versus-lessons selection/URL semantics need a later explicit contract; no claim they are interchangeable in all real data. Course completion/quiz mutations are at [CourseLearn:96-129](../../../FrontEnd/src/pages/CourseLearn.jsx#L96-L129), independent of the scene's art.

### Existing construction and useful seams

- [World:150-158](../../../FrontEnd/src/cosmic/CourseSpaceJourneyWorld.jsx#L150-L158) maps every module into a seeded planet layout; [World:198-211](../../../FrontEnd/src/cosmic/CourseSpaceJourneyWorld.jsx#L198-L211) renders every PlanetNode and StationNode. This is all-node initialization, not a bounded streamed active window. Scene/HTML work scales with total modules; flat memory across 1-300 is **UNVERIFIED**, not established by fixed star count.
- [Starfield:18-45](../../../FrontEnd/src/cosmic/StarfieldBackdrop.jsx#L18-L45) allocates seeded point arrays on a finite shell; [World:195](../../../FrontEnd/src/cosmic/CourseSpaceJourneyWorld.jsx#L195) fixes radius 200 and 4000/8000 stars. It is not a course-travel chunk stream.
- [TwinkleBackdrop:23-46](../../../FrontEnd/src/cosmic/twinkleBackdrop.jsx#L23-L46) is a procedural BackSide sphere, radius 300, following the camera every frame. [Shader:39-67](../../../FrontEnd/src/cosmic/shaders/milkyway.frag.glsl#L39-L67) samples normalized direction plus time, not world-position chunk coordinates. No stretched bitmap is used in these inspected background modules; this does not prove endless positional parallax, no seams or new scenery while travelling.
- [travel:12-17](../../../FrontEnd/src/cosmic/travel.js#L12-L17) converts layouts into finite ring positions; [Shuttle:130-179](../../../FrontEnd/src/cosmic/Shuttle.jsx#L130-L179) supports arbitrary target indices and Catmull-Rom arcs. It does not generate/recycle world chunks. Reverse-target API availability is not witnessed long reverse travel.
- [Shuttle:77-89](../../../FrontEnd/src/cosmic/Shuttle.jsx#L77-L89) has a bounded 48-point trail; [Shuttle:119-128](../../../FrontEnd/src/cosmic/Shuttle.jsx#L119-L128) deduplicates/disposes its geometry/material resources. Retain these math/disposal/cancel seams where compatible, not the existing layout/art as the new background.
- [World:267-295](../../../FrontEnd/src/cosmic/CourseSpaceJourneyWorld.jsx#L267-L295) includes quality/WebGL/reduced-motion fallback and context event cleanup; [World:323-328](../../../FrontEnd/src/cosmic/CourseSpaceJourneyWorld.jsx#L323-L328) uses demand mode for reduced motion/context loss and bounded DPR. [useQualityTier:13-32](../../../FrontEnd/src/hooks/useQualityTier.js#L13-L32) uses heuristic cores/memory/viewport, not measured GPU/real-device profiling; ultra is not selected by that hook.

### Source-backed gaps and capture debt

**A-11:** 2D fallback maps all modules into a grid inside a fixed 650px overflow-hidden world container; long-list touch scrolling/layout clipping requires confirmation and an explicit usable fallback. [World:229-255](../../../FrontEnd/src/cosmic/CourseSpaceJourneyWorld.jsx#L229-L255), [World:300](../../../FrontEnd/src/cosmic/CourseSpaceJourneyWorld.jsx#L300). **A-12:** level scene lacks seeded chunk streaming, object-pool/recycling bounds, layered positional parallax and dimensional module-boundary gates in the inspected active chain. Background curtain correctness, seams, 1/30/100/300 levels, forward/reverse/long-run memory and low-end visual quality remain **BLOCKED/NOT_RUN**. Existing Lab images are not this evidence.

Later C must specify these requested properties rather than declare the current sky infinite: seed/coordinate continuity, active-chunk bounds, recycling/disposal, parallax layers, 1-to-300 travel, reverse re-entry, flat-memory budget, low-end/reduced-motion alternatives and failure/cancel behavior. No algorithm, new art, fixed budget or acceptance threshold has been designed/adopted in A.

## 8. Tokens, components, motion and competitive coverage

| Existing layer | Actual source | Reuse / replacement consequence |
|---|---|---|
| Base tokens | [index.css:3-59](../../../FrontEnd/src/index.css#L3-L59), [dark/light:64-208](../../../FrontEnd/src/index.css#L64-L208) | Poppins/Open Sans/JetBrains Mono/Playfair aliases, radius 20/pill999, surface/border/status/skeleton/toast tokens are inputs to C, not approved new-world token sets. |
| Appearance versus soul accents | [soul palette:16-73](../../../FrontEnd/src/soul/palette.js#L16-L73), [registry:24-82](../../../FrontEnd/src/soul/registry.js#L24-L82) | Current Peer Pulsar/cyan-teal, Mentor Aurora/violet-blue, Student Solaris/amber-rose. Accent variants do not constitute new Multiverse/Dimensions worlds. Stable peer_learner/mentor/student mappings remain unchanged. |
| Soul CSS update | [App:312-323](../../../FrontEnd/src/App.jsx#L312-L323), [index.css:115-132](../../../FrontEnd/src/index.css#L115-L132) | Global two-stop palette from URL; base accent tokens/appearance can still differ. Needs one shared base plus deliberate per-world sets later. |
| Editorial/Studio primitives | [primitives:19-87](../../../FrontEnd/src/soul/editorial/primitives.jsx#L19-L87), [Stat:155-172](../../../FrontEnd/src/soul/editorial/primitives.jsx#L155-L172), [studioSurface:7-38](../../../FrontEnd/src/soul/studio/surfaces.jsx#L7-L38) | Student Stat defaults to Mentor soul surface unless explicitly passed; fixed dark Studio gradients and hard-coded pale prose conflict with light-mode inheritance. Do not reuse Student/Mentor visual layer just by swapping colors. |
| Loading/empty/failure | [EmptyState:15-76](../../../FrontEnd/src/components/common/EmptyState.jsx#L15-L76), [App PageLoader:145-148](../../../FrontEnd/src/App.jsx#L145-L148), [CourseLearn:151-155](../../../FrontEnd/src/pages/CourseLearn.jsx#L151-L155) | Existing props/aliases/error intent reusable; comet/gradient/placeholder visuals and world-specific copy need C coverage. Generic route loader does not mean actual destination ready. |
| Global versus local backgrounds | [BackgroundEffects:867-1005](../../../FrontEnd/src/components/animations/BackgroundEffects.jsx#L867-L1005), [FuturisticBackdrop:22-74](../../../FrontEnd/src/components/common/FuturisticBackdrop.jsx#L22-L74) | Global appearance-based canvases plus page grid/blurred orbs are separate layers, not one identity world. No new background designed in A. |
| Current Student league | [tierMeta:18-42](../../../FrontEnd/src/soul/league/tierMeta.js#L18-L42) | Eight Pulse slugs dust/meteor/comet/star/giant/nebula/pulsar/singularity; preserve source IDs/score semantics pending C mapping, not five-tier automatic migration. |
| Current Mentor league | [pact:16-23](../../../FrontEnd/src/services/pact.js#L16-L23), [LeagueRail:3-18](../../../FrontEnd/src/components/pact/LeagueRail.jsx#L3-L18) | Six Pact slugs initiate/adept/mentor/sage/luminary/oracle. Existing top-decile/top-1% copy is UNVERIFIED evidence/forecast, not a measured claim or the new branding. |
| Shared boards/cosmic tiers | [Leaderboard:385-432](../../../FrontEnd/src/pages/Leaderboard.jsx#L385-L432), [cosmic tiers:15-30](../../../FrontEnd/src/cosmic/tiers.js#L15-L30) | Default tab is Cosmic whenever baseline Peer is held, even when arriving from Student nav; world context is not the selector. Cosmic/Pact/Gameology must not be globally renamed into one world. |
| Currency/shop/emblems/icons | [Navbar currency:515-526](../../../FrontEnd/src/components/layout/Navbar.jsx#L515-L526), [useSigilState:46-64](../../../FrontEnd/src/hooks/useSigilState.js#L46-L64), [useShop:16-36](../../../FrontEnd/src/cosmic/useShop.js#L16-L36) | Navbar uses shared Photon/legacy stardust data and /shop, not distinct Student/Mentor currencies/shops. Preserve Peer economy; no conversion/money/ledger rename. UI widely imports Lucide; procedural shuttle and bespoke badge/SVG code exist, but all-art originality/rights clearance is UNVERIFIED. |

SOURCE motion inventory: installed React19/Vite8/Tailwind4, Three/Fiber/Drei/postprocessing, Motion12, Zustand/Query; versions are R package/runtime observations, not new installs. Framer reveal/springs, CSS loops, Canvas2D RAF, R3F useFrame, Catmull-Rom flight, Web Audio and haptics are already used. Reuse libraries only where the approved design/performance evidence supports them; no library selection or API research in A.

## 9. Accessibility, loading/data and performance findings

| ID | Concrete source condition -> result/risk | Evidence / confidence |
|---|---|---|
| A-13 | Student Universe/Learning/Certificates destructure data default[] + isLoading but not error; failed enrollment queries can become honest-looking no-course/no-certificate messages. Mentor Observatory undefined profile becomes not_applied during loading/error. CourseEditor undefined data continues Reading the course after failure. | [Universe:21-25](../../../FrontEnd/src/pages/student/Universe.jsx#L21-L25), [Learning:161-178](../../../FrontEnd/src/pages/student/Learning.jsx#L161-L178), [Certificates:98-103](../../../FrontEnd/src/pages/student/Certificates.jsx#L98-L103), [Observatory:37-43](../../../FrontEnd/src/pages/mentor/Observatory.jsx#L37-L43), [CourseEditor:26-65](../../../FrontEnd/src/pages/mentor/CourseEditor.jsx#L26-L65). SOURCE state trace, no failed network request executed. |
| A-14 | Layout owns main, while CourseLearn and PactHall add another main inside it. IdentitySelection's purported chrome-free surface is wrapped in ProtectedRoute/Layout. | [Layout:12](../../../FrontEnd/src/components/layout/Layout.jsx#L12), [CourseLearn:218](../../../FrontEnd/src/pages/CourseLearn.jsx#L218), [PactHall:112](../../../FrontEnd/src/pages/mentor/PactHall.jsx#L112), [App:199-208](../../../FrontEnd/src/App.jsx#L199-L208). SOURCE; landmark/SR impact untested. |
| A-15 | Mentor Students search has placeholder but no explicit label/aria-label at input; CourseList delete icon button has no accessible text/title/aria-label in that button. | [Students:276-288](../../../FrontEnd/src/pages/mentor/Students.jsx#L276-L288), [CourseList:204-217](../../../FrontEnd/src/pages/mentor/CourseList.jsx#L204-L217). SOURCE; later screen-reader/axe test required. |
| A-16 | Reduced-motion support is local/inconsistent: BackgroundEffects uses effectiveSpeed0 and some cosmic CSS has guards, but FuturisticBackdrop unconditionally runs grid/orb CSS; Studio Reveal applies y14 transforms with no local reduced check. | [BackgroundEffects:873-892](../../../FrontEnd/src/components/animations/BackgroundEffects.jsx#L873-L892), [FuturisticBackdrop:36-74](../../../FrontEnd/src/components/common/FuturisticBackdrop.jsx#L36-L74), [Reveal:46-64](../../../FrontEnd/src/soul/studio/surfaces.jsx#L46-L64), [index.css reduced:1349-1355](../../../FrontEnd/src/index.css#L1349-L1355). SOURCE; not claiming no motion guards exist anywhere. |
| A-17 | Many private queries use identity-independent keys; one QueryClient persists for the app and auth logout only clears user/token. Inspected query/callback paths do not clear all private cache on account switch. This is a reuse/privacy isolation risk, not an observed data leak. | [main:64-77](../../../FrontEnd/src/main.jsx#L64-L77), [authStore:115-123](../../../FrontEnd/src/store/authStore.js#L115-L123), [Universe:21-25](../../../FrontEnd/src/pages/student/Universe.jsx#L21-L25), [Profile:99-111](../../../FrontEnd/src/pages/Profile.jsx#L99-L111). SOURCE boundaries; account/generation integration remains later proof. |

Conditional numerical contrast check, not computed-DOM/compliance certification: with the exact stated flat background assumptions, white at opacity0.4 over dark #060810 gives 3.748:1; editorial #f5f5f5 at opacity0.70 over light #e6f2ff gives 1.028:1, and opacity0.55 gives 1.022:1; light muted #64748b over that flat light background gives 4.194:1. Inputs are [index.css:65-82](../../../FrontEnd/src/index.css#L65-L82), [light tokens:156-158](../../../FrontEnd/src/index.css#L156-L158), [light background:211-212](../../../FrontEnd/src/index.css#L211-L212), [Deck:73-82](../../../FrontEnd/src/soul/editorial/primitives.jsx#L73-L82). Standard luminance computation sanity checks same-color1 and white/black21 passed. Actual gradients/compositing/fonts/zoom/forced-colors/contrast compliance are UNVERIFIED; do not turn these samples into whole-screen pass/fail claims.

Performance SOURCE risks: all-node journey initialization, constant always frame loop outside fallback, global/local layered canvases/blurred grids, repeat animations and root refetching (e.g. Peer history every60s). Existing cleanup, fixed star/trail counts and low-end heuristics are useful but do not prove bounded whole-scene memory or smoothness. R build emitted a >700kB chunk warning; that historical compile result is not A device/FPS evidence. No new build/test/server/profiler/long-run command was run in A.

## 10. Evidence request and A2 reconciliation

**Historical request:** the following pack was requested at the original source-only gate. Local setup and most rendered evidence were subsequently supplied by the authorized A2 work; do not repeat the old request for skills or treat it as a current no-server prohibition.

Full Phase A visual acceptance is **not complete**. Supply actual trusted frontend-design/design-critique skill routes/locations or separately authorize their setup; ordinary phase approval does not install them or waive them. For captures, either establish an already-authorized, no-server-compatible capture capability or provide screenshots from the current app with private identifiers/credentials redacted.

First priority missing pack at **360, 768 and 1280 CSS-pixel widths**:

1. /student/universe with several enrolled courses; /student/learning with active/finished rows; /student/certificates with an earned record.
2. /mentor/observatory for an approved mentor with learners; /mentor/courses with draft/published cards; /mentor/students with the search/sort row.
3. /peer/dashboard with skills/people; preserve its existing Space/editorial surface rather than infer a new one.
4. Main nav closed and menu/switcher open for a multi-role account at each width; also single-role state. Show locked/pending identity UI if the current app exposes it; do not fake a missing state.
5. /identity before selection/after selection; /settings Your Roles including a real pending-application state when available.
6. /courses/<courseId>/learn/<lessonId> with the 3D map and 2D fallback; one first/middle/final module view. No secret/token URL values are needed.
7. /leaderboard on Cosmic, Gameology and Pact tabs; /mentor/recorder idle/review UI and /mentor/media loading/populated layout.

This first pack prioritizes source risks; the remaining inventory still needs its three-width capture matrix, keyboard/SR/axe/zoom/contrast checks, actual transition slow/failure/cancel traces and journey long-run evidence. Do not claim representative captures cover every page. No screenshot placeholder files were created. No launch permission is inferred from this request.

**A2 reconciliation:** all49selected screens have an image at all three widths;211PNGs include repeats/diagnostics. Actual empty/failure/pending/locked/light states, choice/transit traces, browser ARIA/Tab/Escape, CSS2x and finite1/30/100/300scene/fallback route attempts are in the [visual report](01-ui-visual-evidence.md). The switcher does not open normally in observed cases; menu-only navigation remains untested. Every leaderboard tab, recorder review, populated knowledge map, native SR/browser zoom, sustained3Dtravel/device/GPU/full-memory acceptance and CourseDetail1280full-page capture are not claimed complete. Later2Droute evidence did not produce successful2DPNGs. These are explicit residual debts, not missing-skill/tool-install blockers or permission to repair product code.

## 11. Gate disposition and next phase boundary

**A2 current disposition,2026-11-09:** local skill/capture capability is now demonstrated, not blocked. The [visual report](01-ui-visual-evidence.md) records actual themes, state failures, navigation/ARIA/reflow, transit and finite journey evidence with retained failures. It supersedes the old source-only evidence limitation without converting those failures into acceptance. No fixes or new worlds were implemented. The separately authored CP-A-r2will state residual coverage limits and request typed approval for B only. The paragraphs below retain the original gate's recommendation and are not a second live gate.

A supplies a complete declaration inventory and source-audit/reuse round with 17 indexed observations, not rendered redesign approval. Recommend **REVISE** with missing skills/captures to complete the visual evidence, or explicitly accept this source-only round via **APPROVE** to open B with the gaps carried. Neither choice authorizes source changes, servers, installs, a snapshot, visible-brand decisions or a skill waiver.

B, only after the new CP-A approval, performs cited research for the six user topics and quote verification. C, only after CP-B, produces the world bible/switcher/transition/quote/screen/retheming/journey/impact/slice documents and asks consequential decisions. Existing names/IDs and financial/safety/privacy rules remain preserved; no C designs, quotes, migrations or screen merges were selected here. Stop at docs/progress/checkpoints/v3/CP-A.md and wait for the user's typed APPROVE / REVISE: notes / HOLD / ABORT.
