import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore, getCurrentWindow } from '../../store/authStore';
import Avatar from '../common/Avatar';
import api from '../../services/api';
import { unregisterPush } from '../../utils/pushNotify';
import RoleSwitcher from './RoleSwitcher';
import OrbitSigil from './OrbitSigil';
import NotificationBell from '../notifications/NotificationBell';
import { usePaletteStore } from '../fx/CommandPalette';
import { useSigilState } from '../../hooks/useSigilState';
import { useStreak } from '../../hooks/useStreak';
import PhotonIcon from '../../cosmic/PhotonIcon';
import PactBadge from '../pact/PactBadge';
import {
  LogOut, Layers, Compass, Users, Map, ShieldCheck,
  UserCircle, Menu, X, Handshake, Phone, Trophy, Rocket, ShoppingBag, Calendar, GraduationCap, DollarSign, Search, MessageCircle, Settings as SettingsIcon, Flame, Swords, Video, Film,
  Telescope, BookOpen, Award, Network, ShieldAlert, BarChart3, Users2, ChevronDown,
} from 'lucide-react';

// Three independent nav pill lists, one per role window. The Navbar picks
// the active list based on getCurrentWindow(location.pathname) so each
// role gets a focused, role-specific nav — no cross-window leakage of
// paid tabs into the peer view, no peer tabs in the mentor/student view.
//
// Shared pages (Orbit, Leaderboard, Shop, Profile) live at the root URL
// but appear inside the role window that lists them. Multi-role users
// see the role-switcher chip in the right-side cluster and can jump
// between windows.

const NAV_PEER = [
  { name: 'Skills',       path: '/peer/dashboard',   Icon: Layers,      window: 'peer' },
  { name: 'Browse',       path: '/peer/browse',      Icon: Compass,     window: 'peer' },
  { name: 'Matches',      path: '/peer/matches',     Icon: Handshake,   window: 'peer' },
  { name: 'Connections',  path: '/peer/connections', Icon: Users,       window: 'peer' },
  { name: 'Nearby',       path: '/peer/nearby',      Icon: Map,         window: 'peer' },
  { name: 'Calls',        path: '/peer/calls',       Icon: Phone,       window: 'peer' },
  { name: 'Trust',        path: '/peer/trust',       Icon: ShieldCheck, window: 'peer' },
  { name: 'Orbit',        path: '/orbit',            Icon: Rocket,      window: 'shared' },
  { name: 'Leaderboard',  path: '/leaderboard',      Icon: Trophy,      window: 'shared' },
  { name: 'Shop',         path: '/shop',             Icon: ShoppingBag, window: 'shared' },
];

// The mentor window has eleven destinations, which is four too many for one
// flat row — the strip ran into the wordmark on one side and the photon count
// on the other. They group cleanly, so four of the five pills open a panel
// instead of navigating. Profile is not here: the avatar chip already links to
// it, and listing it twice was what pushed the row over the edge.
const NAV_MENTOR = [
  { name: 'Observatory', path: '/mentor/observatory', Icon: Telescope, window: 'mentor' },
  {
    name: 'Teach', Icon: BookOpen, window: 'mentor',
    children: [
      { name: 'Courses', path: '/mentor/courses',  Icon: BookOpen, hint: 'Draft, publish, restructure' },
      { name: 'Record',  path: '/mentor/recorder', Icon: Video,    hint: 'Capture a lesson in the Studio' },
      { name: 'Media',   path: '/mentor/media',    Icon: Film,     hint: 'Every video you have uploaded' },
    ],
  },
  {
    name: 'People', Icon: Users2, window: 'mentor',
    children: [
      { name: 'Students', path: '/mentor/students', Icon: Users2,   hint: 'Everyone learning from you' },
      { name: 'Sessions', path: '/mentor/sessions', Icon: Calendar, hint: 'Bookings, past and upcoming' },
    ],
  },
  {
    name: 'Standing', Icon: BarChart3, window: 'mentor',
    children: [
      { name: 'Analytics', path: '/mentor/analytics', Icon: BarChart3,  hint: 'The funnel and where they stop' },
      { name: 'Earnings',  path: '/mentor/earnings',  Icon: DollarSign, hint: 'Released against pending' },
      { name: 'Pact',      path: '/mentor/pact',      Icon: Swords,     hint: 'Your league this week' },
    ],
  },
  { name: 'Review', path: '/mentor/moderation', Icon: ShieldAlert, window: 'mentor' },
];

