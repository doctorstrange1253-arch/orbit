/**
 * SkillArtifact.jsx — the museum-card skill tile used on the new peer
 * window (MyOrbit).
 *
 * Replaces the chunkier V2 SkillCard for the "Your skills" grid. The
 * card is 4:5 aspect ratio, generous inner padding, hairline border
 * that tints to the user's soul accent on hover. No icons inside the
 * card (it's already a card — icons would compete with the typography).
 *
 * Renders the existing SkillForm when the user clicks the inline
 * "Edit" link. HolographicCard wraps it for the rare-foil shimmer so
 * it still reads as a "treasured" object.
 */

import { useState } from 'react';
import { Edit2 } from 'lucide-react';
import HolographicCard from '../fx/HolographicCard';
import SkillForm from './SkillForm';
import { useSoul } from '../../hooks/useSoul';

const rarityFromLevel = (lvl) => {
  if (lvl >= 80) return 'mythic';
  if (lvl >= 50) return 'epic';
  if (lvl >= 25) return 'rare';
  return 'common';
};

const formatRelative = (date) => {
  if (!date) return 'never';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return 'never';
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return '1d';
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  return `${Math.floor(months / 12)}y`;
};

export default function SkillArtifact({ skill }) {
  const { soul, nebula } = useSoul();
  const [editing, setEditing] = useState(false);
  const accent = nebula?.from || 'var(--soul-accent-1, #22d3ee)';
  const level = skill?.proposedLevel ?? skill?.level ?? 1;
  const rarity = rarityFromLevel(level);
  const exchanges = skill?.swapCount ?? skill?.exchanges ?? 0;
  const rating = skill?.rating?.average ?? skill?.rating ?? null;
  const lastTouched = skill?.lastTaughtAt || skill?.updatedAt || skill?.createdAt;

  return (
    <>
      <HolographicCard
        tilt={false}
        rarity={rarity}
        className="block group cursor-default"
        style={{ aspectRatio: '4 / 5' }}
      >
        <div
          className="relative h-full w-full p-7 flex flex-col justify-between transition-colors duration-200"
          style={{
            border: '1px solid color-mix(in oklab, currentColor 6%, transparent)',
          }}
        >
          {/* Top: name + level */}
          <div>
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3
                className="font-display font-bold leading-[1.05] tracking-tight"
                style={{
                  fontSize: 'clamp(1.4rem, 1.9vw, 1.75rem)',
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.015em',
                }}
              >
                {skill?.skillOffered || 'Untitled'}
              </h3>
              <span
                className="font-mono text-[10px] tracking-widest uppercase px-2 py-1 rounded-md flex-shrink-0"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  color: 'var(--text-muted)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                L{level}
              </span>
            </div>
            <p
              className="text-[13px] leading-[1.45] line-clamp-1"
              style={{ color: 'var(--text-muted)' }}
            >
              {skill?.description || `Wants to learn ${skill?.skillWanted || '—'}`}
            </p>
          </div>

          {/* Bottom: stats + edit */}
          <div className="flex items-end justify-between">
            <div
              className="flex items-center gap-3 font-mono text-[10px] tracking-widest uppercase"
              style={{ color: 'var(--text-muted)' }}
            >
              <span>Last {formatRelative(lastTouched)}</span>
              <span style={{ color: 'rgba(255,255,255,0.12)' }}>·</span>
              <span>{exchanges} swaps</span>
              {rating != null && (
                <>
                  <span style={{ color: 'rgba(255,255,255,0.12)' }}>·</span>
                  <span>{Number(rating).toFixed(1)}★</span>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label={`Edit ${skill?.skillOffered || 'skill'}`}
              className="font-mono text-[10px] tracking-widest uppercase transition-colors duration-200 px-2 py-1 rounded opacity-50 hover:opacity-100"
              style={{ color: 'var(--text-secondary)' }}
            >
              Edit
            </button>
          </div>

          {/* Subtle hover border tint to the active soul nebula.
              Applied via a wrapping class to keep the HolographicCard
              shim layer untouched. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-2xl pointer-events-none transition-[box-shadow,border-color] duration-200"
            style={{
              boxShadow: 'inset 0 0 0 1px transparent',
            }}
          />
        </div>
      </HolographicCard>
      <SkillForm
        isOpen={editing}
        onClose={() => setEditing(false)}
        editingSkill={skill}
        accent={accent}
      />
    </>
  );
}
