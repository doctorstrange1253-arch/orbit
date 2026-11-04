# 06 Dynamic 3D Space UI & Journey Algorithm

**Owner**: Game/UX Designer + Staff Engineer  
**Phase**: Phase 5 deliverable #6  
**Evidence**: `FrontEnd/src/App.jsx`, `marketing/`, Leaflet/Framer Motion deps

---

## 1. Current State (from codebase)

- Frontend built with React v19, Vite v8, Tailwind v4, Zustand v5, React Query v5, Leaflet, Lucide icons, Framer Motion
- Marketing assets (`marketing/`) include HTML/SVG starfields and photon icons (`photon-icon*.html`)
- No 3D library (Three.js / React Three Fiber / Babylon.js) currently in `FrontEnd/package.json`
- Capacitor Android APK target — mobile performance is a critical constraint

---

## 2. Course → Space Journey Algorithm

```
Course Modules (JSON)
    ↓
Spatial Node Generator (Deterministic layout)
    ↓
Planets = Modules (size = duration, color = category)
Stations = Checkpoints (quiz nodes, mini-games)
Boss Exam = Final Assessment (grand nebula station)
    ↓
Spline Camera Path (Smooth navigation animation)
```

### Layout Algorithm

- Each course compiles to a 3D solar system or constellation
- Modules mapped to planetary orbits around a central star (course topic)
- Checkpoints positioned as space stations along the orbit
- Completed nodes render in bright color with particle trails; uncompleted nodes render in muted grey; locked nodes rendered in locked wireframe

---

## 3. Technology Stack & Performance Budgets

### Technology Choice
- **React Three Fiber (R3F) + Three.js** — best fit for React v19 ecosystem, declarative components, and performance optimization.

### Performance Budgets (Target: Low-end Android, Capacitor APK)
- **Target framerate**: Stable 30fps minimum, 60fps preferred on mid-tier
- **Polygon budget**: <50,000 polygons per scene
- **Texture resolution**: Max 1024x1024, compressed formats (Basis/KTX2)
- **Shader complexity**: Procedural shaders (no heavy post-processing stack on mobile)
- **Battery preservation**: Throttled render loop when idle (`useFrame` conditional rendering)

---

## 4. Accessibility & 2D Fallback

| Mode | Trigger | Behavior |
|---|---|---|
| 3D Immersive | Default (WebGL supported, good GPU) | Full 3D solar system navigation via R3F |
| 2D Constellation Map | Low-power mode / weak GPU / user toggle | SVG / CSS transform 2D interactive map with identical node topology |
| Reduced Motion | OS accessibility setting (`prefers-reduced-motion`) | Zero camera splines; instant snapping; no rotating starfields |
| Screen Reader | Accessibility tree | ARIA labels on all nodes, keyboard navigation (Tab/Enter) |

---

## 5. Open Questions for User (blocking)

1. **3D vs 2D default**: Should 3D be default or opt-in? Recommend 3D default with auto-fallback to 2D if framerate <20fps. — **BLOCKING** for frontend arch.
2. **Engine choice**: Confirm Three.js / React Three Fiber over Babylon.js. — **BLOCKING**.
3. **Mobile offline mode**: Must 3D assets work offline in Capacitor APK? (Requires local caching).

---

## 6. Dependencies

- FrontEnd Vite build pipeline (needs R3F / Drei dependencies added)
- Capacitor mobile packaging configuration
- Accessibility testing framework (Playwright/Vitest)

---

## 7. Acceptance Criteria

- [ ] Course JSON successfully compiles to 3D celestial layout (planets, stations, boss exams)
- [ ] Camera spline animation moves smoothly between checkpoints
- [ ] Automatic fallback to 2D SVG map when WebGL unavailable or framerate drops
- [ ] Reduced-motion setting disables camera rotation and particle splines
- [ ] Mobile performance budget met (<50k polys, stable 30fps on test Android device)

*Prepared by: Game/UX Designer + Staff Engineer — d:/orbit-main/orbit-main/docs/plan/06-dynamic-3d-space-ui.md*