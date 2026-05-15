import { useRef, useState, useEffect, useLayoutEffect } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
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
  kiwix: "Kiwix",
  tauron: "Tauron",
  helicity: "Helicity",
  zamsizing: "ZAM",
  macroplace: "Macro Placement",
  galatea: "Galatea",
  paramgolf: "Parameter Golf",
  spectre: "Spectre",
}

const projectDescriptions: Record<string, string> = {
  kiwix: "Open source contributor on FreeCodeCamp which is part of the openZIM and Kiwix projects. I engineered a YAML based CI suite for locale key validation, implemented system wide dark mode with CSS variables and CodeMirror, and refactored core Vue components for optimized markdown parsing.",
  helicity: "Built a composite liquidity stress scoring engine over a NetworkX knowledge graph linking stablecoins, banks, and jurisdictions. Set up multimodel LLM jury using Claude and Gemini for consensus causal narratives, with scores pinned to IPFS for verifiable audit trails.",
  tauron: "Trained a GRU and GraphSAGE model over a 60 cow contact graph encoding 9 sensor features to predict mastitis, bovine respiratory disease, and lameness risk 48 hours ahead. Built gradient based feature attribution reducing per cow explanation latency by 40x.",
  zamsizing: "Built a fullstack web app automating market sizing analysis using Google Gemini AI with automatic model fallback. Features a nested hexagon visualization for TAM/SAM/SOM metrics with one click PNG export, deployed serverless on Vercel.",
  macroplace: "Built a hybrid GNN + electrostatic macro placer for the Partcl x HRT chip design challenge. GNN initialization on the netlist graph, ePlace style FFT density optimization, then density equalization and congestion aware coordinate descent refinement. Evaluated on 17 IBM benchmarks with zero overlaps.",
  galatea: "Built for the Palantir Foundry FDSE technical challenge. Created end to end risk analytics platform for blockchain transactions, featuring real time address clustering, risk scoring, and case management. Processes millions of transactions using advanced graph algorithms and machine learning to detect suspicious activity through Palantir Foundry.",
  paramgolf: "Submitted a non record entry to OpenAI's Parameter Golf, a language model compression challenge with a 16 MB artifact cap. Forked Kevin Clark's SP4096 record and added a QK_GAIN_INIT=4.5 experiment, reaching 1.107 val bpb on a single H100 across 86 FineWeb shards.",
  spectre: "Built for the Cornell Claude Builders Club Hackathon. A 1v1 fighting game where players throw real punches at their phone cameras while silhouettes battle in a shared browser overlay, with a live AI commentator powered by Claude API and ElevenLabs TTS.",
}

const projectLinks: Record<string, string> = {
  kiwix: "https://browse.library.kiwix.org/viewer#freecodecamp_en_all_2026-02",
  tauron: "https://adiprathapa.github.io/Tauron/reveal_slides",
  helicity: "https://helicity-theta.vercel.app/",
  zamsizing: "https://zamsizing.vercel.app/",
  macroplace: "https://github.com/adiprathapa/macro-place-challenge-2026",
  galatea: "https://galatea.usw-3.palantirfoundry.com/stargate/oidc/ee802905-77f2-44a2-a9d0-ed41e2caea0e",
  paramgolf: "https://github.com/openai/parameter-golf/pull/2161",
  spectre: "https://github.com/cx18121/claude-hackathon26",
}

const projectRepoLinks: Record<string, string> = {
  kiwix: "https://github.com/adiprathapa/freecodecamp",
  tauron: "https://github.com/adiprathapa/Tauron",
  helicity: "https://github.com/AI-HackathonNYC/helicity",
  zamsizing: "https://github.com/adiprathapa/ZAM",
  macroplace: "https://github.com/adiprathapa/macro-place-challenge-2026",
  galatea: "https://github.com/adiprathapa/galatea",
  paramgolf: "https://github.com/openai/parameter-golf/pull/2161",
  spectre: "https://github.com/cx18121/claude-hackathon26",
}

const projectOrder = ['kiwix', 'tauron', 'helicity', 'zamsizing', 'macroplace', 'galatea', 'paramgolf', 'spectre']

