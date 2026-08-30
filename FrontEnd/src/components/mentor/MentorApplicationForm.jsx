/**
 * MentorApplicationForm.jsx — apply (or re-apply) to be a paid mentor.
 * Used from the MentorHub page (and any "Become a mentor" CTA). Posts to
 * /api/sessions/mentor/apply, which is an upsert — re-submitting just
 * moves the application back to "submitted".
 *
 * Themed: input-glass fields, btn-gradient submit, themed status messages.
 */
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle, Loader, GraduationCap } from 'lucide-react';
import api from '../../services/api';

const MentorApplicationForm = ({ initial = {} }) => {
    const [headline, setHeadline] = useState(initial.headline || "");
    const [bio, setBio] = useState(initial.bio || "");
    const [hourlyRateInr, setHourlyRateInr] = useState(initial.hourlyRateInr || 1000);
    const [timezone, setTimezone] = useState(initial.timezone || "Asia/Kolkata");
    const [skills, setSkills] = useState((initial.skills || []).join(", "));

    const m = useMutation({
        mutationFn: () => api.post('/sessions/mentor/apply', {
            headline: headline.trim(),
            bio: bio.trim(),
            hourlyRateInr: Number(hourlyRateInr),
            timezone,
            skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        }),
    });

    return (
        <form
            onSubmit={(e) => { e.preventDefault(); m.mutate(); }}
            className="glass-card-glow p-6 space-y-4"
        >
            <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-semibold text-text-primary">Apply to be a mentor</h2>
            </div>
            <p className="text-sm text-text-secondary">
                Once you submit, an admin will review your application. Approved mentors earn
                85% of every session (90% after crossing 4.8★ across 20+ ratings).
            </p>

            <Field label="Headline (max 120 chars)">
                <input
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    maxLength={120}
                    className="w-full input-glass px-3 py-2.5 text-sm text-text-primary"
                    placeholder="Senior Frontend Engineer · 10y React"
                />
            </Field>

            <Field label="Bio">
                <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={5}
                    className="w-full input-glass px-3 py-2.5 text-sm text-text-primary resize-none"
                    placeholder="Tell students about your background, teaching style, and what they can expect."
                />
            </Field>

            <div className="grid md:grid-cols-2 gap-3">
                <Field label="Hourly rate (₹)">
                    <input
                        type="number"
                        min={0}
                        step={50}
                        value={hourlyRateInr}
                        onChange={(e) => setHourlyRateInr(e.target.value)}
                        className="w-full input-glass px-3 py-2.5 text-sm text-text-primary"
                    />
                </Field>
                <Field label="Timezone (IANA)">
                    <input
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full input-glass px-3 py-2.5 text-sm text-text-primary"
                        placeholder="Asia/Kolkata"
                    />
                </Field>
            </div>

            <Field label="Skills (comma-separated)">
                <input
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="w-full input-glass px-3 py-2.5 text-sm text-text-primary"
                    placeholder="React, TypeScript, WebRTC"
                />
            </Field>

            {m.isError && (
                <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg p-2">
                    {m.error?.response?.data?.message || "Submission failed"}
                </p>
            )}
            {m.isSuccess && (
                <p className="text-sm text-success bg-success/10 border border-success/30 rounded-lg p-2 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Application submitted. An admin will review it shortly.
                </p>
            )}

            <button
                type="submit"
                disabled={m.isPending || !headline.trim() || !Number(hourlyRateInr)}
                className="w-full btn-gradient py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {m.isPending ? <><Loader className="w-4 h-4 animate-spin" /> Submitting…</> : "Submit application"}
            </button>
        </form>
    );
};

const Field = ({ label, children }) => (
    <label className="block">
        <span className="block text-xs font-semibold uppercase tracking-widest text-text-muted mb-1.5">{label}</span>
        {children}
    </label>
);

export default MentorApplicationForm;
