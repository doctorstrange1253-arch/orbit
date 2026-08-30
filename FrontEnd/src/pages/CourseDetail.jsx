import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ChevronDown, ChevronRight, BookOpen, PlayCircle, Lock, Star, MessageCircle, Award, Users } from 'lucide-react';
import { useState } from 'react';
import { courses } from '../services/courses';
import EnrollButton from '../components/courses/EnrollButton';
import CommentThread from '../components/courses/CommentThread';
import FuturisticBackdrop from '../components/common/FuturisticBackdrop';
import PactBadge from '../components/pact/PactBadge';

const fmtDur = (s) => {
    if (!s) return '';
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m ? `${m}m${sec ? ` ${sec}s` : ''}` : `${sec}s`;
};

const CourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [openLessons, setOpenLessons] = useState(true);
    const [openQa, setOpenQa] = useState(false);

    const { data: course, isLoading, error } = useQuery({
        queryKey: ['courses', 'detail', id],
        queryFn: () => courses.detail(id),
    });

    if (isLoading) {
        return <div className="relative min-h-screen"><FuturisticBackdrop /><div className="relative z-10 max-w-4xl mx-auto p-12 text-text-secondary">Loading…</div></div>;
    }
    if (error || !course) {
        return <div className="relative min-h-screen"><FuturisticBackdrop /><div className="relative z-10 max-w-4xl mx-auto p-12 text-text-secondary">Course not found.</div></div>;
    }

    const totalDuration = (course.lessons || []).reduce((s, l) => s + (l.durationSec || 0), 0);
    const quizCount = (course.lessons || []).filter((l) => l.hasQuiz).length;

    return (
        <div className="relative min-h-screen overflow-hidden">
            <FuturisticBackdrop />
            <div className="relative z-10 max-w-5xl mx-auto px-4 py-10 md:py-14">
                <Helmet><title>{course.title} · Orbit Courses</title></Helmet>

                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid md:grid-cols-2 gap-6 mb-8"
                >
                    <div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-indigo-900/60 to-cyan-900/40 border border-border-subtle">
                        {course.thumbnail?.url ? (
                            <img src={course.thumbnail.url} alt={course.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="w-12 h-12 text-text-muted/50" />
                            </div>
                        )}
                    </div>
                    <div className="space-y-3">
                        <div className="text-[10px] font-black uppercase tracking-widest text-accent">{course.category}</div>
                        <h1 className="text-2xl md:text-3xl font-black text-text-primary">{course.title}</h1>
                        {course.subtitle && <p className="text-text-secondary text-sm">{course.subtitle}</p>}
                        {course.description && <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">{course.description}</p>}

                        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-text-muted">
                            <span className="inline-flex items-center gap-1"><PlayCircle className="w-4 h-4" /> {(course.lessons || []).length} lessons</span>
                            {totalDuration > 0 && <span>· {fmtDur(totalDuration)}</span>}
                            {quizCount > 0 && <span className="inline-flex items-center gap-1"><Award className="w-4 h-4" /> {quizCount} quiz{quizCount > 1 ? 'zes' : ''}</span>}
                            <span className="inline-flex items-center gap-1"><Users className="w-4 h-4" /> {course.enrollmentCount || 0} enrolled</span>
                            {course.rating?.count > 0 && (
                                <span className="inline-flex items-center gap-1 text-amber-300">
                                    <Star className="w-4 h-4 fill-current" /> {course.rating.average?.toFixed?.(1) || course.rating.average} ({course.rating.count})
                                </span>
                            )}
                        </div>

                        {/* Mentor */}
                        {course.mentor && (
                            <div className="flex items-center gap-3 pt-3 border-t border-border-subtle/40">
                                {course.mentor.avatar ? (
                                    <img src={course.mentor.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 flex items-center justify-center text-sm font-black text-white">
                                        {course.mentor.name?.[0]?.toUpperCase() || 'M'}
                                    </div>
                                )}
                                <div className="flex-1">
                                    <div className="text-sm font-bold text-text-primary flex items-center gap-2">
                                        {course.mentor.name}
                                        <PactBadge size={16} userId={course.mentorId} />
                                    </div>
                                    <div className="text-xs text-text-muted">Course mentor</div>
                                </div>
                                <Link to={`/profile/${course.mentorId}`} className="text-xs text-accent hover:underline">View profile →</Link>
                            </div>
                        )}

                        <div className="pt-3">
                            <EnrollButton courseId={course._id} isEnrolled={false} />
                        </div>
                    </div>
                </motion.div>

                {/* Curriculum */}
                <section className="mb-6">
                    <button
                        onClick={() => setOpenLessons((v) => !v)}
                        className="w-full flex items-center justify-between p-3 rounded-xl border border-border-subtle bg-surface/40 backdrop-blur-sm hover:border-accent/30"
                    >
                        <h2 className="text-base font-bold text-text-primary inline-flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-accent" /> Curriculum
                        </h2>
                        {openLessons ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    {openLessons && (
                        <ol className="mt-3 rounded-xl border border-border-subtle bg-surface/30 divide-y divide-border-subtle/40">
                            {(course.lessons || []).map((l, i) => (
                                <li key={l._id} className="flex items-center gap-3 p-3">
                                    <span className="w-7 h-7 rounded-full bg-surface/60 flex items-center justify-center text-xs font-black text-text-muted">{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-text-primary truncate">{l.title}</div>
                                        {l.description && <div className="text-xs text-text-muted truncate">{l.description}</div>}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-text-muted">
                                        {l.hasQuiz && <Award className="w-3.5 h-3.5 text-amber-300" />}
                                        {l.durationSec > 0 && <span>{fmtDur(l.durationSec)}</span>}
                                        {l.isFree ? (
                                            <span className="text-emerald-300">Free</span>
                                        ) : (
                                            <Lock className="w-3.5 h-3.5" />
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ol>
                    )}
                </section>

                {/* Q&A */}
                <section>
                    <button
                        onClick={() => setOpenQa((v) => !v)}
                        className="w-full flex items-center justify-between p-3 rounded-xl border border-border-subtle bg-surface/40 backdrop-blur-sm hover:border-accent/30"
                    >
                        <h2 className="text-base font-bold text-text-primary inline-flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 text-accent" /> Q&amp;A
                        </h2>
                        {openQa ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    {openQa && (
                        <div className="mt-3">
                            <CommentThread courseId={course._id} course={course} />
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default CourseDetail;
