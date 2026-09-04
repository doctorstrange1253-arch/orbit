import { motion } from 'framer-motion';
import { getLayeredNebula } from '../palette';

export const STUDIO_EDGE = 'rgba(255,255,255,0.09)';
export const STUDIO_EDGE_SOFT = 'rgba(255,255,255,0.06)';

export function studioSurface(soulId = 'mentor', accent) {
  const nb = getLayeredNebula(soulId, accent);
  const from = nb?.from || '#a78bfa';
  const to = nb?.to || '#3b82f6';
  return {
    position: 'relative',
    background: `
      radial-gradient(120% 140% at 0% 0%, color-mix(in oklab, ${from} 9%, transparent) 0%, transparent 58%),
      radial-gradient(120% 140% at 100% 100%, color-mix(in oklab, ${to} 7%, transparent) 0%, transparent 62%),
      linear-gradient(180deg, #16142c 0%, #0d0c1c 100%)
    `,
    border: `1px solid ${STUDIO_EDGE}`,
    boxShadow: `
      inset 0 1px 0 rgba(255,255,255,0.07),
      0 1px 0 rgba(0,0,0,0.5),
      0 18px 44px -22px color-mix(in oklab, ${from} 34%, transparent),
      0 30px 70px -40px rgba(0,0,0,0.85)
    `,
    '--studio-from': from,
    '--studio-to': to,
    '--studio-gradient': `linear-gradient(135deg, ${from}, ${to})`,
  };
}

export function StudioPanel({
  children, soul = 'mentor', accent, className = '', style = {},
  radius = 20, as: Tag = 'div', ...rest
}) {
  return (
    <Tag
      className={className}
      style={{ ...studioSurface(soul, accent), borderRadius: radius, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export const REVEAL = {
  hidden: { opacity: 0, y: 14 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.04 * i, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function Reveal({ children, index = 0, className = '', style = {} }) {
  return (
    <motion.div
      variants={REVEAL}
      initial="hidden"
      animate="show"
      custom={index}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// A bar row that reads as a distribution rather than a decoration: every
// segment is a real share of `values`, and an empty series still draws the
// track so the cell never collapses to a bare zero.
export function Sparkbars({ values = [], height = 26, gap = 3, tone }) {
  const max = Math.max(1, ...values.map((v) => Number(v) || 0));
  const bars = values.length ? values : [0, 0, 0, 0, 0, 0];
  return (
    <div className="flex items-end w-full" style={{ height, gap }} aria-hidden>
      {bars.map((v, i) => {
        const share = Math.max(0.06, (Number(v) || 0) / max);
        return (
          <motion.span
            key={i}
            initial={{ height: 2, opacity: 0 }}
            animate={{ height: `${share * 100}%`, opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.05 + i * 0.035, ease: [0.22, 1, 0.36, 1] }}
            style={{
              flex: 1,
              minWidth: 3,
              borderRadius: 2,
              background: v
                ? (tone || 'var(--studio-gradient, linear-gradient(180deg,#a78bfa,#3b82f6))')
                : 'rgba(255,255,255,0.07)',
            }}
          />
        );
      })}
    </div>
  );
}

export function StudioStat({ label, value, hint, Icon, series, index = 0, tone }) {
  return (
    <Reveal index={index}>
      <StudioPanel radius={18} className="px-4 pt-3.5 pb-3 h-full group">
        <div className="flex items-start justify-between gap-3">
          <span
            className="font-mono uppercase"
            style={{ fontSize: '0.58rem', letterSpacing: '0.2em', fontWeight: 700, color: 'rgba(245,245,245,0.5)' }}
          >
            {label}
          </span>
          {Icon && (
            <span
              className="inline-flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
              style={{
                width: 26, height: 26, borderRadius: 8,
                background: 'color-mix(in oklab, var(--studio-from) 16%, transparent)',
                border: '1px solid color-mix(in oklab, var(--studio-from) 28%, transparent)',
                color: 'var(--studio-from)',
              }}
            >
              <Icon size={13} />
            </span>
          )}
        </div>

        <div
          className="mt-1.5"
          style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 'clamp(1.7rem, 3vw, 2.3rem)', lineHeight: 1,
            letterSpacing: '-0.035em', color: 'var(--text-primary)',
          }}
        >
          {value}
        </div>

        {hint && (
          <div className="mt-1 text-[11px] leading-snug" style={{ color: 'rgba(245,245,245,0.45)' }}>
            {hint}
          </div>
        )}

        {series && (
          <div className="mt-2.5">
            <Sparkbars values={series} tone={tone} />
          </div>
        )}
      </StudioPanel>
    </Reveal>
  );
}

// The page masthead. An aurora wash and a hairline horizon behind the title
// so the header reads as a band rather than text floating on the starfield.
export function StudioMasthead({ eyebrow, Icon, title, deck, children, soul = 'mentor', index = 0 }) {
  return (
    <Reveal index={index}>
      <StudioPanel radius={24} className="overflow-hidden mb-4" soul={soul}>
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 pointer-events-none"
          style={{
            height: 150,
            background: 'radial-gradient(90% 130% at 18% 0%, color-mix(in oklab, var(--studio-from) 26%, transparent) 0%, transparent 68%)',
            filter: 'blur(6px)',
          }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 pointer-events-none"
          style={{ top: 0, height: 1, background: 'linear-gradient(90deg, transparent, color-mix(in oklab, var(--studio-from) 60%, transparent), transparent)' }}
        />
        <div className="relative px-5 md:px-7 py-6 md:py-7">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="min-w-0">
              {eyebrow && (
                <span
                  className="inline-flex items-center gap-1.5 font-mono uppercase"
                  style={{
                    fontSize: '0.58rem', letterSpacing: '0.24em', fontWeight: 700,
                    color: 'var(--studio-from)',
                    padding: '4px 9px', borderRadius: 999,
                    background: 'color-mix(in oklab, var(--studio-from) 12%, transparent)',
                    border: '1px solid color-mix(in oklab, var(--studio-from) 26%, transparent)',
                  }}
                >
                  {Icon && <Icon size={11} />}
                  {eyebrow}
                </span>
              )}
              <h1
                className="mt-3"
                style={{
                  fontFamily: 'var(--font-display)', fontWeight: 800,
                  fontSize: 'clamp(2rem, 4.4vw, 3.1rem)', lineHeight: 1.03,
                  letterSpacing: '-0.035em', margin: 0,
                  background: 'var(--studio-gradient)',
                  WebkitBackgroundClip: 'text', backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent', paddingBottom: '0.06em',
                }}
              >
                {title}
              </h1>
              {deck && (
                <p
                  className="mt-2 max-w-xl text-sm leading-relaxed"
                  style={{ fontFamily: 'var(--font-sans)', color: 'rgba(245,245,245,0.62)' }}
                >
                  {deck}
                </p>
              )}
            </div>
            {children && <div className="flex-shrink-0">{children}</div>}
          </div>
        </div>
      </StudioPanel>
    </Reveal>
  );
}
