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
  const floorHeight = 3.5;
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

    // 1. Homlokzat eltűnik
    tl.to(facade.current.position, { y: 20, duration: 1.5, ease: "power2.inOut" }, 0)
      .to(facade.current.children.map((c: THREE.Object3D) => (c as THREE.Mesh).material), { opacity: 0, duration: 1 }, 0.2);

    // 2. Szintek szétnyílnak
    floorRefs.current.forEach((floor, index) => {
      if (floor) {
        tl.to(floor.position, { 
          y: index * (floorHeight * 1.8),
          duration: 1.5, 
          ease: "power2.inOut" 
        }, 0.2);
      }
    });

    // 3. Tervrajz kilapulás
    floorRefs.current.forEach((floor) => {
      if (floor) {
        tl.to(floor.scale, { y: 0.001, duration: 1.5 }, 1.5);
      }
    });

    // 4. Visszaállás
    floorRefs.current.forEach((floor) => {
      if (floor) {
        tl.to(floor.scale, { y: 1, duration: 1.5 }, 3);
      }
    });
  }, []);

  // -- ANYAGOK --
  const darkWall = new THREE.MeshStandardMaterial({ color: "#0F1115", roughness: 0.9, metalness: 0.1 });
  const floorSlab = new THREE.MeshStandardMaterial({ color: "#0a0c0e", roughness: 0.8 });
  const coreMat = new THREE.MeshStandardMaterial({ color: "#050608", roughness: 0.9 });
  const glassWall = new THREE.MeshStandardMaterial({ color: "#1e293b", transparent: true, opacity: 0.4, roughness: 0.1, metalness: 0.8 });
  const deskMat = new THREE.MeshStandardMaterial({ color: "#1f2937", roughness: 0.7 });

  // Egy részletes irodaszint generálása
  const renderDetailedOfficeFloor = (f: number) => {
    return (
      <group>
        {/* Födém */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow material={floorSlab}>
          <boxGeometry args={[buildingWidth, 0.4, buildingDepth]} />
          <Edges scale={1.001} threshold={15} color="#1a202c" />
        </mesh>

        {/* Központi mag (Lift/Lépcső) */}
        <mesh position={[0, floorHeight / 2, -1.5]} castShadow receiveShadow material={coreMat}>
          <boxGeometry args={[3, floorHeight, 3]} />
        </mesh>

        {/* --- KÜLSŐ TÖMÖR FALAK --- */}
        {/* Hátsó fal */}
        <mesh position={[0, floorHeight / 2, -buildingDepth/2 + 0.2]} castShadow receiveShadow material={darkWall}>
          <boxGeometry args={[buildingWidth, floorHeight, 0.4]} />
        </mesh>
        {/* Jobb oldali fal */}
        <mesh position={[buildingWidth/2 - 0.2, floorHeight / 2, 0]} castShadow receiveShadow material={darkWall}>
          <boxGeometry args={[0.4, floorHeight, buildingDepth]} />
        </mesh>

        {/* --- BELSŐ SZOBA KIOSZTÁS --- */}
        
        {/* 1. Bal oldali zárt irodák (Vezetői irodák üvegfallal a folyosó felé) */}
        {/* Fal ami elválasztja a két irodát */}
        <mesh position={[-buildingWidth/2 + 3.5, floorHeight / 2, 1]} castShadow receiveShadow material={darkWall}>
          <boxGeometry args={[7, floorHeight, 0.2]} />
        </mesh>
        {/* Üvegfal a folyosó felé */}
        <mesh position={[-3, floorHeight / 2, -0.5]} castShadow receiveShadow material={glassWall}>
          <boxGeometry args={[0.1, floorHeight, 8]} />
        </mesh>
        
        {/* Íróasztalok a zárt irodákban */}
        <mesh position={[-5, 0.6, 2.5]} castShadow receiveShadow material={deskMat}>
          <boxGeometry args={[2, 0.8, 1]} />
        </mesh>
        <mesh position={[-5, 0.6, -2.5]} castShadow receiveShadow material={deskMat}>
          <boxGeometry args={[2, 0.8, 1]} />
        </mesh>


        {/* 2. Jobb oldali Open Office (Egyterű munkaállomások) */}
        {/* Csoport 1 */}
        <mesh position={[3.5, 0.6, 2.5]} castShadow receiveShadow material={deskMat}>
          <boxGeometry args={[2.5, 0.8, 1.5]} />
        </mesh>
        {/* Csoport 2 */}
        <mesh position={[3.5, 0.6, -0.5]} castShadow receiveShadow material={deskMat}>
          <boxGeometry args={[2.5, 0.8, 1.5]} />
        </mesh>


        {/* 3. Tárgyalóterem (Elöl, középen) */}
        <mesh position={[0, floorHeight / 2, 3]} castShadow receiveShadow material={glassWall}>
          <boxGeometry args={[6, floorHeight, 0.1]} />
        </mesh>
        {/* Tárgyalóasztal */}
        <mesh position={[0, 0.6, 3.5]} castShadow receiveShadow material={deskMat}>
          <boxGeometry args={[4, 0.8, 1.2]} />
        </mesh>

        {/* 4. Oszlopok a szerkezeti stabilitásért (Nyitott saroknál) */}
        <mesh position={[-buildingWidth/2 + 0.4, floorHeight / 2, buildingDepth/2 - 0.4]} castShadow receiveShadow material={darkWall}>
          <cylinderGeometry args={[0.3, 0.3, floorHeight, 16]} />
        </mesh>
        <mesh position={[-buildingWidth/2 + 0.4, floorHeight / 2, buildingDepth/2 - 4.4]} castShadow receiveShadow material={darkWall}>
          <cylinderGeometry args={[0.3, 0.3, floorHeight, 16]} />
        </mesh>

      </group>
    );
  };

  return (
    <group ref={group} position={[0, -4, 0]}>
      
      {/* KÜLSŐ ÜVEGBUROK */}
      <group ref={facade}>
        <mesh position={[0, (floorsCount * floorHeight) / 2, 0]}>
          <boxGeometry args={[buildingWidth + 0.4, floorsCount * floorHeight + 0.2, buildingDepth + 0.4]} />
          <meshStandardMaterial color="#0B0E10" transparent opacity={0.2} roughness={0.1} metalness={0.9} depthWrite={false} />
          <Edges scale={1.0} color="#1f2937" opacity={0.5} transparent />
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