const NAV_STUDENT = [
  { name: 'My Universe',  path: '/student/universe',     Icon: Telescope,     window: 'student' },
  { name: 'Courses',      path: '/courses',              Icon: BookOpen,      window: 'student' },
  { name: 'My Learning',  path: '/student/learning',     Icon: GraduationCap, window: 'student' },
  { name: 'Certificates', path: '/student/certificates', Icon: Award,         window: 'student' },
  { name: 'Progress',     path: '/gameology',            Icon: Flame,         window: 'student' },
  { name: 'Skill Map',    path: '/skill-map',            Icon: Network,       window: 'student' },
  { name: 'Sessions',     path: '/student/sessions',     Icon: Calendar,      window: 'student' },
  { name: 'Mentors',      path: '/student/mentors',      Icon: Compass,       window: 'student' },
  { name: 'Leaderboard',  path: '/leaderboard',          Icon: Trophy,        window: 'shared' },
];

const NavDivider = () => (
  <span
    aria-hidden
    className="hidden xl:block flex-shrink-0"
    style={{ width: 1, height: 20, background: 'var(--border-subtle)', opacity: 0.7 }}
  />
);

// A pill that opens a panel instead of navigating. Opens on hover with a
// 140ms close grace so crossing the gap to the panel does not dismiss it,
// and on click/Enter for keyboard and touch. Escape and any route change
// close it.
const NavGroup = ({ item, isActive, onNavigate }) => {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(0);
  const wrapRef = useRef(null);
  const groupActive = item.children.some((c) => isActive(c));

  const cancelClose = () => { clearTimeout(closeTimer.current); closeTimer.current = 0; };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 140);
  };
  useEffect(() => () => clearTimeout(closeTimer.current), []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  const { Icon } = item;
  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={() => { cancelClose(); setOpen(true); }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold tracking-wide transition-all duration-200 select-none whitespace-nowrap ${
          groupActive
            ? 'text-accent bg-accent/10 border border-accent/30'
            : 'text-text-secondary hover:text-text-primary hover:bg-surface border border-transparent'
        }`}
        style={{ letterSpacing: '0.02em' }}
      >
        <Icon size={12} strokeWidth={groupActive ? 2.5 : 2} />
        {item.name}
        <ChevronDown
          size={11}
          strokeWidth={2.4}
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 160ms', opacity: 0.7 }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 top-full mt-2 z-50 rounded-2xl overflow-hidden"
            style={{
              minWidth: 236,
              background: 'var(--surface)',
              border: '1px solid var(--border-subtle)',
              boxShadow: '0 18px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03) inset',
              backdropFilter: 'blur(14px)',
            }}
          >
            <div className="p-1.5">
              {item.children.map((child) => {
                const active = isActive(child);
                const ChildIcon = child.Icon;
                return (
                  <NavLink
                    key={child.path}
                    to={child.path}
                    onClick={() => { setOpen(false); onNavigate?.(); }}
                    className="flex items-start gap-2.5 px-2.5 py-2 rounded-xl transition-colors"
                    style={{
                      background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                      borderLeft: `2px solid ${active ? 'var(--accent-1)' : 'transparent'}`,
                    }}
                  >
                    <ChildIcon
                      size={14}
                      strokeWidth={active ? 2.4 : 2}
                      style={{ marginTop: 2, color: active ? 'var(--accent-1)' : 'var(--text-muted)' }}
                    />
                    <span className="min-w-0">
                      <span
                        className="block text-[12px] font-semibold"
                        style={{ color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                      >
                        {child.name}
                      </span>
                      <span
                        className="block text-[10.5px] mt-0.5 leading-snug"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {child.hint}
                      </span>
                    </span>
                  </NavLink>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  // Lazy init from the current scroll position (handles a restored scroll on
  // mount) so the effect never needs a synchronous setState.
  const [scrolled, setScrolled] = useState(
    () => typeof window !== 'undefined' && window.scrollY > 64
  );
  // Remember the most recently active role window so shared pages
  // (/orbit, /leaderboard, /shop, /settings, /profile) can still show
  // a meaningful pill bar instead of going empty. Defaults to 'peer'
  // for first-time visitors.
  const [lastWindow, setLastWindow] = useState(() => {
    if (typeof window === 'undefined') return 'peer';
    try { return sessionStorage.getItem('orbit-last-window') || 'peer'; }
    catch { return 'peer'; }
  });
  const drawerRef = useRef(null);
  const hamburgerRef = useRef(null);

  // Window detection — picks which NAV_* array to render. The function is a
  // pure string-prefix check so this is cheap and never stale (it tracks
  // the URL on every render). null on shared pages (/settings, /profile,
  // /leaderboard, /orbit, /shop) — in that case the pill list is empty
  // and the right-side icons are the only nav the user sees.
  const currentWindow = getCurrentWindow(location.pathname);
  // Persist the active role window so shared pages (/orbit, /leaderboard,
  // /shop, /settings, /profile) can fall back to it instead of going empty.
  useEffect(() => {
    if (currentWindow) {
      try { sessionStorage.setItem('orbit-last-window', currentWindow); } catch {}
      setLastWindow(currentWindow);
    }
  }, [currentWindow]);
  const activeWindow = currentWindow || lastWindow;
  const visibleNav =
    activeWindow === 'mentor'  ? NAV_MENTOR  :
    activeWindow === 'student' ? NAV_STUDENT :
    NAV_PEER;

  // Badges + counts are window-scoped: peer-only queries (pending
  // connections, reciprocal matches) only run when the user is on the
  // peer window — otherwise the queries would fire and 403 when the
  // user is on /mentor or /student and has no peer_learner role data
  // to read.
  const inPeerWindow = activeWindow === 'peer';

  // Fetch counts for badges
  const { data: pending } = useQuery({
    queryKey: ['connections', 'pending'],
    queryFn: () => api.get('/connections/pending').then(res => res.data),
    refetchInterval: 30000,
    enabled: inPeerWindow,
  });

  const { data: matchesData } = useQuery({
    queryKey: ['matches'],
    queryFn: () => api.get('/skills/matches').then(res => res.data),
    refetchInterval: 60000,
    enabled: inPeerWindow,
  });

  const incomingCount = pending?.incomingCount || 0;
  const matchesCount = Array.isArray(matchesData) ? matchesData.length : (matchesData?.matches?.length || 0);

  const navWithBadges = visibleNav.map(item => {
    if (item.path === '/peer/connections') return { ...item, badge: incomingCount };
    if (item.path === '/peer/matches') return { ...item, badge: matchesCount };
    return item;
  });

  // The mobile drawer has no hover, so groups are flattened into their leaves
  // and every destination stays one tap away.
  const flatNav = navWithBadges.flatMap((item) => (item.children ? item.children : [item]));

  const isActive = (item) => {
    const [base, qs] = item.path.split('?');
    const exact = location.pathname === base;
    const nested = location.pathname.startsWith(`${base}/`);
    if (!exact && !nested) return false;
    if (qs) {
      const want = new URLSearchParams(qs);
      const have = new URLSearchParams(location.search);
      for (const [k, v] of want) if (have.get(k) !== v) return false;
    }
    return true;
  };

  // Scroll detection — hysteresis dead-band (on >64px, off <24px) batched in a
  // single rAF so tiny scroll jitter near one threshold can't flip the glass
  // class every frame (v6 §2 nav flicker fix).
  useEffect(() => {
    let ticking = false;
    const evaluate = () => {
      ticking = false;
      const y = window.scrollY;
      setScrolled((prev) => (prev ? y > 24 : y > 64));
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(evaluate);
    };
    // Re-check once after mount in case the scroll position changed between the
    // lazy state init and the listener attaching (rAF → no sync setState).
    requestAnimationFrame(evaluate);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        hamburgerRef.current?.focus(); // return focus to trigger
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  // Close on outside click
  useEffect(() => {
    if (!mobileOpen) return;
    const onPointerDown = (e) => {
      if (
        drawerRef.current && !drawerRef.current.contains(e.target) &&
        hamburgerRef.current && !hamburgerRef.current.contains(e.target)
      ) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [mobileOpen]);

  // Close drawer when route changes
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    // Drop this device's FCM token first (needs the still-valid auth token),
    // then clear the session. No-op / instant on web.
    await unregisterPush();
    logout();
    navigate('/login');
  };

  return (
    <>
      <header
        className="sticky top-0 z-40 w-full"
        style={{
          paddingTop: `calc(${scrolled ? '5px' : '10px'} + env(safe-area-inset-top, 0px))`,
          paddingBottom: scrolled ? '5px' : '10px',
        }}
      >
        <div className="max-w-[1400px] mx-auto px-3 sm:px-5">
          <div
            className={`flex items-center justify-between px-3 rounded-2xl transition-all duration-300 ${scrolled ? 'nav-glass-scrolled' : 'nav-glass'}`}
            style={{ height: 52 }}
          >
            {/* ── Brand ── */}
            <NavLink to="/" className="flex items-center gap-2 flex-shrink-0">
              <img src="/favicon.svg" alt="Orbit" width="28" height="28" className="w-7 h-7 rounded-lg flex-shrink-0"
                style={{ boxShadow: '0 0 14px var(--border-glow)' }} />
              <span className="text-base font-display font-bold hidden sm:block"
                style={{ background: 'linear-gradient(135deg, var(--accent-1), var(--accent-3), var(--accent-2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Orbit
              </span>
            </NavLink>

            <div className="hidden xl:flex items-center flex-shrink-0 mx-3">
              <NavDivider />
            </div>

            {/* ── Desktop nav pills ──
                Peer and student windows list every destination flat. The
                mentor window groups its eleven into five, four of which open
                a panel — see NAV_MENTOR. */}
            <nav className="hidden xl:flex items-center gap-1 flex-1 justify-center min-w-0" aria-label="Main navigation">
              {navWithBadges.map((item) => {
                if (item.children) {
                  return (
                    <NavGroup
                      key={item.name}
                      item={item}
                      isActive={isActive}
                      onNavigate={() => setMobileOpen(false)}
                    />
                  );
                }
                const { name, path, Icon, badge } = item;
                const active = isActive({ path });
                return (
                  <NavLink key={path} to={path}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold tracking-wide transition-all duration-200 select-none whitespace-nowrap ${
                      active
                        ? 'text-accent bg-accent/10 border border-accent/30'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface border border-transparent'
                    }`}
                    style={{ letterSpacing: '0.02em' }}
                  >
                    <Icon size={12} strokeWidth={active ? 2.5 : 2} />
                    {name}
                    {badge > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-bold rounded-full"
                        style={{ background: 'linear-gradient(135deg, var(--accent-2), var(--accent-3))', color: '#fff', boxShadow: '0 2px 8px var(--border-glow)' }}
                        aria-label={`${badge} notification${badge !== 1 ? 's' : ''}`}
                      >
                        {badge > 99 ? '99+' : badge}
                      </span>
                    )}
                    {active && (
                      <motion.span layoutId="pill-dot"
                        className="absolute -top-px -right-px w-1.5 h-1.5 rounded-full"
                        style={{ background: 'var(--accent-1)', boxShadow: '0 0 6px var(--accent-1)' }}
                      />
                    )}
                  </NavLink>
                );
              })}
            </nav>

            <div className="hidden xl:flex items-center flex-shrink-0 mx-3">
              <NavDivider />
            </div>

            {/* ── Right side ──
                V3 — visible status chips. Currency (stardust) + Streak are
                pulled from the same useSigilState() the OrbitSigil reads,
                so the numbers stay in lockstep. Chat dispatches the
                `open-chat` window event handled by ChatDrawerMount at app
                root. Settings is a real NavLink. The OrbitSigil is kept as
                a small constellation to the right of the streak chip. */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <CurrencyChip />
              <StreakChip />
              <button
                type="button"
                onClick={() => usePaletteStore.getState().openPalette()}
                title="Command Palette (⌘K)"
                aria-label="Open command palette"
                className="hidden lg:inline-flex items-center gap-1.5 kbar-chip"
              >
                <Search size={11} />
                <span className="hidden 2xl:inline">Search</span>
                <kbd>⌘K</kbd>
              </button>

              {/* Chat — dispatches the same custom event ConnectionCard uses
                  to open the ChatDrawer with the conversation list. Now
                  visible at sm+ (was md+) so it works on tablets. */}
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-chat'))}
                title="Messages"
                aria-label="Open messages"
                className="inline-flex items-center justify-center w-8 h-8 rounded-xl text-text-secondary hover:text-text-primary transition-all bg-surface border border-border-subtle"
              >
                <MessageCircle size={15} />
              </button>

              {/* Notifications — always visible on sm+ screens. */}
              <div className="inline-flex items-center justify-center">
                <NotificationBell />
              </div>

              {/* Settings — always visible. Was hidden on small screens, which
                  made the user think the icon was broken. */}
              <NavLink
                to="/settings"
                title="Settings"
                aria-label="Open settings"
                className="inline-flex items-center justify-center w-8 h-8 rounded-xl text-text-secondary hover:text-text-primary transition-all bg-surface border border-border-subtle"
              >
                <SettingsIcon size={15} />
              </NavLink>

              {/* The Sigil — the status constellation (level + league). */}
              <div className="hidden md:inline-flex items-center justify-center">
                <OrbitSigil />
              </div>

              <NavLink to="/profile" title="Profile"
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all text-text-secondary hover:text-text-primary bg-surface border border-border-subtle"
              >
                <Avatar name={user?.name} url={user?.avatar} size="xs" userId={user?._id} />
                <span className="hidden md:block max-w-[80px] truncate">{user?.name?.split(' ')[0]}</span>
                {activeWindow === 'mentor' && (
                  <PactBadge size={14} withShield={false} />
                )}
                <RoleSwitcher />
              </NavLink>

              <button
                onClick={handleLogout}
                aria-label="Logout"
                title="Logout"
                className="hidden lg:flex items-center justify-center w-8 h-8 rounded-xl text-text-muted hover:text-danger transition-all bg-surface border border-border-subtle"
              >
                <LogOut size={15} />
              </button>

              {/* Hamburger */}
              <button
                ref={hamburgerRef}
                onClick={() => setMobileOpen(v => !v)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav-drawer"
                className="xl:hidden flex items-center justify-center w-8 h-8 rounded-xl text-text-secondary hover:text-text-primary transition-all bg-surface border border-border-subtle"
              >
                {mobileOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            ref={drawerRef}
            id="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="fixed top-[72px] left-3 right-3 z-40 rounded-2xl overflow-hidden xl:hidden mobile-nav-glass"
          >
            <div className="p-3 grid grid-cols-2 gap-1.5">
              {flatNav.map(({ name, path, Icon, badge }) => (
                <NavLink key={path} to={path} onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'text-accent bg-accent/10 border border-accent/30' : 'text-text-secondary hover:text-text-primary bg-surface border border-border-subtle'}`
                  }
                >
                  <Icon size={15} /> {name}
                  {badge > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-bold rounded-full"
                      style={{ background: 'linear-gradient(135deg,#ff0076,#7c3aed)', color: '#fff' }}
                      aria-label={`${badge} notification${badge !== 1 ? 's' : ''}`}
                    >
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </NavLink>
              ))}
              <NavLink to="/profile" onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'text-accent bg-accent/10 border border-accent/30' : 'text-text-secondary hover:text-text-primary bg-surface border border-border-subtle'}`}
              >
                <UserCircle size={15} /> Profile
              </NavLink>
              <button onClick={handleLogout}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium text-danger/70 hover:text-danger transition-all"
                style={{ background: 'rgba(255,75,75,0.06)', border: '1px solid rgba(255,75,75,0.15)' }}
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;

// ────────────────────────────────────────────────────────────
// Status chips (Currency + Streak)
// ────────────────────────────────────────────────────────────
//
// Two small NavLinks in the right cluster of the navbar that surface
// the user's stardust balance and learning streak. They use the SAME
// branded components the rest of the app uses — the PhotonIcon SVG
// (luminous core + tilted orbital ring + animated satellite) for
// currency, and a Flame from lucide styled with the `useStreak`
// dayKey palette (orange when the streak is alive, slate when it's
// at risk or dead) for streak. No made-up icons, no rainbow chip
// backgrounds — just the original Orbit look, sized for the nav.

const CurrencyChip = () => {
  const { stardust } = useSigilState();
  return (
    <NavLink
      to="/shop"
      title={`${stardust.toLocaleString()} stardust — open the shop`}
      aria-label={`${stardust.toLocaleString()} stardust — open the shop`}
      className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-text-secondary hover:text-text-primary transition-colors"
    >
      <PhotonIcon size={15} animated />
      <span
        className="font-mono font-semibold tabular-nums"
        style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}
      >
        {stardust.toLocaleString()}
      </span>
    </NavLink>
  );
};

const StreakChip = () => {
  const { streak, dayKey } = useStreak();
  const navigate = useNavigate();
  const palette = {
    today:     { color: '#fb923c', glow: 'drop-shadow(0 0 5px rgba(251,146,60,0.6))' },
    yesterday: { color: '#f59e0b', glow: 'drop-shadow(0 0 4px rgba(245,158,11,0.5))' },
    older:     { color: '#94a3b8', glow: 'none' },
    never:     { color: '#64748b', glow: 'none' },
  }[dayKey];
  const isPulsing = dayKey === 'today';
  return (
    <button
      type="button"
      onClick={() => navigate('/gameology')}
      title={
        dayKey === 'today'     ? `${streak}-day learning streak — alive!`
        : dayKey === 'yesterday' ? `${streak}-day streak — one lesson keeps it alive`
        : dayKey === 'older'   ? 'Streak cooled. One lesson starts a new one.'
        : 'Start a learning streak today.'
      }
      aria-label={`${streak}-day learning streak — open the pulse`}
      className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-text-secondary hover:text-text-primary transition-colors"
    >
      <motion.span
        animate={isPulsing ? { scale: [1, 1.15, 1] } : {}}
        transition={isPulsing ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } : {}}
        className="inline-flex"
      >
        <Flame
          size={12}
          strokeWidth={2.4}
          style={{ color: palette.color, filter: palette.glow }}
        />
      </motion.span>
      <span
        className="font-mono font-semibold tabular-nums"
        style={{ fontSize: '0.78rem', color: palette.color }}
      >
        {streak}
      </span>
    </button>
  );
};
