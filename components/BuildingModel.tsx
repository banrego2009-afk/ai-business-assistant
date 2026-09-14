"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Edges } from "@react-three/drei";

gsap.registerPlugin(ScrollTrigger);

export default function BuildingModel({ activeSystem }: { activeSystem: string | null }) {
  const group = useRef<THREE.Group>(null);
  const facade = useRef<THREE.Group>(null);
  const coreAndStructure = useRef<THREE.Group>(null);
  const wireSystem = useRef<THREE.Group>(null);
  const blueprintLines = useRef<THREE.Group>(null);

  // Épület paraméterek
  const floors = 5;
  const floorHeight = 1.5;
  const buildingWidth = 10;
  const buildingDepth = 8;
  const coreWidth = 3;
  const coreDepth = 3;

  useGSAP(() => {
    if (!facade.current || !coreAndStructure.current || !wireSystem.current || !group.current || !blueprintLines.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.5,
      }
    });

    // Fázis 1: Épületmetszet feltárása (A külső üvegfal eltűnik, feltárul a mag és a kábelezés)
    tl.to(facade.current.children.map((c: any) => c.material), { opacity: 0, duration: 1 }, 0)
      .to(facade.current.scale, { y: 0.8, duration: 1 }, 0)
      
    // Fázis 2: 3D -> 2D Tervrajz (A szerkezet kilapul, drótvázas tervrajzzá válik)
    tl.to(coreAndStructure.current.scale, { y: 0.001, duration: 1.5 }, 1)
      .to(wireSystem.current.scale, { y: 0.001, duration: 1.5 }, 1)
      .to(blueprintLines.current.position, { y: 0.1, duration: 0.5 }, 1.5);
      
    // Fázis 3: Újra kinyílik a 3D a rendszerek interaktív részletezéséhez
    tl.to(coreAndStructure.current.scale, { y: 1, duration: 1.5 }, 2.5)
      .to(wireSystem.current.scale, { y: 1, duration: 1.5 }, 2.5)
      .to(blueprintLines.current.position, { y: -5, duration: 0.5 }, 2.5);
      
  }, []);

  // Színek animálása (Aktív rendszer zölden világít, többi elsötétül)
  useFrame(() => {
    if (!wireSystem.current) return;
    const targetColor = new THREE.Color("#D4F568");
    
    wireSystem.current.children.forEach((child: any) => {
      if (child.material && child.userData.system) {
        const isActive = activeSystem === child.userData.system;
        const isNoneActive = activeSystem === null;
        
        const targetEmissive = isActive ? 2.5 : (isNoneActive ? 0.5 : 0.1);
        const targetOpacity = isActive ? 1.0 : (isNoneActive ? 0.6 : 0.1);

        child.material.color.lerp(targetColor, 0.1);
        child.material.emissiveIntensity = THREE.MathUtils.lerp(child.material.emissiveIntensity, targetEmissive, 0.1);
        child.material.opacity = THREE.MathUtils.lerp(child.material.opacity, targetOpacity, 0.1);
      }
    });
  });

  // Előre generált oszlopok a szélekre
  const columns = useMemo(() => {
    const cols = [];
    for (let x = -buildingWidth/2 + 0.2; x <= buildingWidth/2 - 0.2; x += 3.2) {
      for (let z = -buildingDepth/2 + 0.2; z <= buildingDepth/2 - 0.2; z += 3.8) {
        if (Math.abs(x) > coreWidth/2 || Math.abs(z) > coreDepth/2) {
          cols.push([x, z]);
        }
      }
    }
    return cols;
  }, []);

  return (
    <group ref={group} position={[0, -2, 0]}>
      
      {/* 1. ÜVEG HOMLOKZAT (Eltűnik az első görgetésnél) */}
      <group ref={facade}>
        {Array.from({ length: floors }).map((_, i) => (
          <mesh key={`glass-${i}`} position={[0, i * floorHeight + floorHeight/2, 0]}>
            <boxGeometry args={[buildingWidth - 0.1, floorHeight - 0.1, buildingDepth - 0.1]} />
            <meshPhysicalMaterial 
              color="#0B0E10" 
              transparent 
              opacity={0.8} 
              roughness={0.05}
              metalness={0.9}
              transmission={0.4}
              clearcoat={1.0}
            />
            <Edges scale={1.001} threshold={15} color="#8D989F" />
          </mesh>
        ))}
      </group>

      {/* 2. SZERKEZET (Beton mag, födémek, oszlopok) */}
      <group ref={coreAndStructure}>
        {/* Lépcsőház / Lift mag */}
        <mesh position={[0, (floors * floorHeight) / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[coreWidth, floors * floorHeight, coreDepth]} />
          <meshStandardMaterial color="#151B1F" roughness={0.9} metalness={0.1} />
        </mesh>
        
        {/* Födémek */}
        {Array.from({ length: floors + 1 }).map((_, i) => (
          <mesh key={`slab-${i}`} position={[0, i * floorHeight, 0]} castShadow receiveShadow>
            <boxGeometry args={[buildingWidth, 0.15, buildingDepth]} />
            <meshStandardMaterial color="#1A2024" roughness={0.8} />
            <Edges scale={1.001} threshold={15} color="#4a5568" />
          </mesh>
        ))}

        {/* Tartóoszlopok */}
        {columns.map((pos, idx) => (
          <mesh key={`col-${idx}`} position={[pos[0], (floors * floorHeight) / 2, pos[1]]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, floors * floorHeight, 8]} />
            <meshStandardMaterial color="#111518" roughness={0.8} />
          </mesh>
        ))}
        
        {/* Tető gépészet (HVAC) */}
        <mesh position={[-2, floors * floorHeight + 0.3, -1]} castShadow>
          <boxGeometry args={[1.5, 0.6, 2]} />
          <meshStandardMaterial color="#2D3748" />
        </mesh>
        <mesh position={[2, floors * floorHeight + 0.2, 1.5]} castShadow>
          <boxGeometry args={[1, 0.4, 1]} />
          <meshStandardMaterial color="#2D3748" />
        </mesh>
      </group>

      {/* 3. ELEKTROMOS RENDSZEREK (Világító csövek és hálózatok) */}
      <group ref={wireSystem}>
        
        {/* Felszálló fővezeték (Energieverteilung) - A mag mellett fut */}
        <mesh position={[coreWidth/2 + 0.2, (floors * floorHeight) / 2, 0]} userData={{ system: "Energieverteilung" }}>
          <cylinderGeometry args={[0.08, 0.08, floors * floorHeight]} />
          <meshStandardMaterial color="#D4F568" emissive="#D4F568" emissiveIntensity={0.5} toneMapped={false} transparent />
        </mesh>
        <mesh position={[-coreWidth/2 - 0.2, (floors * floorHeight) / 2, 0]} userData={{ system: "Energieverteilung" }}>
          <cylinderGeometry args={[0.08, 0.08, floors * floorHeight]} />
          <meshStandardMaterial color="#D4F568" emissive="#D4F568" emissiveIntensity={0.5} toneMapped={false} transparent />
        </mesh>

        {/* Szintenkénti világítás és kábelezés */}
        {Array.from({ length: floors }).map((_, f) => (
          <group key={`sys-${f}`} position={[0, f * floorHeight + floorHeight - 0.1, 0]}>
            
            {/* Beleuchtung (Világítás rács) */}
            <mesh position={[0, -0.05, 0]} rotation={[Math.PI/2, 0, 0]} userData={{ system: "Beleuchtung" }}>
              <planeGeometry args={[buildingWidth - 2, buildingDepth - 2]} />
              <meshBasicMaterial color="#D4F568" wireframe transparent opacity={0.4} />
            </mesh>

            {/* Steckdosen und Stromkreise (Dugaljak áramkörei - fal menti kábelek) */}
            <mesh position={[0, -0.5, buildingDepth/2 - 0.2]} rotation={[0, 0, Math.PI/2]} userData={{ system: "Steckdosen und Stromkreise" }}>
              <cylinderGeometry args={[0.03, 0.03, buildingWidth - 1]} />
              <meshStandardMaterial color="#D4F568" emissive="#D4F568" emissiveIntensity={0.5} toneMapped={false} transparent />
            </mesh>
            
            {/* Gebäudeautomation (Vezérlés) - Főelosztótól ágazik szét */}
            <mesh position={[coreWidth/2 + 0.2, -0.3, 0]} rotation={[Math.PI/2, 0, 0]} userData={{ system: "Steuerung und Gebäudeautomation" }}>
              <cylinderGeometry args={[0.02, 0.02, 4]} />
              <meshStandardMaterial color="#D4F568" emissive="#D4F568" emissiveIntensity={0.5} toneMapped={false} transparent />
            </mesh>
            
            {/* Sicherheits- und Beschallungssysteme (Biztonság - Körbefutó pirosas/lime vékony vonal) */}
            <mesh position={[0, -0.2, 0]} rotation={[Math.PI/2, 0, 0]} userData={{ system: "Sicherheits- und Beschallungssysteme" }}>
              <ringGeometry args={[coreWidth, coreWidth + 0.1, 4]} />
              <meshStandardMaterial color="#D4F568" emissive="#D4F568" emissiveIntensity={0.5} toneMapped={false} transparent side={THREE.DoubleSide} />
            </mesh>

          </group>
        ))}
      </group>
      
      {/* 4. Tervrajz (Csak 2D nézetben jelenik meg GSAP-pal) */}
      <group ref={blueprintLines} position={[0, -5, 0]}>
        <mesh rotation={[-Math.PI/2, 0, 0]}>
          <planeGeometry args={[15, 15]} />
          <meshBasicMaterial color="#D4F568" wireframe transparent opacity={0.15} />
        </mesh>
      </group>
    </group>
  );
}
