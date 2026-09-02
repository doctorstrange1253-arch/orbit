import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Telescope } from 'lucide-react';
import Planet from '../../soul/universe/Planet';
import CameraZoom from '../../soul/universe/CameraZoom';
import UniverseEmpty from '../../soul/universe/UniverseEmpty';
import SectionBoundary from '../../soul/editorial/SectionBoundary';
import { Eyebrow, Title, Deck, Stat } from '../../soul/editorial/primitives';
import { courses } from '../../services/courses';

const HAIRLINE = 'rgba(255,255,255,0.10)';

const Universe = () => {
  const navigate = useNavigate();
  const [zoom, setZoom] = useState(null);
  const planetRefs = useRef({});

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['enrollments', 'me'],
    queryFn: () => courses.myEnrollments(),
    staleTime: 60_000,
  });

  const stats = useMemo(() => {
    const finished = enrollments.filter((e) => e.completedAt).length;
    const active = enrollments.filter((e) => !e.completedAt && (e.progressPct || 0) > 0).length;
    const lessonsDone = enrollments.reduce((n, e) => n + (e.completedLessonIds?.length || 0), 0);
    return { total: enrollments.length, active, finished, lessonsDone };
  }, [enrollments]);

  const nextUp = useMemo(() => {
    const row = enrollments
      .filter((e) => !e.completedAt && e.nextLesson)
      .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))[0];
    return row ? { row, lesson: row.nextLesson } : null;
  }, [enrollments]);

  const columns = enrollments.length <= 1 ? 1 : Math.ceil(Math.sqrt(enrollments.length * 1.4));

  const onPlanetTap = (enrollment, course, idx) => {
    const el = planetRefs.current[idx];
    if (!el) return;
    setZoom({ sourceRect: el.getBoundingClientRect(), enrollment, course });
  };

  const onZoomDone = () => {
    const id = zoom?.course?._id || zoom?.enrollment?.courseId;
    setZoom(null);
    if (id) navigate(`/courses/${id}`);
  };

  return (
    <div className="max-w-[1180px] mx-auto">
      <Helmet>
        <title>My Universe · Orbit</title>
        <meta name="description" content="Your courses as planets. Your progress as an exploration arc." />
      </Helmet>

      <header className="pt-4 pb-8" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
        <div className="flex items-center gap-2 mb-3">
          <Telescope size={14} style={{ color: 'rgba(245,245,245,0.55)' }} />
          <Eyebrow>Student · My Universe</Eyebrow>
        </div>
        <Title size="xl">Your universe</Title>
        <div className="mt-3 max-w-2xl">
          <Deck>
            {enrollments.length === 0
              ? 'Nothing is in orbit yet. Enrol in a course and the first planet appears here.'
              : `${enrollments.length} planet${enrollments.length === 1 ? '' : 's'} in your sky. The atmosphere clears as you learn.`}
          </Deck>
        </div>
      </header>

      {nextUp && (
        <SectionBoundary name="Next up">
          <section className="py-6" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
            <Eyebrow>Next up</Eyebrow>
            <div className="mt-3 flex items-end justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <Title size="sm" as="h2">{nextUp.lesson.title}</Title>
                <div
                  className="mt-1.5 font-mono uppercase"
                  style={{ fontSize: '0.58rem', letterSpacing: '0.20em', fontWeight: 700, color: 'rgba(245,245,245,0.55)' }}
                >
                  {nextUp.row.course.title} · {nextUp.row.progressPct || 0}% complete
                </div>
              </div>
              <button
                onClick={() => navigate(`/courses/${nextUp.row.courseId}/learn/${nextUp.lesson._id}`)}
                className="font-mono uppercase"
                style={{
                  fontSize: '0.62rem',
                  letterSpacing: '0.22em',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.30)',
                  padding: '9px 15px',
                  cursor: 'pointer',
                }}
              >
                Resume →
              </button>
            </div>
          </section>
        </SectionBoundary>
      )}

      {enrollments.length > 0 && (
        <SectionBoundary name="By the numbers">
          <section className="py-6" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
            <div className="grid grid-cols-2 md:grid-cols-4" style={{ border: `1px solid ${HAIRLINE}` }}>
              <Stat label="Courses" value={stats.total} />
              <Stat label="In progress" value={stats.active} />
              <Stat label="Finished" value={stats.finished} tone="success" />
              <Stat label="Lessons done" value={stats.lessonsDone} last />
            </div>
          </section>
        </SectionBoundary>
      )}

      <SectionBoundary name="The sky">
        <section className="py-8" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
          {isLoading ? (
            <p
              className="py-10 text-center"
              style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'rgba(245,245,245,0.55)' }}
            >
              Reading the sky.
            </p>
          ) : enrollments.length === 0 ? (
            <UniverseEmpty />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative p-6 md:p-10 min-h-[420px]"
              style={{ border: `1px solid ${HAIRLINE}` }}
            >
              <div
                className="relative grid items-end justify-items-center gap-x-6 gap-y-8"
                style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
              >
                {enrollments.map((enrollment, idx) => (
                  <div key={enrollment._id} ref={(el) => { planetRefs.current[idx] = el; }}>
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
        </section>
      </SectionBoundary>

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
