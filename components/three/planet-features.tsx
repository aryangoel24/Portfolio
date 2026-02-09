"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { WorldId } from "@/lib/portfolio-data";

/* ================================================================== */
/*  Projects: ring with proper polar UV mapping + tonemapping          */
/* ================================================================== */

function makePolarRingGeometry(
  innerRadius: number,
  outerRadius: number,
  thetaSegments: number,
  radialSegments: number,
): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let r = 0; r <= radialSegments; r++) {
    const t = r / radialSegments;
    const radius = innerRadius + (outerRadius - innerRadius) * t;
    for (let s = 0; s <= thetaSegments; s++) {
      const angle = (s / thetaSegments) * Math.PI * 2;
      positions.push(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
      uvs.push(t, s / thetaSegments); // u = radial, v = angular
    }
  }

  for (let r = 0; r < radialSegments; r++) {
    for (let s = 0; s < thetaSegments; s++) {
      const a = r * (thetaSegments + 1) + s;
      const b = a + thetaSegments + 1;
      indices.push(a, b, a + 1);
      indices.push(b, b + 1, a + 1);
    }
  }

  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

const RING_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const RING_FRAG = /* glsl */ `
  uniform vec3  uColor;
  varying vec2  vUv;

  void main() {
    float r = vUv.x;  // 0 = inner edge, 1 = outer edge
    float a = vUv.y;  // 0..1 = angle around the ring

    // Multi-frequency radial bands
    float band = 0.5 + 0.3 * sin(r * 120.0);
    band *= 0.6 + 0.4 * sin(r * 50.0 + 1.3);
    band *= 0.7 + 0.3 * sin(r * 18.0 + 2.7);

    // Angular variation: subtle brightness modulation around the ring
    float angularVar = 0.85 + 0.15 * sin(a * 6.2831853 * 8.0 + r * 20.0);
    band *= angularVar;

    // Cassini-style gap at ~58% radius
    float gap = 1.0 - 0.7 * exp(-pow((r - 0.58) * 18.0, 2.0));
    band *= gap;

    // Edge alpha falloff
    float inner = smoothstep(0.0, 0.12, r);
    float outer = smoothstep(1.0, 0.78, r);
    float alpha = band * inner * outer;

    // Color varies slightly with radius
    vec3 col = uColor * (0.7 + 0.5 * r);

    gl_FragColor = vec4(col, alpha * 0.7);
  }
`;

function ProjectRings({ color }: { color: string }) {
  const groupRef = useRef<THREE.Group>(null);

  const ringGeo = useMemo(
    () => makePolarRingGeometry(1.35, 2.1, 128, 24),
    [],
  );

  const ringMat = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: RING_VERT,
      fragmentShader: RING_FRAG,
      uniforms: {
        uColor: { value: new THREE.Color(color) },
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    mat.toneMapped = false;
    return mat;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    ringMat.uniforms.uColor.value.set(color);
  }, [color, ringMat]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z =
        Math.sin(state.clock.elapsedTime * 0.12) * 0.03;
    }
  });

  return (
    <group ref={groupRef} rotation={[-1.25, 0.15, 0]}>
      <mesh geometry={ringGeo}>
        <primitive object={ringMat} attach="material" />
      </mesh>
      {/* Thin accent ring inside the Cassini gap */}
      <mesh>
        <torusGeometry args={[1.68, 0.003, 8, 128]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.12}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  About: companion moon orbiting on a visible path                   */
/* ------------------------------------------------------------------ */

function CompanionMoon({ color }: { color: string }) {
  const moonRef = useRef<THREE.Group>(null);
  const orbitRadius = 1.45;

  const moonColor = useMemo(() => {
    const c = new THREE.Color(color);
    c.lerp(new THREE.Color("#94a3b8"), 0.5);
    return `#${c.getHexString()}`;
  }, [color]);

  useFrame((state) => {
    if (!moonRef.current) return;
    const t = state.clock.elapsedTime * 0.3;
    moonRef.current.position.set(
      Math.cos(t) * orbitRadius,
      Math.sin(t * 0.7) * 0.25,
      Math.sin(t) * orbitRadius,
    );
  });

  return (
    <>
      {/* Orbit path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[orbitRadius, 0.004, 8, 96]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.1}
          depthWrite={false}
        />
      </mesh>
      <group ref={moonRef}>
        <mesh>
          <sphereGeometry args={[0.15, 24, 24]} />
          <meshStandardMaterial
            color={moonColor}
            roughness={0.75}
            metalness={0.1}
          />
        </mesh>
      </group>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Skills + Experience: simple orbit paths                            */
/* ------------------------------------------------------------------ */

function OrbitPaths({ color }: { color: string }) {
  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <torusGeometry args={[1.7, 0.003, 8, 96]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.08}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Export: per-world feature                                          */
/* ------------------------------------------------------------------ */

export function PlanetFeature({
  worldId,
  color,
}: {
  worldId: WorldId;
  color: string;
}) {
  switch (worldId) {
    case "projects":
      return <ProjectRings color={color} />;
    case "personal":
      return <CompanionMoon color={color} />;
    case "skills":
    case "experience":
      return <OrbitPaths color={color} />;
    default:
      return null;
  }
}
