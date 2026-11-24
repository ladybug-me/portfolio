import { useState, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { MaskedText } from '../ui/MaskedText'
import { ScrambleText } from '../ui/ScrambleText'

gsap.registerPlugin(ScrollTrigger)

interface FaqItem {
  number: string
  question: string
  answer: string
  tag: string
}

const faqs: FaqItem[] = [
  {
    number: '01',
    question: 'How is Caelestia KDE optimized over standard Linux shells?',
    tag: 'LINUX IPC',
    answer:
      'By replacing legacy Python and generic D-Bus layers with native C++ asynchronous event loops, inter-process communication latency is cut to sub-5ms, completely eliminating compositor stutter during fluid window morphing.',
  },
  {
    number: '02',
    question: 'How does your ICRTAC’26 model achieve real-time inference on a Jetson Nano?',
    tag: 'EDGE CUDA',
    answer:
      'The YOLOv11-seg architecture was custom-quantized and coupled with specialized C++/CUDA runtime layers, optimizing both memory bandwidth and tensor operations for constrained low-power edge GPUs.',
  },
  {
    number: '03',
    question: 'What is the architecture behind the 44K vector search pipeline?',
    tag: 'FAISS / AI',
    answer:
      'It leverages local Ollama LLMs for multi-turn intent extraction and Sentence Transformers mapped into FAISS indexing structures, delivering sub-100ms similarity lookups across 44,441 catalog items.',
  },
  {
    number: '04',
    question: 'What engineering tracks and roles are you currently open to?',
    tag: 'RESEARCH & ROLES',
    answer:
      'Currently pursuing CSE at VIT Vellore (CGPA 8.83). I am open to research collaborations, Linux systems engineering roles, and high-performance edge computing development.',
  },
]

export function InteractiveFaq() {
  const sectionRef = useRef<HTMLElement>(null)
  const [activeIdx, setActiveIdx] = useState<number>(0)
  const [scrollProgress, setScrollProgress] = useState<number>(0)

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion || !sectionRef.current) return

      const totalItems = faqs.length
      const scrollDistancePerItem = 450

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: `+=${totalItems * scrollDistancePerItem}`,
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        onUpdate: (self) => {
          setScrollProgress(self.progress)
          const newIdx = Math.min(Math.floor(self.progress * totalItems), totalItems - 1)
          setActiveIdx(newIdx)
        },
      })
    },
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="relative min-h-screen py-24 px-4 sm:px-8 max-w-7xl mx-auto border-t border-white/5 flex flex-col justify-center overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
        
        {/* Left Column: Heading, Progress Bar & Live Status */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 font-mono text-cyan-400 text-xs mb-4">
              <span className="w-12 h-[1px] bg-cyan-400" />
              <ScrambleText text="03 // PINNED INQUIRIES" />
            </div>

            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
              <MaskedText text="THINGS YOU MIGHT ASK" wordClassName="faq-title-word" />
            </h2>

            <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-light max-w-md mb-8">
              Scroll through to cycle through technical inquiries on compositor IPC, CUDA edge layers, and FAISS benchmarks.
            </p>
          </div>

          {/* Interactive Scroll Status Pillar */}
          <div className="p-5 rounded-2xl glass-panel border border-cyan-500/20 max-w-sm font-mono text-xs">
            <div className="flex items-center justify-between text-cyan-300 mb-2">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>SCROLLING THROUGH FAQS</span>
              </span>
              <span className="font-bold text-white">
                0{activeIdx + 1} / 0{faqs.length}
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mt-3">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-150 ease-out"
                style={{ width: `${Math.max(10, scrollProgress * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Scroll-Scrubbed FAQ Deck */}
        <div className="lg:col-span-7 space-y-4 w-full">
          {faqs.map((faq, idx) => {
            const isActive = activeIdx === idx
            return (
              <div
                key={idx}
                className={`rounded-2xl transition-all duration-500 border ${
                  isActive
                    ? 'glass-panel border-cyan-400/50 bg-slate-900/95 shadow-[0_12px_40px_rgba(0,242,254,0.18)] translate-x-1 sm:translate-x-3 scale-[1.01]'
                    : 'bg-white/[0.02] border-white/5 opacity-50'
                }`}
              >
                {/* Question Row */}
                <div className="p-6 text-left flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                          : 'bg-white/5 text-slate-400 border-white/5'
                      }`}
                    >
                      {faq.tag}
                    </span>
                    <span
                      className={`text-base sm:text-lg font-semibold transition-colors ${
                        isActive ? 'text-white' : 'text-slate-400'
                      }`}
                    >
                      {faq.question}
                    </span>
                  </div>

                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs border transition-all duration-300 shrink-0 ${
                      isActive
                        ? 'border-cyan-400 text-cyan-300 bg-cyan-950/80 scale-110'
                        : 'border-white/10 text-slate-600'
                    }`}
                  >
                    {faq.number}
                  </span>
                </div>

                {/* Automatically revealed answer when active */}
                {isActive && (
                  <div className="px-6 pb-6 pt-1 text-sm text-slate-300 font-light leading-relaxed border-t border-cyan-500/10">
                    <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20 font-mono text-xs sm:text-sm text-cyan-100 shadow-inner">
                      <span className="text-cyan-400 font-bold block mb-1.5">// TECHNICAL RESPONSE:</span>
                      {faq.answer}
                    </div>
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
