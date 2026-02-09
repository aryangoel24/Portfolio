export type WorldId = "personal" | "skills" | "projects" | "experience";

export interface MoonData {
  label: string;
  color: string;
  orbitRadius: number;
  orbitSpeed: number;
  size: number;
  /** Extra payload for each world type */
  meta?: Record<string, unknown>;
}

export interface WorldData {
  id: WorldId;
  label: string;
  position: [number, number, number];
  color: string;
  emissive: string;
  scale: number;
  moons: MoonData[];
}

/* ------------------------------------------------------------------ */
/*  Planet positions along a flat solar-system plane                   */
/* ------------------------------------------------------------------ */
export const WORLDS: WorldData[] = [
  {
    id: "personal",
    label: "Personal",
    position: [-8, 0, 0],
    color: "#14b8a6",
    emissive: "#0d9488",
    scale: 1.6,
    moons: [
      { label: "GitHub", color: "#a5b4fc", orbitRadius: 2.6, orbitSpeed: 0.4, size: 0.18 },
      { label: "LinkedIn", color: "#38bdf8", orbitRadius: 3.0, orbitSpeed: 0.3, size: 0.15 },
      { label: "UofT", color: "#002a5c", orbitRadius: 3.5, orbitSpeed: 0.22, size: 0.14 },
    ],
  },
  {
    id: "skills",
    label: "Skills",
    position: [-2.5, 0, -3],
    color: "#3b82f6",
    emissive: "#2563eb",
    scale: 1.3,
    moons: [
      { label: "Python", color: "#3776ab", orbitRadius: 2.2, orbitSpeed: 0.45, size: 0.2 },
      { label: "C/C++", color: "#00599c", orbitRadius: 2.6, orbitSpeed: 0.38, size: 0.18 },
      { label: "React", color: "#61dafb", orbitRadius: 3.0, orbitSpeed: 0.32, size: 0.17 },
      { label: "Node.js", color: "#68a063", orbitRadius: 3.4, orbitSpeed: 0.27, size: 0.16 },
      { label: "PyTorch", color: "#ee4c2c", orbitRadius: 3.8, orbitSpeed: 0.22, size: 0.15 },
      { label: "Docker", color: "#2496ed", orbitRadius: 4.2, orbitSpeed: 0.18, size: 0.14 },
    ],
  },
  {
    id: "projects",
    label: "Projects",
    position: [4, 0, 1],
    color: "#f59e0b",
    emissive: "#d97706",
    scale: 1.45,
    moons: [
      { label: "KV Store", color: "#fbbf24", orbitRadius: 2.8, orbitSpeed: 0.38, size: 0.22, meta: { tags: ["C++", "LSM-tree", "B-tree"], desc: "LSM-tree based key-value store with SST persistence and bloom filters." } },
      { label: "SkillSprint", color: "#fb923c", orbitRadius: 3.4, orbitSpeed: 0.28, size: 0.2, meta: { tags: ["Next.js", "TypeScript", "Firebase"], desc: "AI-driven skill-building platform with modular widget architecture." } },
      { label: "PetPal", color: "#f97316", orbitRadius: 4.0, orbitSpeed: 0.22, size: 0.18, meta: { tags: ["Django", "React", "REST API"], desc: "Full-stack pet adoption platform with CI/CD and 80% test coverage." } },
    ],
  },
  {
    id: "experience",
    label: "Experience",
    position: [10, 0, -1],
    color: "#ec4899",
    emissive: "#db2777",
    scale: 1.25,
    moons: [
      { label: "Shopify", color: "#95bf47", orbitRadius: 2.5, orbitSpeed: 0.4, size: 0.2, meta: { role: "Software Engineering Intern", period: "May 2025 - Dec 2025" } },
      { label: "Algoverse", color: "#f472b6", orbitRadius: 3.0, orbitSpeed: 0.32, size: 0.18, meta: { role: "Research Engineer", period: "Sep 2025 - Present" } },
      { label: "Veeva Systems", color: "#e879f9", orbitRadius: 3.5, orbitSpeed: 0.25, size: 0.17, meta: { role: "Software Engineering Intern", period: "May 2024 - Apr 2025" } },
      { label: "BMO Lab", color: "#c084fc", orbitRadius: 4.0, orbitSpeed: 0.2, size: 0.15, meta: { role: "Software Developer", period: "May 2023 - Aug 2023" } },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Camera positions: overview sees full solar system                  */
/* ------------------------------------------------------------------ */
export const CAMERA_POSITIONS: Record<
  WorldId | "overview",
  { position: [number, number, number]; target: [number, number, number] }
> = {
  overview: { position: [1, 10, 18], target: [1, 0, 0] },
  personal: { position: [-6, 3.5, 6], target: [-8, 0, 0] },
  skills: { position: [-0.5, 3.5, 3.5], target: [-2.5, 0, -3] },
  projects: { position: [6, 3.5, 7], target: [4, 0, 1] },
  experience: { position: [12, 3.5, 5], target: [10, 0, -1] },
};

/* ------------------------------------------------------------------ */
/*  Detailed section data for HTML panels                             */
/* ------------------------------------------------------------------ */
export const ABOUT = {
  name: "Aryan Goel",
  title: "Software Engineer",
  bio: "Hi, I'm Aryan, a Computer Science Specialist at the University of Toronto (cGPA 3.96), graduating in May 2026, and actively seeking full-time Software Engineer new grad roles. When I'm not coding or building stuff, I split my time between basketball courts and FIFA matches. Happy to connect or chat. Feel free to reach out at aryangoel24@gmail.com :)",
  socials: [
    { label: "GitHub", url: "https://github.com/aryangoel24" },
    { label: "LinkedIn", url: "https://linkedin.com/in/aryangoel24" },
    { label: "Email", url: "mailto:aryangoel24@gmail.com" },
  ],
};

export interface SkillCategory {
  category: string;
  skills: string[];
}

export const SKILLS_DETAIL: SkillCategory[] = [
  {
    category: "Languages",
    skills: ["Python", "C/C++", "Java", "JavaScript", "TypeScript", "SQL", "Bash", "Ruby on Rails"],
  },
  {
    category: "Frameworks",
    skills: ["React", "Redis", "Node.js", "Express", "Django", "GraphQL", "PyTorch", "TensorFlow", "Next.js"],
  },
  {
    category: "Tools",
    skills: ["Git", "Docker", "PostgreSQL", "SQL Server", "Salesforce", "Jest", "Mockito", "CI/CD", "Jenkins", "Kafka", "NoSQL", "Linux"],
  },
];

export interface Project {
  title: string;
  description: string;
  tags: string[];
  url: string;
}

export const PROJECTS_DETAIL: Project[] = [
  {
    title: "Key-Value Store Database System",
    description:
      "Implemented an LSM-tree based KV-store with SST persistence, manifest reconstruction, B-tree indexing, bloom filters, and multi-level compaction. Developed extensive integration tests, optimized page-cache access for faster reads, and benchmarked throughput at 1GB scale.",
    tags: ["C++", "LSM-tree", "B-tree", "Bloom Filters"],
    url: "https://github.com/aryangoel24",
  },
  {
    title: "SkillSprint",
    description:
      "Built an AI-driven skill-building platform with a modular widget architecture, integrating Firebase, GenAI workflows, and third-party APIs. Optimized performance via lazy loading and state refactors, reduced page load times, and designed extensible UI patterns to support rapid feature iteration.",
    tags: ["Next.js", "TypeScript", "Firebase", "GenAI"],
    url: "https://github.com/aryangoel24",
  },
  {
    title: "PetPal -- Pet Adoption Platform",
    description:
      "Led a team of 4 to develop a full-stack pet adoption platform with RESTful APIs and an MVC-structured React frontend. Strengthened CI/CD reliability with 80% test coverage via Postman automated testing.",
    tags: ["Django", "React", "REST API", "Postman"],
    url: "https://github.com/aryangoel24",
  },
];

export interface Experience {
  company: string;
  role: string;
  period: string;
  bullets: string[];
}

export const EXPERIENCES_DETAIL: Experience[] = [
  {
    company: "Shopify",
    role: "Software Engineering Intern -- Flow Automations",
    period: "May 2025 - Dec 2025",
    bullets: [
      "Redesigned workflow state architecture to support AI-assisted edits with draft versioning, enabling safe rollback and diffing across revisions.",
      "Shipped per-workflow vertical layout support with one-way migration, autolayout triggers, and cross-surface synchronization for 10k+ merchants.",
      "Developed zipped workflow exports to bypass browser download limits and improved template review efficiency by 60% via decoded localization and automated emails.",
    ],
  },
  {
    company: "Algoverse",
    role: "Research Engineer -- AI Safety Research",
    period: "Sep 2025 - Present",
    bullets: [
      "Designed adversarial-vs-monitoring experiments on WMDP and BigCodeBench to study scalable oversight and chain-of-thought manipulation in LLMs.",
      "Engineered judge-model evaluation pipelines for extracting and classifying reasoning traces, enabling detection of deceptive patterns across Qwen models.",
      "Automated failure-mode analysis using InspectAI logs and structured metrics, increasing evaluation throughput in sandbagging experiments.",
    ],
  },
  {
    company: "Veeva Systems",
    role: "Software Engineering Intern -- SafetyDocs",
    period: "May 2024 - Apr 2025",
    bullets: [
      "Developed named entity extraction pipelines for literature abstracts, automatically generating related safety records for pharmacovigilance teams.",
      "Integrated the EMA RIS compliance format (industry-first among competitors) and expanded internal scheduling tools with complex weekly patterns.",
      "Strengthened test infrastructure via a database-mocking Mockito approach, raising coverage from 95% to 96.3% and guiding team adoption.",
    ],
  },
  {
    company: "BMO Finance & Research Trading Lab",
    role: "Software Developer",
    period: "May 2023 - Aug 2023",
    bullets: [
      "Developed Rotman Portfolio Manager 4.0, a full-stack trading simulation platform adopted by 8+ universities for 500+ users.",
      "Integrated FactSet APIs for auto-syncing market data and authored Jest test suites to boost backend route reliability.",
    ],
  },
];