const projectSafariProps: Record<string, { url: string; videoSrc?: string; videoCropTop?: number | string; videoCropBottom?: number | string; videoCropLeft?: number | string; videoCropRight?: number | string; videoStartTime?: number }> = {
  kiwix: { url: projectLinks['kiwix'], videoSrc: "/kiwix.mov" },
  tauron: { url: projectLinks['tauron'], videoSrc: "/tauron.mov", videoCropTop: 25 },
  helicity: { url: projectLinks['helicity'], videoSrc: "/helicity.mov" },
  zamsizing: { url: projectLinks['zamsizing'], videoSrc: "/zam-copy.mp4", videoCropTop: 110, videoCropBottom: 30, videoCropLeft: 270, videoCropRight: 272 },
  macroplace: { url: projectLinks['macroplace'] },
  galatea: { url: projectLinks['galatea'], videoSrc: "/recording-1.mov", videoCropTop: 23 },
  paramgolf: { url: projectLinks['paramgolf'] },
  spectre: { url: projectLinks['spectre'], videoSrc: "/spectre.mp4", videoCropTop: "10%", videoStartTime: 10 },
}

const projectLogos: Record<string, string> = {
  kiwix: "/logo-kiwix.png",
  tauron: "/logo-tauron.png",
  helicity: "/logo-helicity.png",
  zamsizing: "/logo-zamsizing.png",
  macroplace: "",
  galatea: "/logo-galatea.png",
  paramgolf: "",
  spectre: "/claude.png",
}

const projectTaglines: Record<string, string> = {
  kiwix: "Offline education for everyone, everywhere ",
  tauron: "Predicting livestock disease 48 hours before symptoms appear ",
  helicity: "AI powered liquidity stress scoring with verifiable audit trails ",
  zamsizing: "One click AI market sizing with TAM/SAM/SOM visualization ",
  macroplace: "GNN + electrostatic hybrid macro placer for the Partcl x HRT challenge ",
  galatea: "Real time blockchain risk analytics with Palantir Foundry ",
  paramgolf: "OpenAI Parameter Golf submission at 1.107 val bpb under 16 MB ",
  spectre: "Real time 1v1 fighting powered by phone cameras and AI commentary ",
}

const projectBgImages: Record<string, string> = {
  kiwix: '/kiwixbg.png',
  tauron: '/tauronbg.jpg',
  helicity: '/helicitybg.jpg',
  zamsizing: '/zamsizingbg.jpg',
  macroplace: '/macroplace-bg.jpg',
  galatea: '/galateabg.jpg',
  paramgolf: '/pexels-andrewshelley-8454632.jpg',
  spectre: '/pexels-dichupdi-35168139.jpg',
}

const projectGradientColors: Record<string, string> = {
  kiwix: '#0A0A23',
  tauron: '#4C867A',
  helicity: '#6366F1',
  zamsizing: '#E8740C',
  macroplace: '#1a1a2e',
  galatea: '#2c2c2c',
  paramgolf: '#0E1F1B',
  spectre: '#DA7756',
}

const projectTechStacks: Record<string, string[]> = {
  kiwix: ["Vue.js", "Pinia", "GitHub Actions", "YAML", "Python", "CodeMirror"],
  tauron: ["PyTorch", "FastAPI", "React", "Ollama", "D3.js", "Mistral AI", "NetworkX", "scikit-learn"],
  helicity: ["FastAPI", "Claude API", "Gemini API", "IPFS", "Leaflet", "React", "pandas", "NumPy"],
  zamsizing: ["JavaScript", "React", "Node.js", "Express", "MongoDB", "Gemini API", "Vercel"],
  macroplace: ["PyTorch", "GNN", "NumPy", "FFT", "Python"],
  galatea: ["NetworkX", "Palantir Foundry", "JavaScript"],
  paramgolf: ["PyTorch", "CUDA", "FlashAttention 3", "Brotli", "SentencePiece", "Hugging Face", "Python"],
  spectre: ["MediaPipe", "FastAPI", "React", "PixiJS", "Claude API", "ElevenLabs", "WebSocket"],
}

// const allTechStack = [...new Set(Object.values(projectTechStacks).flat())]

