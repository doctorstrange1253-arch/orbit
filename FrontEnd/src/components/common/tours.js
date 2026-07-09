/**
 * tours.js — content for the first-visit walkthroughs. Each tour is an ordered
 * list of message cards ("this is this, that is that"). Pure data, no JSX, so it
 * stays easy to edit and localise later. Keys match the tourStore + route map.
 */
export const TOURS = {
  leaderboard: {
    title: 'Leaderboard',
    steps: [
      { icon: '🏆', title: 'Welcome to the Leaderboard', body: 'This is where local mentors are ranked by their Cosmic Score. Climb by teaching, earning great reviews, and staying active.' },
      { icon: '📍', title: 'Pick your scope', body: 'Switch between Neighborhood, City, Region and Country. Your rank is relative to whoever you are competing with in that scope.' },
      { icon: '⭐', title: 'Your rank card', body: 'Your own position is pinned so you always know where you stand and how far the next spot is.' },
      { icon: '✨', title: 'Cosmic badges', body: 'Each mentor wears a tier badge and name glow. The rarer the look, the more they have achieved.' },
    ],
  },
  shop: {
    title: 'Nebula Store',
    steps: [
      { icon: '🛰️', title: 'Welcome to the Nebula Store', body: 'Spend Photons on cosmetics that appear everywhere your name and profile show up, visible to everyone, not just you.' },
      { icon: '✦', title: 'Earning Photons', body: 'Out of Photons? Tap the plus on your Photons chip. It takes you to missions where you earn more.' },
      { icon: '💎', title: 'Rarity tiers', body: 'Every item carries one of 15 cosmic rarities. Rarer items have bolder, more complex animated effects.' },
      { icon: '🧪', title: 'Try before you buy', body: 'Open the Holo-Bay to preview any look live on a mock of your own profile before spending a single Photon.' },
    ],
  },
  holobay: {
    title: 'Holo-Bay',
    steps: [
      { icon: '🧪', title: 'Welcome to the Holo-Bay', body: 'This is your try-before-you-buy lab. Pick any cosmetic and it renders live on a holographic mock of your real profile.' },
      { icon: '👀', title: 'Exactly what others see', body: 'The preview is identical to how your look renders for everyone else across the app.' },
      { icon: '🛒', title: 'Buy or equip', body: 'Happy with a look? Buy it, or equip something you already own, right from here. Balances stay in sync everywhere.' },
    ],
  },
  orbit: {
    title: 'Your Orbit',
    steps: [
      { icon: '🚀', title: 'Welcome to Your Orbit', body: 'Your engagement hub: keep a daily streak, complete missions, and earn Photons to spend in the Nebula Store.' },
      { icon: '🔥', title: 'Streak and milestones', body: 'Act each day to grow your Orbit streak. Miss a day and it decays. Use a Gravity Assist freeze to protect it.' },
      { icon: '🎯', title: 'Weekly missions', body: 'Each week brings rotating missions. Finish them, claim the reward, and watch your Photons balance climb.' },
      { icon: '🛡️', title: 'Gravity Assist', body: 'Buy freeze tokens with Photons to shield your streak on days you cannot make it.' },
    ],
  },
};

/** Ordered list for the Settings > Help center. */
export const TOUR_LIST = [
  { key: 'orbit', label: 'Your Orbit' },
  { key: 'shop', label: 'Nebula Store' },
  { key: 'holobay', label: 'Holo-Bay' },
  { key: 'leaderboard', label: 'Leaderboard' },
];
