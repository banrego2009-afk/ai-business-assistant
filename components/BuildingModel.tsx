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

    // 1. (0.0 - 1.5 mp): A külső üvegburok egyszerűen elhalványul
    facade.current.traverse((child: THREE.Object3D) => {
      if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material) {
        tl.to((child as THREE.Mesh).material, { opacity: 0, duration: 1.5 }, 0);
      } else if ((child as THREE.LineSegments).isLineSegments && (child as THREE.LineSegments).material) {
        tl.to((child as THREE.LineSegments).material, { opacity: 0, duration: 1.5 }, 0);
      }
    });

    // 2. (1.5 - 3.0 mp): A szintek finoman szétnyílnak a mag mentén, hogy belássunk a szobákba.
    floorRefs.current.forEach((floor, index) => {
      if (floor && index > 0) { 
        tl.to(floor.position, { 
          y: index * (floorHeight * 1.5), 
          duration: 1.5, 
          ease: "power2.inOut" 
        }, 1.5); // KIZÁRÓLAG az animáció második felében (1.5 mp-nél) kezd el szétnyílni!
      }
    });

    // (Eltávolítottam a 3D -> 2D -> 3D kilapulást, mert ez okozta az "össze-vissza csúszkálást" fel-le görgetéskor)

  }, []);

  // --- PRÉMIUM ÉPÍTÉSZETI ANYAGOK ---
  const lightWall = new THREE.MeshStandardMaterial({ color: "#f8fafc", roughness: 0.1, metalness: 0.1 }); // Tiszta fehér falak (sokkal profibb)
  const floorSlab = new THREE.MeshStandardMaterial({ color: "#cbd5e1", roughness: 0.8 }); // Világos betonpadló
  const coreMat = new THREE.MeshStandardMaterial({ color: "#94a3b8", roughness: 1.0 }); // Kontrasztosabb mag
  const glassWall = new THREE.MeshStandardMaterial({ color: "#7dd3fc", transparent: true, opacity: 0.25, roughness: 0.05, metalness: 0.9 }); // Igazi üveg hatás
  const deskMat = new THREE.MeshStandardMaterial({ color: "#334155", roughness: 0.5 }); // Fa/Sötét bútor
  const monitorMat = new THREE.MeshStandardMaterial({ color: "#0f172a", roughness: 0.2, metalness: 0.8 }); // Monitorok hátulja
  const screenMat = new THREE.MeshStandardMaterial({ color: "#bae6fd", emissive: "#0284c7", emissiveIntensity: 0.5 }); // Bekapcsolt képernyők
  const facadeMat = new THREE.MeshStandardMaterial({ color: "#e0f2fe", transparent: true, opacity: 0.35, roughness: 0.1, metalness: 0.8, depthWrite: false });

  // Egy asztal komplett összeállítása (Asztallap, lábak, monitor)
  const renderDesk = (x: number, z: number, rotation: number = 0, width: number = 1.4) => (
    <group position={[x, 0, z]} rotation={[0, rotation, 0]}>
      {/* Asztallap */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow material={deskMat}>
        <boxGeometry args={[width, 0.05, 0.7]} />
      </mesh>
      {/* Asztallábak */}
      <mesh position={[-width/2 + 0.1, 0.375, 0]} castShadow receiveShadow material={deskMat}>
        <boxGeometry args={[0.05, 0.75, 0.6]} />
      </mesh>
      <mesh position={[width/2 - 0.1, 0.375, 0]} castShadow receiveShadow material={deskMat}>
        <boxGeometry args={[0.05, 0.75, 0.6]} />
      </mesh>
      {/* Monitor (Hogy profi irodának nézzen ki) */}
      <group position={[0, 0.8, -0.15]}>
        <mesh position={[0, 0.2, 0]} castShadow receiveShadow material={monitorMat}>
          <boxGeometry args={[0.6, 0.35, 0.05]} />
        </mesh>
        <mesh position={[0, 0.2, 0.026]} material={screenMat}>
          <planeGeometry args={[0.55, 0.3]} />
        </mesh>
        <mesh position={[0, 0.05, 0]} castShadow receiveShadow material={monitorMat}>
          <cylinderGeometry args={[0.02, 0.05, 0.1]} />
        </mesh>
      </group>
    </group>
  );

  // Földszint (Lobby)
  const renderLobby = () => (
    <group>
      {/* Recepciós pult (Hosszú, elegáns) */}
      <mesh position={[0, 0.5, 1]} castShadow receiveShadow material={deskMat}>
        <boxGeometry args={[5, 1, 0.8]} />
      </mesh>
      <mesh position={[0, 1.1, 1.4]} castShadow receiveShadow material={lightWall}>
        <boxGeometry args={[5.2, 0.2, 0.4]} />
      </mesh>
      
      {/* Növény/Dekor a sarokban */}
      <mesh position={[5, 0.5, 3]} castShadow receiveShadow material={monitorMat}>
        <cylinderGeometry args={[0.3, 0.4, 1]} />
      </mesh>
      <mesh position={[-5, 0.5, 3]} castShadow receiveShadow material={monitorMat}>
        <cylinderGeometry args={[0.3, 0.4, 1]} />
      </mesh>

      {/* Beléptető kapuk */}
      <mesh position={[-1.5, 0.5, -0.5]} castShadow receiveShadow material={lightWall}>
        <boxGeometry args={[0.1, 1, 0.8]} />
      </mesh>
      <mesh position={[0, 0.5, -0.5]} castShadow receiveShadow material={lightWall}>
        <boxGeometry args={[0.1, 1, 0.8]} />
      </mesh>
      <mesh position={[1.5, 0.5, -0.5]} castShadow receiveShadow material={lightWall}>
        <boxGeometry args={[0.1, 1, 0.8]} />
      </mesh>
    </group>
  );

  // Általános Irodaszint
  const renderStandardOffice = (isVariant: boolean) => (
    <group>
      {/* Folyosó üvegfal */}
      <mesh position={[-1.5, floorHeight/2, -0.5]} castShadow receiveShadow material={glassWall}>
        <boxGeometry args={[11, floorHeight, 0.1]} />
      </mesh>
      <mesh position={[0, floorHeight/2, 1.5]} castShadow receiveShadow material={lightWall}>
        <boxGeometry args={[14, floorHeight, 0.1]} />
      </mesh>

      {/* Tárgyaló üvegfront elöl */}
      <mesh position={[3, floorHeight/2, 4.95]} castShadow receiveShadow material={glassWall}>
        <boxGeometry args={[8, floorHeight, 0.1]} />
      </mesh>

      {/* Válaszfalak */}
      <mesh position={[-2, floorHeight/2, 3.25]} castShadow receiveShadow material={lightWall}>
        <boxGeometry args={[0.1, floorHeight, 3.5]} />
      </mesh>
      <mesh position={[-5, floorHeight/2, 3.25]} castShadow receiveShadow material={lightWall}>
        <boxGeometry args={[0.1, floorHeight, 3.5]} />
      </mesh>
      <mesh position={[2, floorHeight/2, 3.25]} castShadow receiveShadow material={lightWall}>
        <boxGeometry args={[0.1, floorHeight, 3.5]} />
      </mesh>

      {/* Bútorozás (Részletes asztalok monitorokkal) */}
      {renderDesk(-3.5, 3, 0, 1.4)}
      {renderDesk(-6, 4, Math.PI / 2, 1.4)}

      {/* Változatos open office */}
      {isVariant ? (
        <group>
          {renderDesk(4, 2.5, 0, 1.6)}
          {renderDesk(4, 3.5, Math.PI, 1.6)}
          {renderDesk(6, 2.5, 0, 1.6)}
          {renderDesk(6, 3.5, Math.PI, 1.6)}
        </group>
      ) : (
        <group>
          {renderDesk(3.5, 3, 0, 1.4)}
          {renderDesk(6.5, 3, 0, 1.4)}
          {renderDesk(5, 4, Math.PI, 1.4)}
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
      
      {/* Prémium hosszú tárgyalóasztal */}
      <group position={[-4.5, 0, 2]}>
        <mesh position={[0, 0.75, 0]} castShadow receiveShadow material={deskMat}>
          <boxGeometry args={[4, 0.05, 1.5]} />
        </mesh>
        <mesh position={[-1.5, 0.375, 0]} castShadow receiveShadow material={deskMat}>
          <cylinderGeometry args={[0.1, 0.1, 0.75]} />
        </mesh>
        <mesh position={[1.5, 0.375, 0]} castShadow receiveShadow material={deskMat}>
          <cylinderGeometry args={[0.1, 0.1, 0.75]} />
        </mesh>
        {/* Laptopok az asztalon */}
        {[-1, 0, 1].map((x, i) => (
          <group key={`lap-${i}`} position={[x, 0.78, 0.3]} rotation={[0, 0, 0]}>
            <mesh position={[0, 0.05, -0.1]} rotation={[-0.2, 0, 0]} material={monitorMat}>
              <boxGeometry args={[0.3, 0.2, 0.02]} />
            </mesh>
            <mesh position={[0, 0.05, -0.09]} rotation={[-0.2, 0, 0]} material={screenMat}>
              <planeGeometry args={[0.28, 0.18]} />
            </mesh>
          </group>
        ))}
      </group>

      <mesh position={[2.5, floorHeight/2, 2]} castShadow receiveShadow material={lightWall}>
        <boxGeometry args={[5, floorHeight, 0.1]} />
      </mesh>
      {/* Lounge Bár */}
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
            <meshStandardMaterial color="#475569" roughness={0.9} transparent opacity={1} />
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
