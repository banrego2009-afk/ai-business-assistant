"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Edges } from "@react-three/drei";

gsap.registerPlugin(ScrollTrigger);

// Egy egyszerű komponens, ami az áramlást szimulálja a vezetékek mentén (mozgó fénygömbök)
function CurrentFlow({ pathLength, count, speed, color, axis = 'y', active }: { pathLength: number, count: number, speed: number, color: string, axis?: 'x'|'y'|'z', active: boolean }) {
  const particles = useRef<THREE.InstancedMesh>(null);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const offsets = useMemo(() => Array.from({ length: count }, () => Math.random() * pathLength), [count, pathLength]);

  useFrame((state) => {
    if (!particles.current) return;
    
    // Csak akkor mozogjanak gyorsan, ha aktív a rendszer (vagy mindegyik aktív, ha nincs kiválasztva semmi)
    const currentSpeed = active ? speed : speed * 0.2;
    const time = state.clock.elapsedTime * currentSpeed;

    for (let i = 0; i < count; i++) {
      let pos = (offsets[i] + time) % pathLength;
      pos = pos - pathLength / 2; // Középre igazítás

      dummy.position.set(
        axis === 'x' ? pos : 0,
        axis === 'y' ? pos : 0,
        axis === 'z' ? pos : 0
      );
      dummy.updateMatrix();
      particles.current.setMatrixAt(i, dummy.matrix);
    }
    particles.current.instanceMatrix.needsUpdate = true;
    
    // Fényerő pulzálás
    if (particles.current.material) {
      (particles.current.material as THREE.MeshStandardMaterial).emissiveIntensity = active ? 4 + Math.sin(state.clock.elapsedTime * 10) * 2 : 0.5;
    }
  });

  return (
    <instancedMesh ref={particles} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.06, 8, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} toneMapped={false} transparent opacity={active ? 1 : 0.2} />
    </instancedMesh>
  );
}

