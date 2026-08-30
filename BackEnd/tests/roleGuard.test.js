/**
 * roleGuard.test.js — unit tests for middleware/requireRoles.js.
 *
 * Pure (no DB) — exercises the factory with hand-built req/res mocks. The
 * composition with auth.js is tested in authRoles.test.js.
 */
const {
    requireRoles,
    requireAllRoles,
    requireAnyRole,
    VALID_ROLES,
} = require("../middleware/requireRoles");

const mockRes = () => {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
};

const mockReq = (user) => ({ user: user || null });

describe("requireRoles — single role", () => {
    const gate = requireRoles("mentor");

    test("allows when the caller has the required role", () => {
        const req = mockReq({ roles: ["peer_learner", "mentor"] });
        const res = mockRes();
        const next = jest.fn();
        gate(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    test("denies with 403 + structured body when the role is missing", () => {
        const req = mockReq({ roles: ["peer_learner"] });
        const res = mockRes();
        const next = jest.fn();
        gate(req, res, next);
        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);
        const body = res.json.mock.calls[0][0];
        expect(body.code).toBe("ROLE_REQUIRED");
        expect(body.required).toEqual(["mentor"]);
        expect(body.have).toEqual(["peer_learner"]);
    });

    test("denies with 401 when no user is attached", () => {
        const req = mockReq(null);
        const res = mockRes();
        const next = jest.fn();
        gate(req, res, next);
        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json.mock.calls[0][0].code).toBe("UNAUTHENTICATED");
    });
});

describe("requireRoles — multiple roles (any-of)", () => {
    const gate = requireRoles("mentor", "student");

    test("allows when the caller has at least one of the allowed roles", () => {
        const req = mockReq({ roles: ["peer_learner", "student"] });
        const res = mockRes();
        const next = jest.fn();
        gate(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    test("denies when the caller has none of the allowed roles", () => {
        const req = mockReq({ roles: ["peer_learner"] });
        const res = mockRes();
        const next = jest.fn();
        gate(req, res, next);
        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json.mock.calls[0][0].required).toEqual(["mentor", "student"]);
    });
});

describe("requireAllRoles — every role required", () => {
    const gate = requireAllRoles("mentor", "student");

    test("allows when the caller has every required role", () => {
        const req = mockReq({ roles: ["peer_learner", "mentor", "student"] });
        const res = mockRes();
        const next = jest.fn();
        gate(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    test("denies when the caller is missing any required role", () => {
        const req = mockReq({ roles: ["mentor"] });
        const res = mockRes();
        const next = jest.fn();
        gate(req, res, next);
        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);
    });
});

describe("requireAnyRole — array form of requireRoles", () => {
    const gate = requireAnyRole(["mentor", "student"]);

    test("behaves identically to requireRoles(...allowed)", () => {
        const ok = mockReq({ roles: ["student"] });
        const resOk = mockRes();
        const nextOk = jest.fn();
        gate(ok, resOk, nextOk);
        expect(nextOk).toHaveBeenCalled();

        const bad = mockReq({ roles: ["peer_learner"] });
        const resBad = mockRes();
        const nextBad = jest.fn();
        gate(bad, resBad, nextBad);
        expect(nextBad).not.toHaveBeenCalled();
        expect(resBad.status).toHaveBeenCalledWith(403);
    });
});

describe("requireRoles — defense in depth", () => {
    test("silently drops unknown role strings from the required list", () => {
        // 'admin' is not in VALID_ROLES — the factory must not allow it as a
        // required value, otherwise an attacker who adds a string to the route
        // definition could phish the gate.
        const gate = requireRoles("admin", "mentor");
        const req = mockReq({ roles: ["mentor"] });
        const res = mockRes();
        const next = jest.fn();
        gate(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    test("treats a missing roles array as empty (defensive — auth.js should always set it)", () => {
        const gate = requireRoles("mentor");
        const req = { user: { id: "x" } }; // no roles property
        const res = mockRes();
        const next = jest.fn();
        gate(req, res, next);
        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json.mock.calls[0][0].have).toEqual([]);
    });
});

describe("VALID_ROLES export", () => {
    test("exposes the canonical 3-role set", () => {
        expect(new Set(VALID_ROLES)).toEqual(
            new Set(["peer_learner", "mentor", "student"])
        );
    });
});
