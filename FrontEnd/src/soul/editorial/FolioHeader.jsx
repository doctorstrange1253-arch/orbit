/**
 * soul/editorial/FolioHeader.jsx
 *
 * A magazine-style section header. Three voices stacked left-to-right:
 *   1. A huge serif folio (I, II, III, …) in the soul's accent color
 *   2. A mono-caps eyebrow line above the section name
 *   3. A serif section name (Cormorant Garamond) — book-grade, italic on hover
 *
 * The folio is the visual anchor — the same number that lives inside
 * the section body, but at 4× the size, so the eye finds it before it
 * finds the title. This is the design pattern from print magazines
 * (The New Yorker, The Atlantic) where the section opens with a big
 * decorative numeral and a thin caption beneath.
 *
 * Hairline rule above the folio, hairline rule below the section name.
 * Two hairlines + a serif numeral + a sans title = unmistakable as a
 * magazine spread, not a dashboard.
 *
 * Props:
 *   folio:    'I' | 'II' | 'III' | 'IV' | 'V' | 'VI'  (also accepts strings)
 *   eyebrow:  string (e.g., "Section two")
 *   title:    string (e.g., "By the numbers")
 *   note:     optional small italic line under the title
 *   accent:   hex color for the folio
 */

export default function FolioHeader({ folio, eyebrow, title, note, accent = '#22d3ee' }) {
  return (
    <div className="relative pt-6 pb-5">
      {/* hairline above */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 1,
          background: 'linear-gradient(90deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 60%, transparent 100%)',
        }}
      />
      <div className="flex items-end gap-5 md:gap-7">
        {/* Folio — the big serif numeral. The accent tints only the glyph;
            the slab serif (Playfair) keeps it feeling editorial even on
            a transparent text-fill-color background. */}
        <div
          aria-hidden
          style={{
            fontFamily: 'var(--font-editorial)',
            fontWeight: 800,
            fontStyle: 'italic',
            // Mid-sized folio (was clamp(3.2rem, 6.4vw, 4.6rem) — now
            // ~3rem max). A subtle accent-tinted glow keeps the
            // magazine feel without the page-reading-as-a-spread
            // loudness the user flagged.
            fontSize: 'clamp(2.2rem, 4.4vw, 3rem)',
            lineHeight: 0.86,
            color: accent,
            letterSpacing: '-0.04em',
            flexShrink: 0,
            minWidth: 'clamp(48px, 6.4vw, 64px)',
            textShadow: `0 0 18px ${accent}55, 0 0 6px ${accent}33`,
          }}
        >
          {folio}
        </div>
        <div className="flex-1 min-w-0 pb-1">
          {eyebrow && (
            <p
              className="font-mono uppercase"
              style={{
                fontSize: '0.66rem',
                letterSpacing: '0.28em',
                color: 'rgba(245,245,245,0.62)',
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              {eyebrow}
            </p>
          )}
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.7rem, 3.4vw, 2.4rem)',
              lineHeight: 1.05,
              fontWeight: 500,
              letterSpacing: '-0.01em',
              color: 'var(--text-primary)',
              fontStyle: 'normal',
            }}
          >
            {title}
          </h2>
          {note && (
            <p
              className="mt-2 italic"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.02rem',
                lineHeight: 1.45,
                color: 'rgba(245,245,245,0.66)',
                fontWeight: 400,
              }}
            >
              {note}
            </p>
          )}
          {/* hairline below — short, offset right so it doesn't compete
              with the folio. */}
          <div
            aria-hidden
            style={{
              marginTop: 12,
              width: 64,
              height: 1,
              background: accent,
              opacity: 0.6,
            }}
          />
        </div>
      </div>
    </div>
  );
}
