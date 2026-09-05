import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Plus, BookOpen, Pencil, Trash2, Eye, EyeOff, Users } from 'lucide-react';
import { courses } from '../../services/courses';
import EmptyState from '../../components/common/EmptyState';
import { MentorBackLink } from '../../components/pact/MentorEditorial';
import { StudioMasthead, StudioPanel, Reveal } from '../../soul/studio/surfaces';
import { stageCount, scaleLabel } from '../../soul/gameEngine/stages';

const CourseList = () => {
    const navigate = useNavigate();
    const qc = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ['courses', 'list', { mine: true }],
        queryFn: () => courses.list({ mentor: 'me', limit: 100 }),
    });
    const mine = data?.items || [];
    const published = mine.filter((c) => c.isPublished).length;

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

            <div className="mb-3">
                <MentorBackLink to="/mentor/observatory">Observatory</MentorBackLink>
            </div>

            <StudioMasthead
                eyebrow="Mentor · The Library"
                Icon={BookOpen}
                title="Your courses"
                deck={mine.length === 0
                    ? 'Build, publish, and grow your teaching library.'
                    : `${mine.length} course${mine.length === 1 ? '' : 's'} on the shelf · ${published} published · ${mine.length - published} in draft.`}
            >
                <button
                    onClick={() => navigate('/mentor/courses/new')}
                    className="inline-flex items-center gap-2 font-mono uppercase transition-transform duration-200 hover:scale-[1.03]"
                    style={{
                        fontSize: '0.62rem',
                        letterSpacing: '0.20em',
                        fontWeight: 700,
                        color: '#0d0c1c',
                        background: 'var(--studio-gradient)',
                        border: 'none',
                        borderRadius: 999,
                        padding: '11px 18px',
                        cursor: 'pointer',
                    }}
                >
                    <Plus size={12} /> New course
                </button>
            </StudioMasthead>

            {isLoading ? (
                <div
                    className="py-12 text-center"
                    style={{
                        fontFamily: 'var(--font-serif)',
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
                <div className="grid sm:grid-cols-2 gap-3">
                    {mine.map((c, idx) => {
                        const lessons = c.lessonsCount || c.lessons?.length || 0;
                        const stages = stageCount(lessons);
                        return (
                            <Reveal key={c._id} index={idx} className="h-full">
                                <StudioPanel radius={18} className="p-5 flex flex-col gap-3 h-full group overflow-hidden">
                                    <div className="flex items-start gap-3">
                                        <div
                                            className="w-16 h-16 flex-shrink-0 overflow-hidden"
                                            style={{
                                                borderRadius: 12,
                                                background: 'color-mix(in oklab, var(--studio-from) 14%, rgba(255,255,255,0.04))',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                            }}
                                        >
                                            {c.thumbnail?.url
                                                ? <img src={c.thumbnail.url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                                : <span className="w-full h-full flex items-center justify-center" style={{ color: 'var(--studio-from)' }}><BookOpen size={18} /></span>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3
                                                className="line-clamp-2"
                                                style={{
                                                    fontFamily: 'var(--font-display)',
                                                    fontWeight: 700,
                                                    fontSize: '1.06rem',
                                                    lineHeight: 1.15,
                                                    letterSpacing: '-0.02em',
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
                                                    <BookOpen size={9} /> {lessons}
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <Users size={9} /> {c.enrollmentCount || 0}
                                                </span>
                                            </div>
                                            <div
                                                className="mt-1.5 font-mono uppercase"
                                                style={{ fontSize: '0.54rem', letterSpacing: '0.18em', fontWeight: 700, color: 'rgba(245,245,245,0.45)' }}
                                            >
                                                {stages} stage{stages === 1 ? '' : 's'} · {scaleLabel(lessons)}
                                            </div>
                                            <div className="mt-2">
                                                <span
                                                    className="font-mono uppercase"
                                                    style={{
                                                        fontSize: '0.54rem',
                                                        letterSpacing: '0.20em',
                                                        fontWeight: 700,
                                                        borderRadius: 999,
                                                        color: c.isPublished ? 'rgba(110,231,183,1)' : 'rgba(251,191,36,1)',
                                                        background: c.isPublished ? 'rgba(110,231,183,0.10)' : 'rgba(251,191,36,0.10)',
                                                        border: `1px solid ${c.isPublished ? 'rgba(110,231,183,0.34)' : 'rgba(251,191,36,0.34)'}`,
                                                        padding: '3px 8px',
                                                    }}
                                                >
                                                    {c.isPublished ? 'Published' : 'Draft'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className="flex items-center gap-1.5 pt-3 mt-auto"
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
                                </StudioPanel>
                            </Reveal>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CourseList;
