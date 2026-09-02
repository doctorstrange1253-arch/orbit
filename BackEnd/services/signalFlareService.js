const SignalFlare = require("../models/SignalFlare");
const MentorProfile = require("../models/MentorProfile");
const Course = require("../models/Course");
const taxonomy = require("../data/taxonomy");
const { createNotification } = require("./notify");

const THRESHOLD = Number(process.env.SIGNAL_FLARE_THRESHOLD) || 5;
const NOTIFY_COOLDOWN_DAYS = 14;

async function fireFlare(userId, { constellation, genre }) {
  const cleanCon = String(constellation).toLowerCase().trim();
  const cleanGenre = String(genre).toLowerCase().trim();
  try {
    return await SignalFlare.findOneAndUpdate(
      { userId, constellation: cleanCon, genre: cleanGenre },
      { $setOnInsert: { userId, constellation: cleanCon, genre: cleanGenre, sentAt: new Date() } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  } catch (err) {
    console.warn("[flares] fireFlare failed:", err.message);
    return null;
  }
}

async function getCount(constellation, genre) {
  try {
    return await SignalFlare.countDocuments({
      constellation: String(constellation).toLowerCase().trim(),
      genre: String(genre).toLowerCase().trim(),
      respondedCourseId: null,
    });
  } catch {
    return 0;
  }
}

async function getQueue(constellation) {
  try {
    const rows = await SignalFlare.find({
      constellation: String(constellation).toLowerCase().trim(),
      respondedCourseId: null,
    }).select("genre userId sentAt").lean();

    const byGenre = new Map();
    for (const r of rows) {
      if (!byGenre.has(r.genre)) byGenre.set(r.genre, { genre: r.genre, count: 0, userIds: [], recent: [] });
      const entry = byGenre.get(r.genre);
      entry.count += 1;
      entry.userIds.push(String(r.userId));
      if (entry.recent.length < 5) entry.recent.push(r.sentAt);
    }
    return Array.from(byGenre.values()).sort((a, b) => b.count - a.count);
  } catch {
    return [];
  }
}

async function markResponded(constellation, genre, courseId) {
  try {
    const cleanCon = String(constellation).toLowerCase().trim();
    const cleanGenre = String(genre).toLowerCase().trim();
    await SignalFlare.updateMany(
      { constellation: cleanCon, genre: cleanGenre, respondedCourseId: null },
      { $set: { respondedCourseId: courseId, respondedAt: new Date() } },
    );
    const rows = await SignalFlare.find({
      constellation: cleanCon,
      genre: cleanGenre,
      respondedCourseId: courseId,
    }).select("userId").lean();
    return rows.map((r) => String(r.userId));
  } catch (err) {
    console.warn("[flares] markResponded failed:", err.message);
    return [];
  }
}

function scopeOf(topicSlug) {
  const t = taxonomy.topic(topicSlug);
  if (t) return { constellation: t.constellationSlug, genre: t.genreSlug, label: t.label, kind: "topic" };
  const g = taxonomy.genre(topicSlug);
  if (g) return { constellation: g.constellationSlug, genre: g.slug, label: g.label, kind: "genre" };
  return null;
}

async function demandFor(genreSlug) {
  const waiting = await SignalFlare.countDocuments({ genre: genreSlug, respondedCourseId: null });
  return { genre: genreSlug, waiting, threshold: THRESHOLD, met: waiting >= THRESHOLD };
}

async function mentorsForGenre(genreSlug) {
  const g = taxonomy.genre(genreSlug);
  const or = [{ genres: genreSlug }];
  if (g) {
    or.push({ topics: { $in: g.topicSlugs } });
    or.push({ constellations: g.constellationSlug });
  }
  return MentorProfile.find({
    applicationStatus: "approved",
    status: "active",
    $or: or,
  }).select("userId topics genres constellations lastFlareNotifiedAt").lean();
}

function rankMentors(mentors, genreSlug) {
  const g = taxonomy.genre(genreSlug);
  const topicSet = new Set(g ? g.topicSlugs : []);
  return mentors
    .map((m) => {
      const topicHits = (m.topics || []).filter((t) => topicSet.has(t)).length;
      const genreHit = (m.genres || []).includes(genreSlug) ? 1 : 0;
      const constHit = g && (m.constellations || []).includes(g.constellationSlug) ? 1 : 0;
      return { ...m, score: topicHits * 4 + genreHit * 3 + constHit };
    })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score);
}

async function evaluateGenre(io, genreSlug) {
  const demand = await demandFor(genreSlug);
  if (!demand.met) return { ...demand, notified: 0 };

  const existing = await Course.countDocuments({ category: genreSlug, isPublished: true });
  if (existing > 0) return { ...demand, notified: 0, reason: "already_served" };

  const g = taxonomy.genre(genreSlug);
  const label = g ? g.label : genreSlug;
  const cutoff = new Date(Date.now() - NOTIFY_COOLDOWN_DAYS * 86_400_000);

  const ranked = rankMentors(await mentorsForGenre(genreSlug), genreSlug)
    .filter((m) => !m.lastFlareNotifiedAt || new Date(m.lastFlareNotifiedAt) < cutoff)
    .slice(0, 40);

  for (const m of ranked) {
    await createNotification(io, m.userId, {
      type: "signal_flare_demand",
      title: `${demand.waiting} learners are waiting for ${label}`,
      body: `Nobody has published a ${label} course yet. You teach in this area — this is an open field.`,
      data: {
        link: "/mentor/courses/new",
        genre: genreSlug,
        constellation: g ? g.constellationSlug : null,
        waiting: demand.waiting,
      },
    }).catch(() => {});
  }

  if (ranked.length > 0) {
    await MentorProfile.updateMany(
      { _id: { $in: ranked.map((m) => m._id) } },
      { $set: { lastFlareNotifiedAt: new Date() } },
    );
  }

  return { ...demand, notified: ranked.length, label };
}

async function onFlareSent(io, genreSlug) {
  try {
    return await evaluateGenre(io, genreSlug);
  } catch (err) {
    console.error("signalFlare.onFlareSent:", err.message);
    return null;
  }
}

async function onCoursePublished(io, course) {
  try {
    const genre = String(course.category || "general").toLowerCase().trim();
    const flares = await SignalFlare.find({
      genre,
      respondedCourseId: null,
    }).select("userId").lean();
    if (flares.length === 0) return { answered: 0, userIds: [] };

    await SignalFlare.updateMany(
      { genre, respondedCourseId: null },
      { $set: { respondedCourseId: course._id, respondedAt: new Date() } },
    );

    const g = taxonomy.genre(genre);
    const label = g ? g.label : genre;
    const userIds = flares.map((f) => String(f.userId));

    for (const uid of userIds) {
      await createNotification(io, uid, {
        type: "signal_flare_answered",
        title: "Your flare was answered",
        body: `A ${label} course just appeared: "${course.title}". You asked for this.`,
        data: { link: `/courses/${course._id}`, courseId: String(course._id), genre },
      }).catch(() => {});
    }
    return { answered: userIds.length, userIds, label };
  } catch (err) {
    console.error("signalFlare.onCoursePublished:", err.message);
    return { answered: 0, userIds: [] };
  }
}

async function openFields(limit = 12) {
  const rows = await SignalFlare.aggregate([
    { $match: { respondedCourseId: null } },
    { $group: { _id: "$genre", waiting: { $sum: 1 } } },
    { $sort: { waiting: -1 } },
    { $limit: limit * 3 },
  ]);
  const served = new Set(
    (await Course.find({ isPublished: true, category: { $in: rows.map((r) => r._id) } })
      .select("category").lean()).map((c) => c.category),
  );
  return rows
    .filter((r) => !served.has(r._id))
    .slice(0, limit)
    .map((r) => {
      const g = taxonomy.genre(r._id);
      return {
        genre: r._id,
        label: g ? g.label : r._id,
        constellation: g ? g.constellationSlug : null,
        waiting: r.waiting,
        threshold: THRESHOLD,
        met: r.waiting >= THRESHOLD,
      };
    });
}

module.exports = {
  THRESHOLD,
  fireFlare,
  getCount,
  getQueue,
  markResponded,
  scopeOf,
  demandFor,
  mentorsForGenre,
  rankMentors,
  evaluateGenre,
  onFlareSent,
  onCoursePublished,
  openFields,
};
