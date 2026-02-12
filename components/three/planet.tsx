"use client";

import { useRef, useState, useCallback, useMemo, useEffect, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import * as THREE from "three";
import type { WorldData, WorldId } from "@/lib/portfolio-data";
import { Atmosphere } from "./atmosphere";
import { PlanetFeature } from "./planet-features";

/* ------------------------------------------------------------------ */
/*  Shared simplex-3D noise GLSL (Ashima Arts)                         */
/* ------------------------------------------------------------------ */

const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x){ return x - floor(x*(1.0/289.0))*289.0; }
vec4 mod289(vec4 x){ return x - floor(x*(1.0/289.0))*289.0; }
vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314*r; }
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0,1.0/3.0);
  const vec4 D = vec4(0,0.5,1,2);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g,l.zxy);
  vec3 i2=max(g,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(
    i.z+vec4(0,i1.z,i2.z,1))
    +i.y+vec4(0,i1.y,i2.y,1))
    +i.x+vec4(0,i1.x,i2.x,1));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

/* ------------------------------------------------------------------ */
/*  Vertex shader: displacement + perturbed normals via noise gradient */
/* ------------------------------------------------------------------ */

const SURFACE_VERT = /* glsl */ `
${NOISE_GLSL}
uniform float uNoiseScale;
uniform float uDisplacement;
uniform float uTime;

varying vec3 vWorldPos;
varying vec3 vWorldNormal;
varying vec3 vViewDir;
varying vec3 vSamplePos;

float fbm(vec3 p) {
  return snoise(p) * 0.5 + snoise(p * 2.0) * 0.25 + snoise(p * 4.0) * 0.125;
}

void main(){
  vec3 sp = position * uNoiseScale + vec3(0.0, uTime * 0.02, 0.0);
  float n = fbm(sp);
  vec3 displaced = position + normal * n * uDisplacement;

  // Perturbed normal via finite-difference noise gradient
  float eps = 0.01;
  float nx = fbm(sp + vec3(eps, 0.0, 0.0)) - fbm(sp - vec3(eps, 0.0, 0.0));
  float ny = fbm(sp + vec3(0.0, eps, 0.0)) - fbm(sp - vec3(0.0, eps, 0.0));
  float nz = fbm(sp + vec3(0.0, 0.0, eps)) - fbm(sp - vec3(0.0, 0.0, eps));
  vec3 noiseGrad = vec3(nx, ny, nz) / (2.0 * eps);
  vec3 perturbedNormal = normalize(normal - noiseGrad * uDisplacement * uNoiseScale);

  vWorldPos    = (modelMatrix * vec4(displaced, 1.0)).xyz;
  vWorldNormal = normalize((modelMatrix * vec4(perturbedNormal, 0.0)).xyz);
  vSamplePos   = sp;

  vec4 mvPos = modelViewMatrix * vec4(displaced, 1.0);
  vViewDir   = normalize(-mvPos.xyz);
  gl_Position = projectionMatrix * mvPos;
}
`;

/* ------------------------------------------------------------------ */
/*  Fragment shader: noise color + uniform-driven lighting +           */
/*  per-world signature + tonemapping + colorspace conversion          */
/* ------------------------------------------------------------------ */

