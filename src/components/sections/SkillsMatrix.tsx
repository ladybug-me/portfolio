
export function SkillsMatrix() {
  const categories = [
    {
      title: 'LOW-LEVEL SYSTEMS & GRAPHICS',
      color: 'border-cyan-500/20 text-cyan-400',
      skills: ['C++', 'CUDA', 'C', 'QML', 'Linux Kernel/Shell', 'IPC / D-Bus'],
    },
    {
      title: 'AI, VECTOR SEARCH & COMPUTER VISION',
      color: 'border-emerald-500/20 text-emerald-400',
      skills: ['YOLOv11-seg', 'Ultralytics', 'FAISS', 'PyTorch', 'Ollama', 'FastAPI'],
    },
    {
      title: 'PLATFORMS, LANGUAGES & WORKFLOWS',
      color: 'border-teal-500/20 text-teal-300',
      skills: ['Python', 'Java', 'SQL', 'Docker', 'Git', 'Bash', 'Raspberry Pi', 'Jetson Nano'],
    },
  ]

  return (
    <section id="skills" className="py-24 px-4 sm:px-8 max-w-7xl mx-auto">
      <div className="mb-14">
        <div className="flex items-center gap-3 font-mono text-cyan-400 text-xs mb-3">
          <span className="w-8 h-[1px] bg-cyan-400" />
          <span>02 // ARCHITECTURE MATRIX</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
          TECHNICAL COMPETENCIES
        </h2>
        <p className="text-slate-400 mt-2 max-w-xl text-sm sm:text-base">
          Specialized in high-performance computing, low-overhead inter-process communication, and hardware edge deployment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((cat, idx) => (
          <div
            key={idx}
            className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 flex flex-col justify-between"
          >
            <div>
              <h3 className={`font-mono text-xs tracking-wider mb-6 pb-3 border-b border-white/5 font-semibold ${cat.color}`}>
                {cat.title}
              </h3>
              <div className="flex flex-wrap gap-2">
                {cat.skills.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono bg-white/5 text-slate-200 border border-white/10 hover:border-cyan-400/40 hover:bg-cyan-950/20 transition-all cursor-default"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-white/5 text-[11px] font-mono text-slate-500">
              OPTIMIZED FOR PRODUCTION
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
