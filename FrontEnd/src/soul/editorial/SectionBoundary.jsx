import ErrorBoundary from '../../components/common/ErrorBoundary';

const SectionBoundary = ({ name, children }) => (
  <ErrorBoundary
    fallback={
      <section
        className="py-8"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        aria-label={`${name} (unavailable)`}
      >
        <p
          className="font-mono uppercase tracking-[0.28em]"
          style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}
        >
          {name} · Unavailable this issue.
        </p>
      </section>
    }
  >
    {children}
  </ErrorBoundary>
);

export default SectionBoundary;
