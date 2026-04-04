import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, useAnimation, type PanInfo } from 'framer-motion'
import { GradientText } from './ui/gradient-text'
import { heroStagger, heroChild, staggerContainer } from '../lib/animations'

function ProjectMarquee({ active }: { active: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    if (!active) return
    let raf: number
    const speed = 1.5
    const tick = () => {
      setOffset(prev => {
        const el = scrollRef.current
        if (el) {
          const half = el.scrollWidth / 2
          if (Math.abs(prev + speed) >= half) return 0
        }
        return prev - speed
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active])

  // Pattern unit: tall, col-of-2-smalls, col-of-2-smalls
  // Repeat enough times for seamless loop
  const units = Array.from({ length: 16 })

  const smallCard = (
    <div className="rounded-xl" style={{ width: 220, height: 96, background: 'rgba(186, 230, 253, 0.35)', border: '1.5px solid rgba(6, 113, 164, 0.3)' }} />
  )
  const tallCard = (
    <div className="rounded-xl" style={{ width: 300, height: 200, background: 'rgba(186, 230, 253, 0.35)', border: '1.5px solid rgba(6, 113, 164, 0.3)' }} />
  )

  return (
    <div className="w-full overflow-visible">
      <div
        ref={scrollRef}
        className="flex gap-4 w-max items-start"
        style={{ transform: `translateX(${offset}px)` }}
      >
        {units.map((_, i) => {
          const mod = i % 3
          if (mod === 0) {
            return <div key={i} className="shrink-0">{tallCard}</div>
          }
          return (
            <div key={i} className="shrink-0 flex flex-col gap-2">
              {smallCard}
              {smallCard}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const CARDS: { id: string; image: string; caption: string; bgSize?: string; bgPosition?: string }[] = [
  { id: 'card-1', image: '/img3.jpg', caption: 'Cornell Data Strategy Meeting' },
  { id: 'card-2', image: '/team-presentation.png', caption: 'Stablecoin Presentation at Cornell Hackathon' },
  { id: 'card-3', image: '/img3.png', caption: 'Formal Organizing Group' },
  { id: 'card-4', image: '/card-3.png', caption: 'Eagle Scout Project' },
  { id: 'card-5', image: '/coh.png', caption: 'After Eagle Scout Board of Review', bgSize: '180%', bgPosition: 'center center' },
]

function ThrowableCard({ card, zIndex, rotation, onGone, onGrab }: {
  card: typeof CARDS[number]
  zIndex: number
  rotation: number
  onGone: (id: string) => void
  onGrab?: () => void
}) {
  const controls = useAnimation()

  const handleDragEnd = useCallback(async (_: unknown, info: PanInfo) => {
    const vx = info.velocity.x
    const vy = info.velocity.y
    const speed = Math.sqrt(vx * vx + vy * vy)

    if (speed > 300) {
      const s = 2000 / speed
      await controls.start({
        x: vx * s,
        y: vy * s,
        transition: { duration: 0.5, ease: 'easeOut' },
      })
      onGone(card.id)
      controls.set({ x: 0, y: 0, scale: 0.95 })
      await controls.start({
        opacity: 1,
        scale: 1,
        transition: { duration: 0.25, ease: 'easeOut' },
      })
    } else {
      controls.start({
        x: 0,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 25 },
      })
    }
  }, [controls, card.id, onGone])

  return (
    <motion.div
      drag
      onDragStart={onGrab}
      dragElastic={0.8}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      animate={controls}
      initial={{ rotate: rotation }}
      whileDrag={{ scale: 1.05, cursor: 'grabbing' }}
      className="absolute group cursor-grab rounded-2xl border border-border shadow-2xl overflow-hidden"
      style={{
        width: 400,
        height: 420,
        zIndex,
        rotate: rotation,
        backgroundImage: `linear-gradient(135deg, rgba(6,113,164,0.3), rgba(56,189,248,0.2), transparent 60%), url('${card.image}')`,
        backgroundSize: card.bgSize ?? 'cover',
        backgroundPosition: card.bgPosition ?? 'center',
        filter: 'saturate(1.3) contrast(1.1) brightness(1.05)',
      }}
    >
      <span className="absolute bottom-0 left-0 right-0 px-4 py-3 text-white text-xs font-medium bg-gradient-to-t from-[rgba(6,113,164,0.7)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl">
        {card.caption}
      </span>
    </motion.div>
  )
}

export function About() {
  // order[0] = top of stack (highest z), order[last] = bottom
  const [order, setOrder] = useState(() => CARDS.map((_, i) => i))
  const [hasGrabbed, setHasGrabbed] = useState(false)
  const [marqueeActive, setMarqueeActive] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setMarqueeActive(true) },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleGrab = useCallback(() => {
    setHasGrabbed(true)
  }, [])

  const handleGone = useCallback((id: string) => {
    setOrder(prev => {
      const cardIdx = CARDS.findIndex(c => c.id === id)
      return [...prev.filter(i => i !== cardIdx), cardIdx]
    })
  }, [])

  const rotations = [-8, -3, 2, 6, -5]

  return (
    <section ref={sectionRef} id="about" className="relative h-full flex items-center px-4 md:px-6 overflow-visible" style={{ background: 'var(--color-surface, #EFF3F8)' }}>
      <motion.div
        className="mx-auto max-w-7xl w-full grid md:grid-cols-2 gap-12 items-center -mt-[111px]"
        variants={heroStagger}
        initial="hidden"
        animate={marqueeActive ? 'visible' : 'hidden'}
      >
        {/* Text */}
        <motion.div variants={heroChild}>
          <motion.div className="mt-[249px]" variants={staggerContainer}>
            <motion.div variants={heroChild}>
              <GradientText as="h2" className="text-2xl md:text-3xl font-normal mb-1">
                About me
              </GradientText>
            </motion.div>
            <motion.p variants={heroChild} className="text-black text-lg md:text-xl leading-relaxed mb-4">
              I'm a Computer Science student at Cornell minoring in AI, originally
              from Nebraska. I am really interested in building and working with full stack web
              apps and experimenting with ML models.
            </motion.p>
            <motion.p variants={heroChild} className="text-black text-lg md:text-xl leading-relaxed mb-4">
              Lately I've been diving deep into web3, stablecoins, and IPFS, the idea of
              programmable money and decentralized finance is something I enjoy working with and learning about. I'm always looking for ways to connect what I'm learning in AI
              with applications outside of the classroom.
            </motion.p>
            <motion.p variants={heroChild} className="text-black text-lg md:text-xl leading-relaxed">
              Outside of code, I'm an Eagle Scout who still loves getting outdoors,
              camping, hiking, that kind of thing. When I'm not on a trail, you'll
              probably find me gaming, tinkering with some new tech, or catching up
              on anime and other shows.
            </motion.p>
          </motion.div>

          <motion.div className="mt-[160px]" variants={staggerContainer}>
            <motion.div variants={heroChild}>
              <GradientText as="h2" className="text-2xl md:text-3xl font-normal">
                Projects
              </GradientText>
            </motion.div>
            <motion.p variants={heroChild} className="text-black text-lg md:text-xl leading-relaxed mt-1" style={{ width: '100%', maxWidth: 1200 }}>
              I am a fullstack developer who mainly works in Python, Java, and for frontend in JavaScript and TypeScript. I have experience working with a variety of machine learning and data science libraries like PyTorch, TensorFlow, scikit-learn, pandas, and more. My projects range from from fintech applications to machine learning focused projects to apps that combine both.
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Throwable Cards */}
        <motion.div variants={heroChild} className="flex flex-col items-center justify-center ml-[200px] -mt-[30px]">
          <div className="relative" style={{ width: 400, height: 420 }}>
            {CARDS.map((card, i) => (
              <ThrowableCard
                key={card.id}
                card={card}
                zIndex={CARDS.length - order.indexOf(i)}
                rotation={rotations[i]}
                onGone={handleGone}
                onGrab={handleGrab}
              />
            ))}
          </div>
          <motion.p
            className="mt-6 flex items-center gap-2 text-sm select-none"
            style={{ color: 'rgba(6, 113, 164, 0.45)' }}
            animate={hasGrabbed ? { opacity: 0 } : { x: [0, 6, -6, 0] }}
            transition={hasGrabbed ? { duration: 0.2 } : { duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v0" />
              <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
              <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
              <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-5.9-2.4L3.3 16.8a2 2 0 0 1 3-2.6L8 16" />
            </svg>
            Drag to throw
          </motion.p>
        </motion.div>
      </motion.div>
      {/* Marquee conveyor */}
      <div className="absolute bottom-[-231px] left-0 w-full overflow-visible z-10">
        <ProjectMarquee active={marqueeActive} />
      </div>
    </section>
  )
}