export default function BuildingModel({ activeSystem }: { activeSystem: string | null }) {
  const group = useRef<THREE.Group>(null);
  const facade = useRef<THREE.Group>(null);
  const coreAndStructure = useRef<THREE.Group>(null);
  const wireSystem = useRef<THREE.Group>(null);
  const blueprintLines = useRef<THREE.Group>(null);
  
  // Szintek referenciái a robbantott ábrához (Exploded View)
  const floorRefs = useRef<THREE.Group[]>([]);

  // Épület paraméterek
  const floorsCount = 6;
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

    // Fázis 1: RÖNTGEN ÉS ROBBANTOTT ÁBRA (Exploded View)
    // A homlokzat felemelkedik és elhalványul
    tl.to(facade.current.position, { y: 10, duration: 1.5, ease: "power2.inOut" }, 0)
      .to(facade.current.children.map((c: any) => c.material), { opacity: 0, duration: 1 }, 0.5);
      
    // A szintek (födémek + rajtuk lévő rendszerek) eltávolodnak egymástól függőlegesen
    floorRefs.current.forEach((floor, index) => {
      if (floor) {
        tl.to(floor.position, { 
          y: index * (floorHeight * 1.8), // Szétnyílnak
          duration: 1.5, 
          ease: "power2.inOut" 
        }, 0);
      }
    });

    // Fázis 2: 3D -> 2D TERVRAJZ
    // Az egész épület magassága kilapul
    tl.to(coreAndStructure.current.scale, { y: 0.001, duration: 1.5 }, 1.5)
      .to(wireSystem.current.scale, { y: 0.001, duration: 1.5 }, 1.5)
      .to(blueprintLines.current.position, { y: 0.1, duration: 0.5 }, 2);
      
    // Fázis 3: VISSZATÉRÉS 3D-be A RENDSZERBEMUTATÓHOZ
    // A robbantott ábra állapota (szétnyitott szintek) tér vissza
    tl.to(coreAndStructure.current.scale, { y: 1, duration: 1.5 }, 3)
      .to(wireSystem.current.scale, { y: 1, duration: 1.5 }, 3)
      .to(blueprintLines.current.position, { y: -5, duration: 0.5 }, 3);
      
  }, []);

  // Színek animálása (Aktív rendszer zölden világít, többi elsötétül)
  useFrame(() => {
    if (!wireSystem.current) return;
    const targetColor = new THREE.Color("#D4F568");
    
    wireSystem.current.children.forEach((floorGroup: any) => {
      floorGroup.children.forEach((child: any) => {
        if (child.material && child.userData.system) {
          const isActive = activeSystem === child.userData.system;
          const isNoneActive = activeSystem === null;
          
          const targetEmissive = isActive ? 3.0 : (isNoneActive ? 1.0 : 0.05);
          const targetOpacity = isActive ? 1.0 : (isNoneActive ? 0.6 : 0.05);

          child.material.color.lerp(targetColor, 0.1);
          child.material.emissiveIntensity = THREE.MathUtils.lerp(child.material.emissiveIntensity, targetEmissive, 0.1);
          child.material.opacity = THREE.MathUtils.lerp(child.material.opacity, targetOpacity, 0.1);
        }
      });
    });
  });

  const isSysActive = (sys: string) => activeSystem === null || activeSystem === sys;

  return (
    <group ref={group} position={[0, -3, 0]}>
      
      {/* 1. RÖNTGEN HOMLOKZAT (Holografikus üveg hatás) */}
      <group ref={facade}>
        <mesh position={[0, (floorsCount * floorHeight) / 2, 0]}>
          <boxGeometry args={[buildingWidth + 0.2, floorsCount * floorHeight + 0.2, buildingDepth + 0.2]} />
          <meshPhysicalMaterial 
            color="#080e14" 
            transparent 
            opacity={0.3} 
            roughness={0.1}
            metalness={0.8}
            transmission={0.9}
            ior={1.2}
            thickness={0.5}
          />
          <Edges scale={1.0} threshold={15} color="#3b82f6" opacity={0.5} transparent />
        </mesh>
      </group>

      {/* 2 & 3. SZERKEZET ÉS ELEKTROMOSSÁG (Szintenként csoportosítva a robbantott ábrához) */}
      <group ref={coreAndStructure}>
        <group ref={wireSystem}>
          
          {/* Központi Lift/Lépcső Mag - Nem robban szét, fix marad */}
          <mesh position={[0, (floorsCount * floorHeight) / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[coreWidth, floorsCount * floorHeight, coreDepth]} />
            <meshStandardMaterial color="#0B0E10" roughness={0.9} metalness={0.2} transparent opacity={0.8} />
            <Edges scale={1.001} threshold={15} color="#1f2937" />
          </mesh>

          {/* Központi Felszálló Fővezeték (Energieverteilung) */}
          <group userData={{ system: "Energieverteilung" }} position={[coreWidth/2 + 0.3, (floorsCount * floorHeight) / 2, 0]}>
            <cylinderGeometry args={[0.1, 0.1, floorsCount * floorHeight]} />
            <meshStandardMaterial color="#D4F568" emissive="#D4F568" emissiveIntensity={1} toneMapped={false} transparent />
            <CurrentFlow pathLength={floorsCount * floorHeight} count={15} speed={2} color="#ffffff" axis="y" active={isSysActive("Energieverteilung")} />
          </group>

          {/* Szintek (Födémek és a rajtuk lévő rendszerek) */}
          {Array.from({ length: floorsCount }).map((_, f) => (
            <group 
              key={`floor-${f}`} 
              position={[0, f * floorHeight, 0]} 
              ref={(el) => { if (el) floorRefs.current[f] = el; }}
            >
              {/* Födém */}
              <mesh position={[0, 0, 0]} castShadow receiveShadow>
                <boxGeometry args={[buildingWidth, 0.1, buildingDepth]} />
                <meshStandardMaterial color="#111518" roughness={0.9} />
                <Edges scale={1.001} threshold={15} color="#1f2937" />
              </mesh>

              {/* Rendszerek a födémen */}
              
              {/* Világítás (Beleuchtung) - Plafonon, tehát egy szinttel feljebb mutat */}
              <group position={[0, floorHeight - 0.2, 0]} userData={{ system: "Beleuchtung" }}>
                {/* Rácsvezeték */}
                <mesh rotation={[Math.PI/2, 0, 0]}>
                  <planeGeometry args={[buildingWidth - 2, buildingDepth - 2]} />
                  <meshBasicMaterial color="#D4F568" wireframe transparent opacity={0.2} />
                </mesh>
                {/* Lámpatestek */}
                {[-3, 0, 3].map(x => [-2, 0, 2].map(z => (
                  <mesh key={`l-${x}-${z}`} position={[x, 0, z]} rotation={[Math.PI/2, 0, 0]}>
                    <ringGeometry args={[0.2, 0.3, 16]} />
                    <meshStandardMaterial color="#ffffff" emissive="#D4F568" emissiveIntensity={2} toneMapped={false} transparent />
                  </mesh>
                )))}
              </group>

              {/* Dugaljak / Áramkörök (Steckdosen und Stromkreise) - Falak mentén futó áramlás */}
              <group position={[0, 0.2, buildingDepth/2 - 0.4]} rotation={[0, 0, Math.PI/2]} userData={{ system: "Steckdosen und Stromkreise" }}>
                <cylinderGeometry args={[0.04, 0.04, buildingWidth - 2]} />
                <meshStandardMaterial color="#D4F568" emissive="#D4F568" emissiveIntensity={0.5} toneMapped={false} transparent />
                <CurrentFlow pathLength={buildingWidth - 2} count={8} speed={1.5} color="#D4F568" axis="y" active={isSysActive("Steckdosen und Stromkreise")} />
              </group>
              
              {/* Épületautomatizálás (Steuerung) - Kisebb adatközpontok/elosztók a mag mellett */}
              <group position={[coreWidth/2 + 0.8, 0.3, -1]} userData={{ system: "Steuerung und Gebäudeautomation" }}>
                <mesh>
                  <boxGeometry args={[0.4, 0.6, 0.3]} />
                  <meshStandardMaterial color="#D4F568" emissive="#D4F568" emissiveIntensity={1.5} toneMapped={false} transparent />
                </mesh>
                {/* Adatáramlás a földön kifelé */}
                <group position={[1.5, -0.2, 0]} rotation={[0, 0, Math.PI/2]}>
                  <CurrentFlow pathLength={3} count={5} speed={3} color="#fff" axis="y" active={isSysActive("Steuerung und Gebäudeautomation")} />
                </group>
              </group>
              
              {/* Biztonsági rendszerek (Sicherheits- und Beschallungssysteme) - Mag körül futó tiszta vonal */}
              <group position={[0, 0.1, 0]} rotation={[Math.PI/2, 0, 0]} userData={{ system: "Sicherheits- und Beschallungssysteme" }}>
                <mesh>
                  <ringGeometry args={[coreWidth/2 + 0.2, coreWidth/2 + 0.3, 4]} />
                  <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} toneMapped={false} transparent side={THREE.DoubleSide} />
                </mesh>
              </group>

            </group>
          ))}
        </group>
      </group>
      
      {/* 4. Tervrajz (Csak 2D nézetben jelenik meg GSAP-pal) */}
      <group ref={blueprintLines} position={[0, -5, 0]}>
        <mesh rotation={[-Math.PI/2, 0, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshBasicMaterial color="#D4F568" wireframe transparent opacity={0.2} />
        </mesh>
        <gridHelper args={[30, 30, "#3b82f6", "#1f2937"]} position={[0, -0.1, 0]} />
      </group>
    </group>
  );
}
