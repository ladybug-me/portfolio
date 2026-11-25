import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { MaskedText } from '../ui/MaskedText'

gsap.registerPlugin(ScrollTrigger)

interface ShowcaseProject {
  id: string
  number: string
  title: string
  badge: string
  summary: string
  tags: string[]
  link?: string
  media: string
}

const showcaseProjects: ShowcaseProject[] = [
  {
    id: 'solar-defect',
    number: '1',
    title: 'Edge-Based Solar Panel Inspection',
    badge: "9th ICRTAC'26 Accepted Paper",
    media: `${import.meta.env.BASE_URL}assets/spd/spd.png`,
    summary:
      'Trained instance segmentation networks on custom thermal imagery to isolate micro-cracks, dust, and hotspots. Deployed directly to Raspberry Pi and Nvidia Jetson Nano to calculate electrical efficiency loss in real time.',
    tags: ['C++', 'CUDA', 'Python', 'YOLOv11-seg', 'Jetson Nano', 'Raspberry Pi'],
  },
  {
    id: 'caelestia-kde',
    number: '2',
    title: 'Caelestia KDE Shell Architecture',
    badge: 'Owner & Maintainer',
    media: `${import.meta.env.BASE_URL}assets/caelestia/animatedlogo.svg`,
    summary:
      'A morphing desktop shell for modern Linux distributions. Replaced Python D-Bus layers with native C++ asynchronous sockets, removing compositor stutter and stabilizing window transitions under heavy load.',
    tags: ['C++', 'QML', 'Wayland', 'D-Bus IPC', 'Bash', 'Linux Compositors'],
    link: 'https://github.com/caelestia-kde',
  },
  {
    id: 'faiss-engine',
    number: '3',
    title: 'High-Volume FAISS Vector Pipeline',
    badge: 'Psyduck Engine • Open Source',
    media: `${import.meta.env.BASE_URL}assets/psyduck/psyduck.gif`,
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
    media: `${import.meta.env.BASE_URL}assets/icons/devsoc.jpg`,
    summary:
      'Interactive game engine built during a 48-hour sprint. Linked Unity clients to local Flask backends and the Backboard API, driving real-time dialogues with autonomous game characters.',
    tags: ['Unity', 'C#', 'Flask', 'Python', 'Backboard API', 'Game AI'],
    link: 'https://github.com/ladybug-me',
  },
]

export function ProjectsSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) return

      const cards = gsap.utils.toArray<HTMLElement>('.stacked-project-card')

      // Animate card scale-down as subsequent cards stack over them
      cards.forEach((card, index) => {
        if (index === cards.length - 1) return // Last card doesn't scale down

        gsap.to(card, {
          scale: 0.94 - index * 0.02,
          opacity: 0.6,
          ease: 'none',
          scrollTrigger: {
            trigger: cards[index + 1],
            start: 'top 75%',
            end: 'top 30%',
            scrub: true,
          },
        })
      })
    },
    { scope: containerRef }
  )

  return (
    <section ref={containerRef} id="projects" className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Editorial Section Headline */}
      <div className="mb-12 sm:mb-16 lg:mb-20">
        <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white">
          <MaskedText text="SELECTED WORK" wordClassName="projects-title-word" />
        </h2>
      </div>

      {/* Sticky Stacking Cards (Deck Presentation) */}
      <div className="relative space-y-8 sm:space-y-12 pb-24">
        {showcaseProjects.map((proj, idx) => (
          <article
            key={proj.id}
            style={{ top: `calc(max(60px, min(85px, 9vh)) + ${idx * 16}px)` }}
            className="stacked-project-card sticky glass-panel p-6 sm:p-8 lg:p-12 rounded-2xl sm:rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl will-change-transform grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch group"
          >
            {/* Left: Enlarged Centered Thumb & Non-Overlapping Bottom-Left Numbering */}
            <div className="lg:col-span-4 flex flex-col justify-between gap-4 h-full">
              <div className="flex-1 w-full flex items-center justify-center">
                <img
                  src={proj.media}
                  alt={proj.title}
                  className="w-auto max-w-[260px] sm:max-w-[320px] max-h-48 sm:max-h-56 object-contain mx-auto"
                />
              </div>

              <span className="self-start shrink-0 text-3xl sm:text-4xl lg:text-5xl font-extrabold font-mono text-cyan-500/30 group-hover:text-cyan-400 transition-colors leading-none select-none">
                {proj.number}
              </span>
            </div>

            {/* Right: Title, Narrative & Meta */}
            <div className="lg:col-span-8 flex flex-col justify-between">
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 mb-3 sm:mb-4">
                  {proj.badge}
                </span>

                <h3 className="text-xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 group-hover:text-cyan-400 transition-colors leading-tight">
                  <MaskedText text={proj.title} wordClassName="project-card-title" />
                </h3>

                <p className="text-sm sm:text-base lg:text-lg text-slate-300 font-light leading-relaxed mb-6 sm:mb-8 max-w-2xl">
                  {proj.summary}
                </p>
              </div>

              {/* Tags & Action Link */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 sm:pt-6 border-t border-white/5">
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
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
                    className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-white transition-colors"
                  >
                    <span>VIEW REPOSITORY</span>
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
