/**
 * MissionLog - full weekly mission history with per-mission status
 * (Claimed / Ready to claim / In progress), progress bars, and Photon + XP
 * rewards, followed by the Photon earn/spend log. Reached from Orbit -> Weekly
 * Missions -> "Full log". Dark cosmic surface (legible in both themes).
 */
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Target, Award, Shield, ShoppingBag, Gift, Sparkles, Zap, CheckCircle2 } from 'lucide-react';
import PhotonIcon from '../cosmic/PhotonIcon';
import { useOrbit, useLedger } from '../cosmic/useOrbit';
import CosmicLoader from '../cosmic/CosmicLoader';
import ErrorState from '../components/common/ErrorState';

const SOURCE_META = {
  mission:     { label: 'Mission claimed',   Icon: Target },
  milestone:   { label: 'Milestone reached', Icon: Award },
  mastery:     { label: 'Mastery bonus',     Icon: Sparkles },
  freeze:      { label: 'Gravity Assist',    Icon: Shield },
  cosmetic:    { label: 'Nebula Store',      Icon: ShoppingBag },
  admin_grant: { label: 'Admin grant',       Icon: Gift },
  admin:       { label: 'Admin adjustment',  Icon: Gift },
};

function fmtDate(at) {
  try {
    return new Date(at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function missionStatus(m) {
  if (m.claimed) return { label: 'Claimed', cls: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/30' };
  if (m.complete) return { label: 'Ready to claim', cls: 'bg-amber-500/15 text-amber-300 ring-amber-400/30' };
  return { label: 'In progress', cls: 'bg-white/5 text-slate-300 ring-white/10' };
}

export default function MissionLog() {
  const orbit = useOrbit({});
  const ledger = useLedger();
  if (orbit.isLoading) return <CosmicLoader />;
  if (orbit.isError || !orbit.data) return <ErrorState onRetry={orbit.refetch} message="Couldn't load your missions." />;
  const missions = orbit.data.missions || [];
  const entries = ledger.data?.entries || [];
  const summary = ledger.data?.summary || { };

  return (
    <div className="cosmic-page max-w-2xl mx-auto px-4 py-6 space-y-5">
      <Helmet><title>Mission Log - Orbit</title></Helmet>
      <div
        className="pointer-events-none fixed inset-0 -z-10 cosmic-backdrop"
        style={ { background: 'radial-gradient(55% 45% at 20% 10%, rgba(56,189,248,.13), transparent 60%),radial-gradient(55% 55% at 82% 18%, rgba(139,92,246,.16), transparent 62%),#07080f' } }
      />

      <div className="flex items-center gap-2">
        <Link to="/orbit" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200">
          <ArrowLeft size={16} /> Orbit
        </Link>
        <h1 className="ml-1 text-xl font-black text-white">Mission Log</h1>
      </div>
      <p className="text-xs text-slate-400 -mt-2">Every weekly mission with its status and rewards, plus your full Photon history.</p>

      <section className="rounded-2xl border border-white/10 bg-slate-900/30 p-3 sm:p-4 space-y-3">
        <h2 className="text-sm font-bold text-white">Weekly missions</h2>
        {missions.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">No missions are active right now. Check back after the weekly reset.</p>
        ) : (
          <ul className="space-y-2.5">
            {missions.map((m) => {
              const reward = m.photons ?? m.stardust;
              const xp = m.xp ?? 0;
              const pct = Math.min(100, Math.round(((m.progress || 0) / (m.target || 1)) * 100));
              const st = missionStatus(m);
              return (
                <li key={m.key} className="rounded-xl border border-white/10 bg-slate-900/40 p-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white">{m.label}</div>
                      <div className="text-xs text-slate-400">{m.description}</div>
                    </div>
                    <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${st.cls}`}>
                      {m.claimed && <CheckCircle2 size={12} />} {st.label}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-violet-400" style={ { width: `${pct}%` } } />
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="tabular-nums text-slate-400">{Math.min(m.progress || 0, m.target || 0)} / {m.target}</span>
                    <span className="inline-flex items-center gap-2 font-semibold">
                      <span className="inline-flex items-center gap-1 text-violet-200"><PhotonIcon size={12} animated={false} /> {reward}</span>
                      <span className="inline-flex items-center gap-1 text-amber-300"><Zap size={12} /> {xp} XP</span>
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
          <div className="text-xs uppercase tracking-wide text-slate-400 flex items-center gap-1">
            <TrendingUp size={13} className="text-emerald-400" /> Earned
          </div>
          <div className="mt-1 text-2xl font-black text-emerald-300 tabular-nums flex items-center gap-1">
            <PhotonIcon size={18} animated={false} /> {summary.earned ?? 0}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
          <div className="text-xs uppercase tracking-wide text-slate-400 flex items-center gap-1">
            <TrendingDown size={13} className="text-rose-400" /> Spent
          </div>
          <div className="mt-1 text-2xl font-black text-rose-300 tabular-nums flex items-center gap-1">
            <PhotonIcon size={18} animated={false} /> {summary.spent ?? 0}
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-white/10 bg-slate-900/30 p-2 sm:p-3">
        <h2 className="text-sm font-bold text-white px-2 pt-1 pb-2">Photon history</h2>
        {entries.length === 0 ? (
          <p className="text-sm text-slate-400 p-6 text-center">
            No Photon activity yet. Complete a weekly mission to earn your first Photons.
          </p>
        ) : (
          <ul className="divide-y divide-white/5">
            {entries.map((e, i) => {
              const meta = SOURCE_META[e.source] || { label: e.source || 'Activity', Icon: Sparkles };
              const Icon = meta.Icon;
              const earn = e.delta > 0;
              return (
                <li key={i} className="flex items-center gap-3 px-2 py-2.5">
                  <span className={`grid place-items-center w-9 h-9 rounded-xl shrink-0 ${earn ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'}`}>
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-white truncate">{meta.label}</div>
                    <div className="text-[11px] text-slate-500">{fmtDate(e.at)}</div>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-sm font-bold tabular-nums ${earn ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {earn ? '+' : '-'}{Math.abs(e.delta)} <PhotonIcon size={13} animated={false} />
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
