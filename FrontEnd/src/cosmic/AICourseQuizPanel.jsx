import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles, X, CheckCircle, Clock } from "lucide-react";
import { generateAiQuiz, approveAiQuestion, fetchPendingAiQuestions } from "../services/aiQuiz";
import toast from "react-hot-toast";

/**
 * AICourseQuizPanel — AI quiz generation + mentor review queue UI
 * Used inside the mentor Studio when building lessons.
 *
 * Props:
 *   courseId, lessonId — the lesson being edited
 *   onSaved            — fired on generate (info only)
 *   onQuestionApproved — fired with the full question object when a mentor
 *                        approves a pending question; the parent (LessonEdit)
 *                        adds it to form.quiz.questions so it ships to students.
 */
export default function AICourseQuizPanel({ courseId, lessonId, onSaved, onQuestionApproved }) {
    const [showReviewQueue, setShowReviewQueue] = useState(false);
    const [generating, setGenerating] = useState(false);
    const queryClient = useQueryClient();

    // Query for pending review questions
    const { data: pendingData, refetch: refetchPending } = useQuery({
        queryKey: ['ai', 'pending-questions'],
        queryFn: fetchPendingAiQuestions,
        enabled: showReviewQueue,
        staleTime: 30000,
    });

    // Mutation for approval
    const approveMutation = useMutation({
        mutationFn: ({ id, approved }) => approveAiQuestion(id, approved, ''),
        onSuccess: () => {
            refetchPending();
            toast.success('Question approved');
        },
        onError: (err) => console.error('approve failed:', err),
    });

    /**
     * Generate AI quiz questions for this lesson via Ollama RAG.
     * Shows loading state; questions appear in review queue for mentor review.
     */
    const generateMutation = useMutation({
        mutationFn: () => generateAiQuiz({ courseId, lessonId }),
        onMutate: () => setGenerating(true),
        onSettled: () => setGenerating(false),
        onError: (err) => {
            console.error('AI quiz generation failed:', err);
            toast.error('Ollama unreachable — showing cached fallback questions');
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['ai', 'pending-questions'] });
            onSaved && onSaved(data);
            toast.success(`Generated ${data?.count ?? 0} question(s)`);
        },
    });

    const pendingCount = pendingData?.pendingCount || 0;

    const handleApprove = (q) => {
        approveMutation.mutate({ id: q._id, approved: true });
        // Optimistically hand the approved question to the parent so it can
        // be added to the lesson's quiz questions right away.
        onQuestionApproved && onQuestionApproved(q);
    };

    return (
        <div className="bg-slate-900/80 backdrop-blur rounded-xl p-4 border border-slate-700 flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    AI Quiz Generation
                </h3>
                <button onClick={() => setShowReviewQueue(!showReviewQueue)} className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-500 text-white transition-all shadow">
                    <Clock className="w-3 h-3" />
                    {showReviewQueue ? "Hide" : "Show"} Review Queue
                    {pendingCount > 0 && <span className="ml-1 bg-red-500 text-white text-px-1 rounded-full">{pendingCount}</span>}
                </button>
            </div>

            {/* Generate button */}
            <button
                onClick={() => generateMutation.mutate()}
                disabled={generating}
                className="relative w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-70 transition-all shadow-lg hover:shadow-orange-900/40"
            >
                <Sparkles className={`w-4 h-4 ${generating ? "animate-spin" : ""}`} />
                <span className="font-bold text-white text-sm">{generating ? "Ollama RAG Generating…" : "Generate AI Quiz Questions"}</span>
            </button>

            {/* Loading / Error states */}
            {generating && (
                <div className="p-3 rounded-lg bg-slate-800 animate-pulse">
                    <p className="text-xs text-slate-400">Calling Ollama RAG engine…</p>
                    <p className="text-[10px] text-slate-500 mt-1">If Ollama is offline, cached fallback questions activate automatically.</p>
                </div>
            )}

            {/* Pending review queue */}
            {showReviewQueue && (
                <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-2">
                    <p className="text-xs font-semibold text-slate-300">Pending Mentor Review ({pendingCount})</p>
                    {(pendingData?.items || []).map((q) => (
                        <div key={q._id} className="rounded-lg bg-slate-800/50 p-3 border border-slate-700">
                            <div className="flex items-start gap-2">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-slate-200 break-words">{q.question}</p>
                                    <ul className="text-[10px] text-slate-400 mt-1 space-y-0.5">
                                        {q.options.map((opt, idx) => (
                                            <li key={idx} className="flex justify-between gap-2">
                                                <span className="flex items-center gap-1">
                                                    {idx === q.correctIndex ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-slate-500" />}
                                                    {opt}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <button
                                    onClick={() => handleApprove(q)}
                                    className="text-xs font-semibold px-2 py-1 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white transition-all shadow"
                                >
                                    Approve
                                </button>
                            </div>
                        </div>
                    ))}
                    {pendingCount === 0 && <p className="text-xs text-slate-500">No pending questions. All generated quizzes are approved.</p>}
                </div>
            )}
        </div>
    );
}
