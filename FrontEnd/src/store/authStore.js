import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Account roles. `peer_learner` is the free baseline that every account
// has. `mentor` and `student` are paid economies and can be added or
// removed independently (see Settings → Roles). A user can hold any
// combination — the same person can be a peer_learner + mentor + student
// at once, and the UI (Navbar, /teach, /my-sessions) reflects the
// superset of everything the account is allowed to do.
export const ACCOUNT_ROLES = ['peer_learner', 'mentor', 'student'];

export const ROLE_META = {
  peer_learner: {
    label: 'Peer Learner',
    short: 'Peer',
    accent: 'cyan',
    description: 'Free skill-swap worldwide.',
  },
  mentor: {
    label: 'Mentor',
    short: 'Mentor',
    accent: 'purple',
    description: 'Get paid for 1-on-1 video sessions.',
  },
  student: {
    label: 'Student',
    short: 'Student',
    accent: 'blue',
    description: 'Book mentors, learn live, rate them.',
  },
};

// Pick the post-login landing route for a given roles array. Priority:
//   1. Has mentor + student  → /student/universe (V3 My Universe home)
//   2. Has mentor only       → /mentor/observatory (V3 The Observatory)
//   3. Has student only      → /student/universe (V3 My Universe)
//   4. peer_learner only     → /peer/dashboard (V3 The Pulse)
//   5. Empty (shouldn't happen) → /peer/dashboard
// Mirrors the role-prefixed URL scheme (see App.jsx + the three-window
// refactor plan). The single-role peer_learner fallback lands on the peer
// window's home because peer_learner is the baseline role every account
// gets — it's the safest default. V3 — all three landing routes are the
// V3 soul homes (Pulse / Observatory / My Universe), not the V2 dashboards.
export function getLandingRoute(roles) {
  const set = new Set(Array.isArray(roles) ? roles : ['peer_learner']);
  if (set.has('mentor') && set.has('student')) return '/student/universe';
  if (set.has('mentor')) return '/mentor/observatory';
  if (set.has('student')) return '/student/universe';
  return '/peer/dashboard';
}

// Returns 'peer' | 'mentor' | 'student' | null. The navbar uses this to
// pick which pill list to render; the RoleSwitcher uses it to highlight
// the current window. `null` means the user is on a shared page
// (/settings, /profile, /leaderboard, /orbit, /shop, …) where no window-
// specific nav applies. Pure function — safe to call inside render.
export function getCurrentWindow(pathname) {
  if (!pathname || typeof pathname !== 'string') return null;
  if (pathname.startsWith('/peer'))    return 'peer';
  if (pathname.startsWith('/mentor'))  return 'mentor';
  if (pathname.startsWith('/student')) return 'student';
  return null;
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      // Convenience selectors.
      roles: () => {
        const u = get().user;
        if (Array.isArray(u?.roles) && u.roles.length > 0) return u.roles;
        return ['peer_learner'];
      },
      rolesVersion: () => get().user?.rolesVersion ?? 0,
      hasRole: (role) => {
        const r = get().user?.roles;
        if (Array.isArray(r) && r.length > 0) return r.includes(role);
        return role === 'peer_learner';
      },
      hasAnyRole: (roles) => {
        if (!Array.isArray(roles) || roles.length === 0) return true;
        const r = get().user?.roles;
        const list = Array.isArray(r) && r.length > 0 ? r : ['peer_learner'];
        return roles.some((x) => list.includes(x));
      },
      landingRoute: () => getLandingRoute(get().user?.roles),
      // Defensive setUser: merge incoming fields onto the existing user so
      // a stale or partial response (e.g. /user/profile from a build that
      // didn't yet include `roles` / `rolesVersion`) can NEVER silently
      // clobber a more recent value. The persisted state from a previous
      // app version is the source of truth for fields the server didn't
      // return this time.
      setUser: (user) => set((state) => {
        if (!user) return { user: null };
        const merged = state.user ? { ...state.user, ...user } : user;
        return { user: merged };
      }),
      setToken: (token) => set({ token }),
      // Atomic swap used by the ROLES_STALE interceptor: replace both user
      // and token in one set() so subscribers only re-render once. We
      // still merge onto the existing user defensively so partial
      // payloads (e.g. user without roles because the refresh endpoint
      // short-circuited) don't wipe the cached value.
      setSession: ({ user, token }) => set((state) => {
        const merged = user
          ? (state.user ? { ...state.user, ...user } : user)
          : state.user;
        return { user: merged, token };
      }),
      logout: () => {
        set({ user: null, token: null });
      },
    }),
    {
      name: 'auth-storage',
      // Bump the version when the shape of the persisted state changes
      // meaningfully (e.g. when `roles` / `rolesVersion` were added). The
      // migrate() function below runs once on rehydrate for any storage
      // record that's still on an older version, so an old browser session
      // doesn't get stuck with a user object that's missing the new fields.
      version: 2,
      migrate: (persisted, fromVersion) => {
        if (!persisted || fromVersion >= 2) return persisted;
        // v1 -> v2: ensure the user has a roles array. Pre-feature users
        // may have been persisted with `role: "user"` (singular string)
        // and no `roles` field. Default them to peer_learner, which the
        // backend already does on the next login.
        if (persisted.user && !Array.isArray(persisted.user.roles)) {
          return {
            ...persisted,
            user: {
              ...persisted.user,
              roles: ['peer_learner'],
              rolesVersion: typeof persisted.user.rolesVersion === 'number' ? persisted.user.rolesVersion : 0,
            },
          };
        }
        return persisted;
      },
    }
  )
);