const SURFACE_FRAG = /* glsl */ `
${NOISE_GLSL}
uniform vec3  uColorA;
uniform vec3  uColorB;
uniform vec3  uColorC;
uniform float uNoiseScale;
uniform float uRoughness;
uniform float uMetalness;
uniform float uTime;
uniform vec3  uKeyLightDir;
uniform vec3  uFillLightDir;
uniform vec3  uKeyLightColor;
uniform vec3  uFillLightColor;
uniform float uKeyIntensity;
uniform float uFillIntensity;
uniform float uAmbientIntensity;
uniform int   uWorldType; // 0=personal, 1=skills, 2=projects, 3=experience

varying vec3 vWorldPos;
varying vec3 vWorldNormal;
varying vec3 vViewDir;
varying vec3 vSamplePos;

void main(){
  float n = snoise(vSamplePos * 0.35) * 0.5
          + snoise(vSamplePos * 0.35 * 2.1) * 0.25
          + snoise(vSamplePos * 0.35 * 4.3) * 0.125;
  n = n * 0.5 + 0.5;

  // 3-stop color ramp
  vec3 col;
  if(n < 0.38)      col = mix(uColorA, uColorB, n / 0.38);
  else if(n < 0.68) col = mix(uColorB, uColorC, (n - 0.38) / 0.30);
  else              col = uColorC;

  vec3 N = normalize(vWorldNormal);
  vec3 V = normalize(vViewDir);

  // --- Per-world signature ---
  if (uWorldType == 1 || uWorldType == 3) {
    // Skills + Experience: latitude banding
    float lat = abs(N.y);
    float bandFreq = uWorldType == 3 ? 22.0 : 18.0;
    float bands = smoothstep(0.2, 0.9, sin(lat * bandFreq + uTime * 0.1) * 0.5 + 0.5);
    col = mix(col, uColorC, bands * 0.12);
    // Experience: slight warm color shift in storm bands
    if (uWorldType == 3) {
      col = mix(col, uColorA * 1.2, bands * 0.06);
    }
  }
  if (uWorldType == 2) {
    // Projects: ridged noise for cratered/ridged feel
    float ridged = 1.0 - abs(snoise(vSamplePos * 0.8));
    col *= 0.9 + ridged * 0.12;
  }

  // --- Lighting with real scene intensities ---
  vec3 L1 = normalize(uKeyLightDir);
  vec3 L2 = normalize(uFillLightDir);

  // Key light with wrap lighting for softer falloff
  float wrap = 0.25;
  float NdotL1w = clamp((dot(N, L1) + wrap) / (1.0 + wrap), 0.0, 1.0);
  vec3 H1 = normalize(L1 + V);
  float specPow = mix(128.0, 12.0, uRoughness);
  float spec1 = pow(max(dot(N, H1), 0.0), specPow) * mix(0.04, 0.35, uMetalness);
  vec3 key = uKeyLightColor * uKeyIntensity * (NdotL1w + spec1);

  // Fill light
  float NdotL2 = max(dot(N, L2), 0.0);
  vec3 fill = uFillLightColor * uFillIntensity * (NdotL2 * 0.6);

  // Ambient
  vec3 ambient = col * uAmbientIntensity;

  // Skills: icy fresnel highlight -- boost specular near rim
  if (uWorldType == 1) {
    float rimSpec = pow(1.0 - max(dot(N, V), 0.0), 3.0);
    key += uKeyLightColor * rimSpec * 0.15 * uKeyIntensity;
  }

  vec3 lit = col * (key + fill) + ambient;

  gl_FragColor = vec4(lit, 1.0);
}
`;

/* ------------------------------------------------------------------ */
/*  Cloud layer shader for Personal planet                             */
/* ------------------------------------------------------------------ */

const CLOUD_VERT = /* glsl */ `
${NOISE_GLSL}
varying vec3 vSamplePos;
varying vec3 vNormal;
varying vec3 vViewDir;
uniform float uTime;

void main() {
  vSamplePos = position * 3.0 + vec3(uTime * 0.04, uTime * 0.015, 0.0);
  vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vViewDir = normalize(-mvPos.xyz);
  gl_Position = projectionMatrix * mvPos;
}
`;

const CLOUD_FRAG = /* glsl */ `
${NOISE_GLSL}
uniform vec3 uColor;
varying vec3 vSamplePos;
varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
  float n = snoise(vSamplePos) * 0.5 + snoise(vSamplePos * 2.2) * 0.25;
  n = smoothstep(0.1, 0.6, n * 0.5 + 0.5);
  // Fade at edges like real cloud cover
  float rim = pow(max(dot(vNormal, vViewDir), 0.0), 0.8);
  float alpha = n * rim * 0.06;
  gl_FragColor = vec4(uColor, alpha);
}
`;

/* ------------------------------------------------------------------ */
/*  Per-planet material personality                                    */
/* ------------------------------------------------------------------ */

