"use client";

import { PROJECTS_DETAIL } from "@/lib/portfolio-data";
import { BackToTop } from "./back-to-top";

export function ProjectsSection() {
  return (
    <section
      id="projects"
      className="relative min-h-screen bg-background px-6 py-24 md:px-12 lg:px-24"
    >
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">
          03 / Projects
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance leading-tight">
          Featured Projects
        </h2>
        <p className="mt-2 text-base text-muted-foreground leading-relaxed max-w-lg">
          A selection of personal and professional projects that showcase my
          skills across the full stack.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {PROJECTS_DETAIL.map((project) => (
            <div
              key={project.title}
              className="group rounded-xl border border-border bg-card p-6 flex flex-col gap-4 hover:border-primary/40 transition-colors"
            >
              {/* Color accent bar */}
              <div className="h-1 w-12 rounded-full bg-primary" />

              <h3 className="text-lg font-bold text-card-foreground">
                {project.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-secondary px-2.5 py-1 text-xs font-mono text-secondary-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <a
                href={project.url}
                className="text-xs font-mono text-primary hover:underline mt-auto self-start"
              >
                {"View Project ->"}
              </a>
            </div>
          ))}
        </div>

        <BackToTop />
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />
    </section>
  );
}
