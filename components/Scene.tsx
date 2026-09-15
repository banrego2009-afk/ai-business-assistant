"use client";

import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, Grid } from "@react-three/drei";
import BuildingModel from "./BuildingModel";
import { useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

function CameraController() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  
  useGSAP(() => {
    if (!cameraRef.current) return;
    
    let mm = gsap.matchMedia();

    // ASZTALI NÉZET (Desktop)
    mm.add("(min-width: 1025px)", () => {
      // Kezdéskor kisebb legyen az épület (távolabb vagyunk) és maradjon középen
      cameraRef.current!.position.set(0, 6, 35);
      cameraRef.current!.rotation.set(0, 0, 0);
      cameraRef.current!.lookAt(0, 2, 0);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#animation-track",
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
        }
      });

      // 1. szakasz: Csak egy finom elfordulás, nem "dob ki" óriásit
      tl.to(cameraRef.current!.position, { x: 12, y: 15, z: 32, ease: "power2.inOut", duration: 1 }, 0)
        .to(cameraRef.current!.rotation, { x: -0.3, y: 0.4, z: 0.1, ease: "power2.inOut", duration: 1 }, 0);

      // 2. szakasz: Felülnézet
      tl.to(cameraRef.current!.position, { x: 0, y: 45, z: 0, ease: "power3.inOut", duration: 1.5 }, 1)
        .to(cameraRef.current!.rotation, { x: -Math.PI / 2, y: 0, z: 0, ease: "power3.inOut", duration: 1.5 }, 1);
        
      // 3. szakasz: Robbantott nézet
      tl.to(cameraRef.current!.position, { x: -10, y: 15, z: 28, ease: "power2.inOut", duration: 1.5 }, 2.5)
        .to(cameraRef.current!.rotation, { x: -0.4, y: -0.4, z: -0.1, ease: "power2.inOut", duration: 1.5 }, 2.5);
    });

    // MOBIL & TABLET NÉZET (Képeslap méret, még távolabb, középen maradva)
    mm.add("(max-width: 1024px)", () => {
      // Nagyon távolról kezdünk, hogy kicsi legyen, mint egy képeslapon
      cameraRef.current!.position.set(0, 10, 110);
      cameraRef.current!.rotation.set(0, 0, 0);
      cameraRef.current!.lookAt(0, 2, 0);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#animation-track",
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
        }
      });

      // 1. szakasz: Finom elfordulás, a kamera Z távolsága stabil marad
      tl.to(cameraRef.current!.position, { x: 15, y: 30, z: 100, ease: "power2.inOut", duration: 1 }, 0)
        .to(cameraRef.current!.rotation, { x: -0.3, y: 0.2, z: 0.1, ease: "power2.inOut", duration: 1 }, 0);

      // 2. szakasz: Felülnézet (Nagyon magasan, hogy kicsi maradjon)
      tl.to(cameraRef.current!.position, { x: 0, y: 130, z: 0, ease: "power3.inOut", duration: 1.5 }, 1)
        .to(cameraRef.current!.rotation, { x: -Math.PI / 2, y: 0, z: 0, ease: "power3.inOut", duration: 1.5 }, 1);
        
      // 3. szakasz: Robbantott nézet
      tl.to(cameraRef.current!.position, { x: -15, y: 35, z: 90, ease: "power2.inOut", duration: 1.5 }, 2.5)
        .to(cameraRef.current!.rotation, { x: -0.3, y: -0.2, z: -0.1, ease: "power2.inOut", duration: 1.5 }, 2.5);
    });

    return () => mm.revert();
  });

  return <PerspectiveCamera ref={cameraRef} makeDefault fov={35} />;
}

export default function Scene({ activeSystem }: { activeSystem: string | null }) {
  return (
    <div className="fixed inset-0 w-full h-full -z-10 bg-[#0B0E10]">
      <Canvas shadows dpr={[1, 1.5]}>
        <CameraController />
        <ambientLight intensity={2.5} />
        <directionalLight position={[10, 20, 10]} intensity={3.5} castShadow shadow-mapSize={[1024, 1024]} />
        <spotLight position={[-10, 10, -5]} intensity={3.0} color="#bae6fd" distance={50} />
        
        <Grid 
          position={[0, -0.5, 0]} 
          args={[50, 50]} 
          cellSize={1} 
          cellThickness={0.5} 
          cellColor="#1f2937" 
          sectionSize={5} 
          sectionThickness={1} 
          sectionColor="#3b82f6" 
          fadeDistance={30} 
          fadeStrength={1.5} 
        />
        
        <BuildingModel activeSystem={activeSystem} />
      </Canvas>
    </div>
  );
}