function ProjectCard({
  projectKey,
  yValue,
  stackOffset,
  zIndex,
  opacity,
}: {
  projectKey: string
  yValue: MotionValue<number>
  stackOffset: MotionValue<number>
  zIndex: number
  opacity?: MotionValue<number>
}) {
  const combinedY = useTransform([yValue, stackOffset], ([y, offset]) => {
    const currentY = Number(y)
    const currentOffset = Number(offset)
    return currentY + currentOffset
  })
  // Full size once the card's top reaches the bottom of the previous card (~500px),
  // smallest at 1120px away, linear ramp between
  const scale = useTransform(() => {
    const y = yValue.get()
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
        y: combinedY,
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
        ) : undefined}
        techStack={projectTechStacks[projectKey]}
        gradientColor={projectGradientColors[projectKey]}
        bgImage={projectBgImages[projectKey]}
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

export function Projects({
  onStartGame,
}: {
  onStartGame?: () => void
} = {}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardHProbeRef = useRef<HTMLDivElement>(null)
  const experienceRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024)
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
  const cardAnimationRail = 7 * spacing
  const totalRail = cardAnimationRail + experienceOverflow
  const cardAnimationEnd = totalRail > 0 ? cardAnimationRail / totalRail : 1

  // Phase 1: remap scrollYProgress [0, cardAnimationEnd] → [0, 1] for cards
  const cardProgress = useTransform(scrollYProgress,
    [0, Math.min(cardAnimationEnd, 0.9999)],
    [0, 1])
  const seg = 1 / 7

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
    [0, seg, seg * 2, seg * 3, seg * 4, seg * 5, seg * 6, 1],
    [spacing * 6, spacing * 5 + stagger, spacing * 4 + stagger * 2, spacing * 3 + stagger * 3, spacing * 2 + stagger * 4, spacing + stagger * 5, stagger * 6, stagger * 6])

  const cardY8 = useTransform(cardProgress,
    [0, seg, seg * 2, seg * 3, seg * 4, seg * 5, seg * 6, seg * 7],
    [spacing * 7, spacing * 6 + stagger, spacing * 5 + stagger * 2, spacing * 4 + stagger * 3, spacing * 3 + stagger * 4, spacing * 2 + stagger * 5, spacing + stagger * 6, 0])

  const cardYValues = [cardY1, cardY2, cardY3, cardY4, cardY5, cardY6, cardY7, cardY8]

  const hideOp0 = useTransform(cardY8, (y: number) => Number(y > 0))
  const hideOp1 = useTransform(cardY8, (y: number) => Number(y > stagger))
  const hideOp2 = useTransform(cardY8, (y: number) => Number(y > stagger * 2))
  const hideOp3 = useTransform(cardY8, (y: number) => Number(y > stagger * 3))
  const hideOp4 = useTransform(cardY8, (y: number) => Number(y > stagger * 4))
  const hideOp5 = useTransform(cardY8, (y: number) => Number(y > stagger * 5))
  const hideOp6 = useTransform(cardY8, (y: number) => Number(y > stagger * 6))
  const cardOpacities: (MotionValue<number> | undefined)[] = [hideOp0, hideOp1, hideOp2, hideOp3, hideOp4, hideOp5, hideOp6, undefined]

  // Phase 2: after cards finish, scroll everything up so Experience fills viewport
  const phase2Offset = useTransform(scrollYProgress,
    [Math.min(cardAnimationEnd, 0.9999), 1],
    [0, -experienceOverflow])

  // Experience Y relative to the phase2 wrapper (no stickyPt — the wrapper
  // is inside the section's padded area, so stickyPt is already accounted for)
  const experienceInsideY = useTransform(cardY8, (y: number) => y + cardH + 96)
  const stackOffset = useTransform(scrollYProgress, [0, 1], [0, 0])

  return (
    <>
    <div id="projects-rail" ref={containerRef} className="relative" style={{ height: sectionHeight, zIndex: 5, ...(isMobile ? {} : { backgroundColor: '#E4EFF5' }) }}>
      <section id="projects" className="sticky top-16 h-[calc(100vh-4rem)] lg:top-0 lg:h-screen pt-[var(--project-sticky-pt)] px-6" style={{ clipPath: `inset(-200px 0px ${isMobile ? '-420px' : '-600px'} 0px)` }}>
        {/* Phase 2 wrapper: scrolls cards + Experience up together after
            the card animation ends, keeping the 48px gap constant. */}
        <motion.div style={{ y: phase2Offset, position: 'relative' }}>
          <div className="relative z-[3]" style={{ maxWidth: isMobile ? 'calc(100vw - var(--mobile-card-inset))' : 1280, marginLeft: 'auto', marginRight: 'auto', height: isMobile ? 'var(--project-stack-card-h)' : 500, overflow: 'visible' }}>
            {projectOrder.map((key, i) => (
              <ProjectCard
                key={key}
                projectKey={key}
                yValue={cardYValues[i]}
                stackOffset={stackOffset}
                zIndex={i + 1}
                opacity={cardOpacities[i]}
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
