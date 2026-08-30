/**
 * MentorApplicationForm.jsx — apply (or re-apply) to be a paid mentor.
 * Used from the Profile page (and any "Become a mentor" CTA). Posts to
 * /api/sessions/mentor/apply, which is an upsert — re-submitting just
 * moves the application back to "submitted" (or stays "approved" if
 * already approved; admin moves it back manually if needed).
 */
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle, Loader } from 'lucide-react';
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
            className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4"
        >
            <h2 className="text-lg font-semibold">Apply to be a mentor</h2>
            <p className="text-sm text-slate-400">
                Once you submit, an admin will review your application. Approved mentors can be booked and earn 85% of every session (90% after you cross 4.8★ across 20+ ratings).
            </p>

            <Field label="Headline (max 120 chars)">
                <input
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    maxLength={120}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                    placeholder="Senior Frontend Engineer · 10y React"
                />
            </Field>

            <Field label="Bio">
                <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={5}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
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
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                </Field>
                <Field label="Timezone (IANA)">
                    <input
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                        placeholder="Asia/Kolkata"
                    />
                </Field>
            </div>

            <Field label="Skills (comma-separated)">
                <input
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                    placeholder="React, TypeScript, WebRTC"
                />
            </Field>

            {m.isError && (
                <p className="text-sm text-rose-400 bg-rose-900/30 rounded p-2">
                    {m.error?.response?.data?.message || "Submission failed"}
                </p>
            )}
            {m.isSuccess && (
                <p className="text-sm text-emerald-300 bg-emerald-900/30 rounded p-2 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Application submitted. An admin will review it shortly.
                </p>
            )}

            <button
                type="submit"
                disabled={m.isPending || !headline.trim() || !Number(hourlyRateInr)}
                className="w-full py-3 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-400 text-white font-semibold flex items-center justify-center gap-2"
            >
                {m.isPending ? <><Loader className="w-4 h-4 animate-spin" /> Submitting…</> : "Submit application"}
            </button>
        </form>
    );
};

const Field = ({ label, children }) => (
    <label className="block">
        <span className="block text-sm text-slate-400 mb-1">{label}</span>
        {children}
    </label>
);

export default MentorApplicationForm;
