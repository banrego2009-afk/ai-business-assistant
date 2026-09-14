"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, PerspectiveCamera, OrthographicCamera } from "@react-three/drei";
import BuildingModel from "./BuildingModel";

export default function Scene({ activeSystem }: { activeSystem: string | null }) {
  return (
    <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[5, 4, 8]} fov={35} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <spotLight position={[-10, -10, -5]} intensity={0.5} color="#D4F568" />
        <Environment preset="city" />
        <BuildingModel activeSystem={activeSystem} />
      </Canvas>
    </div>
  );
}
