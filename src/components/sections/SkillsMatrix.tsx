import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { MaskedText } from '../ui/MaskedText'
import { ScrambleText } from '../ui/ScrambleText'

gsap.registerPlugin(ScrollTrigger)

interface SkillCategory {
  number: string
  title: string
  subtitle: string
  stat: string
  skills: string[]
  color: string
}

const categories: SkillCategory[] = [
  {
    number: '01',
    title: 'LOW-LEVEL SYSTEMS & GRAPHICS',
    subtitle: 'High-throughput compositor architectures & memory-safe runtimes',
    stat: '<5ms IPC LATENCY',
    skills: ['C++', 'C', 'QML', 'Linux Compositors', 'D-Bus / IPC', 'Wayland', 'Memory Layout'],
    color: 'border-cyan-400/40 text-cyan-300',
  },
  {
    number: '02',
    title: 'CUDA & PARALLEL ACCELERATION',
    subtitle: 'Hardware GPU kernel optimization for low-latency edge inference',
    stat: 'PARALLEL KERNELS',
    skills: ['CUDA', 'C++ Runtime', 'TensorRT', 'GPU Thread Scheduling', 'Memory Bandwidth'],
    color: 'border-emerald-400/40 text-emerald-300',
  },
  {
    number: '03',
    title: 'EDGE COMPUTER VISION',
    subtitle: 'Instance segmentation tuned for low-power microcomputer GPUs',
    stat: 'JETSON & PI HARDWARE',
    skills: ['YOLOv11-seg', 'Ultralytics', 'PyTorch', 'Thermal Imaging', 'Instance Masks'],
    color: 'border-teal-400/40 text-teal-300',
  },
  {
    number: '04',
    title: 'VECTOR SEARCH & LOCAL LLMS',
    subtitle: 'High-volume indexing with asynchronous query routing',
    stat: '44,441 FAISS VECTORS',
    skills: ['FAISS Indexing', 'FastAPI', 'Ollama', 'Sentence Transformers', 'SQLite Vectors'],
    color: 'border-cyan-400/40 text-cyan-300',
  },
  {
    number: '05',
    title: 'INFRASTRUCTURE & KERNEL TOOLING',
    subtitle: 'Containerization, shell automation, and strict compile-time verification',
    stat: 'ZERO LEAK STANDARD',
    skills: ['Linux Kernel', 'Docker', 'Git', 'Bash Automation', 'Valgrind / GDB', 'SQL'],
    color: 'border-emerald-400/40 text-emerald-300',
  },
]

export function SkillsMatrix() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion || !trackRef.current || !sectionRef.current) return

      const track = trackRef.current

      // Calculate exact distance to scroll horizontally
      const getScrollAmount = () => -(track.scrollWidth - window.innerWidth + 96)

      // Horizontal deck scrub tied to vertical scroll
      gsap.to(track, {
        x: getScrollAmount,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${Math.max(track.scrollWidth - window.innerWidth, 1200)}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
    },
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="relative min-h-screen py-24 px-4 sm:px-8 border-t border-white/5 flex flex-col justify-center overflow-hidden"
    >
      <div className="max-w-7xl mx-auto w-full mb-12">
        <div className="flex items-center gap-3 font-mono text-cyan-400 text-xs mb-4">
          <span className="w-12 h-[1px] bg-cyan-400" />
          <ScrambleText text="02 // HORIZONTAL CAPABILITIES DECK" />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white">
            <MaskedText text="CORE CAPABILITIES" wordClassName="skills-title-word" />
          </h2>
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest hidden sm:block">
            SCROLL HORIZONTALLY ➔
          </span>
        </div>
      </div>

      {/* Horizontal Stack of Capability Cards */}
      <div className="relative w-full overflow-hidden">
        <div
          ref={trackRef}
          className="horizontal-track flex gap-8 w-max will-change-transform pb-8 pt-4 px-2"
        >
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className="horizontal-card w-[340px] sm:w-[460px] h-[460px] shrink-0 p-8 sm:p-10 rounded-3xl glass-panel border border-white/10 flex flex-col justify-between shadow-[0_20px_40px_rgba(0,0,0,0.5)] group hover:border-cyan-400/40 transition-all duration-300"
            >
              <div>
                {/* Index & Stat Badge */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                  <span className="text-4xl font-extrabold font-mono text-cyan-500/30 group-hover:text-cyan-400 transition-colors">
                    {cat.number}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-mono bg-white/5 border ${cat.color}`}>
                    {cat.stat}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 font-light leading-relaxed mb-6">
                  {cat.subtitle}
                </p>

                {/* Skills Badges */}
                <div className="flex flex-wrap gap-2">
                  {cat.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono bg-white/5 text-slate-200 border border-white/5 group-hover:border-white/10 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Stamp */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>SYSTEM DISCIPLINE</span>
                <span className="text-cyan-400">VERIFIED STACK ▹</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
