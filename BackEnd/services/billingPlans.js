const GST_PCT = 18;

const PLAN_KEYS = Object.freeze({
    FREE: "free",
    TWO: "orbit_two",
    FIVE: "orbit_five",
    TEN: "orbit_ten",
});

const PLAN_SEED = Object.freeze([
    {
        key: PLAN_KEYS.FREE,
        name: "Free",
        blurb: "Every introduction video, the whole catalogue, and peer swaps forever.",
        seats: 0,
        priceMinor: 0,
        interval: "month",
        intervalCount: 1,
        taxInclusive: true,
        taxRatePct: 0,
        platformCutPct: 0,
        sortOrder: 0,
    },
    {
        key: PLAN_KEYS.TWO,
        name: "Orbit Two",
        blurb: "Two courses a month. Enough to go deep on one thing and keep a second alive.",
        seats: 2,
        priceMinor: 59900,
        interval: "month",
        intervalCount: 1,
        taxInclusive: true,
        taxRatePct: GST_PCT,
        platformCutPct: 25,
        sortOrder: 1,
    },
    {
        key: PLAN_KEYS.FIVE,
        name: "Orbit Five",
        blurb: "Five courses a month. For the year you decide to change what you are capable of.",
        seats: 5,
        priceMinor: 129900,
        interval: "month",
        intervalCount: 1,
        taxInclusive: true,
        taxRatePct: GST_PCT,
        platformCutPct: 25,
        sortOrder: 2,
    },
    {
        key: PLAN_KEYS.TEN,
        name: "Orbit Ten",
        blurb: "Ten courses a month. Built for the people who treat learning as the work.",
        seats: 10,
        priceMinor: 219900,
        interval: "month",
        intervalCount: 1,
        taxInclusive: true,
        taxRatePct: GST_PCT,
        platformCutPct: 25,
        sortOrder: 3,
    },
    {
        key: `${PLAN_KEYS.TWO}_year`,
        name: "Orbit Two · Yearly",
        blurb: "Two courses a month, paid yearly. Ten months' price for twelve months.",
        seats: 2,
        priceMinor: 599000,
        interval: "year",
        intervalCount: 1,
        taxInclusive: true,
        taxRatePct: GST_PCT,
        platformCutPct: 25,
        sortOrder: 4,
    },
    {
        key: `${PLAN_KEYS.FIVE}_year`,
        name: "Orbit Five · Yearly",
        blurb: "Five courses a month, paid yearly. Ten months' price for twelve months.",
        seats: 5,
        priceMinor: 1299000,
        interval: "year",
        intervalCount: 1,
        taxInclusive: true,
        taxRatePct: GST_PCT,
        platformCutPct: 25,
        sortOrder: 5,
    },
    {
        key: `${PLAN_KEYS.TEN}_year`,
        name: "Orbit Ten · Yearly",
        blurb: "Ten courses a month, paid yearly. Ten months' price for twelve months.",
        seats: 10,
        priceMinor: 2199000,
        interval: "year",
        intervalCount: 1,
        taxInclusive: true,
        taxRatePct: GST_PCT,
        platformCutPct: 25,
        sortOrder: 6,
    },
]);

function rupees(minor) {
    return (Math.round(minor) / 100).toFixed(2);
}

function splitTax({ priceMinor, taxInclusive, taxRatePct }) {
    const gross = Math.max(0, Math.round(priceMinor) || 0);
    const rate = Math.max(0, Number(taxRatePct) || 0);
    if (rate === 0) return { grossMinor: gross, netMinor: gross, taxMinor: 0 };
    if (taxInclusive) {
        const net = Math.round(gross / (1 + rate / 100));
        return { grossMinor: gross, netMinor: net, taxMinor: gross - net };
    }
    const tax = Math.round((gross * rate) / 100);
    return { grossMinor: gross + tax, netMinor: gross, taxMinor: tax };
}

function periodCountFor(plan) {
    return plan.interval === "year" ? 12 * (plan.intervalCount || 1) : (plan.intervalCount || 1);
}

function spreadAcrossPeriods(totalMinor, periods) {
    if (periods <= 0) return [];
    const base = Math.floor(totalMinor / periods);
    const remainder = totalMinor - base * periods;
    return Array.from({ length: periods }, (_, i) => base + (i < remainder ? 1 : 0));
}

function periodEconomics(plan, grossForPeriodMinor) {
    const { netMinor, taxMinor } = splitTax({
        priceMinor: grossForPeriodMinor,
        taxInclusive: plan.taxInclusive,
        taxRatePct: plan.taxRatePct,
    });
    const platformCutMinor = Math.floor((netMinor * (Number(plan.platformCutPct) || 0)) / 100);
    const poolMinor = netMinor - platformCutMinor;
    return {
        grossMinor: grossForPeriodMinor,
        netMinor,
        taxMinor,
        platformCutPct: Number(plan.platformCutPct) || 0,
        platformCutMinor,
        poolMinor,
    };
}

function quote(plan) {
    const periods = periodCountFor(plan);
    const perPeriod = spreadAcrossPeriods(plan.priceMinor, periods);
    const first = periodEconomics(plan, perPeriod[0] ?? 0);
    const { netMinor, taxMinor } = splitTax(plan);
    const perMonthMinor = Math.floor(plan.priceMinor / periods);
    const perSeatMinor = plan.seats > 0 ? Math.floor(perMonthMinor / plan.seats) : 0;
    return {
        key: plan.key,
        name: plan.name,
        blurb: plan.blurb,
        seats: plan.seats,
        interval: plan.interval,
        priceMinor: plan.priceMinor,
        priceLabel: `₹${rupees(plan.priceMinor)}`,
        priceSuffix: plan.interval === "year" ? "per year" : "per month",
        taxNote: plan.taxRatePct > 0
            ? `₹${rupees(plan.priceMinor)} including all taxes (${plan.taxRatePct}% GST).`
            : "Free forever. No card, no tax.",
        netMinor,
        taxMinor,
        perSeatMinor,
        perSeatLabel: plan.seats > 0 ? `₹${rupees(perSeatMinor)} per course, per month` : null,
        perMonthMinor,
        perMonthLabel: `₹${rupees(perMonthMinor)} a month`,
        monthsFree: plan.interval === "year" ? 2 : 0,
        billedPeriods: periods,
        firstPeriod: first,
    };
}

module.exports = {
    GST_PCT,
    PLAN_KEYS,
    PLAN_SEED,
    rupees,
    splitTax,
    periodCountFor,
    spreadAcrossPeriods,
    periodEconomics,
    quote,
};
