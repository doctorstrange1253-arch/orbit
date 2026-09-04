import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    CheckCircle, Loader, GraduationCap, IndianRupee,
    Tag, X, Globe2, Send, Eye, Wand2,
} from 'lucide-react';
import api from '../../services/api';
import TopicPicker from '../taxonomy/TopicPicker';

const TIMEZONES = [
    'Asia/Kolkata', 'Asia/Tokyo', 'Asia/Singapore', 'Asia/Shanghai',
    'Asia/Dubai', 'Asia/Seoul', 'Asia/Bangkok', 'Asia/Manila',
    'Europe/London', 'Europe/Berlin', 'Europe/Paris', 'Europe/Madrid',
    'Europe/Amsterdam', 'Europe/Rome', 'Europe/Moscow', 'Europe/Istanbul',
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'America/Toronto', 'America/Mexico_City', 'America/Sao_Paulo', 'America/Argentina/Buenos_Aires',
    'Africa/Cairo', 'Africa/Johannesburg', 'Africa/Lagos', 'Africa/Nairobi',
    'Australia/Sydney', 'Pacific/Auckland',
];

const MentorApplicationForm = ({ initial = {} }) => {
    const qc = useQueryClient();
    const [headline, setHeadline] = useState(initial.headline || '');
    const [bio, setBio] = useState(initial.bio || '');
    const [hourlyRateInr, setHourlyRateInr] = useState(initial.hourlyRateInr || 1000);
    const [timezone, setTimezone] = useState(initial.timezone || 'Asia/Kolkata');
    const [skillInput, setSkillInput] = useState('');
    const [skills, setSkills] = useState(Array.isArray(initial.skills) ? initial.skills : []);
    const [topics, setTopics] = useState(Array.isArray(initial.topics) ? initial.topics : []);

    const payoutMultiplier = 0.85;
    const keepPerHour = Math.round(hourlyRateInr * payoutMultiplier);
    const takeHomePerSession30 = Math.round((hourlyRateInr / 2) * payoutMultiplier);
    const headlineCount = headline.length;
    const bioCount = bio.length;

    const addSkill = (raw) => {
        const cleaned = String(raw || '').trim().replace(/,$/, '');
        if (!cleaned) return;
        if (skills.some((s) => s.toLowerCase() === cleaned.toLowerCase())) return;
        if (skills.length >= 12) return;
        setSkills([...skills, cleaned]);
        setSkillInput('');
    };
    const removeSkill = (s) => setSkills(skills.filter((x) => x !== s));
    const onSkillKey = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addSkill(skillInput);
        } else if (e.key === 'Backspace' && !skillInput && skills.length) {
            removeSkill(skills[skills.length - 1]);
        }
    };

    const m = useMutation({
        mutationFn: () => api.post('/sessions/mentor/apply', {
            headline: headline.trim(),
            bio: bio.trim(),
            hourlyRateInr: Number(hourlyRateInr),
            timezone,
            skills: skills.map((s) => s.trim()).filter(Boolean),
            topics,
        }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['sessions', 'mentor', 'me'] });
            qc.invalidateQueries({ queryKey: ['sessions', 'mentor', 'bookings'] });
        },
    });

    const headlineOk = headline.trim().length >= 8 && headlineCount <= 120;
    const rateOk = Number(hourlyRateInr) >= 100;
    const bioOk = bio.trim().length >= 40;
    const skillsOk = skills.length >= 1;
    const topicsOk = topics.length >= 1;
    const canSubmit = headlineOk && rateOk && bioOk && skillsOk && topicsOk && !m.isPending;

    return (
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <form
            onSubmit={(e) => { e.preventDefault(); m.mutate(); }}
            className="relative py-8 md:py-10"
        >
            <div className="p-0 md:px-1 space-y-0">
                <div className="flex items-start gap-3 pb-7" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 text-accent">
                        <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2
                            style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: 'clamp(1.4rem, 2.4vw, 1.8rem)',
                                lineHeight: 1.15,
                                color: 'var(--text-primary)',
                                fontWeight: 500,
                            }}
                        >
                            Apply to be a mentor
                        </h2>
                        <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                            Once you submit, an admin will review your application. Approved mentors earn
                            <span className="text-text-primary font-semibold"> 85% of every 1-on-1 video session</span> (90% after crossing 4.8★ across 20+ ratings). Course pricing is set separately when you create a course.
                        </p>
                    </div>
                </div>

                <Section icon={<Wand2 className="w-4 h-4" />} title="Your pitch" hint="What shows on your public card.">
                    <Field label="Headline" hint={`${headlineCount} / 120`}>
                        <input
                            value={headline}
                            onChange={(e) => setHeadline(e.target.value)}
                            maxLength={120}
                            className="w-full input-glass px-3 py-2.5 text-sm text-text-primary"
                            placeholder="Senior Frontend Engineer · 10y React"
                        />
                    </Field>
                    <Field label="Bio" hint={`${bioCount} chars · 40 minimum`}>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={4}
                            className="w-full input-glass px-3 py-2.5 text-sm text-text-primary resize-none"
                            placeholder="Tell students about your background, teaching style, and what they can expect from a session."
                        />
                        <ProgressBar value={Math.min(100, (bioCount / 200) * 100)} tone={bioOk ? 'ok' : 'warn'} />
                    </Field>
                </Section>

                <Section
                    icon={<IndianRupee className="w-4 h-4" />}
                    title="Your session rate"
                    hint="The per-hour price students pay for 1-on-1 video sessions. (Courses will have their own one-time price.)"
                >
                    <div className="grid md:grid-cols-[1fr,1fr] gap-4">
                        <div>
                            <div className="flex items-baseline justify-between mb-1.5">
                                <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">Hourly rate (₹)</span>
                                <span className="text-xl font-bold gradient-text">₹{Number(hourlyRateInr).toLocaleString('en-IN')}</span>
                            </div>
                            <input
                                type="range"
                                min={100}
                                max={10000}
                                step={50}
                                value={hourlyRateInr}
                                onChange={(e) => setHourlyRateInr(e.target.value)}
                                className="w-full accent-accent"
                            />
                            <div className="flex justify-between text-[10px] text-text-muted mt-1">
                                <span>₹100</span>
                                <span>₹10,000</span>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-2">
                                <MiniStat
                                    label="You keep / hour"
                                    value={`₹${keepPerHour.toLocaleString('en-IN')}`}
                                    sub={`${Math.round(payoutMultiplier * 100)}% of ₹${Number(hourlyRateInr).toLocaleString('en-IN')}`}
                                />
                                <MiniStat
                                    label="Per 30-min session"
                                    value={`₹${takeHomePerSession30.toLocaleString('en-IN')}`}
                                    sub="after platform fee"
                                />
                            </div>
                        </div>
                        <Field label="Timezone (IANA)" icon={<Globe2 className="w-3.5 h-3.5 text-text-muted" />}>
                            <select
                                value={timezone}
                                onChange={(e) => setTimezone(e.target.value)}
                                className="w-full input-glass px-3 py-2.5 text-sm text-text-primary appearance-none cursor-pointer"
                            >
                                {TIMEZONES.map((tz) => (
                                    <option key={tz} value={tz} className="bg-surface text-text-primary">{tz}</option>
                                ))}
                            </select>
                        </Field>
                    </div>
                </Section>

                <Section
                    icon={<Tag className="w-4 h-4" />}
                    title="The topics you teach"
                    hint="Pick from Orbit's taxonomy. This is how students filter, and how a Signal Flare finds you when enough of them ask for something you teach. Up to 12."
                >
                    <TopicPicker value={topics} onChange={setTopics} max={12} />
                    {topics.length === 0 && (
                        <p className="mt-1.5 text-xs text-text-muted">
                            Pick at least one. Without a topic you will not appear in filtered searches or Signal Flares.
                        </p>
                    )}
                </Section>

                <Section
                    icon={<Tag className="w-4 h-4" />}
                    title="In your own words"
                    hint="Free-text skills for your public card. Type one, then press Enter or comma. Up to 12."
                >
                    <div className="input-glass px-3 py-2.5 flex flex-wrap items-center gap-2 min-h-[44px]">
                        {skills.map((s) => (
                            <span
                                key={s}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-pill text-xs font-semibold bg-accent/15 text-accent border border-accent/30"
                            >
                                {s}
                                <button
                                    type="button"
                                    onClick={() => removeSkill(s)}
                                    aria-label={`Remove ${s}`}
                                    className="ml-0.5 hover:text-text-primary"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        ))}
                        <input
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={onSkillKey}
                            onBlur={() => addSkill(skillInput)}
                            placeholder={skills.length === 0 ? 'React, TypeScript, WebRTC…' : 'add another…'}
                            className="flex-1 min-w-[120px] bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
                        />
                    </div>
                    {skills.length === 0 && (
                        <p className="mt-1.5 text-xs text-text-muted">Add at least one skill so students can find you.</p>
                    )}
                </Section>

                <Section
                    icon={<Eye className="w-4 h-4" />}
                    title="Public preview"
                    hint="Live — updates as you type."
                >
                    <PublicPreview
                        headline={headline || 'Your headline here'}
                        bio={bio || 'Your bio will appear here.'}
                        hourlyRateInr={Number(hourlyRateInr) || 0}
                        timezone={timezone}
                        skills={skills}
                    />
                </Section>

                <div className="pt-7 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    {m.isError && (
                        <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg p-3">
                            {m.error?.response?.data?.message || 'Submission failed'}
                        </p>
                    )}
                    {m.isSuccess && (
                        <div className="text-sm text-success bg-success/10 border border-success/30 rounded-lg p-3 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 flex-shrink-0" />
                            You are live. Students can find and book you now.
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className="w-full btn-gradient py-3.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider"
                    >
                        {m.isPending
                            ? <><Loader className="w-4 h-4 animate-spin" /> Submitting…</>
                            : <><Send className="w-4 h-4" /> Submit application</>}
                    </button>

                    {!canSubmit && !m.isPending && (
                        <ul className="text-xs text-text-muted space-y-1 pt-1">
                            {!headlineOk && <li>· Headline should be 8–120 characters</li>}
                            {!rateOk && <li>· Hourly rate must be at least ₹100</li>}
                            {!bioOk && <li>· Bio should be at least 40 characters</li>}
                            {!skillsOk && <li>· Add at least one skill</li>}
                            {!topicsOk && <li>· Pick at least one topic from the taxonomy</li>}
                        </ul>
                    )}
                </div>
            </div>
        </form>
        </section>
    );
};

