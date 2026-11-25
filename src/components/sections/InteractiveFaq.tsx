import { useState, useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'
import { MaskedText } from '../ui/MaskedText'

gsap.registerPlugin(ScrollTrigger, SplitText)

interface FaqItem {
  tag: string
  question: string
  answer: string
}

const faqs: FaqItem[] = [
  {
    tag: 'TARGET ROLES',
    question: 'What roles am I targeting?',
    answer:
      'Applied AI and Cybersecurity engineering internships. Building on shipped edge vision, local LLM retrieval, and native C++/Linux systems while starting formal penetration testing coursework next semester.',
  },
  {
    tag: 'SECURITY & SYSTEMS',
    question: 'How does my systems background connect to cybersecurity?',
    answer:
      'Hands-on Linux internals, C/C++ memory layout discipline, and local offline AI pipelines that keep inference off external clouds. Formal pentesting training begins next semester.',
  },
  {
    tag: 'PROOF OF WORK',
    question: 'What is my track record of shipping real software?',
    answer:
      "Accepted 9th ICRTAC'26 research paper on edge defect segmentation, Owner & Maintainer of Caelestia KDE, and top-15 finalist at DevSoc'26 in a 48-hour sprint.",
  },
  {
    tag: 'AVAILABILITY',
    question: 'Where and when am I available for internships?',
    answer:
      'Second-year B.Tech CSE student at VIT Vellore (8.83 CGPA). Available for remote internships and on-site or hybrid roles in Bengaluru and Chennai.',
  },
]

export function InteractiveFaq() {
  const sectionRef = useRef<HTMLElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const answerWrapRefs = useRef<(HTMLDivElement | null)[]>([])
  const answerTextRefs = useRef<(HTMLParagraphElement | null)[]>([])
  const questionRefs = useRef<(HTMLHeadingElement | null)[]>([])
  const answerTimelinesRef = useRef<(gsap.core.Timeline | null)[]>([])
  const [activeIdx, setActiveIdx] = useState<number>(0)
  const prevActiveRef = useRef<number>(-1)

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion || !sectionRef.current) return

      const totalItems = faqs.length
      const getScrollDistance = () => totalItems * Math.min(window.innerHeight * 0.65, 520)

      // Initialize SplitText animations for each card's enlarged question & answer
      answerTimelinesRef.current = faqs.map((_, idx) => {
        const answerEl = answerTextRefs.current[idx]
        const questionEl = questionRefs.current[idx]
        if (!answerEl || !questionEl) return null

        const qSplit = SplitText.create(questionEl, { type: 'words', mask: 'words' })
        const aSplit = SplitText.create(answerEl, { type: 'words,lines', mask: 'lines' })

        const tl = gsap.timeline({ paused: true })
        tl.fromTo(
          qSplit.words,
          { yPercent: 35, opacity: 0.55 },
          { yPercent: 0, opacity: 1, stagger: 0.025, duration: 0.4, ease: 'power3.out' },
          0
        ).fromTo(
          aSplit.words,
          { yPercent: 100, opacity: 0 },
          { yPercent: 0, opacity: 1, stagger: 0.014, duration: 0.42, ease: 'power3.out' },
          0.08
        )

        return tl
      })

      // Initial stacked card entry states
      cardRefs.current.forEach((card, idx) => {
        if (!card) return
        if (idx === 0) {
          gsap.set(card, { y: 0, opacity: 1, rotateX: 0 })
        } else {
          gsap.set(card, { y: 36, opacity: 0.22, rotateX: -8 })
        }
      })

      answerWrapRefs.current.forEach((wrap, idx) => {
        if (!wrap) return
        gsap.set(wrap, {
          height: idx === 0 ? 'auto' : 0,
          opacity: idx === 0 ? 1 : 0,
        })
      })

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 65%',
        once: true,
        onEnter: () => {
          answerTimelinesRef.current[0]?.play()
        },
      })

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: () => `+=${getScrollDistance()}`,
        pin: true,
        scrub: 0.5,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const newIdx = Math.min(Math.floor(self.progress * totalItems), totalItems - 1)
          setActiveIdx((prev) => (prev !== newIdx ? newIdx : prev))
        },
      })
    },
    { scope: sectionRef }
  )

  // Orchestrate redesigned card entry & SplitText playback when activeIdx changes
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    faqs.forEach((_, idx) => {
      const card = cardRefs.current[idx]
      const wrap = answerWrapRefs.current[idx]
      const textTl = answerTimelinesRef.current[idx]
      if (!card || !wrap) return

      const isCurrent = idx === activeIdx
      const isReached = idx < activeIdx

      if (isCurrent) {
        gsap.to(card, {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 0.5,
          ease: 'power3.out',
          overwrite: 'auto',
        })
        gsap.to(wrap, {
          height: 'auto',
          opacity: 1,
          duration: 0.42,
          ease: 'power2.out',
          overwrite: 'auto',
        })
        if (prevActiveRef.current !== activeIdx) {
          textTl?.restart()
        }
      } else if (isReached) {
        gsap.to(card, {
          y: 0,
          opacity: 0.65,
          rotateX: 0,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto',
        })
        gsap.to(wrap, {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.inOut',
          overwrite: 'auto',
        })
      } else {
        gsap.to(card, {
          y: 32,
          opacity: 0.22,
          rotateX: -8,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto',
        })
        gsap.to(wrap, {
          height: 0,
          opacity: 0,
          duration: 0.25,
          ease: 'power2.inOut',
          overwrite: 'auto',
        })
      }
    })

    prevActiveRef.current = activeIdx
  }, [activeIdx])

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="relative min-h-screen py-16 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto border-t border-white/5 flex flex-col justify-center overflow-x-clip"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center w-full [perspective:1200px]">
        {/* Left Column: Minimalist Heading & Subtitle */}
        <div className="lg:col-span-4">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            <MaskedText text="QUERIES" wordClassName="faq-title-word" />
          </h2>

          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-sm">
            Key details for engineering teams on target roles, security focus, shipped work, and internship availability.
          </p>
        </div>

        {/* Right Column: Enlarged Minimalist Stacking Cards */}
        <div className="lg:col-span-8 space-y-3.5 w-full">
          {faqs.map((faq, idx) => {
            const isCurrent = idx === activeIdx
            const isReached = idx <= activeIdx

            return (
              <div
                key={idx}
                ref={(el) => {
                  cardRefs.current[idx] = el
                }}
                className={`rounded-2xl p-6 sm:p-7 border backdrop-blur-2xl transform-gpu will-change-transform transition-[background-color,border-color,box-shadow] duration-300 ${
                  isCurrent
                    ? 'bg-[#0d111a]/80 border-cyan-400/55 shadow-[0_20px_50px_rgba(0,0,0,0.65)]'
                    : isReached
                      ? 'bg-[#0d111a]/55 border-white/10'
                      : 'bg-white/[0.02] border-white/5'
                }`}
              >
                <span
                  className={`block text-sm font-mono font-semibold uppercase tracking-[0.2em] mb-2 transition-colors ${
                    isCurrent ? 'text-cyan-300' : isReached ? 'text-cyan-400/75' : 'text-slate-500'
                  }`}
                >
                  {faq.tag}
                </span>

                <h3
                  ref={(el) => {
                    questionRefs.current[idx] = el
                  }}
                  className={`text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight leading-snug transition-colors ${
                    isCurrent ? 'text-white' : isReached ? 'text-slate-200' : 'text-slate-400'
                  }`}
                >
                  {faq.question}
                </h3>

                {/* GSAP-animated answer reveal */}
                <div
                  ref={(el) => {
                    answerWrapRefs.current[idx] = el
                  }}
                  className="overflow-hidden"
                >
                  <p
                    ref={(el) => {
                      answerTextRefs.current[idx] = el
                    }}
                    className="mt-4 pt-4 border-t border-white/10 text-base sm:text-lg lg:text-xl text-slate-200 leading-relaxed"
                  >
                    {faq.answer}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
