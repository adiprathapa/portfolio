import { useRef, useState, useEffect, useLayoutEffect } from 'react'
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { FlipSafari } from './ui/flip-safari'
import { Experience } from './Experience'
import { Education } from './Education'
// GradientText used in About section's desktop projects intro

// Globe data kept but not used
// import { IconCloud } from './ui/icon-cloud'
// const slugs = [...]
// const slugToName = {...}
// const images = slugs.map(...)

const projectDisplayNames: Record<string, string> = {
  verdict: "Verdict",
  tauron: "Tauron",
  macroplace: "Macro Placement",
  sigil: "Sigil",
  paramgolf: "Parameter Golf",
  helicity: "Helicity",
}

const projectDescriptions: Record<string, string> = {
  verdict: "Built at Apature, my design tooling startup. A grounded VLM design reviewer that captures a running web UI with a deterministic headless Chromium pipeline, computes WCAG contrast and overflow facts straight from the DOM, then has a vision model critique the screenshots against the repo's own design tokens, deleting every finding it cannot point at a captured element. Ships a calibration gated confidence pipeline, a Rust perceptual diff crate, and a one command demo verified by CI.",
  tauron: "Trained a GRU and GraphSAGE model over a synthetic 60 cow contact graph encoding 9 sensor features to predict mastitis, bovine respiratory disease, and lameness risk 48 hours ahead. Built gradient based feature attribution reducing per cow explanation latency by 40x.",
  macroplace: "Built a hybrid GNN + electrostatic macro placer for the Partcl x HRT chip design challenge. GNN initialization on the netlist graph, ePlace style FFT density optimization, then density equalization and congestion aware coordinate descent refinement. Evaluated on 17 IBM benchmarks with zero overlaps.",
  sigil: "An open source TypeScript library from Apature that puts error bars on LLM-as-judge evals: judge calibration metrics, exact finite sample risk certificates with certified abstention thresholds, and anytime valid drift monitoring built on e-processes. Dependency free, fully offline, property tested, with byte reproducible signed reports.",
  paramgolf: "Entered OpenAI's Parameter Golf, a language model compression challenge with a 16 MB artifact cap. Forked Kevin Clark's SP4096 record and added a QK_GAIN_INIT=4.5 experiment, reaching 1.107 val bpb on a single H100 across 86 FineWeb shards.",
  helicity: "Built a composite liquidity stress scoring engine over a NetworkX knowledge graph linking stablecoins, banks, and jurisdictions. Set up a multi-model LLM jury using Claude and Gemini for consensus causal narratives, with scores pinned to IPFS for verifiable audit trails.",
}

const projectLinks: Record<string, string> = {
  verdict: "https://github.com/apatureai/verdict",
  tauron: "https://adiprathapa.github.io/Tauron/reveal_slides",
  macroplace: "https://github.com/adiprathapa/macro-place-challenge-2026/tree/main/submissions/gnn_placer",
  sigil: "https://github.com/apatureai/sigil",
  paramgolf: "https://github.com/adiprathapa/parameter-golf/tree/codex/sp4096-qk45-budget/records/track_non_record_16mb/2026-05-07_sp4096_budget_repro",
  helicity: "https://helicity-theta.vercel.app/",
}

const projectRepoLinks: Record<string, string> = {
  verdict: "https://github.com/apatureai/verdict",
  tauron: "https://github.com/adiprathapa/Tauron",
  macroplace: "https://github.com/adiprathapa/macro-place-challenge-2026/tree/main/submissions/gnn_placer",
  sigil: "https://github.com/apatureai/sigil",
  paramgolf: "https://github.com/adiprathapa/parameter-golf/tree/codex/sp4096-qk45-budget/records/track_non_record_16mb/2026-05-07_sp4096_budget_repro",
  helicity: "https://github.com/AI-HackathonNYC/helicity",
}

const projectOrder = ['verdict', 'macroplace', 'tauron', 'sigil', 'paramgolf', 'helicity']

