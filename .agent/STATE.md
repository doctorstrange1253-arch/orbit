# STATE — one-page truth

- Project root: `D:/orbit-main/orbit-main` (git repo, branch `feature/orbit-v3-foundation`). Parent `D:/orbit-main` is NOT a repo and holds stray `tmp-*` skill clones (left outside repo, D10).
- Phase: 6 implementation (M4 gamification polish + signature 3D world). Approvals: user said "i approved all the things" 2026-11-04 (D8); design decisions 1-5 = recommendations (AgX, parametric shuttle, bloom+selective-on-ultra, Gaia subset, Lab only).
- Done and committed: R0-R6 + P1/P3/P4/P5 phases; R-cleanup (b0778f4); P3-installs (25ee1a7: postprocessing ^6.39.6, @react-three/postprocessing ^3.2.2, leva ^0.10.1, r3f-perf ^7.2.3, playwright ^1.64.1, axe-core ^4.14.0 + chromium); F0 (70ba5d5: test suite 48/48 green); F1 scene shell (1a2aea6); F2 starfield/nebula GLSL + composer fix (c7c84f3); F3a playwright harness (08e69cf); F3 Look-Dev Lab + Star capture (20daf5f).
- Now: vitest 10 files / 55 tests PASS; playwright 3 specs PASS; lint clean on new files; vite build green (3D chunk 271 KB gz); sync-registry clean; BackEnd jest 625/625 (baseline, re-run at milestone end). Verified real WebGL: star-lab-1280.png shows stars + milkyway band (SwiftShader = layout only).
- Next: F6 — stations/checkpoints/boss encounters in the world (Station Lab capture), then UI/a11y/perf pass + milestone report (screenshots at 4 sizes, BackEnd re-run). Follow-ups: star temp orange skew, shuttle framing is small in Lab capture (tighten camera in polish), quarantine old prototype, real-GPU perf check owed.
- Follow-ups queued: star temp ramp skews orange (polish pass); quarantine old prototype CourseSpaceJourney3D after world verified in real browser; BackEnd re-run at milestone end; real-GPU + real-device perf check still owed to user.
- Note: M1-M3 changes from earlier sessions remain unstaged on purpose (not mine to commit); see git status.
- Blockers: none.
- Last session time: 2026-11-04 (this session).
