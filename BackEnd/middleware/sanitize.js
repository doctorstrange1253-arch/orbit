/**
 * Custom middleware to sanitize incoming data and prevent NoSQL injection.
 * Replaces express-mongo-sanitize which is currently incompatible with Express 5
 * due to how it overrides the req.query getter.
 */

// Keys that enable prototype-pollution attacks in addition to Mongo operators.
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function sanitize(obj) {
    if (obj instanceof Object) {
        for (const key of Object.keys(obj)) {
            // $-prefixed keys are potential MongoDB operators; dotted keys can
            // reach into nested fields ($set-style); forbidden keys enable
            // prototype pollution. Strip all of them.
            if (key.startsWith('$') || key.includes('.') || FORBIDDEN_KEYS.has(key)) {
                delete obj[key];
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                sanitize(obj[key]);
            }
        }
    }
}

const mongoSanitize = (req, res, next) => {
    ['body', 'params', 'headers', 'query'].forEach((k) => {
        if (req[k]) {
            sanitize(req[k]);
        }
    });
    next();
};

module.exports = mongoSanitize;
