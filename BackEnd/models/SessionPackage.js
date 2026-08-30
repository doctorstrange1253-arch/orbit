const mongoose = require("mongoose");

/**
 * SessionPackage — bundle model. CREATED but UNUSED by the booking flow in
 * this vertical slice (the manifesto's package-selling economy is a later
 * slice). The schema is here so the index + collection exist, and the
 * admin Sessions page can list them when the feature lands.
 */
const sessionPackageSchema = new mongoose.Schema({
    mentorProfileId: { type: mongoose.Schema.Types.ObjectId, ref: "MentorProfile", required: true },
    title:           { type: String, required: true, maxlength: 120 },
    sessionsCount:   { type: Number, required: true, min: 1 },
    totalDurationMin:{ type: Number, required: true, min: 15 },
    priceInr:        { type: Number, required: true, min: 0 },
    currency:        { type: String, default: "INR" },
    active:          { type: Boolean, default: true },
}, { timestamps: true });

sessionPackageSchema.index({ mentorProfileId: 1, active: 1 });

module.exports = mongoose.models.SessionPackage || mongoose.model("SessionPackage", sessionPackageSchema);
