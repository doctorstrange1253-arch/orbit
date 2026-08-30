import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Users, GraduationCap, BookOpen, Loader2, Check, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore, ACCOUNT_ROLES, ROLE_META } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

const ICONS = {
  peer_learner: Users,
  mentor: GraduationCap,
  student: BookOpen,
};

// Friendly rendering of the API's error code field. The backend uses
// structured codes so the client doesn't have to parse prose.
function describeError(code, message) {
  switch (code) {
    case 'EMPTY_ROLES':
      return 'You must keep at least one role. Try re-enabling Peer Learner first.';
    case 'UNKNOWN_ROLE':
      return 'That role name is not recognised. Refresh the page and try again.';
    case 'MENTOR_SUSPENDED':
      return 'Your mentor account is currently suspended. Contact support to lift the suspension before re-enabling the Mentor role.';
    default:
      return message || 'Could not update your roles. Please try again.';
  }
}

/**
 * Settings → "Your roles" tile.
 *
 * Renders one row per role with an on/off toggle. The baseline (peer_learner)
 * is locked ON — it's the free product and the server forces it in anyway.
 *
 * Mutation flow:
 *   PATCH /user/roles { roles: [...] }
 *   - On success: replace the persisted user (the response carries the new
 *     roles + rolesVersion + a fresh token), toast, and let the rest of the
 *     app re-render against the new auth state. The api.js interceptor's
 *     ROLES_STALE handler isn't involved here because the request itself
 *     succeeds — we just swap the user/token atomically.
 *   - On 4xx with a known `code`: surface that as an inline error under the
 *     toggle that triggered it (e.g. MENTOR_SUSPENDED stays sticky).
 */
