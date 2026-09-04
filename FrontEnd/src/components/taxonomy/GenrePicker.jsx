import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

/**
 * GenrePicker — one genre slug, grouped by constellation. A course's category is
 * this slug, which is what browse-by-genre and the Topic-level competition read;
 * free text here meant neither had real data.
 */
const GenrePicker = ({ value, onChange, style, className = '' }) => {
  const { data: constellations = [], isLoading } = useQuery({
    queryKey: ['taxonomy', 'tree'],
    queryFn: () => api.get('/taxonomy/tree').then((r) => r.data?.constellations || []),
    staleTime: 30 * 60 * 1000,
  });

  return (
    <select
      value={value || 'general'}
      onChange={(e) => onChange(e.target.value)}
      disabled={isLoading}
      className={className}
      style={style}
    >
      <option value="general">{isLoading ? 'Loading genres…' : 'Uncategorised'}</option>
      {constellations.map((c) => (
        <optgroup key={c.slug} label={c.label}>
          {(c.genres || []).map((g) => (
            <option key={g.slug} value={g.slug}>{g.label}</option>
          ))}
        </optgroup>
      ))}
    </select>
  );
};

export default GenrePicker;
