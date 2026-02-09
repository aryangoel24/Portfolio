"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import type { WorldId } from "@/lib/portfolio-data";
import { HeaderOverlay } from "@/components/ui/header-overlay";
import { PlanetLegend } from "@/components/ui/planet-legend";
import { AboutSection } from "@/components/sections/about-section";
import { SkillsSection } from "@/components/sections/skills-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { ExperienceSection } from "@/components/sections/experience-section";

const Scene = dynamic(
  () => import("@/components/three/scene").then((mod) => mod.Scene),
  { ssr: false },
);

const WORLD_TO_SECTION: Record<WorldId, string> = {
  personal: "about",
  skills: "skills",
  projects: "projects",
  experience: "experience",
};

export default function Page() {
  const [activeWorld, setActiveWorld] = useState<WorldId | null>(null);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleSelectWorld = useCallback((id: WorldId | null) => {
    setActiveWorld(id);

    if (id) {
      // Small camera ease happens automatically via CameraController.
      // After a brief delay, smooth-scroll to the matching HTML section.
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        const sectionId = WORLD_TO_SECTION[id];
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
        // Reset active world after scroll so camera returns to overview
        setTimeout(() => setActiveWorld(null), 1200);
      }, 600);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveWorld(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative">
      {/* Header */}
      <HeaderOverlay />

      {/* Hero: 3D Solar System */}
      <section className="relative h-screen w-full">
        <div className="absolute inset-0">
          <Scene activeWorld={activeWorld} onSelectWorld={handleSelectWorld} />
        </div>

        {/* Legend sidebar */}
        <PlanetLegend onSelect={handleSelectWorld} />

        {/* Welcome text overlay */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="absolute left-6 bottom-12 md:left-12 md:bottom-16 z-10 pointer-events-none max-w-sm"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground text-balance leading-tight">
            Hi I'm Aryan
            <br />
            <span className="text-primary">Software Engineer</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Navigate to each planet to discover my story, skills, projects, and
            experience -- or just scroll down.
          </p>

          {/* Scroll hint */}
          <div className="mt-8 flex items-center gap-2 text-muted-foreground">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-bounce"
              aria-hidden="true"
            >
              <path d="M12 5v14" />
              <path d="m19 12-7 7-7-7" />
            </svg>
            <span className="text-xs font-mono">Scroll to explore</span>
          </div>
        </motion.div>
      </section>

      {/* Content sections */}
      <AboutSection />
      <SkillsSection />
      <ProjectsSection />
      <ExperienceSection />
    </div>
  );
}
