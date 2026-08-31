/**
 * Concept.js — a knowledge-graph node.
 *
 * A Concept is a cross-course, cross-discipline idea that the user can
 * "touch" by completing a lesson that references it. Examples:
 *   "the_root_note"     (musicians + audio engineers touch this)
 *   "recursion"          (programmers + mathematicians touch this)
 *   "supply_and_demand"  (economists + historians touch this)
 *
 * The Knowledge Graph (knowledgeGraphService.js) is the *user's* slice
 * through this catalog — what they've touched, how deeply, and how
 * the concepts cluster. The Skill Map (V3-E) is a visualization of
 * that slice.
 *
 * `category` is a high-level bucket ("music", "programming", "design")
 * used for filtering the catalog and for the Skill Map's nebula
 * coloring. `relatedConceptSlugs[]` is a hint for the Skill Map's
 * line-drawing algorithm.
 */

const mongoose = require("mongoose");

const ConceptSchema = new mongoose.Schema({
    slug:        { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 80 },
    label:       { type: String, required: true, maxlength: 120 },
    description: { type: String, default: "", maxlength: 800 },
    category:    { type: String, default: "general", index: true },   // "music", "programming", ...
    relatedConceptSlugs: { type: [String], default: [] },
    // Public visibility — hidden concepts are seeded-only / not user-touchable.
    isPublic:    { type: Boolean, default: true, index: true },
}, { timestamps: true });

ConceptSchema.index({ category: 1, label: 1 });

module.exports = mongoose.models.Concept || mongoose.model("Concept", ConceptSchema);
