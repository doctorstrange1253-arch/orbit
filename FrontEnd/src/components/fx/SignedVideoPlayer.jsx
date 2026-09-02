/**
 * components/fx/SignedVideoPlayer.jsx — V3 player wrapper.
 *
 * Replaces the V2 LessonPlayer when a course is paid OR the
 * ENABLE_SIGNED_STREAM env var is on. The flow:
 *
 *   1. On mount (or when the lesson changes), call
 *      POST /api/courses/:id/lessons/:lessonId/sign to get a
 *      short-lived signed URL + a `viewKey`.
 *   2. Render the video with the signed URL.
 *   3. Mount <ForensicWatermark viewKey={...}/> and
 *      <VisibleWatermark userId={...}/> on top of the video.
 *
 * The 5-min TTL means the user can re-watch for 5 minutes. If they
 * pause and resume past 5 minutes, the player fetches a new signed
 * URL (the resume refetches on play, not on mount).
 *
 * Free lessons still go through this wrapper — the signed URL is the
 * same Cloudinary URL, just with an extra query param the player
 * ignores. The watermark + forensic layers still apply.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, RefreshCw, ShieldOff } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import ForensicWatermark from '../../soul/copyright/ForensicWatermark';
import VisibleWatermark from '../../soul/copyright/VisibleWatermark';
import AttentionArc from '../gameEngine/AttentionArc';
import { Haptic } from '../../soul/haptics';
import { SoulSound } from '../../soul/soundLibrary';

const SignedVideoPlayer = ({ lesson, onComplete, isCompleted, onSignError }) => {
  const { id, lessonId } = useParams();
  const user = useAuthStore((s) => s.user);
  const videoRef = useRef(null);
  const [signed, setSigned] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const completeFiredRef = useRef(false);

  // Fetch a signed URL. The viewKey is per-session (rotated daily).
  const fetchSigned = useCallback(async () => {
    if (!id || !lessonId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post(`/courses/${id}/lessons/${lessonId}/sign`);
      setSigned(data);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to sign stream';
      setError(msg);
      onSignError?.(msg);
    } finally {
      setLoading(false);
    }
  }, [id, lessonId, onSignError]);

  useEffect(() => {
    completeFiredRef.current = false;
    setProgress(0);
    setSigned(null);
    fetchSigned();
  }, [lessonId, fetchSigned]);

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const pct = (v.currentTime / v.duration) * 100;
    setProgress(pct);
    if (!completeFiredRef.current && pct >= 90 && onComplete) {
      completeFiredRef.current = true;
      Haptic.medium();
      SoulSound.levelUp({ soul: 'student' });
      onComplete();
    }
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play().catch(() => {}); setPlaying(true); }
    else         { v.pause(); setPlaying(false); }
  };

  // If the signed URL expires (5 min), the video element will emit an
  // error. We re-fetch on the next play.
  const onVideoError = () => {
    if (!signed) return;
    const expired = (Date.now() - (signed.expiresAt || 0)) > -1000;
    if (expired) fetchSigned();
  };

  if (loading && !signed) {
    return (
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-bg/60 flex items-center justify-center border border-border-subtle">
        <div className="inline-flex items-center gap-2 text-text-muted text-sm">
          <Loader2 size={16} className="animate-spin" /> Signing stream…
        </div>
      </div>
    );
  }

  if (error && !signed) {
    return (
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-bg/60 flex items-center justify-center border border-rose-500/30">
        <div className="text-center text-rose-200 text-sm px-4">
          <ShieldOff size={20} className="mx-auto mb-2" />
          <div>Couldn't sign the stream.</div>
          <div className="text-xs text-rose-300/70 mt-1">{error}</div>
          <button
            type="button"
            onClick={fetchSigned}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-bold uppercase tracking-widest border border-rose-500/40 text-rose-100"
          >
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (!signed) return null;

  return (
    <div className="relative aspect-video rounded-2xl overflow-hidden bg-bg/60 border border-border-subtle group">
      <video
        ref={videoRef}
        src={signed.url}
        className="w-full h-full object-contain"
        controls
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onClick={togglePlay}
        onError={onVideoError}
        playsInline
      />
      {/* V3 — copyright watermark layers. The forensic one is invisible
          (baked into the canvas pixels). The visible one fades in/out
          on a 4s/8s loop. Both are off when the user is the lesson's
          own mentor (we skip the check here for simplicity; the server
          could pass `isOwner` to skip). */}
      <ForensicWatermark viewKey={signed.viewKey} />
      <VisibleWatermark userId={user?._id} displayName={user?.name} />
      <AttentionArc videoRef={videoRef} enabled={!isCompleted} />
      {/* Loading ring overlay (the video element also shows its own) */}
      {progress > 0 && progress < 100 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-border-subtle/30">
          <div
            className="h-full transition-all"
            style={{ width: `${progress}%`, background: 'var(--accent-1)' }}
          />
        </div>
      )}
    </div>
  );
};

export default SignedVideoPlayer;
