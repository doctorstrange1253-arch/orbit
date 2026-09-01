/**
 * TodayTimeline.jsx — vertical "what you touched today" feed.
 *
 * Replaces the V3-B HorizonBar (the literal 60-min activity bar).
 * Renders a vertical list of today's events from the gameology
 * history endpoint, with a 1px dotted line on the left and a
 * per-event icon + 1-line prose + relative timestamp.
 *
 * Filters events to the last 24h (UTC day) by default. The empty
 * state is a single line of honest copy — no illustration, no CTA.
 */

import { useMemo } from 'react';
import {
  BookOpen, MessageCircle, Handshake, GraduationCap, Award, Sparkles
} from 'lucide-react';

const EVENT_META = {
  lesson_completed:    { Icon: BookOpen,        verb: 'finished a lesson' },
  quiz_passed:         { Icon: Award,           verb: 'passed a quiz' },
  quiz_perfect:        { Icon: Sparkles,        verb: 'aced a quiz' },
  course_completed:    { Icon: GraduationCap,   verb: 'finished a course' },
  session_completed:   { Icon: GraduationCap,   verb: 'completed a session' },
  peer_swap_completed: { Icon: Handshake,       verb: 'completed a peer swap' },
  peer_help_posted:    { Icon: MessageCircle,   verb: 'posted a Q&A reply' },
  streak_bonus:        { Icon: Sparkles,        verb: 'earned a streak bonus' },
  achievement_unlocked:{ Icon: Award,           verb: 'unlocked an achievement' },
  default:             { Icon: Sparkles,        verb: 'did a thing' },
};

const formatRelative = (iso) => {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Date.now() - then;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

const isToday = (iso) => {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return d.getUTCFullYear() === now.getUTCFullYear()
      && d.getUTCMonth() === now.getUTCMonth()
      && d.getUTCDate() === now.getUTCDate();
};

export default function TodayTimeline({ events = [] }) {
  const todays = useMemo(() => {
    return (Array.isArray(events) ? events : [])
      .filter((e) => isToday(e.createdAt))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [events]);

  return (
    <div className="relative pl-5">
      {/* Dotted vertical line */}
      <div
        aria-hidden="true"
        className="absolute top-1 bottom-1 left-1.5 w-px"
        style={{
          backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.18) 0 4px, transparent 4px 9px)',
          backgroundSize: '1px 9px',
        }}
      />

      {todays.length === 0 ? (
        <p
          className="text-[13px] leading-relaxed"
          style={{ color: 'var(--text-muted)' }}
        >
          Nothing here yet. Take a swap, post a Q&amp;A, or finish a lesson to see the day start.
        </p>
      ) : (
        <ul className="space-y-4">
          {todays.map((e, i) => {
            const meta = EVENT_META[e.event] || EVENT_META.default;
            const { Icon } = meta;
            return (
              <li key={e._id || `${e.event}-${e.createdAt}-${i}`} className="relative">
                <span
                  className="absolute -left-[18px] top-0.5 inline-flex items-center justify-center w-3 h-3 rounded-full"
                  style={{
                    background: 'rgba(8,10,18,1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <Icon size={8} strokeWidth={2.4} style={{ color: 'var(--text-secondary)' }} />
                </span>
                <p
                  className="text-[13px] leading-[1.5]"
                  style={{ color: 'var(--text-primary)' }}
                >
                  You {meta.verb}
                  {e.metadata?.lessonTitle ? <> · <em style={{ fontStyle: 'normal', color: 'var(--text-secondary)' }}>{e.metadata.lessonTitle}</em></> : null}
                  {e.metadata?.courseTitle ? <> · <em style={{ fontStyle: 'normal', color: 'var(--text-secondary)' }}>{e.metadata.courseTitle}</em></> : null}
                </p>
                <p
                  className="font-mono text-[10px] tracking-wider uppercase mt-0.5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {formatRelative(e.createdAt)}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
