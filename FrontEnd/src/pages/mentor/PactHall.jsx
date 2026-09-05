import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Swords } from 'lucide-react';
import PactHallTable from '../../components/pact/PactHall';
import PactPulse from '../../components/pact/PactPulse';
import RivalWatch from '../../components/pact/RivalWatch';
import PactResultsCard from '../../components/pact/PactResultsCard';
import LeagueRail from '../../components/pact/LeagueRail';
import { usePactMe, usePactHistory } from '../../hooks/usePact';
import PactBadge from '../../components/pact/PactBadge';
import PactDivisionIcons from '../../components/pact/PactDivisionIcons';
import {
    MentorBackLink,
    MentorEyebrow,
    MentorTitle,
    MentorStat,
    MentorTag,
} from '../../components/pact/MentorEditorial';
import { StudioMasthead, StudioPanel } from '../../soul/studio/surfaces';

const PactHallPage = () => {
    const { data: me } = usePactMe();
    const { data: history = [] } = usePactHistory(12);
    const lastRolledWeek = history[0]?.weekId;

    const heldWeeks = me?.pact?.steadyShieldWeeks || 0;
    const showShield = heldWeeks >= 4;
    const rank = me?.pact?.rank;
    const groupSize = me?.pact?.groupSize || 0;

    return (
        <div className="relative min-h-screen overflow-hidden">
            <div className="relative z-10 max-w-5xl mx-auto px-4 py-10">
                <Helmet><title>The Pact Roll · Orbit Mentor</title></Helmet>

                <div className="mb-6">
                    <MentorBackLink to="/mentor/observatory">Observatory</MentorBackLink>
                </div>

                <StudioMasthead
                    eyebrow="The Mentor Pact · Weekly"
                    Icon={Swords}
                    title="The Pact Roll"
                    deck="A private register of the week. Your group, your rivals, your standing — set in the same composition each Monday morning and read through the following seven days."
                >
                    {rank ? (
                        <div className="text-right">
                            <div
                                className="font-mono uppercase"
                                style={{ fontSize: '0.54rem', letterSpacing: '0.20em', fontWeight: 700, color: 'rgba(245,245,245,0.45)' }}
                            >
                                Standing
                            </div>
                            <div
                                className="mt-1 tabular-nums"
                                style={{
                                    fontFamily: 'var(--font-display)', fontWeight: 800,
                                    fontSize: 'clamp(1.6rem, 3vw, 2.1rem)', lineHeight: 1,
                                    letterSpacing: '-0.035em', color: 'var(--text-primary)',
                                }}
                            >
                                {rank}
                                <span style={{ fontSize: '0.9rem', color: 'rgba(245,245,245,0.45)' }}>
                                    {groupSize ? ` / ${groupSize}` : ''}
                                </span>
                            </div>
                        </div>
                    ) : null}
                </StudioMasthead>

                {/* ── II. League Rail ───────────────────────────────────── */}
                <motion.section
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.05 }}
                    className="mt-8"
                >
                    <LeagueRail currentTierId={me?.pact?.divisionId} mode="folio" />
                </motion.section>

                {/* ── III. Monday Dispatch ──────────────────────────────── */}
                {lastRolledWeek && me?.pact?.lastResult && (
                    <motion.section
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.10 }}
                        className="mt-7"
                    >
                        <PactResultsCard history={history} me={me} />
                    </motion.section>
                )}

                {/* ── IV. This week ─────────────────────────────────────── */}
                <motion.section
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="mt-9"
                >
                    <div className="mb-4">
                        <MentorEyebrow>IV · The Week Now</MentorEyebrow>
                        <div className="mt-1.5">
                            <MentorTitle size="md">Where the group stands</MentorTitle>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-[280px_1fr] gap-x-6 gap-y-6">
                        <aside className="space-y-6 md:sticky md:top-20 md:self-start">
                            <PactPulse />
                            <RivalWatch />
                        </aside>
                        <main>
                            <PactHallTable />
                        </main>
                    </div>
                </motion.section>

                {/* ── V. Standing ───────────────────────────────────────── */}
                <motion.section
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.20 }}
                    className="mt-12"
                >
                    <div className="mb-4">
                        <MentorEyebrow>V · Your Standing</MentorEyebrow>
                        <div className="mt-1.5">
                            <MentorTitle size="md">The numbers beneath the page</MentorTitle>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <MentorStat
                            label="Division"
                            value={<PactBadge size={26} tier={me?.pact?.divisionId} withLabel={false} />}
                            hint={showShield ? `Steady Shield · ${heldWeeks}w held` : 'Hold for 4 weeks to earn the Shield'}
                            tone="accent"
                        />
                        <MentorStat
                            label="Pact Score"
                            value={me?.pact?.weekScore || 0}
                            hint="Resets every Monday at 00:00 UTC"
                        />
                        <MentorStat
                            label="Rank"
                            value={rank ? String(rank).padStart(2, '0') : '—'}
                            hint={groupSize ? `of ${groupSize} in your group` : 'Group not yet assigned'}
                        />
                        <StudioPanel radius={18} className="px-4 pt-3.5 pb-3.5">
                            <div
                                className="font-mono uppercase"
                                style={{ fontSize: '0.58rem', letterSpacing: '0.2em', fontWeight: 700, color: 'rgba(245,245,245,0.5)' }}
                            >
                                Held in division
                            </div>
                            <div
                                className="mt-1.5"
                                style={{
                                    fontFamily: 'var(--font-display)',
                                    fontWeight: 800,
                                    fontSize: 'clamp(1.7rem, 3vw, 2.3rem)',
                                    lineHeight: 1,
                                    letterSpacing: '-0.035em',
                                    color: heldWeeks >= 4 ? 'rgba(251,191,36,1)' : 'var(--text-primary)',
                                }}
                            >
                                {heldWeeks}<span style={{ fontSize: '0.55em', marginLeft: 3, color: 'rgba(245,245,245,0.5)' }}>w</span>
                            </div>
                            <div
                                className="mt-1 text-[11px] leading-snug"
                                style={{ fontFamily: 'var(--font-sans)', color: 'rgba(245,245,245,0.45)' }}
                            >
                                {heldWeeks >= 4 ? 'The Shield is yours' : `${Math.max(0, 4 - heldWeeks)} week${4 - heldWeeks === 1 ? '' : 's'} to go`}
                            </div>
                        </StudioPanel>
                    </div>
                </motion.section>

                {/* ── VI. Recent weeks ──────────────────────────────────── */}
                {history.length > 1 && (
                    <motion.section
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.25 }}
                        className="mt-12"
                    >
                        <div className="mb-4">
                            <MentorEyebrow>VI · The Roll Remembered</MentorEyebrow>
                            <div className="mt-1.5">
                                <MentorTitle size="md">Recent weeks</MentorTitle>
                            </div>
                        </div>
                        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <Th>Week</Th>
                                    <Th>Division</Th>
                                    <Th align="right">Rank</Th>
                                    <Th align="right">Score</Th>
                                    <Th align="right">Result</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.slice(0, 8).map((h, i) => {
                                    const tagTone = h.result === 'promoted' ? 'success'
                                        : h.result === 'relegated' ? 'danger'
                                        : 'neutral';
                                    return (
                                        <tr key={i}>
                                            <Td>
                                                <span className="font-mono" style={{ fontSize: '0.86rem', color: 'rgba(245,245,245,0.85)' }}>
                                                    {h.weekId}
                                                </span>
                                            </Td>
                                            <Td>
                                                <PactDivisionIcons tierId={h.divisionId} size={7} />
                                            </Td>
                                            <Td align="right">
                                                <span className="font-mono tabular-nums" style={{ fontSize: '0.92rem', color: 'rgba(245,245,245,0.85)' }}>
                                                    {String(h.rank).padStart(2, '0')}<span style={{ color: 'rgba(245,245,245,0.40)' }}>/{h.groupSize}</span>
                                                </span>
                                            </Td>
                                            <Td align="right">
                                                <span className="font-mono tabular-nums" style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                    {h.score}
                                                </span>
                                            </Td>
                                            <Td align="right">
                                                <MentorTag tone={tagTone}>{h.result}</MentorTag>
                                            </Td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </motion.section>
                )}

                <div className="mt-12">
                    <Link
                        to="/mentor/observatory"
                        className="font-mono uppercase"
                        style={{
                            fontSize: '0.62rem',
                            letterSpacing: '0.22em',
                            fontWeight: 700,
                            color: 'rgba(245,245,245,0.45)',
                            textDecoration: 'none',
                        }}
                    >
                        ← Return to the Observatory
                    </Link>
                </div>
            </div>
        </div>
    );
};

const Th = ({ children, align = 'left' }) => (
    <th
        style={{
            textAlign: align,
            padding: '8px 12px 10px',
            borderBottom: '1px solid rgba(255,255,255,0.10)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.58rem',
            letterSpacing: '0.20em',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'rgba(245,245,245,0.45)',
        }}
    >
        {children}
    </th>
);

const Td = ({ children, align = 'left' }) => (
    <td
        style={{
            textAlign: align,
            padding: '12px 12px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
    >
        {children}
    </td>
);

export default PactHallPage;
