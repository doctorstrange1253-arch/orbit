/**
 * pages/student/Universe.jsx — The Student Soul Home (V3).
 *
 * Replaces V2's `MySessions.jsx` as the V3 `/student/universe` route.
 * The page renders a slow-rotating 3D-feel canvas where each enrolled
 * course is a planet. Clicking a planet triggers the CameraZoom transit
 * (800ms) into the course detail page.
 *
 * Layout:
 *   1. Header (eyebrow + supernova title)
 *   2. The universe canvas — N planets positioned by enrollment id
 *   3. Empty state when there are no enrollments
 *
 * The V2 session-booking tools stay accessible via the navbar (`/student/mentors`),
 * but the home page is now a *place* — the universe canvas.
 */

import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Telescope } from 'lucide-react';
import { useSoul } from '../../hooks/useSoul';
import { surfaceRecipe, borderTint, tintHalo } from '../../soul/tints';
import Planet from '../../soul/universe/Planet';
import CameraZoom from '../../soul/universe/CameraZoom';
import UniverseEmpty from '../../soul/universe/UniverseEmpty';
import api from '../../services/api';

const Universe = () => {
  const { soul, nebula } = useSoul();
  const accent = nebula?.from || '#fbbf24';
  const navigate = useNavigate();

  // Enrollments (the student's universe).
  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments', 'me'],
    queryFn: () => api.get('/courses/enrollments/me').then((r) => r.data?.items || r.data || []),
    staleTime: 60_000,
  });

  // CameraZoom state — the source rect + course being zoomed into.
  const [zoom, setZoom] = useState(null);
  const planetRefs = useRef({});

  // Position the planets in a non-colliding 2D grid.
  const layout = useMemo(() => {
    const cols = enrollments.length <= 1 ? 1 : Math.ceil(Math.sqrt(enrollments.length * 1.4));
    return enrollments.map((e, i) => {
      const c = i % cols;
      const r = Math.floor(i / cols);
      return { enrollment: e, x: c, y: r, idx: i };
    });
  }, [enrollments]);

  const onPlanetTap = (enrollment, course, idx) => {
    const btn = planetRefs.current[idx];
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    setZoom({ sourceRect: rect, enrollment, course });
  };

  const onZoomDone = () => {
    const course = zoom?.course;
    if (!course) {
      setZoom(null);
      return;
    }
    const id = course._id || course.id;
    setZoom(null);
    navigate(`/courses/${id}`);
  };

  return (
    <div className="space-y-7">
      <Helmet>
        <title>My Universe | Orbit</title>
        <meta name="description" content="Your courses as planets. Your progress as an exploration arc." />
      </Helmet>

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill text-[11px] font-semibold uppercase tracking-widest text-text-secondary bg-surface border border-border-subtle mb-3">
          <Telescope size={14} style={{ color: accent }} /> Student · My Universe
        </div>
        <h1
          className="text-3xl md:text-4xl font-display font-black tracking-tight"
          style={{
            background: `linear-gradient(135deg, ${accent}, ${nebula?.to || '#f43f5e'})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          My Universe.
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          {enrollments.length === 0
            ? 'No planets yet. The sky is yours to claim.'
            : `${enrollments.length} planet${enrollments.length === 1 ? '' : 's'} in your sky. Tap one to land.`}
        </p>
      </div>

      {/* UNIVERSE — planets OR empty state */}
      {enrollments.length === 0 ? (
        <UniverseEmpty />
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-2xl p-6 md:p-10 min-h-[480px] overflow-hidden"
          style={{
            ...surfaceRecipe('student'),
            border: borderTint(nebula, 18),
            background: `radial-gradient(ellipse at 50% 50%, ${accent}0a, rgba(6,8,16,0.6) 70%)`,
            boxShadow: tintHalo(nebula, 24),
          }}
        >
          {/* Soft dust background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.04), transparent 30%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.03), transparent 30%)',
            }}
          />

          {/* The planets — laid out in a non-colliding grid */}
          <div
            className="relative grid items-end justify-items-center gap-x-6 gap-y-8"
            style={{
              gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(enrollments.length * 1.4))}, minmax(0, 1fr))`,
            }}
          >
            {layout.map(({ enrollment, idx }) => (
              <div
                key={enrollment._id || idx}
                ref={(el) => { planetRefs.current[idx] = el; }}
              >
                <Planet
                  enrollment={enrollment}
                  onZoom={(e, c) => onPlanetTap(e, c, idx)}
                  size={110}
                  index={idx}
                />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Camera zoom transit (portal to document.body handled by CameraZoom) */}
      {zoom && (
        <CameraZoom
          sourceRect={zoom.sourceRect}
          course={zoom.course}
          onDone={onZoomDone}
          onCancel={() => setZoom(null)}
        />
      )}
    </div>
  );
};

export default Universe;
