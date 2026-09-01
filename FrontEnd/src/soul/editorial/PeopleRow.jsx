/**
 * soul/editorial/PeopleRow.jsx
 *
 * A horizontal strip of "person cards" — the people the user has
 * actually traded with. Each card: 56px avatar, name, the skill
 * they traded, relative time. Click → their public profile.
 *
 * The row scrolls horizontally on overflow (no marquee, no auto-
 * scroll). The empty state is one line of honest copy.
 */

import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import Avatar from '../../components/common/Avatar';

const formatRelative = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return '1d';
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  return `${Math.floor(months / 12)}y`;
};

export default function PeopleRow() {
  const navigate = useNavigate();

  const { data: conns = [] } = useQuery({
    queryKey: ['connections', 'people-row', 'peer'],
    queryFn: () => api.get('/connections?status=accepted&limit=24')
      .then((r) => r.data?.connections || r.data || [])
      .catch(() => []),
    staleTime: 60_000,
  });

  const list = Array.isArray(conns) ? conns.slice(0, 12) : [];

  return (
    <section className="py-8" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <p
        className="font-mono uppercase tracking-[0.28em] mb-5"
        style={{ fontSize: '0.72rem', color: 'rgba(245,245,245,0.78)' }}
      >
        The people who stayed.
      </p>

      {list.length === 0 ? (
        <p
          className="leading-[1.6] max-w-[44ch]"
          style={{ fontSize: '0.9rem', color: 'rgba(245,245,245,0.72)' }}
        >
          No one here yet. The first connection is the slowest; every one after is faster.
        </p>
      ) : (
        <div
          className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1"
          style={{ scrollbarWidth: 'thin' }}
        >
          {list.map((c) => {
            const peer = c.peer || c.user || c.otherUser || {};
            const id = peer._id || c._id;
            const tradedSkill = c.skillOffered || c.skillWanted || c.swapSkill || 'a skill';
            return (
              <button
                key={id || Math.random()}
                type="button"
                onClick={() => id && navigate(`/peer/profile/${id}`)}
                aria-label={`Open ${peer.name || 'connection'}'s profile`}
                className="flex-shrink-0 text-left rounded-xl p-3 transition-colors duration-200"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  width: 168,
                  minWidth: 168,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
              >
                <div className="flex items-center gap-2.5">
                  <Avatar name={peer.name} url={peer.avatar} size="sm" userId={peer._id} />
                  <div className="min-w-0">
                    <div
                      className="font-display font-semibold truncate"
                      style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}
                    >
                      {peer.name || 'Connection'}
                    </div>
                    <div
                      className="font-mono uppercase tracking-[0.18em] truncate"
                      style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}
                    >
                      {c.status === 'completed' ? 'Traded' : 'Connected'} · {formatRelative(c.updatedAt || c.createdAt)}
                    </div>
                  </div>
                </div>
                <div
                  className="mt-2.5 truncate"
                  style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}
                >
                  {tradedSkill}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
