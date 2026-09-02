import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Plus, BookOpen, Pencil, Trash2, Eye, EyeOff, Users } from 'lucide-react';
import api from '../../services/api';
import { courses } from '../../services/courses';
import EmptyState from '../../components/common/EmptyState';
import {
    MentorBackLink,
    MentorEyebrow,
    MentorTitle,
    MentorDeck,
} from '../../components/pact/MentorEditorial';
import { tierById } from '../../services/pact';
import PactBadge from '../../components/pact/PactBadge';

/**
 * CourseList — mentor's own courses dashboard.
 *
 * V3 — fully editorial. The masthead uses Playfair Display italic;
 * the course grid drops HolographicCard for a 1px-hairline treatment
 * with the mentor's PactBadge in the corner. Each card is a small
 * typeset block, no glass, no gradient.
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
        <div className="max-w-5xl mx-auto px-4 py-10 md:py-14 space-y-10">
            <Helmet><title>My Courses · Orbit Mentor</title></Helmet>

            <motion.header
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className="mb-3">
                    <MentorBackLink to="/mentor/observatory">Observatory</MentorBackLink>
                </div>
                <div className="flex items-center gap-2 mb-3">
                    <BookOpen size={14} style={{ color: 'rgba(245,245,245,0.55)' }} />
                    <MentorEyebrow>Mentor · The Library</MentorEyebrow>
                </div>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                        <MentorTitle size="xl">Your courses</MentorTitle>
                        <div className="mt-2 max-w-2xl">
                            <MentorDeck>Build, publish, and grow your teaching library.</MentorDeck>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/mentor/courses/new')}
                        className="inline-flex items-center gap-2 font-mono uppercase"
                        style={{
                            fontSize: '0.66rem',
                            letterSpacing: '0.22em',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.30)',
                            padding: '10px 16px',
                            cursor: 'pointer',
                        }}
                    >
                        <Plus size={12} /> New course
                    </button>
                </div>
            </motion.header>

            {isLoading ? (
                <div
                    className="py-12 text-center"
                    style={{
                        fontFamily: 'var(--font-serif)',
                        fontStyle: 'italic',
                        color: 'rgba(245,245,245,0.55)',
                    }}
                >
                    Reading the shelves.
                </div>
            ) : mine.length === 0 ? (
                <EmptyState
                    icon={<BookOpen className="w-8 h-8" />}
                    title="No courses yet"
                    body="Start your first course — add a title, a thumbnail, and a video lesson."
                    cta={{ label: 'Create your first course', onClick: () => navigate('/mentor/courses/new') }}
                />
            ) : (
                <div
                    className="grid sm:grid-cols-2"
                    style={{ border: '1px solid rgba(255,255,255,0.10)' }}
                >
                    {mine.map((c, idx) => {
                        const isLastInRow = idx % 2 === 1;
                        const isLastRow = idx >= mine.length - 2;
                        return (
                            <article
                                key={c._id}
                                className="p-5 flex flex-col gap-3"
                                style={{
                                    borderRight: isLastInRow ? 'none' : '1px solid rgba(255,255,255,0.08)',
                                    borderBottom: isLastRow ? 'none' : '1px solid rgba(255,255,255,0.08)',
                                }}
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className="w-16 h-16 flex-shrink-0 overflow-hidden"
                                        style={{ background: 'rgba(255,255,255,0.06)' }}
                                    >
                                        {c.thumbnail?.url && <img src={c.thumbnail.url} alt="" className="w-full h-full object-cover" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3
                                            className="line-clamp-2"
                                            style={{
                                                fontFamily: 'var(--font-editorial)',
                                                fontStyle: 'italic',
                                                fontWeight: 700,
                                                fontSize: '1.1rem',
                                                lineHeight: 1.1,
                                                color: 'var(--text-primary)',
                                            }}
                                        >
                                            {c.title}
                                        </h3>
                                        <div
                                            className="mt-1.5 font-mono uppercase flex items-center gap-3"
                                            style={{ fontSize: '0.58rem', letterSpacing: '0.18em', fontWeight: 700, color: 'rgba(245,245,245,0.55)' }}
                                        >
                                            <span className="inline-flex items-center gap-1">
                                                <BookOpen size={9} /> {c.lessonsCount || c.lessons?.length || 0}
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <Users size={9} /> {c.enrollmentCount || 0}
                                            </span>
                                        </div>
                                        <div className="mt-2">
                                            <span
                                                className="font-mono uppercase"
                                                style={{
                                                    fontSize: '0.54rem',
                                                    letterSpacing: '0.20em',
                                                    fontWeight: 700,
                                                    color: c.isPublished ? 'rgba(110,231,183,1)' : 'rgba(251,191,36,1)',
                                                    border: `1px solid ${c.isPublished ? 'rgba(110,231,183,0.40)' : 'rgba(251,191,36,0.40)'}`,
                                                    padding: '2px 6px',
                                                }}
                                            >
                                                {c.isPublished ? 'Published' : 'Draft'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className="flex items-center gap-1.5 pt-3"
                                    style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
                                >
                                    <Link
                                        to={`/mentor/courses/${c._id}/edit`}
                                        className="inline-flex items-center gap-1 font-mono uppercase"
                                        style={{
                                            fontSize: '0.58rem',
                                            letterSpacing: '0.20em',
                                            fontWeight: 700,
                                            color: 'var(--text-primary)',
                                            textDecoration: 'none',
                                            borderBottom: '1px solid rgba(255,255,255,0.30)',
                                            paddingBottom: 2,
                                        }}
                                    >
                                        <Pencil size={9} /> Edit
                                    </Link>
                                    <button
                                        onClick={() => publish.mutate({ id: c._id, action: c.isPublished ? 'unpublish' : 'publish' })}
                                        disabled={publish.isPending}
                                        className="inline-flex items-center gap-1 font-mono uppercase"
                                        style={{
                                            fontSize: '0.58rem',
                                            letterSpacing: '0.20em',
                                            fontWeight: 700,
                                            color: 'rgba(245,245,245,0.65)',
                                            background: 'transparent',
                                            border: 'none',
                                            borderBottom: '1px solid rgba(255,255,255,0.15)',
                                            padding: '0 0 2px 0',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {c.isPublished ? <><EyeOff size={9} /> Unpublish</> : <><Eye size={9} /> Publish</>}
                                    </button>
                                    <Link
                                        to={`/courses/${c._id}`}
                                        className="font-mono uppercase"
                                        style={{
                                            fontSize: '0.58rem',
                                            letterSpacing: '0.20em',
                                            fontWeight: 700,
                                            color: 'rgba(245,245,245,0.55)',
                                            textDecoration: 'none',
                                        }}
                                    >
                                        Preview →
                                    </Link>
                                    <button
                                        onClick={() => { if (window.confirm('Delete this course? This cannot be undone.')) remove.mutate(c._id); }}
                                        disabled={remove.isPending}
                                        className="ml-auto"
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'rgba(252,165,165,0.70)',
                                            cursor: 'pointer',
                                            padding: 4,
                                        }}
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CourseList;
