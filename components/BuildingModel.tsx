"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Edges } from "@react-three/drei";

gsap.registerPlugin(ScrollTrigger);

export default function BuildingModel({ activeSystem }: { activeSystem: string | null }) {
  const group = useRef<THREE.Group>(null);
  const outerWalls = useRef<THREE.Mesh>(null);
  const floors = useRef<THREE.Group>(null);
  const wireSystem = useRef<THREE.Group>(null);
  const blueprintLines = useRef<THREE.Group>(null);

  useGSAP(() => {
    if (!outerWalls.current || !floors.current || !wireSystem.current || !group.current || !blueprintLines.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.5,
      }
    });

    // Fázis 1: Épületmetszet feltárása (A külső üvegfal eltűnik)
    tl.to(outerWalls.current.material, { opacity: 0, duration: 1 }, 0)
      .fromTo(wireSystem.current.position, { y: -2 }, { y: 0, duration: 1, ease: "power2.out" }, 0)
      .to(outerWalls.current.scale, { y: 0.1, duration: 1 }, 0); // Kicsit lelapul, mintha kinyílna
      
    // Fázis 2: 3D -> 2D Tervrajz (Padlók és falak kilapulnak, blueprint vonalak megjelennek)
    tl.to(floors.current.scale, { y: 0.001, duration: 1.5 }, 1)
      .to(wireSystem.current.scale, { y: 0.001, duration: 1.5 }, 1)
      .to(blueprintLines.current.position, { y: 0.1, duration: 0.5 }, 1.5);
      
    // Fázis 3: Újra kinyílik a 3D a rendszerekhez
    tl.to(floors.current.scale, { y: 1, duration: 1.5 }, 2.5)
      .to(wireSystem.current.scale, { y: 1, duration: 1.5 }, 2.5)
      .to(blueprintLines.current.position, { y: -5, duration: 0.5 }, 2.5);
      
  }, []);

  // Színek animálása (Aktív rendszer zölden világít, többi elsötétül)
  useFrame(() => {
    if (!wireSystem.current) return;
    const targetColor = activeSystem ? new THREE.Color("#D4F568") : new THREE.Color("#D4F568");
    const targetEmissive = activeSystem ? 2.0 : 0.2;
    
    wireSystem.current.children.forEach((child: any) => {
      if (child.material) {
        // Ha van kiválasztott rendszer, és ez nem az, akkor halványítjuk
        if (activeSystem && child.userData.system !== activeSystem && child.userData.system !== "all") {
          child.material.emissiveIntensity = THREE.MathUtils.lerp(child.material.emissiveIntensity, 0.0, 0.1);
          child.material.opacity = THREE.MathUtils.lerp(child.material.opacity, 0.1, 0.1);
        } else {
          child.material.color.lerp(targetColor, 0.1);
          child.material.emissiveIntensity = THREE.MathUtils.lerp(child.material.emissiveIntensity, targetEmissive, 0.1);
          child.material.opacity = THREE.MathUtils.lerp(child.material.opacity, 1, 0.1);
        }
      }
    });
  });

  return (
    <group ref={group} position={[0, 0, 0]}>
      {/* Outer Shell - Glassy Premium Look */}
      <mesh ref={outerWalls} position={[0, 4, 0]}>
        <boxGeometry args={[8, 8, 8]} />
        <meshPhysicalMaterial 
          color="#151B1F" 
          transparent 
          opacity={0.85} 
          roughness={0.1}
          metalness={0.9}
          clearcoat={1}
          transmission={0.5}
        />
        <Edges scale={1.001} threshold={15} color="#8D989F" />
      </mesh>

      {/* Inner Floors */}
      <group ref={floors}>
        {[0, 2, 4, 6].map((y) => (
          <mesh key={`floor-${y}`} position={[0, y, 0]} castShadow receiveShadow>
            <boxGeometry args={[7.8, 0.2, 7.8]} />
            <meshStandardMaterial color="#151B1F" roughness={0.8} metalness={0.2} />
            <Edges scale={1.001} threshold={15} color="#8D989F" />
          </mesh>
        ))}
      </group>

      {/* Internal Electrical Systems (Glowing Wires) */}
      <group ref={wireSystem}>
        {/* Fő Felszálló ág (Energieverteilung) */}
        <mesh position={[-2, 3, -2]} userData={{ system: "Energieverteilung" }}>
          <cylinderGeometry args={[0.1, 0.1, 8]} />
          <meshStandardMaterial color="#D4F568" emissive="#D4F568" emissiveIntensity={0.5} toneMapped={false} transparent />
        </mesh>
        
        {/* Világítás (Beleuchtung) - Plafonokon lévő rácsok */}
        {[1.9, 3.9, 5.9].map((y, i) => (
          <group key={`light-${i}`} position={[0, y, 0]} userData={{ system: "Beleuchtung" }}>
            <mesh position={[0, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
              <ringGeometry args={[1, 1.1, 32]} />
              <meshStandardMaterial color="#D4F568" emissive="#D4F568" emissiveIntensity={0.5} toneMapped={false} transparent side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))}

        {/* Dugaljak / Kábelek (Steckdosen und Stromkreise) */}
        {[0.1, 2.1, 4.1].map((y, i) => (
          <mesh key={`plug-${i}`} position={[0, y, 2]} rotation={[0, 0, Math.PI/2]} userData={{ system: "Steckdosen und Stromkreise" }}>
            <cylinderGeometry args={[0.05, 0.05, 6]} />
            <meshStandardMaterial color="#D4F568" emissive="#D4F568" emissiveIntensity={0.5} toneMapped={false} transparent />
          </mesh>
        ))}
      </group>
      
      {/* Blueprint Grid Lines (csak felülnézetben jelenik meg GSAP-pal) */}
      <group ref={blueprintLines} position={[0, -5, 0]}>
        <mesh rotation={[-Math.PI/2, 0, 0]}>
          <planeGeometry args={[10, 10]} />
          <meshBasicMaterial color="#D4F568" wireframe transparent opacity={0.3} />
        </mesh>
      </group>
    </group>
  );
}
