import { MaskedText } from '../ui/MaskedText'
import { ScrambleText } from '../ui/ScrambleText'

export function SkillsMatrix() {
  const categories = [
    {
      title: 'LOW-LEVEL SYSTEMS & GRAPHICS',
      color: 'text-cyan-400',
      skills: ['C++', 'CUDA', 'C', 'QML', 'Linux Compositors', 'D-Bus / IPC'],
    },
    {
      title: 'EDGE AI & COMPUTER VISION',
      color: 'text-emerald-400',
      skills: ['YOLOv11-seg', 'FAISS', 'PyTorch', 'Ultralytics', 'Ollama', 'FastAPI'],
    },
    {
      title: 'PLATFORMS & WORKFLOWS',
      color: 'text-teal-300',
      skills: ['Linux Kernel', 'Jetson Nano', 'Raspberry Pi', 'Docker', 'Git', 'Bash', 'SQL'],
    },
  ]

  return (
    <section id="skills" className="py-32 px-4 sm:px-8 max-w-7xl mx-auto border-t border-white/5">
      <div className="mb-20">
        <div className="flex items-center gap-3 font-mono text-cyan-400 text-xs mb-4">
          <span className="w-12 h-[1px] bg-cyan-400" />
          <ScrambleText text="02 // TECHNICAL MATRIX" />
        </div>
        <h2 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white">
          <MaskedText text="CORE CAPABILITIES" wordClassName="skills-title-word" />
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {categories.map((cat, idx) => (
          <div
            key={idx}
            className="skill-card p-8 rounded-2xl glass-panel border border-white/5 flex flex-col justify-between"
          >
            <div>
              <h3 className={`font-mono text-xs tracking-widest mb-8 pb-3 border-b border-white/5 font-semibold ${cat.color}`}>
                {cat.title}
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {cat.skills.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="px-3.5 py-2 rounded-lg text-xs font-mono bg-white/5 text-slate-200 border border-white/5 hover:border-cyan-400/50 hover:bg-cyan-950/30 hover:text-cyan-300 transition-all cursor-default"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-12 pt-4 border-t border-white/5 text-[11px] font-mono text-slate-500">
              OPTIMIZED FOR PRODUCTION
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
