const taxonomy = require("../data/taxonomy");

describe("taxonomy shape", () => {
    it("covers a broad span of human learning", () => {
        expect(taxonomy.STATS.constellations).toBeGreaterThanOrEqual(12);
        expect(taxonomy.STATS.genres).toBeGreaterThanOrEqual(80);
        expect(taxonomy.STATS.topics).toBeGreaterThanOrEqual(800);
    });

    it("has globally unique slugs at every level", () => {
        const c = taxonomy.CONSTELLATIONS.map((x) => x.slug);
        const g = taxonomy.GENRES.map((x) => x.slug);
        const t = taxonomy.TOPICS.map((x) => x.slug);
        expect(new Set(c).size).toBe(c.length);
        expect(new Set(g).size).toBe(g.length);
        expect(new Set(t).size).toBe(t.length);
    });

    it("uses url-safe slugs only", () => {
        for (const t of taxonomy.TOPICS) expect(t.slug).toMatch(/^[a-z0-9.-]+$/);
        for (const g of taxonomy.GENRES) expect(g.slug).toMatch(/^[a-z0-9.-]+$/);
    });

    it("encodes the hierarchy in the slug", () => {
        for (const t of taxonomy.TOPICS) {
            expect(t.slug.startsWith(`${t.genreSlug}.`)).toBe(true);
            expect(t.genreSlug.startsWith(`${t.constellationSlug}.`)).toBe(true);
        }
    });

    it("does not collide on punctuated labels", () => {
        const labels = ["C", "C++", "C#", "Next.js", "Node.js"];
        const slugs = labels.map((l) => taxonomy.slugify(l));
        expect(new Set(slugs).size).toBe(labels.length);
    });

    it("keeps every genre narrow enough to be competable", () => {
        for (const g of taxonomy.GENRES) {
            expect(g.topicCount).toBeGreaterThanOrEqual(4);
            expect(g.topicCount).toBeLessThanOrEqual(40);
        }
    });

    it("gives every constellation a one-sentence blurb", () => {
        for (const c of taxonomy.CONSTELLATIONS) {
            expect(c.blurb.length).toBeGreaterThan(20);
            expect(c.blurb).not.toMatch(/[!]/);
        }
    });

    it("reaches beyond tech and business", () => {
        const slugs = taxonomy.CONSTELLATIONS.map((c) => c.slug);
        for (const needed of ["craft-trades", "music-sound", "performance", "languages", "life-skills", "health"]) {
            expect(slugs).toContain(needed);
        }
    });

    it("includes trades, land work and regional languages", () => {
        const labels = taxonomy.TOPICS.map((t) => t.label);
        for (const needed of ["Plumbing", "Beekeeping", "Organic Farming", "Tabla", "Bharatanatyam", "Bengali", "Elder Care"]) {
            expect(labels).toContain(needed);
        }
    });
});

describe("taxonomy lookups", () => {
    it("resolves a topic to its ancestry", () => {
        const t = taxonomy.topic("music-sound.indian-classical.tabla");
        expect(t).not.toBeNull();
        expect(t.genreLabel).toBe("Indian Classical");
        expect(t.constellationSlug).toBe("music-sound");
    });

    it("returns null for an unknown slug", () => {
        expect(taxonomy.topic("nope.nope.nope")).toBeNull();
        expect(taxonomy.genre("nope")).toBeNull();
        expect(taxonomy.constellation("nope")).toBeNull();
    });

    it("normalises a mentor's topic list, dropping junk and duplicates", () => {
        const out = taxonomy.normaliseTopics([
            "music-sound.indian-classical.tabla",
            "music-sound.indian-classical.tabla",
            "not-a-real-topic",
            "",
            null,
        ]);
        expect(out).toEqual(["music-sound.indian-classical.tabla"]);
    });

    it("derives distinct genres and constellations from topics", () => {
        const a = taxonomy.ancestryOf([
            "computing.security.penetration-testing",
            "computing.security.reverse-engineering",
            "craft-trades.land-and-animals.beekeeping",
        ]);
        expect(a.genres.sort()).toEqual(["computing.security", "craft-trades.land-and-animals"]);
        expect(a.constellations.sort()).toEqual(["computing", "craft-trades"]);
    });

    it("searches by prefix first", () => {
        const hits = taxonomy.searchTopics("guitar");
        expect(hits.length).toBeGreaterThan(2);
        expect(hits[0].label.toLowerCase().startsWith("guitar") || hits.some((h) => h.label === "Acoustic Guitar")).toBe(true);
    });

    it("ignores searches that are too short", () => {
        expect(taxonomy.searchTopics("a")).toEqual([]);
        expect(taxonomy.searchTopics("")).toEqual([]);
    });

    it("builds a full tree whose counts match the flat lists", () => {
        const tree = taxonomy.tree();
        const genres = tree.reduce((n, c) => n + c.genres.length, 0);
        const topics = tree.reduce((n, c) => n + c.genres.reduce((m, g) => m + g.topics.length, 0), 0);
        expect(genres).toBe(taxonomy.STATS.genres);
        expect(topics).toBe(taxonomy.STATS.topics);
    });
});