interface PlanetProfile {
  noiseScale: number;
  displacement: number;
  roughness: number;
  metalness: number;
  tilt: number;
  spin: number;
}

const PROFILES: Record<WorldId, PlanetProfile> = {
  personal:   { noiseScale: 2.8, displacement: 0.045, roughness: 0.65, metalness: 0.05, tilt: 0.15,  spin: 0.06 },
  skills:     { noiseScale: 4.5, displacement: 0.02,  roughness: 0.40, metalness: 0.25, tilt: -0.12, spin: 0.08 },
  projects:   { noiseScale: 2.0, displacement: 0.035, roughness: 0.50, metalness: 0.15, tilt: 0.22,  spin: 0.04 },
  experience: { noiseScale: 3.5, displacement: 0.025, roughness: 0.55, metalness: 0.10, tilt: -0.18, spin: 0.07 },
};

const WORLD_TYPE_MAP: Record<WorldId, number> = {
  personal: 0,
  skills: 1,
  projects: 2,
  experience: 3,
};

/* Scene light values -- must match scene.tsx */
const KEY_LIGHT_DIR = new THREE.Vector3(10, 14, 8).normalize();
const FILL_LIGHT_DIR = new THREE.Vector3(-8, 6, -6).normalize();
const KEY_LIGHT_COLOR = new THREE.Color("#fef3c7");
const FILL_LIGHT_COLOR = new THREE.Color("#a5b4fc");
const KEY_INTENSITY = 1.8;
const FILL_INTENSITY = 0.4;
const AMBIENT_INTENSITY = 0.25;

/* ------------------------------------------------------------------ */
/*  Selection ring                                                     */
/* ------------------------------------------------------------------ */

function SelectionRing({ show, color }: { show: boolean; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = THREE.MathUtils.lerp(
      mat.opacity,
      show ? 0.35 : 0,
      1 - Math.pow(0.003, delta),
    );
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]}>
      <torusGeometry args={[1.22, 0.005, 16, 128]} />
      <meshBasicMaterial color={color} transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/*  Cloud layer mesh for Personal planet                               */
/* ------------------------------------------------------------------ */

