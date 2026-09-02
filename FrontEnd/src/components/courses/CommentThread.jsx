import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MessageCircle, Send, ThumbsUp, Pin, CheckCircle2, Trash2 } from 'lucide-react';
import { courses } from '../../services/courses';
import { useAuthStore } from '../../store/authStore';

const formatRelative = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
};

/**
 * CommentThread — Q&A panel on /courses/:id.
 *
 * Threaded: replies are nested one level deep. Mentor (course owner) gets
 * extra actions: Mark as answer, Pin, Delete. Everyone can upvote.
 */
const CommentThread = ({ courseId, lessonId, course }) => {
    const user = useAuthStore((s) => s.user);
    const qc = useQueryClient();
    const [text, setText] = useState('');
    const isCourseMentor = String(course?.mentorId) === String(user?._id);

    const { data: comments = [] } = useQuery({
        queryKey: ['courses', courseId, 'comments', lessonId || 'all'],
        queryFn: () => courses.listComments(courseId, lessonId),
    });

    const invalidate = () => qc.invalidateQueries({ queryKey: ['courses', courseId, 'comments'] });

    const post = useMutation({
        mutationFn: (body) => courses.postComment(courseId, { lessonId, text: body.text, parentId: body.parentId }),
        onSuccess: () => { setText(''); invalidate(); },
    });
    const update = useMutation({
        mutationFn: ({ commentId, body }) => courses.updateComment(commentId, body),
        onSuccess: invalidate,
    });
    const remove = useMutation({
        mutationFn: (commentId) => courses.deleteComment(commentId),
        onSuccess: invalidate,
    });

    const top = comments.filter((c) => !c.parentId);
    const repliesOf = (id) => comments.filter((c) => c.parentId === id);

    return (
        <div className="rounded-xl border border-border-subtle bg-surface/40 backdrop-blur-sm p-4">
            <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="w-4 h-4 text-accent" />
                <h4 className="text-sm font-bold text-text-primary">Q&amp;A</h4>
                <span className="text-xs text-text-muted">· {comments.length}</span>
            </div>

            <div className="flex items-start gap-2 mb-4">
                <div className="flex-1">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={user ? 'Ask a question or share insight…' : 'Sign in to comment'}
                        rows={2}
                        disabled={!user}
                        className="w-full rounded-lg bg-bg/40 border border-border-subtle px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50"
                    />
                </div>
                <button
                    onClick={() => post.mutate({ text })}
                    disabled={!user || !text.trim() || post.isPending}
                    className="p-2.5 rounded-lg bg-accent/15 text-accent border border-accent/30 hover:bg-accent/25 disabled:opacity-50"
                    aria-label="Post"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>

            <ul className="space-y-3">
                {top.length === 0 && (
                    <li className="text-sm text-text-muted text-center py-6">No questions yet. Be the first.</li>
                )}
                {top.map((c) => (
                    <motion.li
                        key={c._id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-lg border ${c.isAnswer ? 'border-emerald-400/40 bg-emerald-500/5' : c.isPinned ? 'border-amber-400/40 bg-amber-500/5' : 'border-border-subtle bg-surface/30'} p-3`}
                    >
                        <CommentRow
                            c={c}
                            isCourseMentor={isCourseMentor}
                            isAuthor={String(c.userId) === String(user?._id)}
                            onUpvote={() => update.mutate({ commentId: c._id, body: { toggleUpvote: true } })}
                            onMarkAnswer={() => update.mutate({ commentId: c._id, body: { isAnswer: !c.isAnswer } })}
                            onPin={() => update.mutate({ commentId: c._id, body: { isPinned: !c.isPinned } })}
                            onDelete={() => remove.mutate(c._id)}
                        />
                        {repliesOf(c._id).map((r) => (
                            <div key={r._id} className="mt-2 ml-6 pl-3 border-l-2 border-border-subtle/40">
                                <CommentRow
                                    c={r}
                                    isCourseMentor={isCourseMentor}
                                    isAuthor={String(r.userId) === String(user?._id)}
                                    onUpvote={() => update.mutate({ commentId: r._id, body: { toggleUpvote: true } })}
                                    onDelete={() => remove.mutate(r._id)}
                                    compact
                                />
                            </div>
                        ))}
                    </motion.li>
                ))}
            </ul>
        </div>
    );
};

const CommentRow = ({ c, isCourseMentor, isAuthor, onUpvote, onMarkAnswer, onPin, onDelete, compact }) => (
    <div>
        <div className="flex items-center gap-2 mb-1">
            {c.user?.avatar ? (
                <img src={c.user.avatar} alt="" className={`${compact ? 'w-5 h-5' : 'w-6 h-6'} rounded-full object-cover`} />
            ) : (
                <div className={`${compact ? 'w-5 h-5' : 'w-6 h-6'} rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white`}>
                    {c.user?.name?.[0]?.toUpperCase() || '?'}
                </div>
            )}
            <span className="text-xs font-bold text-text-primary">{c.user?.name || 'User'}</span>
            <span className="text-[10px] text-text-muted">· {formatRelative(c.createdAt)}</span>
            {c.isAnswer && <span className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-300"><CheckCircle2 className="w-3 h-3" /> Answer</span>}
            {c.isPinned && !c.isAnswer && <span className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-300"><Pin className="w-3 h-3" /> Pinned</span>}
        </div>
        <p className={`text-sm text-text-secondary whitespace-pre-wrap ${compact ? '' : 'leading-relaxed'}`}>{c.text}</p>
        <div className="flex items-center gap-1 mt-1.5">
            <button onClick={onUpvote} className="inline-flex items-center gap-1 text-[11px] text-text-muted hover:text-accent">
                <ThumbsUp className="w-3 h-3" /> {c.upvotes || 0}
            </button>
            {isCourseMentor && onMarkAnswer && (
                <button onClick={onMarkAnswer} className="text-[11px] text-text-muted hover:text-emerald-300">
                    {c.isAnswer ? 'Unmark' : 'Mark as answer'}
                </button>
            )}
            {isCourseMentor && onPin && (
                <button onClick={onPin} className="text-[11px] text-text-muted hover:text-amber-300">
                    {c.isPinned ? 'Unpin' : 'Pin'}
                </button>
            )}
            {(isAuthor || isCourseMentor) && (
                <button onClick={onDelete} className="ml-auto text-text-muted hover:text-rose-300" aria-label="Delete">
                    <Trash2 className="w-3 h-3" />
                </button>
            )}
        </div>
    </div>
);

export default CommentThread;
