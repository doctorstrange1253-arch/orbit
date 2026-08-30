import { Users, GraduationCap, BookOpen, Check } from 'lucide-react';
import { ACCOUNT_ROLES, ROLE_META } from '../../store/authStore';

// Icon registry keyed by role. Kept here (not ROLE_META) because icons come
// from a UI-only dependency; keeping ROLE_META icon-free means it can be
// imported from non-UI modules (services, tests) without pulling lucide.
const ICONS = {
  peer_learner: Users,
  mentor: GraduationCap,
  student: BookOpen,
};

// Accent → tailwind-ish class set. Picked to match the role: cyan for
// baseline / "free", purple for the paid-mentor side, blue for the
// paid-student side. Used as the ring/background tint when a card is
// selected so the visual is consistent across Register, Settings, etc.
const ACCENT = {
  peer_learner: {
    ring: 'ring-cyan-400/60',
    glow: 'shadow-[0_0_24px_rgba(0,198,255,0.35)]',
    gradient: 'from-cyan-500/20 via-cyan-400/10 to-transparent',
    text: 'text-cyan-300',
    badge: 'bg-cyan-500/15 text-cyan-200 border-cyan-400/30',
  },
  mentor: {
    ring: 'ring-purple-400/60',
    glow: 'shadow-[0_0_24px_rgba(168,85,247,0.35)]',
    gradient: 'from-purple-500/20 via-fuchsia-400/10 to-transparent',
    text: 'text-purple-300',
    badge: 'bg-purple-500/15 text-purple-200 border-purple-400/30',
  },
  student: {
    ring: 'ring-blue-400/60',
    glow: 'shadow-[0_0_24px_rgba(59,130,246,0.35)]',
    gradient: 'from-blue-500/20 via-sky-400/10 to-transparent',
    text: 'text-blue-300',
    badge: 'bg-blue-500/15 text-blue-200 border-blue-400/30',
  },
};

/**
 * Multi-select role picker (Notion-style card grid).
 *
 * - `peer_learner` is always preselected and disabled (the free baseline;
 *   the backend forces it in regardless of what's sent). The "lock" is
 *   visual+UX — the server is still the source of truth.
 * - `mentor` and `student` can be freely toggled. They can be picked
 *   together — the same person can be a mentor + a student on the same
 *   account, that's the whole point of multi-role.
 *
 * Props:
 *   value:        string[]    current selection (must include peer_learner)
 *   onChange:     fn         (next: string[]) => void
 *   disabled?:    string[]   role keys the user cannot deselect (e.g. ['peer_learner'])
 *   layout?:      'grid' | 'stack'   default 'grid'
 */
const RoleSelector = ({ value = [], onChange, disabled = ['peer_learner'], layout = 'grid' }) => {
  const selected = new Set(value);
  const disabledSet = new Set(disabled);

  const toggle = (role) => {
    if (disabledSet.has(role)) return; // can't unselect the baseline
    const next = new Set(selected);
    if (next.has(role)) next.delete(role);
    else next.add(role);
    // Re-add the baseline defensively in case a caller passed a value
    // that somehow dropped it.
    if (!next.has('peer_learner')) next.add('peer_learner');
    onChange?.(Array.from(next));
  };

  const containerCls = layout === 'stack'
    ? 'flex flex-col gap-3'
    : 'grid grid-cols-1 md:grid-cols-3 gap-3';

  return (
    <div className={containerCls} role="group" aria-label="Choose your account roles">
      {ACCOUNT_ROLES.map((role) => {
        const isOn = selected.has(role);
        const isLocked = disabledSet.has(role);
        const meta = ROLE_META[role];
        const accent = ACCENT[role];
        const Icon = ICONS[role];
        return (
          <button
            type="button"
            key={role}
            onClick={() => toggle(role)}
            disabled={isLocked}
            aria-pressed={isOn}
            aria-label={`${meta.label} role`}
            className={[
              'relative text-left rounded-2xl p-4 border transition-all duration-200',
              'bg-surface/40 backdrop-blur-sm',
              isOn
                ? `${accent.ring} ring-2 ${accent.glow} border-transparent`
                : 'border-border-subtle hover:border-border-default',
              isLocked ? 'cursor-not-allowed' : 'cursor-pointer',
            ].join(' ')}
          >
            {/* Background tint on selected */}
            {isOn && (
              <div
                aria-hidden="true"
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${accent.gradient} pointer-events-none`}
              />
            )}

            <div className="relative flex items-start gap-3">
              <div
                className={[
                  'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center',
                  isOn ? accent.badge : 'bg-surface border border-border-subtle',
                ].join(' ')}
              >
                <Icon size={18} className={isOn ? accent.text : 'text-text-secondary'} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className={`text-sm font-semibold ${isOn ? 'text-text-primary' : 'text-text-secondary'}`}>
                    {meta.label}
                  </h4>
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
                </div>
                <p className="mt-1.5 text-xs text-text-muted leading-relaxed break-words">
                  {meta.description}
                </p>
              </div>

              {isOn && (
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${accent.badge} border`}
                  aria-hidden="true"
                >
                  <Check size={14} className={accent.text} />
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default RoleSelector;
