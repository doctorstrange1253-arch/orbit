/**
 * Leaderboard — the unified boards page.
 *
 * Three tabs:
 *   - Cosmic  → the original tier-based board (mentors by tier/score)
 *   - Gameology → student lifetime XP / weekly league (LeagueTable)
 *   - Pact     → mentor's current Pact group (PactHall)
 *
 * Each tab loads the data it needs independently. The Pact tab is mentor-
 * only (a single-role mentor OR a multi-role user on the mentor window) —
 * if the viewer isn't a mentor, the tab shows a friendly explainer and a
 * CTA to /gameology or /mentor/hub.
 *
 * Mounts only the active tab's data fetcher (others stay in their hook
 * cache) so switching tabs is instant and doesn't refetch on first view.
 */
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trophy, Sparkles, BookOpen } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import useLiftoffStore from '../cosmic/liftoffStore';
import { useLeaderboard } from '../cosmic/useCosmic';
import CosmicBadge from '../cosmic/CosmicBadge';
import CosmicLoader from '../cosmic/CosmicLoader';
import GlowName from '../cosmic/GlowName';
import Nameplate from '../cosmic/Nameplate';
import { decoClassFor } from '../cosmic/cosmetics';
import { getTier, TIER_FLOORS, TIER_ORDER } from '../cosmic/tiers';
import { InfoDot } from '../cosmic/scoreInfo';
import Avatar from '../components/common/Avatar';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import LeagueTable from '../components/cosmic/LeagueTable';
import PactHallTable from '../components/pact/PactHall';

const SCOPES = [
  { id: 'neighborhood', label: 'Neighborhood', Icon: ({ size = 13 }) => <span className="text-xs">▦</span> },
  { id: 'city',         label: 'City',         Icon: ({ size = 13 }) => <span className="text-xs">▢</span> },
  { id: 'region',       label: 'Region',       Icon: ({ size = 13 }) => <span className="text-xs">▣</span> },
  { id: 'country',      label: 'Country',      Icon: ({ size = 13 }) => <span className="text-xs">◉</span> },
];

const MEDAL_TINT = { 1: '#FFD08A', 2: '#D6DCE6', 3: '#E0A878' };
const medalColor = (rank) => `color-mix(in srgb, ${MEDAL_TINT[rank]} 60%, var(--text-primary))`;

const LADDER_IDS = TIER_ORDER.filter((id) => id !== 'quasar');
const DESCENT_CATS = new Set(['stardust', 'meteor', 'asteroid']);
const round1 = (n) => Math.round(n * 10) / 10;
const PROVISIONAL_TIP =
  'Provisional: scores are tied early this season. The #1 spot locks in as mentors earn more reviews.';

function heroMeter(you) {
  const { tierId, score } = you;
  const mode = you.progress?.mode || 'progress';
  const idx = LADDER_IDS.indexOf(tierId);
  const currentName = getTier(tierId).displayName;
  const nextTierId = idx >= 0 && idx < LADDER_IDS.length - 1 ? LADDER_IDS[idx + 1] : null;
  const nextName = nextTierId ? getTier(nextTierId).displayName : null;
  const descent = DESCENT_CATS.has(getTier(tierId).category);

  if (mode === 'max' || !nextTierId) {
    return { mode: 'max', pct: 1, currentName, nextName: null,
      label: 'You’ve reached the highest tier in the cosmos.', aria: 'Max tier reached' };
  }
  if (mode === 'locked') {
    const pct = Math.max(0, Math.min(1, you.progress?.pct ?? 0));
    return { mode: 'locked', pct, currentName, nextName,
      label: you.progress?.label || `Next tier locked`, aria: you.progress?.label || 'Next tier locked' };
  }
  const curFloor = TIER_FLOORS[tierId];
  const nextFloor = TIER_FLOORS[nextTierId];
  const pct = nextFloor > curFloor ? Math.max(0, Math.min(1, (score - curFloor) / (nextFloor - curFloor))) : 0;
  const points = round1(Math.max(0, nextFloor - score));
  let label = pct <= 0
    ? `You’re at the start of ${currentName} — earn ${points} points to rise to ${nextName}.`
    : `${points} points to ${nextName}.`;
  if (descent && nextTierId !== 'moon_4') {
    const toMoon = round1(Math.max(0, TIER_FLOORS.moon_4 - score));
    if (toMoon > 0) label += ` ${toMoon} to return to Moon IV.`;
  }
  return { mode: 'progress', pct, currentName, nextName, points, label,
    aria: `${Math.round(pct * 100)} percent — ${points} points to ${nextName}` };
}

