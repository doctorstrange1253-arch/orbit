# 01 Design Tokens

**Owner**: Staff Frontend Engineer + UX Designer  
**Phase**: Phase 3 Design Document #2  
**Status**: Pending User Approval  

---

## 1. Typography Scale

- **Display (Hero/Masterhead titles)**: `font-sans font-extrabold tracking-tight text-2xl md:text-3xl leading-tight`
- **Telemetry / Badges / Metadata**: `font-mono uppercase tracking-widest text-[10px] md:text-xs font-bold`
- **Body / Editorial**: `font-sans text-sm md:text-base leading-relaxed text-text-secondary`

---

## 2. Spacing & Elevation (Elevation via Glassmorphism)

- **Spacing Base unit**: 4px (`0.25rem`). Scale: 1 (4px), 2 (8px), 3 (12px), 4 (16px), 6 (24px), 8 (32px), 12 (48px).
- **Surface Elevation Layers**:
  - `layer-0`: `#020617` (Canvas background)
  - `layer-1`: `bg-slate-900/80 backdrop-blur-md border border-slate-800 shadow-xl` (Cards & Panels)
  - `layer-2`: `bg-slate-800/90 backdrop-blur-lg border border-slate-700 shadow-2xl ring-1 ring-white/10` (Modals & Dropdowns)

---

## 3. Borders, Radii, and Blur

- **Border Radius**: `rounded-xl` (12px) for standard cards; `rounded-2xl` (16px) for major containers; `rounded-pill` (9999px) for status badges and pill buttons.
- **Border Subtlety**: `border border-slate-800/60` (default) with `hover:border-cyan-500/40` on interactive states.
- **Backdrop Blur**: `backdrop-blur-md` (12px blur) universally applied across glass surfaces.

---

## 4. Motion Durations & Easings

- **Transitions**: `transition-all duration-300 ease-out`
- **Spring Physics**: `{ stiffness: 300, damping: 30 }` (Framer Motion)
- **Reduced Motion Override**: When `prefers-reduced-motion: reduce` is active, all durations are set to `0ms` and continuous `useFrame` rotations/orbits are disabled.
