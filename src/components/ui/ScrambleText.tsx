import { useEffect, useState } from 'react'

const GLYPHS = '01#_<>[]*^/—+='

export function ScrambleText({
  text,
  className = '',
  delay = 0,
}: {
  text: string
  className?: string
  delay?: number
}) {
  const [display, setDisplay] = useState(text)

  useEffect(() => {
    let iteration = 0
    let interval: ReturnType<typeof setInterval>

    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        setDisplay(
          text
            .split('')
            .map((char, idx) => {
              if (char === ' ') return ' '
              if (idx < iteration) return text[idx]
              return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
            })
            .join('')
        )

        if (iteration >= text.length) {
          clearInterval(interval)
        }
        iteration += 1 / 2
      }, 25)
    }, delay)

    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [text, delay])

  return <span className={className}>{display}</span>
}
