
const CURRENT_YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer id="contact" className="py-20 px-4 sm:px-8 border-t border-white/5 bg-[#05070a]">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">
        {/* Contact Proposition */}
        <div className="max-w-xl">
          <div className="font-mono text-cyan-400 text-xs mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>DIRECT CHANNEL</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Available for Systems Engineering and Edge AI Research
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6 font-normal">
            Pursuing a B.Tech in Computer Science at VIT Vellore (CGPA 8.83). Ready to contribute to Linux internals, embedded machine learning, and low-latency software.
          </p>
          <div className="font-mono text-sm text-cyan-300">
            <a
              href="mailto:rajveer2027singh@gmail.com"
              className="hover:underline flex items-center gap-2"
            >
              <span>rajveer2027singh@gmail.com</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>

        {/* Links & Channels */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-4 font-mono text-xs w-full lg:w-auto">
          <a
            href="https://github.com/ladybug-me"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-xl glass-panel glass-panel-hover flex items-center justify-between gap-6 text-slate-300 hover:text-white group"
          >
            <span className="flex items-center gap-2.5">
              <svg className="w-4 h-4 fill-current text-slate-400 group-hover:text-cyan-400 transition-colors" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span>GITHUB PROFILE</span>
            </span>
            <span className="text-cyan-400">VIEW ↗</span>
          </a>
          <a
            href="https://www.linkedin.com/in/rajveer-singh-2304402b6"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-xl glass-panel glass-panel-hover flex items-center justify-between gap-6 text-slate-300 hover:text-white group"
          >
            <span className="flex items-center gap-2.5">
              <svg className="w-4 h-4 fill-current text-slate-400 group-hover:text-cyan-400 transition-colors" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.69 1.69 0 1 0 0-3.38 1.69 1.69 0 0 0 0 3.38m1.4 9.74v-8.37H5.06v8.37h2.8z" />
              </svg>
              <span>LINKEDIN NETWORK</span>
            </span>
            <span className="text-cyan-400">CONNECT ↗</span>
          </a>
          <a
            href="/assets/Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-xl glass-panel glass-panel-hover flex items-center justify-between gap-6 text-cyan-300 border-cyan-500/20 group"
          >
            <span className="flex items-center gap-2.5">
              <svg className="w-4 h-4 stroke-current fill-none text-cyan-400" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>DOWNLOAD RESUME</span>
            </span>
            <span className="text-cyan-400">PDF ↗</span>
          </a>
        </div>
      </div>

      {/* Baseline Copyright & Tech note */}
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-slate-600">
        <div>© {CURRENT_YEAR} RAJVEER SINGH. ALL RIGHTS RESERVED.</div>
        <div>RENDERED WITH REACT 19 • THREE.JS • GSAP • LENIS</div>
      </div>
    </footer>
  )
}
