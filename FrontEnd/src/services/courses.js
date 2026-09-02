import api from './api';

// Courses — full course surface: browse, enroll, learn, Q&A, certificate.
// All routes are /api/courses/* (mounted in BackEnd/server.js).

const DAY_MS = 86_400_000;

function seenLabel(value, now) {
    if (!value) return 'never';
    const days = Math.floor((now - new Date(value).getTime()) / DAY_MS);
    if (days <= 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
}

function nextLessonId(row) {
    const done = new Set(row.completedLessonIds || []);
    const lesson = (row.course?.lessons || [])
        .slice()
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .find((l) => !done.has(String(l._id)));
    return lesson || null;
}

function enrichEnrollments(items) {
    const now = Date.now();
    return items
        .filter((row) => row.course)
        .map((row) => ({
            ...row,
            seenLabel: seenLabel(row.updatedAt, now),
            nextLesson: row.completedAt ? null : nextLessonId(row),
        }));
}

export const courses = {
    // Public browse
    list: (params = {}) => api.get('/courses', { params }).then((r) => r.data),
    categories: () => api.get('/courses/categories').then((r) => r.data?.items || []),
    detail: (id) => api.get(`/courses/${id}`).then((r) => r.data),

    // Mentor authoring
    create: (body) => api.post('/courses', body).then((r) => r.data),
    update: (id, body) => api.patch(`/courses/${id}`, body).then((r) => r.data),
    remove: (id) => api.delete(`/courses/${id}`).then((r) => r.data),
    publish: (id) => api.post(`/courses/${id}/publish`).then((r) => r.data),
    unpublish: (id) => api.post(`/courses/${id}/unpublish`).then((r) => r.data),
    enrollments: (id) => api.get(`/courses/${id}/enrollments`).then((r) => r.data?.items || []),

    // Uploads (multipart)
    uploadVideo: (file, onProgress) => {
        const fd = new FormData();
        fd.append('video', file);
        return api.post('/courses/upload-video', fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (e) => onProgress?.(e.total ? Math.round((e.loaded * 100) / e.total) : 0),
        }).then((r) => r.data);
    },
    uploadThumbnail: (file) => {
        const fd = new FormData();
        fd.append('thumbnail', file);
        return api.post('/courses/upload-thumbnail', fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }).then((r) => r.data);
    },

    // Lessons
    addLesson: (id, body) => api.post(`/courses/${id}/lessons`, body).then((r) => r.data),
    updateLesson: (id, lessonId, body) => api.patch(`/courses/${id}/lessons/${lessonId}`, body).then((r) => r.data),
    deleteLesson: (id, lessonId) => api.delete(`/courses/${id}/lessons/${lessonId}`).then((r) => r.data),
    reorderLessons: (id, order) => api.post(`/courses/${id}/lessons/reorder`, { order }).then((r) => r.data),

    // Student progress
    enroll: (id) => api.post(`/courses/${id}/enroll`).then((r) => r.data),
    myEnrollments: () => api.get('/courses/enrollments/me').then((r) => enrichEnrollments(r.data?.items || [])),
    myEnrollment: (id) => api.get(`/courses/${id}/enrollments/me`).then((r) => r.data).catch(() => null),
    completeLesson: (id, lessonId) => api.post(`/courses/${id}/lessons/${lessonId}/complete`).then((r) => r.data),
    submitQuiz: (id, lessonId, answers) => api.post(`/courses/${id}/lessons/${lessonId}/quiz`, { answers }).then((r) => r.data),

    // Q&A
    listComments: (id, lessonId) => {
        const params = lessonId ? { lessonId } : {};
        return api.get(`/courses/${id}/comments`, { params }).then((r) => r.data?.items || []);
    },
    postComment: (id, body) => api.post(`/courses/${id}/comments`, body).then((r) => r.data),
    updateComment: (commentId, body) => api.patch(`/courses/comments/${commentId}`, body).then((r) => r.data),
    deleteComment: (commentId) => api.delete(`/courses/comments/${commentId}`).then((r) => r.data),

    // Certificate
    certificate: (id) => api.get(`/courses/${id}/certificate`).then((r) => r.data),
};

export default courses;
