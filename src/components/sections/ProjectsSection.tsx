import { MaskedText } from '../ui/MaskedText'
import { ScrambleText } from '../ui/ScrambleText'

interface ShowcaseProject {
  id: string
  number: string
  title: string
  badge: string
  stat: string
  statLabel: string
  summary: string
  tags: string[]
  link?: string
}

const showcaseProjects: ShowcaseProject[] = [
  {
    id: 'solar-defect',
    number: '01',
    title: 'Edge-Based Solar Panel Inspection',
    badge: "9th ICRTAC'26 Accepted Conference Paper",
    stat: 'CUDA + YOLOv11',
    statLabel: 'Jetson & Pi Edge Inference',
    summary:
      'Instance segmentation pipeline trained on custom thermal datasets to detect defects and quantify solar panel efficiency losses in real-time on low-power edge hardware.',
    tags: ['C++', 'CUDA', 'YOLOv11-seg', 'Jetson Nano', 'Raspberry Pi'],
  },
  {
    id: 'caelestia-kde',
    number: '02',
    title: 'Caelestia KDE Shell Architecture',
    badge: 'Owner & Maintainer',
    stat: '<5ms IPC',
    statLabel: 'Native C++ IPC Layer',
    summary:
      'Fluid, morphing shell for modern Linux desktops. Replaced legacy Python/D-Bus bridge layers with high-performance native C++ implementations to slash compositor overhead.',
    tags: ['C++', 'QML', 'Linux Compositor', 'D-Bus IPC', 'Bash'],
    link: 'https://github.com',
  },
  {
    id: 'faiss-engine',
    number: '03',
    title: 'High-Volume FAISS Vector Pipeline',
    badge: 'Open Source Engine',
    stat: '44,441 Items',
    statLabel: 'Sub-100ms Query Latency',
    summary:
      'Asynchronous semantic retrieval architecture utilizing local Ollama LLMs and Sentence Transformers over an automated SQLite vector ingestion pipeline.',
    tags: ['FAISS', 'FastAPI', 'Ollama', 'Sentence Transformers', 'Python'],
    link: 'https://github.com',
  },
]

export function ProjectsSection() {
  return (
    <section id="projects" className="py-32 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Editorial Section Headline */}
      <div className="mb-24">
        <div className="flex items-center gap-3 font-mono text-cyan-400 text-xs mb-4">
          <span className="w-12 h-[1px] bg-cyan-400" />
          <ScrambleText text="01 // AUTHORED SYSTEMS & RESEARCH" />
        </div>
        <h2 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white">
          <MaskedText text="FEATURED WORK" wordClassName="projects-title-word" />
        </h2>
      </div>

      {/* Spacious Sequential Project Horizons */}
      <div className="space-y-24 sm:space-y-36">
        {showcaseProjects.map((proj) => (
          <article
            key={proj.id}
            className="project-item py-12 border-t border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start group"
          >
            {/* Left: Project Index & Big Stat Callout */}
            <div className="lg:col-span-4 flex flex-col justify-between">
              <span className="text-5xl sm:text-7xl font-extrabold font-mono text-cyan-500/30 group-hover:text-cyan-400 transition-colors block mb-6">
                {proj.number}
              </span>

              <div className="glass-panel p-5 rounded-xl border border-white/5 w-fit">
                <span className="text-2xl sm:text-3xl font-bold font-mono text-white block mb-0.5">
                  {proj.stat}
                </span>
                <span className="text-xs text-cyan-400 font-mono tracking-wider uppercase">
                  {proj.statLabel}
                </span>
              </div>
            </div>

            {/* Right: Title, Narrative & Meta */}
            <div className="lg:col-span-8 flex flex-col justify-between">
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 mb-4">
                  {proj.badge}
                </span>

                <h3 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 group-hover:text-cyan-400 transition-colors leading-tight">
                  <MaskedText text={proj.title} wordClassName="project-card-title" />
                </h3>

                <p className="text-base sm:text-xl text-slate-300 font-light leading-relaxed mb-8 max-w-2xl">
                  {proj.summary}
                </p>
              </div>

              {/* Tags & Action Link */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/5">
                <div className="flex flex-wrap gap-2">
                  {proj.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-3 py-1 rounded text-xs font-mono bg-white/5 text-slate-300 border border-white/5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {proj.link && (
                  <a
                    href={proj.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-white transition-colors"
                  >
                    <span>VIEW ON GITHUB</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
