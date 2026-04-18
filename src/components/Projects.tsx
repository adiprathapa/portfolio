import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { FlipSafari } from './ui/flip-safari'
import { Experience } from './Experience'

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
}

const projectDescriptions: Record<string, string> = {
  kiwix: "Open source contributor on FreeCodeCamp which is part of the openZIM and Kiwix projects. I engineered a YAML based CI suite for locale key validation, implemented system wide dark mode with CSS variables and CodeMirror, and refactored core Vue components for optimized markdown parsing.",
  helicity: "Built a composite liquidity stress scoring engine over a NetworkX knowledge graph linking stablecoins, banks, and jurisdictions. Set up multimodel LLM jury using Claude and Gemini for consensus causal narratives, with scores pinned to IPFS for verifiable audit trails.",
  tauron: "Trained a GRU and GraphSAGE model over a 60 cow contact graph encoding 9 sensor features to predict mastitis, bovine respiratory disease, and lameness risk 48 hours ahead. Built gradient based feature attribution reducing per cow explanation latency by 40x.",
  zamsizing: "Built a fullstack web app automating market sizing analysis using Google Gemini AI with automatic model fallback. Features a nested hexagon visualization for TAM/SAM/SOM metrics with one click PNG export, deployed serverless on Vercel.",
  macroplace: "Built a hybrid GNN + electrostatic macro placer for the Partcl x HRT chip design challenge. GNN initialization on the netlist graph, ePlace style FFT density optimization, then density equalization and congestion aware coordinate descent refinement. Evaluated on 17 IBM benchmarks with zero overlaps.",
  galatea: "Built for the Palantir Foundry FDSE technical challenge. Created end to end risk analytics platform for blockchain transactions, featuring real time address clustering, risk scoring, and case management. Processes millions of transactions using advanced graph algorithms and machine learning to detect suspicious activity through Palantir Foundry.",
}

const projectLinks: Record<string, string> = {
  kiwix: "https://browse.library.kiwix.org/viewer#freecodecamp_en_all_2026-02",
  tauron: "https://adiprathapa.github.io/Tauron/reveal_slides",
  helicity: "https://helicity-theta.vercel.app/",
  zamsizing: "https://zamsizing.vercel.app/",
  macroplace: "https://github.com/adiprathapa/macro-place-challenge-2026",
  galatea: "https://galatea.usw-3.palantirfoundry.com/stargate/oidc/ee802905-77f2-44a2-a9d0-ed41e2caea0e",
}

const projectRepoLinks: Record<string, string> = {
  kiwix: "https://github.com/adiprathapa/freecodecamp",
  tauron: "https://github.com/adiprathapa/Tauron",
  helicity: "https://github.com/AI-HackathonNYC/helicity",
  zamsizing: "https://github.com/adiprathapa/ZAM",
  macroplace: "https://github.com/adiprathapa/macro-place-challenge-2026",
  galatea: "https://github.com/adiprathapa/galatea",
}

const projectOrder = ['kiwix', 'tauron', 'helicity', 'zamsizing', 'macroplace', 'galatea']

const projectSafariProps: Record<string, { url: string; videoSrc?: string; videoCropTop?: number; videoCropBottom?: number; videoCropLeft?: number; videoCropRight?: number }> = {
  kiwix: { url: projectLinks['kiwix'], videoSrc: "/kiwix.mov" },
  tauron: { url: projectLinks['tauron'], videoSrc: "/tauron.mov", videoCropTop: 25 },
  helicity: { url: projectLinks['helicity'], videoSrc: "/helicity.mov" },
  zamsizing: { url: projectLinks['zamsizing'], videoSrc: "/zam-copy.mp4", videoCropTop: 80, videoCropBottom: 30, videoCropLeft: 228, videoCropRight: 230 },
  macroplace: { url: projectLinks['macroplace'] },
  galatea: { url: projectLinks['galatea'], videoSrc: "/recording-1.mov", videoCropTop: 23 },
}

const projectLogos: Record<string, string> = {
  kiwix: "/logo-kiwix.png",
  tauron: "/logo-tauron.png",
  helicity: "/logo-helicity.png",
  zamsizing: "/logo-zamsizing.png",
  macroplace: "",
  galatea: "/logo-galatea.png",
}

