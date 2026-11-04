# 07 Look-Dev Lab Specification

**Owner**: UX Designer + 3D Engineer  
**Phase**: Phase 3 Design Document #8 (Final)  
**Status**: Pending User Approval  

---

## 1. Lab Environments

Seven specialized working environments for iterative visual experimentation:

### A. Star Lab
- **Purpose**: Test color palettes and emissive glow tokens on volumetric starfields.
- **Inputs**: Variant of `--color-space-bg`, `--color-stellar-gold`.
- **Captures**: `star-lab-rgb.png` and `star-lab-lab.png` at 1920px.

### B. Planet Lab
- **Purpose**: Test procedural planet archetypes (Terrestrial, Gas Giant, Ice World, Volcanic).
- **Inputs**: Seed values from test course IDs.
- **Captures**: `planet-*-archetype.png` at 1920px.

### C. Shuttle Lab
- **Purpose**: Validate player shuttle mesh geometry, PBR materials, and camera rig angles.
- **Inputs**: Sample spline paths.
- **Captures**: `shuttle-*-orientation.png` at 1280px and 360px.

### D. Station Lab
- **Purpose**: Verify checkpoint station placement against orbit determinism algorithm.
- **Captures**: `station-*-layout.png`.

### E. UI Kit Lab
- **Purpose**: Test elevated surface compositions across 4 screen sizes (360, 768, 1280, 1920px).
- **Captures**: `ui-kit-{width}.png`.

### F. Postprocessing Lab
- **Purpose**: Compare bloom, selective bloom, and AgX tone mapping combinations.
- **Captures**: `postprocess-{variant}-1920.png`.

### G. Accessibility Fallback Lab
- **Purpose**: Capture the reduced-motion/2D SVG fallback across device widths.
- **Captures**: `fallback-2d-*device.png`.

---

## 2. Capture Workflow

```
1. Navigate to dedicated lab route (internal dev only)
2. Apply config changes via leva controls
3. Press 'Capture' key → spawns screenshot to docs/design/lab-captures/
4. Label asset with lab name, archetype, and resolution
5. Commit to branch with descriptive PR message
```

All captures stored under `docs/design/lab-captures/` in PNG format (max 512KB per file) for visual QA record-keeping.
