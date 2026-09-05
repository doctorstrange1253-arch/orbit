import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ChevronRight, ShieldOff } from 'lucide-react';
import { StudioPanel, StudioStat, Reveal } from '../studio/surfaces';
import YellowCard from './YellowCard';
import api from '../../services/api';

const fetchInbox = async () => (await api.get('/moderation/me')).data;
const fetchFpRate = async () => (await api.get('/moderation/me/fp-rate')).data;
const respond = async ({ id, action, note, falsePositive }) => (await api.post(`/moderation/${id}/respond`, { action, note, falsePositive })).data;

const ModerationInbox = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();
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
  const reviewed = fpRate?.total || 0;
  const ratePct = Math.round((fpRate?.rate || 0) * 100);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <StudioPanel key={i} radius={18} className="h-24 skeleton" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StudioStat
          label="Pending"
          Icon={AlertTriangle}
          value={<span className="tabular-nums">{String(items.length).padStart(2, '0')}</span>}
          hint={items.length === 0 ? 'Nothing waiting on you' : 'Awaiting your read'}
          index={0}
        />
        <StudioStat
          label="False positive · 30d"
          value={
            <span className="tabular-nums" style={{ color: reviewed === 0 ? 'rgba(245,245,245,0.40)' : ratePct > 50 ? 'rgba(251,191,36,1)' : 'rgba(110,231,183,1)' }}>
              {reviewed > 0 ? `${ratePct}%` : '—'}
            </span>
          }
          hint={reviewed > 0 ? 'Flags that were wrong' : 'No reviews yet'}
          index={1}
        />
        <StudioStat
          label="Reviewed · 30d"
          Icon={ShieldOff}
          value={<span className="tabular-nums">{String(reviewed).padStart(2, '0')}</span>}
          hint="Cards you have closed"
          index={2}
        />
      </div>

      {ratePct > 50 && (
        <StudioPanel radius={16} className="p-3.5 flex items-start gap-2.5">
          <AlertTriangle size={14} style={{ color: 'rgba(251,191,36,1)', flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.86rem', lineHeight: 1.55, color: 'rgba(245,245,245,0.70)', margin: 0 }}>
            Your recent false-positive rate is high. The system is reducing its scrutiny for the next 7 days to avoid over-flagging.
          </p>
        </StudioPanel>
      )}

      {items.length === 0 ? (
        <StudioPanel radius={22} className="text-center" style={{ padding: '44px 24px' }}>
          <div
            className="mx-auto mb-4 flex items-center justify-center"
            style={{
              width: 52, height: 52, borderRadius: 16,
              background: 'color-mix(in oklab, var(--studio-from) 18%, transparent)',
              border: '1px solid color-mix(in oklab, var(--studio-from) 30%, transparent)',
            }}
          >
            <ShieldOff size={22} style={{ color: 'rgba(110,231,183,1)' }} />
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 'clamp(1.25rem, 2.4vw, 1.6rem)', letterSpacing: '-0.025em',
              color: 'var(--text-primary)',
            }}
          >
            All clear
          </div>
          <p
            className="mt-2 mx-auto"
            style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', lineHeight: 1.6, color: 'rgba(245,245,245,0.55)', maxWidth: 420 }}
          >
            No lesson of yours is waiting on a second look. Keep teaching the way you do.
          </p>
        </StudioPanel>
      ) : (
        <div className="space-y-3">
          {items.map((review, idx) => {
            const isOpen = expandedId === review._id;
            const moments = (review.hits || []).length;
            return (
              <Reveal key={review._id} index={idx}>
                <StudioPanel radius={18} className="overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isOpen ? null : review._id)}
                    className="w-full flex items-center gap-3 p-4 text-left"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    <span
                      className="flex items-center justify-center flex-shrink-0"
                      style={{
                        width: 32, height: 32, borderRadius: 10,
                        background: 'rgba(251,191,36,0.12)',
                        border: '1px solid rgba(251,191,36,0.30)',
                      }}
                    >
                      <AlertTriangle size={14} style={{ color: 'rgba(251,191,36,1)' }} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span
                        className="block truncate"
                        style={{
                          fontFamily: 'var(--font-display)', fontWeight: 700,
                          fontSize: '0.98rem', letterSpacing: '-0.015em', color: 'var(--text-primary)',
                        }}
                      >
                        {review.lessonTitle || 'Lesson flagged'}
                      </span>
                      <span
                        className="block font-mono mt-0.5 truncate"
                        style={{ fontSize: '0.70rem', color: 'rgba(245,245,245,0.50)' }}
                      >
                        {review.courseTitle ? `${review.courseTitle} · ` : ''}{moments} moment{moments === 1 ? '' : 's'} · {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </span>
                    <ChevronRight
                      size={16}
                      className="transition-transform duration-200"
                      style={{ color: 'rgba(245,245,245,0.45)', transform: isOpen ? 'rotate(90deg)' : 'none' }}
                    />
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
                          onEdit={review.courseId && review.lessonId
                            ? () => navigate(`/mentor/courses/${review.courseId}/lessons/${review.lessonId}`)
                            : undefined}
                          onAppeal={(id, note) => respondMut.mutate({ id, action: 'appealed', note })}
                          onFalsePositive={(id, note) => respondMut.mutate({ id, action: 'cleared', note, falsePositive: true })}
                          onDismiss={() => setExpandedId(null)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </StudioPanel>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ModerationInbox;
