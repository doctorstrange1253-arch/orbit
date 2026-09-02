const FLAT_SHARE_PCT = 50;

function engagedOf(seats) {
    return (seats || []).filter((s) => (s.gatedLessonsCompleted || 0) > 0);
}

function byCourseAsc(a, b) {
    return String(a.courseId).localeCompare(String(b.courseId));
}

function distribute(totalMinor, weights) {
    const sum = weights.reduce((n, w) => n + w, 0);
    if (totalMinor <= 0 || weights.length === 0 || sum <= 0) return weights.map(() => 0);
    const raw = weights.map((w) => Math.floor((totalMinor * w) / sum));
    let remainder = totalMinor - raw.reduce((n, v) => n + v, 0);
    const order = weights
        .map((w, i) => ({ i, w }))
        .filter((x) => x.w > 0)
        .map((x) => x.i);
    for (let k = 0; remainder > 0 && order.length > 0; k += 1, remainder -= 1) {
        raw[order[k % order.length]] += 1;
    }
    return raw;
}

function settlePeriod({ poolMinor, seats }) {
    const pool = Math.max(0, Math.round(poolMinor) || 0);
    const ordered = (seats || []).slice().sort(byCourseAsc);
    const engaged = engagedOf(ordered);

    if (engaged.length === 0) {
        return {
            shares: ordered.map((s) => ({ courseId: String(s.courseId), mentorId: s.mentorId ? String(s.mentorId) : null, shareMinor: 0, engaged: false, stagesCleared: 0 })),
            distributedMinor: 0,
            unallocatedMinor: pool,
            unallocatedReason: "no_engagement",
            flatMinor: 0,
            meritMinor: 0,
        };
    }

    const meritWeights = engaged.map((s) => Math.max(0, s.stagesCleared || 0));
    const meritHasWeight = meritWeights.some((w) => w > 0);

    let flatMinor = Math.floor((pool * FLAT_SHARE_PCT) / 100);
    let meritMinor = pool - flatMinor;
    if (!meritHasWeight) {
        flatMinor = pool;
        meritMinor = 0;
    }

    const flatShares = distribute(flatMinor, engaged.map(() => 1));
    const meritShares = meritMinor > 0 ? distribute(meritMinor, meritWeights) : engaged.map(() => 0);

    const byKey = new Map();
    engaged.forEach((s, i) => {
        byKey.set(String(s.courseId), {
            courseId: String(s.courseId),
            mentorId: s.mentorId ? String(s.mentorId) : null,
            shareMinor: flatShares[i] + meritShares[i],
            flatMinor: flatShares[i],
            meritMinor: meritShares[i],
            engaged: true,
            stagesCleared: s.stagesCleared || 0,
            gatedLessonsCompleted: s.gatedLessonsCompleted || 0,
        });
    });

    const shares = ordered.map((s) => byKey.get(String(s.courseId)) || {
        courseId: String(s.courseId),
        mentorId: s.mentorId ? String(s.mentorId) : null,
        shareMinor: 0,
        flatMinor: 0,
        meritMinor: 0,
        engaged: false,
        stagesCleared: 0,
        gatedLessonsCompleted: s.gatedLessonsCompleted || 0,
    });

    const distributed = shares.reduce((n, s) => n + s.shareMinor, 0);

    return {
        shares,
        distributedMinor: distributed,
        unallocatedMinor: pool - distributed,
        unallocatedReason: pool - distributed > 0 ? "rounding" : null,
        flatMinor,
        meritMinor,
        engagedCount: engaged.length,
    };
}

function assertBalanced({ grossMinor, taxMinor, platformCutMinor, shares, unallocatedMinor }) {
    const shareSum = (shares || []).reduce((n, s) => n + s.shareMinor, 0);
    const total = (taxMinor || 0) + (platformCutMinor || 0) + shareSum + (unallocatedMinor || 0);
    return { ok: total === grossMinor, total, grossMinor, shareSum };
}

function settle({ economics, seats }) {
    const result = settlePeriod({ poolMinor: economics.poolMinor, seats });
    const balance = assertBalanced({
        grossMinor: economics.grossMinor,
        taxMinor: economics.taxMinor,
        platformCutMinor: economics.platformCutMinor,
        shares: result.shares,
        unallocatedMinor: result.unallocatedMinor,
    });
    return { ...result, economics, balance };
}

function ledgerRows({ txnId, periodId, userId, computeVersion, economics, result }) {
    const rows = [];
    let seq = 0;
    const push = (row) => rows.push({ txnId, seq: seq++, ...row });

    push({
        kind: "settlement",
        account: `user:${userId}:receivable`,
        counterAccount: "platform:revenue",
        amountMinor: -economics.grossMinor,
        refType: "subscription_period",
        refId: periodId,
        idempotencyKey: `set:v${computeVersion}:${periodId}:source`,
        memo: "Subscription period recognised",
    });

    if (economics.taxMinor > 0) {
        push({
            kind: "tax_withheld",
            account: "platform:tax_payable",
            counterAccount: `user:${userId}:receivable`,
            amountMinor: economics.taxMinor,
            refType: "subscription_period",
            refId: periodId,
            idempotencyKey: `set:v${computeVersion}:${periodId}:tax`,
            memo: "GST payable",
        });
    }

    push({
        kind: "settlement",
        account: "platform:revenue",
        counterAccount: `user:${userId}:receivable`,
        amountMinor: economics.platformCutMinor,
        refType: "subscription_period",
        refId: periodId,
        idempotencyKey: `set:v${computeVersion}:${periodId}:platform`,
        memo: `Platform cut ${economics.platformCutPct}%`,
    });

    for (const s of result.shares) {
        if (s.shareMinor <= 0) continue;
        push({
            kind: "settlement",
            account: `mentor:${s.mentorId}:payable`,
            counterAccount: `user:${userId}:receivable`,
            amountMinor: s.shareMinor,
            refType: "course_seat",
            refId: s.courseId,
            idempotencyKey: `set:v${computeVersion}:${periodId}:${s.courseId}`,
            memo: `Seat share · flat ${s.flatMinor} · merit ${s.meritMinor}`,
        });
    }

    if (result.unallocatedMinor > 0) {
        push({
            kind: "settlement",
            account: "platform:unallocated",
            counterAccount: `user:${userId}:receivable`,
            amountMinor: result.unallocatedMinor,
            refType: "subscription_period",
            refId: periodId,
            idempotencyKey: `set:v${computeVersion}:${periodId}:unalloc`,
            memo: result.unallocatedReason || "unallocated",
        });
    }

    return rows;
}

module.exports = {
    FLAT_SHARE_PCT,
    distribute,
    settlePeriod,
    assertBalanced,
    settle,
    ledgerRows,
};
