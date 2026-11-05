import { BoosterBolt, Bundle, CometCursor, FrameRing, NebulaDisc, Ribbon, Sparkle } from './itemIcons';

const ICONS = {
  achievement: Ribbon, rocket: CometCursor, 'graduation-cap': Ribbon,
  sparkle: Sparkle, flame: BoosterBolt, moon: NebulaDisc,
  satellite: FrameRing, quasar: NebulaDisc, pulsar: Sparkle,
  'black-hole': FrameRing, constellation: NebulaDisc, target: FrameRing,
  phone: Ribbon, handshake: Bundle, bolt: BoosterBolt,
};

const BY_KEY = new Map([
  ['FIRST_LESSON', 'rocket'], ['FIRST_COURSE', 'graduation-cap'], ['STREAK_3', 'sparkle'],
  ['STREAK_7', 'flame'], ['STREAK_30', 'moon'], ['STREAK_100', 'satellite'],
  ['LEVEL_10', 'quasar'], ['LEVEL_25', 'pulsar'], ['LEVEL_50', 'black-hole'],
  ['COURSE_5', 'constellation'], ['QUIZ_PERFECT', 'target'], ['SESSION_1', 'phone'],
  ['PEER_SWAP_1', 'handshake'], ['SPEEDRUN', 'bolt'],
]);

export default function AchievementIcon({ achievement = {}, size = 32, color = 'currentColor' }) {
  const key = Object.hasOwn(ICONS, achievement.icon) ? achievement.icon : BY_KEY.get(achievement.key) || 'achievement';
  const Icon = ICONS[key];
  return <span role="img" aria-label={achievement.title || 'Achievement'} className="inline-flex text-accent">
    <Icon size={size} color={color} />
  </span>;
}
