# 05 Performance & Quality Tiers

**Owner**: Staff Engineer + QA Lead  
**Phase**: Phase 3 Design Document #6  
**Status**: Pending User Approval  

---

## 1. Quality Tier Targets

| Tier | Target Hardware | Framerate | Polygon Budget | Postprocessing Stack |
|---|---|---|---|---|
| **Ultra** | High-end Desktop / Mac | 60 fps | < 50,000 polys | Full Bloom + Depth of Field + AgX Tone Mapping |
| **High** | Mid-range Laptop / Tablet | 60 fps | < 30,000 polys | Selective Bloom + Standard Tone Mapping |
| **Medium** | Low-end Desktop / Mobile (Capacitor) | 30 fps (stable) | < 15,000 polys | Minimal Bloom, no heavy depth of field |
| **Low / 2D** | Weak GPU / Reduced Motion / Low Power | 30 fps | 0 polys (2D SVG Map) | None (Pure CSS / SVG transforms) |

---

## 2. Resource Budgets & Optimization Discipline

- **Initial JS Bundle**: < 300 KB gzipped (Three.js and R3F lazy-loaded via dynamic imports).
- **Texture Compression**: Maximum texture resolution 1024x1024; automatic downscaling on mobile detection.
- **Disposal Discipline**: Explicit geometry, material, and texture `.dispose()` calls on component unmount to prevent WebGL memory leaks.
- **Battery Preservation**: `useFrame` render loops throttled or paused when window loses focus or canvas is out of viewport.
