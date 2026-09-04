import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  ChevronLeft, Monitor, Camera, Mic, MicOff, Video, VideoOff,
  Trash2, Square, Circle as CircleIcon, Pause, Play, Bookmark,
  Scissors, AlertTriangle, Loader2, Eye, EyeOff, X, Columns2, User, PictureInPicture2,
} from 'lucide-react';
import FuturisticBackdrop from '../../components/common/FuturisticBackdrop';
import Teleprompter from '../../components/mentor/Teleprompter';
import RecorderReview from '../../components/mentor/RecorderReview';
import { courses } from '../../services/courses';
import { Haptic } from '../../soul/haptics';
import { SoulSound } from '../../soul/soundLibrary';
import { LAYOUTS, LAYOUT_LABEL, LAYOUT_TRANSITION_MS, resolveLayout, blendLayouts, drawCover, buildScript } from '../../studio/recorderStage';
import { addCut, cutTotal } from '../../studio/cuts';

const STAGE = { IDLE: 'idle', COUNTDOWN: 'countdown', RECORDING: 'recording', PAUSED: 'paused', PROCESSING: 'processing', REVIEW: 'review' };
const W = 1280, H = 720;
const RETAKE_SECONDS = 20;
const PENCIL_COLORS = ['#ffffff', '#fbbf24', '#22d3ee', '#a78bfa', '#f43f5e', '#34d399'];

const MICRO = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.56rem',
  letterSpacing: '0.16em',
  fontWeight: 700,
  textTransform: 'uppercase',
};

const LAYOUT_ICON = { solo: User, screen: Monitor, split: Columns2, spotlight: PictureInPicture2 };

