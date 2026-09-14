"use client";

import { useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Edges } from "@react-three/drei";

gsap.registerPlugin(ScrollTrigger);

export default function BuildingModel({ activeSystem }: { activeSystem: string | null }) {
  const group = useRef<THREE.Group>(null);
  const floorRefs = useRef<THREE.Group[]>([]);
  const facade = useRef<THREE.Group>(null);
  
  const floorsCount = 5;
  const floorHeight = 3.2;
  const buildingWidth = 14;
  const buildingDepth = 10;

  useGSAP(() => {
    if (!group.current || !facade.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.5,
      }
    });

    tl.to(facade.current.position, { y: 20, duration: 1.5, ease: "power2.inOut" }, 0)
      .to(facade.current.children.map((c: THREE.Object3D) => (c as THREE.Mesh).material), { opacity: 0, duration: 1 }, 0.2);

    floorRefs.current.forEach((floor, index) => {
      if (floor) {
        tl.to(floor.position, { 
          y: index * (floorHeight * 1.8),
          duration: 1.5, 
          ease: "power2.inOut" 
        }, 0.2);
      }
    });

    floorRefs.current.forEach((floor) => {
      if (floor) {
        tl.to(floor.scale, { y: 0.001, duration: 1.5 }, 1.5);
      }
    });

    floorRefs.current.forEach((floor) => {
      if (floor) {
        tl.to(floor.scale, { y: 1, duration: 1.5 }, 3);
      }
    });
  }, []);

  const darkWall = new THREE.MeshStandardMaterial({ color: "#0F1115", roughness: 0.9, metalness: 0.1 });
  const floorSlab = new THREE.MeshStandardMaterial({ color: "#08090a", roughness: 0.9 });
  const coreMat = new THREE.MeshStandardMaterial({ color: "#050608", roughness: 1.0 });
  const glassWall = new THREE.MeshStandardMaterial({ color: "#1e293b", transparent: true, opacity: 0.3, roughness: 0.05, metalness: 0.9 });
  const deskMat = new THREE.MeshStandardMaterial({ color: "#11151c", roughness: 0.6 });

  const renderDetailedOfficeFloor = (f: number) => {
    return (
      <group>
        {/* VÉKONY, ELEGÁNS FÖDÉM */}
        <mesh position={[0, -0.05, 0]} castShadow receiveShadow material={floorSlab}>
          <boxGeometry args={[buildingWidth, 0.1, buildingDepth]} />
          <Edges scale={1.0} color="#1a202c" />
        </mesh>

        {/* KÖZPONTI MAG (LIFT/LÉPCSŐ) */}
        <mesh position={[0, floorHeight / 2, -2]} castShadow receiveShadow material={coreMat}>
          <boxGeometry args={[3, floorHeight, 3]} />
        </mesh>

        {/* KÜLSŐ TÖMÖR FALAK (Vékonyak: 0.1 vastagság) */}
        <mesh position={[0, floorHeight / 2, -buildingDepth/2 + 0.05]} castShadow receiveShadow material={darkWall}>
          <boxGeometry args={[buildingWidth, floorHeight, 0.1]} />
        </mesh>
        <mesh position={[-buildingWidth/2 + 0.05, floorHeight / 2, 0]} castShadow receiveShadow material={darkWall}>
          <boxGeometry args={[0.1, floorHeight, buildingDepth]} />
        </mesh>
        <mesh position={[buildingWidth/2 - 0.05, floorHeight / 2, 0]} castShadow receiveShadow material={darkWall}>
          <boxGeometry args={[0.1, floorHeight, buildingDepth]} />
        </mesh>

        {/* BELSŐ ELVÁLASZTÓ FALAK (0.1 vastagság) */}
        
        {/* Folyosó fal (Üveg) */}
        <mesh position={[-4.25, floorHeight/2, -0.5]} castShadow receiveShadow material={glassWall}>
          <boxGeometry args={[5.5, floorHeight, 0.1]} />
        </mesh>
        <mesh position={[4.25, floorHeight/2, -0.5]} castShadow receiveShadow material={glassWall}>
          <boxGeometry args={[5.5, floorHeight, 0.1]} />
        </mesh>

        {/* Irodákat elválasztó vékony falak */}
        <mesh position={[-4, floorHeight/2, 2.25]} castShadow receiveShadow material={darkWall}>
          <boxGeometry args={[0.1, floorHeight, 5.5]} />
        </mesh>
        <mesh position={[4, floorHeight/2, 2.25]} castShadow receiveShadow material={darkWall}>
          <boxGeometry args={[0.1, floorHeight, 5.5]} />
        </mesh>

        {/* Tárgyaló üvegfala elöl (hogy a folyosóról be lehessen látni) */}
        <mesh position={[0, floorHeight/2, 1.5]} castShadow receiveShadow material={glassWall}>
          <boxGeometry args={[7.9, floorHeight, 0.1]} />
        </mesh>

        {/* --- IRODABÚTOROK (Nem tömbök, hanem asztallapok és lábak) --- */}
        
        {/* Tárgyalóasztal (Középen) */}
        <group position={[0, 0, 3]}>
          <mesh position={[0, 0.75, 0]} castShadow receiveShadow material={deskMat}>
            <boxGeometry args={[3, 0.05, 1.2]} />
          </mesh>
          <mesh position={[-1.2, 0.375, 0]} castShadow receiveShadow material={deskMat}>
            <boxGeometry args={[0.1, 0.75, 0.8]} />
          </mesh>
          <mesh position={[1.2, 0.375, 0]} castShadow receiveShadow material={deskMat}>
            <boxGeometry args={[0.1, 0.75, 0.8]} />
          </mesh>
        </group>

        {/* Bal oldali iroda íróasztala */}
        <group position={[-5.5, 0, 2]}>
          <mesh position={[0, 0.75, 0]} castShadow receiveShadow material={deskMat}>
            <boxGeometry args={[1.8, 0.05, 0.8]} />
          </mesh>
          <mesh position={[-0.8, 0.375, 0]} castShadow receiveShadow material={deskMat}>
            <boxGeometry args={[0.05, 0.75, 0.7]} />
          </mesh>
          <mesh position={[0.8, 0.375, 0]} castShadow receiveShadow material={deskMat}>
            <boxGeometry args={[0.05, 0.75, 0.7]} />
          </mesh>
        </group>

        {/* Jobb oldali iroda íróasztala */}
        <group position={[5.5, 0, 2]}>
          <mesh position={[0, 0.75, 0]} castShadow receiveShadow material={deskMat}>
            <boxGeometry args={[1.8, 0.05, 0.8]} />
          </mesh>
          <mesh position={[-0.8, 0.375, 0]} castShadow receiveShadow material={deskMat}>
            <boxGeometry args={[0.05, 0.75, 0.7]} />
          </mesh>
          <mesh position={[0.8, 0.375, 0]} castShadow receiveShadow material={deskMat}>
            <boxGeometry args={[0.05, 0.75, 0.7]} />
          </mesh>
        </group>

      </group>
    );
  };

  return (
    <group ref={group} position={[0, -4, 0]}>
      
      {/* KÜLSŐ ÜVEGBUROK */}
      <group ref={facade}>
        <mesh position={[0, (floorsCount * floorHeight) / 2, 0]}>
          <boxGeometry args={[buildingWidth + 0.2, floorsCount * floorHeight + 0.2, buildingDepth + 0.2]} />
          <meshStandardMaterial color="#0B0E10" transparent opacity={0.15} roughness={0.1} metalness={0.9} depthWrite={false} />
          <Edges scale={1.0} color="#3b82f6" opacity={0.3} transparent />
        </mesh>
      </group>

      {/* RÉSZLETES IRODASZINTEK */}
      {Array.from({ length: floorsCount }).map((_, f) => (
        <group 
          key={`floor-${f}`} 
          position={[0, f * floorHeight, 0]} 
          ref={(el) => { if (el) floorRefs.current[f] = el; }}
        >
          {renderDetailedOfficeFloor(f)}
        </group>
      ))}
      
      {/* KOCKÁS ALAPRAJZ */}
      <group position={[0, -0.2, 0]}>
        <mesh rotation={[-Math.PI/2, 0, 0]} receiveShadow>
          <planeGeometry args={[buildingWidth + 10, buildingDepth + 10]} />
          <meshStandardMaterial color="#050608" roughness={1} />
        </mesh>
        <gridHelper args={[buildingWidth + 10, 30, "#1f2937", "#0B0E10"]} position={[0, 0.01, 0]} />
      </group>

    </group>
  );
}
