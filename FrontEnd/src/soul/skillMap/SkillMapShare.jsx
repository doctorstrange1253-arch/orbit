/**
 * soul/skillMap/SkillMapShare.jsx — The "Share" affordance.
 *
 * Copies the shareable Skill Map URL (with a `?ref=share` flag) to the
 * clipboard. Falls back to the Web Share API on mobile.
 *
 * The "Shared by [name]" eyebrow appears on the public /skill-map/:userId
 * page when the URL is opened with `?ref=share`. (V3-E reads that
 * query param in SkillMapPublic.jsx.)
 */

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { useSoul } from '../../hooks/useSoul';
import { Haptic } from '../haptics';

const SkillMapShare = ({ userId, displayName }) => {
  const { nebula } = useSoul();
  const accent = nebula?.from || '#22d3ee';
  const [copied, setCopied] = useState(false);

  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/skill-map/${userId}?ref=share`
    : `/skill-map/${userId}?ref=share`;

  const onShare = async () => {
    Haptic.light();
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My Skill Map on Orbit',
          text: `${displayName || 'A learner'} on Orbit — see what they've been learning.`,
          url,
        }).catch(() => { /* user cancelled */ });
        return;
      }
    } catch { /* fall through */ }
    // Fallback: clipboard.
    try {
      await navigator.clipboard?.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Last-resort: select the input.
    }
  };

  return (
    <button
      type="button"
      onClick={onShare}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border"
      style={{
        background: 'rgba(255,255,255,0.04)',
        borderColor: `${accent}55`,
        color: accent,
      }}
    >
      {copied ? <Check size={14} /> : <Share2 size={14} />}
      {copied ? 'Copied' : 'Share'}
    </button>
  );
};

export default SkillMapShare;
