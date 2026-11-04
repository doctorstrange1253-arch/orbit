# 05 Course-Request Engine

**Owner**: Staff Engineer  
**Phase**: Phase 5 deliverable #5  
**Evidence**: `BackEnd/models/course.js`, `BackEnd/controllers/courseController.js`, `BackEnd/models/skill.js`, `BackEnd/models/skillcategory.js`

---

## 1. Current State (from codebase)

- Course model exists with modules, lessons, checkpoints
- Skill and SkillCategory models for categorization
- courseController.js with CRUD operations (~1000+ lines based on grep hits at lines 808, 975)
- No course-request model found in 40+ models list (CourseRequest not present)
- No deduplication/clustering algorithm in codebase

---

## 2. Proposed Course-Request Flow

```
Student requests missing subject
    ↓
System checks for duplicate/clustered requests (deduplication)
    ↓
If threshold met (e.g., 50 requests for same subject)
    ↓
Mentors notified; can claim request to create course
    ↓
Mentor creates course; requesting students notified
    ↓
Course published; early enrollees get badge
```

### Deduplication / Clustering

- Match by subject name, skill category, grade level, language
- Fuzzy matching for synonyms (e.g., "JavaScript" ≈ "JS")
- Time-window clustering: requests within 30 days counted together

### Thresholds (proposed)

| Trigger | Threshold | Action |
|---|---|---|
| Initial signal | 5 requests | Mark as "under consideration" |
| Mentor notification | 25 requests | Notify mentors in skill category |
| Claim eligible | 50 requests | Mentors can claim to create course |
| Anti-brigading | Max 5 requests per user per 30 days | Prevent spam |

---

## 3. Anti-Brigading & Quality

| Risk | Mitigation |
|---|---|
| Spam requests flooding system | Max 5 per user per 30 days; CAPTCHA on request form |
| Low-quality course creation | Two-stage: demand signal → mentor quality interview → editorial review before publishing |
| Duplicate requests splitting demand | Clustering algorithm merges similar requests; canonical subject per cluster |
| Mentor claiming without intent | Claim deposit (stardust); forfeited if course not delivered in 60 days |

---

## 4. Open Questions for User (blocking)

1. **Threshold values**: Confirm 5/25/50 request thresholds — or provide actual targets. — **BLOCKING**.
2. **Anti-brigading limit**: Max requests per user per window?
3. **Mentor incentives**: Stardust bonus for creating requested course? Revenue share priority?
4. **Quality gate**: Editorial review required before publishing? Who reviews?
5. **Request visibility**: Are request counts public (showing demand) or private?

---

## 5. Dependencies

- 02-identity-system.md — only Mentor identity can claim/create courses
- 03-subscription-architecture.md — course slots may limit how many courses a mentor can create
- 04-mentor-economics.md — course revenue contributes to mentor payout pool

---

## 6. Acceptance Criteria

- [ ] Student can submit course-request form (subject, category, level, description)
- [ ] System clusters duplicate requests and shows aggregated demand
- [ ] Threshold reached → mentors in category notified
- [ ] Mentor can claim request; claim creates course-draft state
- [ ] Anti-brigading rate limit enforced (per user, per window)
- [ ] Requesting students notified when course is published

*Prepared by: Staff Engineer — d:/orbit-main/orbit-main/docs/plan/05-course-request-engine.md*