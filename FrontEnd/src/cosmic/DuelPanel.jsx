import { useMemo, useState } from 'react';
import { Swords, UserPlus, Check, X, Trophy, Minus } from 'lucide-react';
import Avatar from '../components/common/Avatar';
import PhotonIcon from './PhotonIcon';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { useConnectionsForInvite } from './useBinaryStars';
import { useDuels, useChallengePeer, useRespondDuel } from './useDuels';

const OUTCOME = {
  won: { label: 'Won', cls: 'text-emerald-300', Icon: Trophy },
  lost: { label: 'Lost', cls: 'text-slate-400', Icon: Minus },
  drew: { label: 'Level', cls: 'text-amber-300', Icon: Minus },
};

function Scoreline({ duel }) {
  const leading = duel.you.score > duel.them.score;
  const level = duel.you.score === duel.them.score;
  return (
    <div className="flex items-center gap-3">
      <span className={`text-2xl font-bold tabular-nums ${leading ? 'text-emerald-300' : level ? 'text-amber-300' : 'text-slate-300'}`}>
        {duel.you.score}
      </span>
      <span className="text-slate-600 text-sm">vs</span>
      <span className={`text-2xl font-bold tabular-nums ${!leading && !level ? 'text-emerald-300' : 'text-slate-300'}`}>
        {duel.them.score}
      </span>
    </div>
  );
}

export default function DuelPanel() {
  const me = useAuthStore((s) => s.user);
  const { addToast } = useUIStore();
  const [pickerOpen, setPickerOpen] = useState(false);

  const { data } = useDuels({});
  const challenge = useChallengePeer();
  const respond = useRespondDuel();
  const { data: connections = [] } = useConnectionsForInvite(pickerOpen);

  const current = data?.current || null;
  const record = data?.record || { won: 0, lost: 0, drew: 0 };

  const eligible = useMemo(() => {
    const myId = me?._id?.toString();
    const seen = new Set();
    const out = [];
    for (const conn of connections) {
      const other = conn.requester?._id?.toString() === myId ? conn.receiver : conn.requester;
      const oid = other?._id?.toString();
      if (!oid || seen.has(oid)) continue;
      seen.add(oid);
      out.push({ id: oid, name: other.name, avatar: other.avatar });
    }
    return out;
  }, [connections, me]);

  const onChallenge = (id) => challenge.mutate(id, {
    onSuccess: () => { addToast('Challenge sent', 'success'); setPickerOpen(false); },
    onError: (e) => addToast(e.response?.data?.message || 'Could not send that challenge', 'error'),
  });
  const onRespond = (id, accept) => respond.mutate({ id, accept }, {
    onSuccess: () => addToast(accept ? 'Duel accepted — good luck' : 'Challenge declined', accept ? 'success' : 'info'),
    onError: (e) => addToast(e.response?.data?.message || 'Could not answer that challenge', 'error'),
  });

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/30 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Swords size={18} className="text-rose-300" />
        <h2 className="text-base font-bold text-white">Weekly duel</h2>
        <span className="hidden sm:inline text-xs text-slate-500">whoever earns more this week</span>
        {!current && (
          <button
            onClick={() => setPickerOpen((v) => !v)}
            className="ml-auto inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold bg-rose-500/15 text-rose-200 ring-1 ring-rose-400/30 hover:bg-rose-500/25"
          >
            <UserPlus size={13} /> Challenge
          </button>
        )}
      </div>

      {current && current.status === 'active' && (
        <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3.5 flex items-center gap-3">
          <Avatar name={current.them.name} url={current.them.avatar} size="sm" userId={current.them.userId} />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-white truncate">You vs {current.them.name}</div>
            <div className="text-xs text-slate-400">
              {current.you.score === current.them.score
                ? 'Level with nothing between you.'
                : current.you.score > current.them.score
                  ? `You are ahead by ${current.you.score - current.them.score}.`
                  : `Behind by ${current.them.score - current.you.score} — there is still the week.`}
            </div>
          </div>
          <Scoreline duel={current} />
        </div>
      )}

      {current && current.status === 'pending' && current.iChallenged && (
        <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3.5 flex items-center gap-3">
          <Avatar name={current.them.name} url={current.them.avatar} size="sm" userId={current.them.userId} />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-white truncate">Waiting on {current.them.name}</div>
            <div className="text-xs text-slate-400">Your challenge is out. It lapses when the week turns over.</div>
          </div>
        </div>
      )}

      {current && current.status === 'pending' && !current.iChallenged && (
        <div className="rounded-xl border border-rose-400/25 bg-rose-500/5 p-3.5 flex items-center gap-3">
          <Avatar name={current.them.name} url={current.them.avatar} size="sm" userId={current.them.userId} />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-white truncate">{current.them.name} challenged you</div>
            <div className="text-xs text-slate-400">Whoever earns more Orbit XP by Monday takes the week.</div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onRespond(current._id, true)}
              disabled={respond.isPending}
              className="grid place-items-center w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30 disabled:opacity-40"
              aria-label="Accept the duel"
            >
              <Check size={15} />
            </button>
            <button
              onClick={() => onRespond(current._id, false)}
              disabled={respond.isPending}
              className="grid place-items-center w-8 h-8 rounded-full bg-white/5 text-slate-400 ring-1 ring-white/10 disabled:opacity-40"
              aria-label="Decline the duel"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {!current && !pickerOpen && (
        <p className="text-sm text-slate-400 py-3">
          No duel this week. Challenge someone you have swapped with — the winner takes{' '}
          <span className="inline-flex items-center gap-1 text-violet-200 font-semibold">
            <PhotonIcon size={12} animated={false} /> {data?.winPhotons ?? 150}
          </span>
          , and a level week still pays {data?.drawPhotons ?? 40}.
        </p>
      )}

      {pickerOpen && !current && (
        <div className="mt-1 rounded-xl border border-white/10 bg-slate-900/40 divide-y divide-white/5 max-h-64 overflow-y-auto">
          {eligible.length === 0 ? (
            <p className="text-sm text-slate-400 p-4 text-center">
              No one to duel yet. Complete a swap with someone first.
            </p>
          ) : eligible.map((p) => (
            <button
              key={p.id}
              onClick={() => onChallenge(p.id)}
              disabled={challenge.isPending}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/5 disabled:opacity-40"
            >
              <Avatar name={p.name} url={p.avatar} size="sm" userId={p.id} />
              <span className="text-sm font-semibold text-white truncate flex-1">{p.name}</span>
              <Swords size={14} className="text-rose-300 shrink-0" />
            </button>
          ))}
        </div>
      )}

      {(record.won + record.lost + record.drew) > 0 && (
        <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-400 tabular-nums">
          <span className="text-emerald-300 font-semibold">{record.won}W</span>
          <span>{record.lost}L</span>
          <span className="text-amber-300">{record.drew} level</span>
          {(data?.history || []).slice(0, 1).map((h) => {
            const meta = OUTCOME[h.outcome];
            if (!meta) return null;
            const Icon = meta.Icon;
            return (
              <span key={h._id} className={`ml-auto inline-flex items-center gap-1 ${meta.cls}`}>
                <Icon size={11} /> {meta.label} vs {h.them.name} · {h.you.score}–{h.them.score}
              </span>
            );
          })}
        </div>
      )}
    </section>
  );
}
