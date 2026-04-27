import { useRef, useState, useEffect, useLayoutEffect } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { FlipSafari } from './ui/flip-safari'
import { Experience } from './Experience'
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
  spectre: "Spectre",
}

const projectDescriptions: Record<string, string> = {
  kiwix: "Open source contributor on FreeCodeCamp which is part of the openZIM and Kiwix projects. I engineered a YAML based CI suite for locale key validation, implemented system wide dark mode with CSS variables and CodeMirror, and refactored core Vue components for optimized markdown parsing.",
  helicity: "Built a composite liquidity stress scoring engine over a NetworkX knowledge graph linking stablecoins, banks, and jurisdictions. Set up multimodel LLM jury using Claude and Gemini for consensus causal narratives, with scores pinned to IPFS for verifiable audit trails.",
  tauron: "Trained a GRU and GraphSAGE model over a 60 cow contact graph encoding 9 sensor features to predict mastitis, bovine respiratory disease, and lameness risk 48 hours ahead. Built gradient based feature attribution reducing per cow explanation latency by 40x.",
  zamsizing: "Built a fullstack web app automating market sizing analysis using Google Gemini AI with automatic model fallback. Features a nested hexagon visualization for TAM/SAM/SOM metrics with one click PNG export, deployed serverless on Vercel.",
  macroplace: "Built a hybrid GNN + electrostatic macro placer for the Partcl x HRT chip design challenge. GNN initialization on the netlist graph, ePlace style FFT density optimization, then density equalization and congestion aware coordinate descent refinement. Evaluated on 17 IBM benchmarks with zero overlaps.",
  galatea: "Built for the Palantir Foundry FDSE technical challenge. Created end to end risk analytics platform for blockchain transactions, featuring real time address clustering, risk scoring, and case management. Processes millions of transactions using advanced graph algorithms and machine learning to detect suspicious activity through Palantir Foundry.",
  spectre: "Built for the Cornell Claude Builders Club Hackathon. A 1v1 fighting game where players throw real punches at their phone cameras while silhouettes battle in a shared browser overlay. MediaPipe pose estimation streams keypoints to a 60Hz Python game server for hit detection and damage logic, with a live AI commentator powered by Claude API and ElevenLabs TTS.",
}

const projectLinks: Record<string, string> = {
  kiwix: "https://browse.library.kiwix.org/viewer#freecodecamp_en_all_2026-02",
  tauron: "https://adiprathapa.github.io/Tauron/reveal_slides",
  helicity: "https://helicity-theta.vercel.app/",
  zamsizing: "https://zamsizing.vercel.app/",
  macroplace: "https://github.com/adiprathapa/macro-place-challenge-2026",
  galatea: "https://galatea.usw-3.palantirfoundry.com/stargate/oidc/ee802905-77f2-44a2-a9d0-ed41e2caea0e",
  spectre: "https://github.com/cx18121/claude-hackathon26",
}

const projectRepoLinks: Record<string, string> = {
  kiwix: "https://github.com/adiprathapa/freecodecamp",
  tauron: "https://github.com/adiprathapa/Tauron",
  helicity: "https://github.com/AI-HackathonNYC/helicity",
  zamsizing: "https://github.com/adiprathapa/ZAM",
  macroplace: "https://github.com/adiprathapa/macro-place-challenge-2026",
  galatea: "https://github.com/adiprathapa/galatea",
  spectre: "https://github.com/cx18121/claude-hackathon26",
}

const projectOrder = ['kiwix', 'tauron', 'helicity', 'zamsizing', 'macroplace', 'galatea', 'spectre']

