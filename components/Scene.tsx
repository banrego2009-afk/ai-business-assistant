"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, PerspectiveCamera, Grid } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import BuildingModel from "./BuildingModel";
import { useRef, useEffect } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

function CameraController() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  
  useGSAP(() => {
    if (!cameraRef.current) return;
    
    // Kezdeti kamera pozíció
    cameraRef.current.position.set(15, 10, 15);
    cameraRef.current.lookAt(0, 2, 0);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.5,
      }
    });

    // Szekció 2: Épületmetszet feltárása (Kamera lejjebb és közelebb megy)
    tl.to(cameraRef.current.position, { x: 8, y: 5, z: 12, ease: "power2.inOut", duration: 1 }, 0)
      .to(cameraRef.current.rotation, { x: -0.3, y: 0.5, z: 0.1, ease: "power2.inOut", duration: 1 }, 0);

    // Szekció 3: 3D -> 2D Tervrajz (Kamera felülnézetbe fordul, távolodik)
    tl.to(cameraRef.current.position, { x: 0, y: 25, z: 0, ease: "power3.inOut", duration: 1.5 }, 1)
      .to(cameraRef.current.rotation, { x: -Math.PI / 2, y: 0, z: 0, ease: "power3.inOut", duration: 1.5 }, 1);
      
    // Szekció 4: Rendszerek részletezése (Vissza térbeli izometrikus nézetbe)
    tl.to(cameraRef.current.position, { x: -10, y: 8, z: 10, ease: "power2.inOut", duration: 1.5 }, 2.5)
      .to(cameraRef.current.rotation, { x: -0.5, y: -0.7, z: -0.3, ease: "power2.inOut", duration: 1.5 }, 2.5);

  });

  return <PerspectiveCamera ref={cameraRef} makeDefault fov={35} />;
}

export default function Scene({ activeSystem }: { activeSystem: string | null }) {
  return (
    <div className="fixed inset-0 w-full h-full -z-10 bg-[var(--color-graphite)]">
      <Canvas shadows dpr={[1, 2]}>
        <CameraController />
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />
        <spotLight position={[-10, 10, -5]} intensity={1} color="#D4F568" distance={50} />
        
        {/* Szép technikai rács a padlón */}
        <Grid 
          position={[0, -0.5, 0]} 
          args={[50, 50]} 
          cellSize={1} 
          cellThickness={0.5} 
          cellColor="#8D989F" 
          sectionSize={5} 
          sectionThickness={1} 
          sectionColor="#D4F568" 
          fadeDistance={30} 
          fadeStrength={1.5} 
        />
        
        <BuildingModel activeSystem={activeSystem} />
        
        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
