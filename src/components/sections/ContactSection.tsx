import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, SplitText)

export function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const emailRef = useRef<HTMLAnchorElement>(null)
  const chipsWrapRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion || !sectionRef.current || !headingRef.current) return

      const split = SplitText.create(headingRef.current, { type: 'chars', mask: 'chars' })
      const chips = chipsWrapRef.current ? Array.from(chipsWrapRef.current.children) : []

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 72%',
          toggleActions: 'play none none reverse',
        },
      })

      tl.from(split.chars, {
        yPercent: 110,
        opacity: 0,
        stagger: 0.03,
        duration: 0.55,
        ease: 'power3.out',
      })

      if (emailRef.current) {
        tl.from(
          emailRef.current,
          {
            y: 24,
            opacity: 0,
            duration: 0.45,
            ease: 'power2.out',
          },
          '-=0.25'
        )
      }

      if (chips.length) {
        tl.from(
          chips,
          {
            x: 36,
            opacity: 0,
            stagger: 0.1,
            duration: 0.5,
            ease: 'power3.out',
          },
          '-=0.3'
        )
      }
    },
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative z-30 min-h-screen py-20 px-4 sm:px-8 border-t border-white/5 flex flex-col justify-center overflow-hidden"
    >
      <div className="max-w-7xl mx-auto w-full lg:pr-36 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-14 lg:gap-16">
        {/* Left: Huge Minimalist Headline & Direct Email */}
        <div className="max-w-2xl w-full">
          <h2
            ref={headingRef}
            className="text-4xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[0.95] mb-6 sm:mb-8"
          >
            LET&apos;S BUILD.
          </h2>

          <a
            ref={emailRef}
            href="mailto:rajveer2027singh@gmail.com"
            className="inline-flex items-center gap-2.5 sm:gap-3 font-mono text-sm sm:text-2xl lg:text-3xl text-cyan-300 hover:text-cyan-200 transition-colors pointer-events-auto relative z-20 break-all sm:break-normal"
          >
            <span>rajveer2027singh@gmail.com</span>
            <svg className="w-5 h-5 sm:w-7 sm:h-7 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>

        {/* Right: Huge Minimalist Link Chips (Logo + Name Only) */}
        <div
          ref={chipsWrapRef}
          className="flex flex-col gap-4 sm:gap-5 w-full lg:w-[340px] relative z-20 pointer-events-auto"
        >
          <a
            href="https://github.com/ladybug-me"
            target="_blank"
            rel="noopener noreferrer"
            className="px-7 py-5 sm:px-8 sm:py-6 rounded-2xl bg-[#0d111a]/75 backdrop-blur-2xl border border-white/15 hover:border-cyan-400/60 hover:bg-[#0d111a]/90 flex items-center gap-5 text-white hover:text-cyan-300 transition-colors duration-200 group cursor-pointer"
          >
            <svg
              className="w-8 h-8 sm:w-9 sm:h-9 fill-current text-slate-300 group-hover:text-cyan-300 transition-colors shrink-0"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <span className="text-2xl sm:text-3xl font-bold tracking-tight">GitHub</span>
          </a>

          <a
            href="https://www.linkedin.com/in/rajveer-singh-2304402b6"
            target="_blank"
            rel="noopener noreferrer"
            className="px-7 py-5 sm:px-8 sm:py-6 rounded-2xl bg-[#0d111a]/75 backdrop-blur-2xl border border-white/15 hover:border-cyan-400/60 hover:bg-[#0d111a]/90 flex items-center gap-5 text-white hover:text-cyan-300 transition-colors duration-200 group cursor-pointer"
          >
            <svg
              className="w-8 h-8 sm:w-9 sm:h-9 fill-current text-slate-300 group-hover:text-cyan-300 transition-colors shrink-0"
              viewBox="0 0 24 24"
            >
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.69 1.69 0 1 0 0-3.38 1.69 1.69 0 0 0 0 3.38m1.4 9.74v-8.37H5.06v8.37h2.8z" />
            </svg>
            <span className="text-2xl sm:text-3xl font-bold tracking-tight">LinkedIn</span>
          </a>

          <a
            href={`${import.meta.env.BASE_URL}assets/Resume.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-7 py-5 sm:px-8 sm:py-6 rounded-2xl bg-[#0d111a]/75 backdrop-blur-2xl border border-white/15 hover:border-cyan-400/60 hover:bg-[#0d111a]/90 flex items-center gap-5 text-white hover:text-cyan-300 transition-colors duration-200 group cursor-pointer"
          >
            <svg
              className="w-8 h-8 sm:w-9 sm:h-9 stroke-current fill-none text-slate-300 group-hover:text-cyan-300 transition-colors shrink-0"
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span className="text-2xl sm:text-3xl font-bold tracking-tight">Resume</span>
          </a>
        </div>
      </div>
    </section>
  )
}
