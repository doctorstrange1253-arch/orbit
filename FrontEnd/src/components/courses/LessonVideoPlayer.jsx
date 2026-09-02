import { ShieldCheck } from 'lucide-react';
import LessonPlayer from './LessonPlayer';
import SignedVideoPlayer from '../fx/SignedVideoPlayer';

const LessonVideoPlayer = ({ course, isOwner, ...rest }) => {
  const isPaid = (course?.priceInr || 0) > 0;
  const useSigned = isPaid && !isOwner;

  if (!useSigned) return <LessonPlayer {...rest} />;

  return (
    <div className="relative">
      <SignedVideoPlayer {...rest} />
      <div
        className="absolute top-2 right-2 z-20 inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-[9px] font-bold uppercase tracking-widest bg-surface/85 border border-border-subtle text-text-secondary backdrop-blur-sm"
        title="Signed URL · forensic + visible watermark · 5-min TTL"
      >
        <ShieldCheck size={10} className="text-success" /> Protected
      </div>
    </div>
  );
};

export default LessonVideoPlayer;
