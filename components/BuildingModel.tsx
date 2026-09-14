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
  const facade = useRef<THREE.Group>(null);
  const coreAndStructure = useRef<THREE.Group>(null);
  const wireSystem = useRef<THREE.Group>(null);
  const blueprintLines = useRef<THREE.Group>(null);
  
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

    // Fázis 1: RÖNTGEN ÉS ROBBANTOTT ÁBRA (A homlokzat felhúzódik, a szintek dinamikusan szétnyílnak)
    tl.to(facade.current.position, { y: 15, duration: 1.5, ease: "power2.inOut" }, 0)
      .to(facade.current.children.map((c: THREE.Object3D) => (c as THREE.Mesh).material), { opacity: 0, duration: 1 }, 0.2);
      
    // Robbantott ábra - Szintek eltávolodása egymástól Y tengelyen
    floorRefs.current.forEach((floor, index) => {
      if (floor) {
        tl.to(floor.position, { 
          y: index * (floorHeight * 2.2), // Erőteljesebb szétnyílás, hogy átlátható legyen
          duration: 1.5, 
          ease: "power2.inOut" 
        }, 0);
      }
    });

    // Fázis 2: 3D -> 2D TERVRAJZ (Lejön a kockás háttérre, minden kilapul)
    tl.to(coreAndStructure.current.scale, { y: 0.001, duration: 1.5 }, 1.5)
      .to(wireSystem.current.scale, { y: 0.001, duration: 1.5 }, 1.5)
      .to(blueprintLines.current.position, { y: 0.1, duration: 0.5 }, 1.8);
      
    // Fázis 3: VISSZATÉRÉS 3D-be A RENDSZERBEMUTATÓHOZ
    tl.to(coreAndStructure.current.scale, { y: 1, duration: 1.5 }, 3)
      .to(wireSystem.current.scale, { y: 1, duration: 1.5 }, 3)
      .to(blueprintLines.current.position, { y: -5, duration: 0.5 }, 3);
      
  }, []);

  // Színek animálása (Aktív rendszer zölden/kéken világít, többi elhalványul)
  useFrame(() => {
    if (!wireSystem.current) return;
    
    wireSystem.current.children.forEach((floorGroup: THREE.Object3D) => {
      floorGroup.children.forEach((child: THREE.Object3D) => {
        const mesh = child as THREE.Mesh;
        if (mesh.material && mesh.userData.system) {
          const isActive = activeSystem === mesh.userData.system;
          const isNoneActive = activeSystem === null;
          
          const targetColor = isActive ? new THREE.Color("#D4F568") : (isNoneActive ? new THREE.Color("#3b82f6") : new THREE.Color("#1f2937"));
          const targetOpacity = isActive || isNoneActive ? 1.0 : 0.1;
          const targetEmissive = isActive ? 3.0 : (isNoneActive ? 1.0 : 0.0);

          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.color.lerp(targetColor, 0.1);
          mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, targetEmissive, 0.1);
          mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.1);
        }
      });
    });
  });

  return (
    <group ref={group} position={[0, -3, 0]}>
      
      {/* 1. RÖNTGEN HOMLOKZAT (Biztonságos anyaggal GPU omlás ellen) */}
      <group ref={facade}>
        <mesh position={[0, (floorsCount * floorHeight) / 2, 0]}>
          <boxGeometry args={[buildingWidth + 0.2, floorsCount * floorHeight + 0.2, buildingDepth + 0.2]} />
          {/* Nem használunk transmission-t, mert lehal a böngésző. Sima átlátszó anyag: */}
          <meshStandardMaterial 
            color="#080e14" 
            transparent 
            opacity={0.4} 
            roughness={0.1}
            metalness={0.8}
          />
          <Edges scale={1.0} threshold={15} color="#3b82f6" opacity={0.8} transparent />
        </mesh>
      </group>

      {/* 2 & 3. SZERKEZET ÉS TISZTA ELEKTROMOSSÁG (Szintenként csoportosítva a robbantott ábrához) */}
      <group ref={coreAndStructure}>
        <group ref={wireSystem}>
          
          {/* Központi Mag - Fix, nem robban szét */}
          <mesh position={[0, (floorsCount * floorHeight) / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[coreWidth, floorsCount * floorHeight, coreDepth]} />
            <meshStandardMaterial color="#0B0E10" roughness={0.9} transparent opacity={0.9} />
            <Edges scale={1.001} threshold={15} color="#1f2937" />
          </mesh>

          {/* Felszálló Fővezeték (Energieverteilung) - Tiszta fénylő oszlop */}
          <group userData={{ system: "Energieverteilung" }} position={[coreWidth/2 + 0.3, (floorsCount * floorHeight) / 2, 0]}>
            <cylinderGeometry args={[0.08, 0.08, floorsCount * floorHeight]} />
            <meshStandardMaterial color="#D4F568" emissive="#D4F568" emissiveIntensity={1} toneMapped={false} transparent />
          </group>

          {/* Szintek - Jól felépített robbantott animációval */}
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

              {/* TISZTA VILLAMOSSÁGI HÁLÓZAT - Káosz és pontok NÉLKÜL */}
              
              {/* Világítás (Beleuchtung) - Plafonon, tehát egy szinttel feljebb mutat, derékszögű hálózat */}
              <group position={[0, floorHeight - 0.2, 0]} userData={{ system: "Beleuchtung" }}>
                {/* Hosszanti gerincvezeték */}
                <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI/2]}>
                  <cylinderGeometry args={[0.02, 0.02, buildingWidth - 2]} />
                  <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={1} toneMapped={false} transparent />
                </mesh>
                {/* Lámpatestek és leágazások */}
                {[-3, 0, 3].map(x => (
                  <group key={`l-line-${x}`} position={[x, 0, 0]}>
                    <mesh rotation={[Math.PI/2, 0, 0]}>
                      <cylinderGeometry args={[0.015, 0.015, buildingDepth - 2]} />
                      <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={1} toneMapped={false} transparent />
                    </mesh>
                    {[-2, 0, 2].map(z => (
                      <mesh key={`light-${x}-${z}`} position={[0, -0.05, z]} rotation={[Math.PI/2, 0, 0]}>
                        <ringGeometry args={[0.15, 0.25, 16]} />
                        <meshStandardMaterial color="#ffffff" emissive="#D4F568" emissiveIntensity={1} toneMapped={false} transparent />
                      </mesh>
                    ))}
                  </group>
                ))}
              </group>

              {/* Dugaljak (Steckdosen und Stromkreise) - Letisztult vonalak a padló szélén */}
              <group position={[0, 0.1, 0]} userData={{ system: "Steckdosen und Stromkreise" }}>
                <mesh position={[0, 0, buildingDepth/2 - 0.5]} rotation={[0, 0, Math.PI/2]}>
                  <cylinderGeometry args={[0.03, 0.03, buildingWidth - 2]} />
                  <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={1} toneMapped={false} transparent />
                </mesh>
                <mesh position={[0, 0, -buildingDepth/2 + 0.5]} rotation={[0, 0, Math.PI/2]}>
                  <cylinderGeometry args={[0.03, 0.03, buildingWidth - 2]} />
                  <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={1} toneMapped={false} transparent />
                </mesh>
              </group>
              
              {/* Épületautomatizálás - Központi elosztó a mag mellett */}
              <group position={[0, 0.2, 0]} userData={{ system: "Steuerung und Gebäudeautomation" }}>
                <mesh position={[coreWidth/2 + 0.6, 0.1, -1]}>
                  <boxGeometry args={[0.3, 0.5, 0.2]} />
                  <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={1.5} toneMapped={false} transparent />
                </mesh>
                <mesh position={[coreWidth/2 + 0.6, -0.1, 0]} rotation={[Math.PI/2, 0, 0]}>
                  <cylinderGeometry args={[0.02, 0.02, buildingDepth - 2]} />
                  <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={1} toneMapped={false} transparent />
                </mesh>
              </group>
              
              {/* Biztonsági rendszerek - Tiszta négyzetes perem */}
              <group position={[0, floorHeight - 0.3, 0]} userData={{ system: "Sicherheits- und Beschallungssysteme" }}>
                <mesh rotation={[Math.PI/2, 0, 0]}>
                  <boxGeometry args={[buildingWidth - 1, buildingDepth - 1, 0.01]} />
                  <meshBasicMaterial visible={false} />
                  <Edges scale={1.0} color="#3b82f6" />
                </mesh>
              </group>

            </group>
          ))}
        </group>
      </group>
      
      {/* 4. Tervrajz Kockás Háttér (Csak 2D nézetben jelenik meg) */}
      <group ref={blueprintLines} position={[0, -5, 0]}>
        <mesh rotation={[-Math.PI/2, 0, 0]}>
          <planeGeometry args={[buildingWidth + 6, buildingDepth + 6]} />
          <meshBasicMaterial color="#0B0E10" />
        </mesh>
        <gridHelper args={[buildingWidth + 6, 30, "#3b82f6", "#111518"]} position={[0, 0.01, 0]} />
      </group>
    </group>
  );
}
