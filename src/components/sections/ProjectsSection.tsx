
interface Project {
  title: string
  subtitle: string
  date: string
  badge: string
  summary: string
  keypoints: string[]
  tags: string[]
  link?: string
  linkLabel?: string
}

const projects: Project[] = [
  {
    title: 'Edge-Based Solar Panel Inspection',
    subtitle: 'Automated Defect Quantification and Efficiency Assessment',
    date: 'November 2026',
    badge: "9th ICRTAC'26 Accepted",
    summary:
      'Trained an instance segmentation YOLOv11-seg model on custom thermal and visual datasets to detect dust, cracks, hotspots, and bird droppings with edge acceleration.',
    keypoints: [
      'Deployed on low-power edge platforms: Nvidia Jetson Nano and Raspberry Pi.',
      'Optimized model inference latency and memory footprints using C++ and CUDA runtime layers.',
      'Quantifies solar panel power degradation based on real-time instance segmentation masks.',
    ],
    tags: ['Python', 'C++', 'CUDA', 'YOLOv11-seg', 'Edge Computing', 'Thermal Imaging'],
  },
  {
    title: 'Caelestia KDE',
    subtitle: 'Fluid, Morphing Shell for the Linux Desktop',
    date: 'June 2026',
    badge: 'Owner & Maintainer',
    summary:
      'A community port of Caelestia shell designed for modern Linux desktops, focusing on lightweight resource utilization and fluid compositor interactions.',
    keypoints: [
      'Replaced Python/D-Bus bridge layers with high-throughput native C++ implementations.',
      'Significantly reduced IPC latency and memory overhead for responsive shell morphing.',
      'Extended desktop functionality across Arch, Fedora, and Debian distributions.',
    ],
    tags: ['QML', 'C++', 'Bash', 'JavaScript', 'Python', 'KDE', 'D-Bus'],
    link: 'https://github.com',
    linkLabel: 'GitHub Repo',
  },
  {
    title: 'Grudge Art Online',
    subtitle: 'Interactive AI-Integrated Game — DevSoc 2026',
    date: 'February 2026',
    badge: 'Top 15 Finalist',
    summary:
      'An interactive AI-integrated game developed over a 48-hour competitive sprint featuring autonomous LLM-driven NPCs with conversational intent extraction.',
    keypoints: [
      'Architected dynamic conversational AI NPCs communicating in real-time with players.',
      'Wrote Unity C# scripts communicating with a low-latency local Flask backend and Backboard API.',
      'Ranked among the top 15 teams out of hundreds of participants at DevSoc 2026.',
    ],
    tags: ['Unity', 'C#', 'Flask', 'Python', 'LLM Agents', 'Backboard API'],
  },
  {
    title: 'Fashion Design Asset Manager',
    subtitle: 'High-Volume Semantic Outfit Recommendation Engine',
    date: 'October 2025',
    badge: '44K Vector Index',
    summary:
      'AI recommendation system utilizing local LLMs for multi-turn intent extraction and semantic outfit selection across 44,441 catalog items.',
    keypoints: [
      'Indexed and embedded 44,441 items using Sentence Transformers and high-speed FAISS vector retrieval.',
      'Engineered an asynchronous FastAPI pipeline orchestrating SQLite, vector search, and local Ollama inference.',
      'Automated index ingestion with sub-100ms similarity query response times.',
    ],
    tags: ['Ollama', 'FastAPI', 'FAISS', 'Sentence Transformers', 'SQLite', 'HuggingFace'],
    link: 'https://github.com',
    linkLabel: 'GitHub Repo',
  },
]

export function ProjectsSection() {
  return (
    <section id="projects" className="py-24 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="mb-16">
        <div className="flex items-center gap-3 font-mono text-cyan-400 text-xs mb-3">
          <span className="w-8 h-[1px] bg-cyan-400" />
          <span>01 // AUTHORED SYSTEMS & RESEARCH</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
          FEATURED PROJECTS
        </h2>
        <p className="text-slate-400 mt-2 max-w-xl text-sm sm:text-base">
          Proven implementations spanning edge computing, Linux systems optimization, and vector search engines.
        </p>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projects.map((proj, idx) => (
          <article
            key={idx}
            className="glass-panel glass-panel-hover p-6 sm:p-8 rounded-2xl flex flex-col justify-between"
          >
            <div>
              {/* Badge & Date */}
              <div className="flex items-center justify-between mb-4 text-xs font-mono">
                <span className="px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                  {proj.badge}
                </span>
                <span className="text-slate-500">{proj.date}</span>
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                {proj.title}
              </h3>
              <p className="text-xs font-mono text-emerald-400 mb-4">{proj.subtitle}</p>

              {/* Summary */}
              <p className="text-sm text-slate-300 leading-relaxed mb-6">{proj.summary}</p>

              {/* Technical Highlights */}
              <ul className="space-y-2 mb-6">
                {proj.keypoints.map((pt, ptIdx) => (
                  <li key={ptIdx} className="flex items-start gap-2 text-xs text-slate-400">
                    <span className="text-cyan-400 font-mono mt-0.5">▹</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tags and Link */}
            <div>
              <div className="flex flex-wrap gap-1.5 pt-4 border-t border-white/5">
                {proj.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/5 text-slate-300 border border-white/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {proj.link && (
                <div className="mt-4 pt-3 flex justify-end">
                  <a
                    href={proj.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <span>{proj.linkLabel}</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
