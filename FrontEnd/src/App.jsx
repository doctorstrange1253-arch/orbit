import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import api from './services/api';
import soundManager from './utils/soundManager';
import { useAuthStore } from './store/authStore';
import { useUIStore } from './store/uiStore';
import { useNotificationStore } from './store/notificationStore';
import { useThemeStore } from './store/themeStore';
import useAppearanceStore from './store/appearanceStore';
import Layout from './components/layout/Layout';
import BackgroundEffects from './components/animations/BackgroundEffects';
import ToastContainer from './components/common/Toast';
import NotificationSystem from './components/notifications/NotificationSystem';
import RatingModal from './components/modals/RatingModal';
import IncomingCallOverlay from './components/modals/IncomingCallOverlay';
import RoleGuard from './components/common/RoleGuard';
import NotFound from './pages/NotFound';
import Spinner from './components/common/Spinner';
import { connectSocket } from './services/socket';
import { initDeepLinkAuth } from './services/nativeAuth';
import { initNativeNotifications, postNativeNotification } from './utils/nativeNotify';
import { initPushNotifications } from './utils/pushNotify';
import { Toaster } from 'react-hot-toast';
import BadgeDefsSprite from './cosmic/BadgeDefsSprite';
import LiftoffWatcher from './cosmic/LiftoffWatcher';
import GodMode from './components/dev/GodMode';
import WarpTransition from './components/fx/WarpTransition';
import MagneticCursor from './components/fx/MagneticCursor';
import CommandPalette from './components/fx/CommandPalette';
import WindowSwitchOverlay from './components/fx/WindowSwitchOverlay';
import XpToast from './components/cosmic/XpToast';
// V3 — getLandingRoute now returns V3 soul-home routes; HomeRoute uses it
// to send APK users to the right home on launch.
import { getLandingRoute } from './store/authStore';
// V3 — Soul layer. The TransitSequence overlay replaces V2's
// WindowSwitchOverlay for users who don't have prefers-reduced-motion set.
// The V2 overlay is kept mounted as a no-op for reduced-motion users (its
// own internal guard short-circuits). The hook is imported for the
// URL-watcher effect below.
import TransitSequence from './soul/TransitSequence';
import { useIdentityTransit } from './soul/identityStore';
import { soulForPathname } from './soul/registry';
import { getLayeredNebula } from './soul/palette';

// Eagerly loaded (first paint)
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import OAuthCallback from './pages/OAuthCallback';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Walkthrough from './components/common/Walkthrough';

// Lazy loaded protected pages (code-split bundles)
const MySkills     = lazy(() => import('./pages/MySkills'));
const BrowseSkills = lazy(() => import('./pages/BrowseSkills'));
const Matches      = lazy(() => import('./pages/Matches'));
const Connections  = lazy(() => import('./pages/Connections'));
const Profile      = lazy(() => import('./pages/Profile'));
const NearbyMap    = lazy(() => import('./pages/NearbyMap'));
const TrustScore   = lazy(() => import('./pages/TrustScore'));
const VideoCall    = lazy(() => import('./pages/VideoCall'));
const Settings     = lazy(() => import('./pages/Settings'));
const PublicProfile = lazy(() => import('./pages/PublicProfile'));
const BadgeGallery   = lazy(() => import('./pages/BadgeGallery'));
const Leaderboard    = lazy(() => import('./pages/Leaderboard'));
const Observatory    = lazy(() => import('./pages/Observatory'));
const TierAtlas      = lazy(() => import('./pages/TierAtlas'));
const Orbit          = lazy(() => import('./pages/Orbit'));
const Shop           = lazy(() => import('./pages/Shop'));
const HoloBay        = lazy(() => import('./pages/HoloBay'));
const MissionLog     = lazy(() => import('./pages/MissionLog'));
const Sessions       = lazy(() => import('./pages/Sessions'));
const SessionDetail  = lazy(() => import('./pages/SessionDetail'));
const OrbitSessionRoom = lazy(() => import('./pages/OrbitSessionRoom'));
const MySessions     = lazy(() => import('./pages/MySessions'));
const MentorHub      = lazy(() => import('./pages/MentorHub'));
const MentorSessions = lazy(() => import('./pages/mentor/MentorSessions'));
const MentorEarnings = lazy(() => import('./pages/mentor/Earnings'));
// Courses (Phase B/D): mentor side + student side.
const MentorCourseList   = lazy(() => import('./pages/mentor/CourseList'));
const MentorCourseNew    = lazy(() => import('./pages/mentor/CourseBuilder'));
const MentorCourseEdit   = lazy(() => import('./pages/mentor/CourseEditor'));
const MentorPactHall     = lazy(() => import('./pages/mentor/PactHall'));
const CoursesBrowse      = lazy(() => import('./pages/CoursesBrowse'));
const CourseDetail       = lazy(() => import('./pages/CourseDetail'));
const CourseLearn        = lazy(() => import('./pages/CourseLearn'));
const CertificatePage    = lazy(() => import('./pages/CertificatePage'));
// Gameology (Phase F): student lifetime identity dashboard.
const GameologyPage      = lazy(() => import('./pages/Gameology'));
// V3 — Identity Selection bloom screen. Replaces the V2 3-radio role picker.
const IdentitySelection  = lazy(() => import('./pages/IdentitySelection'));
// V3 — Soul Homes: The Pulse (peer), The Observatory (mentor), My Universe
// (student). These are the V3 routes for /peer/dashboard, /mentor/observatory,
// /student/universe. The V2 pages (MySkills, MentorHub, MySessions) stay
// imported and routed as deprecated aliases.
const PulseV3            = lazy(() => import('./pages/peer/Pulse'));
const ObservatoryV3      = lazy(() => import('./pages/mentor/Observatory'));
const UniverseV3         = lazy(() => import('./pages/student/Universe'));
// V3 — Skill Map. The caller's constellation + the public shareable URL.
const SkillMapV3         = lazy(() => import('./pages/SkillMap'));
const SkillMapPublicV3   = lazy(() => import('./pages/SkillMapPublic'));
// V3 — Pulse Ceremony (the rank-up ritual). Imported eagerly because
// it's tiny and the store is read at module level.
import PulseCeremony from './soul/league/pulseCeremony';
// V3 — Signal Flare listener. When a mentor publishes a course in a
// genre the user flared for, the server emits signal-flare:responded;
// this listener catches it and opens the PlanetMaterialization overlay.
import { SignalFlareListenerMount } from './hooks/useSignalFlareListener.jsx';
// V3 — Cross-soul economy: the "consider teaching?" invite modal. The
// MentorInviteWatcher (below) fetches the pending invite and renders it.
import MentorInviteModal from './soul/economy/MentorInviteModal';
// V3 — Moderation page (mentor's private inbox).
const ModerationV3 = lazy(() => import('./pages/Moderation'));
// Marketing "stardust reveal" brand animation — reachable by URL for preview /
// recording, not in nav. Mirrors marketing/orbit-teaser-reveal.html.
const OrbitTeaserReveal = lazy(() => import('./cosmic/OrbitTeaserReveal'));
// Heavy cinematics (canvas engine + share card) — split out of the initial
// bundle; only fetched when a rank-up actually fires.
const LiftoffOverlay = lazy(() => import('./cosmic/LiftoffOverlay'));

