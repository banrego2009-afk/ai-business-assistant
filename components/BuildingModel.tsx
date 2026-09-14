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
  const totalHeight = floorsCount * floorHeight;

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

    // A homlokzat felemelkedik, hogy betekintést engedjen
    tl.to(facade.current.position, { y: totalHeight + 5, duration: 1.5, ease: "power2.inOut" }, 0)
      .to(facade.current.children.map((c: THREE.Object3D) => (c as THREE.Mesh).material), { opacity: 0, duration: 1 }, 0.2);

    // A szintek felcsúsznak a központi mag mentén (így egyben marad az épület érzete)
    floorRefs.current.forEach((floor, index) => {
      if (floor && index > 0) { // A földszint marad a helyén!
        tl.to(floor.position, { 
          y: index * (floorHeight * 1.6), // Kicsit szűkebb szétnyílás, hogy kötődjön a maghoz
          duration: 1.5, 
          ease: "power2.inOut" 
        }, 0.2);
      }
    });

    // 3D -> 2D Tervrajz (A szintek és a mag kilapulnak)
    floorRefs.current.forEach((floor) => {
      if (floor) tl.to(floor.scale, { y: 0.001, duration: 1.5 }, 1.5);
    });
    tl.to(group.current.getObjectByName("central-core")!.scale, { y: 0.001, duration: 1.5 }, 1.5);

    // Visszaállás
    floorRefs.current.forEach((floor) => {
      if (floor) tl.to(floor.scale, { y: 1, duration: 1.5 }, 3);
    });
    tl.to(group.current.getObjectByName("central-core")!.scale, { y: 1, duration: 1.5 }, 3);

  }, []);

  // --- ANYAGOK ---
  const darkWall = new THREE.MeshStandardMaterial({ color: "#0F1115", roughness: 0.9, metalness: 0.1 });
  const floorSlab = new THREE.MeshStandardMaterial({ color: "#08090a", roughness: 0.9 });
  const coreMat = new THREE.MeshStandardMaterial({ color: "#040506", roughness: 1.0 }); // Még sötétebb mag
  const glassWall = new THREE.MeshStandardMaterial({ color: "#1e293b", transparent: true, opacity: 0.2, roughness: 0.05, metalness: 0.9 });
  const deskMat = new THREE.MeshStandardMaterial({ color: "#1a1f26", roughness: 0.6 });
  const plantMat = new THREE.MeshStandardMaterial({ color: "#2d4a22", roughness: 0.8 }); // Növény dekor

  // Földszint (Lobby)
  const renderLobby = () => (
    <group>
      {/* Hatalmas, nyitott tér */}
      {/* Recepciós pult */}
      <mesh position={[0, 0.5, 2]} castShadow receiveShadow material={deskMat}>
        <boxGeometry args={[4, 1, 0.8]} />
      </mesh>
      <mesh position={[0, 1.1, 2.4]} castShadow receiveShadow material={darkWall}>
        <boxGeometry args={[4.2, 0.2, 0.4]} />
      </mesh>
      
      {/* Várakozó terület (Kanapék) */}
      <mesh position={[-4, 0.3, 3]} castShadow receiveShadow material={deskMat}>
        <boxGeometry args={[2, 0.6, 1]} />
      </mesh>
      <mesh position={[-5, 0.3, 1.5]} castShadow receiveShadow material={deskMat}>
        <boxGeometry args={[1, 0.6, 2]} />
      </mesh>

      {/* Biztonsági kapuk */}
      <mesh position={[-1.5, 0.6, -0.5]} castShadow receiveShadow material={darkWall}>
        <boxGeometry args={[0.1, 1.2, 1]} />
      </mesh>
      <mesh position={[0, 0.6, -0.5]} castShadow receiveShadow material={darkWall}>
        <boxGeometry args={[0.1, 1.2, 1]} />
      </mesh>
      <mesh position={[1.5, 0.6, -0.5]} castShadow receiveShadow material={darkWall}>
        <boxGeometry args={[0.1, 1.2, 1]} />
      </mesh>
    </group>
  );

  // Általános Irodaszint (Sok szoba és folyosó)
  const renderStandardOffice = (isVariant: boolean) => (
    <group>
      {/* Hosszú Folyosó falak */}
      <mesh position={[-1.5, floorHeight/2, -0.5]} castShadow receiveShadow material={glassWall}>
        <boxGeometry args={[11, floorHeight, 0.1]} />
      </mesh>
      <mesh position={[0, floorHeight/2, 1.5]} castShadow receiveShadow material={darkWall}>
        <boxGeometry args={[14, floorHeight, 0.1]} />
      </mesh>

      {/* Bal oldali szobák (3 kisebb iroda) */}
      <mesh position={[-2, floorHeight/2, 3.25]} castShadow receiveShadow material={darkWall}>
        <boxGeometry args={[0.1, floorHeight, 3.5]} />
      </mesh>
      <mesh position={[-5, floorHeight/2, 3.25]} castShadow receiveShadow material={darkWall}>
        <boxGeometry args={[0.1, floorHeight, 3.5]} />
      </mesh>
      
      {/* Jobb oldali szobák (2 nagyobb) */}
      <mesh position={[3, floorHeight/2, 3.25]} castShadow receiveShadow material={darkWall}>
        <boxGeometry args={[0.1, floorHeight, 3.5]} />
      </mesh>

      {/* Íróasztalok elszórva a szobákban */}
      <group position={[-3.5, 0, 3]}>
        <mesh position={[0, 0.75, 0]} castShadow receiveShadow material={deskMat}>
          <boxGeometry args={[1.4, 0.05, 0.7]} />
        </mesh>
        <mesh position={[-0.6, 0.375, 0]} castShadow receiveShadow material={deskMat}>
          <boxGeometry args={[0.05, 0.75, 0.6]} />
        </mesh>
      </group>

      <group position={[-6, 0, 4]}>
        <mesh position={[0, 0.75, 0]} castShadow receiveShadow material={deskMat}>
          <boxGeometry args={[1.4, 0.05, 0.7]} />
        </mesh>
      </group>

      {/* Változat: Open office asztalok a másik oldalon */}
      {isVariant ? (
        <group position={[5, 0, 3]}>
           <mesh position={[0, 0.75, 0]} castShadow receiveShadow material={deskMat}>
            <boxGeometry args={[2, 0.05, 1.5]} />
          </mesh>
          {/* Monitor elválasztó */}
          <mesh position={[0, 1, 0]} castShadow receiveShadow material={darkWall}>
            <boxGeometry args={[1.8, 0.4, 0.05]} />
          </mesh>
        </group>
      ) : (
        <group position={[5, 0, 3]}>
           <mesh position={[0, 0.75, 0]} castShadow receiveShadow material={deskMat}>
            <boxGeometry args={[1.5, 0.05, 1.5]} />
          </mesh>
           <mesh position={[0, 0.75, 2]} castShadow receiveShadow material={deskMat}>
            <boxGeometry args={[1.5, 0.05, 1.5]} />
          </mesh>
        </group>
      )}
    </group>
  );

  // Felső Vezetői Szint (Executive Floor)
  const renderExecutive = () => (
    <group>
      {/* Nagy tárgyaló bal oldalon */}
      <mesh position={[-2, floorHeight/2, 2]} castShadow receiveShadow material={glassWall}>
        <boxGeometry args={[0.1, floorHeight, 6]} />
      </mesh>
      
      {/* Hatalmas tárgyalóasztal */}
      <group position={[-4.5, 0, 2]}>
        <mesh position={[0, 0.75, 0]} castShadow receiveShadow material={deskMat}>
          <boxGeometry args={[4, 0.05, 1.5]} />
        </mesh>
        <mesh position={[-1.5, 0.375, 0]} castShadow receiveShadow material={darkWall}>
          <boxGeometry args={[0.5, 0.75, 0.5]} />
        </mesh>
        <mesh position={[1.5, 0.375, 0]} castShadow receiveShadow material={darkWall}>
          <boxGeometry args={[0.5, 0.75, 0.5]} />
        </mesh>
      </group>

      {/* Exkluzív lounge jobb oldalon */}
      <mesh position={[2.5, floorHeight/2, 2]} castShadow receiveShadow material={darkWall}>
        <boxGeometry args={[5, floorHeight, 0.1]} />
      </mesh>
      {/* Bár/Konyhapult */}
      <mesh position={[4, 0.5, 0]} castShadow receiveShadow material={darkWall}>
        <boxGeometry args={[4, 1, 0.8]} />
      </mesh>
    </group>
  );

  return (
    <group ref={group} position={[0, -4, 0]}>
      
      {/* KÜLSŐ HOMLOKZAT - Valóságosabb üvegépület megjelenés */}
      <group ref={facade}>
        <mesh position={[0, totalHeight / 2, 0]}>
          <boxGeometry args={[buildingWidth + 0.2, totalHeight + 0.2, buildingDepth + 0.2]} />
          <meshStandardMaterial color="#0A1118" transparent opacity={0.4} roughness={0.1} metalness={0.9} depthWrite={false} />
          {/* Sűrűbb rács, ami az irodaházak ablakosztását imitálja */}
          <Edges scale={1.0} color="#1f2937" opacity={0.8} transparent />
        </mesh>
        {/* Vízszintes födém-takaró sávok a homlokzaton kívül */}
        {Array.from({ length: floorsCount + 1 }).map((_, i) => (
          <mesh key={`facade-band-${i}`} position={[0, i * floorHeight, 0]}>
            <boxGeometry args={[buildingWidth + 0.3, 0.2, buildingDepth + 0.3]} />
            <meshStandardMaterial color="#050608" roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* KÖZPONTI MAG (Lift/Lépcső) - Ez FIX marad, és ezen csúsznak fel a szintek! */}
      {/* Így egyben marad az épület érzete a robbantott ábrán is. */}
      <mesh name="central-core" position={[0, totalHeight / 2, -2]} castShadow receiveShadow material={coreMat}>
        <boxGeometry args={[3.5, totalHeight, 3.5]} />
        <Edges scale={1.001} color="#11151c" />
      </mesh>

      {/* RÉSZLETES EMELETEK */}
      {Array.from({ length: floorsCount }).map((_, f) => (
        <group 
          key={`floor-${f}`} 
          position={[0, f * floorHeight, 0]} 
          ref={(el) => { if (el) floorRefs.current[f] = el; }}
        >
          {/* Födém (Padló) */}
          <mesh position={[0, -0.05, 0]} castShadow receiveShadow material={floorSlab}>
            <boxGeometry args={[buildingWidth, 0.1, buildingDepth]} />
            <Edges scale={1.0} color="#1a202c" />
          </mesh>

          {/* Külső perem/tömör falrészek */}
          <mesh position={[0, floorHeight / 2, -buildingDepth/2 + 0.05]} castShadow receiveShadow material={darkWall}>
            <boxGeometry args={[buildingWidth, floorHeight, 0.1]} />
          </mesh>
          <mesh position={[-buildingWidth/2 + 0.05, floorHeight / 2, 0]} castShadow receiveShadow material={darkWall}>
            <boxGeometry args={[0.1, floorHeight, buildingDepth]} />
          </mesh>
          <mesh position={[buildingWidth/2 - 0.05, floorHeight / 2, 0]} castShadow receiveShadow material={darkWall}>
            <boxGeometry args={[0.1, floorHeight, buildingDepth]} />
          </mesh>

          {/* Egyedi alaprajzok betöltése szintek szerint */}
          {f === 0 && renderLobby()}
          {f > 0 && f < floorsCount - 1 && renderStandardOffice(f % 2 === 0)}
          {f === floorsCount - 1 && renderExecutive()}
          
        </group>
      ))}
      
      {/* KOCKÁS ALAPRAJZ */}
      <group position={[0, -0.2, 0]}>
        <mesh rotation={[-Math.PI/2, 0, 0]} receiveShadow>
          <planeGeometry args={[buildingWidth + 14, buildingDepth + 14]} />
          <meshStandardMaterial color="#050608" roughness={1} />
        </mesh>
        <gridHelper args={[buildingWidth + 14, 40, "#1f2937", "#0B0E10"]} position={[0, 0.01, 0]} />
      </group>

    </group>
  );
}
