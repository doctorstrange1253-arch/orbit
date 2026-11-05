# 00 Art Direction & Visual Identity

**Owner**: Game/UX Designer + Principal Architect  
**Phase**: Phase 3 Design Document #1  
**Status**: Pending User Approval  

---

## 1. Visual Concept & Mood

Orbit V3 is a gamified, space-themed learning platform. Its visual language avoids generic "bootstrap neon" and cheap AI styling by enforcing a sophisticated cinematic sci-fi aesthetic inspired by hard science fiction UI (Expanse, Interstellar, NASA telemetry).

- **Theme**: Deep space observatory meets elite academy command center.
- **Zero-Emoji Discipline**: No emoji or text-character icons in UI labels, headers, buttons, or notifications. Use bespoke SVG artwork and precise typographic badges.
- **Color Philosophy**: Vantablack deep space backdrops (`#020617`) contrasted with luminous celestial accent tokens (nebula cyan, stellar gold, quantum emerald).

---

## 2. Palette Tokens (OKLCH & Hex)

| Token Name | Hex Value | OKLCH Equivalent | Usage |
|---|---|---|---|
| `--color-space-bg` | `#020617` | `oklch(0.08 0.02 260)` | Root canvas and page background |
| `--color-space-surface` | `#0f172a` | `oklch(0.14 0.03 260)` | Card and panel containers |
| `--color-stellar-gold` | `#f59e0b` | `oklch(0.78 0.16 75)` | Boss levels, premium tier accents, warnings |
| `--color-nebula-cyan` | `#38bdf8` | `oklch(0.78 0.12 210)` | Active navigation, links, secondary highlights |
| `--color-quantum-emerald` | `#10b981` | `oklch(0.72 0.17 155)` | Completed modules, success states, passing scores |
| `--color-text-primary` | `#f8fafc` | `oklch(0.97 0.01 260)` | Main headings and body text |
| `--color-text-muted` | `#94a3b8` | `oklch(0.65 0.02 260)` | Subtitles, hints, inactive timestamps |

---

## 3. Lighting & PBR Materials Model

- **Lights**: Single warm point light at system origin (`#ffedd5`, intensity 3.0) simulating the course core star, supplemented by subtle ambient blue fill (`#3b82f6`, intensity 0.7) and directional rim lighting.
- **Materials**: Physically Based Rendering (PBR) roughness/metalness model on all planetary bodies. `roughness: 0.3`, `metalness: 0.8` on active/interactive nodes; emissive pulses on hover/active states.

---

## 4. Unified 3D + 2D Design System

The 3D R3F canvas and the 2D SVG fallback map share identical token bindings, typography scales (`font-mono` for telemetry, `font-sans` for editorial copy), and interactive states. Switching between 3D and 2D maintains the exact spatial topology and user position.