function Podium({ entries, meId, onOpen }) {
  const [first, second, third] = entries;
  const steps = [
    { e: second, rank: 2, h: 96 },
    { e: first,  rank: 1, h: 124 },
    { e: third,  rank: 3, h: 80 },
  ];
  return (
    <div className="grid grid-cols-3 items-end gap-2 mb-4" role="list" aria-label="Top three mentors">
      {steps.map(({ e, rank, h }) => {
        if (!e) return <div key={rank} />;
        const isMe = e.userId === meId;
        const tint = MEDAL_TINT[rank];
        const solid = medalColor(rank);
        return (
          <motion.button
            key={e.userId}
            role="listitem"
            onClick={() => onOpen(e.userId)}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rank === 1 ? 0 : 0.12, type: 'spring', stiffness: 220, damping: 22 }}
            className="flex flex-col items-center gap-1.5 text-center"
          >
            <div className="relative">
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                <Trophy size={rank === 1 ? 20 : 16} style={{ color: solid }} strokeWidth={2.2} />
              </span>
              <div className="rounded-full p-0.5" style={{ boxShadow: `0 0 ${rank === 1 ? 18 : 10}px ${tint}66`, border: `2px solid ${solid}` }}>
                <Avatar name={e.name} url={e.avatar} size={rank === 1 ? 'md' : 'sm'} userId={e.userId} deco={decoClassFor(e.avatarDeco)} />
              </div>
            </div>
            <div className="max-w-full px-1">
              <div className="truncate text-xs font-bold text-text-primary">
                <Nameplate plateKey={e.nameplate}><GlowName nameGlowTier={e.nameGlowTier} cosmeticGlowKey={e.nameGlow}>{e.name}</GlowName></Nameplate>
              </div>
              <div className="text-[10px] text-text-muted truncate">{getTier(e.tierId).displayName}</div>
            </div>
            <div
              className="w-full rounded-t-xl flex items-start justify-center pt-1.5"
              style={{
                height: h,
                background: `linear-gradient(180deg, color-mix(in srgb, ${solid} ${isMe ? 52 : 40}%, transparent), color-mix(in srgb, ${solid} 12%, transparent))`,
                border: `1px solid color-mix(in srgb, ${solid} 45%, var(--border-subtle))`,
                borderBottom: 'none',
              }}
            >
              <span className="text-sm font-bold tabular-nums" style={{ color: solid }}>#{rank}</span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

function RankBadge({ rank }) {
  if (rank <= 3) {
    return (
      <span className="inline-flex items-center justify-center w-7" title={`Rank ${rank}`}>
        <Trophy size={18} style={{ color: medalColor(rank) }} strokeWidth={2.2} />
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-7 text-sm font-bold tabular-nums text-text-muted">
      {rank}
    </span>
  );
}

// ── Tab definitions ────────────────────────────────────────────────────
const TABS = [
  { id: 'cosmic',    label: 'Cosmic',     Icon: Trophy,   needs: 'mentor' },
  { id: 'gameology', label: 'Gameology',  Icon: Sparkles, needs: 'any' },
  { id: 'pact',      label: 'Pact',       Icon: BookOpen, needs: 'mentor' },
];

// ── Sub-renders for each tab ───────────────────────────────────────────
const CosmicBoard = ({ navigate, user }) => {
  const [scope, setScope] = useState('city');
  const { data, isLoading, isError, error, refetch } = useLeaderboard({ scope });
  const playLiftoff = useLiftoffStore((s) => s.play);
  const markIntroSeen = useLiftoffStore((s) => s.markIntroSeen);

  useEffect(() => {
    const you = data?.you;
    if (!you?.tierId || !user?._id) return;
    const already = markIntroSeen(user._id, you.tierId);
    if (!already) playLiftoff(you.tierId, { score: you.score, city: data?.label });
  }, [data?.you?.tierId, user?._id, data?.label, markIntroSeen, playLiftoff]);

  const needsLocation = error?.response?.data?.viewerNeedsLocation ?? error?.response?.data?.needsLocation;

  return (
    <div>
      <div className="flex gap-1.5 mt-4 mb-3 overflow-x-auto hide-scrollbar -mx-1 px-1">
        {SCOPES.map((s) => {
          const active = scope === s.id;
          const count = data?.scopeCounts?.[s.id];
          const Icon = s.Icon;
          return (
            <button key={s.id} onClick={() => setScope(s.id)}
              className={`flex-none flex items-center gap-1.5 min-h-[44px] sm:min-h-0 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                active ? 'text-accent bg-accent/10 border border-accent/30'
                       : 'text-text-secondary hover:text-text-primary bg-surface border border-border-subtle'}`}>
              <Icon />{s.label}
              {count != null && <span className="opacity-70 tabular-nums">· {count}</span>}
            </button>
          );
        })}
      </div>

      {data?.label && (
        <div className="flex items-center gap-1.5 text-xs text-text-muted mb-2">
          <span className="text-xs">📍</span>
          <span>
            Showing mentors {data.label}
            {data.widened && data.appliedRadiusKm ? ` (widened to ${data.appliedRadiusKm} km to fill the board)` : ''}.
          </span>
        </div>
      )}

      {data?.viewerNeedsLocation && (
        <button onClick={() => navigate('/peer/nearby')}
          className="flex items-start gap-2 w-full text-left p-3 rounded-2xl mb-3 text-xs"
          style={{ background: 'var(--surface)', border: '1px solid var(--accent-1)' }}>
          <span className="mt-0.5 flex-none text-accent">◎</span>
          <span className="text-text-secondary">
            <strong className="text-text-primary">Add your city</strong> to see who's ranked near you.
            We're showing the country board for now. <span className="text-accent underline">Set location</span>
          </span>
        </button>
      )}

      {scope === 'city' && data?.unplacedCount > 0 && (
        <div className="flex items-start gap-2 p-3 rounded-2xl mb-3 text-xs"
          style={{ background: 'var(--surface)', border: '1px dashed var(--border-subtle)' }}>
          <span className="mt-0.5 flex-none text-text-muted">📍</span>
          <div className="text-text-muted">
            <span className="text-text-secondary">
              {data.unplacedCount} {data.unplacedCount === 1 ? "mentor hasn't" : "mentors haven't"} set a city yet,
              so they are ranked in Region/Country instead.
            </span>
          </div>
        </div>
      )}

      {data?.you && (() => {
        const you = data.you;
        const m = heroMeter(you);
        const pctInt = Math.round(m.pct * 100);
        const provisional = you.rank === 1 && data.entries?.[1]
          && Math.abs((data.entries[1].score ?? 0) - you.score) < 0.05;
        const atFloor = m.pct <= 0;
        return (
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            aria-label="Your standing" className="rounded-2xl mb-5 p-4"
            style={{ background: 'linear-gradient(135deg, rgba(0,198,255,0.08), rgba(155,107,255,0.06))',
                     border: '1px solid var(--accent-1, #00c6ff)' }}>
            <div className="flex items-center justify-between mb-3 gap-2">
              <span className="text-[11px] font-bold tracking-[0.14em]" style={{ color: 'var(--accent-1, #00c6ff)' }}>
                YOUR STANDING
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums whitespace-nowrap"
                style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                #{you.rank} of {you.of}
                {provisional && <InfoDot label="Why am I #1?" side="left" size={11}>{PROVISIONAL_TIP}</InfoDot>}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <CosmicBadge tierId={you.tierId} size="full" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-text-primary truncate">{getTier(you.tierId).displayName}</div>
                <div className="text-xs text-text-muted mt-0.5">
                  <span className="font-semibold text-text-secondary">CosmicScore</span> {you.score}
                </div>
              </div>
              <Avatar name={you.name} url={you.avatar} size="sm" userId={you.userId} deco={decoClassFor(you.avatarDeco)} />
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-[10px] text-text-muted mb-1 gap-2">
                <span className="truncate">{m.currentName}</span>
                <span className="truncate text-right">{m.nextName || 'Max'}</span>
              </div>
              <div role="progressbar" aria-valuenow={pctInt} aria-valuemin={0} aria-valuemax={100} aria-valuetext={m.aria}
                className="h-2 rounded-full overflow-hidden relative" style={{ background: 'var(--border-subtle)' }}>
                <div className="absolute inset-0 rounded-full" style={{ background: 'rgba(0,198,255,0.10)' }} />
                <div className="h-full rounded-full relative transition-[width] duration-700 ease-out motion-reduce:transition-none"
                  style={{ width: `${atFloor ? 6 : pctInt}%`,
                    background: m.mode === 'locked'
                      ? 'linear-gradient(90deg, #6b7280, #9ca3af)'
                      : 'linear-gradient(90deg, var(--accent-1), var(--accent-3))',
                    boxShadow: atFloor ? '0 0 8px rgba(0,198,255,0.5)' : 'none',
                    opacity: atFloor ? 0.75 : 1 }} />
              </div>
              <p className="text-[11px] text-text-secondary mt-1.5">{m.label}</p>
            </div>
          </motion.section>
        );
      })()}

      {isLoading && <CosmicLoader variant="leaderboard" onRetry={refetch} />}
      {isError && !needsLocation && (
        <ErrorState message={error?.response?.data?.message || 'Failed to load the leaderboard.'} onRetry={refetch} />
      )}
      {isError && needsLocation && (
        <EmptyState
          icon={<span className="text-2xl">📍</span>}
          title="Set your location to see the board"
          description="The neighborhood and city boards need your location. Set it on the Nearby map, then come back."
          ctaLabel="Go to Nearby"
          onCta={() => navigate('/peer/nearby')}
        />
      )}
      {!isLoading && !isError && data?.entries?.length === 0 && (
        <EmptyState
          icon={<Trophy size={28} />}
          title="No mentors here yet"
          description="Be the first to light up this sky. As mentors earn reviews, they'll appear on the board."
        />
      )}
      {!isLoading && !isError && data?.entries?.length >= 3 && data.entries[0].rank === 1 && (
        <Podium entries={data.entries.slice(0, 3)} meId={user?._id} onOpen={(id) => navigate(`/profile/${id}`)} />
      )}
      {!isLoading && !isError && data?.entries?.length > 0 && (
        <ul className="space-y-1.5">
          {(data.entries.length >= 3 && data.entries[0].rank === 1 ? data.entries.slice(3) : data.entries).map((e) => {
            const isMe = e.userId === user?._id;
            return (
              <li key={e.userId}>
                <button
                  onClick={() => navigate(`/profile/${e.userId}`)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-2xl transition-all text-left hover:bg-surface"
                  style={{
                    background: 'transparent',
                    border: isMe ? '1px solid var(--accent-1)' : '1px solid var(--border-subtle)',
                  }}>
                  <RankBadge rank={e.rank} />
                  <Avatar name={e.name} url={e.avatar} size="sm" userId={e.userId} deco={decoClassFor(e.avatarDeco)} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-text-primary truncate flex items-center gap-1.5">
                      <Nameplate plateKey={e.nameplate}><GlowName nameGlowTier={e.nameGlowTier} cosmeticGlowKey={e.nameGlow}>{e.name}</GlowName></Nameplate>{isMe && <span className="text-[9px] text-accent font-semibold opacity-70">you</span>}
                    </div>
                    <div className="text-xs text-text-muted truncate">
                      {getTier(e.tierId).displayName}{e.title ? ` · ${e.title}` : ''}
                    </div>
                  </div>
                  <CosmicBadge tierId={e.tierId} size="mini" />
                  <span className="text-sm font-bold tabular-nums text-text-secondary w-12 text-right">{e.score}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

const GameologyBoard = () => (
    <div className="mt-4">
        <div className="rounded-2xl p-4 mb-4" style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}>
            <div className="text-[11px] font-bold tracking-[0.14em] text-accent mb-1">GAMEOLOGY LEAGUE</div>
            <div className="text-sm text-text-secondary mb-3">
                The weekly learning league — every lesson, quiz, session, and peer swap you complete this week counts.
                Top 50 worldwide, filtered by your league.
            </div>
            <LinkButton to="/gameology" label="Open your lifetime profile →" />
        </div>
        <LeagueTable limit={50} />
    </div>
);

const PactBoard = ({ navigate }) => (
    <div className="mt-4">
        <div className="rounded-2xl p-4 mb-4" style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}>
            <div className="text-[11px] font-bold tracking-[0.14em] text-accent mb-1">YOUR PACT GROUP</div>
            <div className="text-sm text-text-secondary mb-3">
                The weekly mentor head-to-head: 30 mentors per group, top 7 promote, bottom 7 relegate.
                Show up consistently and your Pact Badge earns the Steady Shield.
            </div>
            <LinkButton to="/mentor/pact" label="Open Pact Hall →" />
        </div>
        <PactHallTable />
    </div>
);

const LinkButton = ({ to, label }) => (
    <button onClick={() => window.location.assign(to)} className="text-[11px] font-bold uppercase tracking-widest text-accent hover:text-text-primary">
        {label}
    </button>
);

export default function Leaderboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState('cosmic');

  // Multi-role users might be on /student or /peer and want to peek at Pact;
  // the Cosmic tab is the mentor default, so we pick the most relevant tab
  // by role when the user lands on the page fresh.
  const userRoles = Array.isArray(user?.roles) ? user.roles : ['peer_learner'];
  const isMentor = userRoles.includes('mentor');
  const isPeer = userRoles.includes('peer_learner');

  return (
    <>
      <Helmet><title>Leaderboard · Orbit</title></Helmet>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-1">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 flex-none rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--accent-1), var(--accent-3))', boxShadow: '0 0 16px var(--border-glow)' }}>
              <Trophy size={20} color="#fff" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-display font-bold text-text-primary">Leaderboards</h1>
              <p className="text-xs text-text-muted">Cosmic for mentors · Gameology for learners · Pact for the head-to-head.</p>
            </div>
          </div>
        </div>

        {/* Board-tab strip — single source for "which board am I on?" */}
        <div className="flex gap-1.5 mt-4 mb-3 overflow-x-auto hide-scrollbar -mx-1 px-1">
          {TABS.map((t) => {
            const visible = t.needs === 'any' || (t.needs === 'mentor' && isMentor);
            if (!visible) return null;
            const active = tab === t.id;
            const Icon = t.Icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-none flex items-center gap-1.5 min-h-[44px] sm:min-h-0 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  active ? 'text-accent bg-accent/10 border border-accent/30'
                         : 'text-text-secondary hover:text-text-primary bg-surface border border-border-subtle'}`}>
                <Icon size={13} />{t.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}>
            {tab === 'cosmic' && (isMentor || isPeer) && <CosmicBoard navigate={navigate} user={user} />}
            {tab === 'gameology' && <GameologyBoard />}
            {tab === 'pact' && isMentor && <PactBoard navigate={navigate} />}
            {tab === 'pact' && !isMentor && (
              <EmptyState
                icon={<BookOpen size={28} />}
                title="Pact is for mentors"
                description="The Pact is a weekly mentor league. If you teach, you'll find your group here."
                ctaLabel="Explore mentor mode"
                onCta={() => navigate('/mentor/hub')}
              />
            )}
            {tab === 'cosmic' && !isMentor && !isPeer && (
              <EmptyState
                icon={<Trophy size={28} />}
                title="No leaderboard yet"
                description="Become a learner or a mentor to see your standing."
              />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-start gap-1.5 text-[11px] text-text-muted mt-6 mb-24">
          <span className="mt-0.5 flex-none">ⓘ</span>
          <span>Three boards, three goals. Climb a tier, level up your learning, or hold your weekly Pact.</span>
        </div>
      </div>
    </>
  );
}
