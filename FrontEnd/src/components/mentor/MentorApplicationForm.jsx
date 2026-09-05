import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    CheckCircle, Loader, GraduationCap, IndianRupee,
    Tag, X, Globe2, Send, Eye, Wand2,
} from 'lucide-react';
import api from '../../services/api';
import TopicPicker from '../taxonomy/TopicPicker';
import { StudioPanel } from '../../soul/studio/surfaces';

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

const fieldStyle = {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.92rem',
    color: 'var(--text-primary)',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.11)',
    borderRadius: 12,
    outline: 'none',
};

const MONO_LABEL = {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.58rem',
    letterSpacing: '0.20em',
    fontWeight: 700,
    textTransform: 'uppercase',
    color: 'rgba(245,245,245,0.50)',
};

const NUMERAL = {
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    color: 'var(--text-primary)',
};

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
        <form onSubmit={(e) => { e.preventDefault(); m.mutate(); }} className="relative">
            <StudioPanel radius={24} className="overflow-hidden" style={{ padding: '26px 24px' }}>
                <div className="flex items-start gap-3">
                    <span
                        className="flex items-center justify-center flex-shrink-0"
                        style={{
                            width: 42, height: 42, borderRadius: 13,
                            background: 'color-mix(in oklab, var(--studio-from) 16%, transparent)',
                            border: '1px solid color-mix(in oklab, var(--studio-from) 28%, transparent)',
                            color: 'var(--studio-from)',
                        }}
                    >
                        <GraduationCap size={19} />
                    </span>
                    <div className="flex-1 min-w-0">
                        <h2
                            style={{
                                fontFamily: 'var(--font-display)', fontWeight: 800,
                                fontSize: 'clamp(1.4rem, 2.6vw, 1.9rem)', lineHeight: 1.1,
                                letterSpacing: '-0.03em', color: 'var(--text-primary)', margin: 0,
                            }}
                        >
                            Become a mentor
                        </h2>
                        <p
                            className="mt-2"
                            style={{ fontFamily: 'var(--font-sans)', fontSize: '0.92rem', lineHeight: 1.65, color: 'rgba(245,245,245,0.58)' }}
                        >
                            Submit this and you are live the same moment — no queue, no approval to wait on. You keep
                            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}> 85% of every 1-on-1 video session</span>, and 90% once you cross 4.8★ over 20 or more ratings. Course pricing is set separately when you build a course.
                        </p>
                    </div>
                </div>
            </StudioPanel>

            <Section icon={<Wand2 size={15} />} title="Your pitch" hint="This is what shows on your public card.">
                <Field label="Headline" hint={`${headlineCount} / 120`}>
                    <input
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        maxLength={120}
                        className="w-full px-3 py-2.5"
                        style={fieldStyle}
                        placeholder="Senior Frontend Engineer · 10y React"
                    />
                </Field>
                <Field label="Bio" hint={`${bioCount} chars · 40 minimum`}>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2.5 resize-none"
                        style={fieldStyle}
                        placeholder="Tell learners about your background, how you teach, and what a session with you feels like."
                    />
                    <ProgressBar value={Math.min(100, (bioCount / 200) * 100)} ok={bioOk} />
                </Field>
            </Section>

            <Section
                icon={<IndianRupee size={15} />}
                title="Your session rate"
                hint="The per-hour price learners pay for 1-on-1 video sessions. Courses carry their own one-time price."
            >
                <div className="grid md:grid-cols-2 gap-5">
                    <div>
                        <div className="flex items-baseline justify-between mb-2">
                            <span style={MONO_LABEL}>Hourly rate</span>
                            <span className="tabular-nums" style={{ ...NUMERAL, fontSize: '1.45rem' }}>
                                ₹{Number(hourlyRateInr).toLocaleString('en-IN')}
                            </span>
                        </div>
                        <input
                            type="range"
                            min={100}
                            max={10000}
                            step={50}
                            value={hourlyRateInr}
                            onChange={(e) => setHourlyRateInr(e.target.value)}
                            className="w-full"
                            style={{ accentColor: 'var(--studio-from)' }}
                        />
                        <div className="flex justify-between font-mono mt-1" style={{ fontSize: '0.62rem', color: 'rgba(245,245,245,0.40)' }}>
                            <span>₹100</span>
                            <span>₹10,000</span>
                        </div>
                        <div className="mt-3.5 grid grid-cols-2 gap-2.5">
                            <MiniStat
                                label="You keep · hour"
                                value={`₹${keepPerHour.toLocaleString('en-IN')}`}
                                sub={`${Math.round(payoutMultiplier * 100)}% of ₹${Number(hourlyRateInr).toLocaleString('en-IN')}`}
                            />
                            <MiniStat
                                label="Per 30 min"
                                value={`₹${takeHomePerSession30.toLocaleString('en-IN')}`}
                                sub="after platform fee"
                            />
                        </div>
                    </div>
                    <Field label="Timezone" icon={<Globe2 size={12} />}>
                        <select
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                            className="w-full px-3 py-2.5 appearance-none cursor-pointer"
                            style={fieldStyle}
                        >
                            {TIMEZONES.map((tz) => (
                                <option key={tz} value={tz} style={{ background: '#16142c', color: '#f5f5f5' }}>{tz}</option>
                            ))}
                        </select>
                    </Field>
                </div>
            </Section>

            <Section
                icon={<Tag size={15} />}
                title="The topics you teach"
                hint="Pick from Orbit's taxonomy. This is how learners filter, and how a Signal Flare finds you when enough of them ask for something you teach. Up to 12."
            >
                <TopicPicker value={topics} onChange={setTopics} max={12} />
                {topics.length === 0 && (
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.84rem', color: 'rgba(245,245,245,0.45)', marginTop: 6 }}>
                        Pick at least one. Without a topic you will not appear in filtered searches or Signal Flares.
                    </p>
                )}
            </Section>

            <Section
                icon={<Tag size={15} />}
                title="In your own words"
                hint="Free-text skills for your public card. Type one, then press Enter or comma. Up to 12."
            >
                <div className="px-3 py-2.5 flex flex-wrap items-center gap-2" style={{ ...fieldStyle, minHeight: 46 }}>
                    {skills.map((s) => (
                        <span
                            key={s}
                            className="inline-flex items-center gap-1"
                            style={{
                                fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700,
                                color: 'var(--studio-from)',
                                background: 'color-mix(in oklab, var(--studio-from) 14%, transparent)',
                                border: '1px solid color-mix(in oklab, var(--studio-from) 28%, transparent)',
                                borderRadius: 999, padding: '4px 9px',
                            }}
                        >
                            {s}
                            <button
                                type="button"
                                onClick={() => removeSkill(s)}
                                aria-label={`Remove ${s}`}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, display: 'inline-flex' }}
                            >
                                <X size={11} />
                            </button>
                        </span>
                    ))}
                    <input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={onSkillKey}
                        onBlur={() => addSkill(skillInput)}
                        placeholder={skills.length === 0 ? 'React, TypeScript, WebRTC…' : 'add another…'}
                        className="flex-1 min-w-[130px] bg-transparent outline-none"
                        style={{ fontFamily: 'var(--font-sans)', fontSize: '0.92rem', color: 'var(--text-primary)', border: 'none' }}
                    />
                </div>
                {skills.length === 0 && (
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.84rem', color: 'rgba(245,245,245,0.45)', marginTop: 6 }}>
                        Add at least one skill so learners can find you.
                    </p>
                )}
            </Section>

            <Section icon={<Eye size={15} />} title="Public preview" hint="Live — it updates as you type.">
                <PublicPreview
                    headline={headline || 'Your headline here'}
                    bio={bio || 'Your bio will appear here.'}
                    hourlyRateInr={Number(hourlyRateInr) || 0}
                    timezone={timezone}
                    skills={skills}
                />
            </Section>

            <StudioPanel radius={22} className="mt-4 space-y-3" style={{ padding: '22px 24px' }}>
                {m.isError && (
                    <p
                        className="p-3"
                        style={{
                            fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'rgba(252,165,165,1)',
                            background: 'rgba(252,165,165,0.08)', border: '1px solid rgba(252,165,165,0.28)', borderRadius: 12,
                        }}
                    >
                        {m.error?.response?.data?.message || 'Submission failed'}
                    </p>
                )}
                {m.isSuccess && (
                    <div
                        className="p-3 flex items-center gap-2"
                        style={{
                            fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'rgba(110,231,183,1)',
                            background: 'rgba(110,231,183,0.08)', border: '1px solid rgba(110,231,183,0.28)', borderRadius: 12,
                        }}
                    >
                        <CheckCircle size={15} className="flex-shrink-0" />
                        You are live. Learners can find and book you now.
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!canSubmit}
                    className="w-full inline-flex items-center justify-center gap-2 font-mono uppercase transition-transform duration-200 enabled:hover:scale-[1.01]"
                    style={{
                        fontSize: '0.66rem', letterSpacing: '0.22em', fontWeight: 700,
                        color: '#0d0c1c', background: 'var(--studio-gradient)',
                        border: 'none', borderRadius: 999, padding: '15px 20px',
                        cursor: canSubmit ? 'pointer' : 'not-allowed',
                        opacity: canSubmit ? 1 : 0.38,
                    }}
                >
                    {m.isPending
                        ? <><Loader size={14} className="animate-spin" /> Submitting…</>
                        : <><Send size={14} /> Go live as a mentor</>}
                </button>

                {!canSubmit && !m.isPending && (
                    <ul className="space-y-1 pt-0.5" style={{ fontFamily: 'var(--font-sans)', fontSize: '0.84rem', color: 'rgba(245,245,245,0.45)' }}>
                        {!headlineOk && <li>Headline should be 8–120 characters</li>}
                        {!rateOk && <li>Hourly rate must be at least ₹100</li>}
                        {!bioOk && <li>Bio should be at least 40 characters</li>}
                        {!skillsOk && <li>Add at least one skill</li>}
                        {!topicsOk && <li>Pick at least one topic from the taxonomy</li>}
                    </ul>
                )}
            </StudioPanel>
        </form>
    );
};