// Hidden Admin Command Center — resolved on the catch-all by AdminGate, which
// compares a SHA-256 hash of the visited path to VITE_ADMIN_SLUG_HASH. The slug
// itself never appears in the bundle; the admin code is lazy-split so it never
// loads for ordinary visitors. The server is the real gate (every admin API
// 404s without a valid admin session).
const AdminGate = lazy(() => import('./admin/AdminGate'));

const PageLoader = () => (
  <div className="flex items-center justify-center py-24">
    <Spinner variant="orbit" size={48} label="Loading page" />
  </div>
);

/** True inside the Capacitor native shell (APK), false on the web. */
const isNativeApp = () => {
  try { return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()); }
  catch { return false; }
};

/** Root "/" route. The website shows the marketing hero (Landing); the APK is a
 *  logged-in app shell, so it skips the hero and goes straight to the dashboard
 *  (or /login when signed out). APK-only behavior — the web is unchanged. */
const HomeRoute = () => {
  const token = useAuthStore((state) => state.token);
  if (isNativeApp()) {
    // V3 — APK lands on the user's soul home (Pulse / Observatory / Universe)
    // based on their highest-priority role. Falls back to /peer/dashboard
    // (The Pulse) which is the safest default.
    const roles = useAuthStore.getState().user?.roles || [];
    return <Navigate to={token ? getLandingRoute(roles) : '/login'} replace />;
  }
  return <Landing />;
};

/** Legacy-URL redirect that preserves path params.
 *  `<Navigate to="..." replace />` in the route table can't interpolate
 *  `:roomId` / `:userId` / `:sessionId` — we have to read them with
 *  `useParams()` and re-emit. Use this in the legacy redirect routes
 *  below so /call/abc123 → /peer/calls/abc123, not /peer/calls. */
const LegacyRedirect = ({ to }) => {
  const params = useParams();
  const resolved = Object.keys(params).reduce(
    (acc, k) => acc.replace(`:${k}`, encodeURIComponent(params[k])),
    to
  );
  return <Navigate to={resolved} replace />;
};

/** Redirect authenticated users away from public-only pages (login, register).
 *  Honors a `from` location (A10) so a just-logged-in user returns to the page
 *  they originally requested instead of always landing on /peer/dashboard. */
const PublicOnlyRoute = ({ children }) => {
  const token = useAuthStore((state) => state.token);
  const location = useLocation();
  if (token) return <Navigate to={location.state?.from?.pathname || '/peer/dashboard'} replace />;
  return children;
};

/** Require authentication; redirect to login if not logged in, remembering the
 *  originally-requested location so we can return there after login (A10). */
const ProtectedRoute = ({ children }) => {
  const token = useAuthStore((state) => state.token);
  const location = useLocation();
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </Layout>
  );
};

// Notification types that already render a dedicated rich popup (with action
// buttons) via their own per-type socket handler. The generic notification:new
// flash skips these so they never show twice. Any type NOT listed here falls
// through to the generic website flash — that's the universal coverage net.
const RICH_FLASH_TYPES = new Set([
  'perfect_match',
  'connection_request',
  'connection_accepted',
  'session_booked',
  'session_reminder',
  'session_no_show',
]);

