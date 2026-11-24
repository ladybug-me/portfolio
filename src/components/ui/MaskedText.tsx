interface MaskedTextProps {
  text: string
  className?: string
  wordClassName?: string
}

export function MaskedText({ text, className = '', wordClassName = '' }: MaskedTextProps) {
  const words = text.split(' ')

  return (
    <span className={`inline-block ${className}`} style={{ perspective: '1000px' }}>
      {/* Screen-reader accessible label */}
      <span className="sr-only">{text}</span>

      {/* Masked split words hidden from assistive tech */}
      <span aria-hidden="true" className="inline">
        {words.map((word, i) => (
          <span
            key={i}
            className="inline-block overflow-hidden align-top mr-[0.22em] last:mr-0 pb-1"
          >
            <span className={`inline-block will-change-transform ${wordClassName}`}>
              {word}
            </span>
          </span>
        ))}
      </span>
    </span>
  )
}
