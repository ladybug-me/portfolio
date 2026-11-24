import { useState } from 'react'
import { MaskedText } from '../ui/MaskedText'
import { ScrambleText } from '../ui/ScrambleText'

interface FaqItem {
  question: string
  answer: string
  tag: string
}

const faqs: FaqItem[] = [
  {
    question: 'How is Caelestia KDE optimized over standard Linux shells?',
    tag: 'LINUX IPC',
    answer:
      'By replacing legacy Python and generic D-Bus layers with native C++ asynchronous event loops, inter-process communication latency is cut to sub-5ms, completely eliminating shell stutter during fluid window morphing.',
  },
  {
    question: 'How does your ICRTAC’26 model achieve real-time inference on a Jetson Nano?',
    tag: 'EDGE CUDA',
    answer:
      'The YOLOv11-seg architecture was custom-quantized and coupled with specialized C++/CUDA runtime layers, optimizing both memory bandwidth and tensor operations for constrained low-power edge GPUs.',
  },
  {
    question: 'What is the architecture behind the 44K vector search pipeline?',
    tag: 'FAISS / AI',
    answer:
      'It leverages local Ollama LLMs for multi-turn intent extraction and Sentence Transformers mapped into FAISS indexing structures, delivering sub-100ms similarity lookups across 44,441 catalog items.',
  },
  {
    question: 'What engineering tracks and roles are you currently open to?',
    tag: 'RESEARCH & WORK',
    answer:
      'Currently pursuing CSE at VIT Vellore (CGPA 8.83). I am open to research collaborations, Linux systems engineering roles, and high-performance edge computing development.',
  },
]

export function InteractiveFaq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  const toggleFaq = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx)
  }

  return (
    <section id="faq" className="py-32 px-4 sm:px-8 max-w-7xl mx-auto border-t border-white/5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column: Heading and Terminal Badge */}
        <div className="lg:col-span-5">
          <div className="flex items-center gap-3 font-mono text-cyan-400 text-xs mb-4">
            <span className="w-12 h-[1px] bg-cyan-400" />
            <ScrambleText text="03 // INQUIRIES & CONTEXT" />
          </div>
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            <MaskedText text="THINGS YOU MIGHT ASK" wordClassName="faq-title-word" />
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-light max-w-md mb-8">
            Technical answers regarding compositor IPC bottlenecks, edge hardware quantization, and system benchmarks.
          </p>

          <div className="hidden lg:block p-4 rounded-xl glass-panel border border-cyan-500/20 max-w-xs font-mono text-xs text-cyan-300">
            <span className="text-slate-500 block mb-1">// STATUS</span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>TERMINAL Q&A READY</span>
            </span>
          </div>
        </div>

        {/* Right Column: Pill-Accordion Expanders */}
        <div className="lg:col-span-7 space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx
            return (
              <div
                key={idx}
                className={`rounded-2xl transition-all duration-300 border ${
                  isOpen
                    ? 'glass-panel border-cyan-500/40 bg-slate-900/90 shadow-[0_10px_30px_rgba(0,242,254,0.1)]'
                    : 'bg-white/[0.03] border-white/5 hover:border-white/15'
                }`}
              >
                {/* Pill Question Button */}
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus:ring-1 focus:ring-cyan-400 rounded-2xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {faq.tag}
                    </span>
                    <span className="text-base sm:text-lg font-semibold text-white">
                      {faq.question}
                    </span>
                  </div>

                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-sm border transition-transform duration-300 shrink-0 ${
                      isOpen
                        ? 'border-cyan-400 text-cyan-300 bg-cyan-950/60 rotate-45'
                        : 'border-white/10 text-slate-400'
                    }`}
                  >
                    +
                  </span>
                </button>

                {/* Speech Bubble Answer */}
                {isOpen && (
                  <div className="px-6 pb-6 pt-2 text-sm text-slate-300 font-light leading-relaxed border-t border-white/5 animate-fadeIn">
                    <p className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 font-mono text-xs sm:text-sm text-cyan-100">
                      <span className="text-cyan-400 font-bold block mb-1">// ANSWER:</span>
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
