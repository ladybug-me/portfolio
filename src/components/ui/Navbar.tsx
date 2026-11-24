
export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-4 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
        {/* Brand / Kernel ID */}
        <a href="#hero" className="flex items-center gap-2 group">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 group-hover:shadow-[0_0_12px_#00f2fe] transition-all" />
          <span className="font-mono text-sm tracking-widest text-slate-200 uppercase font-semibold">
            RAJVEER.DEV
          </span>
          <span className="hidden sm:inline-block font-mono text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            KERNEL : LINUX & CUDA
          </span>
        </a>

        {/* Navigation links & status */}
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-slate-400">
            <a href="#projects" className="hover:text-cyan-400 transition-colors">
              // WORK
            </a>
            <a href="#pipeline" className="hover:text-cyan-400 transition-colors">
              // PIPELINE
            </a>
            <a href="#skills" className="hover:text-cyan-400 transition-colors">
              // CAPABILITIES
            </a>
            <a href="#faq" className="hover:text-cyan-400 transition-colors">
              // INQUIRIES
            </a>
            <a href="#contact" className="hover:text-cyan-400 transition-colors">
              // CONTACT
            </a>
          </nav>

          {/* Resume Download CTA */}
          <a
            href="/assets/Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-mono font-medium text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(0,242,254,0.1)]"
          >
            <span>RESUME (PDF)</span>
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </a>
        </div>
      </div>
    </header>
  )
}
