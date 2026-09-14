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

    // 1. A külső üvegburok egyszerűen elhalványul
    facade.current.traverse((child: THREE.Object3D) => {
      if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material) {
        tl.to((child as THREE.Mesh).material, { opacity: 0, duration: 1 }, 0);
      } else if ((child as THREE.LineSegments).isLineSegments && (child as THREE.LineSegments).material) {
        tl.to((child as THREE.LineSegments).material, { opacity: 0, duration: 1 }, 0);
      }
    });

    // 2. A szintek finoman szétnyílnak a mag mentén, hogy belássunk
    floorRefs.current.forEach((floor, index) => {
      if (floor && index > 0) { 
        // Eredeti y: index * 3.2
        // Új y: index * 4.8 (így tiszta távolság lesz köztük, nem akadnak össze)
        tl.to(floor.position, { 
          y: index * (floorHeight * 1.5), 
          duration: 1.5, 
          ease: "power2.inOut" 
        }, 0.2);
      }
    });

    // 3. 3D -> 2D Tervrajz (A szintek és a mag kilapulnak a talajra)
    floorRefs.current.forEach((floor, index) => {
      if (floor) {
        tl.to(floor.scale, { y: 0.001, duration: 1.5 }, 1.5);
        // A lelapuláskor visszamennek a földre, hogy szép alaprajz legyen
        tl.to(floor.position, { y: 0.1 * index, duration: 1.5, ease: "power2.inOut" }, 1.5);
      }
    });
    tl.to(group.current.getObjectByName("central-core")!.scale, { y: 0.001, duration: 1.5 }, 1.5);

    // 4. Visszaállás
    floorRefs.current.forEach((floor, index) => {
      if (floor) {
        tl.to(floor.scale, { y: 1, duration: 1.5 }, 3);
        tl.to(floor.position, { y: index * (floorHeight * 1.5), duration: 1.5, ease: "power2.inOut" }, 3);
      }
    });
    tl.to(group.current.getObjectByName("central-core")!.scale, { y: 1, duration: 1.5 }, 3);

  }, []);

  // --- VILÁGOSABB, LÁTVÁNYOS ANYAGOK ---
  // Hogy a sötét háttéren gyönyörűen virítson az épület
  const lightWall = new THREE.MeshStandardMaterial({ color: "#cbd5e1", roughness: 0.8, metalness: 0.1 }); // Világosszürke falak
  const floorSlab = new THREE.MeshStandardMaterial({ color: "#94a3b8", roughness: 0.9 }); // Kicsit sötétebb szürke padló
  const coreMat = new THREE.MeshStandardMaterial({ color: "#64748b", roughness: 1.0 }); // Még egy árnyalattal sötétebb beton mag
  const glassWall = new THREE.MeshStandardMaterial({ color: "#7dd3fc", transparent: true, opacity: 0.3, roughness: 0.1, metalness: 0.9 }); // Világoskék üveg
  const deskMat = new THREE.MeshStandardMaterial({ color: "#334155", roughness: 0.6 }); // Sötét pala asztalok (hogy kontrasztos legyen)
  const facadeMat = new THREE.MeshStandardMaterial({ color: "#e0f2fe", transparent: true, opacity: 0.4, roughness: 0.1, metalness: 0.8, depthWrite: false });

  // Földszint (Lobby)
  const renderLobby = () => (
    <group>
      <mesh position={[0, 0.5, 2]} castShadow receiveShadow material={deskMat}>
        <boxGeometry args={[4, 1, 0.8]} />
      </mesh>
      <mesh position={[0, 1.1, 2.4]} castShadow receiveShadow material={lightWall}>
        <boxGeometry args={[4.2, 0.2, 0.4]} />
      </mesh>
      <mesh position={[-4, 0.3, 3]} castShadow receiveShadow material={deskMat}>
        <boxGeometry args={[2, 0.6, 1]} />
      </mesh>
      <mesh position={[-5, 0.3, 1.5]} castShadow receiveShadow material={deskMat}>
        <boxGeometry args={[1, 0.6, 2]} />
      </mesh>
      <mesh position={[-1.5, 0.6, -0.5]} castShadow receiveShadow material={lightWall}>
        <boxGeometry args={[0.1, 1.2, 1]} />
      </mesh>
      <mesh position={[0, 0.6, -0.5]} castShadow receiveShadow material={lightWall}>
        <boxGeometry args={[0.1, 1.2, 1]} />
      </mesh>
      <mesh position={[1.5, 0.6, -0.5]} castShadow receiveShadow material={lightWall}>
        <boxGeometry args={[0.1, 1.2, 1]} />
      </mesh>
    </group>
  );

  // Általános Irodaszint
  const renderStandardOffice = (isVariant: boolean) => (
    <group>
      <mesh position={[-1.5, floorHeight/2, -0.5]} castShadow receiveShadow material={glassWall}>
        <boxGeometry args={[11, floorHeight, 0.1]} />
      </mesh>
      <mesh position={[0, floorHeight/2, 1.5]} castShadow receiveShadow material={lightWall}>
        <boxGeometry args={[14, floorHeight, 0.1]} />
      </mesh>
      <mesh position={[-2, floorHeight/2, 3.25]} castShadow receiveShadow material={lightWall}>
        <boxGeometry args={[0.1, floorHeight, 3.5]} />
      </mesh>
      <mesh position={[-5, floorHeight/2, 3.25]} castShadow receiveShadow material={lightWall}>
        <boxGeometry args={[0.1, floorHeight, 3.5]} />
      </mesh>
      <mesh position={[3, floorHeight/2, 3.25]} castShadow receiveShadow material={lightWall}>
        <boxGeometry args={[0.1, floorHeight, 3.5]} />
      </mesh>
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
      {isVariant ? (
        <group position={[5, 0, 3]}>
           <mesh position={[0, 0.75, 0]} castShadow receiveShadow material={deskMat}>
            <boxGeometry args={[2, 0.05, 1.5]} />
          </mesh>
          <mesh position={[0, 1, 0]} castShadow receiveShadow material={lightWall}>
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

  // Felső Vezetői Szint
  const renderExecutive = () => (
    <group>
      <mesh position={[-2, floorHeight/2, 2]} castShadow receiveShadow material={glassWall}>
        <boxGeometry args={[0.1, floorHeight, 6]} />
      </mesh>
      <group position={[-4.5, 0, 2]}>
        <mesh position={[0, 0.75, 0]} castShadow receiveShadow material={deskMat}>
          <boxGeometry args={[4, 0.05, 1.5]} />
        </mesh>
        <mesh position={[-1.5, 0.375, 0]} castShadow receiveShadow material={deskMat}>
          <boxGeometry args={[0.5, 0.75, 0.5]} />
        </mesh>
        <mesh position={[1.5, 0.375, 0]} castShadow receiveShadow material={deskMat}>
          <boxGeometry args={[0.5, 0.75, 0.5]} />
        </mesh>
      </group>
      <mesh position={[2.5, floorHeight/2, 2]} castShadow receiveShadow material={lightWall}>
        <boxGeometry args={[5, floorHeight, 0.1]} />
      </mesh>
      <mesh position={[4, 0.5, 0]} castShadow receiveShadow material={deskMat}>
        <boxGeometry args={[4, 1, 0.8]} />
      </mesh>
    </group>
  );

  return (
    <group ref={group} position={[0, -4, 0]}>
      
      {/* KÜLSŐ HOMLOKZAT */}
      <group ref={facade}>
        <mesh position={[0, totalHeight / 2, 0]}>
          <boxGeometry args={[buildingWidth + 0.2, totalHeight + 0.2, buildingDepth + 0.2]} />
          <primitive object={facadeMat} attach="material" />
          <Edges scale={1.0} color="#64748b" opacity={0.6} transparent />
        </mesh>
        {Array.from({ length: floorsCount + 1 }).map((_, i) => (
          <mesh key={`facade-band-${i}`} position={[0, i * floorHeight, 0]}>
            <boxGeometry args={[buildingWidth + 0.3, 0.2, buildingDepth + 0.3]} />
            <meshStandardMaterial color="#475569" roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* KÖZPONTI MAG */}
      <mesh name="central-core" position={[0, totalHeight / 2, -2]} castShadow receiveShadow material={coreMat}>
        <boxGeometry args={[3.5, totalHeight, 3.5]} />
        <Edges scale={1.001} color="#334155" />
      </mesh>

      {/* RÉSZLETES EMELETEK */}
      {Array.from({ length: floorsCount }).map((_, f) => (
        <group 
          key={`floor-${f}`} 
          position={[0, f * floorHeight, 0]} 
          ref={(el) => { if (el) floorRefs.current[f] = el; }}
        >
          <mesh position={[0, -0.05, 0]} castShadow receiveShadow material={floorSlab}>
            <boxGeometry args={[buildingWidth, 0.1, buildingDepth]} />
            <Edges scale={1.0} color="#475569" />
          </mesh>

          <mesh position={[0, floorHeight / 2, -buildingDepth/2 + 0.05]} castShadow receiveShadow material={lightWall}>
            <boxGeometry args={[buildingWidth, floorHeight, 0.1]} />
          </mesh>
          <mesh position={[-buildingWidth/2 + 0.05, floorHeight / 2, 0]} castShadow receiveShadow material={lightWall}>
            <boxGeometry args={[0.1, floorHeight, buildingDepth]} />
          </mesh>
          <mesh position={[buildingWidth/2 - 0.05, floorHeight / 2, 0]} castShadow receiveShadow material={lightWall}>
            <boxGeometry args={[0.1, floorHeight, buildingDepth]} />
          </mesh>

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
