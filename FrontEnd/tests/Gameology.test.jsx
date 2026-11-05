import { render, screen, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../src/services/api';
import Gameology from '../src/pages/Gameology';

vi.mock('../src/services/api', () => ({ default: { get: vi.fn() } }));

const legacyIcon = String.fromCodePoint(0x1f680);
let achievements;
let history;

beforeEach(() => {
  achievements = { items: [
    { key: 'FIRST_LESSON', title: 'First Liftoff', description: 'First lesson completed', icon: legacyIcon, rarity: 'common', xpReward: 25, unlockedAt: '2026-11-01T00:00:00Z' },
    { key: 'FUTURE_AWARD', title: 'Future award', description: 'Not unlocked', icon: 'unknown-icon', rarity: 'rare', xpReward: 50, unlockedAt: null },
  ], total: 2, unlockedCount: 1 };
  history = [];
  api.get.mockImplementation(async (url) => ({ data: {
    '/gameology/me': { xp: 200, level: 2, weeklyXp: 50, leagueId: 'dust', currentStreak: 3, longestStreak: 6 },
    '/gameology/achievements/me': achievements,
    '/gameology/history': { items: history },
    '/gameology/leaderboard': { items: [] },
  }[url] || { items: [] } }));
});

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}><HelmetProvider><MemoryRouter><Gameology /></MemoryRouter></HelmetProvider></QueryClientProvider>);
}

describe('Gameology presentation contracts', () => {
  it('renders the server achievement envelope, unlock count and vector artwork for legacy icons', async () => {
    const { container } = renderPage();
    expect(await screen.findByText('First Liftoff')).toBeTruthy();
    expect(screen.getByText('1/2')).toBeTruthy();
    expect(screen.getByRole('img', { name: 'First Liftoff' }).querySelector('svg')).not.toBeNull();
    expect(screen.getByRole('img', { name: 'Future award' }).querySelector('svg')).not.toBeNull();
    expect(screen.getByText('+25 XP')).toBeTruthy();
    expect(screen.queryByText('+50 XP')).toBeNull();
    expect(container.textContent).not.toContain(legacyIcon);
  });

  it('renders every known activity as an SVG rather than an emoji component tag', async () => {
    history = ['lesson_completed', 'quiz_passed', 'quiz_perfect', 'course_completed', 'session_completed', 'peer_swap_completed', 'peer_help_posted', 'streak_bonus', 'achievement_unlocked'].map((event, index) => ({ event, xpAwarded: index + 1, createdAt: '2026-11-01T00:00:00Z' }));
    renderPage();
    await screen.findByText('Quiz passed');
    const section = screen.getByRole('heading', { name: 'Recent activity' }).closest('section');
    const rows = within(section).getAllByRole('listitem');
    expect(rows).toHaveLength(9);
    rows.forEach((row) => expect(row.querySelector('svg')).not.toBeNull());
    expect(screen.getByText('+2 XP')).toBeTruthy();
  });
});
