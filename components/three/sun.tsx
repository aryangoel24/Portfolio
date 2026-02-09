"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * A small glowing "star" at the center of the solar system to anchor the scene visually.
 */
export function Sun() {
  const meshRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const glowMat = useMemo(
    () => ({
      inner: new THREE.MeshBasicMaterial({
        color: "#ffdca8",
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
      outer: new THREE.MeshBasicMaterial({
        color: "#fbbf24",
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    }),
    [],
  );

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
    }
    if (coronaRef.current) {
      coronaRef.current.rotation.y -= delta * 0.03;
      coronaRef.current.rotation.z += delta * 0.02;
    }
    if (haloRef.current) {
      const t = performance.now() * 0.001;
      haloRef.current.scale.setScalar(1.0 + Math.sin(t * 1.5) * 0.01);
    }
  });

  return (
    <group position={[-5, 0, -1.5]}>
      {/* Core */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color="#ffdca8"
          emissive="#ff9f1a"
          emissiveIntensity={2.0}
          roughness={0.85}
          metalness={0.0}
        />
      </mesh>
      {/* Corona */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[0.58, 32, 32]} />
        <meshBasicMaterial
          color="#ffcc6e"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Inner glow */}
      <mesh ref={haloRef}>
        <sphereGeometry args={[0.65, 24, 24]} />
        <primitive object={glowMat.inner} attach="material" />
      </mesh>
      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[0.9, 24, 24]} />
        <primitive object={glowMat.outer} attach="material" />
      </mesh>
      {/* Point light from sun */}
      <pointLight intensity={2.4} color="#ffe1b3" distance={30} decay={2} />
    </group>
  );
}
