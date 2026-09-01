/**
 * soul/editorial/EditorialFooter.jsx
 *
 * The colophon — the small print that closes a magazine issue. A
 * single hairline rule, a 2-line statement in mono, and the next
 * issue's date. No CTA, no button. The next issue is just tomorrow.
 */

export default function EditorialFooter() {
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 86400000);
  const tomorrowLabel = tomorrow.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <footer className="pt-10 pb-6">
      <div
        className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem' }}
      >
        <p
          className="font-mono uppercase tracking-[0.22em]"
          style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}
        >
          End of issue. Next issue: {tomorrowLabel}.
        </p>
        <p
          className="font-mono uppercase tracking-[0.22em]"
          style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}
        >
          Orbit · An editorial of one.
        </p>
      </div>
    </footer>
  );
}
