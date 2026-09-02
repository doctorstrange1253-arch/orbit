const PARTS = [
  require("./taxonomyPart1").RAW,
  require("./taxonomyPart2").RAW,
  require("./taxonomyPart3").RAW,
  require("./taxonomyPart4").RAW,
].flat();

function slugify(label) {
  return String(label)
    .toLowerCase()
    .replace(/\+\+/g, "-plus-plus")
    .replace(/\+/g, "-plus")
    .replace(/#/g, "-sharp")
    .replace(/\./g, "-dot-")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const CONSTELLATIONS = [];
const GENRES = [];
const TOPICS = [];

for (const c of PARTS) {
  const genreSlugs = [];
  for (const [genreLabel, topicLabels] of Object.entries(c.genres)) {
    const genreSlug = `${c.slug}.${slugify(genreLabel)}`;
    const topicSlugs = [];
    for (const topicLabel of topicLabels) {
      const topicSlug = `${genreSlug}.${slugify(topicLabel)}`;
      topicSlugs.push(topicSlug);
      TOPICS.push({
        slug: topicSlug,
        label: topicLabel,
        genreSlug,
        genreLabel,
        constellationSlug: c.slug,
        constellationLabel: c.label,
      });
    }
    genreSlugs.push(genreSlug);
    GENRES.push({
      slug: genreSlug,
      label: genreLabel,
      constellationSlug: c.slug,
      constellationLabel: c.label,
      topicSlugs,
      topicCount: topicSlugs.length,
    });
  }
  CONSTELLATIONS.push({
    slug: c.slug,
    label: c.label,
    blurb: c.blurb,
    genreSlugs,
    genreCount: genreSlugs.length,
  });
}

const BY_TOPIC = new Map(TOPICS.map((t) => [t.slug, t]));
const BY_GENRE = new Map(GENRES.map((g) => [g.slug, g]));
const BY_CONSTELLATION = new Map(CONSTELLATIONS.map((c) => [c.slug, c]));

function topic(slug) { return BY_TOPIC.get(slug) || null; }
function genre(slug) { return BY_GENRE.get(slug) || null; }
function constellation(slug) { return BY_CONSTELLATION.get(slug) || null; }

function isTopic(slug) { return BY_TOPIC.has(slug); }

function normaliseTopics(input) {
  const out = [];
  const seen = new Set();
  for (const raw of Array.isArray(input) ? input : []) {
    const s = String(raw || "").trim();
    if (!isTopic(s) || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

function ancestryOf(topicSlugs) {
  const genres = new Set();
  const constellations = new Set();
  for (const s of topicSlugs) {
    const t = BY_TOPIC.get(s);
    if (!t) continue;
    genres.add(t.genreSlug);
    constellations.add(t.constellationSlug);
  }
  return { genres: [...genres], constellations: [...constellations] };
}

function searchTopics(query, limit = 30) {
  const q = String(query || "").trim().toLowerCase();
  if (q.length < 2) return [];
  const starts = [];
  const contains = [];
  for (const t of TOPICS) {
    const l = t.label.toLowerCase();
    if (l.startsWith(q)) starts.push(t);
    else if (l.includes(q) || t.genreLabel.toLowerCase().includes(q)) contains.push(t);
    if (starts.length >= limit) break;
  }
  return [...starts, ...contains].slice(0, limit);
}

function tree() {
  return CONSTELLATIONS.map((c) => ({
    ...c,
    genres: c.genreSlugs.map((gs) => {
      const g = BY_GENRE.get(gs);
      return { ...g, topics: g.topicSlugs.map((ts) => BY_TOPIC.get(ts)) };
    }),
  }));
}

const STATS = {
  constellations: CONSTELLATIONS.length,
  genres: GENRES.length,
  topics: TOPICS.length,
};

module.exports = {
  CONSTELLATIONS,
  GENRES,
  TOPICS,
  STATS,
  slugify,
  topic,
  genre,
  constellation,
  isTopic,
  normaliseTopics,
  ancestryOf,
  searchTopics,
  tree,
};