const Section = ({ icon, title, hint, children }) => (
    <section
        className="py-7"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
    >
        <div className="flex items-center gap-2">
            <span className="text-accent">{icon}</span>
            <h3
                className="font-mono uppercase"
                style={{
                    fontSize: '0.68rem',
                    letterSpacing: '0.22em',
                    fontWeight: 700,
                    color: 'rgba(245,245,245,0.86)',
                }}
            >
                {title}
            </h3>
        </div>
        {hint && <p className="text-xs text-text-muted mt-1.5 leading-relaxed">{hint}</p>}
        <div className="mt-4 space-y-3">{children}</div>
    </section>
);

const Field = ({ label, hint, icon, children }) => (
    <label className="block">
        <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-widest text-text-muted flex items-center gap-1.5">
                {icon}{label}
            </span>
            {hint && <span className="text-[10px] text-text-muted">{hint}</span>}
        </div>
        {children}
    </label>
);

const ProgressBar = ({ value, tone = 'ok' }) => (
    <div className="h-1 w-full bg-surface rounded-full overflow-hidden mt-2">
        <div
            className={[
                'h-full transition-all duration-300',
                tone === 'ok' ? 'bg-success' : 'bg-warning',
            ].join(' ')}
            style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
    </div>
);

const MiniStat = ({ label, value, sub }) => (
    <div className="rounded-lg border border-border-subtle bg-surface/30 p-2.5">
        <div className="text-[10px] uppercase tracking-widest text-text-muted">{label}</div>
        <div className="text-sm font-bold text-text-primary mt-0.5">{value}</div>
        {sub && <div className="text-[10px] text-text-muted mt-0.5">{sub}</div>}
    </div>
);