const projectSafariProps: Record<string, { url: string; videoSrc?: string; posterSrc?: string; imageSrc?: string; videoCropTop?: number | string; videoCropBottom?: number | string; videoCropLeft?: number | string; videoCropRight?: number | string; videoStartTime?: number }> = {
  verdict: { url: projectLinks['verdict'], imageSrc: "/verdict-poster.webp" },
  tauron: { url: projectLinks['tauron'], videoSrc: "/tauron.mp4", posterSrc: "/tauron-poster.webp", videoCropTop: 25 },
  macroplace: { url: projectLinks['macroplace'], imageSrc: "/macroplace-poster.webp" },
  sigil: { url: projectLinks['sigil'], imageSrc: "/sigil-poster.webp" },
  paramgolf: { url: projectLinks['paramgolf'], imageSrc: "/paramgolf-poster.webp" },
  helicity: { url: projectLinks['helicity'], videoSrc: "/helicity.mp4", posterSrc: "/helicity-poster.webp" },
}

const projectLogos: Record<string, string> = {
  verdict: "",
  tauron: "/logo-tauron.png",
  macroplace: "",
  sigil: "",
  paramgolf: "",
  helicity: "/logo-helicity.png",
}

const projectTaglines: Record<string, string> = {
  verdict: "VLM design review that checks judgment, not pixels",
  tauron: "Predicting livestock disease 48 hours before symptoms appear",
  macroplace: "GNN + electrostatic hybrid macro placer for the Partcl x HRT challenge",
  sigil: "Error bars for LLM-as-judge evals in dependency-free TypeScript",
  paramgolf: "OpenAI Parameter Golf submission at 1.107 val bpb under 16 MB",
  helicity: "AI powered liquidity stress scoring with verifiable audit trails",
}

const projectBgImages: Record<string, string> = {
  verdict: '/verdictbg.webp',
  tauron: '/tauronbg.webp',
  macroplace: '/macroplace-bg.webp',
  sigil: '/sigilbg.webp',
  paramgolf: '/pexels-andrewshelley-8454632.webp',
  helicity: '/helicitybg.webp',
}

const projectGradientColors: Record<string, string> = {
  verdict: '#3B4FD8',
  tauron: '#4C867A',
  macroplace: '#1a1a2e',
  sigil: '#2E3163',
  paramgolf: '#0E1F1B',
  helicity: '#6366F1',
}

const projectTechStacks: Record<string, string[]> = {
  verdict: ["TypeScript", "Playwright", "Rust", "Python", "PostgreSQL", "Docker", "VLM"],
  tauron: ["PyTorch", "FastAPI", "React", "Ollama", "D3.js", "Mistral AI", "NetworkX", "scikit-learn"],
  macroplace: ["PyTorch", "GNN", "NumPy", "FFT", "Python"],
  sigil: ["TypeScript", "Node.js", "Conformal Prediction", "E-processes"],
  paramgolf: ["PyTorch", "CUDA", "FlashAttention 3", "Brotli", "SentencePiece", "Hugging Face", "Python"],
  helicity: ["FastAPI", "NetworkX", "FastMCP", "Claude API", "Gemini API", "IPFS", "Leaflet", "React", "pandas"],
}

// const allTechStack = [...new Set(Object.values(projectTechStacks).flat())]

