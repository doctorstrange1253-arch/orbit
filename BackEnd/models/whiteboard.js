const mongoose = require("mongoose");

/**
 * Persisted whiteboard for a session (1:1 call room) — EPHEMERAL by design.
 *
 * Keyed by the same deterministic `roomName` used for the video call, so the
 * board a pair drew on survives reconnects DURING the call. It dies WITH the
 * call: the client DELETEs on graceful end, the server deletes on call-ended
 * and on empty-room disconnect, and the `expiresAt` TTL below is the final
 * backstop (crash/restart between events) so no board data outlives its
 * session. `snapshot` holds the serialized Board state (pages + objects);
 * `participants` gates who may read/write it (checked against the JWT user).
 */
// Refreshed on every autosave (~12s while the board is open), so an ACTIVE
// board never expires mid-call; an orphaned one self-destructs within 24h.
const WB_TTL_MS = 24 * 60 * 60 * 1000;

const whiteboardSchema = new mongoose.Schema({
    roomName: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    participants: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        default: []
    },
    // Board.snapshot() → { v, pages, objects, clock }. Mixed since object shapes
    // vary (strokes/shapes/text/sticky/image/math/code).
    snapshot: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    lastEditedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    // TTL backstop — Mongo's TTL monitor hard-deletes past this instant.
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + WB_TTL_MS)
    }
}, {
    timestamps: true
});

whiteboardSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Whiteboard", whiteboardSchema);
module.exports.WB_TTL_MS = WB_TTL_MS;