function CloudLayer({ color }: { color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const cloudMat = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: CLOUD_VERT,
      fragmentShader: CLOUD_FRAG,
      uniforms: {
        uColor: { value: new THREE.Color(color).lerp(new THREE.Color("#ffffff"), 0.7) },
        uTime: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.FrontSide,
    });
    mat.toneMapped = false;
    return mat;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    cloudMat.uniforms.uColor.value
      .set(color)
      .lerp(new THREE.Color("#ffffff"), 0.7);
  }, [color, cloudMat]);

  useFrame((state, delta) => {
    cloudMat.uniforms.uTime.value = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.09;
    }
  });

  return (
    <mesh ref={meshRef} scale={1.03}>
      <sphereGeometry args={[1, 48, 48]} />
      <primitive object={cloudMat} attach="material" />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/*  Planet component                                                   */
/* ------------------------------------------------------------------ */

interface PlanetProps {
  world: WorldData;
  isActive: boolean;
  onSelect: (id: WorldId) => void;
}

export function Planet({ world, isActive, onSelect }: PlanetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef  = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const highlighted = hovered || isActive;

  const profile = PROFILES[world.id];
  const worldType = WORLD_TYPE_MAP[world.id];

  // Build surface material once
  const surfaceMat = useMemo(() => {
    const base  = new THREE.Color(world.color);
    const dark  = new THREE.Color(world.color).multiplyScalar(0.3);
    const light = base.clone().lerp(new THREE.Color("#ffffff"), 0.35);

    const mat = new THREE.ShaderMaterial({
      vertexShader: SURFACE_VERT,
      fragmentShader: SURFACE_FRAG,
      uniforms: {
        uColorA:          { value: dark },
        uColorB:          { value: base },
        uColorC:          { value: light },
        uNoiseScale:      { value: profile.noiseScale },
        uDisplacement:    { value: profile.displacement },
        uRoughness:       { value: profile.roughness },
        uMetalness:       { value: profile.metalness },
        uTime:            { value: 0 },
        uKeyLightDir:     { value: KEY_LIGHT_DIR },
        uFillLightDir:    { value: FILL_LIGHT_DIR },
        uKeyLightColor:   { value: KEY_LIGHT_COLOR },
        uFillLightColor:  { value: FILL_LIGHT_COLOR },
        uKeyIntensity:    { value: KEY_INTENSITY },
        uFillIntensity:   { value: FILL_INTENSITY },
        uAmbientIntensity:{ value: AMBIENT_INTENSITY },
        uWorldType:       { value: worldType },
      },
    });
    mat.toneMapped = false;
    return mat;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync uniforms when world.color or profile changes
  useEffect(() => {
    const u = surfaceMat.uniforms;
    const base = new THREE.Color(world.color);
    u.uColorA.value.copy(base).multiplyScalar(0.3);
    u.uColorB.value.copy(base);
    u.uColorC.value.copy(base).lerp(new THREE.Color("#ffffff"), 0.35);
    u.uNoiseScale.value = profile.noiseScale;
    u.uDisplacement.value = profile.displacement;
    u.uRoughness.value = profile.roughness;
    u.uMetalness.value = profile.metalness;
    u.uWorldType.value = worldType;
  }, [world.color, profile, worldType, surfaceMat]);

  // Animate time + axial rotation
  useFrame((state, delta) => {
    surfaceMat.uniforms.uTime.value = state.clock.elapsedTime;
    if (groupRef.current) {
      const targetScale = world.scale * (hovered ? 1.06 : 1);
      const nextScale = THREE.MathUtils.lerp(
        groupRef.current.scale.x,
        targetScale,
        1 - Math.pow(0.002, delta),
      );
      groupRef.current.scale.setScalar(nextScale);
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * profile.spin;
    }
  });

  const pointerEnter = useCallback((e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
  }, []);
  const pointerLeave = useCallback(() => {
    setHovered(false);
    document.body.style.cursor = "default";
  }, []);
  const click = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      onSelect(world.id);
    },
    [onSelect, world.id],
  );

  return (
    <group ref={groupRef} position={world.position} scale={world.scale}>
      <group rotation={[profile.tilt, 0, 0]}>
        {/* Planet surface */}
        <mesh
          ref={meshRef}
          onPointerEnter={pointerEnter}
          onPointerLeave={pointerLeave}
          onClick={click}
        >
          <sphereGeometry args={[1, 64, 64]} />
          <primitive object={surfaceMat} attach="material" />
        </mesh>

        {/* Cloud layer -- only for Personal planet */}
        {world.id === "personal" && <CloudLayer color={world.color} />}

        {/* Atmosphere rim glow */}
        <Atmosphere
          radius={1.12}
          color={world.color}
          intensity={highlighted ? 0.85 : 0.4}
        />

        {/* Selection ring */}
        <SelectionRing show={highlighted} color={world.color} />

        {/* Per-world unique feature */}
        <PlanetFeature worldId={world.id} color={world.color} />
      </group>

      {/* Billboard label with backing plate */}
      <group position={[0, -1.5, 0]}>
        <Suspense fallback={null}>
          <Billboard follow lockX={false} lockY={false} lockZ={false}>
            {/* Border plate */}
            <mesh position={[0, 0, -0.02]}>
              <planeGeometry args={[world.label.length * 0.145 + 0.5, 0.42]} />
              <meshBasicMaterial
                color={highlighted ? world.color : "#1e293b"}
                transparent
                opacity={highlighted ? 0.5 : 0.18}
                depthWrite={false}
              />
            </mesh>
            {/* Fill plate */}
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[world.label.length * 0.145 + 0.42, 0.36]} />
              <meshBasicMaterial
                color="#0b1120"
                transparent
                opacity={0.88}
                depthWrite={false}
              />
            </mesh>
            <Text
              font="/fonts/Geist-Bold.ttf"
              fontSize={0.19}
              anchorX="center"
              anchorY="middle"
              color={highlighted ? "#f1f5f9" : "#94a3b8"}
            >
              {world.label}
            </Text>
          </Billboard>
        </Suspense>
      </group>
    </group>
  );
}
