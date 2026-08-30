import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, ROLE_META, getCurrentWindow } from '../../store/authStore';
import { Users, GraduationCap, BookOpen, ChevronDown } from 'lucide-react';

// Icons per role — small set, inline so we don't pull from elsewhere.
const ROLE_ICONS = {
  peer_learner: Users,
  mentor: GraduationCap,
  student: BookOpen,
};

// Home route per role — the dropdown navigates here when the user picks
// a different role. Mirrors the same priorities as getLandingRoute.
const ROLE_HOME = {
  peer_learner: '/peer/dashboard',
  mentor: '/mentor/hub',
  student: '/student/sessions',
};

// Color classes per role accent. Matches the existing static role chip
// in Navbar.jsx (purple/blue/cyan) for a consistent look across single- and
// multi-role users. The dot color is used in the dropdown's "current"
// indicator next to the active option.
const ACCENT = {
  peer_learner: {
    chip: 'bg-cyan-500/15 text-cyan-200 border border-cyan-400/30',
    dot: 'bg-cyan-400',
  },
  mentor: {
    chip: 'bg-purple-500/15 text-purple-200 border border-purple-400/30',
    dot: 'bg-purple-400',
  },
  student: {
    chip: 'bg-blue-500/15 text-blue-200 border border-blue-400/30',
    dot: 'bg-blue-400',
  },
};

/**
 * Role switcher chip in the navbar right-side cluster.
 *
 * Two modes, chosen by the number of roles the user holds:
 *   - 1 role  → static, non-interactive label (preserves the pre-refactor
 *               look-and-feel; single-role users don't need a switcher).
 *   - 2+ roles → clickable button that opens a dropdown listing every
 *               role the user holds, with the role's home route as the
 *               click target. The active window is highlighted so the
 *               user can see where they currently are.
 *
 * The component is intentionally tiny: 100 lines, one file. The heavy
 * lifting (which roles the user has, what each one means) lives in
 * `authStore` so the switcher can stay a pure presentational layer.
 */
const RoleSwitcher = () => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);

  const userRoles = Array.isArray(user?.roles) && user.roles.length > 0
    ? user.roles
    : ['peer_learner'];
  // Multi-role: peer_learner is always present, so 2+ roles is the threshold
  // for showing the dropdown.
  const isMultiRole = userRoles.length >= 2;
  // The "display" role for the chip — the highest-priority non-peer role
  // if present, else peer_learner. Mirrors the existing ROLE_CHIP_PRIORITY
  // in Navbar so a user who is a peer+mentor sees "Mentor" on the chip.
  const displayRole = userRoles.includes('mentor') ? 'mentor'
    : userRoles.includes('student') ? 'student'
    : 'peer_learner';
  const currentWindow = getCurrentWindow(location.pathname);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  // Close on Escape — return focus to the trigger so keyboard users keep
  // their place (a11y minimum).
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Close on route change so the dropdown doesn't linger over the new page.
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Single-role: static chip. Mirrors the pre-refactor Navbar chip exactly
  // (same classes, same color, same uppercase short label) so single-role
  // users see no behavior change.
  if (!isMultiRole) {
    const meta = ACCENT[displayRole];
    return (
      <span
        className={[
          'hidden xl:inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded',
          meta.chip,
        ].join(' ')}
        aria-label={`Account role: ${ROLE_META[displayRole]?.label || displayRole}`}
      >
        {ROLE_META[displayRole]?.short || displayRole}
      </span>
    );
  }

  // Multi-role: clickable dropdown.
  const pick = (role) => {
    setOpen(false);
    navigate(ROLE_HOME[role] || '/peer/dashboard');
  };

  return (
    <div ref={wrapperRef} className="relative hidden xl:block">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Switch window"
        className={[
          'inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded transition-all',
          ACCENT[displayRole].chip,
          open ? 'ring-1 ring-accent/40' : 'hover:ring-1 hover:ring-accent/20',
        ].join(' ')}
      >
        {ROLE_META[displayRole]?.short || displayRole}
        <ChevronDown
          size={10}
          strokeWidth={2.5}
          className={'transition-transform ' + (open ? 'rotate-180' : '')}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            role="menu"
            className="absolute right-0 top-full mt-1.5 w-60 rounded-xl border border-border-subtle bg-surface/95 backdrop-blur-sm shadow-xl overflow-hidden z-50"
          >
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-text-muted border-b border-border-subtle">
              Switch window
            </div>
            {userRoles.map((role) => {
              const Icon = ROLE_ICONS[role] || Users;
              const label = ROLE_META[role]?.label || role;
              const isCurrent = (
                (role === 'peer_learner' && currentWindow === 'peer') ||
                (role === 'mentor' && currentWindow === 'mentor') ||
                (role === 'student' && currentWindow === 'student')
              );
              return (
                <button
                  key={role}
                  type="button"
                  role="menuitem"
                  onClick={() => pick(role)}
                  className={[
                    'w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors text-left',
                    isCurrent
                      ? 'bg-accent/10 text-text-primary'
                      : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary',
                  ].join(' ')}
                >
                  <span className={[
                    'flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center',
                    ACCENT[role]?.chip || ACCENT.peer_learner.chip,
                  ].join(' ')}>
                    <Icon size={14} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs">{label}</div>
                    <div className="text-[10px] text-text-muted">
                      Go to {label.toLowerCase()} window
                    </div>
                  </div>
                  {isCurrent && (
                    <span
                      className={['w-1.5 h-1.5 rounded-full flex-shrink-0', ACCENT[role]?.dot || 'bg-cyan-400'].join(' ')}
                      aria-label="Current window"
                    />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoleSwitcher;
