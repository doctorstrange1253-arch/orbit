import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ChevronDown, ChevronRight, BookOpen, PlayCircle, Star, MessageCircle, Award, Users } from 'lucide-react';
import { useState } from 'react';
import { courses } from '../services/courses';
import EnrollButton from '../components/courses/EnrollButton';
import CommentThread from '../components/courses/CommentThread';
import FuturisticBackdrop from '../components/common/FuturisticBackdrop';
import PactBadge from '../components/pact/PactBadge';
// V3 — Course Studio. The V2 curriculum accordion is replaced with a
// spatial Course Map (soul/studio/CourseMap.jsx). Tapping a node fires
// a VideoArrival (600ms) or BossCeremony (1.2s) before navigating.
import CourseMap from '../soul/studio/CourseMap';
import { StageRail } from '../soul/gameEngine/StageRail';
import VideoArrival from '../soul/studio/VideoArrival';
import BossCeremony from '../soul/studio/BossCeremony';
import api from '../services/api';

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

    // V3 — Course Studio state. `arrival` and `ceremony` carry the lesson
    // being entered + the source rect of the tapped node. On done, we
    // navigate to the player route.
    const [arrival, setArrival] = useState(null);
    const [ceremony, setCeremony] = useState(null);

    // The user's enrollment (if any) — drives completed/active state.
    const { data: enrollment } = useQuery({
        queryKey: ['enrollment', 'me', id],
        queryFn: () => api.get(`/courses/${id}/enrollments/me`).then((r) => r.data).catch(() => null),
        retry: false,
    });

    const { data: course, isLoading, error } = useQuery({
        queryKey: ['courses', 'detail', id],
        queryFn: () => courses.detail(id),
    });

    const completedLessonIds = enrollment?.completedLessonIds || [];

    // Capture the rect of the tapped node by reading the click event's
    // target (the <button> inside LessonNode / BossNode). This avoids
    // needing to plumb refs through CourseMap.
    const onCourseMapClick = (e) => {
      // Walk up to find the lesson/boss button.
      let el = e.target;
      while (el && el.tagName !== 'BUTTON') el = el.parentElement;
      if (!el || !el.getAttribute('aria-label')) return;
      // Match the lesson by title in the aria-label ("Lesson N: <title>")
      // or by "Boss level: <title>".
      const lessons = course?.lessons || [];
      const lesson = lessons.find((l) => {
        const title = (l.title || '').replace(/"/g, '');
        return el.getAttribute('aria-label').includes(title);
      });
      if (!lesson) return;
      const rect = el.getBoundingClientRect();
      if (lesson.isBoss) {
        setCeremony({ lesson, sourceRect: rect });
      } else {
        setArrival({ lesson, sourceRect: rect });
      }
    };

    const onArrivalDone = () => {
      const lessonId = arrival?.lesson?._id || arrival?.lesson?.id;
      setArrival(null);
      if (lessonId) navigate(`/courses/${id}/learn/${lessonId}`);
    };

    const onCeremonyDone = () => {
      const lessonId = ceremony?.lesson?._id || ceremony?.lesson?.id;
      setCeremony(null);
      if (lessonId) navigate(`/courses/${id}/learn/${lessonId}`);
    };

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
                        <div className="text-[10px] font-bold uppercase tracking-widest text-accent">{course.category}</div>
                        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">{course.title}</h1>
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
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 flex items-center justify-center text-sm font-bold text-white">
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
                            <EnrollButton
                                courseId={course._id}
                                isEnrolled={!!enrollment}
                                lastLessonId={enrollment?.lastLessonId}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Curriculum — V3 spatial Course Map */}
                <section className="mb-6">
                    <div className="mb-4">
                        <StageRail course={course} completedLessonIds={completedLessonIds} />
                    </div>
                    <button
                        onClick={() => setOpenLessons((v) => !v)}
                        className="w-full flex items-center justify-between p-3 rounded-xl border border-border-subtle bg-surface/40 backdrop-blur-sm hover:border-accent/30"
                    >
                        <h2 className="text-base font-bold text-text-primary inline-flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-accent" /> Course Map
                        </h2>
                        {openLessons ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    {openLessons && (
                        <div className="mt-3 rounded-2xl border border-border-subtle bg-surface/20 backdrop-blur-sm p-4 md:p-6">
                            {/* V3 — the spatial Course Map. Click bubbles up to onCourseMapClick
                                which finds the lesson button by aria-label and captures the
                                node's bounding rect for the arrival/ceremony animation. */}
                            <div onClick={onCourseMapClick}>
                              <CourseMap
                                course={course}
                                completedLessonIds={completedLessonIds}
                                onPick={() => { /* onCourseMapClick handles clicks via event bubbling */ }}
                              />
                            </div>
                        </div>
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

            {/* V3 — Course Studio overlays. The arrival (normal lesson) and
                ceremony (boss lesson) play on top of the page; onDone
                navigates to the player route. */}
            {arrival && (
              <VideoArrival
                sourceRect={arrival.sourceRect}
                lesson={arrival.lesson}
                onDone={onArrivalDone}
                onCancel={() => setArrival(null)}
              />
            )}
            {ceremony && (
              <BossCeremony
                lesson={ceremony.lesson}
                onDone={onCeremonyDone}
                onCancel={() => setCeremony(null)}
              />
            )}
        </div>
    );
};

export default CourseDetail;
