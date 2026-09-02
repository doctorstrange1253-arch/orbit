/**
 * MentorEditorial — a small set of editorial primitives the V3 mentor
 * surfaces compose with. They use the V3 type scale already loaded
 * (Playfair Display via --font-editorial, Cormorant via --font-serif,
 * JetBrains Mono via --font-mono) so they sit naturally next to the
 * MyOrbit issue. Everything is hairline + serif + mono — no glass,
 * no gradient text, no animated borders.
 */

export function MentorEyebrow({ children, className = '' }) {
  return (
    <span
      className={`font-mono uppercase ${className}`}
      style={{
        fontSize: '0.66rem',
        letterSpacing: '0.22em',
        fontWeight: 700,
        color: 'rgba(245,245,245,0.55)',
      }}
    >
      {children}
    </span>
  );
}

export function MentorTitle({ children, size = 'lg', className = '', style = {} }) {
  const fontSize = size === 'xl'
    ? 'clamp(2.4rem, 5.4vw, 4.2rem)'
    : size === 'lg'
      ? 'clamp(1.9rem, 3.8vw, 2.8rem)'
      : 'clamp(1.4rem, 2.6vw, 1.9rem)';
  return (
    <h1
      className={className}
      style={{
        fontFamily: 'var(--font-editorial)',
        fontStyle: 'italic',
        fontWeight: 700,
        lineHeight: 0.98,
        letterSpacing: '-0.025em',
        fontSize,
        color: 'var(--text-primary)',
        margin: 0,
        ...style,
      }}
    >
      {children}
    </h1>
  );
}

export function MentorDeck({ children, className = '', style = {} }) {
  return (
    <p
      className={className}
      style={{
        fontFamily: 'var(--font-serif)',
        fontStyle: 'italic',
        color: 'rgba(245,245,245,0.70)',
        fontSize: '1.05rem',
        lineHeight: 1.45,
        ...style,
      }}
    >
      {children}
    </p>
  );
}

export function MentorRule({ className = '' }) {
  return (
    <div
      className={className}
      aria-hidden="true"
      style={{ height: 1, background: 'rgba(255,255,255,0.10)', width: '100%' }}
    />
  );
}

export function MentorDotLeader({ className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        flex: 1,
        height: 1,
        background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0.5px, transparent 0.5px) 0 50% / 6px 1px repeat-x',
        minWidth: 24,
      }}
    />
  );
}

export function MentorTag({ tone = 'neutral', children, className = '' }) {
  const styles = {
    neutral: { color: 'rgba(245,245,245,0.70)', borderColor: 'rgba(255,255,255,0.18)' },
    accent:  { color: 'var(--text-primary)',    borderColor: 'var(--text-primary)' },
    success: { color: 'rgba(110,231,183,1)',    borderColor: 'rgba(110,231,183,0.40)' },
    warning: { color: 'rgba(251,191,36,1)',     borderColor: 'rgba(251,191,36,0.40)' },
    danger:  { color: 'rgba(252,165,165,1)',    borderColor: 'rgba(252,165,165,0.40)' },
  }[tone] || {};
  return (
    <span
      className={`inline-flex items-center font-mono uppercase ${className}`}
      style={{
        fontSize: '0.58rem',
        letterSpacing: '0.20em',
        fontWeight: 700,
        padding: '3px 8px',
        border: `1px solid ${styles.borderColor}`,
        background: 'transparent',
        ...styles,
      }}
    >
      {children}
    </span>
  );
}

export function MentorSectionHeader({ eyebrow, title, children, className = '' }) {
  return (
    <div className={className}>
      {eyebrow && <MentorEyebrow>{eyebrow}</MentorEyebrow>}
      {title && (
        <div className="mt-1.5">
          <MentorTitle size="md">{title}</MentorTitle>
        </div>
      )}
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}

export function MentorStat({ label, value, hint, tone = 'neutral', align = 'left' }) {
  const valueColor = tone === 'accent'
    ? 'var(--text-primary)'
    : tone === 'success'
      ? 'rgba(110,231,183,1)'
      : tone === 'warning'
        ? 'rgba(251,191,36,1)'
        : 'var(--text-primary)';
  return (
    <div
      className="px-3 md:px-5 py-3"
      style={{
        textAlign: align,
        borderRight: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-editorial)',
          fontStyle: 'italic',
          fontWeight: 700,
          fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
          lineHeight: 0.95,
          letterSpacing: '-0.025em',
          color: valueColor,
        }}
      >
        {value}
      </div>
      <div
        className="font-mono uppercase"
        style={{
          fontSize: '0.60rem',
          letterSpacing: '0.22em',
          fontWeight: 700,
          color: 'rgba(245,245,245,0.55)',
          marginTop: 6,
        }}
      >
        {label}
      </div>
      {hint && (
        <div
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            color: 'rgba(245,245,245,0.55)',
            fontSize: '0.85rem',
            marginTop: 4,
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}

export function MentorBackLink({ to = -1, children = 'Back', className = '' }) {
  return (
    <a
      href={to === -1 ? '#' : to}
      onClick={(e) => {
        if (to === -1) {
          e.preventDefault();
          window.history.back();
        }
      }}
      className={`inline-flex items-center gap-1.5 font-mono uppercase ${className}`}
      style={{
        fontSize: '0.62rem',
        letterSpacing: '0.22em',
        fontWeight: 700,
        color: 'rgba(245,245,245,0.50)',
        textDecoration: 'none',
      }}
    >
      <span aria-hidden style={{ width: 16, display: 'inline-block' }}>←</span>
      {children}
    </a>
  );
}
