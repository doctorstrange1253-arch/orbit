const fs = require("fs");
const path = require("path");

// Guard against the class of bug where a route references a controller export
// that doesn't exist (typo, or an export dropped in a sync). Express builds its
// routes at require-time and throws "argument handler must be a function" when a
// handler is undefined, so simply requiring every router surfaces the break.
//
// This is the check that would have caught missionControlController.notificationLint
// being dropped while adminPortal.js still routed to it — a bug that crashed the
// backend on boot but slipped past the unit suites (which never import the routers).
const routesDir = path.join(__dirname, "..", "routes");
const routeFiles = fs
    .readdirSync(routesDir)
    .filter((f) => f.endsWith(".js"))
    .sort();

describe("routes — every router loads with all handlers defined", () => {
    it("finds route files to check", () => {
        expect(routeFiles.length).toBeGreaterThan(0);
    });

    it.each(routeFiles)("loads routes/%s without an undefined handler", (file) => {
        // require() throws if any router.<verb>(..., handler) handler is undefined.
        const mod = require(path.join(routesDir, file));
        // Every route module exports an Express router (a function).
        expect(typeof mod).toBe("function");
    });
});
