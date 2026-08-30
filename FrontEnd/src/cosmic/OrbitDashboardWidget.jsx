/**
 * OrbitDashboardWidget — a compact Orbit summary for the dashboard: the streak
 * state, Photons balance, and this week's mission progress, with a link to the
 * full /orbit hub. Reads the shared ['orbit','me'] query. Renders nothing until
 * data is available so it never flashes an empty card.
 */
import { Link } from 'react-router-dom';
import { Flame, Target, ChevronRight, Shield } from 'lucide-react';
import { useOrbit } from './useOrbit';
import PhotonIcon from './PhotonIcon';
import { useThemeStore } from '../store/themeStore';

const STATE = {
  active:   { color: '#fbbf24', lite: '#b45309', text: 'In orbit today' },
  decaying: { color: '#fb7185', lite: '#be123c', text: 'Orbit decaying — act today' },
  idle:     { color: '#94a3b8', lite: '#475569', text: 'Start your orbit' },
};

export default function OrbitDashboardWidget() {
  const { data } = useOrbit();
  // Hooks must run unconditionally on every render (rules-of-hooks), so read the
  // theme BEFORE the early return below.
  const { isDark } = useThemeStore();
  if (!data) return null;

  const { streak, freeze, missions } = data;
  const photons = data.photons ?? data.stardust ?? 0;   // Part 0 rename, legacy fallback
  const st = STATE[streak.state] || STATE.idle;
  const accent = isDark ? st.color : st.lite;
  const done = missions.filter((m) => m.complete).length;
  const claimable = missions.some((m) => m.complete && !m.claimed);

  return (
    <Link
      to="/orbit"
      className="orbit-dash-widget group flex items-center gap-4 rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900/50 to-violet-950/30 p-4 hover:border-amber-400/40 transition-colors"
    >
      <div className="flex items-center gap-2">
        <Flame size={22} style={{ color: accent }} />
        <span className="text-2xl font-black text-white tabular-nums">{streak.current}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold" style={{ color: accent }}>{st.text}</div>
        <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
          <span className="inline-flex items-center gap-1"><PhotonIcon size={13} animated={false} />{photons}</span>
          <span className="inline-flex items-center gap-1"><Shield size={12} className="text-sky-300" />{freeze.tokens}/{freeze.cap}</span>
          <span className="inline-flex items-center gap-1"><Target size={12} className="text-amber-300" />{done}/{missions.length} missions</span>
          {claimable && <span className="text-emerald-400 font-semibold">· reward ready</span>}
        </div>
      </div>
      <ChevronRight size={18} className="text-slate-500 group-hover:text-amber-300 transition-colors" />
    </Link>
  );
}
