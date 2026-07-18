import { memo, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { Trash2, Video, UserPlus, Send, Globe, Star, MessageCircle, Check } from 'lucide-react';
import api from '../../services/api';
import Avatar from '../common/Avatar';
import CosmicBadge from '../../cosmic/CosmicBadge';
import TierProgress from '../../cosmic/TierProgress';
import GlowName from '../../cosmic/GlowName';
import Nameplate from '../../cosmic/Nameplate';
import { equippedFromUser } from '../../cosmic/cosmetics';
import MasteryBar from '../../cosmic/MasteryBar';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

const LEVEL_STYLES = {
  beginner:     { bg: 'rgba(0,229,160,0.1)',  border: 'rgba(0,229,160,0.3)',  color: '#00e5a0' },
  intermediate: { bg: 'rgba(255,184,0,0.1)',  border: 'rgba(255,184,0,0.3)',  color: '#ffb800' },
  advanced:     { bg: 'rgba(0,198,255,0.1)',  border: 'rgba(0,198,255,0.3)',  color: '#00c6ff' },
};

const SkillCard = memo(({ skill, variant = 'browse', onConnect, onViewRatings, isConnected, isOnline, onMessage, onCall }) => {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const isOwner = skill.userId?._id === user?._id || skill.userId === user?._id;
  const owner = typeof skill.userId === 'object' ? skill.userId : user;
  const level = skill.level || 'intermediate';
  const ls = LEVEL_STYLES[level] || LEVEL_STYLES.intermediate;

  // Equipped store cosmetics — the card wears the owner's full look (nebula
  // background, avatar frame, nameplate, profile effect, name glow), exactly
  // like the profile card, so looks are visible to everyone in Browse/Matches.
  // OWN cards read from the live authStore user (not the fetched list row):
  // equipping in the store updates the authStore optimistically, so the change
  // paints here the same instant with zero refetch latency.
  const cosmeticsSource = isOwner ? user : owner;
  const { bgClass, decoClass, effectClass, plateKey } = equippedFromUser(cosmeticsSource);

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/skills/${skill._id}`),
    // OPTIMISTIC: pull the card out of ['skills','my'] the instant the user
    // confirms — the old invalidate-only flow left the card sitting there for
    // a full round-trip + refetch ("skill deletion lag"). Rolls back on error.
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['skills', 'my'] });
      const prev = queryClient.getQueryData(['skills', 'my']);
      queryClient.setQueryData(['skills', 'my'], (old) =>
        Array.isArray(old) ? old.filter((s) => s._id !== skill._id) : old);
      return { prev };
    },
    onError: useCallback((err, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['skills', 'my'], ctx.prev);
      addToast(err.response?.data?.message || 'Delete failed', 'error');
    }, [addToast, queryClient]),
    onSuccess: useCallback(() => {
      addToast('Skill removed', 'success');
      queryClient.invalidateQueries({ queryKey: ['cosmic'] }); // refresh standing (v7 §1)
    }, [addToast, queryClient]),
    onSettled: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['skills', 'my'] });
    }, [queryClient]),
  });

  const handleCardClick = useCallback(() => {
    if (owner?._id) navigate(`/profile/${owner._id}`);
  }, [owner?._id, navigate]);

  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    if (window.confirm('Delete this skill?')) deleteMutation.mutate();
  }, [deleteMutation]);

  const handleViewRatings = useCallback((e) => {
    e.stopPropagation();
    onViewRatings?.(owner);
  }, [onViewRatings, owner]);

  const handleConnect = useCallback((e) => {
    e.stopPropagation();
    onConnect?.(skill._id, owner?._id);
  }, [onConnect, skill._id, owner?._id]);

  const handleMessageClick = useCallback((e) => {
    e.stopPropagation();
    onMessage?.();
  }, [onMessage]);

  const handleCallClick = useCallback((e) => {
    e.stopPropagation();
    onCall?.();
  }, [onCall]);

  return (
    <motion.div
      className={`skill-card p-5 flex flex-col gap-4 cursor-pointer hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,198,255,0.12)] transition-all duration-300 ${bgClass} ${bgClass ? 'cosmic-surface skill-card-nebula' : ''}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      layout
      onClick={handleCardClick}
    >
      {/* owner's equipped profile effect — particles across the whole card */}
      {effectClass && <span className={effectClass} aria-hidden="true" />}
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            <Avatar name={owner?.name} url={owner?.avatar} size="md" userId={owner?._id} deco={decoClass} />
            {isOnline && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background z-10"
                style={{ background: '#00e5a0' }}
                title="Online"
              />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-text-primary text-sm truncate"><Nameplate plateKey={plateKey}><GlowName user={cosmeticsSource}>{owner?.name || 'Unknown'}</GlowName></Nameplate></p>
            <div className="flex items-center gap-2 mt-0.5">
              {owner?.location && (
                <span className="text-xs text-text-muted truncate max-w-[100px]">{owner.location}</span>
              )}
              {owner?.languages?.length > 0 && (
                <span className="text-xs text-text-muted flex items-center gap-1 truncate">
                  <Globe size={10} />
                  {owner.languages.slice(0, 2).join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {owner?.trustScore !== undefined && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                background: owner.trustScore >= 70 ? 'rgba(0,229,160,0.1)' : owner.trustScore >= 40 ? 'rgba(255,184,0,0.1)' : 'rgba(255,75,75,0.1)',
                border: `1px solid ${owner.trustScore >= 70 ? 'rgba(0,229,160,0.3)' : owner.trustScore >= 40 ? 'rgba(255,184,0,0.3)' : 'rgba(255,75,75,0.3)'}`,
                color: owner.trustScore >= 70 ? '#00e5a0' : owner.trustScore >= 40 ? '#ffb800' : '#ff4b4b',
              }}
            >
              <Star size={9} fill="currentColor" />
              {owner.trustScore}
            </div>
          )}
          {variant === 'my-skills' && isOwner && (
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all"
              disabled={deleteMutation.isPending}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Cosmic standing (this card's user) — mini badge + tier + progress.
          Single source of truth via the shared <TierProgress> (v7 §1). */}
      {owner?.cosmicStanding && (
        <div className="flex items-center gap-2 -mt-1">
          <CosmicBadge tierId={owner.cosmicStanding.tierId} size="mini" />
          <span className="text-xs font-medium text-text-secondary truncate flex-none max-w-[45%]">
            {owner.cosmicStanding.displayName}
          </span>
          <TierProgress progress={owner.cosmicStanding.progress} size="mini" className="flex-1 min-w-[56px]" />
        </div>
      )}

      {/* Skill exchange */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="pill-offer">{skill.skillOffered}</span>
        <span className="text-text-muted text-base font-light">⇄</span>
        <span className="pill-want">{skill.skillWanted}</span>
      </div>

      {/* Description */}
      {skill.description && (
        <p className="text-xs text-text-muted leading-relaxed line-clamp-2">{skill.description}</p>
      )}

      {/* Skill Mastery — teaching rank + progress (renders once ≥1 session taught) */}
      <MasteryBar mastery={skill.mastery} />

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ background: ls.bg, border: `1px solid ${ls.border}`, color: ls.color }}
          >
            {level}
          </span>
          <span className="text-xs text-text-muted">
            {skill.createdAt
              ? formatDistanceToNow(new Date(skill.createdAt), { addSuffix: true })
              : 'Recently'}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      {variant === 'browse' && !isOwner && (
        <div style={{ display: 'flex', gap: 8 }}>
          {/* View Ratings button */}
          <button
            onClick={handleViewRatings}
            title="View this person's ratings"
            style={{
              flex: '0 0 auto',
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 14px', borderRadius: 12,
              fontSize: 13, fontWeight: 600,
              background: 'rgba(255,184,0,0.08)',
              border: '1px solid rgba(255,184,0,0.28)',
              color: '#ffb800', cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            <Star size={14} fill="currentColor" /> Ratings
          </button>

          {isConnected ? (
            <>
              <span className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold"
                style={{ background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.3)', color: '#00e5a0' }}
                title="You're already connected"
              >
                <Check size={13} /> Connected
              </span>
              <button
                onClick={handleMessageClick}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all text-accent border border-accent/30 bg-accent/5 hover:bg-accent/10"
              >
                <MessageCircle size={14} /> Message
              </button>
              <button
                onClick={handleCallClick}
                className="btn-gradient flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-medium"
                title="Start a video call"
              >
                <Video size={14} />
              </button>
            </>
          ) : (
            <button
              onClick={handleConnect}
              className="btn-gradient flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium"
            >
              <UserPlus size={15} /> Connect
            </button>
          )}
        </div>
      )}

      {variant === 'match' && !isOwner && (
        <div className="flex gap-2">
          {isConnected ? (
            <button
              onClick={handleMessageClick}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all text-accent border border-accent/30 bg-accent/5 hover:bg-accent/10"
            >
              <MessageCircle size={14} /> Message
            </button>
          ) : (
            <button
              onClick={handleConnect}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all text-accent border border-accent/30 bg-accent/5 hover:bg-accent/10"
            >
              <Send size={14} /> Request
            </button>
          )}
          <button
            onClick={handleCallClick}
            disabled={!isConnected}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all border ${isConnected ? 'btn-gradient border-transparent' : 'opacity-40 cursor-not-allowed border-border-subtle bg-surface-hover'}`}
            title={isConnected ? 'Start a video call' : 'Connect first to call'}
          >
            <Video size={14} /> Call
          </button>
        </div>
      )}
    </motion.div>
  );
});

SkillCard.displayName = 'SkillCard';
export default SkillCard;
