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
  Menu, X, Handshake, Phone, Trophy, Rocket, ShoppingBag, Calendar,
  GraduationCap, DollarSign, Search, MessageCircle, Settings as SettingsIcon,
  Flame, Swords, Video, Film, Telescope, BookOpen, Award, Network, ShieldAlert,
  BarChart3, Users2,
} from 'lucide-react';

const NAV_PEER = [
  { name: 'Skills',       path: '/peer/dashboard',   Icon: Layers },
  { name: 'Browse',       path: '/peer/browse',      Icon: Compass },
  { name: 'Matches',      path: '/peer/matches',     Icon: Handshake },
  { name: 'Connections',  path: '/peer/connections', Icon: Users },
  { name: 'Nearby',       path: '/peer/nearby',      Icon: Map },
  { name: 'Calls',        path: '/peer/calls',       Icon: Phone },
  { name: 'Trust',        path: '/peer/trust',       Icon: ShieldCheck },
  { name: 'Orbit',        path: '/orbit',            Icon: Rocket },
  { name: 'Leaderboard',  path: '/leaderboard',      Icon: Trophy },
  { name: 'Shop',         path: '/shop',             Icon: ShoppingBag },
];

const NAV_MENTOR = [
  { name: 'Observatory', path: '/mentor/observatory', Icon: Telescope },
  { name: 'Courses',     path: '/mentor/courses',     Icon: BookOpen },
  { name: 'Record',      path: '/mentor/recorder',    Icon: Video },
  { name: 'Media',       path: '/mentor/media',       Icon: Film },
  { name: 'Students',    path: '/mentor/students',    Icon: Users2 },
  { name: 'Sessions',    path: '/mentor/sessions',    Icon: Calendar },
  { name: 'Analytics',   path: '/mentor/analytics',   Icon: BarChart3 },
  { name: 'Earnings',    path: '/mentor/earnings',    Icon: DollarSign },
  { name: 'Pact',        path: '/mentor/pact',        Icon: Swords },
  { name: 'Review',      path: '/mentor/moderation',  Icon: ShieldAlert },
];

const NAV_STUDENT = [
  { name: 'My Universe',  path: '/student/universe',     Icon: Telescope },
  { name: 'Courses',      path: '/courses',              Icon: BookOpen },
  { name: 'My Learning',  path: '/student/learning',     Icon: GraduationCap },
  { name: 'Certificates', path: '/student/certificates', Icon: Award },
  { name: 'Progress',     path: '/gameology',            Icon: Flame },
  { name: 'Skill Map',    path: '/skill-map',            Icon: Network },
  { name: 'Sessions',     path: '/student/sessions',     Icon: Calendar },
  { name: 'Mentors',      path: '/student/mentors',      Icon: Compass },
  { name: 'Leaderboard',  path: '/leaderboard',          Icon: Trophy },
];

const RAIL_LABEL = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.615rem',
  letterSpacing: '0.19em',
  fontWeight: 700,
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
};

const CLUSTER = {
  background: 'var(--surface)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 999,
};

const HAIR = { width: 1, alignSelf: 'stretch', background: 'var(--border-subtle)', opacity: 0.8 };

