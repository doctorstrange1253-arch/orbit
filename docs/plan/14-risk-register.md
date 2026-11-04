# 14 Risk Register & Mitigation Matrix

**Owner**: Senior Product Critic + Staff Engineer  
**Phase**: Phase 5 deliverable #14  
**Evidence**: `AUDIT_REPORT.md`, `docs/plan/thinking.md`, `docs/plan/bug-audit.md`

---

## Comprehensive Risk Register

| Risk ID | Risk Description | Category | Severity | Likelihood | Mitigation Strategy |
|---|---|---|---|---|---|
| **R-01** | Identity switching ceremony state corruption or race condition | Technical | High | Medium | Enforce strict RBAC middleware, atomic MongoDB transactions for identity updates, and `rolesVersion` validation. |
| **R-02** | Unit economics negative at realistic conversion rates (1-2%) | Financial | Critical | High | Validate ARPU and conversion with beta launch; lean operating cost target (<$25k/month); dynamic pricing adjustments. |
| **R-03** | Razorpay webhook duplicate processing double-credits payments | Financial | High | Medium | Implement strict raw body verification, cryptographic signature check, and idempotency key caching. |
| **R-04** | 3D space UI performance failure on low-end Android devices | Technical | High | Medium | Set strict polygon budgets (<50k), conditional rendering, and automatic fallback to 2D SVG map. |
| **R-05** | Ollama local LLM inference unavailable or latency spike | Technical | Medium | High | Fallback to pre-cached question bank within 2s; asynchronous queue processing via Bull. |
| **R-06** | Hardcoded JWT or session fallback secrets exploited in production | Security | Critical | Low | Remove all fallback secrets; enforce fatal startup error if secret env vars missing (BA-01..BA-10). |
| **R-07** | Gamification streak pressure causes user anxiety or churn | Product | Medium | Medium | Add automatic streak freezes, vacation mode pause, and study session time limit breathers. |
| **R-08** | Regulatory non-compliance with Indian GST / TDS / DPDPA | Legal | High | Medium | Partner with Razorpay for automated GST invoicing; implement parental control dashboard for minors. |
| **R-09** | Course-request engine flooded with spam / low-quality requests | Operational | Medium | Medium | Enforce rate limits (max 5 requests/user/30d), CAPTCHA, and two-stage editorial review. |
| **R-10** | Socket.io connection exhaustion from anonymous clients | Security | Medium | Medium | Implement per-IP rate limiting on socket connections and cap anonymous connection counts. |

---

## Acceptance Criteria

- [ ] All Critical and High risks (R-02, R-03, R-06) have active code or architectural mitigations in place before public beta
- [ ] Weekly risk review meeting established for product and engineering leads

*Prepared by: Senior Product Critic + Staff Engineer — d:/orbit-main/orbit-main/docs/plan/14-risk-register.md*