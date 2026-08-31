/**
 * services/ai.js — V3 AI level-proposal service (gated).
 *
 * The AI suggest button in the mentor CourseBuilder calls `proposeLevel()`.
 * The backend endpoint `/api/ai/level-proposal` is gated by
 * `ENABLE_AI_COURSE_PROPOSAL=true` on the server. When the env var is
 * OFF, the backend returns a templated stub (not an LLM call) so the
 * mentor can still see what a proposal looks like.
 *
 * The frontend is intentionally thin — it just POSTs and shows the
 * response in a panel. No LLM logic, no retries, no client-side
 * caching. If the proposal is wrong, the mentor edits the field. The
 * V3 plan calls this "AI suggest, not AI dictate".
 *
 * Public API:
 *   - proposeLevel({ courseTitle, lessonTitle, lessonDescription })
 *     → Promise<{ promiseCopy, whyCopy, rememberCopy, quizQuestions, bossChallenge }>
 *   - isEnabled()  (informational — the backend gates; the UI shows the
 *     button either way but a stub response is clearly labeled)
 */

import api from './api';

export async function proposeLevel({ courseTitle, lessonTitle, lessonDescription }) {
  const { data } = await api.post('/ai/level-proposal', {
    courseTitle,
    lessonTitle,
    lessonDescription,
  });
  return data;
}

// The button is always visible (the backend decides whether to call an
// LLM or return a stub). The stub response carries `isStub: true` so the
// UI can label it "Suggested (template)" instead of "AI generated".
export function isStubProposal(proposal) {
  return !!(proposal && proposal.isStub);
}
