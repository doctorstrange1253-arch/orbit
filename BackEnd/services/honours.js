const TIERS = Object.freeze({
    beacon:    { id: "beacon",    label: "Beacon",    photons: 50,   blurb: "You lit the way." },
    comet:     { id: "comet",     label: "Comet",     photons: 200,  blurb: "That lesson moved fast and left a tail." },
    supernova: { id: "supernova", label: "Supernova", photons: 1000, blurb: "Rare. Something changed for good." },
});

const TIER_IDS = Object.freeze(Object.keys(TIERS));

function isTier(tier) {
    return Object.prototype.hasOwnProperty.call(TIERS, String(tier || ""));
}

function costOf(tier) {
    if (!isTier(tier)) throw new Error(`Unknown honour tier '${tier}'`);
    return TIERS[tier].photons;
}

function catalogue() {
    return TIER_IDS.map((id) => ({ ...TIERS[id] }));
}

function shapeHonours(honours) {
    const h = honours || {};
    const byTier = {};
    let count = 0;
    for (const id of TIER_IDS) {
        const n = Math.max(0, Number(h[id]) || 0);
        byTier[id] = n;
        count += n;
    }
    return {
        count: Math.max(count, Math.max(0, Number(h.count) || 0)),
        photons: Math.max(0, Number(h.photons) || 0),
        byTier,
        lastAt: h.lastAt || null,
    };
}

function incrementFor(tier) {
    const photons = costOf(tier);
    return {
        $inc: {
            "honours.count": 1,
            "honours.photons": photons,
            [`honours.${tier}`]: 1,
        },
        $set: { "honours.lastAt": new Date() },
    };
}

module.exports = { TIERS, TIER_IDS, isTier, costOf, catalogue, shapeHonours, incrementFor };
