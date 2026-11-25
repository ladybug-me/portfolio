import { useState } from 'react'
import { MaskedText } from '../ui/MaskedText'
import { ProjectGalleryModal, type GalleryMediaItem } from '../ui/ProjectGalleryModal'
import { handleBoundedCardWheel } from '../../utils/scrollPan'

interface ShowcaseProject {
  id: string
  number: string
  title: string
  badge: string
  summary: string
  tags: string[]
  link?: string
  media: string
  gallery: GalleryMediaItem[]
}

const base = import.meta.env.BASE_URL

const showcaseProjects: ShowcaseProject[] = [
  {
    id: 'solar-defect',
    number: '1',
    title: 'Edge-Based Solar Panel Inspection',
    badge: "9th ICRTAC'26 Accepted Paper",
    media: `${base}assets/spd/spd.png`,
    gallery: [
      { src: `${base}assets/spd/thermal.png`, label: 'Thermal Spectrum Analysis', type: 'image' },
      { src: `${base}assets/spd/crack.png`, label: 'Micro-Crack Segmentation', type: 'image' },
      { src: `${base}assets/spd/dusty.png`, label: 'Dust Occlusion Detection', type: 'image' },
      { src: `${base}assets/spd/birddrop.png`, label: 'Surface Debris Isolation', type: 'image' },
      { src: `${base}assets/spd/clean.png`, label: 'Clean Panel Baseline', type: 'image' },
    ],
    summary:
      'Trained instance segmentation networks on custom dataset to isolate micro-cracks, dust, bird droppings and hotspots. Deployed to Raspberry Pi and Nvidia Jetson Nano to calculate electrical efficiency loss in real time.',
    tags: ['C++', 'CUDA', 'Python', 'YOLOv11-seg', 'Jetson Nano', 'Raspberry Pi'],
  },
  {
    id: 'caelestia-kde',
    number: '2',
    title: 'Caelestia KDE - GitHub Organization',
    badge: 'Owner & Maintainer',
    media: `${base}assets/caelestia/animatedlogo.svg`,
    gallery: [{ src: `${base}assets/caelestia/caelestia.mp4`, label: 'Shell Runtime Showcase', type: 'video' }],
    summary:
      'A community port of Caelestia - fluid, morphing shell for Linux desktop. Replaced Python/D-Bus KDE bridge layers with native C++ implementations, reducing IPC overhead and improving responsiveness. Expanded shell functionality, optimizations and support for multiple linux distributions.',
    tags: ['C++', 'QML', 'Wayland', 'D-Bus IPC', 'Bash', 'Linux Compositors'],
    link: 'https://github.com/caelestia-kde',
  },
  {
    id: 'faiss-engine',
    number: '3',
    title: 'High-Volume FAISS Vector Pipeline',
    badge: 'Psyduck Engine • Open Source',
    media: `${base}assets/psyduck/psyduck.gif`,
    gallery: [
      { src: `${base}assets/psyduck/interface.png`, label: 'Semantic Search Interface', type: 'image' },
      { src: `${base}assets/psyduck/results.png`, label: 'FAISS Retrieval Results', type: 'image' },
    ],
    summary:
      'Local semantic retrieval pipeline. Combines Ollama models for intent extraction with Sentence Transformers and FAISS index partitions, querying structured catalog data over an automated SQLite pipeline.',
    tags: ['FAISS', 'FastAPI', 'Ollama', 'Sentence Transformers', 'SQLite', 'Python'],
    link: 'https://github.com/ladybug-me/psyduck',
  },
  {
    id: 'grudge-art-online',
    number: '4',
    title: 'Grudge Art Online • AI Game Engine',
    badge: "DevSoc'26 Top 15 Finalist",
    media: `${base}assets/devsoc/logo.png`,
    gallery: [],
    summary:
      'Interactive game engine built during a 48-hour sprint. Linked Unity clients to local Flask backends and the Backboard API, driving real-time dialogues with autonomous game characters.',
    tags: ['Unity', 'C#', 'Flask', 'Python', 'Backboard API', 'Game AI'],
  },
]