const RoleSettings = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { addToast } = useUIStore();
  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);

  const current = Array.isArray(user?.roles) && user.roles.length > 0
    ? user.roles
    : ['peer_learner'];

  // Inline error per role, so a MENTOR_SUSPENDED block doesn't get cleared
  // by a successful mentor-removal in the same render.
  const [rowError, setRowError] = useState({});
  useEffect(() => { setRowError({}); }, [current.length]);

  // Fetch the live profile so we know whether the mentor is approved/pending
  // (used in the description text). The /user/me/mentor endpoint exists in
  // the sessions slice and returns the application status.
  const { data: mentorStatus } = useQuery({
    queryKey: ['mentor', 'me', user?._id],
    queryFn: () => api.get('/sessions/mentor/me').then((r) => r.data).catch(() => null),
    enabled: current.includes('mentor'),
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: (next) => api.patch('/user/roles', { roles: next }),
    onSuccess: (res) => {
      const data = res.data || {};
      const next = Array.isArray(data.roles) ? data.roles : current;
      // PATCH /user/roles always returns a fresh JWT + (now) the public user.
      // Swap them atomically so the next request never hits ROLES_STALE.
      if (data.token) {
        const freshUser = data.user || (() => {
          const cur = useAuthStore.getState().user;
          return cur ? { ...cur, roles: next, rolesVersion: data.rolesVersion } : { roles: next, rolesVersion: data.rolesVersion };
        })();
        setSession({ user: freshUser, token: data.token });
      } else if (typeof data.rolesVersion === 'number') {
        useAuthStore.setState((s) => ({
          user: s.user ? { ...s.user, roles: next, rolesVersion: data.rolesVersion } : s.user,
        }));
      }
      setRowError({});
      // Invalidate any cached mentor profile (state may have changed).
      qc.invalidateQueries({ queryKey: ['mentor'] });
      addToast(data.message || 'Your roles are updated', 'success');
    },
    onError: (err) => {
      const code = err.response?.data?.code;
      const msg = err.response?.data?.message;
      // Try to attribute the error to a specific row by looking at the
      // roles in the request that failed (best effort — the server
      // doesn't echo the offending role back, so we fall back to global).
      const friendly = describeError(code, msg);
      setRowError({ _: friendly });
      addToast(friendly, 'error');
    },
  });

  const toggle = (role) => {
    if (role === 'peer_learner') return; // locked
    setRowError({}); // clear on new attempt
    const next = current.includes(role)
      ? current.filter((r) => r !== role)
      : [...current, role];
    // Don't allow empty (defense — backend rejects too, but better UX here).
    if (next.length === 0) {
      setRowError({ _: 'You must keep at least one role.' });
      return;
    }
    mutation.mutate(next);
  };

  const statusLabel = mentorStatus?.applicationStatus;
  const statusHint = statusLabel && statusLabel !== 'approved' && current.includes('mentor')
    ? `Your mentor application is currently "${statusLabel}". You can keep the role while it processes, or remove it to hide Teach from your nav.`
    : null;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border-subtle bg-surface/40 p-4">
        <p className="text-sm text-text-secondary leading-relaxed">
          Your account can hold any combination of roles. The baseline
          <span className="px-1.5 py-0.5 mx-1 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold uppercase tracking-wider align-middle">
            Free
          </span>
          is always on. Adding the
          <span className="px-1.5 py-0.5 mx-1 rounded bg-amber-500/15 text-amber-300 border border-amber-400/30 text-[11px] font-bold uppercase tracking-wider align-middle">
            Earn
          </span>
          or
          <span className="px-1.5 py-0.5 mx-1 rounded bg-blue-500/15 text-blue-300 border border-blue-400/30 text-[11px] font-bold uppercase tracking-wider align-middle">
            Learn
          </span>
          roles is free; we only ask for payment when you actually book or accept a paid session.
        </p>
      </div>

      {rowError._ && (
        <div className="flex items-start gap-2 p-3 rounded-xl border border-amber-400/30 bg-amber-500/10 text-amber-200 text-sm">
          <AlertTriangle size={15} className="mt-0.5 flex-shrink-0" />
          <span>{rowError._}</span>
        </div>
      )}

      {statusHint && (
        <div className="flex items-start gap-2 p-3 rounded-xl border border-purple-400/30 bg-purple-500/10 text-purple-200 text-sm">
          <AlertTriangle size={15} className="mt-0.5 flex-shrink-0" />
          <span>{statusHint}</span>
        </div>
      )}

      <div className="space-y-2">
        {ACCOUNT_ROLES.map((role) => {
          const isOn = current.includes(role);
          const isLocked = role === 'peer_learner';
          const meta = ROLE_META[role];
          const Icon = ICONS[role];
          const isPending = mutation.isPending;
          return (
            <div
              key={role}
              className={[
                'flex items-center gap-4 p-4 rounded-xl border transition-all',
                isOn
                  ? 'border-accent/40 bg-accent/5'
                  : 'border-border-subtle bg-surface/40',
              ].join(' ')}
            >
              <div
                className={[
                  'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center',
                  isOn
                    ? 'bg-accent/15 text-accent'
                    : 'bg-surface border border-border-subtle text-text-secondary',
                ].join(' ')}
              >
                <Icon size={18} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-text-primary">{meta.label}</h4>
                  {role === 'peer_learner' && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
                      Free
                    </span>
                  )}
                  {role === 'mentor' && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-400/30">
                      Earn
                    </span>
                  )}
                  {role === 'student' && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-400/30">
                      Learn
                    </span>
                  )}
                  {isOn && !isLocked && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300">
                      <Check size={12} /> Active
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-text-muted leading-relaxed">{meta.description}</p>
              </div>

              {/* Toggle — locked for peer_learner. Disabled while the
                  mutation is in flight so the user can't double-fire
                  (and so the optimistic UI doesn't lie about an in-
                  progress change). */}
              <button
                type="button"
                role="switch"
                aria-checked={isOn}
                aria-label={`${meta.label} role`}
                disabled={isLocked || isPending}
                onClick={() => toggle(role)}
                className={[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0',
                  isOn ? 'bg-accent' : 'bg-surface-hover',
                  isLocked || isPending ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
                ].join(' ')}
              >
                <span
                  className={[
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    isOn ? 'translate-x-6' : 'translate-x-1',
                  ].join(' ')}
                />
                {isPending && (
                  <Loader2
                    size={12}
                    className="absolute -right-5 top-1/2 -translate-y-1/2 animate-spin text-text-muted"
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Mentor-only shortcut to the application flow. The settings tile
          lets the user flip the bit; if they don't yet have a profile
          (no applicationStatus), nudge them to the form. */}
      {current.includes('mentor') && !statusLabel && (
        <button
          type="button"
          onClick={() => navigate('/mentor/hub')}
          className="w-full text-left p-4 rounded-xl border border-purple-400/30 bg-purple-500/10 hover:bg-purple-500/15 transition-colors"
        >
          <div className="text-sm font-semibold text-purple-200">Set up your mentor profile →</div>
          <div className="mt-0.5 text-xs text-purple-200/70">
            You've enabled the Mentor role. Head to Teach to add your skills, rate, and availability.
          </div>
        </button>
      )}
    </div>
  );
};

export default RoleSettings;
