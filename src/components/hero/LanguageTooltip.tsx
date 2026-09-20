import { motion } from 'framer-motion'
import type { Greeting } from '../../data/greetings'

const MONO = { fontFamily: "'Fira Code', monospace" }

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-primary" aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 7v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="5" r="0.75" fill="currentColor" />
    </svg>
  )
}

/** Dictionary-style popover breaking the current greeting into words. */
export function LanguageTooltip({ greeting, hoveredWordIndex }: { greeting: Greeting; hoveredWordIndex: number | null }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="absolute left-0 top-full -mt-10"
      style={{
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: 12,
      }}
    >
      <div className="whitespace-nowrap px-5 pb-4 pt-2.5">
        <div className="mb-3 flex items-center gap-2">
          <InfoIcon />
          <span className="inline-flex items-center gap-2 text-sm font-medium text-heading" style={MONO}>
            {greeting.subtitle}
            {greeting.icons?.map((icon) => (
              <img
                key={icon.src}
                src={icon.src}
                alt=""
                onClick={() => window.open(icon.link, '_blank')}
                className="relative -top-0.5 ml-0.5 shrink-0 cursor-pointer hover:animate-[shake_0.4s_ease-in-out]"
                style={{
                  height: icon.height ?? 32,
                  width: 'auto',
                  pointerEvents: 'auto',
                  ...(icon.ml ? { marginLeft: icon.ml } : {}),
                }}
              />
            ))}
          </span>
        </div>

        <div className="flex items-center justify-center text-sm" style={MONO}>
          {greeting.breakdown.map((word, i) => {
            const highlighted = hoveredWordIndex === i
            return (
              <span key={word.phonetic} className="flex items-center transition-colors duration-150">
                {i > 0 && <span className="mx-2.5 select-none text-muted">|</span>}
                <span className={`font-semibold ${highlighted ? 'text-primary' : 'text-heading'}`}>{word.phonetic}</span>
                <span className={`ml-1.5 ${highlighted ? 'text-primary/70' : 'text-muted'}`}>({word.meaning})</span>
              </span>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