const projectTaglines: Record<string, string> = {
  kiwix: "Offline education for everyone, everywhere ",
  tauron: "Predicting livestock disease 48 hours before symptoms appear ",
  helicity: "AI powered liquidity stress scoring with verifiable audit trails ",
  zamsizing: "One click AI market sizing with TAM/SAM/SOM visualization ",
  macroplace: "GNN + electrostatic hybrid macro placer for the Partcl x HRT challenge ",
  galatea: "Real time blockchain risk analytics with Palantir Foundry ",
}

const projectBgImages: Record<string, string> = {
  kiwix: '/kiwixbg.png',
  tauron: '/tauronbg.jpg',
  helicity: '/helicitybg.jpg',
  zamsizing: '/zamsizingbg.jpg',
  macroplace: '/macroplace-bg.jpg',
  galatea: '/galateabg.jpg',
}

const projectGradientColors: Record<string, string> = {
  kiwix: '#0A0A23',
  tauron: '#4C867A',
  helicity: '#6366F1',
  zamsizing: '#E8740C',
  macroplace: '#1a1a2e',
  galatea: '#2c2c2c',
}

const projectTechStacks: Record<string, string[]> = {
  kiwix: ["Vue.js", "Pinia", "GitHub Actions", "YAML", "Python", "CodeMirror"],
  tauron: ["FastAPI", "Claude API", "Gemini API", "IPFS", "Leaflet", "React", "pandas", "NumPy"],
  helicity: ["PyTorch", "FastAPI", "React", "Ollama", "D3.js", "Mistral AI", "NetworkX", "scikit-learn"],
  zamsizing: ["JavaScript", "React", "Node.js", "Express", "MongoDB", "Gemini API", "Vercel"],
  macroplace: ["PyTorch", "GNN", "NumPy", "FFT", "Python"],
  galatea: ["NetworkX", "Palantir Foundry", "JavaScript"],
}

const allTechStack = [...new Set(Object.values(projectTechStacks).flat())]

function ProjectCard({ projectKey, yValue, collapseValue, zIndex }: { projectKey: string; yValue: MotionValue<number>; collapseValue: MotionValue<number> | null; zIndex: number }) {
  const combinedY = useTransform(() => yValue.get() + (collapseValue ? collapseValue.get() : 0))
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
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const stagger = 20
  const spacing = 545

  // Cards maintain 545px spacing, stacking during scroll.
  // After stacking, the last card keeps scrolling up and "eats" the others —
  // each card joins the last card's motion once it reaches its position.
  const seg = 0.15

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
    [spacing * 5, spacing * 4 + stagger, spacing * 3 + stagger * 2, spacing * 2 + stagger * 3, spacing + stagger * 4, stagger * 5, -700])


  // Once the last card passes a card's position, that card moves with it
  const collapse1 = useTransform(() => Math.min(0, cardY6.get() - 0))
  const collapse2 = useTransform(() => Math.min(0, cardY6.get() - stagger))
  const collapse3 = useTransform(() => Math.min(0, cardY6.get() - stagger * 2))
  const collapse4 = useTransform(() => Math.min(0, cardY6.get() - stagger * 3))
  const collapse5 = useTransform(() => Math.min(0, cardY6.get() - stagger * 4))

  const cardYValues = [cardY1, cardY2, cardY3, cardY4, cardY5, cardY6]
  const collapseValues: (MotionValue<number> | null)[] = [collapse1, collapse2, collapse3, collapse4, collapse5, null]

  return (
    <div ref={containerRef} className="relative h-[350vh]">
      <section id="projects" className="sticky top-0 h-screen flex items-center justify-center px-6 bg-surface" style={{ overflow: 'clip' }}>
        <div className="relative w-full mx-auto" style={{ maxWidth: 1170, height: 500, transform: 'translateY(-147px)' }}>
          {projectOrder.map((key, i) => (
            <ProjectCard
              key={key}
              projectKey={key}
              yValue={cardYValues[i]}
              collapseValue={collapseValues[i]}
              zIndex={i + 1}
            />
          ))}
        </div>
        {/* Experience follows 85px below card 5 */}
        <motion.div
          className="absolute left-0 w-full"
          style={{ y: cardY6, top: 'calc(50% + 103px + 85px)' }}
        >
          <Experience />
        </motion.div>
      </section>
    </div>
  )
}
