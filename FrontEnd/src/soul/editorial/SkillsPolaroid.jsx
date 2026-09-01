/**
 * soul/editorial/SkillsPolaroid.jsx
 *
 * An "archive card" treatment for the user's skill cards. 4:5
 * aspect, off-white paper, single soft drop shadow, a 4px top
 * color block in the soul accent. Tilt is sub-perceptual (±0.5°,
 * deterministic per skill). Beneath the card — outside the paper
 * — a small editorial caption in the page's normal text: the
 * date the skill was last traded, or "First archived 14 Mar" if
 * it's never been traded.
 *
 * Per the editorial review: washi-tape is a stationery signifier,
 * not an editorial one. Aperture and NYT Mag use rules, color
 * blocks, and hairlines. This card follows that rule.
 */

import { useMemo, useState } from 'react';
import { useSoul } from '../../hooks/useSoul';
import SkillForm from '../../components/skills/SkillForm';

function hash01(id) {
  const s = String(id || '');
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 0xffffffff;
}

const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
};

const POLAROID_BG = '#faf6f0';
const POLAROID_INK = '#1a1a1a';

export default function SkillsPolaroid({ skill, index = 0 }) {
  const { nebula } = useSoul();
  const accent = nebula?.from || '#22d3ee';
  const [editing, setEditing] = useState(false);

  // Sub-perceptual tilt — ±0.5°. The card looks level; the eye
  // registers it as "not perfectly aligned" which is the editorial
  // effect we want.
  const tilt = useMemo(() => {
    const h = hash01(skill?._id || index);
    return (h - 0.5) * 1.0; // -0.5 to +0.5
  }, [skill?._id, index]);

  const [hover, setHover] = useState(false);

  const level = skill?.proposedLevel ?? skill?.level ?? 1;
  const exchanges = skill?.swapCount ?? skill?.exchanges ?? 0;
  const rating = skill?.rating?.average ?? skill?.rating ?? null;
  const lastTouched = skill?.lastTaughtAt || skill?.updatedAt || skill?.createdAt;

  // Editorial caption beneath the card. Two flavors:
  //   "Traded 4 times · 4.8★"            (if there's been activity)
  //   "Archived 14 Mar"                  (if not, or as a base)
  const caption = exchanges > 0
    ? `Traded ${exchanges} time${exchanges === 1 ? '' : 's'}${rating != null ? ` · ${Number(rating).toFixed(1)}★` : ''}`
    : `Archived ${formatDate(lastTouched) || 'today'}`;

  return (
    <div className="group">
      <button
        type="button"
        onClick={() => setEditing(true)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        aria-label={`Edit ${skill?.skillOffered || 'skill'}`}
        className="block text-left w-full"
        style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
      >
        <div
          className="relative mx-auto"
          style={{
            aspectRatio: '4 / 5',
            maxWidth: 280,
            transform: `rotate(${tilt}deg)${hover ? ' translateY(-2px)' : ''}`,
            transition: 'transform 240ms ease-out',
          }}
        >
          {/* The archive card: off-white paper, single soft shadow. */}
          <div
            className="relative w-full h-full overflow-hidden"
            style={{
              background: POLAROID_BG,
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: hover
                ? '0 12px 26px -12px rgba(0,0,0,0.4)'
                : '0 6px 14px -6px rgba(0,0,0,0.25)',
              borderRadius: 2,
              transition: 'box-shadow 240ms ease-out',
            }}
          >
            {/* 4px top color block — the editorial "rule" that
                identifies the card. No washi-tape, no pattern. */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: 4,
                background: accent,
              }}
            />

            <div className="h-full w-full p-5 flex flex-col justify-between">
              {/* Top: name + level (in dark ink on off-white paper) */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3
                    className="font-display font-bold leading-[1.02] tracking-[-0.015em]"
                    style={{
                      fontSize: 'clamp(1.15rem, 1.5vw, 1.45rem)',
                      color: POLAROID_INK,
                    }}
                  >
                    {skill?.skillOffered || 'Untitled'}
                  </h3>
                  <span
                    className="font-mono uppercase tracking-[0.18em] flex-shrink-0"
                    style={{ fontSize: '0.58rem', color: 'rgba(26,26,26,0.45)' }}
                  >
                    L{level}
                  </span>
                </div>
                <p
                  className="leading-[1.4] line-clamp-1"
                  style={{ fontSize: '0.78rem', color: 'rgba(26,26,26,0.6)' }}
                >
                  {skill?.description || `Wants to learn ${skill?.skillWanted || '—'}`}
                </p>
              </div>

              {/* Bottom: stat line (inside the paper) */}
              <div
                className="font-mono uppercase tracking-[0.18em]"
                style={{ fontSize: '0.58rem', color: 'rgba(26,26,26,0.45)' }}
              >
                {exchanges > 0 ? `${exchanges} swap${exchanges === 1 ? '' : 's'}` : 'No trades yet'}
                {rating != null ? ` · ${Number(rating).toFixed(1)}★` : ''}
              </div>
            </div>
          </div>
        </div>
      </button>

      {/* Editorial caption — outside the paper, in the page's
          text color. Mono small caps. This is the "Swapped with
          Maya · 14 Mar" line the review asked for; we use the
          trade count + rating as the most reliable signal. */}
      <p
        className="text-center mt-3 font-mono uppercase tracking-[0.2em]"
        style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}
      >
        {caption}
      </p>

      <SkillForm
        isOpen={editing}
        onClose={() => setEditing(false)}
        editingSkill={skill}
        accent={accent}
      />
    </div>
  );
}
