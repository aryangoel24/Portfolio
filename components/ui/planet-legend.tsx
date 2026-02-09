"use client";

import React from "react"

import { motion } from "framer-motion";
import { WORLDS, type WorldId } from "@/lib/portfolio-data";

interface PlanetLegendProps {
  onSelect: (id: WorldId) => void;
}

export function PlanetLegend({ onSelect }: PlanetLegendProps) {
  return (
    <motion.nav
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 1.2 }}
      className="absolute right-6 top-1/2 -translate-y-1/2 z-10 hidden md:flex flex-col gap-3"
      aria-label="Planet navigation"
    >
      {WORLDS.map((world) => (
        <button
          key={world.id}
          type="button"
          onClick={() => onSelect(world.id)}
          className="group flex items-center gap-2.5 bg-transparent border-none cursor-pointer p-0 text-left"
        >
          <span
            className="block h-2.5 w-2.5 rounded-full shrink-0 transition-shadow duration-300 group-hover:shadow-[0_0_8px_var(--dot-color)]"
            style={{
              background: world.color,
              "--dot-color": world.color,
            } as React.CSSProperties}
          />
          <span className="text-xs font-mono text-muted-foreground group-hover:text-foreground transition-colors duration-200">
            {world.label}
          </span>
        </button>
      ))}
    </motion.nav>
  );
}
