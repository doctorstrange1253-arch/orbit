import { useAuthStore } from '../../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowRight } from 'lucide-react';

/**
 * Client-side gate for role-restricted routes.
 *
 * Server-side `requireRoles(...)` middleware is the SOURCE OF TRUTH — this
 * guard is purely a UX layer that:
 *   1. Renders a friendly "you don't have access" panel with a one-click
 *      way to add the missing role (Settings → Roles), instead of letting
 *      the user hit a raw 403 from the API.
 *   2. Hides the page chrome while showing the explanation, so the URL bar
 *      still reflects the restricted path (deep-link friendly).
 *
 * It is intentionally NOT used as a hard wall — even if this guard is
 * bypassed (e.g. someone modifies the React tree), the server still
 * enforces the role on every protected API call.
 *
 * Props:
 *   roles:    string[]   any-of (caller needs at least one of these)
 *   allOf?:   string[]   every-of (caller needs every one of these)
 *   children: ReactNode
 */
const RoleGuard = ({ roles, allOf, children }) => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const have = Array.isArray(user?.roles) && user.roles.length > 0
    ? user.roles
    : ['peer_learner'];

  // ANY-OF check: when `roles` is provided, the caller needs at least one.
  const anyOfOk = !Array.isArray(roles) || roles.length === 0 ||
    roles.some((r) => have.includes(r));
  // ALL-OF check: when `allOf` is provided, the caller needs every role.
  const allOfOk = !Array.isArray(allOf) || allOf.length === 0 ||
    allOf.every((r) => have.includes(r));

  if (anyOfOk && allOfOk) return children;

  const required = Array.isArray(roles) && roles.length > 0 ? roles : (allOf || []);
  const missing = required.filter((r) => !have.includes(r));

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center rounded-2xl border border-border-subtle bg-surface/40 backdrop-blur-sm p-8">
        <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center bg-amber-500/10 border border-amber-400/30 mb-4">
          <ShieldAlert size={24} className="text-amber-300" />
        </div>
        <h2 className="text-xl font-display font-bold text-text-primary mb-2">
          This area needs an extra role
        </h2>
        <p className="text-sm text-text-secondary mb-5 leading-relaxed">
          Your account is signed in, but it doesn't currently hold
          {' '}
          <span className="font-semibold text-text-primary">
            {missing.map((r) => `"${r}"`).join(', ')}
          </span>
          . You can add the role from Settings — it only takes a second.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(90deg, #06b6d4, #3b82f6)' }}
          >
            Open Settings
            <ArrowRight size={15} />
          </button>
          <Link
            to="/peer/dashboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-text-secondary border border-border-subtle bg-surface hover:text-text-primary transition-all"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RoleGuard;
