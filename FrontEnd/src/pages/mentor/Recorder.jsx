import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  ChevronLeft, Monitor, Camera, Mic, MicOff, Video, VideoOff,
  Pen, Eraser, Trash2, Square, Circle as CircleIcon, Pause, Play,
  Save, RefreshCw, AlertTriangle, Loader2, Sparkles, Eye, EyeOff, Plus,
} from 'lucide-react';
import FuturisticBackdrop from '../../components/common/FuturisticBackdrop';
import { courses } from '../../services/courses';
import { surfaceRecipe, borderTint, tintHalo } from '../../soul/tints';
import { Haptic } from '../../soul/haptics';
import { SoulSound } from '../../soul/soundLibrary';

const STAGE = { IDLE: 'idle', COUNTDOWN: 'countdown', RECORDING: 'recording', PAUSED: 'paused', PROCESSING: 'processing', REVIEW: 'review' };
const W = 1280, H = 720;
const PENCIL_COLORS = ['#ffffff', '#fbbf24', '#22d3ee', '#a78bfa', '#f43f5e', '#34d399'];

const Recorder = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [stage, setStage] = useState(STAGE.IDLE);
  const [countdown, setCountdown] = useState(0);
  const [mode, setMode] = useState('screen+cam');
  const [sources, setSources] = useState({ screen: null, camera: null, mic: null });
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [whiteboardVisible, setWhiteboardVisible] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const screenVideoRef = useRef(null);
  const cameraVideoRef = useRef(null);
  const compositionRef = useRef(null);
  const whiteboardRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const rafIdRef = useRef(null);
  const startTsRef = useRef(0);
  const accumulatedMsRef = useRef(0);
  const drawWhilePausedRef = useRef(null);

  const { data: myCourses = [] } = useQuery({
    queryKey: ['courses', 'list', 'mentor'],
    queryFn: () => courses.list({ mentor: 'me', limit: 100 }).then((r) => r.data?.items || r.data || []),
  });

  useEffect(() => () => stopAllStreams(sources, setSources), [sources]);

  const requestSources = async () => {
    setError(null);
    const next = { screen: null, camera: null, mic: null };
    try {
      if (mode === 'screen+cam' || mode === 'screen-only') {
        const screen = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: true });
        next.screen = screen;
      }
      if (mode === 'screen+cam' || mode === 'camera-only') {
        const cam = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 180 }, audio: false });
        next.camera = cam;
      }
      const mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true }, video: false });
      next.mic = mic;
      setSources(next);
      if (screenVideoRef.current && next.screen) screenVideoRef.current.srcObject = next.screen;
      if (cameraVideoRef.current && next.camera) cameraVideoRef.current.srcObject = next.camera;
      startDrawLoop(next, false, 0, false);
    } catch (e) {
      setError(e?.message || 'Could not get screen / camera / mic access.');
    }
  };

  const startDrawLoop = useCallback((srcs, isRec, elapsed, whiteboardOn) => {
    if (!compositionRef.current) return;
    const canvas = compositionRef.current;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      if (srcs.screen && screenVideoRef.current && screenVideoRef.current.readyState >= 2) {
        ctx.drawImage(screenVideoRef.current, 0, 0, W, H);
      } else if (srcs.camera && cameraVideoRef.current && cameraVideoRef.current.readyState >= 2) {
        ctx.drawImage(cameraVideoRef.current, 0, 0, W, H);
      } else {
        ctx.fillStyle = '#0a0a14';
        ctx.fillRect(0, 0, W, H);
      }

      if (srcs.camera && cameraOn && cameraVideoRef.current && cameraVideoRef.current.readyState >= 2 && srcs.screen) {
        const pipW = W * 0.22;
        const pipH = pipW * 9 / 16;
        const pipX = W - pipW - 24;
        const pipY = H - pipH - 24;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(pipX - 4, pipY - 4, pipW + 8, pipH + 8);
        ctx.drawImage(cameraVideoRef.current, pipX, pipY, pipW, pipH);
      }

      if (whiteboardOn && whiteboardRef.current) {
        ctx.drawImage(whiteboardRef.current, 0, 0, W, H);
      }

      if (isRec) {
        const pulse = (Date.now() / 500) % 1 > 0.5 ? 0.95 : 0.5;
        ctx.fillStyle = `rgba(255, 60, 60, ${pulse})`;
        ctx.beginPath();
        ctx.arc(44, 44, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 22px JetBrains Mono, ui-monospace, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(formatTime(elapsed), 70, 52);
        if (micOn) {
          ctx.fillStyle = '#fff';
          ctx.font = '12px JetBrains Mono, monospace';
          ctx.textAlign = 'right';
          ctx.fillText('MIC', W - 16, H - 16);
        }
      }

      if (drawWhilePausedRef.current && !isRec) {
        drawWhilePausedRef.current = requestAnimationFrame(draw);
      } else if (isRec) {
        rafIdRef.current = requestAnimationFrame(draw);
      }
    };
    draw();
  }, [cameraOn, micOn]);

  useEffect(() => {
    if (stage === STAGE.RECORDING) {
      const tick = () => {
        const now = Date.now();
        const live = now - startTsRef.current;
        setElapsedMs(accumulatedMsRef.current + live);
      };
      const id = setInterval(tick, 100);
      return () => clearInterval(id);
    }
    if (stage === STAGE.PAUSED) {
      const id = setInterval(() => {}, 1000);
      return () => clearInterval(id);
    }
  }, [stage]);

  const beginCountdown = () => {
    if (!sources.screen && !sources.camera) {
      setError('Pick a source first.');
      return;
    }
    Haptic.light();
    setStage(STAGE.COUNTDOWN);
    setCountdown(3);
  };

  useEffect(() => {
    if (stage !== STAGE.COUNTDOWN) return;
    if (countdown <= 0) {
      actuallyStartRecording();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [stage, countdown]);

  const actuallyStartRecording = () => {
    if (!compositionRef.current) return;
    const canvasStream = compositionRef.current.captureStream(30);
    const audioTracks = [];
    if (micOn && sources.mic) audioTracks.push(...sources.mic.getAudioTracks());
    if (sources.screen) {
      const screenAudio = sources.screen.getAudioTracks();
      audioTracks.push(...screenAudio);
    }
    audioTracks.forEach((t) => canvasStream.addTrack(t));

    const mr = new MediaRecorder(canvasStream, { mimeType: pickMime(), videoBitsPerSecond: 4_000_000 });
    chunksRef.current = [];
    mr.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mr.mimeType });
      const url = URL.createObjectURL(blob);
      setRecordedBlob(blob);
      setRecordedUrl(url);
      setStage(STAGE.REVIEW);
    };
    mr.start(1000);
    mediaRecorderRef.current = mr;
    startTsRef.current = Date.now();
    accumulatedMsRef.current = 0;
    setElapsedMs(0);
    setStage(STAGE.RECORDING);
    startDrawLoop(sources, true, 0, whiteboardVisible);
    Haptic.medium();
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      accumulatedMsRef.current += Date.now() - startTsRef.current;
      setStage(STAGE.PAUSED);
      cancelAnimationFrame(rafIdRef.current);
      Haptic.light();
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      startTsRef.current = Date.now();
      setStage(STAGE.RECORDING);
      Haptic.light();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && (mediaRecorderRef.current.state === 'recording' || mediaRecorderRef.current.state === 'paused')) {
      mediaRecorderRef.current.stop();
      setStage(STAGE.PROCESSING);
      cancelAnimationFrame(rafIdRef.current);
      Haptic.heavy();
    }
  };

  const reset = () => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedBlob(null);
    setRecordedUrl(null);
    setElapsedMs(0);
    setStage(STAGE.IDLE);
    setError(null);
    startDrawLoop(sources, false, 0, false);
  };

  const onSaveAsLesson = async (courseId, title, description) => {
    if (!recordedBlob) return;
    const file = new File([recordedBlob], `recording-${Date.now()}.webm`, { type: recordedBlob.type });
    const data = await courses.uploadVideo(file, (pct) => setUploadProgress(pct));
    const lesson = await courses.addLesson(courseId, {
      title: title || 'New lesson',
      description: description || '',
      videoUrl: data.url,
      videoPublicId: data.publicId,
      durationSec: data.durationSec,
    });
    qc.invalidateQueries({ queryKey: ['courses', 'list'] });
    SoulSound.levelUp({ soul: 'mentor' });
    navigate(`/mentor/courses/${courseId}/lessons/${lesson._id}`);
  };

  const isLive = stage === STAGE.RECORDING || stage === STAGE.PAUSED || stage === STAGE.COUNTDOWN;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <FuturisticBackdrop />
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <Helmet><title>Recorder · Orbit Mentor</title></Helmet>

        <Link to="/mentor/courses" className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-primary mb-3">
          <ChevronLeft className="w-3.5 h-3.5" /> My courses
        </Link>

        <motion.header initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill text-[11px] font-semibold uppercase tracking-widest text-text-secondary bg-surface border border-border-subtle mb-3">
            <Video className="w-3.5 h-3.5 text-accent" /> Studio
          </div>
          <h1
            className="text-2xl md:text-3xl font-medium"
            style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--text-primary)' }}
          >
            Orbit Recorder.
          </h1>
          <p className="text-text-secondary text-sm mt-1">Screen + camera + whiteboard, composed in the browser, saved as a lesson.</p>
        </motion.header>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200 inline-flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {error}
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_320px] gap-5">
          <div className="rounded-2xl p-3" style={{ ...surfaceRecipe('mentor'), border: borderTint({ from: '#a78bfa', to: '#3b82f6' }, 24) }}>
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
              <video ref={screenVideoRef} autoPlay muted playsInline className="hidden" />
              <video ref={cameraVideoRef} autoPlay muted playsInline className="hidden" />
              <canvas ref={compositionRef} className="w-full h-full block" />
              <canvas
                ref={whiteboardRef}
                width={W}
                height={H}
                onMouseDown={(e) => beginWhiteboardStroke(e, whiteboardRef, whiteboardVisible)}
                onMouseMove={(e) => extendWhiteboardStroke(e, whiteboardRef, whiteboardVisible)}
                onMouseUp={() => endWhiteboardStroke(whiteboardRef)}
                onMouseLeave={() => endWhiteboardStroke(whiteboardRef)}
                onTouchStart={(e) => beginWhiteboardStroke(e.touches[0], whiteboardRef, whiteboardVisible)}
                onTouchMove={(e) => { e.preventDefault(); extendWhiteboardStroke(e.touches[0], whiteboardRef, whiteboardVisible); }}
                onTouchEnd={() => endWhiteboardStroke(whiteboardRef)}
                className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                style={{ pointerEvents: whiteboardVisible ? 'auto' : 'none' }}
              />

              <AnimatePresence>
                {stage === STAGE.COUNTDOWN && (
                  <motion.div
                    key={countdown}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.4 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{ background: 'rgba(0,0,0,0.4)' }}
                  >
                    <div className="text-[160px] font-black text-white leading-none" style={{ fontFamily: 'var(--font-serif)', textShadow: '0 4px 32px rgba(0,0,0,0.6)' }}>
                      {countdown}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {stage === STAGE.IDLE && !sources.screen && !sources.camera && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Monitor className="w-10 h-10 text-text-muted mx-auto mb-2" />
                    <div className="text-text-secondary text-sm">Pick a mode on the right to grant access.</div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setWhiteboardVisible((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-[11px] font-bold uppercase tracking-widest border ${
                  whiteboardVisible ? 'bg-accent/15 text-accent border-accent/40' : 'bg-surface/40 text-text-muted border-border-subtle'
                }`}
              >
                {whiteboardVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                Whiteboard
              </button>
              <div className="flex items-center gap-1 ml-2">
                {PENCIL_COLORS.map((c) => (
                  <WhiteboardColorSwatch key={c} color={c} whiteboardRef={whiteboardRef} />
                ))}
              </div>
              <button
                onClick={() => clearWhiteboard(whiteboardRef)}
                className="ml-auto inline-flex items-center gap-1 text-[10px] text-text-muted hover:text-rose-300 uppercase tracking-widest font-bold"
                title="Clear whiteboard"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl p-4" style={{ ...surfaceRecipe('mentor'), border: borderTint({ from: '#a78bfa', to: '#3b82f6' }, 24) }}>
              <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Source</div>
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                {[
                  { id: 'screen+cam', label: 'Screen + Cam', Icon: Monitor },
                  { id: 'screen-only', label: 'Screen only', Icon: Monitor },
                  { id: 'camera-only', label: 'Camera only', Icon: Camera },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${
                      mode === m.id ? 'bg-accent/15 text-accent border-accent/40' : 'bg-surface/40 text-text-muted border-border-subtle'
                    }`}
                  >
                    <m.Icon className="w-3.5 h-3.5" />
                    {m.label}
                  </button>
                ))}
              </div>
              {stage === STAGE.IDLE && (
                <button
                  onClick={requestSources}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-pill text-sm font-bold uppercase tracking-widest text-text-on-accent"
                  style={{ background: 'linear-gradient(135deg, #a78bfa, #3b82f6)' }}
                >
                  <Monitor className="w-4 h-4" /> Grant access
                </button>
              )}

              {(sources.camera || sources.screen) && (
                <div className="mt-3 space-y-2">
                  {sources.camera && (
                    <ToggleRow
                      Icon={cameraOn ? Video : VideoOff}
                      label="Camera"
                      on={cameraOn}
                      onToggle={() => setCameraOn((v) => !v)}
                    />
                  )}
                  {sources.mic && (
                    <ToggleRow
                      Icon={micOn ? Mic : MicOff}
                      label="Microphone"
                      on={micOn}
                      onToggle={() => setMicOn((v) => !v)}
                    />
                  )}
                </div>
              )}
            </div>

            <div className="rounded-2xl p-4" style={{ ...surfaceRecipe('mentor'), border: borderTint({ from: '#a78bfa', to: '#3b82f6' }, 24) }}>
              <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Controls</div>
              <div className="font-mono text-3xl font-black tabular-nums text-text-primary text-center my-2">
                {formatTime(elapsedMs)}
              </div>
              <div className="flex flex-col gap-2">
                {stage === STAGE.IDLE && (
                  <button
                    onClick={beginCountdown}
                    disabled={!sources.screen && !sources.camera}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-pill text-sm font-bold uppercase tracking-widest text-text-on-accent disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #f43f5e, #fbbf24)', boxShadow: tintHalo({ from: '#f43f5e', to: '#fbbf24' }, 24) }}
                  >
                    <CircleIcon className="w-4 h-4 fill-current" /> Start
                  </button>
                )}
                {stage === STAGE.RECORDING && (
                  <>
                    <button onClick={pauseRecording} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-pill bg-surface/40 border border-border-subtle text-sm font-bold uppercase tracking-widest text-text-primary">
                      <Pause className="w-4 h-4" /> Pause
                    </button>
                    <button onClick={stopRecording} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-pill bg-rose-500/20 border border-rose-500/40 text-sm font-bold uppercase tracking-widest text-rose-200">
                      <Square className="w-4 h-4 fill-current" /> Stop
                    </button>
                  </>
                )}
                {stage === STAGE.PAUSED && (
                  <>
                    <button onClick={resumeRecording} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-pill bg-emerald-500/20 border border-emerald-500/40 text-sm font-bold uppercase tracking-widest text-emerald-200">
                      <Play className="w-4 h-4" /> Resume
                    </button>
                    <button onClick={stopRecording} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-pill bg-rose-500/20 border border-rose-500/40 text-sm font-bold uppercase tracking-widest text-rose-200">
                      <Square className="w-4 h-4 fill-current" /> Stop
                    </button>
                  </>
                )}
                {stage === STAGE.PROCESSING && (
                  <div className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-pill bg-surface/40 border border-border-subtle text-sm font-bold uppercase tracking-widest text-text-secondary">
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing…
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {stage === STAGE.REVIEW && recordedUrl && (
          <ReviewPanel
            recordedUrl={recordedUrl}
            recordedBlob={recordedBlob}
            durationMs={elapsedMs}
            myCourses={myCourses}
            onSave={onSaveAsLesson}
            onReRecord={reset}
            uploadProgress={uploadProgress}
          />
        )}
      </div>
    </div>
  );
};