function ProjectCard({
  projectKey,
  yValue,
  zIndex,
  opacity,
  enableBackground,
  interactive,
}: {
  projectKey: string
  yValue: MotionValue<number>
  zIndex: number
  opacity?: MotionValue<number>
  enableBackground: boolean
  interactive: boolean
}) {
  // Full size once the card's top reaches the bottom of the previous card (~500px),
  // smallest at 1120px away, linear ramp between
  const scale = useTransform(yValue, (y) => {
    const minScale = 0.85
    const fullSizeAt = 500
    if (y <= fullSizeAt) return 1
    const t = Math.min((y - fullSizeAt) / (1120 - fullSizeAt), 1)
    return 1 - t * (1 - minScale)
  })

  return (
    <motion.div
      data-project-card={projectKey}
      className="absolute inset-x-0 top-0 w-full origin-bottom"
      style={{
        y: yValue,
        scale,
        zIndex,
        ...(opacity ? { opacity } : {}),
        willChange: 'transform',
      }}
    >
      <FlipSafari
        safariProps={{
          ...projectSafariProps[projectKey],
          style: { width: '100%' },
        }}
        cardHeight="var(--project-stack-card-h)"
        projectName={projectDisplayNames[projectKey]}
        projectDescription={projectDescriptions[projectKey]}
        projectTagline={projectTaglines[projectKey]}
        projectUrl={projectRepoLinks[projectKey]}
        logoSrc={projectLogos[projectKey]}
        logoContent={projectKey === 'macroplace' ? (
          <div className="flex items-center gap-4" style={{ opacity: 0.9 }}>
            <img src="/logo-hrt.png" alt="HRT" className="h-20 object-contain" style={{ filter: 'grayscale(1) invert(1) brightness(3) contrast(10)' }} />
            <span className="text-white text-4xl font-light">&times;</span>
            <img src="/logo-partcl.png" alt="Partcl" className="h-20 object-contain" style={{ filter: 'grayscale(1) invert(1) brightness(3) contrast(10)' }} />
          </div>
        ) : projectKey === 'paramgolf' ? (
          <img
            src="/openai.png"
            alt="OpenAI"
            className="h-14 object-contain"
            style={{ filter: 'brightness(0) invert(1)', opacity: 0.95 }}
          />
        ) : projectKey === 'verdict' || projectKey === 'sigil' ? (
          <div className="flex flex-col items-center gap-3" style={{ opacity: 0.95 }}>
            <img src="/logo-apature.png" alt="Apature" className="h-16 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
            <span className="text-white text-2xl font-light uppercase" style={{ letterSpacing: '0.25em' }}>{projectKey}</span>
          </div>
        ) : undefined}
        techStack={projectTechStacks[projectKey]}
        gradientColor={projectGradientColors[projectKey]}
        bgImage={projectBgImages[projectKey]}
        enableBackground={enableBackground}
        interactive={interactive}
      />
    </motion.div>
  )
}

function readStickyPtPx() {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--project-sticky-pt').trim()
  if (raw.endsWith('vh')) return window.innerHeight * (parseFloat(raw) / 100)
  if (raw.endsWith('rem')) {
    const rootFs = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
    return parseFloat(raw) * rootFs
  }
  return parseFloat(raw) || 0
}

