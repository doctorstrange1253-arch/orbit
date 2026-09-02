import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  ChevronLeft, Upload, Film, Trash2, Loader2, AlertTriangle, Search,
  X, ExternalLink, Sparkles, FileVideo, BookOpen, CheckCircle2, Cloud, GripVertical,
} from 'lucide-react';
import FuturisticBackdrop from '../../components/common/FuturisticBackdrop';
import { courses } from '../../services/courses';
import { surfaceRecipe, borderTint } from '../../soul/tints';
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
    queryFn: () => courses.list({ mentor: 'me', limit: 100 }).then((r) => r.data?.items || r.data || []),
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
    return {
      total: items.length,
      courses: Object.keys(byCourse).length,
      durationMin: Math.round(totalSizeSec / 60),
    };
  }, [items, totalSizeSec]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <FuturisticBackdrop />
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <Helmet><title>Media Library · Orbit Mentor</title></Helmet>

        <Link to="/mentor/courses" className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-primary mb-3">
          <ChevronLeft className="w-3.5 h-3.5" /> My courses
        </Link>

        <motion.header initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill text-[11px] font-semibold uppercase tracking-widest text-text-secondary bg-surface border border-border-subtle mb-3">
            <Film className="w-3.5 h-3.5 text-accent" /> Studio
          </div>
          <h1 className="text-2xl md:text-3xl font-medium" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--text-primary)' }}>
            Media Library.
          </h1>
          <p className="text-text-secondary text-sm mt-1">Every video you've attached to a lesson, in one place. Drop new files to bulk-upload.</p>
        </motion.header>

        <div className="grid grid-cols-3 gap-2 mb-5">
          <StatCell label="Videos" value={stats.total} />
          <StatCell label="Courses" value={stats.courses} />
          <StatCell label="Minutes" value={stats.durationMin} />
        </div>

        <div
          ref={dropRef}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`relative rounded-2xl p-6 mb-5 text-center transition border-2 border-dashed ${
            dragOver ? 'border-accent bg-accent/10' : 'border-border-subtle bg-surface/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            multiple
            onChange={(e) => e.target.files?.length && enqueue(e.target.files)}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center">
              <Cloud className="w-6 h-6 text-accent" />
            </div>
            <div className="text-sm font-semibold text-text-primary">Drop videos to attach them to a course</div>
            <div className="text-xs text-text-muted">.mp4 · .webm · .mov · .mkv · up to 500 MB each</div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-pill text-xs font-bold uppercase tracking-widest"
              style={{ background: 'linear-gradient(135deg, #a78bfa, #3b82f6)', color: 'var(--text-on-accent)' }}
            >
              <Upload className="w-3.5 h-3.5" /> Choose files
            </button>
          </div>
        </div>

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
                    className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-rose-300 disabled:opacity-40 disabled:cursor-not-allowed"
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

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-pill bg-surface/30 border border-border-subtle flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by lesson or course…"
              className="bg-transparent outline-none text-sm text-text-primary flex-1"
            />
          </div>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-3 py-1.5 rounded-pill bg-surface/30 border border-border-subtle text-xs text-text-primary"
          >
            <option value="all">All courses</option>
            {myCourses.map((c) => (
              <option key={c._id} value={c._id}>{c.title}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-text-muted"><Loader2 className="w-5 h-5 animate-spin inline" /></div>
        ) : visible.length === 0 ? (
          <EmptyLibrary onUpload={() => fileInputRef.current?.click()} hasItems={items.length > 0} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visible.map((it) => (
              <MediaCard
                key={`${it.courseId}-${it.lessonId}`}
                item={it}
                onReattach={() => reattach(it)}
                onDelete={() => setConfirmDelete(it)}
              />
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

const StatCell = ({ label, value }) => (
  <div className="rounded-xl border border-border-subtle bg-surface/30 px-3 py-2.5 text-center">
    <div className="text-2xl font-black text-text-primary" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>{value}</div>
    <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">{label}</div>
  </div>
);

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
      whileHover={{ y: -2 }}
      className="rounded-2xl overflow-hidden border border-border-subtle bg-surface/30 group"
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      <div className="relative aspect-video bg-black">
        {poster ? (
          <img src={poster} alt="" className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Film className="w-8 h-8 text-text-muted" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {item.durationSec > 0 && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-white text-[10px] font-mono">
            {formatDur(item.durationSec)}
          </div>
        )}
        {item.isBoss && (
          <div className="absolute top-2 left-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/90 text-amber-950 text-[9px] font-black uppercase tracking-widest">
            <Sparkles className="w-2.5 h-2.5" /> Boss
          </div>
        )}
        {item.isFree && !item.isBoss && (
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-emerald-500/90 text-emerald-950 text-[9px] font-black uppercase tracking-widest">
            Free
          </div>
        )}
        <button
          onClick={onReattach}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
          title="Edit lesson"
        >
          <span className="px-3 py-1.5 rounded-pill bg-black/70 text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">
            Open in editor
          </span>
        </button>
      </div>
      <div className="p-3">
        <div className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-1 mb-1">
          <BookOpen className="w-3 h-3" /> {item.courseTitle}
        </div>
        <div className="text-sm font-semibold text-text-primary line-clamp-2 mb-2">{item.lessonTitle}</div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onReattach}
            className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1 rounded-pill bg-accent/15 text-accent border border-accent/30 text-[10px] font-black uppercase tracking-widest"
          >
            <ExternalLink className="w-3 h-3" /> Edit
          </button>
          <button
            onClick={onDelete}
            className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-pill bg-rose-500/10 text-rose-300 border border-rose-500/30 text-[10px] font-black uppercase tracking-widest"
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
  <div className="rounded-2xl border border-border-subtle bg-surface/30 p-8 text-center">
    <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-3">
      <Film className="w-6 h-6 text-accent" />
    </div>
    <div className="text-base font-semibold text-text-primary mb-1" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
      {hasItems ? 'No videos match your search.' : 'No videos yet.'}
    </div>
    <p className="text-sm text-text-secondary mb-3">
      {hasItems ? 'Try a different search term or course filter.' : 'Drop a video above, or record one in the Studio.'}
    </p>
    {!hasItems && (
      <button
        onClick={onUpload}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-pill text-xs font-bold uppercase tracking-widest"
        style={{ background: 'linear-gradient(135deg, #a78bfa, #3b82f6)', color: 'var(--text-on-accent)' }}
      >
        <Upload className="w-3.5 h-3.5" /> Upload your first video
      </button>
    )}
  </div>
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