const Section = ({ icon, title, hint, children }) => (
    <StudioPanel as="section" radius={22} className="mt-4" style={{ padding: '22px 24px' }}>
        <div className="flex items-center gap-2">
            <span style={{ color: 'var(--studio-from)', display: 'inline-flex' }}>{icon}</span>
            <h3
                className="font-mono uppercase"
                style={{ fontSize: '0.64rem', letterSpacing: '0.22em', fontWeight: 700, color: 'rgba(245,245,245,0.88)', margin: 0 }}
            >
                {title}
            </h3>
        </div>
        {hint && (
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.86rem', lineHeight: 1.6, color: 'rgba(245,245,245,0.48)', marginTop: 7 }}>
                {hint}
            </p>
        )}
        <div className="mt-4 space-y-3.5">{children}</div>
    </StudioPanel>
);

const Field = ({ label, hint, icon, children }) => (
    <label className="block">
        <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5" style={MONO_LABEL}>
                {icon}{label}
            </span>
            {hint && (
                <span className="font-mono tabular-nums" style={{ fontSize: '0.62rem', color: 'rgba(245,245,245,0.38)' }}>
                    {hint}
                </span>
            )}
        </div>
        {children}
    </label>
);

const ProgressBar = ({ value, ok }) => (
    <div className="h-1 w-full overflow-hidden mt-2.5" style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 999 }}>
        <div
            className="h-full transition-all duration-300"
            style={{
                width: `${Math.max(0, Math.min(100, value))}%`,
                borderRadius: 999,
                background: ok ? 'rgba(110,231,183,1)' : 'rgba(251,191,36,1)',
            }}
        />
    </div>
);

