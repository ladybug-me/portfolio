
export function Footer() {
  return (
    <footer id="contact" className="py-20 px-4 sm:px-8 border-t border-white/5 bg-[#05070a]">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">
        {/* Contact Proposition */}
        <div className="max-w-xl">
          <div className="font-mono text-cyan-400 text-xs mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>LET'S CONNECT</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Available for Research Collaboration & Systems Engineering
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6 font-normal">
            Currently pursuing B.Tech in Computer Science at VIT Vellore (CGPA 8.83). Always eager to contribute to low-level Linux systems, edge computer vision pipelines, or distributed AI.
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
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-xl glass-panel glass-panel-hover flex items-center justify-between gap-6 text-slate-300 hover:text-white"
          >
            <span>// GITHUB_PROFILE</span>
            <span className="text-cyan-400">VIEW ↗</span>
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-xl glass-panel glass-panel-hover flex items-center justify-between gap-6 text-slate-300 hover:text-white"
          >
            <span>// LINKEDIN_NETWORK</span>
            <span className="text-cyan-400">CONNECT ↗</span>
          </a>
          <a
            href="/assets/Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-xl glass-panel glass-panel-hover flex items-center justify-between gap-6 text-cyan-300 border-cyan-500/20"
          >
            <span>// DOWNLOAD_RESUME</span>
            <span className="text-cyan-400">PDF ↗</span>
          </a>
        </div>
      </div>

      {/* Baseline Copyright & Tech note */}
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-slate-600">
        <div>© {new Date().getFullYear()} RAJVEER SINGH. ALL RIGHTS RESERVED.</div>
        <div>RENDERED WITH REACT 19 • THREE.JS • GSAP • LENIS</div>
      </div>
    </footer>
  )
}
