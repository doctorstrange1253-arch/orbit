# Visual Overview: Orbit Architecture & System Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ORBIT PLATFORM ECOSYSTEM                        │
└────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────── FRONTEND (React 19 / Vite / Tailwind 4) ───────────────────────────┐
    │                                                                                               │
    │   ┌──────────────────────────┐      ┌──────────────────────────┐      ┌────────────────────┐  │
    │   │  Student Identity Window │      │   Peer Identity Window   │      │ Mentor Identity    │  │
    │   │  (Courses, Quizzes, XP)  │      │   (Peer Review, Help)    │      │ (Create, Analytics)│  │
    │   └────────────┬─────────────┘      └────────────┬─────────────┘      └─────────┬──────────┘  │
    │                │                                 │                              │             │
    │                └───────────────────┬─────────────┴──────────────────────────────┘             │
    │                                    ▼                                                          │
    │                         [ TransitSequence Ceremony ] (Soul Switching)                         │
    │                                    │                                                          │
    │                        ┌───────────┴───────────┐                                              │
    │                        ▼                       ▼                                              │
    │                 [ 3D Space UI ]         [ 2D Fallback Map ]                                   │
    │                (Three.js / R3F)       (SVG / CSS Transform)                                   │
    └────────────────────────────────────┬──────────────────────────────────────────────────────────┘
                                         │
                                         ▼ (WebSocket / REST API)
    ┌────────────────────────── BACKEND (Node.js 18+ / Express 5.2 / Mongoose) ─────────────────────┐
    │                                                                                               │
    │   ┌────────────────────┐   ┌────────────────────┐   ┌─────────────────────────────────────┐   │
    │   │   Auth & RBAC      │   │   Socket.io Rooms  │   │      Razorpay Subscription &        │   │
    │   │ (JWT, rolesVersion)│   │   + Redis Adapter  │   │      Webhook (express.raw)          │   │
    │   └────────────────────┘   └────────────────────┘   └──────────────────┬──────────────────┘   │
    │                                                                        │                      │
    │                                                                        ▼                      │
    │   ┌────────────────────┐   ┌────────────────────┐   ┌─────────────────────────────────────┐   │
    │   │ Course-Request     │   │ Ollama RAG Quiz    │   │      Mentor Payout Economics        │   │
    │   │ Engine (Clustering)│   │ Engine (Llama 3.2) │   │ (20% Fee / Equal Split / Ledger)    │   │
    │   └────────────────────┘   └────────────────────┘   └─────────────────────────────────────┘   │
    └────────────────────────────────────┬──────────────────────────────────────────────────────────┘
                                         │
                                         ▼
    ┌──────────────────────────────── MONGODB DATABASE (40+ Models) ────────────────────────────────┐
    │  [User] [Course] [OrbitSession] [Subscription] [MoneyLedger] [PhotonLedger] [SignalFlare] etc.  │
    └───────────────────────────────────────────────────────────────────────────────────────────────┘
```

*Prepared by: Principal Product Architect & Staff Engineer — d:/orbit-main/orbit-main/docs/plan/visual-overview.md*