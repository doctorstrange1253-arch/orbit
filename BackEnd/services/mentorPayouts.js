const crypto = require("crypto");

const MoneyLedger = () => require("../models/MoneyLedger");

const ESCROW_ACCOUNT = "platform:escrow";

function payableAccount(mentorId) {
    return `mentor:${mentorId}:payable`;
}

function pendingAccount(mentorId) {
    return `mentor:${mentorId}:payout_pending`;
}

function paidAccount(mentorId) {
    return `mentor:${mentorId}:paid`;
}

function accountsFor(mentorId) {
    return [payableAccount(mentorId), pendingAccount(mentorId), paidAccount(mentorId)];
}

function toMinor(amountInr) {
    return Math.round(Number(amountInr) * 100);
}

function toRupees(minor) {
    return Math.round((Number(minor) || 0) / 100);
}

const STAGES = Object.freeze({
    release: { kind: "payout", from: (id) => ESCROW_ACCOUNT, to: payableAccount, memo: "Escrow released to mentor" },
    queue: { kind: "payout", from: (id) => ESCROW_ACCOUNT, to: pendingAccount, memo: "Session payout queued" },
    settle: { kind: "payout", from: pendingAccount, to: paidAccount, memo: "Session payout transferred" },
});

function payoutRows({ mentorId, amountMinor, sessionId, stage = "queue" }) {
    const spec = STAGES[stage];
    if (!spec) throw new Error(`Unknown payout stage '${stage}'`);
    if (!mentorId) throw new Error("mentorId is required");
    if (!Number.isInteger(amountMinor) || amountMinor <= 0) {
        throw new Error("amountMinor must be a positive integer number of paise");
    }

    const mentor = String(mentorId);
    const keyed = !!sessionId;
    const ref = keyed ? String(sessionId) : `unkeyed:${crypto.randomUUID()}`;
    const txnId = `sesspay:${stage}:${ref}`;
    const from = spec.from(mentor);
    const to = spec.to(mentor);

    return {
        txnId,
        keyed,
        rows: [
            {
                txnId,
                seq: 0,
                kind: spec.kind,
                account: from,
                counterAccount: to,
                amountMinor: -amountMinor,
                refType: "session",
                refId: ref,
                idempotencyKey: `${txnId}:out`,
                memo: spec.memo,
            },
            {
                txnId,
                seq: 1,
                kind: spec.kind,
                account: to,
                counterAccount: from,
                amountMinor,
                refType: "session",
                refId: ref,
                idempotencyKey: `${txnId}:in`,
                memo: spec.memo,
            },
        ],
    };
}

async function writePayout({ mentorId, amountInr, sessionId, stage = "queue" }) {
    const amountMinor = toMinor(amountInr);
    const { rows, txnId, keyed } = payoutRows({ mentorId, amountMinor, sessionId, stage });
    const written = await MoneyLedger().writeTxn(rows);
    return { txnId, keyed, amountMinor, stage, written: written.length, duplicate: written.length === 0 };
}

function queueSessionPayout({ mentorId, amountInr, sessionId }) {
    return writePayout({ mentorId, amountInr, sessionId, stage: "queue" });
}

function releaseEscrowToMentor({ mentorId, amountInr, sessionId }) {
    return writePayout({ mentorId, amountInr, sessionId, stage: "release" });
}

function markPayoutSettled({ mentorId, amountInr, sessionId }) {
    return writePayout({ mentorId, amountInr, sessionId, stage: "settle" });
}

function shapeEarnings(byAccount, mentorId) {
    const mentor = String(mentorId);
    const owed = byAccount[payableAccount(mentor)] || 0;
    const queued = byAccount[pendingAccount(mentor)] || 0;
    const paid = byAccount[paidAccount(mentor)] || 0;
    const pendingMinor = owed + queued;
    const totalMinor = pendingMinor + paid;

    return {
        totalInr: toRupees(totalMinor),
        pendingInr: toRupees(pendingMinor),
        releasedInr: toRupees(paid),
        totalMinor,
        pendingMinor,
        releasedMinor: paid,
        currency: "INR",
    };
}

async function earningsFor(mentorId) {
    const rows = await MoneyLedger().aggregate([
        { $match: { account: { $in: accountsFor(String(mentorId)) } } },
        { $group: { _id: "$account", total: { $sum: "$amountMinor" } } },
    ]);
    const byAccount = {};
    for (const row of rows) byAccount[row._id] = row.total || 0;
    return shapeEarnings(byAccount, mentorId);
}

module.exports = {
    ESCROW_ACCOUNT,
    payableAccount,
    pendingAccount,
    paidAccount,
    accountsFor,
    toMinor,
    toRupees,
    payoutRows,
    writePayout,
    queueSessionPayout,
    releaseEscrowToMentor,
    markPayoutSettled,
    shapeEarnings,
    earningsFor,
};
