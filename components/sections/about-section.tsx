"use client";

import { ABOUT } from "@/lib/portfolio-data";
import { BackToTop } from "./back-to-top";

export function AboutSection() {
  return (
    <section
      id="about"
      className="relative min-h-screen bg-background px-6 py-24 md:px-12 lg:px-24"
    >
      <div className="mx-auto max-w-4xl">
        {/* Section label */}
        <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">
          01 / About
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance leading-tight">
          {ABOUT.name}
        </h2>
        <p className="mt-1 text-base font-mono text-primary">{ABOUT.title}</p>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:gap-16">
          {/* Avatar placeholder */}
          <div className="flex-shrink-0">
            <div className="h-40 w-40 rounded-2xl border border-border bg-secondary flex items-center justify-center">
              <span className="text-5xl font-bold text-primary">
                {ABOUT.name.charAt(0)}
              </span>
            </div>
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-6">
            <p className="text-base text-muted-foreground leading-relaxed">
              {ABOUT.bio}
            </p>

            {/* Socials */}
            <div className="flex flex-wrap gap-3">
              {ABOUT.socials.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  className="rounded-lg border border-border px-4 py-2 text-xs font-mono text-secondary-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </div>

            {/* Resume CTA */}
            <div className="flex flex-wrap gap-3">
              <a
                href={ABOUT.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-primary px-4 py-2 text-xs font-mono text-primary hover:border-primary/80 hover:text-primary/90 transition-colors"
              >
                View Resume
              </a>
            </div>
          </div>
        </div>

        <BackToTop />
      </div>

      {/* Subtle divider glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />
    </section>
  );
}
