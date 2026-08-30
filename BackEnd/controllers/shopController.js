/**
 * shopController.js — the Stardust Cosmetics Shop API (Orbit Engine, Tier 3).
 * GET the catalog + the viewer's balance/owned/equipped; buy an item (spends
 * Stardust); equip/unequip an owned item. Purchase rules are delegated to the
 * pure reducers in services/cosmeticsCatalog.js.
 */

const User = require("../models/user");
const shop = require("../services/cosmeticsCatalog");

// Shape the shop payload from a user's orbit sub-doc.
function shapeShop(orbit) {
    const cosmetics = shop.normalizeCosmetics(orbit && orbit.cosmetics);
    const stardust = (orbit && orbit.stardust) || 0;
    // Weekly Deal: rotates every Monday 00:00 UTC (pure function of the week —
    // see cosmeticsCatalog.weeklyDeal). `price` is what buy() will actually
    // charge; `cost` stays the list price so the client can show the slash.
    const deal = shop.weeklyDeal();
    return {
        // Part 0: `photons` canonical, `stardust` kept for the compat window.
        photons: stardust,
        stardust,
        owned: cosmetics.owned,
        equipped: { name_glow: cosmetics.nameGlow, background: cosmetics.background, avatar_deco: cosmetics.avatarDeco, profile_effect: cosmetics.profileEffect, nameplate: cosmetics.nameplate },
        deal,
        catalog: shop.getLiveCatalog().map((c) => {
            const price = shop.priceOf(c.key);
            return {
                ...c,
                price,
                dealPct: deal && deal.key === c.key ? deal.pct : 0,
                owned: cosmetics.owned.includes(c.key),
                equipped: cosmetics.nameGlow === c.key || cosmetics.background === c.key || cosmetics.avatarDeco === c.key || cosmetics.profileEffect === c.key || cosmetics.nameplate === c.key,
                affordable: stardust >= price,
            };
        }),
    };
}

// GET /api/orbit/shop
exports.getShop = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("orbit.cosmetics orbit.stardust").lean();
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.status(200).json(shapeShop(user.orbit));
    } catch (err) {
        console.error("getShop error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// POST /api/orbit/shop/buy { key }
exports.buy = async (req, res) => {
    try {
        const { key } = req.body || {};
        if (!key) return res.status(400).json({ message: "key is required" });

        const user = await User.findById(req.user.id).select("orbit.cosmetics orbit.stardust").lean();
        if (!user) return res.status(404).json({ message: "User not found" });

        // Only LIVE items are purchasable (draft/archived exist for equip of prior
        // purchases but can't be bought). Missing status ⇒ default catalog ⇒ live.
        const catItem = shop.getItem(key);
        if (catItem && catItem.status && catItem.status !== "live") {
            return res.status(400).json({ message: "This item isn't available", reason: "unavailable" });
        }

        const result = shop.applyPurchase(
            { stardust: (user.orbit && user.orbit.stardust) || 0, cosmetics: user.orbit && user.orbit.cosmetics },
            key
        );
        if (!result.ok) {
            const msg = result.reason === "insufficient" ? "Not enough Photons"
                : result.reason === "already_owned" ? "You already own this"
                : "Item not found";
            return res.status(400).json({ message: msg, reason: result.reason });
        }

        // Atomic guarded write: only deduct + grant if the balance still covers
        // the cost AND the item isn't already owned at write time. This closes a
        // read-then-write race where two concurrent buys both passed the check
        // above against the same starting balance and double-spent (or the $set
        // on the whole `owned` array clobbered a parallel purchase).
        // Charge result.price (today's price: admin discount + weekly deal), not
        // the raw list cost — the same figure the shop displayed.
        const upd = await User.updateOne(
            {
                _id: req.user.id,
                "orbit.stardust": { $gte: result.price },
                "orbit.cosmetics.owned": { $ne: key },
            },
            {
                $inc: { "orbit.stardust": -result.price },
                $addToSet: { "orbit.cosmetics.owned": key },
            }
        );
        if (!upd.matchedCount) {
            return res.status(409).json({ message: "Purchase could not be completed — please retry", reason: "conflict" });
        }

        const fresh = await User.findById(req.user.id).select("orbit.cosmetics orbit.stardust").lean();
        require("../services/orbitAnalytics").track("cosmetic.purchase", { userId: String(req.user.id), key, spent: result.price });
        require("../services/photonLedger").record(req.user.id, -result.price, "cosmetic"); // C6 sink (once)
        return res.status(200).json({ bought: key, spent: result.price, spentPhotons: result.price, ...shapeShop(fresh.orbit) });
    } catch (err) {
        console.error("buy (shop) error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// POST /api/orbit/shop/equip { type, key }   (key = null → unequip)
exports.equip = async (req, res) => {
    try {
        const { type, key = null } = req.body || {};
        const user = await User.findById(req.user.id).select("orbit.cosmetics").lean();
        if (!user) return res.status(404).json({ message: "User not found" });

        const result = shop.applyEquip({ cosmetics: user.orbit && user.orbit.cosmetics }, type, key);
        if (!result.ok) {
            const msg = result.reason === "not_owned" ? "You don't own this yet"
                : result.reason === "bad_type" ? "Invalid cosmetic type"
                : "Item not found";
            return res.status(400).json({ message: msg, reason: result.reason });
        }

        await User.updateOne(
            { _id: req.user.id },
            { $set: {
                "orbit.cosmetics.nameGlow": result.cosmetics.nameGlow,
                "orbit.cosmetics.background": result.cosmetics.background,
                "orbit.cosmetics.avatarDeco": result.cosmetics.avatarDeco,
                "orbit.cosmetics.profileEffect": result.cosmetics.profileEffect,
                "orbit.cosmetics.nameplate": result.cosmetics.nameplate,
            } }
        );

        // Broadcast so everyone ELSE's open Browse/Matches refresh the wearer's
        // new look live (same pattern as "new-skill"); the wearer's own client
        // already painted optimistically.
        const io = req.app.get("io");
        if (io) io.emit("cosmetics-changed", { userId: String(req.user.id) });

        const fresh = await User.findById(req.user.id).select("orbit.cosmetics orbit.stardust").lean();
        return res.status(200).json(shapeShop(fresh.orbit));
    } catch (err) {
        console.error("equip (shop) error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
