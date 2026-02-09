"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { WORLDS, type WorldId } from "@/lib/portfolio-data";

const OVERVIEW_POS = new THREE.Vector3(1, 10, 18);
const OVERVIEW_TARGET = new THREE.Vector3(1, 0, 0);

interface CameraControllerProps {
  activeWorld: WorldId | null;
}

/**
 * Subtle camera nudge toward the selected planet, then auto-resets to overview.
 * No extreme zoom -- just a gentle ease 30% of the way toward the planet.
 */
export function CameraController({ activeWorld }: CameraControllerProps) {
  const { camera } = useThree();
  const targetPos = useRef(OVERVIEW_POS.clone());
  const targetLookAt = useRef(OVERVIEW_TARGET.clone());
  const currentLookAt = useRef(OVERVIEW_TARGET.clone());

  useEffect(() => {
    if (activeWorld) {
      const world = WORLDS.find((w) => w.id === activeWorld);
      if (world) {
        // Move 30% of the way from overview toward the planet (subtle nudge)
        const planetPos = new THREE.Vector3(...world.position);
        const nudgedPos = OVERVIEW_POS.clone().lerp(
          new THREE.Vector3(
            planetPos.x,
            planetPos.y + 5,
            planetPos.z + 10
          ),
          0.3
        );
        targetPos.current.copy(nudgedPos);
        targetLookAt.current.copy(planetPos);
      }
    } else {
      targetPos.current.copy(OVERVIEW_POS);
      targetLookAt.current.copy(OVERVIEW_TARGET);
    }
  }, [activeWorld]);

  useFrame((_, delta) => {
    const lerpFactor = 1 - Math.pow(0.003, delta);
    camera.position.lerp(targetPos.current, lerpFactor);
    currentLookAt.current.lerp(targetLookAt.current, lerpFactor);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}
