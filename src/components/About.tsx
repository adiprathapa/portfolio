import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { GradientText } from './ui/gradient-text'
import { ThrowableCard } from './about/ThrowableCard'
import { throwMessage } from './about/throwMessages'
import { photoCards } from '../data/aboutCards'
import { heroChild, heroStagger, staggerContainer } from '../lib/animations'
import { onIdle, warmImages } from '../lib/warmImages'
import { PRIMARY, TEXT } from '../lib/theme'
import { useInView } from '../hooks/useInView'

const PARAGRAPHS = [
  "I'm a Computer Science student at Cornell minoring in AI, originally from Nebraska. I am really interested in building and working with full stack web apps and experimenting with ML models.",
  "Lately I've been spending most of my time on graph learning, from GNNs for cyber event data and chip placement to livestock health prediction. I still enjoy web3, stablecoins, and IPFS, and the idea of programmable money is something I keep coming back to. I'm always looking for ways to connect what I'm learning in AI with applications outside the classroom, in clubs, hackathons, and through open source work.",
  "Outside of code, I'm an Eagle Scout who still loves getting outdoors, camping, hiking, that kind of thing. When I'm not on a trail, you'll probably find me gaming, tinkering with some new tech, or catching up on anime and other shows.",
]

function DragHintIcon() {
  return (
    <svg className="size-3 lg:size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v0" />
      <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
      <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-5.9-2.4L3.3 16.8a2 2 0 0 1 3-2.6L8 16" />
    </svg>
  )
}

export function About() {
  // order[0] is the top of the stack; a thrown card moves to the end.
  const [order, setOrder] = useState(() => photoCards.map((_, i) => i))
  const [hasGrabbed, setHasGrabbed] = useState(false)
  const [lastThrow, setLastThrow] = useState<{ speed: number; message: string } | null>(null)
  const [mediaActive, setMediaActive] = useState(false)
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({})
  const sectionRef = useRef<HTMLElement>(null)

  const marqueeActive = useInView(sectionRef, { threshold: 0.3 })
  const scrolledIntoView = useInView(sectionRef, { once: true, rootMargin: '320px 0px', threshold: 0.1 })

  // About is the next horizontal stop on desktop, so warm its (compact) card
  // images shortly after first paint rather than waiting for the transition.
  useEffect(() => {
    if (scrolledIntoView) {
      setMediaActive(true)
      return
    }
    return onIdle(() => setMediaActive(true), 700, { timeout: 1200 })
  }, [scrolledIntoView])

  useEffect(() => {
    if (!mediaActive) return
    return warmImages(
      photoCards.map((c) => c.image),
      {
        gapMs: 80,
        onSettled: (src) => {
          const card = photoCards.find((c) => c.image === src)
          if (card) setLoadedImages((prev) => ({ ...prev, [card.id]: true }))
        },
      },
    )
  }, [mediaActive])

  const handleGrab = useCallback(() => setHasGrabbed(true), [])

  const handleGone = useCallback((id: string) => {
    setOrder((prev) => {
      const idx = photoCards.findIndex((c) => c.id === id)
      return [...prev.filter((i) => i !== idx), idx]
    })
  }, [])

  const handleThrowSpeed = useCallback((speed: number) => {
    setLastThrow({ speed, message: throwMessage(speed) })
  }, [])

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative flex min-h-full flex-col items-center overflow-visible px-6 pb-[clamp(6rem,14dvh,9rem)] pt-[clamp(1.5rem,4dvh,2.5rem)] lg:h-full lg:flex-row lg:py-0"
      style={{ background: 'var(--color-surface, #EFF3F8)' }}
    >
      <motion.div
        className="mx-auto grid w-full max-w-7xl items-center gap-8 lg:grid-cols-2 lg:gap-12"
        variants={heroStagger}
        initial="hidden"
        animate={marqueeActive ? 'visible' : 'hidden'}
      >
        <motion.div variants={heroChild}>
          <motion.div className="lg:-mt-[16px]" variants={staggerContainer}>
            <motion.div variants={heroChild}>
              <GradientText as="h2" className="mb-1 font-normal" style={{ fontSize: TEXT.h2 }}>
                About me
              </GradientText>
            </motion.div>
            {PARAGRAPHS.map((paragraph, i) => (
              <motion.p
                key={i}
                variants={heroChild}
                className={`leading-relaxed text-black ${i < PARAGRAPHS.length - 1 ? 'mb-4' : ''}`}
                style={{ fontSize: TEXT.body }}
              >
                {paragraph}
              </motion.p>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          variants={heroChild}
          className="mb-[clamp(4rem,10dvh,6rem)] mt-[clamp(2.5rem,8dvh,5rem)] flex flex-col items-center justify-center lg:-mt-[2vh] lg:mb-0 lg:ml-[6vw] lg:mt-0"
        >
          <div className="relative aspect-[20/21] w-[min(calc(100vw-var(--mobile-card-inset)),400px)] lg:w-[400px]">
            {photoCards.map((card, i) => (
              <ThrowableCard
                key={card.id}
                card={card}
                zIndex={photoCards.length - order.indexOf(i)}
                imageLoaded={!!loadedImages[card.id]}
                onGone={handleGone}
                onGrab={handleGrab}
                onThrowSpeed={handleThrowSpeed}
              />
            ))}
          </div>
          <motion.p
            className="mt-4 flex select-none items-center gap-2 text-[10px] lg:mt-6 lg:text-sm"
            style={{ color: PRIMARY.a75 }}
            animate={lastThrow ? { opacity: 1, x: 0 } : hasGrabbed ? { opacity: 0 } : { x: [0, 6, -6, 0] }}
            transition={
              lastThrow || hasGrabbed
                ? { duration: 0.2 }
                : { duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }
            }
          >
            <DragHintIcon />
            {lastThrow ? `${lastThrow.message}, ${lastThrow.speed.toLocaleString()} px/s` : 'Drag to throw'}
          </motion.p>
        </motion.div>
      </motion.div>
    </section>
  )
}
