/**
 * MentorEditorial — the mentor-named view of the shared editorial primitives.
 *
 * The implementation lives in soul/editorial/primitives.jsx under soul-neutral
 * names so the student section can compose the same atoms without importing
 * `Mentor*` from a folder called `pact`. This module re-exports them under the
 * original names, so the 16 mentor surfaces from 286cf50 need no edits.
 */
export {
  Eyebrow as MentorEyebrow,
  Title as MentorTitle,
  Deck as MentorDeck,
  Rule as MentorRule,
  DotLeader as MentorDotLeader,
  Tag as MentorTag,
  SectionHeader as MentorSectionHeader,
  Stat as MentorStat,
  BackLink as MentorBackLink,
  Panel as MentorPanel,
} from '../../soul/editorial/primitives';