const ReviewPanel = ({ recordedUrl, recordedBlob, durationMs, myCourses, onSave, onReRecord, uploadProgress }) => {
  const [courseId, setCourseId] = useState(myCourses[0]?._id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    if (!courseId) { setError('Pick a course.'); return; }
    setSaving(true);
    setError(null);
    try {
      await onSave(courseId, title.trim(), description.trim());
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 rounded-2xl p-5"
      style={{ ...surfaceRecipe('mentor'), border: borderTint({ from: '#a78bfa', to: '#3b82f6' }, 24) }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-accent" />
        <h2 className="text-lg font-medium" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
          Review your recording.
        </h2>
        <span className="ml-auto text-xs text-text-muted font-mono">{formatTime(durationMs)} · {(recordedBlob.size / 1024 / 1024).toFixed(1)} MB</span>
      </div>

      <video src={recordedUrl} controls className="w-full aspect-video rounded-xl bg-black mb-4" />

      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <Field label="Course">
            <select value={courseId} onChange={(e) => setCourseId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-bg/50 border border-border-subtle text-text-primary">
              <option value="">— Pick a course —</option>
              {myCourses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
          </Field>
          <Field label="Lesson title">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What this lesson teaches…"
              className="w-full px-3 py-2 rounded-lg bg-bg/50 border border-border-subtle text-text-primary" />
          </Field>
          <Field label="Description (optional)">
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-bg/50 border border-border-subtle text-sm text-text-primary resize-none" />
          </Field>
          {error && <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-xs text-rose-200 mb-2">{error}</div>}
          {saving && uploadProgress > 0 && (
            <div className="text-[10px] text-text-muted mb-2">Uploading: {uploadProgress}%</div>
          )}
          <div className="flex items-center gap-2 mt-3">
            <button onClick={submit} disabled={saving || !courseId}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-pill bg-accent/15 text-accent border border-accent/30 text-xs font-bold uppercase tracking-widest disabled:opacity-40">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? 'Saving…' : 'Save as lesson'}
            </button>
            <button onClick={onReRecord}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-pill bg-surface/40 border border-border-subtle text-xs font-bold uppercase tracking-widest text-text-secondary">
              <RefreshCw className="w-3.5 h-3.5" /> Re-record
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

const ToggleRow = ({ Icon, label, on, onToggle }) => (
  <button onClick={onToggle} className="w-full flex items-center gap-2 p-2 rounded-lg bg-surface/30 border border-border-subtle text-left">
    <Icon className={`w-3.5 h-3.5 ${on ? 'text-emerald-300' : 'text-text-muted'}`} />
    <span className="text-xs font-bold flex-1">{label}</span>
    <span className={`text-[10px] font-black uppercase tracking-widest ${on ? 'text-emerald-300' : 'text-text-muted'}`}>{on ? 'on' : 'off'}</span>
  </button>
);

const Field = ({ label, children }) => (
  <label className="block mb-2">
    <span className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">{label}</span>
    {children}
  </label>
);

const WhiteboardColorSwatch = ({ color, whiteboardRef }) => {
  const setColor = () => {
    if (!whiteboardRef.current) return;
    whiteboardRef.current.dataset.color = color;
  };
  return (
    <button
      onClick={setColor}
      className="w-5 h-5 rounded-full border-2 border-white/30 hover:border-white/80 transition"
      style={{ background: color }}
      title={color}
    />
  );
};

function stopAllStreams(srcs, setSources) {
  Object.values(srcs).forEach((stream) => {
    if (stream) stream.getTracks().forEach((t) => t.stop());
  });
}

function formatTime(ms) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function pickMime() {
  const candidates = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
  for (const m of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) return m;
  }
  return '';
}

const strokeState = { drawing: false, last: null };

function boardCoords(e, ref) {
  const rect = ref.current.getBoundingClientRect();
  const sx = ref.current.width / rect.width;
  const sy = ref.current.height / rect.height;
  return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
}

function beginWhiteboardStroke(e, ref, visible) {
  if (!visible || !ref.current) return;
  ref.current.dataset.color = ref.current.dataset.color || '#ffffff';
  strokeState.drawing = true;
  strokeState.last = boardCoords(e, ref);
}
function extendWhiteboardStroke(e, ref, visible) {
  if (!visible || !ref.current || !strokeState.drawing) return;
  const ctx = ref.current.getContext('2d');
  const next = boardCoords(e, ref);
  ctx.strokeStyle = ref.current.dataset.color || '#ffffff';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(strokeState.last.x, strokeState.last.y);
  ctx.lineTo(next.x, next.y);
  ctx.stroke();
  strokeState.last = next;
}
function endWhiteboardStroke(ref) {
  strokeState.drawing = false;
  strokeState.last = null;
}
function clearWhiteboard(ref) {
  if (!ref.current) return;
  const ctx = ref.current.getContext('2d');
  ctx.clearRect(0, 0, ref.current.width, ref.current.height);
}

export default Recorder;
