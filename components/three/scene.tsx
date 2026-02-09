"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { StarsBackground } from "./stars-background";
import { Planet } from "./planet";
import { Sun } from "./sun";
import { CameraController } from "./camera-controller";
import { WORLDS, type WorldId } from "@/lib/portfolio-data";

interface SceneProps {
  activeWorld: WorldId | null;
  onSelectWorld: (id: WorldId) => void;
}

function SceneContent({ activeWorld, onSelectWorld }: SceneProps) {
  return (
    <>
      {/* Key directional -- warm, from upper right-front */}
      <directionalLight position={[10, 14, 8]} intensity={1.8} color="#fef3c7" />

      {/* Cool fill from left for rim definition */}
      <directionalLight position={[-8, 6, -6]} intensity={0.4} color="#a5b4fc" />

      {/* Ambient base */}
      <ambientLight intensity={0.25} color="#cbd5e1" />

      {/* Hemisphere for soft sky/ground color */}
      <hemisphereLight args={["#475569", "#0f172a", 0.35]} />

      <StarsBackground count={1500} />
      <Sun />

      {WORLDS.map((world) => (
        <Planet
          key={world.id}
          world={world}
          isActive={activeWorld === world.id}
          onSelect={onSelectWorld}
        />
      ))}

      <CameraController activeWorld={activeWorld} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Scene wrapper with loading overlay                                 */
/* ------------------------------------------------------------------ */
export function Scene({ activeWorld, onSelectWorld }: SceneProps) {
  const [ready, setReady] = useState(false);

  const handleCreated = useCallback(() => {
    const id = setTimeout(() => setReady(true), 600);
    return () => clearTimeout(id);
  }, []);

  const cameraConfig = useMemo(
    () => ({
      position: [1, 10, 18] as [number, number, number],
      fov: 55,
      near: 0.1,
      far: 200,
    }),
    [],
  );

  return (
    <div className="relative h-full w-full">
      {/* Loading overlay */}
      <div
        className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background"
        style={{
          opacity: ready ? 0 : 1,
          pointerEvents: ready ? "none" : "auto",
          transition: "opacity 0.8s ease-out",
        }}
      >
        <LoadingIndicator />
      </div>

      <Canvas
        camera={cameraConfig}
        style={{ background: "#0b1120" }}
        onPointerMissed={() => onSelectWorld(null as unknown as WorldId)}
        onCreated={handleCreated}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        gl={{ antialias: true, alpha: false }}
      >
        <SceneContent activeWorld={activeWorld} onSelectWorld={onSelectWorld} />
      </Canvas>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Loading indicator                                                  */
/* ------------------------------------------------------------------ */
function LoadingIndicator() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame: number;
    const start = Date.now();
    const duration = 2000;

    function tick() {
      const elapsed = Date.now() - start;
      const t = Math.min(elapsed / duration, 1);
      setProgress(Math.round(t * t * (3 - 2 * t) * 95));
      if (t < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const circumference = 2 * Math.PI * 24;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative h-16 w-16">
        <svg
          className="h-16 w-16 -rotate-90"
          viewBox="0 0 56 56"
          role="img"
          aria-label={`Loading ${progress}%`}
        >
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke="hsl(220,15%,18%)"
            strokeWidth="2.5"
          />
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke="hsl(173,80%,50%)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 0.15s ease-out" }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-mono text-muted-foreground">
          {progress}%
        </span>
      </div>
      <p className="text-sm font-mono text-muted-foreground tracking-wide">
        Initializing solar system
      </p>
    </div>
  );
}
