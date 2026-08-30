import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlayCircle, BookOpen, Star, Lock } from 'lucide-react';
import HolographicCard from '../fx/HolographicCard';

/**
 * CourseCard — student-facing catalog tile.
 *
 * HolographicCard with rarity="rare" so the pointer-tracked sheen always
 * reads as "premium course content". Mentor's avatar + name are visible
 * so the student knows who's behind the camera.
 */
const CourseCard = ({ course }) => {
    const lessonsCount = course.lessonsCount ?? (course.lessons?.length || 0);
    const isFree = !course.priceInr || course.priceInr === 0;
    return (
        <Link to={`/courses/${course._id}`} className="block">
            <HolographicCard rarity="rare" className="overflow-hidden h-full">
                <motion.div
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                    className="h-full flex flex-col"
                >
                    <div className="relative aspect-video bg-gradient-to-br from-indigo-900/60 to-cyan-900/40 overflow-hidden">
                        {course.thumbnail?.url ? (
                            <img
                                src={course.thumbnail.url}
                                alt={course.title}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <BookOpen className="w-10 h-10 text-text-muted/60" />
                            </div>
                        )}
                        <div className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-black/50 text-white backdrop-blur-sm">
                            <PlayCircle className="w-3 h-3" /> {lessonsCount} lessons
                        </div>
                        {!isFree && (
                            <div className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-black/60 text-amber-200 backdrop-blur-sm">
                                <Lock className="w-3 h-3" /> ₹{course.priceInr}
                            </div>
                        )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col gap-2">
                        <div className="text-[10px] font-black uppercase tracking-widest text-accent">
                            {course.category}
                        </div>
                        <h3 className="text-base font-bold text-text-primary line-clamp-2">
                            {course.title}
                        </h3>
                        {course.subtitle && (
                            <p className="text-xs text-text-secondary line-clamp-2">{course.subtitle}</p>
                        )}

                        <div className="mt-auto pt-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                                {course.mentor?.avatar ? (
                                    <img
                                        src={course.mentor.avatar}
                                        alt=""
                                        className="w-6 h-6 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 flex items-center justify-center text-[10px] font-black text-white">
                                        {course.mentor?.name?.[0]?.toUpperCase() || 'M'}
                                    </div>
                                )}
                                <span className="text-xs text-text-secondary truncate">{course.mentor?.name || 'Mentor'}</span>
                            </div>
                            {course.rating?.count > 0 && (
                                <div className="inline-flex items-center gap-1 text-xs text-amber-300">
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                    <span className="font-bold tabular-nums">{course.rating.average?.toFixed?.(1) || course.rating.average}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </HolographicCard>
        </Link>
    );
};

export default CourseCard;
