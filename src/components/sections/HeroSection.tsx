import { MaskedText } from '../ui/MaskedText'
import { ScrambleText } from '../ui/ScrambleText'

export function HeroSection() {
  return (
    <section id="hero" className="relative min-h-[92vh] flex flex-col justify-center px-4 sm:px-8 pt-32 pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Top Status Capsule */}
        <div className="hero-meta inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs mb-10 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <ScrambleText text="VIT VELLORE '29 • CGPA 8.83 • SYSTEMS & RESEARCH" delay={150} />
        </div>

        {/* Massive Editorial Headline */}
        <div className="max-w-6xl mb-10">
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter text-white leading-[0.95] select-none">
            <span className="block mb-2">
              <MaskedText text="ENGINEERING" wordClassName="hero-word" />
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
              <MaskedText text="SYSTEMS & AI" wordClassName="hero-word" />
            </span>
          </h1>
        </div>

        {/* Minimalist Narrative Statement */}
        <p className="hero-sub text-lg sm:text-2xl text-slate-300 max-w-3xl mb-12 font-light leading-relaxed">
          I'm <strong className="text-white font-medium">Rajveer Singh</strong>. Specializing in low-overhead C++ Linux compositor engines, CUDA edge compute, and high-volume vector search.
        </p>

        {/* Spaced Stat Horizon */}
        <div className="hero-meta grid grid-cols-3 gap-6 sm:gap-12 max-w-2xl mb-12 py-6 border-y border-white/10 font-mono">
          <div>
            <span className="text-2xl sm:text-4xl font-bold text-white block mb-1">ICRTAC'26</span>
            <span className="text-xs text-cyan-400 uppercase tracking-wider">Conference Author</span>
          </div>
          <div>
            <span className="text-2xl sm:text-4xl font-bold text-white block mb-1">&lt;5ms</span>
            <span className="text-xs text-cyan-400 uppercase tracking-wider">Caelestia IPC</span>
          </div>
          <div>
            <span className="text-2xl sm:text-4xl font-bold text-white block mb-1">44,441</span>
            <span className="text-xs text-cyan-400 uppercase tracking-wider">FAISS Vectors</span>
          </div>
        </div>

        {/* Clear Action Horizon */}
        <div className="hero-cta flex flex-wrap items-center gap-5">
          <a
            href="#projects"
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 text-black font-semibold text-sm hover:opacity-95 transition-all shadow-[0_0_25px_rgba(0,242,254,0.35)] flex items-center gap-2 group"
          >
            <span>Explore Authored Systems</span>
            <svg
              className="w-4 h-4 group-hover:translate-y-0.5 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
          <a
            href="#contact"
            className="px-8 py-4 rounded-xl border border-white/15 hover:border-cyan-400 text-slate-200 font-mono text-sm hover:text-white transition-all glass-panel"
          >
            // Get In Touch
          </a>
        </div>

      </div>
    </section>
  )
}