// Maps a route to its first-visit walkthrough key.
const ROUTE_TOURS = {
  '/leaderboard': 'leaderboard',
  '/shop': 'shop',
  '/holobay': 'holobay',
  '/orbit': 'orbit',
};

// Renders the first-visit walkthrough for the current route (if any). The
// Walkthrough self-gates on tourStore, so it is safe to mount unconditionally.
function RouteTours() {
  const { pathname } = useLocation();
  const key = ROUTE_TOURS[pathname];
  if (!key) return null;
  return <Walkthrough tourKey={key} />;
}

// V3 — Cross-soul mentor invite watcher. Fetches the signed-in user's
// pending "consider teaching?" invite once per session and renders the
// 2-question MentorInviteModal. Accept/dismiss both POST to
// /mentor-invites/respond so the server records the response and (on
// dismiss) applies the 90-day cooldown. Best-effort: any failure just
// means no modal — never blocks the app.
function MentorInviteWatcher() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const [invite, setInvite] = useState(null);

  useEffect(() => {
    if (!token || !user?._id) return undefined;
    let cancelled = false;
    api.get('/mentor-invites/pending')
      .then(({ data }) => { if (!cancelled && data?.invite) setInvite(data.invite); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [token, user?._id]);

  const respond = useCallback(async (action) => {
    if (!invite?.kind) return;
    try {
      await api.post('/mentor-invites/respond', { kind: invite.kind, action });
    } catch { /* best-effort — the modal flow continues either way */ }
  }, [invite?.kind]);

  if (!invite) return null;
  return (
    <MentorInviteModal
      invite={invite}
      onDismiss={() => { setInvite(null); respond('dismissed'); }}
      onAccept={() => respond('accepted')}
    />
  );
}

// Inner component so useNavigate is inside Router context
function AppInner() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, token, setUser, setSession } = useAuthStore();
  const location = useLocation();

  // Watch the URL: whenever the current window prefix CHANGES (e.g. /peer/*
  // → /mentor/*), trigger the cinematic V3 Transit Sequence ceremony. The
  // V2 WindowSwitchOverlay stays mounted (it short-circuits under reduced-
  // motion; here we *replace* the V2 trigger with the V3 one and let V2
  // become a no-op fallback for users who set prefers-reduced-motion in
  // their OS).
  //
  // First-load navigation does NOT fire — the ceremony is meant for actual
  // transitions, not the initial page render.
  const prevSoulRef = useRef(null);
  useEffect(() => {
    const newSoul = soulForPathname(location.pathname);
    const prevSoul = prevSoulRef.current;
    if (prevSoul && newSoul && prevSoul !== newSoul) {
      // Only fire the ceremony when the user actually navigated between
      // souls. A re-render that keeps the same path does nothing.
      useIdentityTransit.getState().start({ from: prevSoul, to: newSoul });
    }
    if (newSoul) prevSoulRef.current = newSoul;
  }, [location.pathname]);

  // Sync the active soul's nebula into the CSS custom properties so every
  // `text-soul-accent` / `bg-soul-gradient` / `shadow-soul-glow` consumer
  // re-tints on every navigation. This is the V3 soul layer's whole reason
  // for being: the *same* component renders differently per active soul.
  useEffect(() => {
    const activeSoul = soulForPathname(location.pathname);
    if (!activeSoul) return;
    const nb = getLayeredNebula(activeSoul, null);
    if (!nb) return;
    const root = document.documentElement;
    root.style.setProperty('--soul-accent-1', nb.from);
    root.style.setProperty('--soul-accent-2', nb.to);
    root.style.setProperty('--soul-gradient', `linear-gradient(135deg, ${nb.from}, ${nb.to})`);
    root.style.setProperty('--soul-glow', nb.from);
    root.setAttribute('data-active-soul', activeSoul);
  }, [location.pathname]);

  // Ensure the signed-in user is hydrated app-wide. On native (APK) OAuth the
  // token is stored even if the profile fetch blips, leaving `user` null — which
  // makes every client-side self-exclusion filter (Browse/Matches/Nearby) no-op
  // and was a likely cause of "I see myself in Browse" on the APK (B-01). A
  // reliable user._id fixes those defenses. Also self-heals a stale persisted
  // user that predates newer fields.
  //
  // Roles self-heal: if the persisted `user.roles` is missing, empty, or
  // could plausibly be stale (e.g. the persist migrate() couldn't fix it),
  // we hit GET /user/roles which always returns the live roles + rolesVersion
  // (and, on a stale token, also a fresh JWT — see the api.js ROLES_STALE
  // path). Without this branch, a peer_learner-only user who logged in
  // before the roles feature shipped would keep seeing paid tabs that the
  // server would then 403, or vice versa.
  useEffect(() => {
    if (!token || !user?._id) {
      // Original hydration path: token is present but no user yet.
      if (token && !user?._id) {
        api.get('/user/profile').then(({ data }) => { if (data && data._id) setUser(data); }).catch(() => {});
      }
      return;
    }
    const haveRoles = Array.isArray(user.roles) && user.roles.length > 0;
    const haveVersion = typeof user.rolesVersion === 'number';
    if (!haveRoles || !haveVersion) {
      // Persisted user lacks the roles fields. Refresh from the live source.
      api.get('/user/roles')
        .then(({ data }) => {
          if (data?.user && data?.token) {
            setSession({ user: data.user, token: data.token });
          } else if (data?.user) {
            setUser(data.user);
          } else if (Array.isArray(data?.roles)) {
            setUser({ roles: data.roles, rolesVersion: data.rolesVersion ?? 0 });
          }
        })
        .catch(() => {});
    }
  }, [token, user?._id, user?.roles, user?.rolesVersion, setUser, setSession]);

  // Ambient music is a GLOBAL, persistent preference — not tied to any single
  // page. Previously it lived on the Landing page and its unmount stopped the
  // track, so navigating away (e.g. to Settings to switch theme) killed the music
  // and it never resumed — which read as "switching theme breaks the music".
  // Start it once here if enabled; the soundManager singleton then survives all
  // navigation + theme changes. Autoplay policy (mobile) is handled inside the
  // manager via a one-time gesture-unlock.
  useEffect(() => {
    if (soundManager.isMusicEnabled()) soundManager.startAmbientMusic();
  }, []);

  // Pause ambient music while a video call is active, resume when it ends — so
  // the (now global) track never plays over a call.
  const isVideoCallActive = useUIStore((s) => s.isVideoCallActive);
  useEffect(() => {
    soundManager.pauseAmbientForCall(isVideoCallActive);
  }, [isVideoCallActive]);
  const {
    notifications,
    dismissNotification,
    handleNotificationAction,
    ratingModal,
    closeRatingModal,
    notifyConnectionRequest,
    notifyConnectionAccepted,
    notifyUserOffline,
    notifyCallEnded,
    notifyPerfectMatch,
    notifyMissedCall,
  } = useNotificationStore();

  // Durable-notification flash dedupe. Flashes can arrive two ways: the live
  // `notification:new` socket event (instant, but the socket is dead on the web
  // build behind the Cloudflare Worker) and an HTTP poll fallback below (works
  // everywhere). Both record ids here so a notification is flashed exactly once.
  const flashSeenRef = useRef(new Set());
  const flashSeededRef = useRef(false);
  // Reset when the signed-in user changes so a new account's backlog isn't
  // flashed and the previous user's ids don't leak across a logout/login.
  useEffect(() => {
    flashSeenRef.current = new Set();
    flashSeededRef.current = false;
  }, [user?._id]);

  // HTTP poll fallback for in-app flashes. The socket delivers `notification:new`
  // instantly on the APK, but never on the deployed website (its socket points at
  // the Worker, which can't carry the WebSocket upgrade) — so web users saw the
  // bell badge tick up with no flash. Polling the durable feed over plain HTTP
  // makes perfect-match / connection flashes appear on web too, within one tick.
  const { data: flashFeed } = useQuery({
    queryKey: ['notifications', 'flashfeed'],
    queryFn: () => api.get('/notifications', { params: { limit: 10 } }).then((r) => r.data),
    enabled: !!token,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });
  useEffect(() => {
    const items = flashFeed?.items || [];
    if (!items.length) return;
    // First successful load: record the backlog without flashing it.
    if (!flashSeededRef.current) {
      items.forEach((n) => flashSeenRef.current.add(String(n._id)));
      flashSeededRef.current = true;
      return;
    }
    // Oldest → newest so a burst stacks in chronological order.
    [...items].reverse().forEach((n) => {
      const id = String(n._id);
      if (flashSeenRef.current.has(id)) return; // already flashed (socket or a prior poll)
      flashSeenRef.current.add(id);
      if (n.read) return; // read elsewhere already — no point flashing
      const link = n.data?.link;
      useNotificationStore.getState().addNotification({
        type: n.type || 'info',
        title: n.title || 'Notification',
        message: n.body || '',
        actions: link ? [{ label: 'View', primary: true, handler: () => navigate(link) }] : undefined,
        duration: 8000,
      });
    });
  }, [flashFeed, navigate]);

  const { initializeTheme } = useThemeStore();
  const { initializeAppearance } = useAppearanceStore();
  // Animation Speed multiplier (off=0 / slow=0.5 / medium=1 / fast=1.5)
  const animationSpeed = useAppearanceStore((s) => s.animationSpeed);
  const getSpeedMultiplier = useAppearanceStore((s) => s.getSpeedMultiplier);

  // Apply persisted theme attributes to <html> on mount
  useEffect(() => {
    initializeTheme();
    initializeAppearance();
  }, [initializeTheme, initializeAppearance]);

  // Native (Capacitor) only: finish social login when the system browser
  // returns via the orbit:// deep link. No-op on the web build.
  useEffect(() => {
    let cleanup = () => {};
    initDeepLinkAuth().then((fn) => { cleanup = fn; });

    // APK: keep the WebView content BELOW the Android status bar — without this
    // the navbar (top:0 sticky) sits under the battery/time icons, nav buttons
    // overlap. StatusBar.setOverlaysWebView(false) tells the WebView to inset
    // its top automatically. The safe-area-inset CSS isn't enough on Android
    // (viewport-fit=cover makes it draw edge-to-edge, and Android doesn't push
    // env(safe-area-inset-top) without this hint). No-op on web.
    import('@capacitor/status-bar').then(({ StatusBar }) => {
      StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});
    }).catch(() => {});

    // APK: ask for notification permission once and route taps to the right
    // screen. No-op on web (Capacitor.isNativePlatform() is false).
    initNativeNotifications((link) => navigate(link));

    return () => cleanup();
  }, [navigate]);

  // Expose the Animation Speed as a global CSS var so purely-CSS animations
  // (cosmic badges, future liftoff effects) honor the setting — including
  // 0 = Off. Additive: nothing else reads --anim-speed / data-anim-off, so
  // this is inert for every existing component. When Off, we keep --anim-speed
  // at 1 (so calc() divisions stay valid) and disable via data-anim-off.
  useEffect(() => {
    const m = getSpeedMultiplier();
    const root = document.documentElement;
    root.style.setProperty('--anim-speed', String(m > 0 ? m : 1));
    root.setAttribute('data-anim-off', m === 0 ? 'true' : 'false');
  }, [animationSpeed, getSpeedMultiplier]);

  // Incoming call state — drives the full-screen overlay
  const [incomingCall, setIncomingCall] = useState(null); // { callerName, roomId }

  // Auto-dismiss after 30 s
  useEffect(() => {
    if (!incomingCall) return;
    const timer = setTimeout(() => {
      notifyMissedCall(incomingCall.callerName);
      setIncomingCall(null);
    }, 30000);
    return () => clearTimeout(timer);
  }, [incomingCall, notifyMissedCall]);

  // Socket.IO connection and event listeners
  useEffect(() => {
    if (!token || !user) return;

    const socket = connectSocket(user._id);

    // APK: register this device with FCM (needs the auth token, so it runs here
    // after login, not at mount). Delivers tray notifications even when the app
    // is fully killed. No-op on web. Taps route via the same navigate fn.
    initPushNotifications((link) => navigate(link));

    // ──────── Listen to notification events ────────

    // Durable notification center: refresh the bell's badge + list whenever the
    // server persists a new notification. Fires alongside the per-type events
    // below, so this is the single place the center stays in sync live.
    socket.on('notification:new', (payload) => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'flashfeed'] });

      // Mark this id handled so the HTTP poll fallback never re-flashes it.
      if (payload?._id) flashSeenRef.current.add(String(payload._id));

      if (payload?.title || payload?.body) {
        // APK: surface it in the Android notification tray (no-op on web).
        postNativeNotification({
          title: payload.title,
          body: payload.body,
          link: payload?.data?.link || '/',
        });

        // Website flash: types with a dedicated rich popup (with action buttons)
        // are shown by their own per-type socket handlers below — skip those to
        // avoid a double toast. EVERY OTHER notification type (now or added later)
        // gets a generic in-app flash here, so the web never silently swallows a
        // server notification. This is the universal safety net.
        if (!RICH_FLASH_TYPES.has(payload.type)) {
          const link = payload?.data?.link;
          useNotificationStore.getState().addNotification({
            type: payload.type || 'info',
            title: payload.title || 'Notification',
            message: payload.body || '',
            actions: link ? [{ label: 'View', primary: true, handler: () => navigate(link) }] : undefined,
            duration: 8000,
          });
        }
      }
    });

    // Perfect (reciprocal) match found — fired to BOTH people once per pair,
    // POV-framed by the server (v7 §3).
    socket.on('perfect-match', (data) => {
      notifyPerfectMatch(data.otherUser, data);
    });

    // New connection request received
    socket.on('connection-request', (data) => {
      notifyConnectionRequest(data.requester, data.skill);
    });

    // Connection accepted
    socket.on('connection-accepted', (data) => {
      notifyConnectionAccepted(data.receiverName);
    });

    // User offline
    socket.on('user-offline', (data) => {
      notifyUserOffline(data.userName);
    });

    // Incoming video call — show full-screen overlay instead of a notification.
    // Role-guard (v5 §3): never ring the caller's own device for their outgoing
    // call, and ignore a duplicate/late event for a call we're already showing.
    socket.on('incoming-call', (data) => {
      if (data?.callerId && user?._id && String(data.callerId) === String(user._id)) return;
      setIncomingCall((prev) =>
        prev && prev.roomId === data.roomId
          ? prev
          : { callerName: data.callerName, roomId: data.roomId }
      );
    });

    // Call ended - trigger rating modal
    socket.on('call-ended', (data) => {
      notifyCallEnded(data.otherUser, data.callDuration);
    });

    // Force disconnect (malicious content detected)
    socket.on('force-disconnect', (data) => {
      useNotificationStore.getState().addNotification({
        type: 'error',
        title: 'Call Terminated',
        message: data.reason || 'Call was terminated due to policy violation.',
        duration: 10000,
      });
    });

    // Orbit Session: an incoming call for a paid session reuses the same
    // IncomingCallOverlay so the UX is identical to a free call. The
    // `data.kind === 'session'` lets the overlay show a "Session" badge.
    socket.on('session:invite', (data) => {
      if (data?.callerId && user?._id && String(data.callerId) === String(user._id)) return;
      setIncomingCall((prev) =>
        prev && prev.roomId === data.roomId
          ? prev
          : { callerName: data.callerName, roomId: data.roomId, kind: 'session' }
      );
    });

    // Orbit Session: the peer started the session — push a toast so the
    // student knows to hop in. Only meaningful to the student side; the
    // mentor who started the room is already inside it, and a peer_learner
    // who happens to be online has no /student/sessions tab to navigate to.
    socket.on('session:started', (data) => {
      const roles = useAuthStore.getState().user?.roles || [];
      if (!roles.includes('student')) return;
      useNotificationStore.getState().addNotification({
        type: 'info',
        title: 'Session started',
        message: 'Your mentor just opened the room. Tap My Sessions to join.',
        duration: 8000,
        link: '/student/sessions',
      });
    });

    // We don't disconnect the singleton completely here because other components (like ChatDrawer)
    // might still be relying on it while navigating. Disconnect is handled cleanly when logging out.
    return () => {
      socket.off('notification:new');
      socket.off('perfect-match');
      socket.off('connection-request');
      socket.off('connection-accepted');
      socket.off('user-offline');
      socket.off('incoming-call');
      socket.off('call-ended');
      socket.off('force-disconnect');
      socket.off('session:invite');
      socket.off('session:started');
    };
  }, [token, user, queryClient, notifyConnectionRequest, notifyConnectionAccepted, notifyUserOffline, notifyCallEnded, notifyPerfectMatch]);

  const handleAcceptCall = useCallback(() => {
    if (!incomingCall) return;
    const { roomId } = incomingCall;
    setIncomingCall(null);
    navigate(`/peer/calls/${roomId}`, { state: { isCaller: false } });
  }, [incomingCall, navigate]);

  const handleDeclineCall = useCallback(() => {
    setIncomingCall(null);
    // Optionally notify caller — for now just dismiss
  }, []);

  const handleIgnoreCall = useCallback(() => {
    if (incomingCall) notifyMissedCall(incomingCall.callerName);
    setIncomingCall(null);
  }, [incomingCall, notifyMissedCall]);

  return (
    <>
      {/* Global background — rendered once, stays behind everything */}
      <BackgroundEffects />
      {/* Shared SVG <defs> for cosmic badges — mounted once (ID-collision fix) */}
      <BadgeDefsSprite />
      <GodMode />
      {/* Rank-up "Liftoff" — overlay code-split, fetched only when it fires;
          watcher fires it on a genuine tier increase for the logged-in user */}
      <Suspense fallback={null}><LiftoffOverlay /></Suspense>
      {token && user && <LiftoffWatcher />}
      {/* Cinematic custom cursor — desktop only, opt-out via reduced-motion */}
      <MagneticCursor />
      {/* Global ⌘K / Ctrl+K command palette */}
      <CommandPalette />
      {/* Cinematic cross-window transition overlay (peer ⇄ mentor ⇄ student) */}
      <WindowSwitchOverlay />
      {/* V3 — Transit Sequence: 2.5s soul-switching ceremony. Replaces the
          V2 overlay above for users without prefers-reduced-motion; the V2
          overlay remains mounted as the reduced-motion fallback (its own
          guard short-circuits it). The store (`useIdentityTransit`) is the
          single source of truth, started by the URL-watcher effect above. */}
      <TransitSequence />
      {/* V3 — Pulse Ceremony: the rank-up ritual. Fires from
          usePulseCeremony.start(tier) when a student's Pulse tier
          crosses a threshold. Sits on document.body via portal. */}
      <PulseCeremony />
      {/* V3 — Signal Flare listener: opens PlanetMaterialization when
          a mentor publishes a course in a genre the user flared for. */}
      <SignalFlareListenerMount />
      {/* V3 — Cross-soul mentor invite: renders the 2-question modal when
          the user has a pending invite (top student / top swapper). */}
      <MentorInviteWatcher />
      <ToastContainer />
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-text)',
            border: '1px solid var(--toast-border)',
            boxShadow: 'var(--toast-shadow)',
          }
        }} 
      />

      {/* Notification System */}
      <NotificationSystem
        notifications={notifications}
        onDismiss={dismissNotification}
        onAction={handleNotificationAction}
      />

      {/* XP toast listener — subscribes to the `gameology:xp` socket event and
          fires a hot-toast on every learning bump. Mounted once so the toast
          appears no matter which page the user is on. No DOM; the hook is the
          whole component. */}
      <XpToast />

      {/* Full-Screen Incoming Call Overlay */}
      <IncomingCallOverlay
        call={incomingCall}
        onAccept={handleAcceptCall}
        onDecline={handleDeclineCall}
        onIgnore={handleIgnoreCall}
      />

      {/* Rating Modal */}
      {ratingModal && (
        <RatingModal
          isOpen={ratingModal.isOpen}
          onClose={closeRatingModal}
          otherUser={ratingModal.otherUser}
          callDuration={ratingModal.callDuration}
        />
      )}

      <RouteTours />

      <WarpTransition>
        <Routes location={location} key={location.pathname}>
        {/* Public — redirect logged-in users away */}
        <Route path="/"               element={<HomeRoute />} />
        <Route path="/login"          element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register"       element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
        {/* Friendly aliases for guessed URLs (B-04) → canonical routes */}
        <Route path="/signup"         element={<Navigate to="/register" replace />} />
        <Route path="/signin"         element={<Navigate to="/login" replace />} />
        <Route path="/skills"         element={<Navigate to="/peer/browse" replace />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/forgot-password"         element={<ForgotPassword />} />
        <Route path="/reset-password/:token"   element={<ResetPassword />} />

        {/* ── Shared (root) — accessible from any window ─────────────── */}
        <Route path="/profile"     element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/:userId" element={<Layout><Suspense fallback={<PageLoader />}><PublicProfile /></Suspense></Layout>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/orbit"       element={<ProtectedRoute><Orbit /></ProtectedRoute>} />
        <Route path="/orbit/history" element={<ProtectedRoute><MissionLog /></ProtectedRoute>} />
        <Route path="/shop"        element={<ProtectedRoute><Shop /></ProtectedRoute>} />
        <Route path="/holobay"     element={<ProtectedRoute><HoloBay /></ProtectedRoute>} />
        <Route path="/observatory" element={<ProtectedRoute><Observatory /></ProtectedRoute>} />
        <Route path="/cosmic-atlas" element={<Layout><Suspense fallback={<PageLoader />}><TierAtlas /></Suspense></Layout>} />
        <Route path="/settings"    element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        {/* Student courses catalog / learn / cert (Phase D student side) */}
        <Route path="/courses"                                    element={<ProtectedRoute><Suspense fallback={<PageLoader />}><CoursesBrowse /></Suspense></ProtectedRoute>} />
        <Route path="/courses/:id"                                element={<ProtectedRoute><Suspense fallback={<PageLoader />}><CourseDetail /></Suspense></ProtectedRoute>} />
        <Route path="/courses/:id/learn"                          element={<ProtectedRoute><Suspense fallback={<PageLoader />}><CourseLearn /></Suspense></ProtectedRoute>} />
        <Route path="/courses/:id/learn/:lessonId"                element={<ProtectedRoute><Suspense fallback={<PageLoader />}><CourseLearn /></Suspense></ProtectedRoute>} />
        <Route path="/courses/:id/certificate/:certId"            element={<ProtectedRoute><Suspense fallback={<PageLoader />}><CertificatePage /></Suspense></ProtectedRoute>} />
        {/* Gameology — student lifetime identity dashboard (Phase F) */}
        <Route path="/gameology" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><GameologyPage /></Suspense></ProtectedRoute>} />
        {/* V3 — Identity Selection bloom screen. Replaces the V2 3-radio role
            picker. The page is full-bleed (no Layout chrome) so the bloom is
            the entire moment. Auth-required: signing in lands here only for
            users who have not yet picked a soul. */}
        <Route path="/identity" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><IdentitySelection /></Suspense></ProtectedRoute>} />
        {/* V3 — Skill Map. The caller's constellation chart at /skill-map;
            the public shareable variant at /skill-map/:userId. The public
            route is NOT wrapped in ProtectedRoute — anyone with the URL
            can view the constellation (V3 design: it's a public artifact). */}
        <Route path="/skill-map" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><SkillMapV3 /></Suspense></ProtectedRoute>} />
        <Route path="/skill-map/:userId" element={<Layout><Suspense fallback={<PageLoader />}><SkillMapPublicV3 /></Suspense></Layout>} />

        {/* ── Peer window (/peer/*) — peer_learner (always on) ─────── */}
        <Route path="/peer/dashboard"   element={<ProtectedRoute><Suspense fallback={<PageLoader />}><PulseV3 /></Suspense></ProtectedRoute>} />
        <Route path="/peer/browse"      element={<ProtectedRoute><BrowseSkills /></ProtectedRoute>} />
        <Route path="/peer/matches"     element={<ProtectedRoute><Matches /></ProtectedRoute>} />
        <Route path="/peer/connections" element={<ProtectedRoute><Connections /></ProtectedRoute>} />
        <Route path="/peer/nearby"      element={<ProtectedRoute><NearbyMap /></ProtectedRoute>} />
        <Route path="/peer/trust"       element={<ProtectedRoute><TrustScore /></ProtectedRoute>} />
        <Route path="/peer/calls"       element={<ProtectedRoute><VideoCall /></ProtectedRoute>} />
        <Route path="/peer/calls/:roomId" element={<ProtectedRoute><VideoCall /></ProtectedRoute>} />

        {/* ── Mentor window (/mentor/*) — mentor ──────────────────── */}
        <Route path="/mentor/observatory" element={<ProtectedRoute><RoleGuard roles={['mentor']}><Suspense fallback={<PageLoader />}><ObservatoryV3 /></Suspense></RoleGuard></ProtectedRoute>} />
        {/* V3 — Mentor application. Intentionally NOT role-guarded: the
            cross-soul invite (top student / top swapper) links non-mentors
            here, and MentorHub renders its application machine for
            non-mentors (hub only for approved mentors). Previously this
            URL 404'd — every invite notification linked to a dead route. */}
        <Route path="/mentor/apply" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><MentorHub /></Suspense></ProtectedRoute>} />
        <Route path="/mentor/hub"      element={<ProtectedRoute><RoleGuard roles={['mentor']}><Suspense fallback={<PageLoader />}><MentorHub /></Suspense></RoleGuard></ProtectedRoute>} />
        <Route path="/mentor/sessions" element={<ProtectedRoute><RoleGuard roles={['mentor']}><Suspense fallback={<PageLoader />}><MentorSessions /></Suspense></RoleGuard></ProtectedRoute>} />
        <Route path="/mentor/earnings" element={<ProtectedRoute><RoleGuard roles={['mentor']}><Suspense fallback={<PageLoader />}><MentorEarnings /></Suspense></RoleGuard></ProtectedRoute>} />
        {/* Mentor courses (Phase D mentor side) — author / edit / publish */}
        <Route path="/mentor/courses"        element={<ProtectedRoute><RoleGuard roles={['mentor']}><Suspense fallback={<PageLoader />}><MentorCourseList /></Suspense></RoleGuard></ProtectedRoute>} />
        <Route path="/mentor/courses/new"    element={<ProtectedRoute><RoleGuard roles={['mentor']}><Suspense fallback={<PageLoader />}><MentorCourseNew /></Suspense></RoleGuard></ProtectedRoute>} />
        <Route path="/mentor/courses/:id/edit" element={<ProtectedRoute><RoleGuard roles={['mentor']}><Suspense fallback={<PageLoader />}><MentorCourseEdit /></Suspense></RoleGuard></ProtectedRoute>} />
        {/* Mentor Pact Hall — the weekly mentor league page */}
        <Route path="/mentor/pact" element={<ProtectedRoute><RoleGuard roles={['mentor']}><Suspense fallback={<PageLoader />}><MentorPactHall /></Suspense></RoleGuard></ProtectedRoute>} />
        {/* V3 — Moderation Inbox (mentor-only) */}
        <Route path="/mentor/moderation" element={<ProtectedRoute><RoleGuard roles={['mentor']}><Suspense fallback={<PageLoader />}><ModerationV3 /></Suspense></RoleGuard></ProtectedRoute>} />

        {/* ── Student window (/student/*) — student ────────────────── */}
        <Route path="/student/universe"          element={<ProtectedRoute><RoleGuard roles={['student']}><Suspense fallback={<PageLoader />}><UniverseV3 /></Suspense></RoleGuard></ProtectedRoute>} />
        <Route path="/student/sessions"          element={<ProtectedRoute><RoleGuard roles={['student']}><Suspense fallback={<PageLoader />}><MySessions /></Suspense></RoleGuard></ProtectedRoute>} />
        <Route path="/student/mentors"           element={<ProtectedRoute><RoleGuard roles={['student']}><Suspense fallback={<PageLoader />}><Sessions /></Suspense></RoleGuard></ProtectedRoute>} />
        <Route path="/student/mentors/:userId"   element={<ProtectedRoute><RoleGuard roles={['student']}><Suspense fallback={<PageLoader />}><SessionDetail /></Suspense></RoleGuard></ProtectedRoute>} />
        <Route path="/student/room/:sessionId"   element={<ProtectedRoute><RoleGuard roles={['student', 'mentor']}><Suspense fallback={<PageLoader />}><OrbitSessionRoom /></Suspense></RoleGuard></ProtectedRoute>} />

        {/* ── Legacy URL redirects — keep old bookmarks working ────── */}
        <Route path="/dashboard"   element={<Navigate to="/peer/dashboard" replace />} />
        <Route path="/browse"      element={<Navigate to="/peer/browse" replace />} />
        <Route path="/matches"     element={<Navigate to="/peer/matches" replace />} />
        <Route path="/connections" element={<Navigate to="/peer/connections" replace />} />
        <Route path="/nearby"      element={<Navigate to="/peer/nearby" replace />} />
        <Route path="/trust"       element={<Navigate to="/peer/trust" replace />} />
        <Route path="/video"       element={<Navigate to="/peer/calls" replace />} />
        <Route path="/call/:roomId" element={<LegacyRedirect to="/peer/calls/:roomId" />} />
        <Route path="/sessions"            element={<Navigate to="/student/mentors" replace />} />
        <Route path="/sessions/:userId"    element={<LegacyRedirect to="/student/mentors/:userId" />} />
        <Route path="/session-room/:sessionId" element={<LegacyRedirect to="/student/room/:sessionId" />} />
        <Route path="/my-sessions"         element={<Navigate to="/student/universe" replace />} />
        <Route path="/teach"               element={<Navigate to="/mentor/observatory" replace />} />
        <Route path="/signup"              element={<Navigate to="/register" replace />} />
        <Route path="/signin"              element={<Navigate to="/login" replace />} />

        {/* Cosmic badge gallery — dev/QA route, reachable by URL, not in nav */}
        <Route path="/cosmic-gallery" element={<Layout><Suspense fallback={<PageLoader />}><BadgeGallery /></Suspense></Layout>} />

        {/* Marketing brand-reveal preview — full-screen, no chrome, not in nav */}
        <Route path="/reveal" element={<Suspense fallback={null}><OrbitTeaserReveal standalone /></Suspense>} />

        {/* 404 — catch-all. AdminGate renders the hidden portal only when the
            path hashes to VITE_ADMIN_SLUG_HASH; otherwise it returns this 404. */}
        <Route path="*" element={<Suspense fallback={null}><AdminGate fallback={<NotFound />} /></Suspense>} />
        </Routes>
      </WarpTransition>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppInner />
    </Router>
  );
}

export default App;
