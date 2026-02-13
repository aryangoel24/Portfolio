# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev          # Start Next.js dev server
npm run build        # Production build (TS errors ignored via next.config.mjs)
npm start            # Start production server
npm run lint         # ESLint
```

## Tech Stack

- **Next.js 16** (App Router) with **React 19** and **TypeScript** (strict mode)
- **Three.js** via React Three Fiber + Drei for 3D rendering
- **Framer Motion** for DOM animations
- **Tailwind CSS 3** with HSL CSS variables, custom colors, Space Grotesk/Space Mono fonts
- **shadcn/ui** (Radix UI primitives) for accessible UI components
- Path alias: `@/*` maps to project root

## Architecture

This is an interactive 3D portfolio website. A solar system scene serves as the hero, with clickable planets that navigate to content sections.

### Key Directories

- `app/` — Next.js App Router (single-page site: `page.tsx` is the main entry)
- `components/three/` — 3D scene: `scene.tsx` (Canvas wrapper), `planet.tsx` (procedural shader planets), `camera-controller.tsx` (smooth easing), `sun.tsx`, `stars-background.tsx` (instanced mesh), `atmosphere.tsx` (Fresnel rim-glow)
- `components/sections/` — Content sections (about, skills, projects, experience)
- `components/ui/` — shadcn/UI components plus `header-overlay.tsx` and `planet-legend.tsx`
- `lib/portfolio-data.ts` — **Central data file**: all portfolio content, planet definitions (`WORLDS`), camera positions, types (`WorldData`, `Project`, etc.)
- `lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)

### Data-Driven Pattern

All content flows from `lib/portfolio-data.ts`. To update portfolio content (projects, skills, experience), edit this single file. Planet positions, colors, and camera angles are also defined here.

### 3D Scene

- The scene is dynamically imported with SSR disabled in `app/page.tsx`
- Planets use custom GLSL shaders (simplex noise for procedural displacement)
- Stars use instanced meshes (1500 instances) for performance
- Camera smoothly eases to a planet's predefined position on click, then scrolls to the matching section

### Build Configuration

- `next.config.mjs`: TypeScript build errors are ignored; images are unoptimized (static hosting)
- `tailwind.config.ts`: Dark mode via class, custom design tokens (teal primary #14b8a6), chart colors, tailwindcss-animate plugin
- `components.json`: shadcn/ui config with RSC enabled
