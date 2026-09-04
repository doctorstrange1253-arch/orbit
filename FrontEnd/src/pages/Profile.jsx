import { useEffect, useState, useRef, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  UserCircle, Shield, Save, Camera, Upload, X, Link as LinkIcon, Globe, Flame,
  ArrowRight, Users, GraduationCap, BookOpen, TrendingUp, Calendar, Wallet, Handshake, Inbox,
} from 'lucide-react';
import api from '../services/api';
import { useAuthStore, getCurrentWindow, ROLE_META, ACCOUNT_ROLES } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import Avatar from '../components/common/Avatar';
import Spinner from '../components/common/Spinner';
import Modal from '../components/common/Modal';
import { ProfileHeaderSkeleton } from '../components/skeletons';
import CosmicProfileCard from '../cosmic/CosmicProfileCard';
import { equippedFromUser } from '../cosmic/cosmetics';
import Nameplate from '../cosmic/Nameplate';
import { InfoDot, ScoreExplainerBody } from '../cosmic/scoreInfo';
import { TRUST_TOOLTIP, TRUST_SCORE_INFO } from '../cosmic/scoreCopy';
import LanguageMultiSelect from '../components/common/LanguageMultiSelect';
import { useNow } from '../hooks/useNow';

const MAX_LANGUAGES = 5;

const PRESET_AVATARS = [
  '/avatars/avatar-1.svg',
  '/avatars/avatar-2.svg',
  '/avatars/avatar-3.svg',
  '/avatars/avatar-4.svg',
  '/avatars/avatar-5.svg',
  '/avatars/avatar-6.svg',
];

// ── "Your Active Windows" panel constants ───────────────────────────────
// Mirror of the RoleSelector accent palette (peer=cyan, mentor=purple,
// student=blue). Re-defined locally to avoid a hard import from a UI-only
// component; the values are stable visual tokens, not behaviour.
const ROLE_ICONS = {
  peer_learner: Users,
  mentor: GraduationCap,
  student: BookOpen,
};

const ROLE_ACCENT = {
  peer_learner: {
    ring: 'ring-cyan-400/60',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-300',
    border: 'border-cyan-400/30',
    dot: 'bg-cyan-400',
  },
  mentor: {
    ring: 'ring-purple-400/60',
    bg: 'bg-purple-500/10',
    text: 'text-purple-300',
    border: 'border-purple-400/30',
    dot: 'bg-purple-400',
  },
  student: {
    ring: 'ring-blue-400/60',
    bg: 'bg-blue-500/10',
    text: 'text-blue-300',
    border: 'border-blue-400/30',
    dot: 'bg-blue-400',
  },
};

// Where each role's window "home" lives. Matches the role-prefixed URL
// scheme (App.jsx + RoleSelector) — opening a window drops the user into
// the canonical landing surface for that role.
const ROLE_HOME = {
  peer_learner: '/peer/dashboard',
  mentor: '/mentor/hub',
  student: '/student/sessions',
};

const formatInr = (n) => {
  const v = Number(n) || 0;
  return v.toLocaleString('en-IN', { maximumFractionDigits: 0 });
};

