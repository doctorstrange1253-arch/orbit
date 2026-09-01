/**
 * soul/editorial/SkillsPolaroid.jsx
 *
 * An "archive card" treatment for the user's skill cards. Off-white
 * paper, single soft drop shadow, a 4px top color block in the soul
 * accent. Tilt is sub-perceptual (±0.5°, deterministic per skill).
 *
 * The card is denser than the original polaroid — it carries:
 *   - The skill name in display type (dark ink on paper)
 *   - The skill wanted as a small "in exchange for" line
 *   - A 3-dot level indicator (filled = proficiency)
 *   - A sessions-taught count in a corner badge
 *   - A subtle category tag (derived from the skill name's first letter,
 *     so no backend schema change is needed)
 *   - Beneath the paper, an editorial caption: "Traded N times · R.R★"
 *     or "Archived 14 Mar"
 *
 * Per the editorial review: washi-tape is a stationery signifier, not
 * an editorial one. Aperture and NYT Mag use rules, color blocks, and
 * hairlines. This card follows that rule.
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

// Five accent tints for the corner tag — derived from a hash of the
// skill's _id so the same skill always gets the same color. Lets the
// grid read as a varied palette of archive cards, not a uniform row.
const TAG_TINTS = [
  { fg: '#0d9488', bg: 'rgba(34,211,238,0.10)' },  // teal
  { fg: '#a78bfa', bg: 'rgba(167,139,250,0.12)' }, // violet
  { fg: '#f43f5e', bg: 'rgba(244,63,94,0.10)' },   // rose
  { fg: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },  // amber
  { fg: '#22d3ee', bg: 'rgba(34,211,238,0.12)' },  // cyan
];

const LEVEL_LABEL = {
  beginner: 'B',
  intermediate: 'I',
  advanced: 'A',
};
const LEVEL_DOT_COUNT = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

const POLAROID_BG = '#faf6f0';
const POLAROID_INK = '#1a1a1a';

export default function SkillsPolaroid({ skill, index = 0 }) {
  const { nebula } = useSoul();
  const accent = nebula?.from || '#22d3ee';
  const accentTo = nebula?.to || '#0d9488';
  const [editing, setEditing] = useState(false);

  // Sub-perceptual tilt — ±0.5°. The card looks level; the eye
  // registers it as "not perfectly aligned" which is the editorial
  // effect we want.
  const tilt = useMemo(() => {
    const h = hash01(skill?._id || index);
    return (h - 0.5) * 1.0; // -0.5 to +0.5
  }, [skill?._id, index]);

  // Deterministic per-card corner tag color.
  const tag = useMemo(() => {
    const h = hash01((skill?._id || index) + '-tag');
    return TAG_TINTS[Math.floor(h * TAG_TINTS.length)];
  }, [skill?._id, index]);

  const [hover, setHover] = useState(false);

  const levelKey = skill?.proposedLevel || skill?.level || 'intermediate';
  const levelDots = LEVEL_DOT_COUNT[levelKey] ?? 2;
  const levelLetter = LEVEL_LABEL[levelKey] ?? 'I';
  const exchanges = skill?.swapCount ?? skill?.exchanges ?? skill?.sessionsTaught ?? 0;
  const rating = skill?.rating?.average ?? skill?.rating ?? null;
  const lastTouched = skill?.lastTaughtAt || skill?.updatedAt || skill?.createdAt;
  const firstChar = (skill?.skillOffered || '?').trim().charAt(0).toUpperCase() || '?';

  // Editorial caption beneath the card.
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
                ? `0 14px 28px -12px ${accent}40, 0 6px 14px -6px rgba(0,0,0,0.25)`
                : `0 6px 14px -6px ${accent}25, 0 4px 10px -4px rgba(0,0,0,0.18)`,
              borderRadius: 2,
              transition: 'box-shadow 240ms ease-out',
            }}
          >
            {/* 4px top color block — the editorial "rule" that
                identifies the card. */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: 4,
                background: `linear-gradient(90deg, ${accent}, ${accentTo})`,
              }}
            />

            <div className="h-full w-full px-5 pt-7 pb-5 flex flex-col">
              {/* Top row: tag chip + level dots */}
              <div className="flex items-center justify-between mb-3">
                <div
                  className="inline-flex items-center font-mono uppercase tracking-[0.18em]"
                  style={{
                    fontSize: '0.55rem',
                    color: tag.fg,
                    background: tag.bg,
                    padding: '3px 7px',
                    borderRadius: 2,
                    letterSpacing: '0.16em',
                  }}
                >
                  {firstChar}
                </div>
                <div className="flex items-center gap-1" aria-label={`Level: ${levelKey}`}>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: i < levelDots ? '#1a1a1a' : 'rgba(26,26,26,0.15)',
                        transition: 'background 240ms',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Skill name — the headline */}
              <h3
                className="font-display font-bold leading-[1.02] tracking-[-0.015em]"
                style={{
                  fontSize: 'clamp(1.3rem, 1.7vw, 1.6rem)',
                  color: POLAROID_INK,
                }}
              >
                {skill?.skillOffered || 'Untitled'}
              </h3>

              {/* "In exchange for" line */}
              <p
                className="mt-2 leading-[1.4] line-clamp-1"
                style={{ fontSize: '0.78rem', color: 'rgba(26,26,26,0.62)' }}
              >
                <span
                  className="font-mono uppercase tracking-[0.16em]"
                  style={{ fontSize: '0.58rem', color: 'rgba(26,26,26,0.4)' }}
                >
                  In exchange for
                </span>
                <br />
                {skill?.skillWanted || skill?.description || '—'}
              </p>

              {/* Spacer pushes the bottom stats down */}
              <div className="flex-1" />

              {/* Bottom: stat row (trades + rating) */}
              <div
                className="flex items-center justify-between pt-3"
                style={{ borderTop: '1px solid rgba(26,26,26,0.08)' }}
              >
                <div
                  className="font-mono uppercase tracking-[0.18em]"
                  style={{ fontSize: '0.58rem', color: 'rgba(26,26,26,0.5)' }}
                >
                  {exchanges > 0 ? `${exchanges} trade${exchanges === 1 ? '' : 's'}` : 'No trades yet'}
                </div>
                <div
                  className="font-mono uppercase tracking-[0.18em]"
                  style={{ fontSize: '0.58rem', color: rating != null ? tag.fg : 'rgba(26,26,26,0.35)' }}
                >
                  {rating != null ? `${Number(rating).toFixed(1)}★` : levelLetter}
                </div>
              </div>
            </div>
          </div>
        </div>
      </button>

      {/* Editorial caption — outside the paper, in the page's
          text color. Mono small caps. */}
      <p
        className="text-center mt-3 font-mono uppercase tracking-[0.2em]"
        style={{ fontSize: '0.62rem', color: 'rgba(245,245,245,0.62)' }}
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
