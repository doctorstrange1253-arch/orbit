import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Plus, BookOpen, Pencil, Trash2, Eye, EyeOff, Users } from 'lucide-react';
import api from '../../services/api';
import { courses } from '../../services/courses';
import FuturisticBackdrop from '../../components/common/FuturisticBackdrop';
import HolographicCard from '../../components/fx/HolographicCard';
import EmptyState from '../../components/common/EmptyState';

/**
 * CourseList — mentor's own courses dashboard.
 *
 * We don't have a dedicated "list mine" endpoint, so we derive the mentor's
 * courses from the public listing with a large limit + filter by mentor on
 * the client. (For MVP scale this is fine; once a mentor has hundreds of
 * courses we add /api/courses/mine.)
 */
const CourseList = () => {
    const navigate = useNavigate();
    const qc = useQueryClient();
    const meId = useQuery({
        queryKey: ['me'],
        queryFn: () => api.get('/user/profile').then((r) => r.data),
    });
    const { data, isLoading } = useQuery({
        queryKey: ['courses', 'list', { mine: true }],
        queryFn: () => courses.list({ limit: 100 }),
    });
    const all = data?.items || [];
    const mine = all.filter((c) => String(c.mentorId) === String(meId.data?._id));

    const publish = useMutation({
        mutationFn: ({ id, action }) => action === 'publish' ? courses.publish(id) : courses.unpublish(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['courses', 'list'] }),
    });
    const remove = useMutation({
        mutationFn: (id) => courses.remove(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['courses', 'list'] }),
    });

    return (
        <div className="relative min-h-screen overflow-hidden">
            <FuturisticBackdrop />
            <div className="relative z-10 max-w-5xl mx-auto px-4 py-10 md:py-14">
                <Helmet><title>My Courses · Orbit Mentor</title></Helmet>

                <motion.header
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 flex items-start justify-between gap-3 flex-wrap"
                >
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill text-[11px] font-semibold uppercase tracking-widest text-text-secondary bg-surface border border-border-subtle mb-3">
                            <BookOpen className="w-3 h-3 text-accent" /> Mentor library
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black mb-2">
                            <span className="gradient-text">Your courses.</span>
                        </h1>
                        <p className="text-text-secondary text-sm">Build, publish, and grow your teaching library.</p>
                    </div>
                    <button
                        onClick={() => navigate('/mentor/courses/new')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-pill bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-sm font-bold uppercase tracking-widest hover:brightness-110"
                    >
                        <Plus className="w-4 h-4" /> New course
                    </button>
                </motion.header>

                {isLoading ? (
                    <div className="text-text-secondary text-sm py-12 text-center">Loading…</div>
                ) : mine.length === 0 ? (
                    <EmptyState
                        icon={<BookOpen className="w-8 h-8" />}
                        title="No courses yet"
                        body="Start your first course — add a title, a thumbnail, and a video lesson."
                        cta={{ label: 'Create your first course', onClick: () => navigate('/mentor/courses/new') }}
                    />
                ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                        {mine.map((c) => (
                            <HolographicCard key={c._id} rarity="rare" className="overflow-hidden">
                                <div className="p-4 space-y-2">
                                    <div className="flex items-start gap-3">
                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-indigo-900/60 to-cyan-900/40 flex-shrink-0">
                                            {c.thumbnail?.url && <img src={c.thumbnail.url} alt="" className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-bold text-text-primary line-clamp-2">{c.title}</h3>
                                            <div className="text-[11px] text-text-muted mt-0.5 flex items-center gap-2">
                                                <span className="inline-flex items-center gap-0.5"><BookOpen className="w-3 h-3" /> {c.lessonsCount || c.lessons?.length || 0}</span>
                                                <span className="inline-flex items-center gap-0.5"><Users className="w-3 h-3" /> {c.enrollmentCount || 0}</span>
                                            </div>
                                            <span className={`inline-block mt-1 text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                                                c.isPublished ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'
                                            }`}>
                                                {c.isPublished ? 'Published' : 'Draft'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 pt-2 border-t border-border-subtle/40">
                                        <Link
                                            to={`/mentor/courses/${c._id}/edit`}
                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-pill text-[11px] font-bold uppercase tracking-widest bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20"
                                        >
                                            <Pencil className="w-3 h-3" /> Edit
                                        </Link>
                                        <button
                                            onClick={() => publish.mutate({ id: c._id, action: c.isPublished ? 'unpublish' : 'publish' })}
                                            disabled={publish.isPending}
                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-pill text-[11px] font-bold uppercase tracking-widest bg-surface/40 border border-border-subtle hover:border-accent/40"
                                        >
                                            {c.isPublished ? <><EyeOff className="w-3 h-3" /> Unpublish</> : <><Eye className="w-3 h-3" /> Publish</>}
                                        </button>
                                        <Link
                                            to={`/courses/${c._id}`}
                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-pill text-[11px] font-bold uppercase tracking-widest bg-surface/40 border border-border-subtle hover:border-accent/40"
                                        >
                                            Preview
                                        </Link>
                                        <button
                                            onClick={() => { if (window.confirm('Delete this course? This cannot be undone.')) remove.mutate(c._id); }}
                                            disabled={remove.isPending}
                                            className="ml-auto inline-flex items-center gap-1 px-2.5 py-1.5 rounded-pill text-[11px] font-bold uppercase tracking-widest bg-rose-500/10 text-rose-300 border border-rose-400/30 hover:bg-rose-500/20"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </HolographicCard>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseList;
