const MUTED = 'rgba(245,245,245,0.55)';
const HAIRLINE = 'rgba(255,255,255,0.10)';
const HAIRLINE_SOFT = 'rgba(255,255,255,0.08)';

const TONES = {
  neutral: { color: 'rgba(245,245,245,0.70)', border: 'rgba(255,255,255,0.18)', rule: 'rgba(255,255,255,0.20)' },
  accent:  { color: 'var(--text-primary)',    border: 'var(--text-primary)',    rule: 'var(--text-primary)' },
  success: { color: 'rgba(110,231,183,1)',    border: 'rgba(110,231,183,0.40)', rule: 'rgba(110,231,183,0.45)' },
  warning: { color: 'rgba(251,191,36,1)',     border: 'rgba(251,191,36,0.40)',  rule: 'rgba(251,191,36,0.45)' },
  danger:  { color: 'rgba(252,165,165,1)',    border: 'rgba(252,165,165,0.40)', rule: 'rgba(252,165,165,0.45)' },
};

export function toneOf(tone) {
  return TONES[tone] || TONES.neutral;
}

export function Eyebrow({ children, className = '', tone, style = {} }) {
  return (
    <span
      className={`font-mono uppercase ${className}`}
      style={{
        fontSize: '0.66rem',
        letterSpacing: '0.22em',
        fontWeight: 700,
        color: tone ? toneOf(tone).color : MUTED,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function Title({ children, size = 'lg', as: Tag = 'h1', gradient, className = '', style = {} }) {
  const fontSize = size === 'xl'
    ? 'clamp(2.4rem, 5.4vw, 4.2rem)'
    : size === 'lg'
      ? 'clamp(1.9rem, 3.8vw, 2.8rem)'
      : size === 'sm'
        ? 'clamp(1.15rem, 2vw, 1.45rem)'
        : 'clamp(1.4rem, 2.6vw, 1.9rem)';
  const clipped = gradient ?? (size === 'xl');
  const paint = clipped
    ? {
        background: 'var(--soul-gradient, linear-gradient(135deg, var(--accent-1), var(--accent-2)))',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        paddingBottom: '0.08em',
      }
    : { color: 'var(--text-primary)' };
  return (
    <Tag
      className={className}
      style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        lineHeight: 1.04,
        letterSpacing: '-0.03em',
        fontSize,
        margin: 0,
        ...paint,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

export function Deck({ children, className = '', style = {} }) {
  return (
    <p
      className={className}
      style={{
        fontFamily: 'var(--font-sans)',
        color: 'rgba(245,245,245,0.70)',
        fontSize: '1.02rem',
        lineHeight: 1.55,
        ...style,
      }}
    >
      {children}
    </p>
  );
}

export function Rule({ className = '', tone, style = {} }) {
  return (
    <div
      className={className}
      aria-hidden="true"
      style={{
        height: 1,
        background: tone ? toneOf(tone).rule : HAIRLINE,
        width: '100%',
        ...style,
      }}
    />
  );
}

export function DotLeader({ className = '' }) {
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

export function Tag({ tone = 'neutral', children, className = '', style = {} }) {
  const t = toneOf(tone);
  return (
    <span
      className={`inline-flex items-center font-mono uppercase ${className}`}
      style={{
        fontSize: '0.58rem',
        letterSpacing: '0.20em',
        fontWeight: 700,
        padding: '3px 8px',
        border: `1px solid ${t.border}`,
        background: 'transparent',
        color: t.color,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function SectionHeader({ eyebrow, title, children, className = '' }) {
  return (
    <div className={className}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      {title && (
        <div className="mt-1.5">
          <Title size="md" as="h2">{title}</Title>
        </div>
      )}
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}

export function Stat({ label, value, hint, tone = 'neutral', align = 'left', last = false, accent }) {
  const valueColor = tone === 'accent'
    ? (accent || 'var(--text-primary)')
    : tone === 'success'
      ? TONES.success.color
      : tone === 'warning'
        ? TONES.warning.color
        : tone === 'danger'
          ? TONES.danger.color
          : 'var(--text-primary)';
  return (
    <div
      className="px-3 md:px-5 py-3"
      style={{
        textAlign: align,
        borderRight: last ? 'none' : `1px solid ${HAIRLINE_SOFT}`,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
          lineHeight: 1.0,
          letterSpacing: '-0.03em',
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
          color: MUTED,
          marginTop: 6,
        }}
      >
        {label}
      </div>
      {hint && (
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            color: MUTED,
            fontSize: '0.82rem',
            marginTop: 4,
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}

export function BackLink({ to = -1, children = 'Back', className = '' }) {
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

export function Panel({ tone, children, className = '', style = {} }) {
  return (
    <div
      className={className}
      style={{
        border: `1px solid ${HAIRLINE}`,
        borderTop: `1px solid ${tone ? toneOf(tone).rule : 'rgba(255,255,255,0.20)'}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export const EDITORIAL_HAIRLINE = HAIRLINE;
export const EDITORIAL_HAIRLINE_SOFT = HAIRLINE_SOFT;
export const EDITORIAL_MUTED = MUTED;
