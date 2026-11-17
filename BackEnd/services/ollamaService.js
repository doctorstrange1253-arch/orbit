/**
 * ollamaService.js — Ollama RAG Quiz Generation Service with fallback caching
 */
const axios = require("axios");

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || "llama3.2:8b";

/**
 * Pre-cached question bank fallback for offline/unresponsive Ollama instances
 */
function getCachedQuizFallback(topic, lessonTitle) {
    const title = lessonTitle || topic || "Core Concept";
    return [
        {
            question: `What is the primary objective of ${title}?`,
            options: [
                "To establish foundational mastery and operational clarity",
                "To increase memory overhead without execution gain",
                "To bypass architectural security boundaries",
                "None of the above"
            ],
            correctIndex: 0,
            explanation: `Understanding ${title} is crucial for building robust mental models in this domain.`
        },
        {
            question: `Which of the following best describes best practices associated with ${title}?`,
            options: [
                "Strict adherence to modular verification and clean interfaces",
                "Hardcoding parameters directly into production binaries",
                "Skipping test suites during active feature iteration",
                "Disabling type safety checks"
            ],
            correctIndex: 0,
            explanation: "Modular verification and clean separation of concerns ensure long-term maintainability."
        }
    ];
}

/**
 * Generate quiz questions via Ollama RAG pipeline with strict timeout & fallback
 */
async function generateQuizViaOllama({ topic, lessonTitle, lessonDescription, contextText }) {
    const prompt = `You are an expert AI quiz generator for Orbit.
Generate 3 high-quality multiple-choice quiz questions based on the following lesson details.
Topic: ${topic || "General"}
Lesson: ${lessonTitle || "Untitled"}
Description: ${lessonDescription || ""}
Context / Transcript: ${contextText || "No additional transcript provided."}

Strictly output valid JSON matching this schema:
[
  {
    "question": "string",
    "options": ["string", "string", "string", "string"],
    "correctIndex": number (0 to 3),
    "explanation": "string"
  }
]
No markdown formatting, raw JSON only.`;

    try {
        const response = await axios.post(
            `${OLLAMA_HOST}/api/generate`,
            {
                model: DEFAULT_MODEL,
                prompt,
                stream: false,
                format: "json",
                options: { temperature: 0.3, num_predict: 1024 }
            },
            { timeout: 3500 } // 3.5s timeout for fast fallback
        );

        if (response.data && response.data.response) {
            const parsed = JSON.parse(response.data.response);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return {
                    source: "ollama",
                    model: DEFAULT_MODEL,
                    questions: parsed
                };
            }
        }
    } catch (err) {
        console.warn("[ollamaService] Ollama unreachable or timed out, falling back to cached bank:", err.message);
    }

    // Fallback
    return {
        source: "fallback_cache",
        model: null,
        questions: getCachedQuizFallback(topic, lessonTitle)
    };
}

module.exports = {
    generateQuizViaOllama,
    getCachedQuizFallback
};
