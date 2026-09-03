import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, RefreshCw, Loader2, Scissors, Sparkles } from 'lucide-react';

const MICRO = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.56rem',
  letterSpacing: '0.16em',
  fontWeight: 700,
  textTransform: 'uppercase',
};

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

function fmt(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function cutSeconds(cuts) {
  return (cuts || []).reduce((n, c) => n + Math.max(0, c.toSec - c.fromSec), 0);
}

const RecorderReview = ({ parts, myCourses, onSave, onReRecord, saving, progress }) => {
  const [courseId, setCourseId] = useState(myCourses[0]?._id || '');
  const [edits, setEdits] = useState({});
  const [error, setError] = useState(null);

  const rowFor = (part, i) => edits[part.id] || {
    title: parts.length > 1 ? `Part ${i + 1}` : '',
    description: '',
  };

  const totals = useMemo(() => ({
    ms: parts.reduce((n, p) => n + p.durationMs, 0),
    mb: parts.reduce((n, p) => n + (p.blob?.size || 0), 0) / 1024 / 1024,
    cuts: parts.reduce((n, p) => n + (p.cuts?.length || 0), 0),
    cutSec: parts.reduce((n, p) => n + cutSeconds(p.cuts), 0),
  }), [parts]);

  const submit = async () => {
    if (!courseId) { setError('Pick a course.'); return; }
    const rows = parts.map((p, i) => rowFor(p, i));
    if (rows.some((r) => !(r.title || '').trim())) { setError('Give every lesson a title.'); return; }
    setError(null);
    try {
      await onSave(courseId, parts.map((p, i) => ({
        ...p,
        title: rows[i].title.trim(),
        description: (rows[i].description || '').trim(),
      })));
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Save failed.');
    }
  };

  const setRow = (part, i, patch) => setEdits((prev) => ({ ...prev, [part.id]: { ...rowFor(part, i), ...patch } }));

  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
      <div className="h-px w-full mb-5" style={{ background: 'rgba(255,255,255,0.12)' }} />

      <div className="flex items-baseline gap-3 flex-wrap mb-4">
        <Sparkles className="w-4 h-4" style={{ color: 'var(--accent)' }} />
        <h2 className="text-xl" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--text-primary)' }}>
          {parts.length > 1 ? `${parts.length} chapters, ${parts.length} lessons` : 'Review your recording'}
        </h2>
        <span className="ml-auto" style={{ ...MICRO, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
          {fmt(totals.ms)} · {totals.mb.toFixed(1)} MB
          {totals.cuts > 0 && ` · ${totals.cuts} cut${totals.cuts > 1 ? 's' : ''} (${Math.round(totals.cutSec)}s removed)`}
        </span>
      </div>

      <label className="block mb-5 max-w-sm">
        <span className="block mb-1.5" style={{ ...MICRO, color: 'var(--text-muted)' }}>Course</span>
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="w-full px-3 py-2 text-sm"
          style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.16)', color: 'var(--text-primary)' }}
        >
          <option value="">— Pick a course —</option>
          {myCourses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
        </select>
      </label>

      <div className="space-y-6">
        {parts.map((p, i) => (
          <div key={p.id} className="grid md:grid-cols-[minmax(0,320px)_1fr] gap-4">
            <div>
              <div className="flex items-baseline gap-2 mb-1.5">
                <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--text-muted)' }}>
                  {ROMAN[i] || i + 1}
                </span>
                <span style={{ ...MICRO, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                  {fmt(p.durationMs)}
                </span>
                {(p.cuts?.length || 0) > 0 && (
                  <span className="inline-flex items-center gap-1" style={{ ...MICRO, color: 'var(--accent)' }}>
                    <Scissors className="w-3 h-3" /> {p.cuts.length}
                  </span>
                )}
              </div>
              <video src={p.url} controls className="w-full aspect-video bg-black" style={{ border: '1px solid rgba(255,255,255,0.12)' }} />
            </div>
            <div>
              <label className="block mb-3">
                <span className="block mb-1.5" style={{ ...MICRO, color: 'var(--text-muted)' }}>Lesson title</span>
                <input
                  value={rowFor(p, i).title}
                  onChange={(e) => setRow(p, i, { title: e.target.value })}
                  placeholder="What this lesson teaches…"
                  className="w-full px-3 py-2 text-sm"
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.16)', color: 'var(--text-primary)' }}
                />
              </label>
              <label className="block">
                <span className="block mb-1.5" style={{ ...MICRO, color: 'var(--text-muted)' }}>Description</span>
                <textarea
                  rows={3}
                  value={rowFor(p, i).description}
                  onChange={(e) => setRow(p, i, { description: e.target.value })}
                  className="w-full px-3 py-2 text-sm resize-none"
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.16)', color: 'var(--text-primary)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-4 px-3 py-2 text-xs" style={{ border: '1px solid rgba(244,63,94,0.4)', color: '#fecdd3' }}>{error}</div>
      )}

      {saving && progress?.total > 0 && (
        <div className="mt-4">
          <div style={{ ...MICRO, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
            Uploading lesson {progress.index + 1} of {progress.total} — {progress.pct}%
          </div>
          <div className="mt-1.5 h-px w-full" style={{ background: 'rgba(255,255,255,0.12)' }}>
            <div className="h-px" style={{ width: `${((progress.index + progress.pct / 100) / progress.total) * 100}%`, background: 'var(--accent)' }} />
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={submit}
          disabled={saving || !courseId}
          className="inline-flex items-center gap-2 px-4 py-2 disabled:opacity-40"
          style={{ ...MICRO, color: 'var(--text-primary)', background: 'transparent', border: '1px solid rgba(255,255,255,0.36)', cursor: 'pointer' }}
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {saving ? 'Saving…' : parts.length > 1 ? `Save ${parts.length} lessons` : 'Save as lesson'}
        </button>
        <button
          onClick={onReRecord}
          disabled={saving}
          className="inline-flex items-center gap-2 disabled:opacity-40"
          style={{ ...MICRO, color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          <RefreshCw className="w-3.5 h-3.5" /> Re-record
        </button>
      </div>
    </motion.section>
  );
};

export default RecorderReview;
