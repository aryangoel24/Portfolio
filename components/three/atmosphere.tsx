"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ------------------------------------------------------------------ */
/*  Fresnel rim-glow atmosphere                                        */
/*                                                                     */
/*  Additive blending, depthTest true, depthWrite false.               */
/*  Reduced alpha multiplier for thinner shell look.                   */
/*  Includes colorspace conversion for consistent output.              */
/* ------------------------------------------------------------------ */

const ATMO_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vNormal   = normalize(normalMatrix * normal);
    vViewDir  = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const ATMO_FRAG = /* glsl */ `
  uniform vec3  uColor;
  uniform float uIntensity;
  varying vec3  vNormal;
  varying vec3  vViewDir;
  void main() {
    float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 3.0);
    vec3 outColor = uColor * fresnel * uIntensity;
    // Additive blending: alpha controls how much light is added
    gl_FragColor = vec4(outColor, fresnel * uIntensity * 0.35);
  }
`;

interface AtmosphereProps {
  radius?: number;
  color: string;
  intensity?: number;
}

export function Atmosphere({
  radius = 1.12,
  color,
  intensity = 0.45,
}: AtmosphereProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: ATMO_VERT,
        fragmentShader: ATMO_FRAG,
        uniforms: {
          uColor: { value: new THREE.Color(color) },
          uIntensity: { value: intensity },
        },
        transparent: true,
        depthTest: true,
        depthWrite: false,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  material.toneMapped = false;

  // Sync color when prop changes
  useEffect(() => {
    material.uniforms.uColor.value.set(color);
  }, [color, material]);

  // Smoothly lerp intensity toward prop value
  useFrame((_, delta) => {
    if (!matRef.current) return;
    const u = matRef.current.uniforms;
    u.uIntensity.value = THREE.MathUtils.lerp(
      u.uIntensity.value,
      intensity,
      1 - Math.pow(0.004, delta),
    );
  });

  return (
    <mesh scale={radius}>
      <sphereGeometry args={[1, 48, 48]} />
      <primitive ref={matRef} object={material} attach="material" />
    </mesh>
  );
}
