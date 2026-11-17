/**
 * services/aiQuiz.js — Ollama RAG Quiz Service client for the frontend
 *
 * The backend mounts this router at /api/ai, so every call is prefixed
 * with /ai. (Earlier versions called bare /courses/... and /ai-questions/;
 * the prefix was missing.)
 */
import api from './api';

const PREFIX = '/ai';

export async function generateAiQuiz({ courseId, lessonId }) {
    const { data } = await api.post(`${PREFIX}/courses/${courseId}/lessons/${lessonId}/quiz/generate`, { autoApprove: false });
    return data;
}

export async function approveAiQuestion(questionId, approved, reviewComment = '') {
    const { data } = await api.post(`${PREFIX}/ai-questions/${questionId}/approve`, { approved, reviewComment });
    return data;
}

export async function fetchPendingAiQuestions() {
    const { data } = await api.get(`${PREFIX}/ai-questions/pending`);
    return data;
}