export function ProjectsSection() {
  const [activeProject, setActiveProject] = useState<ShowcaseProject | null>(null)

  return (
    <section id="projects" className="pt-20 sm:pt-28 lg:pt-32 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Editorial Section Headline */}
      <div className="mb-12 sm:mb-16 lg:mb-20">
        <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white">
          <MaskedText text="SELECTED WORK" wordClassName="projects-title-word" />
        </h2>
      </div>

      {/* Sticky Stacking Cards (Deck Presentation) */}
      <div className="relative space-y-8 sm:space-y-12 pb-36 sm:pb-48">
        {showcaseProjects.map((proj, idx) => {
          const hasGallery = proj.gallery.length > 0

          return (
            <article
              key={proj.id}
              role={hasGallery ? 'button' : undefined}
              tabIndex={hasGallery ? 0 : undefined}
              aria-label={hasGallery ? `Open ${proj.title} media gallery` : undefined}
              onClick={hasGallery ? () => setActiveProject(proj) : undefined}
              onKeyDown={
                hasGallery
                  ? (e) => {
                    if (e.target !== e.currentTarget) return
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setActiveProject(proj)
                    }
                  }
                  : undefined
              }
              style={{
                top: `calc(max(60px, min(85px, 9vh)) + ${idx * 16}px)`,
                maxHeight: `calc(100dvh - max(60px, min(85px, 9vh)) - ${idx * 16}px - 16px)`,
              }}
              onWheel={handleBoundedCardWheel}
              className={`stacked-project-card sticky glass-panel p-6 sm:p-8 lg:p-12 rounded-2xl sm:rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-md sm:backdrop-blur-2xl will-change-transform grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch group overflow-y-auto overflow-x-hidden ${hasGallery ? 'cursor-pointer focus:outline-none' : ''
                }`}
            >
              {/* Left: Enlarged Centered Thumb & Non-Overlapping Bottom-Left Numbering */}
              <div className="lg:col-span-4 flex flex-col justify-between gap-4 h-full">
                <div className="flex-1 w-full flex items-center justify-center">
                  {hasGallery ? (
                    <div className="relative flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform duration-150">
                      <img
                        src={proj.media}
                        alt={proj.title}
                        className="w-auto max-w-[260px] sm:max-w-[320px] max-h-48 sm:max-h-56 object-contain mx-auto transition-all duration-300 ease-out group-hover:scale-[1.12] group-hover:-translate-y-1.5 group-hover:drop-shadow-[0_0_26px_rgba(var(--accent-cyan-rgb),0.45)] group-has-[.repo-link:hover]:scale-100 group-has-[.repo-link:hover]:translate-y-0 group-has-[.repo-link:hover]:drop-shadow-none"
                      />
                      <span className="sm:hidden text-[11px] font-mono text-cyan-300/80 tracking-wide">
                        Tap to view gallery
                      </span>
                    </div>
                  ) : (
                    <img
                      src={proj.media}
                      alt={proj.title}
                      className="w-auto max-w-[260px] sm:max-w-[320px] max-h-48 sm:max-h-56 object-contain mx-auto"
                    />
                  )}
                </div>

                <span className="self-start shrink-0 text-3xl sm:text-4xl lg:text-5xl font-extrabold font-mono text-cyan-500/30 group-hover:text-cyan-400 group-has-[.repo-link:hover]:text-cyan-500/30 transition-colors leading-none select-none">
                  {proj.number}
                </span>
              </div>

              {/* Right: Title, Narrative & Meta */}
              <div className="lg:col-span-8 flex flex-col justify-between">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 mb-3 sm:mb-4">
                    {proj.badge}
                  </span>

                  <h3 className="text-xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 group-hover:text-cyan-400 group-has-[.repo-link:hover]:text-white transition-colors leading-tight">
                    <MaskedText text={proj.title} wordClassName="project-card-title" />
                  </h3>

                  <p className="text-sm sm:text-base lg:text-lg text-slate-300 font-light leading-relaxed mb-6 sm:mb-8 max-w-2xl">
                    {proj.summary}
                  </p>
                </div>

                {/* Tags & Action Link */}
                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 pt-4 sm:pt-6 border-t border-white/5">
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 min-w-0">
                    {proj.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded text-[11px] sm:text-xs font-mono bg-white/5 text-slate-300 border border-white/5"
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
                      onClick={(e) => e.stopPropagation()}
                      className="repo-link ml-auto shrink-0 whitespace-nowrap inline-flex items-center gap-2.5 py-1.5 text-sm sm:text-base font-mono font-semibold tracking-wide text-white hover:text-cyan-400 transition-colors"
                    >
                      <span>VIEW REPOSITORY</span>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {activeProject && (
        <ProjectGalleryModal
          key={activeProject.id}
          project={activeProject}
          onClose={() => setActiveProject(null)}
        />
      )}
    </section>
  )
}
