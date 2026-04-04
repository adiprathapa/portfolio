import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, useAnimation, type PanInfo } from 'framer-motion'
import { GradientText } from './ui/gradient-text'
import { heroStagger, heroChild, staggerContainer } from '../lib/animations'

interface TechItem {
  name: string
  icon: string
  url: string
  blurb?: string
}

const networkxBlueFilter = 'brightness(0) saturate(100%) invert(30%) sepia(80%) saturate(700%) hue-rotate(170deg) brightness(90%) contrast(95%)'

function getIconSrc(icon: string, hovered: boolean) {
  if (!hovered) return icon
  return icon.replace('/0671A4', '')
}

const techAccentColorsBySlug: Record<string, string> = {
  react: '#61DAFB',
  python: '#3776AB',
  typescript: '#3178C6',
  pytorch: '#EE4C2C',
  nodedotjs: '#5FA04E',
  openjdk: '#111111',
  google: '#4285F4',
  vuedotjs: '#42B883',
  javascript: '#F7DF1E',
  fastapi: '#009688',
  pandas: '#150458',
  numpy: '#013243',
  mongodb: '#47A248',
  d3: '#F9A03C',
  codemirror: '#D30707',
  yaml: '#CB171E',
  scikitlearn: '#F7931E',
  express: '#000000',
  vercel: '#000000',
  tensorflow: '#FF6F00',
  githubactions: '#2088FF',
  ipfs: '#65C2CB',
  anthropic: '#111111',
  googlegemini: '#8E75B8',
  mistralai: '#FF7000',
  leaflet: '#199900',
  ollama: '#000000',
  palantir: '#101820',
  pinia: '#FFD859',
}

