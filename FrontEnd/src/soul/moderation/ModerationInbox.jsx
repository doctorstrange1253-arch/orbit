/**
 * soul/moderation/ModerationInbox.jsx — Mentor's review queue.
 *
 * A list of pending Yellow Cards + a stats panel showing the
 * mentor's false-positive rate. Used at /mentor/moderation.
 *
 * The inbox is mentor-only. It's a small surface — most mentors will
 * have 0-3 pending reviews at any time. The list is rendered as
 * compact rows; clicking a row expands the Yellow Card detail.
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ChevronRight, ShieldOff } from 'lucide-react';
import { useSoul } from '../../hooks/useSoul';
import { surfaceRecipe, borderTint } from '../tints';
import YellowCard from './YellowCard';
import api from '../../services/api';

const fetchInbox = async () => (await api.get('/moderation/me')).data;
const fetchFpRate = async () => (await api.get('/moderation/me/fp-rate')).data;
const respond = async ({ id, action, note, falsePositive }) => (await api.post(`/moderation/${id}/respond`, { action, note, falsePositive })).data;

const ModerationInbox = () => {
  const { nebula } = useSoul();
  const qc = useQueryClient();
  const [expandedId, setExpandedId] = useState(null);

  const { data: inboxData, isLoading } = useQuery({
    queryKey: ['moderation', 'inbox'],
    queryFn: fetchInbox,
    staleTime: 60_000,
  });

  const { data: fpRate } = useQuery({
    queryKey: ['moderation', 'fp-rate'],
    queryFn: fetchFpRate,
    staleTime: 60_000,
  });

  const respondMut = useMutation({
    mutationFn: respond,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['moderation', 'inbox'] });
      qc.invalidateQueries({ queryKey: ['moderation', 'fp-rate'] });
      setExpandedId(null);
    },
  });

  const items = inboxData?.items || [];
  const rate = fpRate?.rate || 0;
  const ratePct = Math.round(rate * 100);

  if (isLoading) {
    return <div className="text-text-muted text-sm py-6">Loading inbox…</div>;
  }

  return (
    <div className="space-y-4">
      {/* Stats panel */}
      <div className="rounded-2xl p-4" style={{ ...surfaceRecipe('mentor'), border: borderTint(nebula, 18) }}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Pending</div>
            <div className="text-2xl font-bold tabular-nums text-text-primary mt-1">{items.length}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">False-positive rate (30d)</div>
            <div className="text-2xl font-bold tabular-nums mt-1" style={{ color: ratePct > 50 ? '#fbbf24' : ratePct > 30 ? '#fbbf24' : '#34d399' }}>
              {fpRate?.total > 0 ? `${ratePct}%` : '—'}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Reviewed (30d)</div>
            <div className="text-2xl font-bold tabular-nums text-text-primary mt-1">{fpRate?.total || 0}</div>
          </div>
        </div>
        {ratePct > 50 && (
          <div className="mt-3 rounded-lg p-2 text-[10px] text-amber-200 bg-amber-500/10 border border-amber-500/30">
            Your recent false-positive rate is high. The system is reducing its scrutiny for the next 7 days to avoid over-flagging.
          </div>
        )}
      </div>

      {/* Queue */}
      {items.length === 0 ? (
        <div className="rounded-2xl p-8 text-center" style={{ ...surfaceRecipe('mentor'), border: borderTint(nebula, 18) }}>
          <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.35)' }}>
            <ShieldOff size={20} className="text-emerald-300" />
          </div>
          <div className="text-sm font-semibold text-text-primary">All clear.</div>
          <div className="text-xs text-text-muted mt-1">No pending reviews. Keep being you.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((review) => {
            const isOpen = expandedId === review._id;
            return (
              <div key={review._id} className="rounded-2xl overflow-hidden" style={{ ...surfaceRecipe('mentor'), border: borderTint(nebula, 18) }}>
                <button
                  type="button"
                  onClick={() => setExpandedId(isOpen ? null : review._id)}
                  className="w-full flex items-center gap-3 p-4 text-left"
                >
                  <AlertTriangle size={16} className="text-amber-300 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-text-primary truncate">
                      {review.lessonTitle || 'Lesson flagged'}
                    </div>
                    <div className="text-[10px] text-text-muted">
                      {(review.hits || []).length} moment{(review.hits || []).length === 1 ? '' : 's'} flagged · {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <ChevronRight size={16} className={`text-text-muted transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-4 pb-4"
                    >
                      <YellowCard
                        review={review}
                        onEdit={() => { /* navigate to course edit */ }}
                        onAppeal={(id, note) => respondMut.mutate({ id, action: 'appealed', note })}
                        onFalsePositive={(id, note) => respondMut.mutate({ id, action: 'cleared', note, falsePositive: true })}
                        onDismiss={() => setExpandedId(null)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ModerationInbox;
