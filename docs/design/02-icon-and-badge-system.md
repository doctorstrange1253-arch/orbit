# 02 Icon and Badge System

**Owner**: UX Designer + Frontend Engineer  
**Phase**: Phase 3 Design Document #3  
**Status**: Pending User Approval  

---

## 1. Zero-Emoji Mandate

As established in art direction, emojis are strictly banned across all user-facing surfaces. Every icon, rank badge, currency indicator, and state symbol must use either Lucide vector icons or bespoke inline SVG geometry.

---

## 2. Bespoke SVG Icon Grid (24x24 viewport)

| Concept | SVG Symbol Structure | Stroke / Fill Rule |
|---|---|---|
| **Star / Core** | 8-point celestial polygon with inner glow | `stroke="currentColor" strokeWidth="1.5" fill="none"` |
| **Planet Node** | Concentric orbital rings with central sphere | `stroke="currentColor" strokeWidth="1.5"` |
| **Shuttle / Ship** | Delta-wing spacecraft silhouette | `fill="currentColor"` |
| **Checkpoint / Station** | Hexagonal docking hub with signal pulse | `stroke="currentColor" strokeWidth="2"` |
| **Boss Level** | Crowned stellar node with energy corona | `stroke="currentColor" strokeWidth="1.5" fill="url(#gold-gradient)"` |

---

## 3. Ranks, Badges, and XP Indicators

- **Student Rank**: Rendered as a minimalist metallic chevron SVG with progress bar fill.
- **Mentor Badge**: Shield SVG with embedded crown symbol and verification checkmark.
- **Currency (Orbit Credits)**: Orbital coin SVG with nested ring geometry.
- **Streak Flame**: Replaced by a stylized quantum pulse SVG node.