const Profile = () => {
  const { user, setUser } = useAuthStore();
  const { addToast }      = useUIStore();
  const queryClient       = useQueryClient();
  const location          = useLocation();
  const navigate          = useNavigate();
  const [langs, setLangs] = useState(['English']);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [reviewTab, setReviewTab] = useState('received');
  const [showTrustInfo, setShowTrustInfo] = useState(false);
  const fileInputRef = useRef(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get('/user/profile').then(r => r.data),
  });

  const { data: receivedReviews } = useQuery({
    queryKey: ['reviews', 'received', user?._id],
    queryFn: () => api.get(`/trust/ratings/${user._id}`).then(r => r.data.ratings),
    enabled: !!user?._id,
  });

  const { data: givenReviews } = useQuery({
    queryKey: ['reviews', 'given'],
    queryFn: () => api.get('/trust/my-given').then(r => r.data.ratings),
  });

  // ── "Your Active Windows" panel data ───────────────────────────────
  // Compute the user's effective role set (peer_learner is always on).
  // The array drives both the row list AND the conditional stat queries
  // below — only call the endpoint for the roles the user actually has.
  const userRoles = useMemo(() => {
    const r = user?.roles;
    const list = Array.isArray(r) && r.length > 0 ? r : ['peer_learner'];
    return list.includes('peer_learner') ? list : ['peer_learner', ...list];
  }, [user?.roles]);
  const userRolesSet = useMemo(() => new Set(userRoles), [userRoles]);

  // The navbar's notion of "what window am I in" — used to highlight the
  // matching row in the panel. On a shared page (e.g. /profile itself)
  // getCurrentWindow returns null, so we fall back to whatever the
  // navbar last wrote to sessionStorage. Mirrors the navbar's behaviour
  // exactly so the "You're here" pin is consistent.
  const activeWindowKey = useMemo(() => {
    const here = getCurrentWindow(location.pathname);
    if (here) return here;
    if (typeof window === 'undefined') return 'peer';
    try { return sessionStorage.getItem('orbit-last-window') || 'peer'; }
    catch { return 'peer'; }
  }, [location.pathname]);

  // Role-keyed lookups for the panel (peer='peer', mentor='mentor', student='student').
  const hasMentor  = userRolesSet.has('mentor');
  const hasStudent = userRolesSet.has('student');
  const hasPeer    = userRolesSet.has('peer_learner'); // always true

  // ── Role-specific stat queries (only enabled when the user has the role) ──
  // Mentor: earnings + bookings via /sessions/mentor/me (returns
  //   { profile, earnings: { totalInr, pendingInr, releasedInr } }).
  // We also reuse it to derive upcoming/past counts the same way
  // MentorSessions does — no second endpoint needed.
  const { data: mentorMe } = useQuery({
    queryKey: ['sessions', 'mentor', 'me', 'profile-panel'],
    queryFn: () => api.get('/sessions/mentor/me').then(r => r.data),
    enabled: hasMentor,
    retry: false,
    staleTime: 30_000,
  });
  const { data: mentorBookings = [] } = useQuery({
    queryKey: ['sessions', 'mentor', 'bookings', 'profile-panel'],
    queryFn: () => api.get('/sessions/mentor/bookings').then(r => r.data?.items || []),
    enabled: hasMentor,
    retry: false,
    staleTime: 60_000,
  });

  // Student: same /sessions/me the MySessions page uses; classify by
  // scheduledAt + status locally.
  const { data: studentSessions = [] } = useQuery({
    queryKey: ['sessions', 'me', 'profile-panel'],
    queryFn: () => api.get('/sessions/me').then(r => r.data?.items || []),
    enabled: hasStudent,
    retry: false,
    staleTime: 60_000,
  });

  // Peer: pending requests count + matches list. The /connections/pending
  // endpoint returns { incomingCount, incoming, outgoing } — we only
  // need the scalar count.
  const { data: peerPending } = useQuery({
    queryKey: ['connections', 'pending', 'profile-panel'],
    queryFn: () => api.get('/connections/pending').then(r => r.data),
    enabled: hasPeer,
    retry: false,
    staleTime: 30_000,
  });
  const { data: peerMatches = [] } = useQuery({
    queryKey: ['skills', 'matches', 'profile-panel'],
    queryFn: () => api.get('/skills/matches').then(r => Array.isArray(r.data) ? r.data : (r.data?.items || [])),
    enabled: hasPeer,
    retry: false,
    staleTime: 60_000,
  });

  // Derive student upcoming/past counts. Matches MySessions' bucketing
  // rules so the numbers agree with what the user sees on /my-sessions.
  const now = useNow();
  const { studentUpcoming, studentPast } = useMemo(() => {
    let up = 0; let pa = 0;
    for (const s of studentSessions) {
      const at = new Date(s.scheduledAt).getTime();
      const terminal = ['completed', 'cancelled', 'no_show', 'disputed'].includes(s.status);
      if (terminal || at < now) pa++; else up++;
    }
    return { studentUpcoming: up, studentPast: pa };
  }, [studentSessions, now]);

  // Peer active-matches count: matches that aren't already an accepted
  // connection are the "active" pool. /skills/matches already returns
  // just the suggestion list, so the length is the right starting point
  // for a glance-tile.
  const peerActiveMatches = Array.isArray(peerMatches) ? peerMatches.length : 0;

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    if (profile) {
      setValue('name',     profile.name     || '');
      setValue('bio',      profile.bio      || '');
      setValue('location', profile.location || '');
      setValue('socialLinks.github', profile.socialLinks?.github || '');
      setValue('socialLinks.linkedin', profile.socialLinks?.linkedin || '');
      setValue('socialLinks.website', profile.socialLinks?.website || '');
      // Sync the language chips from the loaded profile (intentional one-time
      // hydration when the profile query resolves, not derived render state).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLangs(profile.languages?.length ? profile.languages : ['English']);
    }
  }, [profile, setValue]);

  const updateMutation = useMutation({
    mutationFn: (data) => api.put('/user/profile', { ...data, languages: langs }),
    onSuccess: ({ data }) => {
      addToast('Profile saved!', 'success');
      setUser({ ...user, name: data.user?.name || user?.name });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['cosmic'] }); // refresh standing card (v7 §1)
    },
    onError: (e) => addToast(e.response?.data?.message || 'Save failed', 'error'),
  });

  // Upload custom avatar (Base64)
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      addToast('Please upload an image file', 'error');
      return;
    }

    // Validate file size (2MB max for base64 to avoid payload too large)
    if (file.size > 2 * 1024 * 1024) {
      addToast('Image must be less than 2MB', 'error');
      return;
    }

    setUploading(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      
      try {
        const { data } = await api.put('/user/avatar', { avatar: base64String });
        
        // Update auth store with full user object from backend to ensure navbar updates
        if (data.user) {
          setUser(data.user);
        }
        
        addToast('Avatar uploaded!', 'success');
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        setShowAvatarModal(false);
      } catch (err) {
        addToast(err.response?.data?.message || 'Upload failed', 'error');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Select preset avatar
  const selectPresetAvatar = async (avatarUrl) => {
    try {
      const { data } = await api.put('/user/avatar', { avatar: avatarUrl });
      
      // Update auth store with full user object from backend to ensure navbar updates
      if (data.user) {
        setUser(data.user);
      }
      
      addToast('Avatar updated!', 'success');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setShowAvatarModal(false);
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'error');
    }
  };

  // Remove avatar (use gradient)
  const removeAvatar = async () => {
    try {
      const { data } = await api.put('/user/avatar', { avatar: '' });
      
      // Update auth store with full user object from backend to ensure navbar updates
      if (data.user) {
        setUser(data.user);
      }
      
      addToast('Avatar removed', 'success');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setShowAvatarModal(false);
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'error');
    }
  };

  if (isLoading) return <ProfileHeaderSkeleton />;

  const trust = profile?.trustScore ?? 0;
  const trustColor = trust >= 70 ? '#00e5a0' : trust >= 40 ? '#ffb800' : '#ff4b4b';
  // Equipped Stardust-shop cosmetics (name glow + nebula background).
  const { glowClass, bgClass, decoClass, effectClass, plateKey } = equippedFromUser(profile);

  return (
    <div className="max-w-2xl mx-auto space-y-7">
      <Helmet>
        <title>Your Profile | Orbit</title>
        <meta name="description" content="Manage your Orbit profile, avatar, and personal details." />
        <meta property="og:title" content="Your Profile | Orbit" />
        <meta property="og:description" content="Customize your Orbit profile and connect with learners worldwide." />
        <meta property="og:image" content="https://react-skill-swap-fully-fledged.vercel.app/og-image.png" />
        <meta property="og:url" content="https://react-skill-swap-fully-fledged.vercel.app/profile" />
        <link rel="canonical" href="https://react-skill-swap-fully-fledged.vercel.app/profile" />
      </Helmet>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-extrabold"
          style={{ background: 'linear-gradient(135deg,#ffb800,#ff0076)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Profile Settings
        </h1>
        <p className="text-text-muted mt-1 text-sm">Your public persona on Orbit.</p>
      </div>

      {/* ── Your Active Windows ───────────────────────────────────────────
          A role-aware summary that lives on the otherwise role-agnostic
          /profile page. The navbar already shows the current role pill,
          so without this panel a multi-role user (e.g. mentor + peer)
          can't tell at a glance which side this shared page "belongs
          to". The panel renders one row per role the user holds, marks
          the active window with a ring + "You're here", and surfaces
          1-3 role-specific stat tiles below. */}
      <ActiveWindowsPanel
        userRoles={userRoles}
        userRolesSet={userRolesSet}
        activeWindowKey={activeWindowKey}
        onOpen={(path) => navigate(path)}
        stats={{
          mentor: hasMentor ? {
            pendingInr: mentorMe?.earnings?.pendingInr,
            totalInr: mentorMe?.earnings?.totalInr,
            upcoming: mentorBookings.filter((s) => {
              const at = new Date(s.scheduledAt).getTime();
              const terminal = ['completed', 'cancelled', 'no_show', 'disputed'].includes(s.status);
              return !terminal && at >= now;
            }).length,
          } : null,
          student: hasStudent ? { upcoming: studentUpcoming, past: studentPast } : null,
          peer: hasPeer ? { pending: peerPending?.incomingCount, matches: peerActiveMatches } : null,
        }}
      />

      {/* Avatar + meta card — shows the equipped nebula background if any.
          When a nebula is worn the card becomes a dark RENDER surface
          (cosmic-surface, like Holo-Bay), so the light-mode text remaps skip
          it, and a scrim keeps name/email legible on ANY background art. */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className={`relative flex items-center gap-5 p-6 rounded-2xl overflow-hidden ${bgClass} ${bgClass ? 'cosmic-surface' : ''}`}
        style={{ background: bgClass ? undefined : 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        {effectClass && <span className={effectClass} aria-hidden="true" />}
        {bgClass && <div className="pointer-events-none absolute inset-0 rounded-2xl bg-slate-950/45" aria-hidden="true" />}
        <div className="relative">
          <Avatar name={profile?.name || user?.name} size="xl" userId={profile?._id || user?._id} url={profile?.avatar} deco={decoClass} />
          <button
            onClick={() => setShowAvatarModal(true)}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-accent flex items-center justify-center hover:scale-110 transition-transform"
            style={{ boxShadow: '0 4px 12px rgba(0,198,255,0.4)' }}
          >
            <Camera size={14} className="text-text-primary" />
          </button>
        </div>
        <div className="relative min-w-0">
          <p className={`text-xl font-bold truncate ${glowClass || (bgClass ? 'text-white' : 'text-text-primary')}`}><Nameplate plateKey={plateKey}>{profile?.name || user?.name}</Nameplate></p>
          <p className={`text-sm truncate ${bgClass ? 'text-white/90' : 'text-text-muted'}`}>{profile?.email || user?.email}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <Shield size={13} style={{ color: trustColor }} />
            <span className="text-xs font-semibold" style={{ color: trustColor }}>
              Trust Score: {trust}/100
            </span>
            <InfoDot label="What is Trust Score?">{TRUST_TOOLTIP}</InfoDot>
            <button type="button" onClick={() => setShowTrustInfo(true)}
              className="text-[11px] text-text-muted underline hover:text-text-secondary">
              How it works
            </button>
          </div>
          {profile?.orbit?.streak?.longest > 0 && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <Flame size={14} className="text-orange-400" />
              <span className="text-xs font-semibold text-text-secondary">
                Longest streak: {profile.orbit.streak.longest} days
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Cosmic standing — additive, sits beside the Trust score above */}
      {(profile?._id || user?._id) && (
        <CosmicProfileCard userId={profile?._id || user?._id} self />
      )}

      {/* Trust Score explainer (§4.5) — display-only; Trust engine untouched */}
      <Modal isOpen={showTrustInfo} onClose={() => setShowTrustInfo(false)} title={TRUST_SCORE_INFO.title}>
        <ScoreExplainerBody info={TRUST_SCORE_INFO} />
      </Modal>

      {/* Form */}
      <form onSubmit={handleSubmit(d => updateMutation.mutate(d))} className="space-y-5">
        <div className="p-6 rounded-2xl space-y-5"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <h2 className="font-display font-bold text-text-primary text-base flex items-center gap-2">
            <UserCircle size={15} className="text-accent" /> Basic Info
          </h2>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Full Name</label>
            <input {...register('name')} placeholder="Your name"
              className="input-glass w-full px-4 py-3 text-sm text-text-primary" />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Bio</label>
            <textarea {...register('bio')} rows={3} placeholder="Tell others about yourself…"
              className="input-glass w-full px-4 py-3 text-sm text-text-primary resize-none" />
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Location</label>
            <input {...register('location')} placeholder="e.g. Dehradun, India"
              className="input-glass w-full px-4 py-3 text-sm text-text-primary" />
          </div>

          {/* Languages */}
          <div>
            <label htmlFor="profile-languages" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Spoken Languages <span className="normal-case text-text-muted lowercase">(search and pick up to {MAX_LANGUAGES})</span>
            </label>
            <LanguageMultiSelect
              id="profile-languages"
              value={langs}
              onChange={setLangs}
              maxSelections={MAX_LANGUAGES}
            />
          </div>
        </div>

        <div className="p-6 rounded-2xl space-y-5"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <h2 className="font-display font-bold text-text-primary text-base flex items-center gap-2">
            <LinkIcon size={15} className="text-accent" /> Social Links
          </h2>
          
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-2">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a5.5 5.5 0 0 0-1.5-3.8 5.5 5.5 0 0 0-.1-3.8s-1.2-.4-3.9 1.4a13.4 13.4 0 0 0-7 0C6.2 3.4 5 3.8 5 3.8a5.5 5.5 0 0 0-.1 3.8A5.5 5.5 0 0 0 3.4 11.4c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4"/><path d="M9 20a5.5 5.5 0 0 1-5-2.5"/></svg>
              GitHub URL
            </label>
            <input {...register('socialLinks.github', {
              pattern: { value: /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+$/, message: 'Must be a valid GitHub URL' }
            })} placeholder="https://github.com/username"
              className="input-glass w-full px-4 py-3 text-sm text-text-primary" />
            {errors.socialLinks?.github && <p className="mt-1.5 text-xs text-danger">{errors.socialLinks.github.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-2">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              LinkedIn URL
            </label>
            <input {...register('socialLinks.linkedin', {
              pattern: { value: /^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/, message: 'Must be a valid LinkedIn URL' }
            })} placeholder="https://linkedin.com/in/username"
              className="input-glass w-full px-4 py-3 text-sm text-text-primary" />
            {errors.socialLinks?.linkedin && <p className="mt-1.5 text-xs text-danger">{errors.socialLinks.linkedin.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-2"><Globe size={14}/> Personal Website</label>
            <input {...register('socialLinks.website')} placeholder="https://yourwebsite.com"
              className="input-glass w-full px-4 py-3 text-sm text-text-primary" />
          </div>
        </div>

        {/* Submit */}
        <button type="submit" disabled={updateMutation.isPending}
          className="btn-gradient w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm disabled:opacity-60">
          {updateMutation.isPending
            ? <><Spinner variant="arc" size={16} /> Saving…</>
            : <><Save size={15} /> Save Changes</>}
        </button>
      </form>

      {/* Avatar Upload Modal */}
      {showAvatarModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowAvatarModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-dark-lighter border border-border-subtle rounded-2xl p-6 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-display font-bold text-text-primary">Change Avatar</h3>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Upload Custom */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-text-secondary mb-3">Upload Custom Image</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border-subtle hover:border-accent hover:bg-accent/5 transition-all text-text-secondary hover:text-text-primary disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Spinner variant="arc" size={16} />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Choose Image (Max 5MB)
                  </>
                )}
              </button>
            </div>

            {/* Preset Avatars */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-text-secondary mb-3">Or Select Preset</p>
              <div className="grid grid-cols-6 gap-3">
                {PRESET_AVATARS.map((avatar) => (
                  <button
                    key={avatar}
                    onClick={() => selectPresetAvatar(avatar)}
                    className="w-full aspect-square rounded-full overflow-hidden border-2 border-transparent hover:border-accent transition-all hover:scale-110"
                  >
                    <img src={avatar} alt="preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Remove Avatar */}
            {profile?.avatar && (
              <button
                onClick={removeAvatar}
                className="w-full py-2.5 text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Remove Avatar (Use Gradient)
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
      {/* ── Reviews Section ── */}
      <div className="mt-8 glass-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-display font-bold text-text-primary">Reviews</h2>
          <div className="flex gap-2 p-1 rounded-xl bg-surface border border-border-subtle self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setReviewTab('received')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                reviewTab === 'received' 
                  ? 'bg-accent/20 text-accent shadow-sm' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Received
            </button>
            <button
              type="button"
              onClick={() => setReviewTab('given')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                reviewTab === 'given' 
                  ? 'bg-accent/20 text-accent shadow-sm' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Given
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {reviewTab === 'received' && (
            receivedReviews?.length > 0 ? (
              receivedReviews.map(r => (
                <div key={r._id} className="p-4 rounded-xl bg-surface border border-border-subtle flex gap-4">
                  <Avatar name={r.fromUser?.name} url={r.fromUser?.avatar} size="md" userId={r.fromUser?._id} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <p className="font-semibold text-sm truncate">{r.fromUser?.name}</p>
                      <span className="text-xs text-text-muted flex-shrink-0">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`text-[12px] ${i < r.score ? 'text-[#ffb800]' : 'text-text-muted'}`}>★</span>
                      ))}
                    </div>
                    <p className="text-sm text-text-secondary break-words">{r.review || "No written review provided."}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-text-muted py-8 bg-surface rounded-xl border border-border-subtle">No reviews received yet.</p>
            )
          )}

          {reviewTab === 'given' && (
            givenReviews?.length > 0 ? (
              givenReviews.map(r => (
                <div key={r._id} className="p-4 rounded-xl bg-surface border border-border-subtle flex gap-4">
                  <Avatar name={r.toUser?.name} url={r.toUser?.avatar} size="md" userId={r.toUser?._id} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <p className="font-semibold text-sm truncate">To: {r.toUser?.name}</p>
                      <span className="text-xs text-text-muted flex-shrink-0">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`text-[12px] ${i < r.score ? 'text-[#ffb800]' : 'text-text-muted'}`}>★</span>
                      ))}
                    </div>
                    <p className="text-sm text-text-secondary break-words">{r.review || "No written review provided."}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-text-muted py-8 bg-surface rounded-xl border border-border-subtle">You haven't reviewed anyone yet.</p>
            )
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * ActiveWindowsPanel — "Your Active Windows" UI block.
 *
 * Renders one row per role the user actually holds (peer_learner is
 * always present), marks the row matching the current window with a
 * ring + "You're here" label, and shows 1-3 role-specific stat tiles
 * for every active role. Always renders all 3 souls (peer_learner,
 * mentor, student) so the user can see which windows exist and which
 * need to be enabled. Roles the user has not added are shown in a
 * disabled state with an "Add this role" button linking to /settings.
 * Plain surface — no 3D glass, no holographic tilt.
 *
 * Props:
 *   userRoles        string[]   normalized role list (peer_learner guaranteed)
 *   userRolesSet     Set        O(1) membership test mirror of userRoles
 *   activeWindowKey  'peer' | 'mentor' | 'student'  the navbar's notion of
 *                                "where you are" — already falls back to
 *                                sessionStorage when on a shared page
 *   onOpen           fn(path)   navigate to the role's home route
 *   stats            { mentor?, student?, peer? }   pre-shaped stat bundles
 *                                for each active role (or null when the
 *                                role isn't active). Lets the parent keep
 *                                all data fetching in one place.
 */
const ActiveWindowsPanel = ({ userRoles, userRolesSet, activeWindowKey, onOpen, stats }) => {
  // Map each account role to its window key (the string getCurrentWindow
  // returns). peer_learner === 'peer', mentor === 'mentor', student ===
  // 'student'. Centralised so the "You're here" highlight stays in sync
  // with the navbar's route-prefix detection.
  const ROLE_TO_WINDOW = {
    peer_learner: 'peer',
    mentor: 'mentor',
    student: 'student',
  };
  const WINDOW_TO_META = {
    peer:   { label: 'Peer Learner', role: 'peer_learner' },
    mentor: { label: 'Mentor',       role: 'mentor' },
    student:{ label: 'Student',      role: 'student' },
  };

  const hereMeta = WINDOW_TO_META[activeWindowKey];
  // Roles the user holds but aren't their current window. Used to
  // surface the "You also have the X role" hint when the panel renders
  // on /profile but the user is currently in a different window.
  const otherActiveRoles = userRoles.filter(
    (r) => ROLE_TO_WINDOW[r] && ROLE_TO_WINDOW[r] !== activeWindowKey
  );

  return (
    <div className="p-5 md:p-6 rounded-2xl bg-surface border border-border-subtle">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-text-muted flex items-center gap-2">
            <Inbox className="w-3.5 h-3.5 text-accent" /> Your Active Windows
          </h2>
          <p className="text-xs text-text-muted mt-1">
            {userRoles.length === 1
              ? 'You have 1 role on Orbit. Add more any time from Settings.'
              : `You have ${userRoles.length} of 3 roles on Orbit. Switch between them anytime.`}
          </p>
        </div>
        {hereMeta && (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-[10px] font-bold uppercase tracking-widest bg-accent/10 text-accent border border-accent/30">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" /> You&rsquo;re in {hereMeta.label}
          </span>
        )}
      </div>

      {/* ── Role rows (all 3 souls — disabled for ones the user doesn't have) */}
      <ul className="space-y-2.5" role="list">
        {ACCOUNT_ROLES.map((role) => {
          const meta = ROLE_META[role];
          const accent = ROLE_ACCENT[role];
          const Icon = ROLE_ICONS[role];
          const isHere = ROLE_TO_WINDOW[role] === activeWindowKey;
          const isActive = userRolesSet.has(role);
          return (
            <li
              key={role}
              className={[
                'flex items-center gap-3 p-3 rounded-xl border transition-all',
                isActive && isHere
                  ? `${accent.ring} ring-2 ${accent.bg} ${accent.border}`
                  : isActive
                    ? `${accent.border} ${accent.bg}`
                    : 'border-border-subtle bg-surface/40 opacity-60',
              ].join(' ')}
            >
              <div
                className={[
                  'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border',
                  isActive && isHere ? accent.bg : 'bg-surface',
                  isActive ? accent.border : 'border-border-subtle',
                ].join(' ')}
              >
                <Icon size={18} className={isActive ? accent.text : 'text-text-muted'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-text-primary">{meta.label}</span>
                  {isActive ? (
                    <span
                      className={[
                        'text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border',
                        isHere
                          ? `${accent.bg} ${accent.text} ${accent.border}`
                          : 'bg-surface text-text-muted border-border-subtle',
                      ].join(' ')}
                    >
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border border-border-subtle bg-surface text-text-muted">
                      Not enabled
                    </span>
                  )}
                  {isHere && isActive && (
                    <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-accent/15 text-accent border border-accent/30">
                      You&rsquo;re here
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[11px] text-text-muted truncate">{meta.description}</p>
              </div>
              {isActive ? (
                <button
                  type="button"
                  onClick={() => onOpen?.(ROLE_HOME[role])}
                  className={[
                    'flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                    isHere
                      ? 'bg-accent text-white hover:bg-accent/90'
                      : 'bg-surface text-text-secondary hover:text-text-primary border border-border-subtle',
                  ].join(' ')}
                >
                  Open <ArrowRight size={12} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpen?.('/settings')}
                  className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors bg-surface text-text-muted hover:text-text-primary border border-border-subtle border-dashed"
                >
                  Add this role <ArrowRight size={12} />
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {/* ── Stat tiles (one section per active role) ──────────────── */}
      {(stats.mentor || stats.student || stats.peer) && (
        <div className="mt-5 pt-5 border-t border-border-subtle space-y-4">
          {stats.mentor && (
            <RoleStatsBlock
              accent={ROLE_ACCENT.mentor}
              title="Mentor window"
              tiles={[
                {
                  Icon: Wallet,
                  label: 'Pending payout',
                  value: stats.mentor.pendingInr != null ? `₹${formatInr(stats.mentor.pendingInr)}` : '—',
                  tone: 'text-warning',
                },
                {
                  Icon: TrendingUp,
                  label: 'Total earned',
                  value: stats.mentor.totalInr != null ? `₹${formatInr(stats.mentor.totalInr)}` : '—',
                  tone: 'text-success',
                },
                {
                  Icon: Calendar,
                  label: 'Upcoming sessions',
                  value: typeof stats.mentor.upcoming === 'number' ? stats.mentor.upcoming : '—',
                  tone: 'text-accent',
                },
              ]}
            />
          )}
          {stats.student && (
            <RoleStatsBlock
              accent={ROLE_ACCENT.student}
              title="Student window"
              tiles={[
                {
                  Icon: Calendar,
                  label: 'Upcoming',
                  value: typeof stats.student.upcoming === 'number' ? stats.student.upcoming : '—',
                  tone: 'text-accent',
                },
                {
                  Icon: BookOpen,
                  label: 'Past sessions',
                  value: typeof stats.student.past === 'number' ? stats.student.past : '—',
                  tone: 'text-text-secondary',
                },
              ]}
            />
          )}
          {stats.peer && (
            <RoleStatsBlock
              accent={ROLE_ACCENT.peer_learner}
              title="Peer window"
              tiles={[
                {
                  Icon: Inbox,
                  label: 'Pending requests',
                  value: typeof stats.peer.pending === 'number' ? stats.peer.pending : '—',
                  tone: 'text-accent',
                },
                {
                  Icon: Handshake,
                  label: 'Active matches',
                  value: typeof stats.peer.matches === 'number' ? stats.peer.matches : '—',
                  tone: 'text-cyan-300',
                },
              ]}
            />
          )}
        </div>
      )}

      {/* ── "You also have the X role" hint ──────────────────────────
          Only shown on shared pages where getCurrentWindow() === null
          but we still have a fallback window key. Tells the user
          there's a paid/extra role available to switch into. */}
      {otherActiveRoles.length > 0 && hereMeta && (
        <div className="mt-4 flex items-center justify-between gap-3 p-3 rounded-xl bg-surface/60 border border-border-subtle">
          <p className="text-xs text-text-secondary">
            You also have{' '}
            <span className="font-semibold text-text-primary">
              {otherActiveRoles
                .map((r) => ROLE_META[r]?.label)
                .filter(Boolean)
                .join(' + ')}
            </span>{' '}
            enabled.
          </p>
          <button
            type="button"
            onClick={() => onOpen?.(ROLE_HOME[otherActiveRoles[0]])}
            className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
          >
            Open {ROLE_META[otherActiveRoles[0]]?.label} window <ArrowRight size={12} />
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * RoleStatsBlock — a labelled cluster of 1-3 stat tiles, used to group
 * per-role numbers under a coloured heading so the panel stays readable
 * when the user has all 3 roles active (would otherwise be 8 tiles in
 * one row). `accent` is the same ROLE_ACCENT map the rows use so the
 * colour story carries from row → stats.
 */
const RoleStatsBlock = ({ accent, title, tiles }) => (
  <div>
    <div className="flex items-center gap-2 mb-2">
      <span className={`w-1.5 h-1.5 rounded-full ${accent.dot}`} />
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{title}</h3>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
      {tiles.map(({ Icon, label, value, tone }) => (
        <div
          key={label}
          className="rounded-xl border border-border-subtle bg-surface/40 p-3 flex flex-col gap-1.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted truncate">
              {label}
            </span>
            {Icon && <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${tone || 'text-text-secondary'}`} />}
          </div>
          <div className={`text-lg font-bold ${tone || 'text-text-primary'} truncate`}>{value}</div>
        </div>
      ))}
    </div>
  </div>
);

export default Profile;
