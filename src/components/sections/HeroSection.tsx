export function HeroSection() {
  return (
    <section id="hero" className="relative min-h-screen flex flex-col justify-center px-4 sm:px-8 pt-28 pb-16 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Semantic narrative & identity */}
        <div className="max-w-3xl flex flex-col items-start z-10">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs mb-6 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>VIT VELLORE '29 • CGPA: 8.83 • OPEN FOR RESEARCH</span>
          </div>

          {/* Primary Headline */}
          <h1 className="text-4xl sm:text-6xl xl:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.08]">
            ENGINEERING <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
              SYSTEMS & EDGE AI
            </span>
          </h1>

          {/* Secondary Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mb-8 leading-relaxed font-normal">
            Hi, I'm <strong className="text-white font-semibold">Rajveer Singh</strong>. I architect edge computing architectures, high-throughput C++/CUDA pipelines, and fluid Linux desktop environments.
          </p>

          {/* Technical metric pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-lg mb-8 font-mono">
            <div className="glass-panel p-3.5 rounded-lg border border-white/5">
              <span className="text-cyan-400 text-xs block mb-1">CONFERENCE</span>
              <span className="text-white font-medium text-xs">9th ICRTAC'26</span>
            </div>
            <div className="glass-panel p-3.5 rounded-lg border border-white/5">
              <span className="text-cyan-400 text-xs block mb-1">LINUX SHELL</span>
              <span className="text-white font-medium text-xs">Caelestia KDE</span>
            </div>
            <div className="glass-panel p-3.5 rounded-lg border border-white/5 col-span-2 sm:col-span-1">
              <span className="text-cyan-400 text-xs block mb-1">RETRIEVAL</span>
              <span className="text-white font-medium text-xs">44K+ FAISS</span>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="#projects"
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 text-black font-semibold text-sm hover:opacity-95 transition-all shadow-[0_0_20px_rgba(0,242,254,0.3)] flex items-center gap-2"
            >
              <span>Explore Projects</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </a>
            <a
              href="#contact"
              className="px-6 py-3 rounded-lg border border-white/15 hover:border-cyan-400 text-slate-200 font-mono text-sm hover:text-white transition-all glass-panel"
            >
              // Get In Touch
            </a>
          </div>
        </div>

      </div>
    </section>
  )
}