const HAIRLINE = '1px solid rgba(255,255,255,0.12)';

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
  const [layout, setLayout] = useState('spotlight');
  const [parts, setParts] = useState([]);
  const [marks, setMarks] = useState([]);
  const [cuts, setCuts] = useState([]);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState({ index: 0, total: 0, pct: 0 });
  const [prompterOpen, setPrompterOpen] = useState(false);
  const [tpCourseId, setTpCourseId] = useState('');
  const [tpLessonId, setTpLessonId] = useState('');
  const [script, setScript] = useState('');

  const screenVideoRef = useRef(null);
  const cameraVideoRef = useRef(null);
  const compositionRef = useRef(null);
  const whiteboardRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const captureStreamRef = useRef(null);
  const chunksRef = useRef([]);
  const rafIdRef = useRef(null);
  const startTsRef = useRef(0);
  const accumulatedMsRef = useRef(0);
  const partStartMsRef = useRef(0);
  const partSeqRef = useRef(0);
  const partsRef = useRef([]);
  const cutsRef = useRef([]);
  const finalizeRef = useRef(true);
  const resumeAfterCycleRef = useRef(false);
  const loopingRef = useRef(false);
  const sourcesRef = useRef(sources);
  const cameraOnRef = useRef(true);
  const micOnRef = useRef(true);
  const whiteboardVisibleRef = useRef(false);
  const layoutRef = useRef({ from: 'spotlight', to: 'spotlight', at: 0 });
  const stageRef = useRef(STAGE.IDLE);
  const noticeTimerRef = useRef(null);

  useEffect(() => { sourcesRef.current = sources; }, [sources]);
  useEffect(() => { cameraOnRef.current = cameraOn; }, [cameraOn]);
  useEffect(() => { stageRef.current = stage; }, [stage]);
  useEffect(() => { whiteboardVisibleRef.current = whiteboardVisible; }, [whiteboardVisible]);
  useEffect(() => {
    micOnRef.current = micOn;
    sourcesRef.current.mic?.getAudioTracks().forEach((t) => { t.enabled = micOn; });
  }, [micOn]);

  const flash = useCallback((message) => {
    setNotice(message);
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => setNotice(null), 2600);
  }, []);

  const { data: myCourses = [] } = useQuery({
    queryKey: ['courses', 'list', 'mentor'],
    queryFn: () => courses.list({ mentor: 'me', limit: 100 }).then((r) => r?.items || []),
  });

  const { data: tpCourse } = useQuery({
    queryKey: ['courses', 'detail', tpCourseId],
    queryFn: () => courses.detail(tpCourseId),
    enabled: !!tpCourseId,
  });

  const tpLessons = useMemo(() => (tpCourse?.lessons || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0)), [tpCourse]);

  const pickPrompterLesson = (lessonId) => {
    setTpLessonId(lessonId);
    const lesson = tpLessons.find((l) => String(l._id) === lessonId);
    if (lesson) setScript(buildScript(lesson));
  };

  useEffect(() => () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (_stopErr) { void _stopErr; }
    }
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    partsRef.current.forEach((p) => URL.revokeObjectURL(p.url));
    loopingRef.current = false;
    stopAllStreams(sourcesRef.current);
  }, []);

  const startDrawLoop = useCallback(() => {
    if (!compositionRef.current || loopingRef.current) return;
    const canvas = compositionRef.current;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    loopingRef.current = true;

    const draw = () => {
      if (!loopingRef.current) return;
      const srcs = sourcesRef.current;
      const hasScreen = !!srcs.screen;
      const hasCamera = !!srcs.camera && cameraOnRef.current;
      const L = layoutRef.current;
      const p = L.at ? Math.min(1, (Date.now() - L.at) / LAYOUT_TRANSITION_MS) : 1;
      const rects = blendLayouts(
        resolveLayout(L.from, { hasScreen, hasCamera }),
        resolveLayout(L.to, { hasScreen, hasCamera }),
        p,
      );

      ctx.fillStyle = '#07070f';
      ctx.fillRect(0, 0, W, H);
      drawCover(ctx, screenVideoRef.current, rects.screen, W, H);
      if (hasCamera) drawCover(ctx, cameraVideoRef.current, rects.camera, W, H);
      if (whiteboardVisibleRef.current && whiteboardRef.current) ctx.drawImage(whiteboardRef.current, 0, 0, W, H);

      rafIdRef.current = requestAnimationFrame(draw);
    };
    rafIdRef.current = requestAnimationFrame(draw);
  }, []);

  const requestSources = async () => {
    setError(null);
    const next = { screen: null, camera: null, mic: null };
    try {
      if (mode === 'screen+cam' || mode === 'screen-only') {
        next.screen = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: true });
      }
      if (mode === 'screen+cam' || mode === 'camera-only') {
        next.camera = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: false });
      }
      next.mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true }, video: false });
      next.mic.getAudioTracks().forEach((t) => { t.enabled = micOnRef.current; });
      sourcesRef.current = next;
      setSources(next);
      if (screenVideoRef.current && next.screen) screenVideoRef.current.srcObject = next.screen;
      if (cameraVideoRef.current && next.camera) cameraVideoRef.current.srcObject = next.camera;
      const initial = next.screen ? (next.camera ? 'spotlight' : 'screen') : 'solo';
      layoutRef.current = { from: initial, to: initial, at: 0 };
      setLayout(initial);
      startDrawLoop();
    } catch (e) {
      stopAllStreams(next);
      setError(e?.message || 'Could not get screen / camera / mic access.');
    }
  };

  const elapsedNow = useCallback(() => {
    const mr = mediaRecorderRef.current;
    const live = mr && mr.state === 'recording' ? Date.now() - startTsRef.current : 0;
    return accumulatedMsRef.current + live;
  }, []);

  useEffect(() => {
    if (stage !== STAGE.RECORDING) return undefined;
    const id = setInterval(() => setElapsedMs(accumulatedMsRef.current + (Date.now() - startTsRef.current)), 100);
    return () => clearInterval(id);
  }, [stage]);

  const collectPart = useCallback((mr) => {
    const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'video/webm' });
    chunksRef.current = [];
    if (!blob.size) return;
    partSeqRef.current += 1;
    const at = elapsedNow();
    const part = {
      id: `part-${partSeqRef.current}`,
      blob,
      url: URL.createObjectURL(blob),
      durationMs: Math.max(0, at - partStartMsRef.current),
      cuts: cutsRef.current,
      title: '',
    };
    partsRef.current = [...partsRef.current, part];
    setParts(partsRef.current);
    cutsRef.current = [];
    setCuts([]);
    partStartMsRef.current = at;
  }, [elapsedNow]);

  const collectPartRef = useRef(collectPart);
  useEffect(() => { collectPartRef.current = collectPart; }, [collectPart]);
  const beginPartRef = useRef(null);

  const ensureCaptureStream = useCallback(() => {
    if (captureStreamRef.current) return captureStreamRef.current;
    if (!compositionRef.current) return null;
    const stream = compositionRef.current.captureStream(30);
    const srcs = sourcesRef.current;
    const audio = [
      ...(srcs.mic ? srcs.mic.getAudioTracks() : []),
      ...(srcs.screen ? srcs.screen.getAudioTracks() : []),
    ];
    audio.forEach((t) => stream.addTrack(t));
    captureStreamRef.current = stream;
    return stream;
  }, []);

  const beginPart = useCallback(() => {
    const stream = ensureCaptureStream();
    if (!stream) return;
    const mime = pickMime();
    const mr = mime
      ? new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 4_000_000 })
      : new MediaRecorder(stream, { videoBitsPerSecond: 4_000_000 });
    chunksRef.current = [];
    mr.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onerror = (e) => {
      setError(e?.error?.message || 'Recorder error');
      setStage(STAGE.IDLE);
      Haptic.denied?.();
    };
    mr.onstop = () => {
      collectPartRef.current(mr);
      if (finalizeRef.current) {
        setStage(partsRef.current.length ? STAGE.REVIEW : STAGE.IDLE);
        return;
      }
      beginPartRef.current?.();
      if (resumeAfterCycleRef.current) {
        resumeAfterCycleRef.current = false;
        try { mediaRecorderRef.current?.pause(); } catch (_pauseErr) { void _pauseErr; }
      }
    };
    mediaRecorderRef.current = mr;
    mr.start(1000);
  }, [ensureCaptureStream]);

  useEffect(() => { beginPartRef.current = beginPart; }, [beginPart]);

  const beginCountdown = () => {
    if (!sources.screen && !sources.camera) {
      setError('Pick a source first.');
      return;
    }
    Haptic.light();
    setStage(STAGE.COUNTDOWN);
    setCountdown(3);
  };

  const actuallyStartRecording = useCallback(() => {
    if (!compositionRef.current) return;
    try {
      startDrawLoop();
      finalizeRef.current = false;
      startTsRef.current = Date.now();
      accumulatedMsRef.current = 0;
      partStartMsRef.current = 0;
      partSeqRef.current = 0;
      partsRef.current = [];
      cutsRef.current = [];
      setParts([]);
      setCuts([]);
      setMarks([]);
      setElapsedMs(0);
      setStage(STAGE.RECORDING);
      beginPart();
      Haptic.medium();
    } catch (e) {
      setError(e?.message || 'Could not start recording (codec unsupported?).');
      setStage(STAGE.IDLE);
      Haptic.denied?.();
    }
  }, [beginPart, startDrawLoop]);

  useEffect(() => {
    if (stage !== STAGE.COUNTDOWN) return undefined;
    if (countdown <= 0) {
      actuallyStartRecording();
      return undefined;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [stage, countdown, actuallyStartRecording]);

  const pauseRecording = useCallback(() => {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state === 'recording') {
      mr.pause();
      accumulatedMsRef.current += Date.now() - startTsRef.current;
      setElapsedMs(accumulatedMsRef.current);
      setStage(STAGE.PAUSED);
      Haptic.light();
    }
  }, []);

  const resumeRecording = useCallback(() => {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state === 'paused') {
      mr.resume();
      startTsRef.current = Date.now();
      setStage(STAGE.RECORDING);
      Haptic.light();
    }
  }, []);

  const stopRecording = useCallback(() => {
    const mr = mediaRecorderRef.current;
    if (mr && (mr.state === 'recording' || mr.state === 'paused')) {
      accumulatedMsRef.current = elapsedNow();
      finalizeRef.current = true;
      mr.stop();
      setStage(STAGE.PROCESSING);
      Haptic.heavy();
    }
  }, [elapsedNow]);

  const markChapter = useCallback(() => {
    const mr = mediaRecorderRef.current;
    if (!mr || (mr.state !== 'recording' && mr.state !== 'paused')) return;
    const boundary = elapsedNow();
    if (boundary - partStartMsRef.current < 1000) {
      flash('A chapter needs at least a second in it.');
      return;
    }
    if (mr.state === 'recording') {
      accumulatedMsRef.current = boundary;
      startTsRef.current = Date.now();
    }
    resumeAfterCycleRef.current = mr.state === 'paused';
    finalizeRef.current = false;
    setMarks((m) => [...m, boundary]);
    mr.stop();
    Haptic.medium();
    SoulSound.pageFlip?.();
    flash(`Chapter ${partsRef.current.length + 1} closed — keep going.`);
  }, [elapsedNow, flash]);

  const retakeLast = useCallback(() => {
    const mr = mediaRecorderRef.current;
    if (!mr || (mr.state !== 'recording' && mr.state !== 'paused')) return;
    const partMs = elapsedNow() - partStartMsRef.current;
    if (partMs < 1200) {
      flash('Nothing to retake yet.');
      return;
    }
    const to = partMs / 1000;
    const from = Math.max(0, to - RETAKE_SECONDS);
    cutsRef.current = addCut(cutsRef.current, from, to);
    setCuts(cutsRef.current);
    Haptic.heavy();
    flash(`Cut the last ${Math.round(to - from)}s — say it again from where you were.`);
  }, [elapsedNow, flash]);

  const dropCut = (index) => {
    cutsRef.current = cutsRef.current.filter((_, i) => i !== index);
    setCuts(cutsRef.current);
  };

  const changeLayout = useCallback((next) => {
    if (!LAYOUTS.includes(next)) return;
    const cur = layoutRef.current;
    if (cur.to === next) return;
    layoutRef.current = { from: cur.to, to: next, at: Date.now() };
    setLayout(next);
    Haptic.light();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      const el = e.target;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement || el?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const live = stageRef.current === STAGE.RECORDING || stageRef.current === STAGE.PAUSED;
      if (e.key >= '1' && e.key <= '4') { changeLayout(LAYOUTS[Number(e.key) - 1]); return; }
      const k = e.key.toLowerCase();
      if (k === 'm' && live) { markChapter(); return; }
      if (k === 'r' && live) { retakeLast(); return; }
      if (k === 't') { setPrompterOpen((v) => !v); return; }
      if (k === 'b') { setWhiteboardVisible((v) => !v); return; }
      if (e.key === ' ' && live) {
        e.preventDefault();
        if (stageRef.current === STAGE.RECORDING) pauseRecording();
        else resumeRecording();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [changeLayout, markChapter, retakeLast, pauseRecording, resumeRecording]);

  const reset = () => {
    partsRef.current.forEach((p) => URL.revokeObjectURL(p.url));
    partsRef.current = [];
    cutsRef.current = [];
    setParts([]);
    setCuts([]);
    setMarks([]);
    setElapsedMs(0);
    setProgress({ index: 0, total: 0, pct: 0 });
    setStage(STAGE.IDLE);
    setError(null);
    startDrawLoop();
  };

  const onSaveParts = async (courseId, items) => {
    setSaving(true);
    try {
      let firstLessonId = null;
      for (let i = 0; i < items.length; i += 1) {
        const part = items[i];
        setProgress({ index: i, total: items.length, pct: 0 });
        const file = new File([part.blob], `orbit-recording-${i + 1}.webm`, { type: part.blob.type || 'video/webm' });
        const data = await courses.uploadVideo(file, (pct) => setProgress({ index: i, total: items.length, pct }));
        const lesson = await courses.addLesson(courseId, {
          title: part.title,
          description: part.description,
          videoUrl: data.url,
          videoPublicId: data.publicId,
          durationSec: Math.round(data.durationSec || part.durationMs / 1000),
          cuts: part.cuts || [],
        });
        if (!firstLessonId) firstLessonId = lesson._id;
      }
      qc.invalidateQueries({ queryKey: ['courses', 'list'] });
      qc.invalidateQueries({ queryKey: ['courses', 'detail', courseId] });
      SoulSound.levelUp({ soul: 'mentor' });
      navigate(`/mentor/courses/${courseId}/lessons/${firstLessonId}`);
    } finally {
      setSaving(false);
    }
  };

  const live = stage === STAGE.RECORDING || stage === STAGE.PAUSED;
  const partElapsedMs = Math.max(0, elapsedMs - (marks[marks.length - 1] || 0));
  const hasSource = !!sources.screen || !!sources.camera;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <FuturisticBackdrop />
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <Helmet><title>Recorder · Orbit Mentor</title></Helmet>

        <Link to="/mentor/courses" className="inline-flex items-center gap-1 mb-4" style={{ ...MICRO, color: 'var(--text-muted)' }}>
          <ChevronLeft className="w-3.5 h-3.5" /> My courses
        </Link>

        <motion.header initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div style={{ ...MICRO, color: 'var(--text-muted)' }}>The studio</div>
          <h1 className="text-2xl md:text-3xl mt-1.5" style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}>
            Orbit Recorder
          </h1>
          <p className="text-sm mt-1.5 max-w-xl" style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-secondary)' }}>
            Screen, camera and whiteboard composed in the browser. Mark chapters as you talk and each one saves as its own lesson.
          </p>
          <div className="h-px w-full mt-5" style={{ background: 'rgba(255,255,255,0.12)' }} />
        </motion.header>

        {error && (
          <div className="mb-4 px-3 py-2 inline-flex items-center gap-2 text-sm" style={{ border: '1px solid rgba(244,63,94,0.4)', color: '#fecdd3' }}>
            <AlertTriangle className="w-4 h-4" /> {error}
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          <div>
            <div className="relative w-full aspect-video overflow-hidden bg-black" style={{ border: HAIRLINE }}>
              <video ref={screenVideoRef} autoPlay muted playsInline style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none', left: 0, top: 0 }} />
              <video ref={cameraVideoRef} autoPlay muted playsInline style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none', left: 0, top: 0 }} />
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

              {live && (
                <div className="absolute top-3 left-3 flex items-center gap-2 px-2 py-1" style={{ background: 'rgba(6,8,16,0.78)' }}>
                  <motion.span
                    animate={{ opacity: stage === STAGE.RECORDING ? [1, 0.25, 1] : 0.4 }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                    className="w-2 h-2 rounded-full"
                    style={{ background: '#f43f5e' }}
                  />
                  <span style={{ ...MICRO, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
                    {stage === STAGE.PAUSED ? 'Paused' : 'Rec'} {formatTime(elapsedMs)}
                  </span>
                  {!micOn && <MicOff className="w-3 h-3" style={{ color: '#fda4af' }} />}
                </div>
              )}

              {live && (
                <div className="absolute top-3 right-3 px-2 py-1" style={{ background: 'rgba(6,8,16,0.78)' }}>
                  <span style={{ ...MICRO, color: '#fff' }}>{LAYOUT_LABEL[layout]}</span>
                </div>
              )}

              {prompterOpen && <Teleprompter text={script} onClose={() => setPrompterOpen(false)} />}

              <AnimatePresence>
                {notice && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute left-1/2 -translate-x-1/2 bottom-4 px-3 py-1.5 z-30"
                    style={{ background: 'rgba(6,8,16,0.92)', border: HAIRLINE }}
                  >
                    <span style={{ ...MICRO, color: 'var(--text-primary)' }}>{notice}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {stage === STAGE.COUNTDOWN && (
                  <motion.div
                    key={countdown}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.4 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                    style={{ background: 'rgba(0,0,0,0.42)' }}
                  >
                    <div className="leading-none" style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 150, color: '#fff' }}>
                      {countdown}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {stage === STAGE.IDLE && !hasSource && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Monitor className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                    <div className="text-sm" style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-secondary)' }}>
                      Pick a source on the right to grant access.
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-1 flex-wrap">
              {LAYOUTS.map((id, i) => {
                const Icon = LAYOUT_ICON[id];
                const active = layout === id;
                return (
                  <button
                    key={id}
                    onClick={() => changeLayout(id)}
                    title={`${LAYOUT_LABEL[id]} — press ${i + 1}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5"
                    style={{
                      ...MICRO,
                      color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                      background: 'transparent',
                      border: `1px solid ${active ? 'rgba(255,255,255,0.36)' : 'rgba(255,255,255,0.12)'}`,
                      cursor: 'pointer',
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" /> {LAYOUT_LABEL[id]}
                    <span style={{ opacity: 0.5 }}>{i + 1}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setWhiteboardVisible((v) => !v)}
                className="inline-flex items-center gap-1.5"
                style={{ ...MICRO, color: whiteboardVisible ? 'var(--accent)' : 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                {whiteboardVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />} Whiteboard
                <span style={{ opacity: 0.5 }}>B</span>
              </button>
              <div className="flex items-center gap-1">
                {PENCIL_COLORS.map((c) => (
                  <WhiteboardColorSwatch key={c} color={c} whiteboardRef={whiteboardRef} />
                ))}
              </div>
              <button
                onClick={() => clearWhiteboard(whiteboardRef)}
                className="inline-flex items-center gap-1 ml-auto"
                style={{ ...MICRO, color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <section>
              <SectionLabel>Source</SectionLabel>
              <div className="grid grid-cols-3 gap-1 mb-3">
                {[
                  { id: 'screen+cam', label: 'Both', Icon: Monitor },
                  { id: 'screen-only', label: 'Screen', Icon: Monitor },
                  { id: 'camera-only', label: 'Camera', Icon: Camera },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    disabled={live}
                    className="flex flex-col items-center gap-1 py-2 disabled:opacity-40"
                    style={{
                      ...MICRO,
                      color: mode === m.id ? 'var(--text-primary)' : 'var(--text-muted)',
                      background: 'transparent',
                      border: `1px solid ${mode === m.id ? 'rgba(255,255,255,0.36)' : 'rgba(255,255,255,0.12)'}`,
                      cursor: live ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <m.Icon className="w-3.5 h-3.5" />
                    {m.label}
                  </button>
                ))}
              </div>
              {stage === STAGE.IDLE && (
                <button
                  onClick={requestSources}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5"
                  style={{ ...MICRO, color: 'var(--text-primary)', background: 'transparent', border: '1px solid rgba(255,255,255,0.36)', cursor: 'pointer' }}
                >
                  <Monitor className="w-3.5 h-3.5" /> {hasSource ? 'Re-pick source' : 'Grant access'}
                </button>
              )}
              {hasSource && (
                <div className="mt-3 space-y-1.5">
                  {sources.camera && <ToggleRow Icon={cameraOn ? Video : VideoOff} label="Camera" on={cameraOn} onToggle={() => setCameraOn((v) => !v)} />}
                  {sources.mic && <ToggleRow Icon={micOn ? Mic : MicOff} label="Microphone" on={micOn} onToggle={() => setMicOn((v) => !v)} />}
                </div>
              )}
            </section>

            <section>
              <SectionLabel>Controls</SectionLabel>
              <div className="text-center my-3" style={{ fontFamily: 'var(--font-serif)', fontSize: 34, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                {formatTime(elapsedMs)}
              </div>
              <div className="flex flex-col gap-1.5">
                {stage === STAGE.IDLE && (
                  <StudioButton onClick={beginCountdown} disabled={!hasSource} tone="danger">
                    <CircleIcon className="w-3.5 h-3.5 fill-current" /> Start recording
                  </StudioButton>
                )}
                {stage === STAGE.RECORDING && (
                  <StudioButton onClick={pauseRecording}><Pause className="w-3.5 h-3.5" /> Pause <Key>space</Key></StudioButton>
                )}
                {stage === STAGE.PAUSED && (
                  <StudioButton onClick={resumeRecording} tone="go"><Play className="w-3.5 h-3.5" /> Resume <Key>space</Key></StudioButton>
                )}
                {live && (
                  <>
                    <StudioButton onClick={markChapter}><Bookmark className="w-3.5 h-3.5" /> Mark chapter <Key>M</Key></StudioButton>
                    <StudioButton onClick={retakeLast}><Scissors className="w-3.5 h-3.5" /> Retake last {RETAKE_SECONDS}s <Key>R</Key></StudioButton>
                    <StudioButton onClick={stopRecording} tone="danger"><Square className="w-3.5 h-3.5 fill-current" /> Stop</StudioButton>
                  </>
                )}
                {stage === STAGE.PROCESSING && (
                  <div className="inline-flex items-center justify-center gap-2 py-2.5" style={{ ...MICRO, color: 'var(--text-secondary)', border: HAIRLINE }}>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing…
                  </div>
                )}
              </div>

              {live && (
                <div className="mt-4 space-y-1" style={{ ...MICRO, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                  <div className="flex items-baseline justify-between">
                    <span>Chapter {parts.length + 1}</span>
                    <span>{formatTime(partElapsedMs)}</span>
                  </div>
                  {cutTotal(cuts) > 0 && (
                    <div className="flex items-baseline justify-between" style={{ color: 'var(--accent)' }}>
                      <span>Cut from this chapter</span>
                      <span>{Math.round(cutTotal(cuts))}s</span>
                    </div>
                  )}
                </div>
              )}
            </section>

            {(marks.length > 0 || cuts.length > 0) && (
              <section>
                <SectionLabel>This take</SectionLabel>
                <div className="space-y-1.5">
                  {marks.map((at, i) => (
                    <div key={`mark-${i}`} className="flex items-baseline justify-between py-1" style={{ borderBottom: HAIRLINE }}>
                      <span style={{ fontFamily: 'var(--font-serif)', fontSize: 13, color: 'var(--text-secondary)' }}>
                        Chapter {i + 1}
                      </span>
                      <span style={{ ...MICRO, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>{formatTime(at)}</span>
                    </div>
                  ))}
                  {cuts.map((c, i) => (
                    <div key={`cut-${i}`} className="flex items-center justify-between py-1" style={{ borderBottom: HAIRLINE }}>
                      <span className="inline-flex items-center gap-1.5" style={{ ...MICRO, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>
                        <Scissors className="w-3 h-3" /> {formatTime(c.fromSec * 1000)}–{formatTime(c.toSec * 1000)}
                      </span>
                      <button
                        onClick={() => dropCut(i)}
                        aria-label="Keep this take after all"
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <SectionLabel>Teleprompter <span style={{ opacity: 0.5 }}>T</span></SectionLabel>
              <select
                value={tpCourseId}
                onChange={(e) => { setTpCourseId(e.target.value); setTpLessonId(''); }}
                className="w-full px-2 py-1.5 mb-1.5 text-xs"
                style={{ background: 'transparent', border: HAIRLINE, color: 'var(--text-primary)' }}
              >
                <option value="">— Course —</option>
                {myCourses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
              <select
                value={tpLessonId}
                onChange={(e) => pickPrompterLesson(e.target.value)}
                disabled={!tpLessons.length}
                className="w-full px-2 py-1.5 mb-1.5 text-xs disabled:opacity-40"
                style={{ background: 'transparent', border: HAIRLINE, color: 'var(--text-primary)' }}
              >
                <option value="">— Lesson —</option>
                {tpLessons.map((l) => <option key={l._id} value={String(l._id)}>{l.order}. {l.title}</option>)}
              </select>
              <textarea
                rows={4}
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Your script. Picking a lesson fills this from its Level Card."
                className="w-full px-2 py-1.5 text-xs resize-none"
                style={{ background: 'transparent', border: HAIRLINE, color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}
              />
              <button
                onClick={() => setPrompterOpen((v) => !v)}
                className="w-full mt-1.5 py-2"
                style={{ ...MICRO, color: prompterOpen ? 'var(--accent)' : 'var(--text-primary)', background: 'transparent', border: '1px solid rgba(255,255,255,0.24)', cursor: 'pointer' }}
              >
                {prompterOpen ? 'Hide prompter' : 'Show prompter'}
              </button>
            </section>
          </div>
        </div>

        {stage === STAGE.REVIEW && parts.length > 0 && (
          <RecorderReview
            parts={parts}
            myCourses={myCourses}
            onSave={onSaveParts}
            onReRecord={reset}
            saving={saving}
            progress={progress}
          />
        )}
      </div>
    </div>
  );
};

const SectionLabel = ({ children }) => (
  <div className="pb-2 mb-3" style={{ ...MICRO, color: 'var(--text-muted)', borderBottom: HAIRLINE }}>{children}</div>
);

const Key = ({ children }) => (
  <span style={{ marginLeft: 'auto', opacity: 0.45, fontSize: '0.52rem' }}>{children}</span>
);

const TONE = {
  plain: { color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.18)' },
  danger: { color: '#fda4af', border: '1px solid rgba(244,63,94,0.42)' },
  go: { color: '#a7f3d0', border: '1px solid rgba(52,211,153,0.42)' },
};

const StudioButton = ({ onClick, disabled, tone = 'plain', children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-full inline-flex items-center gap-2 px-3 py-2.5 disabled:opacity-40"
    style={{ ...MICRO, ...TONE[tone], background: 'transparent', cursor: disabled ? 'not-allowed' : 'pointer' }}
  >
    {children}
  </button>
);

const ToggleRow = ({ Icon, label, on, onToggle }) => (
  <button
    onClick={onToggle}
    className="w-full flex items-center gap-2 py-1.5"
    style={{ background: 'transparent', border: 'none', borderBottom: HAIRLINE, cursor: 'pointer' }}
  >
    <Icon className="w-3.5 h-3.5" style={{ color: on ? '#6ee7b7' : 'var(--text-muted)' }} />
    <span className="flex-1 text-left" style={{ ...MICRO, color: 'var(--text-secondary)' }}>{label}</span>
    <span style={{ ...MICRO, color: on ? '#6ee7b7' : 'var(--text-muted)' }}>{on ? 'on' : 'off'}</span>
  </button>
);

const WhiteboardColorSwatch = ({ color, whiteboardRef }) => (
  <button
    onClick={() => { if (whiteboardRef.current) whiteboardRef.current.dataset.color = color; }}
    className="w-4 h-4"
    style={{ background: color, border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer' }}
    title={color}
    aria-label={`Pencil ${color}`}
  />
);

function stopAllStreams(srcs) {
  Object.values(srcs || {}).forEach((stream) => {
    if (stream) stream.getTracks().forEach((t) => t.stop());
  });
}

function formatTime(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function pickMime() {
  const candidates = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
  for (const m of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) return m;
  }
  return '';
}

const strokeState = new WeakMap();

function boardCoords(e, ref) {
  const rect = ref.current.getBoundingClientRect();
  const sx = ref.current.width / rect.width;
  const sy = ref.current.height / rect.height;
  return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
}

function getStroke(canvas) {
  if (!strokeState.has(canvas)) strokeState.set(canvas, { drawing: false, last: null });
  return strokeState.get(canvas);
}

function beginWhiteboardStroke(e, ref, visible) {
  if (!visible || !ref.current) return;
  ref.current.dataset.color = ref.current.dataset.color || '#ffffff';
  const s = getStroke(ref.current);
  s.drawing = true;
  s.last = boardCoords(e, ref);
}

function extendWhiteboardStroke(e, ref, visible) {
  if (!visible || !ref.current) return;
  const s = getStroke(ref.current);
  if (!s.drawing) return;
  const ctx = ref.current.getContext('2d');
  const next = boardCoords(e, ref);
  ctx.strokeStyle = ref.current.dataset.color || '#ffffff';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(s.last.x, s.last.y);
  ctx.lineTo(next.x, next.y);
  ctx.stroke();
  s.last = next;
}

function endWhiteboardStroke(ref) {
  if (!ref?.current) return;
  const s = getStroke(ref.current);
  s.drawing = false;
  s.last = null;
}

function clearWhiteboard(ref) {
  if (!ref.current) return;
  const ctx = ref.current.getContext('2d');
  ctx.clearRect(0, 0, ref.current.width, ref.current.height);
}

export default Recorder;

