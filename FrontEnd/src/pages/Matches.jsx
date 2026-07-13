import { useQuery, useMutation } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import SkillCard from '../components/skills/SkillCard';
import { SkillGridSkeleton } from '../components/skeletons';
import ErrorState from '../components/common/ErrorState';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { connectSocket } from '../services/socket';
import { Handshake, Zap } from 'lucide-react';

const Matches = () => {
  const { addToast } = useUIStore();
  const { user } = useAuthStore();
  const myId = user?._id;
  const navigate = useNavigate();
  const { notifyUserOffline } = useNotificationStore();
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['skills', 'matches'],
    queryFn: () => api.get('/skills/matches').then(r => r.data),
  });

  // Accepted/completed connections so a match that's already a connection shows
  // Message + Call instead of a dead Request/disabled Call (M-02).
  const { data: myConnections = [] } = useQuery({
    queryKey: ['connections', 'all'],
    queryFn: () => api.get('/connections/all').then(r => r.data),
  });

  const connectionByUser = useMemo(() => {
    const map = new Map();
    (Array.isArray(myConnections) ? myConnections : []).forEach((c) => {
      if (c.status && c.status !== 'accepted' && c.status !== 'completed') return;
      const reqId = c.requester?._id || c.requester;
      const recId = c.receiver?._id || c.receiver;
      const otherId = String(reqId) === String(myId) ? recId : reqId;
      if (otherId) map.set(String(otherId), c._id);
    });
    return map;
  }, [myConnections, myId]);

  useEffect(() => {
    if (!myId) return;
    const socket = connectSocket(myId);
    socket.emit('get-online-users');
    const onUsers = (ids) => setOnlineUsers(new Set(ids));
    const onOnline = (id) => setOnlineUsers((prev) => new Set([...prev, id]));
    const onOffline = (id) =>
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    socket.on('users-online', onUsers);
    socket.on('user-online', onOnline);
    socket.on('user-offline-status', onOffline);
    return () => {
      socket.off('users-online', onUsers);
      socket.off('user-online', onOnline);
      socket.off('user-offline-status', onOffline);
    };
  }, [myId]);

  const connectMutation = useMutation({
    mutationFn: ({ receiverId, skillId }) => api.post('/connections/request', { receiverId, skillId }),
    onSuccess: () => addToast('Connection request sent!', 'success'),
    onError: (e) => addToast(e.response?.data?.message || 'Failed to send request', 'error'),
  });

  const handleCall = (other, connectionId) => {
    if (!connectionId) return;
    if (!onlineUsers.has(String(other?._id))) {
      notifyUserOffline(other?.name || 'User');
      return;
    }
    navigate(`/call/${connectionId}`, { state: { otherUser: other, isCaller: true } });
  };

  const handleMessage = (other) => {
    window.dispatchEvent(new CustomEvent('open-chat', { detail: other }));
  };

  // B-01 defence-in-depth: never show your own listings.
  const matches = (data?.matches || []).filter((s) => {
    const ownerId = s.userId?._id || s.userId;
    return !myId || String(ownerId) !== String(myId);
  });

  return (
    <div className="space-y-7">
      <Helmet>
        <title>Your Matches | Orbit</title>
        <meta name="description" content="See your perfect skill-swap matches — people who teach what you want and want what you teach." />
        <meta property="og:title" content="Your Matches | Orbit" />
        <meta property="og:url" content="https://react-skill-swap-fully-fledged.vercel.app/matches" />
        <link rel="canonical" href="https://react-skill-swap-fully-fledged.vercel.app/matches" />
      </Helmet>
      <div>
        <h1 className="text-3xl font-display font-bold flex items-center gap-3 heading-teal-gradient"
          style={{ background: 'linear-gradient(135deg,#00e5a0,#00c6ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          <Handshake size={26} className="icon-teal" style={{ color: '#00e5a0', WebkitTextFillColor: '#00e5a0' }} />
          Your Matches
        </h1>
        <p className="text-text-muted mt-1 text-sm">People whose skills perfectly align with yours — mutual exchanges.</p>
      </div>

      {/* Count badge */}
      {!isLoading && matches.length > 0 && (
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium"
          style={{ background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.25)', color: '#00e5a0' }}>
          <Zap size={13} /> {matches.length} perfect match{matches.length !== 1 ? 'es' : ''} found
        </div>
      )}

      {/* Error state */}
      {error && <ErrorState message="Failed to load matches." onRetry={refetch} />}

      {isLoading ? (
        <SkillGridSkeleton count={3} />
      ) : matches.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="py-20 text-center rounded-2xl"
          style={{ background: 'var(--bg-surface-glass)', border: '1px dashed rgba(0,229,160,0.15)' }}>
          <Handshake size={36} className="mx-auto mb-4" style={{ color: 'rgba(0,229,160,0.25)' }} />
          <h3 className="text-lg font-bold text-text-primary mb-2">No matches yet</h3>
          <p className="text-text-muted text-sm max-w-xs mx-auto">
            Add more skills or browse the community. Matches appear when someone offers what you want and wants what you offer.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {matches.map((s) => {
            const ownerId = String(s.userId?._id || s.userId);
            const connectionId = s.connectionId || connectionByUser.get(ownerId);
            const isConnected = Boolean(s.isConnected ?? connectionId);
            const other = typeof s.userId === 'object' ? s.userId : { _id: ownerId };
            return (
              <SkillCard
                key={s._id}
                skill={s}
                variant="match"
                isConnected={isConnected}
                onConnect={(skillId, receiverId) => connectMutation.mutate({ skillId, receiverId })}
                onMessage={() => handleMessage(other)}
                onCall={() => handleCall(other, connectionId)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Matches;
