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

  // Letisztult épület paraméterek
  const floorsCount = 3; 
  const floorHeight = 2.0;
  const buildingWidth = 12;
  const buildingDepth = 8;
  const coreWidth = 2.5;
  const coreDepth = 2.5;

  // Letisztult kék/lime színek az elektromos hálózathoz
  const colorActive = new THREE.Color("#3b82f6"); // Tiszta kék, ahogy a felhasználó kérte
  const colorInactive = new THREE.Color("#1f2937"); // Halvány szürke, ha nincs fókuszban
  const colorHighlight = new THREE.Color("#D4F568"); // Lime a kiemelésekhez

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

    // Fázis 1: RÖNTGEN / NYITÁS (A homlokzat eltűnik, a szintek enyhén eltávolodnak, hogy átlátható legyen)
    tl.to(facade.current.position, { y: 8, duration: 1.5, ease: "power2.inOut" }, 0)
      .to(facade.current.children.map((c: any) => c.material), { opacity: 0, duration: 1 }, 0.2);
      
    // Diszkrét, tiszta robbantott ábra (nem káoszos, csak elegánsan szétnyílik)
    floorRefs.current.forEach((floor, index) => {
      if (floor) {
        tl.to(floor.position, { 
          y: index * (floorHeight * 1.5), 
          duration: 1.5, 
          ease: "power2.inOut" 
        }, 0);
      }
    });

    // Fázis 2: 3D -> 2D TERVRAJZ (Minden kilapul egy professzionális alaprajzzá)
    tl.to(coreAndStructure.current.scale, { y: 0.001, duration: 1.5 }, 1.5)
      .to(wireSystem.current.scale, { y: 0.001, duration: 1.5 }, 1.5)
      .to(blueprintLines.current.position, { y: 0.1, duration: 0.5 }, 1.8);
      
    // Fázis 3: VISSZATÉRÉS 3D-be A RENDSZERBEMUTATÓHOZ
    tl.to(coreAndStructure.current.scale, { y: 1, duration: 1.5 }, 3)
      .to(wireSystem.current.scale, { y: 1, duration: 1.5 }, 3)
      .to(blueprintLines.current.position, { y: -5, duration: 0.5 }, 3);
      
  }, []);

  // Színek letisztult, folyamatos animálása
  useFrame(() => {
    if (!wireSystem.current) return;
    
    wireSystem.current.children.forEach((floorGroup: any) => {
      floorGroup.children.forEach((child: any) => {
        if (child.material && child.userData.system) {
          const isActive = activeSystem === child.userData.system;
          const isNoneActive = activeSystem === null;
          
          // Ha aktív, akkor erős kék/lime. Ha nem, akkor halvány szürke.
          const targetColor = isActive ? (activeSystem === "Energieverteilung" ? colorHighlight : colorActive) : (isNoneActive ? colorActive : colorInactive);
          const targetOpacity = isActive || isNoneActive ? 1.0 : 0.1;
          const targetEmissive = isActive || isNoneActive ? 1.5 : 0.0;

          child.material.color.lerp(targetColor, 0.1);
          child.material.emissiveIntensity = THREE.MathUtils.lerp(child.material.emissiveIntensity, targetEmissive, 0.1);
          child.material.opacity = THREE.MathUtils.lerp(child.material.opacity, targetOpacity, 0.1);
        }
      });
    });
  });

  return (
    <group ref={group} position={[0, -2, 0]}>
      
      {/* 1. KÜLSŐ HOMLOKZAT (Letisztult, félig átlátszó építészeti forma) */}
      <group ref={facade}>
        <mesh position={[0, (floorsCount * floorHeight) / 2, 0]}>
          <boxGeometry args={[buildingWidth + 0.2, floorsCount * floorHeight + 0.2, buildingDepth + 0.2]} />
          <meshStandardMaterial 
            color="#151B1F" 
            transparent 
            opacity={0.6} 
            roughness={0.2}
            metalness={0.5}
          />
          <Edges scale={1.0} threshold={15} color="#4a5568" opacity={0.8} transparent />
        </mesh>
      </group>

      {/* 2 & 3. BELSŐ SZERKEZET ÉS TISZTA VEZETÉKEK */}
      <group ref={coreAndStructure}>
        <group ref={wireSystem}>
          
          {/* Központi Mag (Lépcsőház/Lift) - Letisztult szürke tömb */}
          <mesh position={[0, (floorsCount * floorHeight) / 2, -buildingDepth/2 + coreDepth/2 + 0.1]} castShadow receiveShadow>
            <boxGeometry args={[coreWidth, floorsCount * floorHeight, coreDepth]} />
            <meshStandardMaterial color="#0B0E10" roughness={0.8} />
            <Edges scale={1.0} threshold={15} color="#1f2937" />
          </mesh>

          {/* Központi Felszálló Fővezeték (Energieverteilung) - Tisztán fut a mag mellett */}
          <group userData={{ system: "Energieverteilung" }} position={[coreWidth/2 + 0.2, (floorsCount * floorHeight) / 2, -buildingDepth/2 + coreDepth/2 + 0.1]}>
            <cylinderGeometry args={[0.06, 0.06, floorsCount * floorHeight]} />
            <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={1} toneMapped={false} transparent />
          </group>

          {/* Szintek (Födémek és a rajtuk lévő tiszta vezetékrajzok) */}
          {Array.from({ length: floorsCount }).map((_, f) => (
            <group 
              key={`floor-${f}`} 
              position={[0, f * floorHeight, 0]} 
              ref={(el) => { if (el) floorRefs.current[f] = el; }}
            >
              {/* Födém (Padló) */}
              <mesh position={[0, 0, 0]} castShadow receiveShadow>
                <boxGeometry args={[buildingWidth, 0.1, buildingDepth]} />
                <meshStandardMaterial color="#111518" roughness={0.9} />
                <Edges scale={1.0} threshold={15} color="#1f2937" />
              </mesh>

              {/* Rendszerek a födémen - LETISZTULT VONALAKKÉNT (nincs káosz, nincs részecske) */}
              
              {/* Világítás (Beleuchtung) - Plafonon futó egyenes vonalak */}
              <group position={[0, floorHeight - 0.1, 0]} userData={{ system: "Beleuchtung" }}>
                {/* Hosszanti vezeték */}
                <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI/2]}>
                  <cylinderGeometry args={[0.02, 0.02, buildingWidth - 2]} />
                  <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={1} toneMapped={false} transparent />
                </mesh>
                {/* Kereszt vezetékek és lámpa pozíciók */}
                {[-3, 3].map(x => (
                  <group key={`light-line-${x}`} position={[x, 0, 0]}>
                    <mesh rotation={[Math.PI/2, 0, 0]}>
                      <cylinderGeometry args={[0.02, 0.02, buildingDepth - 2]} />
                      <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={1} toneMapped={false} transparent />
                    </mesh>
                    {/* Lámpatestek egyszerű korongként */}
                    {[-2, 2].map(z => (
                      <mesh key={`light-${x}-${z}`} position={[0, 0, z]} rotation={[Math.PI/2, 0, 0]}>
                        <cylinderGeometry args={[0.2, 0.2, 0.05]} />
                        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} toneMapped={false} transparent />
                      </mesh>
                    ))}
                  </group>
                ))}
              </group>

              {/* Dugaljak (Steckdosen und Stromkreise) - Padlóban futó derékszögű vonalak */}
              <group position={[0, 0.05, 0]} userData={{ system: "Steckdosen und Stromkreise" }}>
                {/* Padlóban körbefutó fővezeték */}
                <mesh position={[0, 0, buildingDepth/2 - 0.5]} rotation={[0, 0, Math.PI/2]}>
                  <cylinderGeometry args={[0.03, 0.03, buildingWidth - 1]} />
                  <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={1} toneMapped={false} transparent />
                </mesh>
                <mesh position={[0, 0, -buildingDepth/2 + 0.5]} rotation={[0, 0, Math.PI/2]}>
                  <cylinderGeometry args={[0.03, 0.03, buildingWidth - 1]} />
                  <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={1} toneMapped={false} transparent />
                </mesh>
              </group>
              
              {/* Épületautomatizálás (Steuerung) - Letisztult adatközpont és egyenes csatorna */}
              <group position={[0, 0.1, 0]} userData={{ system: "Steuerung und Gebäudeautomation" }}>
                <mesh position={[coreWidth/2 + 0.5, 0.2, -buildingDepth/2 + coreDepth/2 + 0.1]}>
                  <boxGeometry args={[0.6, 0.4, 0.2]} />
                  <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={1} toneMapped={false} transparent />
                </mesh>
                {/* Adatvezeték a padlón */}
                <mesh position={[coreWidth/2 + 0.5, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
                  <cylinderGeometry args={[0.015, 0.015, buildingDepth - 2]} />
                  <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={1} toneMapped={false} transparent />
                </mesh>
              </group>
              
              {/* Biztonsági rendszerek - Mennyezet alatt futó négyzetes keret */}
              <group position={[0, floorHeight - 0.3, 0]} userData={{ system: "Sicherheits- und Beschallungssysteme" }}>
                <mesh rotation={[Math.PI/2, 0, 0]}>
                  {/* Edges geometry hogy csak vonalak legyenek */}
                  <boxGeometry args={[buildingWidth - 1.5, buildingDepth - 1.5, 0.01]} />
                  <meshBasicMaterial visible={false} />
                  <Edges scale={1.0} color="#D4F568" />
                </mesh>
              </group>

            </group>
          ))}
        </group>
      </group>
      
      {/* 4. Tervrajz (Csak 2D nézetben jelenik meg GSAP-pal) */}
      <group ref={blueprintLines} position={[0, -5, 0]}>
        <mesh rotation={[-Math.PI/2, 0, 0]}>
          <planeGeometry args={[buildingWidth + 4, buildingDepth + 4]} />
          <meshBasicMaterial color="#0B0E10" />
        </mesh>
        <gridHelper args={[buildingWidth + 4, 20, "#1f2937", "#111518"]} position={[0, 0.01, 0]} />
      </group>
    </group>
  );
}
