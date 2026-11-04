# 07 AI Quiz Engine via Ollama

**Owner**: Staff Engineer  
**Phase**: Phase 5 deliverable #7  
**Evidence**: `BackEnd/controllers/aiController.js`, `BackEnd/models/` (course, lesson, quiz models)

---

## 1. Current State (from codebase)

- AI services referenced in founder vision and executive summary
- `aiController.js` present in backend controllers
- No Ollama model binaries in repo; local inference assumed
- 40+ Mongoose models provide rich domain schema for prompt construction

---

## 2. Architecture Options

| Approach | Pros | Cons | Recommendation |
|---|---|---|---|
| **1. LoRA Fine-Tuning** | Domain-specific terminology; fast inference; offline capable | Requires training pipeline, dataset curation, compute | **Phase 2 enhancement** |
| **2. RAG (Retrieval-Augmented Generation)** | High factual accuracy; zero training overhead; dynamic updates | Retrieval latency; context window limits; prompt engineering overhead | **Primary architecture** |
| **3. Hybrid** | Best quality; fine-tuned base + RAG context injection | Most complex to maintain and debug | **Ultimate target** |

**Selected Architecture**: RAG with base model (e.g., Llama-3.2-8B or Qwen-2.5-7B via Ollama) for phase 1.

---

## 3. Model Selection & Hardware Requirements

| Model | Size | RAM Required | Throughput (approx.) | Quality |
|---|---|---|---|---|
| `llama3.2:8b` | 8B | 8GB VRAM / 16GB RAM | 25 tok/sec | High reasoning |
| `qwen2.5:7b` | 7B | 8GB VRAM / 16GB RAM | 30 tok/sec | Excellent multilingual / coding |
| `mistral:7b` | 7B | 8GB VRAM / 16GB RAM | 28 tok/sec | Solid general instruction |

**Hardware requirement**: Dedicated inference server (NVIDIA T4 or RTX 4090 equivalent) or local mentor machine running Ollama.

---

## 4. Quality Gates & Fallback Strategy

### Quality Gate (Human-in-the-Loop)
```
AI generates question → Schema validation (JSON) → Automated heuristic check (distractor quality) → Mentor review queue (approved/rejected) → Published to course
```

### Fallback Strategy
If Ollama is unresponsive or overloaded:
1. Fall back to pre-cached question bank for the lesson.
2. Return fallback response within 2 seconds.
3. Log Ollama failure for monitoring alert.

---

## 5. Open Questions for User (blocking)

1. **Model selection**: Confirm `llama3.2:8b` or `qwen2.5:7b` as primary Ollama model. — **BLOCKING**.
2. **Inference hosting**: Is Ollama running on self-hosted GPU cluster (Render/Railway/Fly) or local mentor nodes? — **BLOCKING**.
3. **Review requirement**: Must every AI-generated quiz be mentor-approved before student sees it, or auto-publish with student reporting? Recommend mentor-approved for Elite/Mentor tiers.

---

## 6. Dependencies

- Course content extraction service (chunks transcripts/lessons into vector store)
- Redis job queue (Bull) for async quiz generation tasks
- Notification system (notifying mentors of pending quiz reviews)

---

## 7. Acceptance Criteria

- [ ] Backend connects to Ollama endpoint successfully
- [ ] RAG pipeline retrieves course context and formats prompt for quiz generation
- [ ] Generated quiz output strictly conforms to JSON schema (question, options, correct answer, explanation)
- [ ] Failed inference falls back gracefully to cached question bank within 2s
- [ ] Mentor review dashboard allows approving/rejecting AI-generated questions

*Prepared by: Staff Engineer — d:/orbit-main/orbit-main/docs/plan/07-ai-quiz-engine.md*