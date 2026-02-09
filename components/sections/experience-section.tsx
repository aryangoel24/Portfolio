"use client";

import { EXPERIENCES_DETAIL } from "@/lib/portfolio-data";
import { BackToTop } from "./back-to-top";

export function ExperienceSection() {
  return (
    <section
      id="experience"
      className="relative min-h-screen bg-card px-6 py-24 md:px-12 lg:px-24"
    >
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">
          04 / Experience
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-card-foreground text-balance leading-tight">
          Work Experience
        </h2>
        <p className="mt-2 text-base text-muted-foreground leading-relaxed max-w-lg">
          A timeline of the companies and roles that have shaped my career.
        </p>

        <div className="mt-12 flex flex-col gap-8">
          {EXPERIENCES_DETAIL.map((exp, i) => (
            <div
              key={exp.company}
              className="relative flex gap-6"
            >
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <div className="h-3 w-3 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                {i < EXPERIENCES_DETAIL.length - 1 && (
                  <div className="w-px flex-1 bg-border mt-2" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-8 rounded-xl border border-border bg-background p-5">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-base font-bold text-card-foreground">
                    {exp.company}
                  </h3>
                  <span className="text-xs font-mono text-muted-foreground">
                    {exp.period}
                  </span>
                </div>
                <p className="mt-1 text-sm font-mono text-primary">
                  {exp.role}
                </p>
                <ul className="mt-4 flex flex-col gap-2">
                  {exp.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex gap-3 text-sm text-muted-foreground leading-relaxed"
                    >
                      <span className="text-primary flex-shrink-0 mt-0.5">
                        {">"}
                      </span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <BackToTop />
      </div>
    </section>
  );
}
