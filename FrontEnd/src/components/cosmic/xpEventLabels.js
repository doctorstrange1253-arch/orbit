import { BookOpen, CheckCircle, Target, GraduationCap, Phone, Handshake, MessageCircle, Flame } from 'lucide-react';
import { Ribbon } from '../../cosmic/itemIcons';

export const XP_EVENT_LABELS = {
    lesson_completed:     'Lesson complete',
    quiz_passed:          'Quiz passed',
    quiz_perfect:         'Perfect quiz',
    course_completed:     'Course complete',
    session_completed:    'Session complete',
    peer_swap_completed:  'Peer swap complete',
    peer_help_posted:     'Helped a peer',
    streak_bonus:         'Streak bonus',
    achievement_unlocked: 'Achievement unlocked',
};

export const XP_EVENT_ICONS = {
    lesson_completed: BookOpen,
    quiz_passed: CheckCircle,
    quiz_perfect: Target,
    course_completed: GraduationCap,
    session_completed: Phone,
    peer_swap_completed: Handshake,
    peer_help_posted: MessageCircle,
    streak_bonus: Flame,
    achievement_unlocked: Ribbon,
};
