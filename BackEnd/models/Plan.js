const mongoose = require("mongoose");

const PlanSchema = new mongoose.Schema({
    key:            { type: String, required: true, unique: true, trim: true },
    name:           { type: String, required: true, trim: true, maxlength: 80 },
    blurb:          { type: String, default: "", maxlength: 240 },
    seats:          { type: Number, required: true, min: 0 },
    priceMinor:     { type: Number, required: true, min: 0 },
    currency:       { type: String, default: "INR" },
    interval:       { type: String, enum: ["month", "year"], default: "month" },
    intervalCount:  { type: Number, default: 1, min: 1 },
    taxInclusive:   { type: Boolean, required: true },
    taxRatePct:     { type: Number, default: 0, min: 0, max: 100 },
    platformCutPct: { type: Number, required: true, min: 0, max: 100 },
    trialDays:      { type: Number, default: 0, min: 0 },
    graceDays:      { type: Number, default: 3, min: 0 },
    status:         { type: String, enum: ["draft", "live", "archived"], default: "draft" },
    providerPlanId: { type: String, default: null },
    sortOrder:      { type: Number, default: 0 },
}, { timestamps: true });

PlanSchema.index({ status: 1, sortOrder: 1 });

const FROZEN = ["priceMinor", "seats", "platformCutPct", "taxInclusive", "taxRatePct", "interval", "intervalCount"];

PlanSchema.pre("save", function guardLivePlan(next) {
    if (this.isNew) return next();
    if (this.status !== "live" && !this.isModified("status")) return next();
    const wasLive = this.$__.priorDoc ? this.$__.priorDoc.status === "live" : this.status === "live";
    if (!wasLive) return next();
    const touched = FROZEN.filter((f) => this.isModified(f));
    if (touched.length > 0) {
        return next(new Error(
            `A live plan is immutable. Archive it and create a new plan instead of editing: ${touched.join(", ")}`,
        ));
    }
    return next();
});

module.exports = mongoose.models.Plan || mongoose.model("Plan", PlanSchema);