export function Projects({ onPlatformer, platformerActive = false }: { onPlatformer?: () => void; platformerActive?: boolean } = {}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardHProbeRef = useRef<HTMLDivElement>(null)
  const experienceRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024)
  const [activeCardIndex, setActiveCardIndex] = useState(0)
  const [sectionHeight, setSectionHeight] = useState('calc(100dvh + clamp(8rem, 20dvh, 12rem))')
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Size the sticky rail from the same travel distance used by the card
  // animation. Experience should not be pulled upward before the last card is
  // done; it naturally follows the rail with a small amount of breathing room.
  useLayoutEffect(() => {
    const compute = () => {
      const vh = window.innerHeight
      const mobile = window.innerWidth < 1024
      const fallbackCardH = mobile ? Math.min(Math.max(vh * 0.52, 360), 470) : 500
      const cardH = cardHProbeRef.current?.offsetHeight ?? fallbackCardH
      const spacing = mobile ? cardH + Math.round(cardH * 0.15) : cardH + 150
      const totalTravel = spacing * (projectOrder.length - 1)
      const stickyPt = readStickyPtPx()
      const expH = experienceRef.current?.offsetHeight ?? 550
      const expOverflow = Math.max(0, stickyPt + cardH + 96 + expH - vh)
      setSectionHeight(`${Math.ceil(vh + totalTravel + expOverflow)}px`)
    }
    compute()
    // iOS Safari fires resize on URL bar collapse; recomputing on every
    // scroll-driven resize causes layout jerks. Only react to width changes.
    let lastWidth = window.innerWidth
    const onResize = () => {
      if (window.innerWidth === lastWidth) return
      lastWidth = window.innerWidth
      compute()
    }
    window.addEventListener('resize', onResize)
    const ro = new ResizeObserver(compute)
    if (cardHProbeRef.current) ro.observe(cardHProbeRef.current)
    if (experienceRef.current) ro.observe(experienceRef.current)
    return () => {
      window.removeEventListener('resize', onResize)
      ro.disconnect()
    }
  }, [])
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const vh = window.innerHeight
  const cardH = cardHProbeRef.current?.offsetHeight ?? (isMobile ? Math.min(Math.max(vh * 0.52, 360), 470) : 500)
  const spacing = isMobile ? cardH + Math.round(cardH * 0.15) : cardH + 150

  // Two-phase scroll: Phase 1 = card stacking, Phase 2 = scroll Experience
  // into viewport. Both share the same sticky section so they stay in sync.
  // Stagger scales proportionally so the stack visually matches desktop on
  // mobile (same stagger/cardH ratio, 28/500 ≈ 5.6%) instead of taking a
  // disproportionately larger fraction of the smaller mobile card.
  const stagger = isMobile ? Math.max(14, Math.round(cardH * 0.056)) : 28
  const expH = experienceRef.current?.offsetHeight ?? 550
  const stickyPt = readStickyPtPx()
  const experienceOverflow = Math.max(0, stickyPt + cardH + 96 + expH - vh)
  const cardAnimationRail = 6 * spacing
  const totalRail = cardAnimationRail + experienceOverflow
  const cardAnimationEnd = totalRail > 0 ? cardAnimationRail / totalRail : 1

  // Phase 1: remap scrollYProgress [0, cardAnimationEnd] → [0, 1] for cards
  const cardProgress = useTransform(scrollYProgress,
    [0, Math.min(cardAnimationEnd, 0.9999)],
    [0, 1])
  const [platformerVisible, setPlatformerVisible] = useState(true)
  const [platformerDismissed, setPlatformerDismissed] = useState(false)
  useEffect(() => {
    if (!platformerActive) setPlatformerDismissed(false)
  }, [platformerActive])
  useMotionValueEvent(cardProgress, 'change', (latest) => {
    const nextIndex = Math.max(0, Math.min(projectOrder.length - 1, Math.floor(latest * (projectOrder.length - 1) + 0.001)))
    setActiveCardIndex((current) => current === nextIndex ? current : nextIndex)
    setPlatformerVisible((current) => {
      const next = latest < 0.012
      return current === next ? current : next
    })
  })
  const seg = 1 / 6

  const cardY1 = useTransform(cardProgress, [0, 1], [0, 0])

  const cardY2 = useTransform(cardProgress,
    [0, seg, 1],
    [spacing, stagger, stagger])

  const cardY3 = useTransform(cardProgress,
    [0, seg, seg * 2, 1],
    [spacing * 2, spacing + stagger, stagger * 2, stagger * 2])

  const cardY4 = useTransform(cardProgress,
    [0, seg, seg * 2, seg * 3, 1],
    [spacing * 3, spacing * 2 + stagger, spacing + stagger * 2, stagger * 3, stagger * 3])

  const cardY5 = useTransform(cardProgress,
    [0, seg, seg * 2, seg * 3, seg * 4, 1],
    [spacing * 4, spacing * 3 + stagger, spacing * 2 + stagger * 2, spacing + stagger * 3, stagger * 4, stagger * 4])

  const cardY6 = useTransform(cardProgress,
    [0, seg, seg * 2, seg * 3, seg * 4, seg * 5, 1],
    [spacing * 5, spacing * 4 + stagger, spacing * 3 + stagger * 2, spacing * 2 + stagger * 3, spacing + stagger * 4, stagger * 5, stagger * 5])

  const cardY7 = useTransform(cardProgress,
    [0, seg, seg * 2, seg * 3, seg * 4, seg * 5, seg * 6],
    [spacing * 6, spacing * 5 + stagger, spacing * 4 + stagger * 2, spacing * 3 + stagger * 3, spacing * 2 + stagger * 4, spacing + stagger * 5, 0])

  const cardYValues = [cardY1, cardY2, cardY3, cardY4, cardY5, cardY6, cardY7]

  const hideOp0 = useTransform(cardY7, (y: number) => Number(y > 0))
  const hideOp1 = useTransform(cardY7, (y: number) => Number(y > stagger))
  const hideOp2 = useTransform(cardY7, (y: number) => Number(y > stagger * 2))
  const hideOp3 = useTransform(cardY7, (y: number) => Number(y > stagger * 3))
  const hideOp4 = useTransform(cardY7, (y: number) => Number(y > stagger * 4))
  const hideOp5 = useTransform(cardY7, (y: number) => Number(y > stagger * 5))
  const cardOpacities: (MotionValue<number> | undefined)[] = [hideOp0, hideOp1, hideOp2, hideOp3, hideOp4, hideOp5, undefined]

  // Phase 2: after cards finish, scroll everything up so Experience fills viewport
  const phase2Offset = useTransform(scrollYProgress,
    [Math.min(cardAnimationEnd, 0.9999), 1],
    [0, -experienceOverflow])

  // Experience Y relative to the phase2 wrapper (no stickyPt — the wrapper
  // is inside the section's padded area, so stickyPt is already accounted for)
  const experienceInsideY = useTransform(cardY7, (y: number) => y + cardH + 96)

  return (
    <>
    <div id="projects-rail" ref={containerRef} className="relative" style={{ height: sectionHeight, zIndex: 5, ...(isMobile ? {} : { backgroundColor: '#E4EFF5' }) }}>
      <section id="projects" className="sticky top-16 h-[calc(100vh-4rem)] lg:top-0 lg:h-screen pt-[var(--project-sticky-pt)] px-6" style={{ clipPath: `inset(-200px 0px ${isMobile ? '-420px' : '-600px'} 0px)` }}>
        {onPlatformer && (
          <div
            className="pointer-events-none absolute z-[20] mx-auto flex justify-start lg:justify-end max-w-[calc(100vw-var(--mobile-card-inset))] lg:max-w-7xl"
            style={{
              top: 'calc(var(--project-sticky-pt) - 2rem)',
              left: '1.5rem',
              right: '1.5rem',
            }}
          >
            <motion.button
              type="button"
              onClick={(e) => { setPlatformerDismissed(true); onPlatformer(); (e.currentTarget as HTMLButtonElement).blur() }}
              className="pointer-events-auto flex items-center gap-2 text-[10px] lg:text-sm bg-transparent border-0 p-0 cursor-pointer select-none"
              style={{ color: 'rgba(6, 113, 164, 0.45)' }}
              animate={{ opacity: platformerVisible && !platformerDismissed ? 1 : 0 }}
              transition={{ duration: 0.25 }}
            >
              <motion.svg
                className="size-3 lg:size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                animate={{ y: [0, 3, 0, 3, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut', times: [0, 0.25, 0.5, 0.75, 1] }}
              >
                <path d="M12 5v14" />
                <path d="M19 12l-7 7-7-7" />
              </motion.svg>
              Platformer
            </motion.button>
          </div>
        )}
        {/* Phase 2 wrapper: scrolls cards + Experience up together after
            the card animation ends, keeping the 48px gap constant. */}
        <motion.div style={{ y: phase2Offset, position: 'relative' }}>
          <div className="relative z-[3]" style={{ maxWidth: isMobile ? 'calc(100vw - var(--mobile-card-inset))' : 1280, marginLeft: 'auto', marginRight: 'auto', height: isMobile ? 'var(--project-stack-card-h)' : 500, overflow: 'visible' }}>
            {projectOrder.map((key, i) => (
              <ProjectCard
                key={key}
                projectKey={key}
                yValue={cardYValues[i]}
                zIndex={i + 1}
                opacity={cardOpacities[i]}
                enableBackground
                interactive={i >= activeCardIndex && i <= activeCardIndex + 1}
              />
            ))}
          </div>
          {/* Experience follows card 7 — same wrapper = constant gap */}
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              left: '-1.5rem',
              right: '-1.5rem',
              y: experienceInsideY,
              zIndex: projectOrder.length + 1,
            }}
          >
            <div ref={experienceRef}>
              <Experience />
            </div>
          </motion.div>
        </motion.div>
        {/* Hidden probe */}
        <div
          ref={cardHProbeRef}
          aria-hidden
          style={{
            position: 'absolute',
            visibility: 'hidden',
            pointerEvents: 'none',
            width: 1,
            height: 'var(--project-stack-card-h)',
          }}
        />
      </section>
    </div>
    <div className="relative" style={{ backgroundColor: '#E4EFF5' }}>
      <Education />
    </div>
    </>
  )
}
