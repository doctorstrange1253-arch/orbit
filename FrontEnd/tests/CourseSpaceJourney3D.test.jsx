import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

// Mock three.js to satisfy imports without a canvas
vi.mock("three", () => ({
    Vector2: class {},
    Vector3: class {},
    Color: class {},
    Raycaster: class { constructor() {} },
}));

// Mock R3F's Canvas to a simple div for unit testing.
vi.mock("@react-three/fiber", () => ({
    Canvas: (props) =>
        React.createElement("div", {
            "data-testid": "r3f-canvas",
            "data-camera": JSON.stringify(props.camera),
            "data-fov": props.fov,
        }),
    useFrame: () => null,
    useLoader: () => null,
    useCursor: () => null,
}));

// Mock the entire drei module because Html, Float, etc. cause canvas issues
vi.mock("@react-three/drei", () => ({
    OrbitControls: () => null,
    Stars: () => null,
    Html: (props) =>
        React.createElement("div", {
            "data-testid": "drei-html",
            "data-position": JSON.stringify(props.position),
        }),
    Float: (props) =>
        React.createElement("div", { "data-testid": "float-wrapper" }, props.children),
    useProgress: () => ({ active: false, progress: 0 }),
    Environment: (props) => React.createElement("div", null, props.children),
}));

describe("CourseSpaceJourney3D (unit smoke)", () => {
    it("mounts without error with courseTitle prop", async () => {
        const CourseSpaceJourney3D = (await import("./../src/cosmic/CourseSpaceJourney3D.jsx")).default;
        const { Canvas } = await import("@react-three/fiber");

        const wrapper = document.createElement("div");
        // Should not throw
        render(
            React.createElement(Canvas, { camera: { position: [0, 10, 18] }, fov: 60 },
                React.createElement(CourseSpaceJourney3D, { courseTitle: "Deep Space Protocols" })
            ),
            { container: wrapper }
        );

        // Verify the Canvas wrapper receives the props
        const canvas = wrapper.querySelector("[data-testid='r3f-canvas']");
        expect(canvas).not.toBeNull();
        expect(canvas.getAttribute("data-camera")).toContain("0");
        expect(canvas.getAttribute("data-fov")).toBe("60");
    });

    it("mounts without error with custom modules prop", async () => {
        const CourseSpaceJourney3D = (await import("./../src/cosmic/CourseSpaceJourney3D.jsx")).default;
        const { Canvas } = await import("@react-three/fiber");

        const wrapper = document.createElement("div");
        render(
            React.createElement(Canvas, { camera: { position: [0, 10, 18] }, fov: 60 },
                React.createElement(CourseSpaceJourney3D, {
                    courseTitle: "Custom Course",
                    modules: [
                        { id: "mod1", title: "Module One", completed: true },
                        { id: "mod2", title: "Module Two", completed: false },
                    ]
                })
            ),
            { container: wrapper }
        );

        expect(wrapper.querySelector("[data-testid='r3f-canvas']")).not.toBeNull();
    });

    it("mounts without error with onSelectModule callback", async () => {
        const CourseSpaceJourney3D = (await import("./../src/cosmic/CourseSpaceJourney3D.jsx")).default;
        const { Canvas } = await import("@react-three/fiber");

        const wrapper = document.createElement("div");
        const mockSelect = vi.fn();
        render(
            React.createElement(Canvas, { camera: { position: [0, 10, 18] }, fov: 60 },
                React.createElement(CourseSpaceJourney3D, {
                    courseTitle: "Test Course",
                    modules: [{ id: "m1", title: "Lesson 1" }],
                    onSelectModule: mockSelect,
                })
            ),
            { container: wrapper }
        );

        expect(wrapper.querySelector("[data-testid='r3f-canvas']")).not.toBeNull();
    });

    it("mounts without error with selectedModuleId prop", async () => {
        const CourseSpaceJourney3D = (await import("./../src/cosmic/CourseSpaceJourney3D.jsx")).default;
        const { Canvas } = await import("@react-three/fiber");

        const wrapper = document.createElement("div");
        render(
            React.createElement(Canvas, { camera: { position: [0, 10, 18] }, fov: 60 },
                React.createElement(CourseSpaceJourney3D, {
                    courseTitle: "Test Course",
                    selectedModuleId: "m1",
                })
            ),
            { container: wrapper }
        );

        expect(wrapper.querySelector("[data-testid='r3f-canvas']")).not.toBeNull();
    });
});