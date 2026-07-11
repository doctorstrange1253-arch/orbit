/**
 * MissionsPanel — the week's rotating Orbit missions with progress bars, an
 * expandable detail row (goal + reward breakdown), and claim buttons. Reads the
 * shared ['orbit','me'] query and claims via the Orbit API; a claimed mission
 * pays Photons (server-side) and grants Orbit XP toward your weekly league.
 * The "Full log" link opens the Photon history page.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, Check, Zap, ChevronDown, ScrollText, Timer } from 'lucide-react';
import PhotonIcon from './PhotonIcon';
import { useClaimMission } from './useOrbit';
import { useUIStore } from '../store/uiStore';

const BAR_INITIAL = { width: 0 };
const BAR_TRANSITION = { duration: 0.6, ease: 'easeOut' };

// Time left until the next Monday 00:00 UTC — the missions' actual roll moment
// (weekId is an ISO week, server-side). Ticks once a minute; seconds add noise.
function useWeeklyReset() {
  const calc = () => {
    const now = new Date();
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const add = ((8 - d.getUTCDay()) % 7) || 7;
    d.setUTCDate(d.getUTCDate() + add);
    return d - now;
  };
  const [left, setLeft] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setLeft(calc()), 60000);
    return () => clearInterval(id);
  }, []);
  const s = Math.max(0, Math.floor(left / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60) };
}

function MissionCard({ m, onClaim, claiming }) {
  const [open, setOpen] = useState(false);
  const pct = Math.min(100, Math.round((m.progress / m.target) * 100));
  const claimable = m.complete && !m.claimed;
  const reward = m.photons ?? m.stardust;
  const xp = m.xp ?? 0;
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3.5 flex flex-col gap-2.5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-start justify-between gap-2 text-left"
      >
        <div>
          <div className="text-sm font-semibold text-white flex items-center gap-1">
            {m.label}
            <ChevronDown size={13} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
          </div>
          <div className="text-xs text-slate-400">{m.description}</div>
        </div>
        {/* Photon reward — currency mark, never a star */}
        <span className="shrink-0 inline-flex items-center gap-2 text-xs font-semibold">
          <span className="inline-flex items-center gap-1 text-violet-200">
            <PhotonIcon size={13} animated={false} /> {reward}
          </span>
          <span className="inline-flex items-center gap-1 text-amber-300">
            <Zap size={12} /> {xp} XP
          </span>
        </span>
      </button>

      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-violet-400"
          initial={BAR_INITIAL}
          animate={{ width: `${pct}%` }}
          transition={BAR_TRANSITION}
        />
      </div>

      {open && (
        <div className="rounded-lg bg-black/20 ring-1 ring-white/10 p-2.5 text-[11px] text-slate-300 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Goal</span>
            <span className="tabular-nums text-slate-200">{Math.min(m.progress, m.target)} / {m.target}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Photon reward</span>
            <span className="inline-flex items-center gap-1 text-violet-200 font-semibold"><PhotonIcon size={11} animated={false} /> {reward}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Orbit XP</span>
            <span className="inline-flex items-center gap-1 text-amber-300 font-semibold"><Zap size={11} /> +{xp} XP</span>
          </div>
          <p className="text-slate-500 pt-0.5">Progress updates automatically as you swap, review, and message. Claim once complete to bank the Photons.</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs tabular-nums text-slate-400">{Math.min(m.progress, m.target)}/{m.target}</span>
        {m.claimed ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
            <Check size={14} /> Claimed
          </span>
        ) : (
          <button
            onClick={() => onClaim(m.key)}
            disabled={!claimable || claiming}
            className={`rounded-full px-3 py-1 text-xs font-bold transition
              ${claimable
                ? 'bg-gradient-to-r from-amber-400 to-violet-500 text-slate-900 hover:brightness-110'
                : 'bg-white/5 text-slate-500 cursor-not-allowed'}`}
          >
            {claimable ? 'Claim' : `${pct}%`}
          </button>
        )}
      </div>
    </div>
  );
}

export default function MissionsPanel({ missions = [] }) {
  const claim = useClaimMission();
  const { addToast } = useUIStore();
  const reset = useWeeklyReset();
  const readyCount = missions.filter((m) => m.complete && !m.claimed).length;

  const onClaim = (key) => {
    claim.mutate(key, {
      onSuccess: (data) => addToast(`+${data.awardedPhotons ?? data.awarded} Photons claimed!`, 'success'),
      onError: (e) => addToast(e.response?.data?.message || 'Could not claim mission', 'error'),
    });
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/30 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Target size={18} className="text-amber-300" />
        <h2 className="text-base font-bold text-white">Weekly Missions</h2>
        {readyCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-emerald-300 ring-1 ring-emerald-400/40">
            <Check size={10} /> {readyCount} ready to claim
          </span>
        )}
        <Link
          to="/orbit/history"
          className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-violet-300 hover:text-violet-200"
        >
          <ScrollText size={13} /> Full log
        </Link>
      </div>
      <p className="text-[11px] text-slate-500 mb-3">
        <span className="inline-flex items-center gap-1 text-slate-400">
          <Timer size={11} /> New missions in {reset.d > 0 ? `${reset.d}d ` : ''}{reset.h}h {reset.m}m
        </span>
        {' '}· tap a mission for details. Complete them to earn Photons + Orbit XP.
      </p>
      {missions.length === 0 ? (
        <p className="text-sm text-slate-400">New missions are being charted…</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          {missions.map((m) => (
            <MissionCard key={m.key} m={m} onClaim={onClaim} claiming={claim.isPending} />
          ))}
        </div>
      )}
    </section>
  );
}
