import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  ChevronLeft, Upload, Film, Trash2, Loader2, AlertTriangle, Search,
  X, ExternalLink, Sparkles, FileVideo, BookOpen, CheckCircle2, Cloud, GripVertical,
  Clock, Video,
} from 'lucide-react';
import FuturisticBackdrop from '../../components/common/FuturisticBackdrop';
import { courses } from '../../services/courses';
import { surfaceRecipe, borderTint } from '../../soul/tints';
import {
  StudioMasthead, StudioStat, StudioPanel, Reveal, studioSurface,
} from '../../soul/studio/surfaces';
import { Haptic } from '../../soul/haptics';
import { SoulSound } from '../../soul/soundLibrary';

const ACCEPT = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'];
const MAX_BYTES = 500 * 1024 * 1024;

const MediaLibrary = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [queue, setQueue] = useState([]);
  const [q, setQ] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [error, setError] = useState(null);
  const queueRef = useRef([]);

  const { data: myCourses = [], isLoading } = useQuery({
    queryKey: ['courses', 'list', 'mentor', 'media'],
    queryFn: () => courses.list({ mentor: 'me', limit: 100 }).then((r) => r?.items || []),
  });

  useEffect(() => { queueRef.current = queue; }, [queue]);

  useEffect(() => {
    if (!confirmDelete) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setConfirmDelete(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [confirmDelete]);

  const items = useMemo(() => {
    const flat = [];
    for (const c of myCourses) {
      for (const l of (c.lessons || [])) {
        if (l.videoUrl) {
          flat.push({
            courseId: c._id,
            courseTitle: c.title || 'Untitled course',
            lessonId: l._id,
            lessonTitle: l.title || 'Untitled lesson',
            videoUrl: l.videoUrl,
            videoPublicId: l.videoPublicId,
            durationSec: l.durationSec,
            isFree: !!l.isFree,
            isBoss: !!l.isBoss,
            order: l.order,
          });
        }
      }
    }
    return flat.sort((a, b) => (a.courseTitle || '').localeCompare(b.courseTitle || '') || a.order - b.order);
  }, [myCourses]);

  const visible = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return items.filter((it) => {
      if (courseFilter !== 'all' && it.courseId !== courseFilter) return false;
      if (!ql) return true;
      const lt = (it.lessonTitle || '').toLowerCase();
      const ct = (it.courseTitle || '').toLowerCase();
      return lt.includes(ql) || ct.includes(ql);
    });
  }, [items, q, courseFilter]);

  const totalSizeSec = useMemo(
    () => items.reduce((acc, it) => acc + (it.durationSec || 0), 0),
    [items],
  );

  const enqueue = useCallback((files) => {
    const raw = Array.from(files);
    const accepted = raw.filter((f) => ACCEPT.includes(f.type) || /\.(mp4|webm|mov|mkv)$/i.test(f.name));
    const oversized = raw.filter((f) => !ACCEPT.includes(f.type) && !/\.(mp4|webm|mov|mkv)$/i.test(f.name) ? false : f.size > MAX_BYTES);
    if (raw.length > 0 && accepted.length === 0) {
      setError('Only .mp4, .webm, .mov, .mkv files are accepted.');
      Haptic.denied?.() || Haptic.light();
      return;
    }
    if (oversized.length > 0) {
      setError(`${oversized.length} file${oversized.length === 1 ? '' : 's'} exceed the 500 MB limit and were skipped.`);
    } else {
      setError(null);
    }
    const seen = new Set();
    const next = accepted
      .filter((f) => {
        const k = `${f.name}|${f.size}|${f.lastModified || 0}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return f.size <= MAX_BYTES;
      })
      .map((f) => {
        const base = f.name.replace(/\.[^.]+$/, '').slice(0, 78);
        const truncated = f.name.replace(/\.[^.]+$/, '').length > 78;
        return {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          file: f,
          name: f.name,
          sizeMB: (f.size / 1024 / 1024).toFixed(1),
          status: 'queued',
          progress: 0,
          videoUrl: null,
          videoPublicId: null,
          durationSec: 0,
          courseId: '',
          lessonTitle: truncated ? `${base}…` : base,
          error: null,
        };
      });
    if (next.length === 0) return;
    setQueue((q) => [...q, ...next]);
    Haptic.light();
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer?.files?.length) enqueue(e.dataTransfer.files);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    if (!dragOver) setDragOver(true);
  };

  const onDragLeave = (e) => {
    if (e.currentTarget === e.target) setDragOver(false);
  };

  const uploadAll = useMutation({
    mutationFn: async () => {
      const results = [];
      for (const entry of [...queue]) {
        const stillThere = queueRef.current.find((x) => x.id === entry.id);
        if (!stillThere) continue;
        if ((entry.status !== 'queued' && entry.status !== 'error') || !entry.courseId) continue;
        let videoUrl = entry.videoUrl;
        let videoPublicId = entry.videoPublicId;
        let durationSec = entry.durationSec;
        try {
          if (!videoUrl) {
            setQueue((q) => q.map((x) => (x.id === entry.id ? { ...x, status: 'uploading', progress: 0 } : x)));
            const data = await courses.uploadVideo(entry.file, (pct) => {
              setQueue((q) => q.map((x) => (x.id === entry.id ? { ...x, progress: pct } : x)));
            });
            videoUrl = data.url;
            videoPublicId = data.publicId;
            durationSec = data.durationSec;
            setQueue((q) => q.map((x) => (x.id === entry.id ? { ...x, videoUrl, videoPublicId, durationSec } : x)));
          }
          await courses.addLesson(entry.courseId, {
            title: entry.lessonTitle,
            videoUrl,
            videoPublicId,
            durationSec,
            isFree: false,
          });
          setQueue((q) => q.map((x) => (x.id === entry.id ? { ...x, status: 'done', progress: 100 } : x)));
          results.push({ id: entry.id, ok: true });
        } catch (e2) {
          const stage = videoUrl ? 'lesson' : 'upload';
          setQueue((q) => q.map((x) => (x.id === entry.id ? { ...x, status: 'error', error: `${stage}: ${e2?.response?.data?.message || e2?.message || 'failed'}` } : x)));
          results.push({ id: entry.id, ok: false, stage });
        }
      }
      return results;
    },
    onSuccess: (results) => {
      qc.invalidateQueries({ queryKey: ['courses', 'list', 'mentor', 'media'] });
      const ok = results.filter((r) => r.ok).length;
      const partial = results.filter((r) => !r.ok && r.stage === 'lesson');
      if (ok > 0) {
        SoulSound.levelUp({ soul: 'mentor' });
        Haptic.success();
      }
      if (partial.length > 0) {
        setError(`${partial.length} file${partial.length === 1 ? '' : 's'} uploaded to Cloudinary but the lesson step failed — click "Upload all" again to retry without re-uploading.`);
      }
    },
  });

  const removeFromQueue = (id) => setQueue((q) => q.filter((x) => x.id !== id));

  const updateQueueField = (id, field, value) =>
    setQueue((q) => q.map((x) => (x.id === id ? { ...x, [field]: value } : x)));

  const deleteLesson = useMutation({
    mutationFn: ({ courseId, lessonId }) => courses.deleteLesson(courseId, lessonId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses', 'list', 'mentor', 'media'] });
      Haptic.heavy();
      setConfirmDelete(null);
    },
  });

  const reattach = (it) => navigate(`/mentor/courses/${it.courseId}/lessons/${it.lessonId}`);

  const stats = useMemo(() => {
    const byCourse = {};
    for (const it of items) byCourse[it.courseId] = (byCourse[it.courseId] || 0) + 1;

    // Per-course video counts, longest shelf first, capped so the bar row
    // stays legible on a mentor with thirty courses.
    const perCourse = Object.values(byCourse).sort((a, b) => b - a).slice(0, 10);

    // How many of the mentor's courses actually carry video. The remainder
    // draw as empty track, which is the point: it shows the gap.
    const withVideo = Object.keys(byCourse).length;
    const coverage = myCourses.slice(0, 10).map((c) => (byCourse[c._id] ? byCourse[c._id] : 0));

    // Duration spread in five buckets: <2m, 2-5m, 5-10m, 10-20m, 20m+.
    const buckets = [0, 0, 0, 0, 0];
    for (const it of items) {
      const m = (it.durationSec || 0) / 60;
      const b = m < 2 ? 0 : m < 5 ? 1 : m < 10 ? 2 : m < 20 ? 3 : 4;
      buckets[b] += 1;
    }

    return {
      total: items.length,
      courses: withVideo,
      durationMin: Math.round(totalSizeSec / 60),
      perCourse,
      coverage,
      buckets,
      emptyCourses: Math.max(0, myCourses.length - withVideo),
    };
  }, [items, totalSizeSec, myCourses]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <FuturisticBackdrop />
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <Helmet><title>Media Library · Orbit Mentor</title></Helmet>

        <Link to="/mentor/courses" className="inline-flex items-center gap-1.5 font-mono uppercase mb-4 transition-colors hover:text-text-primary"
          style={{ fontSize: '0.6rem', letterSpacing: '0.22em', fontWeight: 700, color: 'rgba(245,245,245,0.45)' }}>
          <ChevronLeft className="w-3.5 h-3.5" /> My courses
        </Link>

        <StudioMasthead
          eyebrow="Studio"
          Icon={Film}
          title="Media Library"
          deck="Every video you have attached to a lesson, in one place. Drop files anywhere on the plate below to bulk-upload."
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-pill font-mono uppercase transition-transform hover:scale-[1.03] active:scale-95"
              style={{
                fontSize: '0.6rem', letterSpacing: '0.2em', fontWeight: 700,
                background: 'var(--studio-gradient)', color: 'var(--text-on-accent)',
                boxShadow: '0 10px 30px -12px color-mix(in oklab, var(--studio-from) 60%, transparent)',
              }}
            >
              <Upload className="w-3.5 h-3.5" /> Upload
            </button>
            <button
              onClick={() => navigate('/mentor/recorder')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-pill font-mono uppercase transition-colors"
              style={{
                fontSize: '0.6rem', letterSpacing: '0.2em', fontWeight: 700,
                color: 'rgba(245,245,245,0.72)',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <Video className="w-3.5 h-3.5" /> Record
            </button>
          </div>
        </StudioMasthead>

        {error && (
          <div
            className="mb-5 flex items-start gap-2"
            style={{
              border: '1px solid rgba(252,165,165,0.35)',
              borderTop: '1px solid rgba(252,165,165,0.55)',
              padding: '12px 14px',
            }}
            role="alert"
          >
            <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(252,165,165,1)', marginTop: 2 }} />
            <p style={{ fontFamily: 'var(--font-serif)', color: 'rgba(252,165,165,0.92)', fontSize: '0.95rem', flex: 1 }}>
              {error}
            </p>
            <button
              onClick={() => setError(null)}
              className="font-mono uppercase"
              style={{ fontSize: '0.56rem', letterSpacing: '0.20em', fontWeight: 700, color: 'rgba(245,245,245,0.55)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <StudioStat
            index={1}
            label="Videos"
            Icon={FileVideo}
            value={stats.total}
            hint={stats.total ? `across ${stats.courses} course${stats.courses === 1 ? '' : 's'}` : 'nothing uploaded yet'}
            series={stats.perCourse}
          />
          <StudioStat
            index={2}
            label="Coverage"
            Icon={BookOpen}
            value={`${stats.courses}/${myCourses.length || 0}`}
            hint={stats.emptyCourses
              ? `${stats.emptyCourses} course${stats.emptyCourses === 1 ? '' : 's'} still has no video`
              : myCourses.length ? 'every course has video' : 'no courses yet'}
            series={stats.coverage}
          />
          <StudioStat
            index={3}
            label="Runtime"
            Icon={Clock}
            value={stats.durationMin >= 60
              ? `${Math.floor(stats.durationMin / 60)}h ${stats.durationMin % 60}m`
              : `${stats.durationMin}m`}
            hint={stats.total ? 'shortest to longest lesson' : 'no runtime recorded'}
            series={stats.buckets}
          />
        </div>

        <Reveal index={4}>
          <div
            ref={dropRef}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className="relative mb-4 overflow-hidden transition-all duration-300"
            style={{
              ...studioSurface('mentor'),
              borderRadius: 20,
              borderStyle: 'dashed',
              borderColor: dragOver
                ? 'color-mix(in oklab, var(--studio-from) 75%, transparent)'
                : 'rgba(255,255,255,0.14)',
              transform: dragOver ? 'scale(1.008)' : 'none',
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none transition-opacity duration-300"
              style={{
                opacity: dragOver ? 1 : 0.35,
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px)
                `,
                backgroundSize: '22px 22px',
                maskImage: 'radial-gradient(70% 70% at 50% 45%, #000 0%, transparent 100%)',
              }}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              multiple
              onChange={(e) => e.target.files?.length && enqueue(e.target.files)}
              className="hidden"
            />
            <div className="relative flex flex-col items-center gap-3 px-6 py-9">
              <motion.div
                animate={dragOver ? { scale: 1.12, y: -3 } : { scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                className="relative inline-flex items-center justify-center"
                style={{
                  width: 54, height: 54, borderRadius: 999,
                  background: 'color-mix(in oklab, var(--studio-from) 14%, transparent)',
                  border: '1px solid color-mix(in oklab, var(--studio-from) 34%, transparent)',
                  boxShadow: dragOver
                    ? '0 0 0 10px color-mix(in oklab, var(--studio-from) 10%, transparent)'
                    : 'none',
                }}
              >
                <Cloud className="w-6 h-6" style={{ color: 'var(--studio-from)' }} />
              </motion.div>

              <div
                style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: '1.05rem', letterSpacing: '-0.02em', color: 'var(--text-primary)',
                }}
              >
                {dragOver ? 'Let go to queue them' : 'Drop videos to attach them to a course'}
              </div>

              <div className="flex items-center flex-wrap justify-center gap-1.5">
                {['MP4', 'WEBM', 'MOV', 'MKV'].map((ext) => (
                  <span
                    key={ext}
                    className="font-mono uppercase"
                    style={{
                      fontSize: '0.54rem', letterSpacing: '0.16em', fontWeight: 700,
                      padding: '3px 7px', borderRadius: 5,
                      color: 'rgba(245,245,245,0.55)',
                      background: 'rgba(255,255,255,0.045)',
                      border: '1px solid rgba(255,255,255,0.09)',
                    }}
                  >
                    {ext}
                  </span>
                ))}
                <span
                  className="font-mono uppercase"
                  style={{
                    fontSize: '0.54rem', letterSpacing: '0.16em', fontWeight: 700,
                    padding: '3px 7px', borderRadius: 5, color: 'rgba(245,245,245,0.38)',
                  }}
                >
                  500 MB each
                </span>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-1 inline-flex items-center gap-2 px-5 py-2.5 rounded-pill font-mono uppercase transition-transform hover:scale-[1.04] active:scale-95"
                style={{
                  fontSize: '0.6rem', letterSpacing: '0.2em', fontWeight: 700,
                  background: 'var(--studio-gradient)', color: 'var(--text-on-accent)',
                  boxShadow: '0 12px 32px -14px color-mix(in oklab, var(--studio-from) 65%, transparent)',
                }}
              >
                <Upload className="w-3.5 h-3.5" /> Choose files
              </button>
            </div>
          </div>
        </Reveal>

        <AnimatePresence>
          {queue.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-5 rounded-2xl p-4"
              style={{ ...surfaceRecipe('mentor'), border: borderTint({ from: '#a78bfa', to: '#3b82f6' }, 24) }}
            >
              <div className="flex items-center gap-2 mb-3">
                <GripVertical className="w-4 h-4 text-text-muted" />
                <div className="text-sm font-semibold text-text-primary">Upload queue</div>
                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={() => setQueue([])}
                    disabled={uploadAll.isPending}
                    className="text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-rose-300 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Clear all
                  </button>
                  <button
                    onClick={() => uploadAll.mutate()}
                    disabled={uploadAll.isPending || queue.every((x) => x.status === 'done' || !x.courseId)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-[11px] font-bold uppercase tracking-widest text-text-on-accent disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #a78bfa, #3b82f6)' }}
                  >
                    {uploadAll.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    Upload all
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {queue.map((entry) => (
                  <QueueRow
                    key={entry.id}
                    entry={entry}
                    courses={myCourses}
                    onUpdate={(field, value) => updateQueueField(entry.id, field, value)}
                    onRemove={() => removeFromQueue(entry.id)}
                  />
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <Reveal index={5}>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <div
              className="flex items-center gap-2.5 px-4 py-2.5 flex-1 min-w-[220px] transition-colors focus-within:border-accent/50"
              style={{
                borderRadius: 999,
                background: 'rgba(255,255,255,0.035)',
                border: '1px solid rgba(255,255,255,0.10)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
              }}
            >
              <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgba(245,245,245,0.42)' }} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by lesson or course"
                className="bg-transparent outline-none text-sm flex-1 min-w-0"
                style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}
              />
              {q && (
                <button onClick={() => setQ('')} aria-label="Clear search" className="flex-shrink-0" style={{ color: 'rgba(245,245,245,0.42)' }}>
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="px-4 py-2.5 font-mono uppercase outline-none cursor-pointer"
              style={{
                borderRadius: 999,
                fontSize: '0.6rem', letterSpacing: '0.16em', fontWeight: 700,
                color: 'rgba(245,245,245,0.72)',
                background: 'rgba(255,255,255,0.035)',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
            >
              <option value="all">All courses</option>
              {myCourses.map((c) => (
                <option key={c._id} value={c._id}>{c.title}</option>
              ))}
            </select>
            <span
              className="font-mono uppercase px-3 flex-shrink-0"
              style={{ fontSize: '0.58rem', letterSpacing: '0.18em', fontWeight: 700, color: 'rgba(245,245,245,0.38)' }}
            >
              {visible.length} shown
            </span>
          </div>
        </Reveal>

        {isLoading ? (
          <div className="text-center py-12" style={{ color: 'rgba(245,245,245,0.45)' }}>
            <Loader2 className="w-5 h-5 animate-spin inline" />
          </div>
        ) : visible.length === 0 ? (
          <EmptyLibrary onUpload={() => fileInputRef.current?.click()} hasItems={items.length > 0} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visible.map((it, i) => (
              <Reveal key={`${it.courseId}-${it.lessonId}`} index={6 + Math.min(i, 12)}>
                <MediaCard
                  item={it}
                  onReattach={() => reattach(it)}
                  onDelete={() => setConfirmDelete(it)}
                />
              </Reveal>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {confirmDelete && (
          <DeleteModal
            item={confirmDelete}
            onClose={() => setConfirmDelete(null)}
            onConfirm={() => deleteLesson.mutate({ courseId: confirmDelete.courseId, lessonId: confirmDelete.lessonId })}
            pending={deleteLesson.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const QueueRow = ({ entry, courses: courseList, onUpdate, onRemove }) => {
  const pct = entry.progress;
  const uploading = entry.status === 'uploading';
  const done = entry.status === 'done';
  const errored = entry.status === 'error';
  return (
    <div className="rounded-xl border border-border-subtle bg-surface/20 p-3">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
          done ? 'bg-emerald-500/15 text-emerald-300' : errored ? 'bg-rose-500/15 text-rose-300' : 'bg-accent/15 text-accent'
        }`}>
          {done ? <CheckCircle2 className="w-4 h-4" /> : errored ? <AlertTriangle className="w-4 h-4" /> : <FileVideo className="w-4 h-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-text-primary truncate">{entry.name}</div>
          <div className="text-[10px] text-text-muted flex items-center gap-2">
            <span>{entry.sizeMB} MB</span>
            {entry.durationSec > 0 && <span>· {formatDur(entry.durationSec)}</span>}
            {errored && <span className="text-rose-300">· {entry.error}</span>}
          </div>
        </div>
        <button
          onClick={onRemove}
          disabled={uploading}
          className="text-text-muted hover:text-rose-300 disabled:opacity-30"
          title="Remove from queue"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {!done && (
        <div className="mt-2 grid grid-cols-[1fr_2fr] gap-2">
          <select
            value={entry.courseId}
            onChange={(e) => onUpdate('courseId', e.target.value)}
            disabled={uploading}
            className="px-2 py-1 rounded-lg bg-bg/50 border border-border-subtle text-xs text-text-primary"
          >
            <option value="">— Course —</option>
            {courseList.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
          </select>
          <input
            value={entry.lessonTitle}
            onChange={(e) => onUpdate('lessonTitle', e.target.value)}
            disabled={uploading}
            placeholder="Lesson title"
            className="px-2 py-1 rounded-lg bg-bg/50 border border-border-subtle text-xs text-text-primary"
          />
        </div>
      )}
      {(uploading || done) && (
        <div className="mt-2 h-1 rounded-full bg-border-subtle/40 overflow-hidden">
          <motion.div
            className="h-full"
            style={{ background: 'linear-gradient(90deg, #a78bfa, #3b82f6)' }}
            initial={{ width: 0 }}
            animate={{ width: `${done ? 100 : pct}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}
    </div>
  );
};

const MediaCard = ({ item, onReattach, onDelete }) => {
  const cloudName = cloudNameFromUrl(item.videoUrl);
  const poster = item.videoPublicId && cloudName
    ? `https://res.cloudinary.com/${cloudName}/video/upload/so_3/${item.videoPublicId}.jpg`
    : null;
  return (
    <motion.div
      layout
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className="overflow-hidden group h-full"
      style={{ ...studioSurface('mentor'), borderRadius: 18 }}
    >
      <div className="relative aspect-video" style={{ background: '#07070f' }}>
        {poster ? (
          <img
            src={poster}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'radial-gradient(70% 90% at 50% 40%, color-mix(in oklab, var(--studio-from) 16%, transparent), transparent 70%)' }}
          >
            <Film className="w-8 h-8" style={{ color: 'color-mix(in oklab, var(--studio-from) 60%, transparent)' }} />
          </div>
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(3,3,10,0.86) 0%, rgba(3,3,10,0.12) 46%, transparent 100%)' }} />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          style={{ height: 2, background: 'var(--studio-gradient)' }}
        />
        {item.durationSec > 0 && (
          <div
            className="absolute bottom-2 right-2 px-1.5 py-0.5 font-mono"
            style={{
              fontSize: '0.6rem', borderRadius: 5, color: '#fff',
              background: 'rgba(3,3,10,0.78)', border: '1px solid rgba(255,255,255,0.14)',
              backdropFilter: 'blur(6px)',
            }}
          >
            {formatDur(item.durationSec)}
          </div>
        )}
        {item.isBoss && (
          <div className="absolute top-2 left-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-400 text-amber-950 text-[9px] font-bold uppercase tracking-widest">
            <Sparkles className="w-2.5 h-2.5" /> Boss
          </div>
        )}
        {item.isFree && !item.isBoss && (
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-emerald-400 text-emerald-950 text-[9px] font-bold uppercase tracking-widest">
            Free
          </div>
        )}
        <button
          onClick={onReattach}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          title="Edit lesson"
        >
          <span
            className="px-3.5 py-2 font-mono uppercase"
            style={{
              fontSize: '0.58rem', letterSpacing: '0.2em', fontWeight: 700, borderRadius: 999,
              color: '#fff', background: 'rgba(3,3,10,0.7)',
              border: '1px solid rgba(255,255,255,0.22)', backdropFilter: 'blur(8px)',
            }}
          >
            Open in editor
          </span>
        </button>
      </div>
      <div className="p-3.5">
        <div
          className="font-mono uppercase flex items-center gap-1.5 mb-1.5 truncate"
          style={{ fontSize: '0.56rem', letterSpacing: '0.2em', fontWeight: 700, color: 'color-mix(in oklab, var(--studio-from) 72%, white)' }}
        >
          <BookOpen className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{item.courseTitle}</span>
        </div>
        <div
          className="line-clamp-2 mb-3"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.94rem', letterSpacing: '-0.015em', color: 'var(--text-primary)' }}
        >
          {item.lessonTitle}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onReattach}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 font-mono uppercase transition-transform hover:scale-[1.02] active:scale-95"
            style={{
              fontSize: '0.56rem', letterSpacing: '0.18em', fontWeight: 700, borderRadius: 999,
              color: 'var(--text-on-accent)', background: 'var(--studio-gradient)',
            }}
          >
            <ExternalLink className="w-3 h-3" /> Edit
          </button>
          <button
            onClick={onDelete}
            className="inline-flex items-center justify-center px-2.5 py-1.5 transition-colors"
            style={{
              borderRadius: 999, color: 'rgba(252,165,165,0.9)',
              background: 'rgba(244,63,94,0.10)', border: '1px solid rgba(244,63,94,0.28)',
            }}
            title="Delete lesson (and unlink video)"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const DeleteModal = ({ item, onClose, onConfirm, pending }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      onClick={(e) => e.stopPropagation()}
      className="w-full max-w-sm rounded-2xl p-5 bg-surface border border-border-subtle"
    >
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-5 h-5 text-rose-300" />
        <h3 className="text-base font-semibold text-text-primary">Delete this lesson?</h3>
      </div>
      <p className="text-sm text-text-secondary mb-3">
        "<span className="font-semibold text-text-primary">{item.lessonTitle}</span>" will be removed from
        <span className="font-semibold text-text-primary"> {item.courseTitle}</span>. The video will be unlinked from the lesson.
      </p>
      <div className="flex items-center gap-2 justify-end">
        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded-pill bg-surface/40 border border-border-subtle text-xs font-bold uppercase tracking-widest text-text-secondary"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={pending}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-rose-500/20 text-rose-200 border border-rose-500/40 text-xs font-bold uppercase tracking-widest disabled:opacity-40"
        >
          {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          Delete
        </button>
      </div>
    </motion.div>
  </motion.div>
);

const EmptyLibrary = ({ onUpload, hasItems }) => (
  <StudioPanel radius={20} className="px-8 py-12 text-center overflow-hidden">
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)
        `,
        backgroundSize: '26px 26px',
        maskImage: 'radial-gradient(60% 60% at 50% 40%, #000 0%, transparent 100%)',
      }}
    />
    <div className="relative">
      <div
        className="inline-flex items-center justify-center mx-auto mb-4"
        style={{
          width: 56, height: 56, borderRadius: 999,
          background: 'color-mix(in oklab, var(--studio-from) 13%, transparent)',
          border: '1px solid color-mix(in oklab, var(--studio-from) 30%, transparent)',
          boxShadow: '0 0 0 12px color-mix(in oklab, var(--studio-from) 5%, transparent)',
        }}
      >
        <Film className="w-6 h-6" style={{ color: 'var(--studio-from)' }} />
      </div>
      <div
        className="mb-1.5"
        style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 'clamp(1.2rem, 2.4vw, 1.6rem)', letterSpacing: '-0.03em',
          color: 'var(--text-primary)',
        }}
      >
        {hasItems ? 'Nothing matches that' : 'The shelf is empty'}
      </div>
      <p
        className="text-sm mb-5 max-w-sm mx-auto leading-relaxed"
        style={{ fontFamily: 'var(--font-sans)', color: 'rgba(245,245,245,0.55)' }}
      >
        {hasItems
          ? 'Try a different search term, or widen the course filter.'
          : 'Drop a file on the plate above, or record a lesson in the Studio and it lands here automatically.'}
      </p>
      {!hasItems && (
        <button
          onClick={onUpload}
          className="inline-flex items-center gap-2 px-5 py-2.5 font-mono uppercase transition-transform hover:scale-[1.04] active:scale-95"
          style={{
            fontSize: '0.6rem', letterSpacing: '0.2em', fontWeight: 700, borderRadius: 999,
            background: 'var(--studio-gradient)', color: 'var(--text-on-accent)',
            boxShadow: '0 12px 32px -14px color-mix(in oklab, var(--studio-from) 65%, transparent)',
          }}
        >
          <Upload className="w-3.5 h-3.5" /> Upload your first video
        </button>
      )}
    </div>
  </StudioPanel>
);

function formatDur(sec) {
  if (!sec || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function cloudNameFromUrl(url) {
  if (!url) return null;
  const m = url.match(/res\.cloudinary\.com\/([^/]+)/);
  return m ? m[1] : null;
}

export default MediaLibrary;