const MiniStat = ({ label, value, sub }) => (
    <div
        className="p-3"
        style={{ borderRadius: 14, background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.09)' }}
    >
        <div style={MONO_LABEL}>{label}</div>
        <div className="tabular-nums mt-1" style={{ ...NUMERAL, fontSize: '1.1rem' }}>{value}</div>
        {sub && (
            <div className="mt-0.5" style={{ fontFamily: 'var(--font-sans)', fontSize: '0.74rem', color: 'rgba(245,245,245,0.42)' }}>
                {sub}
            </div>
        )}
    </div>
);

const PublicPreview = ({ headline, bio, hourlyRateInr, timezone, skills }) => (
    <div
        className="p-4"
        style={{ borderRadius: 18, background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.09)' }}
    >
        <div className="flex items-start gap-3">
            <span
                className="flex items-center justify-center flex-shrink-0"
                style={{
                    width: 46, height: 46, borderRadius: 999,
                    background: 'color-mix(in oklab, var(--studio-from) 16%, transparent)',
                    border: '1px solid color-mix(in oklab, var(--studio-from) 28%, transparent)',
                    fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem',
                    color: 'var(--studio-from)',
                }}
            >
                U
            </span>
            <div className="flex-1 min-w-0">
                <div
                    className="truncate"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.015em', color: 'var(--text-primary)' }}
                >
                    {headline}
                </div>
                <div className="flex items-center gap-1 mt-1" style={{ ...MONO_LABEL, fontSize: '0.56rem' }}>
                    <Globe2 size={10} /> {timezone}
                </div>
            </div>
            <div className="text-right flex-shrink-0">
                <div className="tabular-nums" style={{ ...NUMERAL, fontSize: '1.2rem' }}>
                    ₹{hourlyRateInr.toLocaleString('en-IN')}
                </div>
                <div style={{ ...MONO_LABEL, fontSize: '0.54rem' }}>per hour</div>
            </div>
        </div>
        {bio && (
            <p
                className="mt-3 line-clamp-3"
                style={{ fontFamily: 'var(--font-sans)', fontSize: '0.86rem', lineHeight: 1.6, color: 'rgba(245,245,245,0.58)' }}
            >
                {bio}
            </p>
        )}
        {skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
                {skills.slice(0, 6).map((s) => (
                    <span
                        key={s}
                        className="font-mono"
                        style={{
                            fontSize: '0.64rem', fontWeight: 700, color: 'rgba(245,245,245,0.62)',
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
                            borderRadius: 999, padding: '3px 9px',
                        }}
                    >
                        {s}
                    </span>
                ))}
                {skills.length > 6 && (
                    <span className="font-mono self-center" style={{ fontSize: '0.64rem', color: 'rgba(245,245,245,0.40)' }}>
                        +{skills.length - 6} more
                    </span>
                )}
            </div>
        )}
    </div>
);

export default MentorApplicationForm;
