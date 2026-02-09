"use client";

import { motion } from "framer-motion";

export function HeaderOverlay() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="hidden md:block"
        >
          <p className="text-xs font-mono text-muted-foreground">
            Click a planet to explore
          </p>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="pointer-events-auto"
        >
          <a
            href="mailto:aryangoel24@gmail.com"
            className="rounded-full border border-border px-4 py-2 text-xs font-mono text-foreground hover:bg-primary/10 hover:border-primary transition-colors"
          >
            Contact
          </a>
        </motion.div>
      </div>
    </header>
  );
}