const projectSafariProps: Record<string, { url: string; videoSrc?: string; videoCropTop?: number | string; videoCropBottom?: number | string; videoCropLeft?: number | string; videoCropRight?: number | string; videoStartTime?: number }> = {
  kiwix: { url: projectLinks['kiwix'], videoSrc: "/kiwix.mov" },
  tauron: { url: projectLinks['tauron'], videoSrc: "/tauron.mov", videoCropTop: 25 },
  helicity: { url: projectLinks['helicity'], videoSrc: "/helicity.mov" },
  zamsizing: { url: projectLinks['zamsizing'], videoSrc: "/zam-copy.mp4", videoCropTop: 110, videoCropBottom: 30, videoCropLeft: 270, videoCropRight: 272 },
  macroplace: { url: projectLinks['macroplace'] },
  galatea: { url: projectLinks['galatea'], videoSrc: "/recording-1.mov", videoCropTop: 23 },
  spectre: { url: projectLinks['spectre'], videoSrc: "/spectre.mp4", videoCropTop: "10%", videoStartTime: 10 },
}

const projectLogos: Record<string, string> = {
  kiwix: "/logo-kiwix.png",
  tauron: "/logo-tauron.png",
  helicity: "/logo-helicity.png",
  zamsizing: "/logo-zamsizing.png",
  macroplace: "",
  galatea: "/logo-galatea.png",
  spectre: "/claude.png",
}

const projectTaglines: Record<string, string> = {
  kiwix: "Offline education for everyone, everywhere ",
  tauron: "Predicting livestock disease 48 hours before symptoms appear ",
  helicity: "AI powered liquidity stress scoring with verifiable audit trails ",
  zamsizing: "One click AI market sizing with TAM/SAM/SOM visualization ",
  macroplace: "GNN + electrostatic hybrid macro placer for the Partcl x HRT challenge ",
  galatea: "Real time blockchain risk analytics with Palantir Foundry ",
  spectre: "Real time 1v1 fighting powered by phone cameras and AI commentary ",
}

const projectBgImages: Record<string, string> = {
  kiwix: '/kiwixbg.png',
  tauron: '/tauronbg.jpg',
  helicity: '/helicitybg.jpg',
  zamsizing: '/zamsizingbg.jpg',
  macroplace: '/macroplace-bg.jpg',
  galatea: '/galateabg.jpg',
  spectre: '/pexels-dichupdi-35168139.jpg',
}

const projectGradientColors: Record<string, string> = {
  kiwix: '#0A0A23',
  tauron: '#4C867A',
  helicity: '#6366F1',
  zamsizing: '#E8740C',
  macroplace: '#1a1a2e',
  galatea: '#2c2c2c',
  spectre: '#DA7756',
}

const projectTechStacks: Record<string, string[]> = {
  kiwix: ["Vue.js", "Pinia", "GitHub Actions", "YAML", "Python", "CodeMirror"],
  tauron: ["FastAPI", "Claude API", "Gemini API", "IPFS", "Leaflet", "React", "pandas", "NumPy"],
  helicity: ["PyTorch", "FastAPI", "React", "Ollama", "D3.js", "Mistral AI", "NetworkX", "scikit-learn"],
  zamsizing: ["JavaScript", "React", "Node.js", "Express", "MongoDB", "Gemini API", "Vercel"],
  macroplace: ["PyTorch", "GNN", "NumPy", "FFT", "Python"],
  galatea: ["NetworkX", "Palantir Foundry", "JavaScript"],
  spectre: ["MediaPipe", "FastAPI", "React", "PixiJS", "Claude API", "ElevenLabs", "WebSocket"],
}

// const allTechStack = [...new Set(Object.values(projectTechStacks).flat())]

function ProjectCard({
  projectKey,
  yValue,
  collapseValue,
  stackOffset,
  zIndex,
}: {
  projectKey: string
  yValue: MotionValue<number>
  collapseValue: MotionValue<number> | null
  stackOffset: MotionValue<number>
  zIndex: number
}) {
  const combinedY = useTransform(() => yValue.get() + (collapseValue ? collapseValue.get() : 0) + stackOffset.get())
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
      className="absolute inset-x-0 top-0 w-full origin-bottom"
      style={{
        y: combinedY,
        scale,
        zIndex,
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
        ) : undefined}
        techStack={projectTechStacks[projectKey]}
        gradientColor={projectGradientColors[projectKey]}
        bgImage={projectBgImages[projectKey]}
      />
    </motion.div>
  )
}