const SectionRail = ({ items, isActive, height }) => {
  const scrollRef = useRef(null);
  const activeRef = useRef(null);
  const activePath = items.find((i) => isActive(i))?.path || '';

  useEffect(() => {
    const el = activeRef.current;
    const box = scrollRef.current;
    if (!el || !box || box.scrollWidth <= box.clientWidth) return;
    const left = el.offsetLeft - box.clientWidth / 2 + el.offsetWidth / 2;
    box.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
  }, [activePath]);

  return (
    <div
      ref={scrollRef}
      className="rail-scroll flex items-stretch overflow-x-auto"
      style={{
        height,
        paddingLeft: 20,
        paddingRight: 20,
        maskImage: 'linear-gradient(90deg, transparent 0, #000 18px, #000 calc(100% - 18px), transparent 100%)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent 0, #000 18px, #000 calc(100% - 18px), transparent 100%)',
      }}
    >
      {items.map((item) => {
        const active = item.path === activePath;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            ref={active ? activeRef : null}
            aria-current={active ? 'page' : undefined}
            className={`relative flex items-center flex-shrink-0 transition-colors duration-200 ${
              active ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'
            }`}
            style={{ padding: '0 15px' }}
          >
            <span style={RAIL_LABEL}>{item.name}</span>
            {item.badge > 0 && (
              <span
                className="font-mono tabular-nums"
                style={{
                  marginLeft: 5, fontSize: '0.55rem', fontWeight: 700, lineHeight: 1,
                  alignSelf: 'flex-start', marginTop: '0.9rem', color: 'var(--accent-2)',
                }}
                aria-label={`${item.badge} waiting`}
              >
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
            {active && (
              <motion.span
                layoutId="rail-underline"
                className="absolute bottom-0"
                style={{
                  left: 12, right: 12, height: 2, borderRadius: 2,
                  background: 'linear-gradient(90deg, var(--accent-1), var(--accent-3))',
                  boxShadow: '0 0 10px var(--border-glow)',
                }}
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
          </NavLink>
        );
      })}
    </div>
  );
};

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(
    () => typeof window !== 'undefined' && window.scrollY > 64
  );
  const [lastWindow, setLastWindow] = useState(() => {
    if (typeof window === 'undefined') return 'peer';
    try { return sessionStorage.getItem('orbit-last-window') || 'peer'; }
    catch { return 'peer'; }
  });
  const drawerRef = useRef(null);
  const hamburgerRef = useRef(null);

  const currentWindow = getCurrentWindow(location.pathname);
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

  const inPeerWindow = activeWindow === 'peer';

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
    requestAnimationFrame(evaluate);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        hamburgerRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

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

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    await unregisterPush();
    logout();
    navigate('/login');
  };

  const brandH = scrolled ? 44 : 50;
  const railH = scrolled ? 32 : 38;

  return (
    <>
      <header
        className="sticky top-0 z-40 w-full"
        style={{
          paddingTop: `calc(${scrolled ? '5px' : '10px'} + env(safe-area-inset-top, 0px))`,
          paddingBottom: scrolled ? '5px' : '10px',
        }}
      >
        <div className="max-w-[1400px] mx-auto px-3 sm:px-5 relative">
          <div
            className={`rounded-2xl overflow-hidden transition-all duration-300 ${scrolled ? 'nav-glass-scrolled' : 'nav-glass'}`}
          >
            <div
              className="flex items-center justify-between gap-3 px-3.5"
              style={{ height: brandH, transition: 'height 300ms' }}
            >
              <NavLink to="/" className="flex items-center gap-2 min-w-0">
                <img
                  src="/favicon.svg" alt="Orbit" width="26" height="26"
                  className="w-[26px] h-[26px] rounded-lg flex-shrink-0"
                  style={{ boxShadow: '0 0 14px var(--border-glow)' }}
                />
                <span
                  className="font-display hidden sm:block truncate"
                  style={{
                    fontSize: '1.02rem', fontWeight: 800, letterSpacing: '-0.02em',
                    background: 'linear-gradient(135deg, var(--accent-1), var(--accent-3), var(--accent-2))',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}
                >
                  Orbit
                </span>
                <span
                  className="hidden xl:block font-mono flex-shrink-0"
                  style={{
                    marginLeft: 10, fontSize: '0.52rem', letterSpacing: '0.26em', fontWeight: 700,
                    textTransform: 'uppercase', color: 'var(--text-muted)', paddingTop: 2,
                  }}
                >
                  {activeWindow}
                </span>
              </NavLink>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div className="hidden sm:flex items-center" style={{ ...CLUSTER, height: 30, paddingInline: 4 }}>
                  <CurrencyChip />
                  <span aria-hidden style={{ ...HAIR, marginInline: 2, marginBlock: 7 }} />
                  <StreakChip />
                </div>

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

                <div className="flex items-center" style={{ ...CLUSTER, height: 30 }}>
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('open-chat'))}
                    title="Messages"
                    aria-label="Open messages"
                    className="inline-flex items-center justify-center w-8 h-[30px] text-text-secondary hover:text-text-primary transition-colors"
                    style={{ borderRadius: '999px 0 0 999px' }}
                  >
                    <MessageCircle size={14} />
                  </button>
                  <span aria-hidden style={{ ...HAIR, marginBlock: 7 }} />
                  <span className="inline-flex items-center justify-center w-8 h-[30px]">
                    <NotificationBell />
                  </span>
                  <span aria-hidden style={{ ...HAIR, marginBlock: 7 }} />
                  <NavLink
                    to="/settings"
                    title="Settings"
                    aria-label="Open settings"
                    className="inline-flex items-center justify-center w-8 h-[30px] text-text-secondary hover:text-text-primary transition-colors"
                    style={{ borderRadius: '0 999px 999px 0' }}
                  >
                    <SettingsIcon size={14} />
                  </NavLink>
                </div>

                <div className="hidden md:inline-flex items-center justify-center">
                  <OrbitSigil />
                </div>

                <NavLink
                  to="/profile" title="Profile"
                  className="hidden lg:flex items-center gap-1.5 pl-1 pr-2.5 text-xs font-medium transition-colors text-text-secondary hover:text-text-primary"
                  style={{ ...CLUSTER, height: 30 }}
                >
                  <Avatar name={user?.name} url={user?.avatar} size="xs" userId={user?._id} />
                  <span className="hidden xl:block max-w-[86px] truncate">{user?.name?.split(' ')[0]}</span>
                  {activeWindow === 'mentor' && <PactBadge size={14} withShield={false} />}
                  <RoleSwitcher />
                </NavLink>

                <button
                  onClick={handleLogout}
                  aria-label="Logout"
                  title="Logout"
                  className="hidden lg:flex items-center justify-center w-[30px] h-[30px] text-text-muted hover:text-danger transition-colors"
                  style={{ ...CLUSTER, borderRadius: 999 }}
                >
                  <LogOut size={14} />
                </button>

                <button
                  ref={hamburgerRef}
                  onClick={() => setMobileOpen(v => !v)}
                  aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-nav-drawer"
                  className="lg:hidden flex items-center justify-center w-[30px] h-[30px] text-text-secondary hover:text-text-primary transition-colors"
                  style={{ ...CLUSTER, borderRadius: 999 }}
                >
                  {mobileOpen ? <X size={15} /> : <Menu size={15} />}
                </button>
              </div>
            </div>

            <div
              className="hidden lg:block"
              style={{ borderTop: '1px solid var(--border-subtle)' }}
            >
              <SectionRail items={navWithBadges} isActive={isActive} height={railH} />
            </div>
          </div>

          <AnimatePresence>
            {mobileOpen && (
              <motion.nav
                id="mobile-nav-drawer"
                ref={drawerRef}
                aria-label="Sections"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="lg:hidden absolute inset-x-3 sm:inset-x-5 z-50 mobile-nav-glass rounded-2xl overflow-hidden"
                style={{ top: '100%', marginTop: 6, border: '1px solid var(--border-subtle)' }}
              >
                <div className="px-4 pt-3.5 pb-1.5">
                  <span
                    style={{
                      ...RAIL_LABEL, fontSize: '0.5rem', letterSpacing: '0.3em',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {activeWindow}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-1 px-2 pb-2">
                  {navWithBadges.map(({ name, path, Icon, badge }) => (
                    <NavLink
                      key={path}
                      to={path}
                      className={({ isActive: on }) =>
                        `flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl transition-colors ${
                          on ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'
                        }`
                      }
                      style={({ isActive: on }) => (on ? { background: 'var(--surface)' } : undefined)}
                    >
                      <Icon size={14} className="flex-shrink-0" />
                      <span className="truncate" style={{ ...RAIL_LABEL, fontSize: '0.575rem' }}>{name}</span>
                      {badge > 0 && (
                        <span
                          className="font-mono tabular-nums ml-auto"
                          style={{ fontSize: '0.55rem', fontWeight: 700, color: 'var(--accent-2)' }}
                        >
                          {badge > 99 ? '99+' : badge}
                        </span>
                      )}
                    </NavLink>
                  ))}
                </div>

                <div
                  className="flex items-center gap-2 px-2.5 py-2.5"
                  style={{ borderTop: '1px solid var(--border-subtle)' }}
                >
                  <NavLink
                    to="/profile"
                    className="flex items-center gap-2 pl-1 pr-2.5 py-1 text-text-secondary hover:text-text-primary transition-colors"
                    style={{ ...CLUSTER, height: 30 }}
                  >
                    <Avatar name={user?.name} url={user?.avatar} size="xs" userId={user?._id} />
                    <span style={{ ...RAIL_LABEL, fontSize: '0.55rem' }}>
                      {user?.name?.split(' ')[0] || 'Profile'}
                    </span>
                    {activeWindow === 'mentor' && <PactBadge size={13} withShield={false} />}
                  </NavLink>

                  <div className="sm:hidden flex items-center" style={{ ...CLUSTER, height: 30, paddingInline: 4 }}>
                    <CurrencyChip />
                    <span aria-hidden style={{ ...HAIR, marginInline: 2, marginBlock: 7 }} />
                    <StreakChip />
                  </div>

                  <div className="ml-auto flex items-center gap-1.5">
                    <RoleSwitcher />
                    <button
                      onClick={handleLogout}
                      aria-label="Logout"
                      className="flex items-center justify-center w-[30px] h-[30px] text-text-muted hover:text-danger transition-colors"
                      style={{ ...CLUSTER, borderRadius: 999 }}
                    >
                      <LogOut size={14} />
                    </button>
                  </div>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </header>
    </>
  );
};

const STREAK_TONE = {
  today:     { color: '#fb923c', glow: 'rgba(251,146,60,0.55)' },
  yesterday: { color: '#fbbf24', glow: 'rgba(251,191,36,0.45)' },
  older:     { color: 'var(--text-muted)', glow: 'transparent' },
  never:     { color: 'var(--text-muted)', glow: 'transparent' },
};

const CHIP_NUM = {
  fontSize: '0.62rem',
  fontWeight: 700,
  letterSpacing: '0.01em',
  lineHeight: 1,
};

function CurrencyChip() {
  const { stardust } = useSigilState();
  const shown = stardust >= 10000 ? `${(stardust / 1000).toFixed(1)}k` : stardust.toLocaleString('en-IN');
  return (
    <NavLink
      to="/shop"
      title={`${stardust.toLocaleString('en-IN')} Photons`}
      aria-label={`${stardust} photons, open shop`}
      className="flex items-center gap-1.5 px-2 h-[22px] text-text-primary hover:opacity-80 transition-opacity"
    >
      <PhotonIcon size={13} />
      <span className="font-mono tabular-nums" style={CHIP_NUM}>{shown}</span>
    </NavLink>
  );
}

function StreakChip() {
  const { streak, dayKey } = useStreak();
  const tone = STREAK_TONE[dayKey] || STREAK_TONE.never;
  const alive = dayKey === 'today' && streak > 0;
  return (
    <NavLink
      to="/gameology"
      title={streak > 0 ? `${streak}-day streak` : 'No streak yet'}
      aria-label={`${streak} day streak, open progress`}
      className="flex items-center gap-1.5 px-2 h-[22px] hover:opacity-80 transition-opacity"
    >
      <motion.span
        className="inline-flex"
        animate={alive ? { scale: [1, 1.13, 1] } : { scale: 1 }}
        transition={alive ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } : { duration: 0 }}
        style={{
          color: tone.color,
          filter: alive ? `drop-shadow(0 0 5px ${tone.glow})` : 'none',
        }}
      >
        <Flame size={13} />
      </motion.span>
      <span
        className="font-mono tabular-nums"
        style={{ ...CHIP_NUM, color: streak > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}
      >
        {streak}
      </span>
    </NavLink>
  );
}

export default Navbar;
