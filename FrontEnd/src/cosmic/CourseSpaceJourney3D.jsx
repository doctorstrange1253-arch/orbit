import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Html, Float } from "@react-three/drei";
import * as THREE from "three";

/**
 * PlanetNode — Individual 3D planet representing a course module/station
 */
function PlanetNode({ module, index, total, onSelect, active }) {
    const meshRef = useRef();
    const [hovered, setHovered] = useState(false);

    // Calculate circular orbit position around central star
    const angle = (index / total) * Math.PI * 2;
    const radius = 6 + (index % 3) * 2.5;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = Math.sin(index * 1.5) * 1.5;

    // Orbit rotation animation
    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.5;
        }
    });

    const color = active ? "#4ade80" : module.completed ? "#3b82f6" : hovered ? "#facc15" : "#8b5cf6";

    return (
        <group position={[x, y, z]}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                <mesh
                    ref={meshRef}
                    onClick={() => onSelect(module)}
                    onPointerOver={() => setHovered(true)}
                    onPointerOut={() => setHovered(false)}
                    scale={hovered ? 1.3 : 1}
                >
                    <sphereGeometry args={[0.8, 32, 32]} />
                    <meshStandardMaterial
                        color={color}
                        roughness={0.3}
                        metalness={0.8}
                        emissive={color}
                        emissiveIntensity={hovered || active ? 0.6 : 0.2}
                    />
                </mesh>
            </Float>

            {/* Orbit ring wireframe */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[radius - 0.02, radius + 0.02, 64]} />
                <meshBasicMaterial color="#1e293b" side={THREE.DoubleSide} transparent opacity={0.4} />
            </mesh>

            {/* HTML Label floating above planet */}
            <Html position={[0, 1.3, 0]} center distanceFactor={15}>
                <div
                    onClick={() => onSelect(module)}
                    className="cursor-pointer px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-lg transition-all duration-300 border border-white/20 whitespace-nowrap"
                    style={{
                        backgroundColor: active ? "rgba(74, 222, 128, 0.85)" : "rgba(15, 23, 42, 0.85)",
                        color: active ? "#052e16" : "#f8fafc",
                        transform: hovered ? "scale(1.1)" : "scale(1)",
                    }}
                >
                    {index + 1}. {module.title || `Module ${index + 1}`}
                </div>
            </Html>
        </group>
    );
}

/**
 * CentralStar — Central star representing the course core topic
 */
function CentralStar({ title }) {
    const starRef = useRef();

    useFrame((state, delta) => {
        if (starRef.current) {
            starRef.current.rotation.y += delta * 0.2;
        }
    });

    return (
        <group>
            <mesh ref={starRef}>
                <sphereGeometry args={[2, 32, 32]} />
                <meshStandardMaterial color="#f97316" emissive="#ea580c" emissiveIntensity={1.5} roughness={0.2} />
            </mesh>
            <pointLight intensity={3} distance={50} color="#ffedd5" />
            <Html position={[0, -2.8, 0]} center>
                <div className="px-4 py-1.5 rounded-xl bg-slate-950/90 border border-orange-500/40 text-orange-200 text-sm font-bold shadow-2xl backdrop-blur-md">
                    {title || "Course Core"}
                </div>
            </Html>
        </group>
    );
}

/**
 * CourseSpaceJourney3D — Immersive R3F 3D solar system course map
 */
export default function CourseSpaceJourney3D({ courseTitle, modules = [], onSelectModule, selectedModuleId }) {
    const [reducedMotion, setReducedMotion] = useState(false);
    const [viewMode, setViewMode] = useState("3d"); // '3d' or '2d'

    const sampleModules = modules.length > 0 ? modules : [
        { id: "m1", title: "Introduction & Architecture", completed: true },
        { id: "m2", title: "Core Protocols & Security", completed: true },
        { id: "m3", title: "Advanced Algorithms", completed: false },
        { id: "m4", title: "Capstone Project", completed: false },
    ];

    return (
        <div className="relative w-full h-[650px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            {/* Top Toolbar */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-3 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/60 shadow-xl">
                <span className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">{courseTitle || "Solar System Journey"}</span>
                </span>
                <div className="h-4 w-px bg-slate-700" />
                <button
                    onClick={() => setViewMode(viewMode === "3d" ? "2d" : "3d")}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600/80 hover:bg-indigo-500 text-white transition-all shadow"
                >
                    {viewMode === "3d" ? "2D Map" : "3D View"}
                </button>
                <button
                    onClick={() => setReducedMotion(!reducedMotion)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all shadow ${reducedMotion ? "bg-amber-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
                >
                    Motion: {reducedMotion ? "Off" : "On"}
                </button>
            </div>

            {viewMode === "3d" ? (
                <Canvas camera={{ position: [0, 10, 18], fov: 60 }}>
                    <color attach="background" args={["#020617"]} />
                    <ambientLight intensity={0.7} />
                    <directionalLight position={[10, 20, 15]} intensity={1.5} />
                    <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={reducedMotion ? 0 : 1} />

                    <CentralStar title={courseTitle} />

                    {sampleModules.map((mod, index) => (
                        <PlanetNode
                            key={mod.id || index}
                            module={mod}
                            index={index}
                            total={sampleModules.length}
                            onSelect={onSelectModule}
                            active={selectedModuleId === mod.id}
                        />
                    ))}

                    <OrbitControls
                        enablePan={true}
                        enableZoom={true}
                        minDistance={8}
                        maxDistance={35}
                        autoRotate={!reducedMotion}
                        autoRotateSpeed={0.5}
                    />
                </Canvas>
            ) : (
                /* 2D Constellation Map Fallback */
                <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
                    <div className="text-center mb-8">
                        <h3 className="text-xl font-bold text-slate-100">2D Constellation Map</h3>
                        <p className="text-xs text-slate-400 mt-1">Accessible node navigation view</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl">
                        {sampleModules.map((mod, index) => (
                            <div
                                key={mod.id || index}
                                onClick={() => onSelectModule(mod)}
                                className={`cursor-pointer p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center ${
                                    selectedModuleId === mod.id
                                        ? "bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-900/30"
                                        : mod.completed
                                        ? "bg-blue-950/30 border-blue-500/50 hover:border-blue-400"
                                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mb-3 ${mod.completed ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300"}`}>
                                    {index + 1}
                                </div>
                                <h4 className="text-sm font-semibold text-slate-200 line-clamp-2">{mod.title}</h4>
                                <span className={`mt-3 text-[10px] px-2 py-0.5 rounded-full font-medium ${mod.completed ? "bg-blue-500/20 text-blue-300" : "bg-slate-800 text-slate-400"}`}>
                                    {mod.completed ? "Completed" : "Available"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
