"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Github, Linkedin } from "lucide-react";
import { ABOUT } from "@/lib/portfolio-data";

export function HeaderOverlay() {
  const [showPlanetHint, setShowPlanetHint] = useState(true);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const githubUrl = "https://github.com/aryangoel24";
  const linkedInUrl = "https://www.linkedin.com/in/aryangoel/"

  useEffect(() => {
    const updateHintVisibility = () => {
      const heroHeight = window.innerHeight;
      setShowPlanetHint(window.scrollY < heroHeight - 80);
    };

    updateHintVisibility();
    window.addEventListener("scroll", updateHintVisibility, { passive: true });
    window.addEventListener("resize", updateHintVisibility);
    return () => {
      window.removeEventListener("scroll", updateHintVisibility);
      window.removeEventListener("resize", updateHintVisibility);
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-20 pointer-events-none">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="pointer-events-auto"
        >
          <button
            type="button"
            onClick={scrollToTop}
            className="text-lg font-bold tracking-tight text-foreground hover:text-primary transition-colors bg-transparent border-none cursor-pointer p-0"
          >
            aryan<span className="text-primary">.goel</span>
          </button>
        </motion.div>

        {/* Center hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showPlanetHint ? 1 : 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="hidden md:block"
          style={{ pointerEvents: "none" }}
          aria-hidden={!showPlanetHint}
        >
          <p className="text-xs font-mono text-muted-foreground">
            Click a planet to explore
          </p>
        </motion.div>

        {/* Social links */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="pointer-events-auto flex items-center gap-2"
        >
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="rounded-full border border-border p-2 text-foreground hover:bg-primary/10 hover:border-primary transition-colors"
          >
            <Github size={16} />
          </a>
          <a
            href={linkedInUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="rounded-full border border-border p-2 text-foreground hover:bg-primary/10 hover:border-primary transition-colors"
          >
            <Linkedin size={16} />
          </a>
          <a
            href={ABOUT.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Resume"
            className="rounded-full border border-border p-2 text-foreground hover:bg-primary/10 hover:border-primary transition-colors"
          >
            <FileText size={16} />
          </a>
        </motion.div>
      </div>
    </header>
  );
}
