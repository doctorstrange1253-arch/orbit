# 04 UI Screens Specification

**Owner**: Frontend Architect + UX Designer  
**Phase**: Phase 3 Design Document #5  
**Status**: Pending User Approval  

---

## 1. Screen Redesign Inventory

All major application screens adhere to the V3 dark-space telemetry design language, zero-emoji rule, and glassmorphism token system:

1. **Cockpit Dashboard (`/student/*`)**: Command-center telemetry overview with streak tracking, active course progress rings, and quick-resume warp button.
2. **Dynamic 3D Space Journey (`/courses/:id/learn`)**: Split-view or full-viewport R3F solar system map with interactive planet nodes, 2D fallback toggle, and reduced-motion switch.
3. **Lesson Video Player & Attention Arc**: Cinematic video container with deceleration attention prompts and chapter time markers.
4. **Checkpoint Coach Quiz (`CoachQuiz.jsx`)**: Friend-not-textbook quiz interface with instant coach copy feedback and progress tracking.
5. **Boss Ceremony Overlay (`BossCeremony.jsx`)**: 6-second cinematic reward celebration upon passing boss level assessments.
6. **Mentor Mission Control (`/mentor/*`)**: Course editor (`LessonEdit.jsx`), AI quiz generation panel (`AICourseQuizPanel.jsx`), and moderation review queue.
7. **Subscription Pricing & Economics**: INR pricing tiers (Free/Pro/Elite/Mentor) with transparent 20% platform fee breakdown.
8. **Profile, Inventory & Settings**: Modular telemetry cards for certificates, achievements, and accessibility toggles.

---

## 2. Empty, Loading & Error States

- **Loading State**: Luminous skeleton loaders with subtle pulse animation (`animate-pulse bg-slate-800/60`).
- **Empty State**: Zero-state celestial radar graphic with clear call-to-action button ("Initialize first module").
- **Error State**: Glass-morphic amber/rose alert card (`bg-rose-500/10 border border-rose-500/30 text-rose-200`) with retry action.
