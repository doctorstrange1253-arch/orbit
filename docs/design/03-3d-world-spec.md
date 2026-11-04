# 03 3D World Specification

**Owner**: Staff 3D Engineer + Game/UX Designer  
**Phase**: Phase 3 Design Document #4  
**Status**: Pending User Approval  

---

## 1. Celestial Architecture

The 3D course environment is structured as a procedural solar system:
- **Central Star**: Represents the course core topic. Emits warm point light; slow rotational animation (`delta * 0.2`).
- **Planet Nodes**: Each course module maps to an orbiting planetary body. Radius and orbital speed derived deterministically from module ID and index.
- **Planet Archetypes**: 8 distinct procedural archetypes based on module category (Terrestrial, Gas Giant, Ice World, Volcanic, Oceanic, Crystalline, Desert, Nebula Station).
- **Stations & Checkpoints**: Space docking hubs positioned along planetary orbits representing quizzes and interactive checkpoints.
- **Boss Encounters**: Grand red-giant or black-hole anomaly stations requiring 100% quiz mastery to unlock the certificate sector.

---

## 2. Shuttle & Navigation Rig

- **Player Shuttle**: Sleek low-poly delta-wing mesh positioned along a Catmull-Rom spline path connecting completed and active modules.
- **Thruster FX**: Particle trail emitted during active transitions between modules.
- **Camera Rig**: OrbitControls with smooth damping (`dampingFactor: 0.05`), auto-rotate when idle, and cinematic dolly-in animation when selecting a module.
