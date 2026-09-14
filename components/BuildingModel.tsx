"use client";

import { useRef, useLayoutEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function BuildingModel({ activeSystem }: { activeSystem: string | null }) {
  const group = useRef<THREE.Group>(null);
  const outerWalls = useRef<THREE.Mesh>(null);
  const floors = useRef<THREE.Group>(null);
  const wireSystem = useRef<THREE.Group>(null);

  useLayoutEffect(() => {
    if (!outerWalls.current || !floors.current || !wireSystem.current || !group.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      }
    });

    // Fázis 1: Épületmetszet feltárása
    tl.to(outerWalls.current.material, { opacity: 0.1, duration: 2 }, 0)
      .to(wireSystem.current.position, { y: 0.5, duration: 2 }, 0)
      
    // Fázis 2: 3D -> 2D Tervrajz (Kamera mozgás a Scene-ben történik, itt az épület laposodik)
    tl.to(group.current.rotation, { x: -Math.PI / 2, y: 0, z: -Math.PI / 4, duration: 3 }, 2)
      .to(floors.current.scale, { y: 0.01, duration: 3 }, 2)
      .to(wireSystem.current.scale, { y: 0.01, duration: 3 }, 2)
      
  }, []);

  // Színek animálása az aktív rendszer alapján
  useFrame(() => {
    if (!wireSystem.current) return;
    const targetColor = activeSystem ? new THREE.Color("#D4F568") : new THREE.Color("#4a5568");
    wireSystem.current.children.forEach((child: any) => {
      if (child.material) {
        child.material.color.lerp(targetColor, 0.05);
      }
    });
  });

  return (
    <group ref={group} rotation={[0, -Math.PI / 4, 0]}>
      {/* Outer Shell */}
      <mesh ref={outerWalls} position={[0, 1.5, 0]}>
        <boxGeometry args={[3, 3, 3]} />
        <meshPhysicalMaterial 
          color="#151B1F" 
          transparent 
          opacity={0.8} 
          roughness={0.1}
          metalness={0.8}
          clearcoat={1}
        />
      </mesh>

      {/* Inner Floors */}
      <group ref={floors}>
        {[0, 1, 2].map((y) => (
          <mesh key={y} position={[0, y, 0]}>
            <boxGeometry args={[2.8, 0.1, 2.8]} />
            <meshStandardMaterial color="#8D989F" roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* Internal Electrical Systems (Abstract Wires) */}
      <group ref={wireSystem} position={[0, 0, 0]}>
        {/* Felszálló ág */}
        <mesh position={[-1, 1.5, -1]}>
          <cylinderGeometry args={[0.05, 0.05, 3]} />
          <meshBasicMaterial color="#4a5568" />
        </mesh>
        <mesh position={[1, 1.5, 1]}>
          <cylinderGeometry args={[0.05, 0.05, 3]} />
          <meshBasicMaterial color="#4a5568" />
        </mesh>
        
        {/* Szinti elosztások */}
        {[0.1, 1.1, 2.1].map((y) => (
          <group key={`wire-${y}`}>
            <mesh position={[0, y, -1]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.02, 0.02, 2]} />
              <meshBasicMaterial color="#4a5568" />
            </mesh>
            <mesh position={[1, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 2]} />
              <meshBasicMaterial color="#4a5568" />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
