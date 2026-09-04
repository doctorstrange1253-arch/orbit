import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X, Loader } from 'lucide-react';
import api from '../../services/api';

const MICRO = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.56rem',
  letterSpacing: '0.16em',
  fontWeight: 700,
  textTransform: 'uppercase',
};

function useDebounced(value, ms = 220) {
  const [out, setOut] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setOut(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return out;
}

/**
 * TopicPicker — searchable multi-select over the 1,286-topic taxonomy. Topics
 * are what the Signal Flare matches on, so a mentor who picks none is invisible
 * to it; the caller enforces the minimum.
 */
const TopicPicker = ({ value = [], onChange, max = 12 }) => {
  const [query, setQuery] = useState('');
  const debounced = useDebounced(query);

  const { data: results = [], isFetching } = useQuery({
    queryKey: ['taxonomy', 'search', debounced],
    queryFn: () => api.get('/taxonomy/search', { params: { q: debounced, limit: 24 } }).then((r) => r.data?.items || []),
    enabled: debounced.trim().length >= 2,
    staleTime: 5 * 60 * 1000,
  });

  const chosen = useMemo(() => new Set(value), [value]);
  const labels = useMemo(() => {
    const map = new Map();
    for (const t of results) map.set(t.slug, t);
    return map;
  }, [results]);

  const add = (topic) => {
    if (chosen.has(topic.slug) || value.length >= max) return;
    onChange([...value, topic.slug]);
    setQuery('');
  };
  const remove = (slug) => onChange(value.filter((s) => s !== slug));

  return (
    <div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((slug) => (
            <span
              key={slug}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-pill text-xs font-semibold bg-accent/15 text-accent border border-accent/30"
            >
              {labels.get(slug)?.label || slug.split('.').pop().replace(/-/g, ' ')}
              <button type="button" onClick={() => remove(slug)} aria-label={`Remove ${slug}`} className="ml-0.5 hover:text-text-primary">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="input-glass px-3 py-2.5 flex items-center gap-2">
        {isFetching ? <Loader size={14} className="animate-spin text-text-muted shrink-0" /> : <Search size={14} className="text-text-muted shrink-0" />}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={value.length >= max}
          placeholder={value.length >= max ? `${max} is the limit` : 'Search topics — "react", "hindustani vocal", "organic chemistry"…'}
          className="flex-1 min-w-0 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted disabled:opacity-50"
        />
        <span style={{ ...MICRO, color: 'var(--text-muted)' }}>{value.length}/{max}</span>
      </div>

      {debounced.trim().length >= 2 && (
        <div className="mt-1 max-h-56 overflow-y-auto rounded-lg border border-border-subtle divide-y divide-white/5">
          {results.length === 0 && !isFetching ? (
            <p className="text-xs text-text-muted p-3 text-center">
              Nothing matches “{debounced}”. Try a broader word.
            </p>
          ) : results.map((t) => {
            const taken = chosen.has(t.slug);
            return (
              <button
                key={t.slug}
                type="button"
                onClick={() => add(t)}
                disabled={taken || value.length >= max}
                className="w-full flex items-baseline gap-2 px-3 py-2 text-left hover:bg-white/5 disabled:opacity-40"
              >
                <span className="text-sm text-text-primary">{t.label}</span>
                <span className="text-[11px] text-text-muted truncate">{t.constellationLabel} · {t.genreLabel}</span>
                {taken && <span className="ml-auto" style={{ ...MICRO, color: 'var(--accent)' }}>added</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TopicPicker;
