const CourseRequest = require("../models/CourseRequest");
const User = require("../models/user");

/**
 * Normalize text into a cluster key for semantic deduplication
 * e.g., "Learn DSA in Java!" -> "learn-dsa-java"
 */
function getClusterKey(topic) {
    return topic
        .toLowerCase()
        .replace(/[^a-z0-9]/g, " ")
        .split(/\s+/)
        .filter(Boolean)
        .sort()
        .join("-");
}

/**
 * POST /api/courses/requests — Submit or upvote a course request
 */
exports.submitRequest = async (req, res) => {
    try {
        const userId = req.user._id;
        const { topic, category, description } = req.body;

        if (!topic || !category) {
            return res.status(400).json({ message: "Topic and category are required." });
        }

        // Anti-brigading rate limit check: max 5 requests per user in last 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentCount = await CourseRequest.countDocuments({
            requestedBy: userId,
            createdAt: { $gte: thirtyDaysAgo }
        });

        if (recentCount >= 5) {
            return res.status(429).json({ message: "Rate limit exceeded: maximum 5 course requests per 30 days." });
        }

        const clusterKey = getClusterKey(topic);

        let request = await CourseRequest.findOne({ clusterKey });
        if (request) {
            // If already exists, upvote if user hasn't voted yet
            if (!request.voters.map(String).includes(String(userId))) {
                request.votes += 1;
                request.voters.push(userId);
                await request.save();
            }
            return res.json({ ok: true, request, clustered: true });
        }

        request = await CourseRequest.create({
            topic: topic.trim(),
            category: category.trim(),
            description: description ? description.trim() : "",
            requestedBy: userId,
            votes: 1,
            voters: [userId],
            clusterKey,
            status: "pending"
        });

        return res.status(201).json({ ok: true, request, clustered: false });
    } catch (err) {
        console.error("[submitRequest error]", err.message);
        return res.status(500).json({ message: "Failed to submit course request." });
    }
};

/**
 * GET /api/courses/requests — List course requests with vote counts & threshold status
 */
exports.listRequests = async (req, res) => {
    try {
        const { category, status } = req.query;
        const filter = {};
        if (category) filter.category = category;
        if (status) filter.status = status;

        const requests = await CourseRequest.find(filter)
            .sort({ votes: -1, createdAt: -1 })
            .limit(50)
            .lean();

        const formatted = requests.map((r) => ({
            ...r,
            thresholdTier: r.votes >= 50 ? "claim_eligible" : r.votes >= 25 ? "mentor_notified" : r.votes >= 5 ? "under_consideration" : "early"
        }));

        return res.json({ ok: true, requests: formatted });
    } catch (err) {
        console.error("[listRequests error]", err.message);
        return res.status(500).json({ message: "Failed to fetch course requests." });
    }
};

/**
 * POST /api/courses/requests/:id/claim — Mentor claims a course request
 */
exports.claimRequest = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;

        const request = await CourseRequest.findById(id);
        if (!request) {
            return res.status(404).json({ message: "Course request not found." });
        }

        if (request.status === "claimed" || request.status === "published") {
            return res.status(409).json({ message: "Course request already claimed or published." });
        }

        if (request.votes < 25) {
            return res.status(403).json({ message: "Course request has not reached the 25-vote mentor claim threshold." });
        }

        request.status = "claimed";
        request.claimedBy = userId;
        request.claimedAt = new Date();
        await request.save();

        return res.json({ ok: true, request });
    } catch (err) {
        console.error("[claimRequest error]", err.message);
        return res.status(500).json({ message: "Failed to claim course request." });
    }
};