export function Projects() {
  const containerRef = useRef<HTMLDivElement>(null)
  // Hidden probe used to resolve the current px value of --project-stack-card-h
  // (which is a clamp() of vh) so the overflow math below can stay in sync
  // with the CSS without duplicating the formula.
  const cardHProbeRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024)
  const [sectionHeight, setSectionHeight] = useState('calc(100dvh + clamp(8rem, 20dvh, 12rem))')
  const [postProjectBuffer, setPostProjectBuffer] = useState('clamp(6rem, 12dvh, 10rem)')
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

      if (window.innerWidth < 1024) {
        const cardH = cardHProbeRef.current?.offsetHeight ?? Math.min(Math.max(vh * 0.45, 320), 420)
        const mobileStagger = 36
        const spacing = cardH + Math.round(cardH * 0.15)
        const finalMobileY = 0
        const collapseDistance = mobileStagger * (projectOrder.length - 1) - finalMobileY
        const totalTravel = spacing * (projectOrder.length - 1) + collapseDistance
        const postStackBuffer = 0
        const animationRail = Math.ceil(totalTravel * 0.75)
        const measuredSectionHeight = vh + animationRail
        setSectionHeight(`${Math.ceil(measuredSectionHeight)}px`)
        setPostProjectBuffer(`${Math.ceil(postStackBuffer)}px`)
        document.documentElement.style.setProperty('--projects-experience-lift', '0px')
        document.documentElement.style.setProperty('--contact-mobile-pt', '0px')
        return
      }

      const desktopCardH = cardHProbeRef.current?.offsetHeight ?? 500
      const desktopFinalY = 0
      const desktopStagger = 28
      const spacing = desktopCardH + 150
      const collapseDistance = desktopStagger * (projectOrder.length - 1) - desktopFinalY
      const totalTravel = spacing * (projectOrder.length - 1) + collapseDistance
      const postStackBuffer = 0
      const animationRail = Math.ceil(totalTravel * 0.75)
      const measuredSectionHeight = vh + animationRail
      setSectionHeight(`${Math.ceil(measuredSectionHeight)}px`)
      setPostProjectBuffer(`${Math.ceil(postStackBuffer)}px`)
      document.documentElement.style.setProperty('--projects-experience-lift', '0px')
      document.documentElement.style.setProperty('--contact-mobile-pt', '0px')
    }
    compute()
    window.addEventListener('resize', compute)
    const ro = new ResizeObserver(compute)
    if (cardHProbeRef.current) ro.observe(cardHProbeRef.current)
    return () => {
      window.removeEventListener('resize', compute)
      ro.disconnect()
    }
  }, [])
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const stagger = isMobile ? 36 : 28
  const cardH = cardHProbeRef.current?.offsetHeight ?? (isMobile ? 360 : 500)
  const spacing = isMobile ? cardH + Math.round(cardH * 0.15) : cardH + 150

  // Cards maintain spacing, stacking during scroll.
  // After stacking, the last card keeps scrolling up and "eats" the others —
  // each card joins the last card's motion once it reaches its position.
  // seg is computed so stacking and collapse phases move at the same px/scroll rate.
  const finalY = 0
  const collapseDistance = stagger * 6 - finalY
  const seg = spacing / (6 * spacing + collapseDistance)

  const cardY1 = useTransform(scrollYProgress, [0, 1], [0, 0])

  const cardY2 = useTransform(scrollYProgress,
    [0, seg, 1],
    [spacing, stagger, stagger])

  const cardY3 = useTransform(scrollYProgress,
    [0, seg, seg * 2, 1],
    [spacing * 2, spacing + stagger, stagger * 2, stagger * 2])

  const cardY4 = useTransform(scrollYProgress,
    [0, seg, seg * 2, seg * 3, 1],
    [spacing * 3, spacing * 2 + stagger, spacing + stagger * 2, stagger * 3, stagger * 3])

  const cardY5 = useTransform(scrollYProgress,
    [0, seg, seg * 2, seg * 3, seg * 4, 1],
    [spacing * 4, spacing * 3 + stagger, spacing * 2 + stagger * 2, spacing + stagger * 3, stagger * 4, stagger * 4])

  const cardY6 = useTransform(scrollYProgress,
    [0, seg, seg * 2, seg * 3, seg * 4, seg * 5, 1],
    [spacing * 5, spacing * 4 + stagger, spacing * 3 + stagger * 2, spacing * 2 + stagger * 3, spacing + stagger * 4, stagger * 5, stagger * 5])

  const cardY7 = useTransform(scrollYProgress,
    [0, seg, seg * 2, seg * 3, seg * 4, seg * 5, seg * 6, 1],
    [spacing * 6, spacing * 5 + stagger, spacing * 4 + stagger * 2, spacing * 3 + stagger * 3, spacing * 2 + stagger * 4, spacing + stagger * 5, stagger * 6, finalY])


  // Once the last card passes a card's position, that card moves with it
  const collapse1 = useTransform(() => Math.min(0, cardY7.get() - 0))
  const collapse2 = useTransform(() => Math.min(0, cardY7.get() - stagger))
  const collapse3 = useTransform(() => Math.min(0, cardY7.get() - stagger * 2))
  const collapse4 = useTransform(() => Math.min(0, cardY7.get() - stagger * 3))
  const collapse5 = useTransform(() => Math.min(0, cardY7.get() - stagger * 4))
  const collapse6 = useTransform(() => Math.min(0, cardY7.get() - stagger * 5))

  const cardYValues = [cardY1, cardY2, cardY3, cardY4, cardY5, cardY6, cardY7]
  const collapseValues: (MotionValue<number> | null)[] = [collapse1, collapse2, collapse3, collapse4, collapse5, collapse6, null]
  const stackOffset = useTransform(scrollYProgress, [0, 1], [0, 0])

  return (
    <>
    <div ref={containerRef} className="relative" style={{ height: sectionHeight, ...(isMobile ? {} : { zIndex: 5, backgroundColor: '#E4EFF5' }) }}>
      <section id="projects" className="sticky top-16 h-[calc(100vh-4rem)] lg:top-0 lg:h-screen flex items-start lg:items-center justify-center pt-[var(--project-sticky-pt)] px-6 z-[3] lg:z-auto" style={{ backgroundColor: '#E4EFF5', clipPath: `inset(-200px 0px ${isMobile ? '-1600px' : '-500px'} 0px)` }}>
        <div className="relative z-[3] w-full mx-auto lg:max-w-7xl" style={{ maxWidth: isMobile ? 'calc(100vw - var(--mobile-card-inset))' : undefined, height: isMobile ? 'var(--project-stack-card-h)' : 500, overflow: 'visible', transform: isMobile ? undefined : 'translateY(calc(var(--projects-stack-shift) * -1))' }}>
          {projectOrder.map((key, i) => (
            <ProjectCard
              key={key}
              projectKey={key}
              yValue={cardYValues[i]}
              collapseValue={collapseValues[i]}
              stackOffset={stackOffset}
              zIndex={i + 1}
            />
          ))}
        </div>
        {/* Hidden probe: resolves --project-stack-card-h to pixels for the JS math. */}
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
        <motion.div
          className="absolute left-0 w-full"
          style={{
            y: cardY7,
            top: isMobile
              ? 'calc(var(--project-sticky-pt) + var(--project-stack-card-h) + clamp(1.5rem, 4dvh, 2.5rem))'
              : 'calc((100vh - var(--project-card-h)) / 2 - var(--projects-stack-shift) + var(--project-card-h) + clamp(2rem, 4vh, 3rem))',
            zIndex: 1,
          }}
        >
          <Experience />
        </motion.div>
      </section>
    </div>
    <div aria-hidden style={{ height: postProjectBuffer, backgroundColor: '#E4EFF5' }} />
    </>
  )
}