const PublicPreview = ({ headline, bio, hourlyRateInr, timezone, skills }) => (
    <div className="rounded-2xl border border-border-subtle bg-surface/30 p-4">
        <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-accent/15 text-accent flex items-center justify-center font-bold text-lg flex-shrink-0">
                U
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-text-primary truncate">{headline}</div>
                <div className="text-[10px] uppercase tracking-widest text-text-muted mt-0.5 flex items-center gap-1">
                    <Globe2 className="w-3 h-3" /> {timezone}
                </div>
            </div>
            <div className="text-right flex-shrink-0">
                <div className="text-lg font-bold gradient-text">₹{hourlyRateInr.toLocaleString('en-IN')}</div>
                <div className="text-[10px] uppercase tracking-widest text-text-muted">per hour</div>
            </div>
        </div>
        {bio && (
            <p className="mt-3 text-xs text-text-secondary leading-relaxed line-clamp-3">{bio}</p>
        )}
        {skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
                {skills.slice(0, 6).map((s) => (
                    <span
                        key={s}
                        className="inline-flex items-center px-2 py-0.5 rounded-pill text-[10px] font-semibold bg-surface border border-border-subtle text-text-secondary"
                    >
                        {s}
                    </span>
                ))}
                {skills.length > 6 && (
                    <span className="text-[10px] text-text-muted">+{skills.length - 6} more</span>
                )}
            </div>
        )}
    </div>
);

export default MentorApplicationForm;
