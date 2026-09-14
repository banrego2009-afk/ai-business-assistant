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
  
  // Építészeti paraméterek
  const floorsCount = 5;
  const floorHeight = 3.5;
  const buildingWidth = 14;
  const buildingDepth = 10;
  const coreSize = 3.5;

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

    // Fázis 1: A külső homlokzat/üvegburok felemelkedik és eltűnik
    tl.to(facade.current.position, { y: 20, duration: 1.5, ease: "power2.inOut" }, 0)
      .to(facade.current.children.map((c: THREE.Object3D) => (c as THREE.Mesh).material), { opacity: 0, duration: 1 }, 0.2);

    // Fázis 2: Robbantott ábra - A szintek építészeti szétnyílása
    floorRefs.current.forEach((floor, index) => {
      if (floor) {
        tl.to(floor.position, { 
          y: index * (floorHeight * 1.8), // Szépen, arányosan szétnyílik
          duration: 1.5, 
          ease: "power2.inOut" 
        }, 0.2); // Kicsit később indul, miután a burok elkezdett felemelkedni
      }
    });

    // Fázis 3: 2D alaprajzi nézet (kilapulás)
    floorRefs.current.forEach((floor) => {
      if (floor) {
        tl.to(floor.scale, { y: 0.001, duration: 1.5 }, 1.5);
      }
    });

    // Fázis 4: Visszaállás 3D-be
    floorRefs.current.forEach((floor) => {
      if (floor) {
        tl.to(floor.scale, { y: 1, duration: 1.5 }, 3);
      }
    });

  }, []);

  // Elegáns, sötét, matt építészeti anyag
  const darkMaterial = new THREE.MeshStandardMaterial({
    color: "#0F1115", // Mély fekete/grafit
    roughness: 0.8,
    metalness: 0.2,
  });

  const coreMaterial = new THREE.MeshStandardMaterial({
    color: "#0a0c0e", // Még sötétebb matt fekete a magnak
    roughness: 0.9,
    metalness: 0.1,
  });

  return (
    <group ref={group} position={[0, -4, 0]}>
      
      {/* KÜLSŐ ÜVEGBUROK (Ami az elején egyben tartja, majd felszáll) */}
      <group ref={facade}>
        <mesh position={[0, (floorsCount * floorHeight) / 2, 0]}>
          <boxGeometry args={[buildingWidth + 0.4, floorsCount * floorHeight + 0.2, buildingDepth + 0.4]} />
          <meshStandardMaterial 
            color="#111820" 
            transparent 
            opacity={0.3} 
            roughness={0.1}
            metalness={0.9}
            depthWrite={false}
          />
          <Edges scale={1.0} color="#1f2937" opacity={0.5} transparent />
        </mesh>
      </group>

      {/* STRUKTURÁLIS SZINTEK (Valódi építészeti elemek, nem csak lapok) */}
      {Array.from({ length: floorsCount }).map((_, f) => (
        <group 
          key={`floor-${f}`} 
          position={[0, f * floorHeight, 0]} 
          ref={(el) => { if (el) floorRefs.current[f] = el; }}
        >
          {/* Födém (Vastag betonlemez) */}
          <mesh position={[0, 0, 0]} castShadow receiveShadow material={darkMaterial}>
            <boxGeometry args={[buildingWidth, 0.4, buildingDepth]} />
            <Edges scale={1.001} threshold={15} color="#2d3748" />
          </mesh>

          {/* Központi teherhordó mag (Lift/Lépcsőház) */}
          <mesh position={[0, floorHeight / 2, -1]} castShadow receiveShadow material={coreMaterial}>
            <boxGeometry args={[coreSize, floorHeight, coreSize]} />
            <Edges scale={1.001} threshold={15} color="#1a202c" />
          </mesh>

          {/* Hátsó tömör fal */}
          <mesh position={[0, floorHeight / 2, -buildingDepth/2 + 0.2]} castShadow receiveShadow material={darkMaterial}>
            <boxGeometry args={[buildingWidth, floorHeight, 0.4]} />
          </mesh>

          {/* Bal oldali tömör fal (L-alakú struktúrát alkot a hátsó fallal) */}
          <mesh position={[-buildingWidth/2 + 0.2, floorHeight / 2, 0]} castShadow receiveShadow material={darkMaterial}>
            <boxGeometry args={[0.4, floorHeight, buildingDepth]} />
          </mesh>
          
          {/* Tartóoszlop a jobb első sarokban (hogy tágas és nyitott legyen a terasz) */}
          <mesh position={[buildingWidth/2 - 0.4, floorHeight / 2, buildingDepth/2 - 0.4]} castShadow receiveShadow material={darkMaterial}>
            <boxGeometry args={[0.8, floorHeight, 0.8]} />
          </mesh>

          {/* Belső dizájn / Térválasztó az irodatérben */}
          {f !== 0 && ( // A földszint egyterű lobby
            <mesh position={[3, floorHeight / 2, 1]} castShadow receiveShadow material={darkMaterial}>
              <boxGeometry args={[4, floorHeight, 0.2]} />
            </mesh>
          )}

        </group>
      ))}
      
      {/* Kockás alaprajz háttér, ami csak szétnyíláskor kap hangsúlyt */}
      <group position={[0, -0.2, 0]}>
        <mesh rotation={[-Math.PI/2, 0, 0]} receiveShadow>
          <planeGeometry args={[buildingWidth + 10, buildingDepth + 10]} />
          <meshStandardMaterial color="#0B0E10" roughness={1} />
        </mesh>
        <gridHelper args={[buildingWidth + 10, 30, "#1f2937", "#111518"]} position={[0, 0.01, 0]} />
      </group>

    </group>
  );
}
