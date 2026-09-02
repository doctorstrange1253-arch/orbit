import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Award, ChevronLeft, Sparkles } from 'lucide-react';
import { courses } from '../services/courses';
import CertificateView from '../components/courses/CertificateView';
import FuturisticBackdrop from '../components/common/FuturisticBackdrop';

const CertificatePage = () => {
    const { id } = useParams();
    const { data, isLoading, error } = useQuery({
        queryKey: ['courses', 'certificate', id],
        queryFn: () => courses.certificate(id),
    });

    if (isLoading) {
        return <div className="relative min-h-screen"><FuturisticBackdrop /><div className="relative z-10 max-w-4xl mx-auto p-12 text-text-secondary">Loading your certificate…</div></div>;
    }
    if (error || !data) {
        return (
            <div className="relative min-h-screen">
                <FuturisticBackdrop />
                <div className="relative z-10 max-w-4xl mx-auto p-12">
                    <Helmet><title>Certificate · Orbit</title></Helmet>
                    <h1 className="text-2xl font-bold text-text-primary mb-2">Certificate not ready yet</h1>
                    <p className="text-text-secondary mb-4">Finish every lesson in the course to unlock your certificate.</p>
                    <Link to={`/courses/${id}/learn`} className="inline-flex items-center gap-1 px-4 py-2 rounded-pill bg-accent/15 text-accent border border-accent/30 text-sm font-bold uppercase tracking-widest">
                        <Sparkles className="w-4 h-4" /> Continue learning
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen overflow-hidden">
            <FuturisticBackdrop />
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10"
            >
                <Helmet><title>Certificate · {data?.course?.title || 'Orbit'}</title></Helmet>

                <div className="max-w-5xl mx-auto px-4 py-6">
                    <Link to={`/courses/${id}`} className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-primary">
                        <ChevronLeft className="w-3.5 h-3.5" /> Back to course
                    </Link>
                </div>

                <div className="max-w-5xl mx-auto px-4 pb-12">
                    <CertificateView
                        certificate={data.certificate}
                        course={data.course}
                        mentor={data.mentor}
                        learner={data.learner}
                    />

                    <div className="mt-8 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill text-[11px] font-bold uppercase tracking-widest text-amber-300 bg-amber-500/10 border border-amber-400/30">
                            <Award className="w-3.5 h-3.5" /> Cert ID {data.certificate?.certId}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default CertificatePage;
