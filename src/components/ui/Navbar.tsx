
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
        <div className="flex items-center gap-5 sm:gap-6">
          <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-slate-400">
            <a href="#projects" className="hover:text-cyan-400 transition-colors">
              WORK
            </a>
            <a href="#pipeline" className="hover:text-cyan-400 transition-colors">
              PIPELINE
            </a>
            <a href="#skills" className="hover:text-cyan-400 transition-colors">
              CAPABILITIES
            </a>
            <a href="#faq" className="hover:text-cyan-400 transition-colors">
              INQUIRIES
            </a>
            <a href="#contact" className="hover:text-cyan-400 transition-colors">
              CONTACT
            </a>
          </nav>

          {/* Social Icons & Resume CTA */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/ladybug-me"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Profile"
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/5 transition-all"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
            </a>

            <a
              href="https://www.linkedin.com/in/rajveer-singh-2304402b6"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/5 transition-all"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.69 1.69 0 1 0 0-3.38 1.69 1.69 0 0 0 0 3.38m1.4 9.74v-8.37H5.06v8.37h2.8z" />
              </svg>
            </a>

            {/* Resume Download CTA */}
            <a
              href="/assets/Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono font-medium text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(0,242,254,0.1)]"
            >
              <span>RESUME</span>
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
      </div>
    </header>
  )
}