function getTechAccentColor(tech: TechItem) {
  if (tech.name === 'NetworkX') return '#2B7BBB'
  const slugMatch = tech.icon.match(/simpleicons\.org\/([^/]+)/)
  const slug = slugMatch?.[1]
  return (slug && techAccentColorsBySlug[slug]) ?? '#0671A4'
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace('#', '')
  if (normalized.length !== 6) return `rgba(6, 113, 164, ${alpha})`
  const r = parseInt(normalized.slice(0, 2), 16)
  const g = parseInt(normalized.slice(2, 4), 16)
  const b = parseInt(normalized.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const majorTech: TechItem[] = [
  { name: 'React', icon: 'https://cdn.simpleicons.org/react/0671A4', url: 'https://react.dev', blurb: 'Built interactive UIs and single page applications' },
  { name: 'Python', icon: 'https://cdn.simpleicons.org/python/0671A4', url: 'https://python.org', blurb: 'Trained ML models and shipped backend APIs' },
  { name: 'TypeScript', icon: 'https://cdn.simpleicons.org/typescript/0671A4', url: 'https://typescriptlang.org', blurb: 'Architected type safe frontends and server logic' },
  { name: 'PyTorch', icon: 'https://cdn.simpleicons.org/pytorch/0671A4', url: 'https://pytorch.org', blurb: 'Trained GRU and GraphSAGE models for prediction' },
  { name: 'Node.js', icon: 'https://cdn.simpleicons.org/nodedotjs/0671A4', url: 'https://nodejs.org', blurb: 'Deployed fullstack apps and REST APIs to production' },
  { name: 'Java', icon: 'https://cdn.simpleicons.org/openjdk/0671A4', url: 'https://dev.java', blurb: 'Engineered backend systems and data structures' },
  { name: 'NetworkX', icon: '/networkx.png', url: 'https://networkx.org', blurb: 'Constructed knowledge graphs and contact networks' },
  { name: 'Google ADK', icon: 'https://cdn.simpleicons.org/google/0671A4', url: 'https://google.github.io/adk-docs/', blurb: 'Orchestrated multi agent AI workflows and pipelines' },
]

const minorTech: TechItem[] = [
  { name: 'Vue.js', icon: 'https://cdn.simpleicons.org/vuedotjs/0671A4', url: 'https://vuejs.org' },
  { name: 'JavaScript', icon: 'https://cdn.simpleicons.org/javascript/0671A4', url: 'https://developer.mozilla.org/docs/Web/JavaScript' },
  { name: 'FastAPI', icon: 'https://cdn.simpleicons.org/fastapi/0671A4', url: 'https://fastapi.tiangolo.com' },
  { name: 'pandas', icon: 'https://cdn.simpleicons.org/pandas/0671A4', url: 'https://pandas.pydata.org' },
  { name: 'NumPy', icon: 'https://cdn.simpleicons.org/numpy/0671A4', url: 'https://numpy.org' },
  { name: 'MongoDB', icon: 'https://cdn.simpleicons.org/mongodb/0671A4', url: 'https://mongodb.com' },
  { name: 'D3.js', icon: 'https://cdn.simpleicons.org/d3/0671A4', url: 'https://d3js.org' },
  { name: 'CodeMirror', icon: 'https://cdn.simpleicons.org/codemirror/0671A4', url: 'https://codemirror.net' },
  { name: 'YAML', icon: 'https://cdn.simpleicons.org/yaml/0671A4', url: 'https://yaml.org' },
  { name: 'scikit-learn', icon: 'https://cdn.simpleicons.org/scikitlearn/0671A4', url: 'https://scikit-learn.org' },
  { name: 'Express', icon: 'https://cdn.simpleicons.org/express/0671A4', url: 'https://expressjs.com' },
  { name: 'Vercel', icon: 'https://cdn.simpleicons.org/vercel/0671A4', url: 'https://vercel.com' },
  { name: 'TensorFlow', icon: 'https://cdn.simpleicons.org/tensorflow/0671A4', url: 'https://tensorflow.org' },
  { name: 'GitHub Actions', icon: 'https://cdn.simpleicons.org/githubactions/0671A4', url: 'https://github.com/features/actions' },
  { name: 'IPFS', icon: 'https://cdn.simpleicons.org/ipfs/0671A4', url: 'https://ipfs.tech' },
  { name: 'Claude API', icon: 'https://cdn.simpleicons.org/anthropic/0671A4', url: 'https://docs.anthropic.com' },
  { name: 'Gemini API', icon: 'https://cdn.simpleicons.org/googlegemini/0671A4', url: 'https://ai.google.dev', blurb: 'Built multimodel AI workflows and fallback orchestration for production apps' },
  { name: 'Mistral AI', icon: 'https://cdn.simpleicons.org/mistralai/0671A4', url: 'https://mistral.ai' },
  { name: 'Leaflet', icon: 'https://cdn.simpleicons.org/leaflet/0671A4', url: 'https://leafletjs.com' },
  { name: 'Ollama', icon: 'https://cdn.simpleicons.org/ollama/0671A4', url: 'https://ollama.com', blurb: 'Ran local LLM inference pipelines for rapid prototyping and evaluation' },
  { name: 'Palantir Foundry', icon: 'https://cdn.simpleicons.org/palantir/0671A4', url: 'https://www.palantir.com/platforms/foundry/' },
  { name: 'Pinia', icon: 'https://cdn.simpleicons.org/pinia/0671A4', url: 'https://pinia.vuejs.org' },
]

function SmallCard({ tech }: { tech: TechItem }) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const accentColor = getTechAccentColor(tech)
  const borderColor = hovered ? accentColor : 'rgba(6, 113, 164, 0.3)'
  const textColor = hovered ? accentColor : '#0671A4'

  return (
    <div
      className="rounded-xl flex items-center gap-3 px-5 cursor-pointer select-none relative"
      style={{
        width: 220,
        height: 143,
        background: hovered ? '#FFFFFF' : '#F5F5F5',
        border: `1.5px solid ${borderColor}`,
        transform: pressed ? 'scale(0.97)' : hovered ? 'scale(1.03) translateY(-2px)' : 'scale(1)',
        boxShadow: hovered
          ? '0 16px 48px rgba(6, 113, 164, 0.1), 0 4px 12px rgba(0, 0, 0, 0.04)'
          : '0 4px 12px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false) }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onClick={() => window.open(tech.url, '_blank')}
    >
      <img
        src={getIconSrc(tech.icon, hovered)}
        alt={tech.name}
        className="w-8 h-8 shrink-0"
        style={{
          filter: tech.name === 'NetworkX' && !hovered ? networkxBlueFilter : undefined,
          transform: hovered ? 'rotate(-8deg) scale(1.1)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
        }}
      />
      <span className="text-base font-medium" style={{ color: textColor, transition: 'color 0.2s ease' }}>{tech.name}</span>
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke={textColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute top-3 right-3"
        style={{
          opacity: hovered ? 0.7 : 0,
          transform: hovered ? 'translate(0, 0)' : 'translate(-4px, 4px)',
          transition: 'all 0.2s ease',
        }}
      >
        <path d="M7 17L17 7" />
        <path d="M7 7h10v10" />
      </svg>
    </div>
  )
}

function TallCard({ tech }: { tech: TechItem }) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const tallBlurb = tech.blurb ?? `Built production features and workflows using ${tech.name}.`
  const accentColor = getTechAccentColor(tech)
  const borderColor = hovered ? accentColor : 'rgba(6, 113, 164, 0.3)'
  const textColor = hovered ? accentColor : '#0671A4'
  const blurbColor = hovered ? hexToRgba(accentColor, 0.75) : 'rgba(6, 113, 164, 0.7)'

  return (
    <div
      className="rounded-xl flex flex-col justify-center items-start px-6 gap-3 cursor-pointer select-none relative"
      style={{
        width: 300,
        height: 300,
        background: hovered ? '#FFFFFF' : '#F5F5F5',
        border: `1.5px solid ${borderColor}`,
        transform: pressed ? 'scale(0.97)' : hovered ? 'scale(1.03) translateY(-3px)' : 'scale(1)',
        boxShadow: hovered
          ? '0 16px 48px rgba(6, 113, 164, 0.1), 0 4px 12px rgba(0, 0, 0, 0.04)'
          : '0 4px 12px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false) }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onClick={() => window.open(tech.url, '_blank')}
    >
      <img
        src={getIconSrc(tech.icon, hovered)}
        alt={tech.name}
        className="w-10 h-10"
        style={{
          filter: tech.name === 'NetworkX' && !hovered ? networkxBlueFilter : undefined,
          transform: hovered ? 'rotate(-8deg) scale(1.15)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
        }}
      />
      <span className="text-lg font-medium" style={{ color: textColor, transition: 'color 0.2s ease' }}>{tech.name}</span>
      <span className="text-sm leading-relaxed" style={{ color: blurbColor }}>{tallBlurb}</span>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke={textColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute top-4 right-4"
        style={{
          opacity: hovered ? 0.7 : 0,
          transform: hovered ? 'translate(0, 0)' : 'translate(-4px, 4px)',
          transition: 'all 0.2s ease',
        }}
      >
        <path d="M7 17L17 7" />
        <path d="M7 7h10v10" />
      </svg>
    </div>
  )
}

function ProjectMarquee({ active }: { active: boolean }) {
  const halfRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0)
  const rafRef = useRef<number>(0)
  const pausedRef = useRef(false)
  const [offset, setOffset] = useState(0)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    pausedRef.current = hovered
  }, [hovered])

  useEffect(() => {
    if (!active) return
    const GAP = 16 // gap-4 = 16px
    const speed = 1.5
    const tick = () => {
      if (!pausedRef.current) {
        const halfEl = halfRef.current
        if (halfEl) {
          const halfWidth = halfEl.offsetWidth + GAP
          offsetRef.current -= speed
          if (offsetRef.current <= -halfWidth) {
            offsetRef.current += halfWidth
          }
        }
        setOffset(offsetRef.current)
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active])

  // Build a full pass that exhausts all tech items before repeating.
  const buildItems = (keyPrefix: string) => {
    const nodes: React.ReactNode[] = []
    const majorQueue = [...majorTech]
    const minorQueue = [...minorTech]
    let i = 0

    while (majorQueue.length > 0 || minorQueue.length > 0) {
      const tallTech = majorQueue.shift() ?? minorQueue.shift()
      if (!tallTech) break

      nodes.push(
        <div key={`${keyPrefix}-tall-${i}`} className="shrink-0">
          <TallCard tech={tallTech} />
        </div>
      )

      const firstSmall = minorQueue.shift() ?? majorQueue.shift()
      const secondSmall = minorQueue.shift() ?? majorQueue.shift()

      if (!firstSmall && !secondSmall) break

      nodes.push(
        <div key={`${keyPrefix}-small-${i}`} className="shrink-0 flex flex-col gap-2">
          {firstSmall && <SmallCard tech={firstSmall} />}
          {secondSmall && <SmallCard tech={secondSmall} />}
        </div>
      )

      i++
    }
    return nodes
  }

  return (
    <div
      className="w-full overflow-visible"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="flex gap-4 w-max items-start"
        style={{ transform: `translateX(${offset}px)`, willChange: 'transform' }}
      >
        <div ref={halfRef} className="flex gap-4 items-start shrink-0">
          {buildItems('a')}
        </div>
        <div className="flex gap-4 items-start shrink-0">
          {buildItems('b')}
        </div>
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
          <motion.div className="-mt-[16px]" variants={staggerContainer}>
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

      {/* Projects intro — full width, 250px below about text */}
      <div
        className="absolute left-0 w-full px-4 md:px-6"
        style={{ bottom: 38 }}
      >
        <div className="mx-auto max-w-7xl">
          <GradientText as="h2" className="text-2xl md:text-3xl font-normal">
            Projects
          </GradientText>
          <p className="text-black text-lg md:text-xl leading-relaxed mt-1">
            I am a fullstack developer who mainly works in Python, Java, and for frontend in JavaScript and TypeScript. I have experience working with a variety of machine learning and data science libraries like PyTorch, TensorFlow, scikit-learn, pandas, and more. My projects range from from fintech applications to machine learning focused projects to apps that combine both.
          </p>
        </div>
      </div>

      {/* Marquee conveyor */}
      <div className="absolute bottom-[-331px] left-0 w-full overflow-visible z-10">
        <div className="relative">
          <ProjectMarquee active={marqueeActive} />
          <div className="pointer-events-none absolute inset-y-0 left-0 w-32" style={{ background: 'linear-gradient(to right, var(--color-surface, #EFF3F8), transparent)' }} />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-32" style={{ background: 'linear-gradient(to left, var(--color-surface, #EFF3F8), transparent)' }} />
        </div>
      </div>
    </section>
  )
}
