import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Check, Loader2 } from 'lucide-react';
// V3 — haptic + sound on lesson completion (the "in-the-body" moment).
import { Haptic } from '../../soul/haptics';
import { SoulSound } from '../../soul/soundLibrary';

/**
 * LessonPlayer — frosted video player wrapper.
 *
 * Reuses the same controls idiom across courses / previews / teasers.
 * Emits `onComplete` when the video reaches 90% (so a slow loader at the
 * end doesn't punish the learner for Cloudinary's buffer flush).
 *
 * The Cloudinary URL pattern `https://res.cloudinary.com/.../video/upload/...`
 * plays directly in <video> with no extra setup. We mark complete via the
 * parent's completeLesson() call, not from inside this component.
 *
 * V3 — completion fires Haptic.medium + SoulSound.levelUp so the moment
 * lands in the body, not just on the screen.
 */
const LessonPlayer = ({ lesson, onComplete, isCompleted, isMarkingComplete }) => {
    const videoRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [muted, setMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const completeFiredRef = useRef(false);

    useEffect(() => {
        // Reset completion-fired flag when the lesson changes
        completeFiredRef.current = false;
        setProgress(0);
        setError(null);
    }, [lesson?._id]);

    const handleTimeUpdate = () => {
        const v = videoRef.current;
        if (!v || !v.duration) return;
        const pct = (v.currentTime / v.duration) * 100;
        setProgress(pct);
        if (!completeFiredRef.current && pct >= 90 && onComplete) {
            completeFiredRef.current = true;
            // V3 — the lesson-complete confirmation: haptic first (instant),
            // then the rising chord (levelUp reads the soul's voice).
            Haptic.medium();
            SoulSound.levelUp({ soul: 'student' });
            onComplete();
        }
    };

    const togglePlay = () => {
        const v = videoRef.current;
        if (!v) return;
        if (v.paused) { v.play().catch(() => {}); setPlaying(true); }
        else            { v.pause(); setPlaying(false); }
    };

    const toggleMute = () => {
        const v = videoRef.current;
        if (!v) return;
        v.muted = !v.muted;
        setMuted(v.muted);
    };

    const fullscreen = () => {
        const v = videoRef.current;
        if (v?.requestFullscreen) v.requestFullscreen().catch(() => {});
    };

    const seek = (e) => {
        const v = videoRef.current;
        if (!v || !v.duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        v.currentTime = Math.max(0, Math.min(v.duration, pct * v.duration));
    };

    if (!lesson?.videoUrl) {
        return (
            <div className="aspect-video rounded-xl bg-surface/40 border border-border-subtle flex flex-col items-center justify-center text-text-muted text-sm gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading lesson…
            </div>
        );
    }

    return (
        <div className="rounded-xl overflow-hidden bg-black border border-border-subtle shadow-2xl">
            <div className="relative aspect-video">
                <video
                    ref={videoRef}
                    src={lesson.videoUrl}
                    className="absolute inset-0 w-full h-full object-contain bg-black"
                    onTimeUpdate={handleTimeUpdate}
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                    onError={() => setError("This video failed to load.")}
                    playsInline
                />
                {error && (
                    <div className="absolute inset-0 flex items-center justify-center text-white bg-black/80">
                        {error}
                    </div>
                )}
            </div>

            <div className="px-3 py-2 bg-surface/90 backdrop-blur-sm">
                <div
                    className="relative h-1.5 rounded-full bg-border-subtle/60 overflow-hidden cursor-pointer"
                    onClick={seek}
                >
                    <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-cyan-400" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex items-center gap-2 mt-2">
                    <button onClick={togglePlay} className="p-1.5 rounded-full hover:bg-accent/15 text-text-primary" aria-label={playing ? 'Pause' : 'Play'}>
                        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button onClick={toggleMute} className="p-1.5 rounded-full hover:bg-accent/15 text-text-secondary" aria-label={muted ? 'Unmute' : 'Mute'}>
                        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <div className="ml-auto flex items-center gap-2">
                        {isCompleted ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-emerald-300">
                                <Check className="w-3.5 h-3.5" /> Complete
                            </span>
                        ) : (
                            <button
                                onClick={onComplete}
                                disabled={isMarkingComplete}
                                className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest px-2 py-1 rounded-pill bg-accent/15 text-accent border border-accent/30 hover:bg-accent/25 disabled:opacity-50"
                            >
                                {isMarkingComplete ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                Mark complete
                            </button>
                        )}
                        <button onClick={fullscreen} className="p-1.5 rounded-full hover:bg-accent/15 text-text-secondary" aria-label="Fullscreen">
                            <Maximize className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LessonPlayer;
