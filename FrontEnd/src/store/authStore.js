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
    description: 'Free skill-swap with peers worldwide. You teach what you know, you learn what you want.',
  },
  mentor: {
    label: 'Mentor',
    short: 'Mentor',
    accent: 'purple',
    description: 'Get paid for 1-on-1 video sessions. Set your own rate and schedule.',
  },
  student: {
    label: 'Student',
    short: 'Student',
    accent: 'blue',
    description: 'Book sessions with mentors, learn live, leave ratings.',
  },
};

// Pick the post-login landing route for a given roles array. Priority:
//   1. Has mentor + student  → /my-sessions (paid, recent context)
//   2. Has mentor only       → /teach
//   3. Has student only      → /my-sessions
//   4. peer_learner only     → /dashboard
//   5. Empty (shouldn't happen) → /dashboard
export function getLandingRoute(roles) {
  const set = new Set(Array.isArray(roles) ? roles : ['peer_learner']);
  if (set.has('mentor') && set.has('student')) return '/my-sessions';
  if (set.has('mentor')) return '/teach';
  if (set.has('student')) return '/my-sessions';
  return '/dashboard';
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
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      // Atomic swap used by the ROLES_STALE interceptor: replace both user
      // and token in one set() so subscribers only re-render once.
      setSession: ({ user, token }) => set({ user, token }),
      logout: () => {
        set({ user: null, token: null });
      },
    }),
    { name: 'auth-storage' }
  )
);
