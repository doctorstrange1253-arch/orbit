import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { GraduationCap, BookOpen } from 'lucide-react';
import { courses } from '../../services/courses';
import SectionBoundary from '../../soul/editorial/SectionBoundary';
import { Eyebrow, Title, Deck, DotLeader, Tag } from '../../soul/editorial/primitives';
import { StageRail } from '../../soul/gameEngine/StageRail';

const HAIRLINE = 'rgba(255,255,255,0.10)';
const HAIRLINE_SOFT = 'rgba(255,255,255,0.06)';
const MUTED = 'rgba(245,245,245,0.55)';

const MONO_MICRO = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.58rem',
  letterSpacing: '0.20em',
  fontWeight: 700,
  textTransform: 'uppercase',
};

const ProgressRule = ({ pct }) => (
  <div style={{ height: 2, background: 'rgba(255,255,255,0.08)', width: '100%' }} aria-hidden="true">
    <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, pct))}%`, background: 'var(--text-primary)' }} />
  </div>
);

const Row = ({ row, showResume }) => {
  const navigate = useNavigate();
  const course = row.course || {};
  const total = course.lessonsCount || course.lessons?.length || 0;
  const done = row.completedLessonIds?.length || 0;
  const next = showResume ? row.nextLesson : null;

  return (
    <article className="py-5" style={{ borderBottom: `1px solid ${HAIRLINE_SOFT}` }}>
      <div className="flex items-start gap-4">
        <div
          className="w-16 h-16 flex-shrink-0 overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${HAIRLINE_SOFT}` }}
        >
          {course.thumbnail?.url && (
            <img src={course.thumbnail.url} alt="" className="w-full h-full object-cover" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <Link to={`/courses/${row.courseId}`} style={{ textDecoration: 'none' }}>
            <Title size="sm" as="h3">{course.title || 'Untitled course'}</Title>
          </Link>

          <div className="mt-2 flex items-baseline gap-3">
            <span style={{ ...MONO_MICRO, color: MUTED, flexShrink: 0 }}>
              {course.mentor?.name || 'Orbit mentor'}
            </span>
            <DotLeader />
            <span style={{ ...MONO_MICRO, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
              {done}/{total} lessons
            </span>
          </div>

          <div className="mt-3">
            <ProgressRule pct={row.progressPct || 0} />
          </div>

          <div className="mt-2.5 flex items-center gap-3 flex-wrap">
            <StageRail course={course} completedLessonIds={row.completedLessonIds} compact />
            <span style={{ ...MONO_MICRO, color: MUTED, fontVariantNumeric: 'tabular-nums' }}>
              {row.progressPct || 0}%
            </span>
            <span style={{ ...MONO_MICRO, color: 'rgba(245,245,245,0.40)' }}>
              Touched {row.seenLabel}
            </span>
            {row.completedAt && <Tag tone="success">Certified</Tag>}
          </div>
        </div>

        <div className="flex-shrink-0 flex flex-col items-end gap-2">
          {next ? (
            <button
              onClick={() => navigate(`/courses/${row.courseId}/learn/${next._id}`)}
              className="font-mono uppercase"
              style={{
                fontSize: '0.60rem',
                letterSpacing: '0.22em',
                fontWeight: 700,
                color: 'var(--text-primary)',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.30)',
                padding: '8px 13px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Resume →
            </button>
          ) : row.completedAt ? (
            <Link
              to={row.certificateId
                ? `/courses/${row.courseId}/certificate/${row.certificateId}`
                : `/student/certificates`}
              className="font-mono uppercase"
              style={{
                fontSize: '0.60rem',
                letterSpacing: '0.22em',
                fontWeight: 700,
                color: 'rgba(110,231,183,1)',
                textDecoration: 'none',
                border: '1px solid rgba(110,231,183,0.40)',
                padding: '8px 13px',
                whiteSpace: 'nowrap',
              }}
            >
              Certificate →
            </Link>
          ) : (
            <Link
              to={`/courses/${row.courseId}/learn`}
              className="font-mono uppercase"
              style={{
                fontSize: '0.60rem',
                letterSpacing: '0.22em',
                fontWeight: 700,
                color: 'var(--text-primary)',
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.30)',
                padding: '8px 13px',
                whiteSpace: 'nowrap',
              }}
            >
              Begin →
            </Link>
          )}
        </div>
      </div>
    </article>
  );
};

const Group = ({ numeral, title, blurb, rows, showResume }) => {
  if (!rows.length) return null;
  return (
    <SectionBoundary name={title}>
      <section className="py-8" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
        <div className="flex items-baseline gap-3 mb-1">
          <Eyebrow>{numeral}</Eyebrow>
          <Title size="md" as="h2">{title}</Title>
        </div>
        <div className="mb-4 max-w-xl">
          <Deck style={{ fontSize: '0.98rem' }}>{blurb}</Deck>
        </div>
        <div>
          {rows.map((row) => <Row key={row._id} row={row} showResume={showResume} />)}
        </div>
      </section>
    </SectionBoundary>
  );
};

const Learning = () => {
  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['enrollments', 'me'],
    queryFn: () => courses.myEnrollments(),
    staleTime: 60_000,
  });

  const groups = useMemo(() => {
    const withCourse = enrollments.filter((e) => e.course);
    const byRecent = (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    return {
      active: withCourse.filter((e) => !e.completedAt && (e.progressPct || 0) > 0).sort(byRecent),
      finished: withCourse.filter((e) => e.completedAt).sort(byRecent),
      fresh: withCourse.filter((e) => !e.completedAt && !(e.progressPct > 0)).sort(byRecent),
    };
  }, [enrollments]);

  const empty = !isLoading && enrollments.length === 0;

  return (
    <div className="max-w-[1180px] mx-auto">
      <Helmet>
        <title>My Learning · Orbit</title>
        <meta name="description" content="Every course you have enrolled in, with progress and where to pick up." />
      </Helmet>

      <header className="pt-4 pb-8" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap size={14} style={{ color: MUTED }} />
          <Eyebrow>Student · The Ledger</Eyebrow>
        </div>
        <Title size="xl">Everything you are learning</Title>
        <div className="mt-3 max-w-2xl">
          <Deck>
            One line per course, in the order you last touched it. The percentage is
            lessons completed, not time spent.
          </Deck>
        </div>
      </header>

      {isLoading && (
        <p
          className="py-14 text-center"
          style={{ fontFamily: 'var(--font-serif)', color: MUTED }}
        >
          Reading the ledger.
        </p>
      )}

      {empty && (
        <section className="py-14">
          <Title size="md" as="h2">Nothing on the shelf yet</Title>
          <div className="mt-3 max-w-lg">
            <Deck>
              The ledger fills itself the moment you enrol. Start with anything —
              the first course is always the slowest.
            </Deck>
          </div>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 mt-6 font-mono uppercase"
            style={{
              fontSize: '0.62rem',
              letterSpacing: '0.22em',
              fontWeight: 700,
              color: 'var(--text-primary)',
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.30)',
              padding: '10px 16px',
            }}
          >
            <BookOpen size={12} /> Browse courses
          </Link>
        </section>
      )}

      <Group
        numeral="I"
        title="In progress"
        blurb="Open, partly done, waiting for you."
        rows={groups.active}
        showResume
      />
      <Group
        numeral="II"
        title="Finished"
        blurb="Completed end to end. The certificate is yours."
        rows={groups.finished}
      />
      <Group
        numeral="III"
        title="Not started"
        blurb="Enrolled but untouched. No judgement — the sky is patient."
        rows={groups.fresh}
      />
    </div>
  );
};

export default Learning;
