"use client";

import { SKILLS_DETAIL } from "@/lib/portfolio-data";
import { BackToTop } from "./back-to-top";

export function SkillsSection() {
  return (
    <section
      id="skills"
      className="relative min-h-screen bg-card px-6 py-24 md:px-12 lg:px-24"
    >
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">
          02 / Skills
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-card-foreground text-balance leading-tight">
          Technical Skills
        </h2>
        <p className="mt-2 text-base text-muted-foreground leading-relaxed max-w-lg">
          Languages, frameworks, and tools I use to build reliable software --
          from systems programming to full-stack web and ML.
        </p>

        <div className="mt-12 flex flex-col gap-10">
          {SKILLS_DETAIL.map((group) => (
            <div key={group.category}>
              <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">
                {group.category}
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {group.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg border border-border bg-background px-3.5 py-2 text-sm font-mono text-card-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <BackToTop />
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />
    </section>
  );
}
