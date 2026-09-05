import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Award, BookOpen } from 'lucide-react';
import { courses } from '../../services/courses';
import SectionBoundary from '../../soul/editorial/SectionBoundary';
import { Eyebrow, Title, Deck, DotLeader, Stat } from '../../soul/editorial/primitives';

const HAIRLINE = 'rgba(255,255,255,0.10)';
const HAIRLINE_SOFT = 'rgba(255,255,255,0.06)';
const MUTED = 'rgba(245,245,245,0.55)';
const SEAL = 'rgba(251,191,36,1)';

const MONO_MICRO = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.58rem',
  letterSpacing: '0.20em',
  fontWeight: 700,
  textTransform: 'uppercase',
};

const LONG_DATE = { day: 'numeric', month: 'long', year: 'numeric' };

const Seal = ({ size = 42 }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" aria-hidden="true" style={{ flexShrink: 0 }}>
    <circle cx="22" cy="22" r="20" fill="none" stroke={SEAL} strokeOpacity="0.35" strokeWidth="1" />
    <circle cx="22" cy="22" r="15" fill="none" stroke={SEAL} strokeOpacity="0.55" strokeWidth="0.6" />
    <path
      d="M22 12.5l2.6 5.6 6.1.8-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.8z"
      fill="none"
      stroke={SEAL}
      strokeWidth="1"
      strokeLinejoin="round"
    />
  </svg>
);

const CertificateRow = ({ row }) => {
  const course = row.course || {};
  const issued = row.completedAt ? new Date(row.completedAt) : null;
  const href = row.certificateId
    ? `/courses/${row.courseId}/certificate/${row.certificateId}`
    : `/courses/${row.courseId}/certificate/new`;

  return (
    <article className="py-6" style={{ borderBottom: `1px solid ${HAIRLINE_SOFT}` }}>
      <div className="flex items-start gap-5">
        <Seal />
        <div className="flex-1 min-w-0">
          <Title size="sm" as="h3">{course.title || 'Untitled course'}</Title>
          <div className="mt-2 flex items-baseline gap-3">
            <span style={{ ...MONO_MICRO, color: MUTED, flexShrink: 0 }}>
              {course.mentor?.name || 'Orbit mentor'}
            </span>
            <DotLeader />
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '0.95rem',
                color: 'rgba(245,245,245,0.72)',
                flexShrink: 0,
              }}
            >
              {issued ? issued.toLocaleDateString(undefined, LONG_DATE) : 'recently'}
            </span>
          </div>
          {row.certificateId && (
            <div
              className="mt-2"
              style={{ ...MONO_MICRO, color: 'rgba(245,245,245,0.40)', letterSpacing: '0.16em' }}
            >
              {row.certificateId}
            </div>
          )}
        </div>
        <Link
          to={href}
          className="flex-shrink-0 font-mono uppercase"
          style={{
            fontSize: '0.60rem',
            letterSpacing: '0.22em',
            fontWeight: 700,
            color: SEAL,
            textDecoration: 'none',
            border: `1px solid ${SEAL.replace('1)', '0.40)')}`,
            padding: '8px 13px',
            whiteSpace: 'nowrap',
          }}
        >
          View →
        </Link>
      </div>
    </article>
  );
};

const Certificates = () => {
  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['enrollments', 'me'],
    queryFn: () => courses.myEnrollments(),
    staleTime: 60_000,
  });

  const { earned, inFlight } = useMemo(() => {
    const withCourse = enrollments.filter((e) => e.course);
    return {
      earned: withCourse
        .filter((e) => e.completedAt)
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)),
      inFlight: withCourse
        .filter((e) => !e.completedAt && (e.progressPct || 0) >= 50)
        .sort((a, b) => (b.progressPct || 0) - (a.progressPct || 0)),
    };
  }, [enrollments]);

  const lessonsBehind = useMemo(
    () => earned.reduce((n, e) => n + (e.completedLessonIds?.length || 0), 0),
    [earned]
  );

  return (
    <div className="max-w-[1180px] mx-auto">
      <Helmet>
        <title>Certificates · Orbit</title>
        <meta name="description" content="Every course you have finished on Orbit, and the certificate it earned." />
      </Helmet>

      <header className="pt-4 pb-8" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
        <div className="flex items-center gap-2 mb-3">
          <Award size={14} style={{ color: MUTED }} />
          <Eyebrow>Student · The Record</Eyebrow>
        </div>
        <Title size="xl">What you finished</Title>
        <div className="mt-3 max-w-2xl">
          <Deck>
            A certificate is issued the moment a course reaches one hundred percent.
            Each one is signed, dated, and shareable.
          </Deck>
        </div>
      </header>

      {isLoading ? (
        <p
          className="py-14 text-center"
          style={{ fontFamily: 'var(--font-serif)', color: MUTED }}
        >
          Reading the record.
        </p>
      ) : earned.length === 0 ? (
        <section className="py-14">
          <Title size="md" as="h2">The record is empty, for now</Title>
          <div className="mt-3 max-w-lg">
            <Deck>
              {inFlight.length > 0
                ? `You are past halfway on ${inFlight.length} course${inFlight.length === 1 ? '' : 's'}. Finish one and this page stops being empty.`
                : 'Finish a course end to end and the first certificate lands here.'}
            </Deck>
          </div>
          <Link
            to={inFlight.length > 0 ? '/student/learning' : '/courses'}
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
            <BookOpen size={12} /> {inFlight.length > 0 ? 'Back to my learning' : 'Browse courses'}
          </Link>
        </section>
      ) : (
        <>
          <SectionBoundary name="By the numbers">
            <section className="py-6" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Stat label="Certificates" value={earned.length} tone="warning" />
                <Stat label="Lessons behind them" value={lessonsBehind} />
                <Stat label="Near the finish" value={inFlight.length} last />
              </div>
            </section>
          </SectionBoundary>

          <SectionBoundary name="Certificates">
            <section className="py-8" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
              <div className="flex items-baseline gap-3 mb-5">
                <Eyebrow>I</Eyebrow>
                <Title size="md" as="h2">Earned</Title>
              </div>
              {earned.map((row) => <CertificateRow key={row._id} row={row} />)}
            </section>
          </SectionBoundary>

          {inFlight.length > 0 && (
            <SectionBoundary name="Almost there">
              <section className="py-8" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
                <div className="flex items-baseline gap-3 mb-1">
                  <Eyebrow>II</Eyebrow>
                  <Title size="md" as="h2">Almost there</Title>
                </div>
                <div className="mb-4 max-w-xl">
                  <Deck style={{ fontSize: '0.98rem' }}>
                    Past halfway. Close these out and they move up the page.
                  </Deck>
                </div>
                {inFlight.map((row) => (
                  <div
                    key={row._id}
                    className="flex items-baseline gap-3 py-3"
                    style={{ borderBottom: `1px solid ${HAIRLINE_SOFT}` }}
                  >
                    <Link
                      to={`/courses/${row.courseId}/learn`}
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1.05rem',
                        color: 'var(--text-primary)',
                        textDecoration: 'none',
                        flexShrink: 0,
                      }}
                    >
                      {row.course.title}
                    </Link>
                    <DotLeader />
                    <span
                      style={{
                        ...MONO_MICRO,
                        color: 'var(--text-primary)',
                        fontVariantNumeric: 'tabular-nums',
                        flexShrink: 0,
                      }}
                    >
                      {row.progressPct}%
                    </span>
                  </div>
                ))}
              </section>
            </SectionBoundary>
          )}
        </>
      )}
    </div>
  );
};

export default Certificates;
