import { useState, useRef, useMemo, useEffect } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import { useScrolled } from '../hooks/useScrolled'
import { FlickeringGrid } from './ui/flickering-grid'
import { IconCloud } from './ui/icon-cloud'
import { FlipSafari } from './ui/flip-safari'

const slugs = ["vuedotjs", "pinia", "githubactions", "yaml", "python", "codemirror", "pytorch", "fastapi", "react", "ollama", "d3", "anthropic", "googlegemini", "ipfs", "leaflet", "express", "mongodb", "vercel", "javascript", "palantir", "networkx", "typescript", "nextdotjs", "nodedotjs", "postgresql", "docker", "git", "github", "tensorflow", "html5", "css3", "flask", "openjdk", "c", "scikitlearn", "numpy", "pandas", "tailwindcss", "plotly", "mistralai", "redis", "sqlite", "confluence", "apache"
]

const projectPrimarySlug: Record<string, string> = {
  kiwix: "vuedotjs",
  tauron: "fastapi",
  helicity: "pytorch",
  zamsizing: "mongodb",
  galatea: "palantir",
}

const projectTechStacks: Record<string, string[]> = {
  kiwix: ["vuedotjs", "pinia", "githubactions", "yaml", "python", "codemirror"],
  tauron: ["fastapi", "anthropic", "googlegemini", "ipfs", "leaflet", "react", "pandas", "numpy"],
  helicity: ["pytorch", "fastapi", "python", "react", "ollama", "d3", "mistralai", "numpy", "pandas", "scikitlearn", "networkx"],
  zamsizing: ["javascript", "react", "nodedotjs", "express", "mongodb", "googlegemini", "vercel"],
  galatea: ["networkx", "palantir", "javascript"],
}

const projectDisplayNames: Record<string, string> = {
  kiwix: "Kiwix",
  tauron: "Tauron",
  helicity: "Helicity",
  zamsizing: "ZAM",
  galatea: "Galatea",
}

const projectDescriptions: Record<string, string> = {
  kiwix: "Open source contributor on FreeCodeCamp which is part of the openZIM and Kiwix projects. I engineered a YAML based CI suite for locale key validation, implemented system wide dark mode with CSS variables and CodeMirror, and refactored core Vue components for optimized markdown parsing.",
  helicity: "Built a composite liquidity stress scoring engine over a NetworkX knowledge graph linking stablecoins, banks, and jurisdictions. Set up multimodel LLM jury using Claude and Gemini for consensus causal narratives, with scores pinned to IPFS for verifiable audit trails.",
  tauron: "Trained a GRU and GraphSAGE model over a 60 cow contact graph encoding 9 sensor features to predict mastitis, bovine respiratory disease, and lameness risk 48 hours ahead. Built gradient based feature attribution reducing per cow explanation latency by 40x.",
  zamsizing: "Built a fullstack web app automating market sizing analysis using Google Gemini AI with automatic model fallback. Features a nested hexagon visualization for TAM/SAM/SOM metrics with one click PNG export, deployed serverless on Vercel.",
  galatea: "Created end to end risk analytics platform for blockchain transactions, featuring real time address clustering, risk scoring, and case management. Processes millions of transactions using advanced graph algorithms and machine learning to detect suspicious activity through Palantir Foundry. Its interactive web dashboard enables rapid exploration, investigation, and reporting.",
}

const projectLinks: Record<string, string> = {
  kiwix: "https://browse.library.kiwix.org/viewer#freecodecamp_en_all_2026-02",
  tauron: "https://adiprathapa.github.io/Tauron/reveal_slides",
  helicity: "https://helicity-theta.vercel.app/",
  zamsizing: "https://zamsizing.vercel.app/",
  galatea: "https://galatea.usw-3.palantirfoundry.com/stargate/oidc/ee802905-77f2-44a2-a9d0-ed41e2caea0e/login",
}

const projectRepoLinks: Record<string, string> = {
  kiwix: "https://github.com/adiprathapa/freecodecamp",
  tauron: "https://github.com/adiprathapa/Tauron",
  helicity: "https://github.com/AI-HackathonNYC/helicity",
  zamsizing: "https://github.com/adiprathapa/ZAM",
  galatea: "https://github.com/adiprathapa/galatea",
}

const projectOrder = ['kiwix', 'tauron', 'helicity', 'zamsizing', 'galatea']
const thresholds = [0.00, 0.23, 0.46, 0.73, 0.96]

export function Projects() {
  const { scrolled, hidden } = useScrolled(50)
  const navVisible = scrolled && !hidden
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const animatedY = useTransform(scrollYProgress, [0, 1], [55, -3365])

  const [activeProject, setActiveProject] = useState<string>(projectOrder[0])
  const activeProjectRef = useRef<string>(projectOrder[0])
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const prevProgressRef = useRef<number>(0)

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const scrollingUp = latest < prevProgressRef.current
    prevProgressRef.current = latest

    const upOffset = scrollingUp ? -0.2 : 0
    let index = 0
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (latest >= thresholds[i] + upOffset) {
        index = i
        break
      }
    }
    const newProject = projectOrder[index]
    if (newProject !== activeProjectRef.current) {
      activeProjectRef.current = newProject
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = setTimeout(() => {
        setActiveProject(newProject)
      }, 50)
    }
  })

  const activeSlugIndices = useMemo(() => {
    if (!activeProject || !projectTechStacks[activeProject]) return null
    return projectTechStacks[activeProject]
      .map(s => slugs.indexOf(s))
      .filter(i => i !== -1)
  }, [activeProject])

  const rotationTargetIndex = useMemo(() => {
    if (!activeProject || !projectPrimarySlug[activeProject]) return null
    const idx = slugs.indexOf(projectPrimarySlug[activeProject])
    return idx !== -1 ? [idx] : null
  }, [activeProject])

  const safariX = -63
  const [safariLength] = useState(100)
  const safariScale = 1.4
  const cloudSize = 845
  const cloudX = 154
  const cloudY = 35

  const images = slugs.map(
    (slug) => slug === "networkx" ? "/networkx.png" : `https://cdn.simpleicons.org/${slug}/${slug}`
  )

  const blueRef = useRef<HTMLDivElement>(null)

  const [clipTop, setClipTop] = useState(0)

  useEffect(() => {
    if (!navVisible) {
      setClipTop(0)
      return
    }

    const computeClip = () => {
      const containerEl = blueRef.current
      if (!containerEl) return

      // Compute expected navbar bottom from CSS values (avoids transition timing issues)
      // Navbar outer div: padding 0.75rem top + header h-16 (4rem) + padding 0.75rem bottom = 5.5rem
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
      const navBottom = 5.5 * rem
      const containerTop = containerEl.getBoundingClientRect().top
      const gap = containerTop - navBottom

      if (gap <= 20) {
        setClipTop(Math.round(20 - gap))
      } else {
        setClipTop(0)
      }
    }

    computeClip()
    window.addEventListener('scroll', computeClip, { passive: true })
    window.addEventListener('resize', computeClip)
    return () => {
      window.removeEventListener('scroll', computeClip)
      window.removeEventListener('resize', computeClip)
    }
  }, [navVisible])

  return (
    <div ref={containerRef} className="relative h-[700vh]">
      <section id="projects" className="sticky top-0 bg-surface h-screen overflow-hidden flex items-center justify-center px-6 pb-6 pt-6">
        <div ref={blueRef} className="relative w-full h-full text-white overflow-hidden" style={{ backgroundColor: 'var(--color-primary)', clipPath: clipTop > 0 ? `inset(${clipTop}px 0 0 0 round 24px)` : 'inset(0 0 0 0 round 24px)', transition: clipTop > 0 ? 'clip-path 0ms' : 'clip-path 500ms cubic-bezier(0.4, 0, 0.2, 1)' }}>
          <FlickeringGrid
            color="rgb(0, 0, 0)"
            maxOpacity={0.95}
            squareSize={5}
            gridGap={3}
            flickerChance={0.06}
            className="absolute inset-0 z-0"
            style={{
              maskImage: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.15) 100%), linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 80%), radial-gradient(circle at 70% 70%, transparent 0%, transparent 15%, rgba(0,0,0,0.3) 40%, black 60%)',
              WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.15) 100%), linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 80%), radial-gradient(circle at 70% 70%, transparent 0%, transparent 15%, rgba(0,0,0,0.3) 40%, black 60%)',
              maskComposite: 'intersect',
              WebkitMaskComposite: 'destination-in',
            }}
          />
          <div className="relative z-10 mx-auto max-w-7xl px-12 h-full flex items-center">
            <div className="flex flex-col md:flex-row items-center justify-center w-full gap-16">
              {/* Left side — Safari browser mockups */}
              <motion.div
                className="flex items-center md:w-[50%] origin-center relative"
                style={{ x: safariX, y: animatedY, scale: safariScale }}
              >
                <FlipSafari
                  safariProps={{
                    url: projectLinks['kiwix'],
                    videoSrc: "/kiwix.mov",
                    style: { width: `calc(100% + ${safariLength}px)` },
                  }}
                  projectName={projectDisplayNames['kiwix']}
                  projectDescription={projectDescriptions['kiwix']}

                  projectUrl={projectRepoLinks['kiwix']}
                />
                {/* Second Project */}
                <div className="absolute top-[600px] left-0 right-0 flex items-center">
                  <FlipSafari
                    safariProps={{
                      url: projectLinks['tauron'],
                      videoSrc: "/tauron.mov",
                      videoCropTop: 11,
                      style: { width: `calc(100% + ${safariLength}px)` },
                    }}
                    projectName={projectDisplayNames['tauron']}
                    projectDescription={projectDescriptions['tauron']}

                    projectUrl={projectRepoLinks['tauron']}
                  />
                </div>
                {/* Third Project */}
                <div className="absolute top-[1200px] left-0 right-0 flex items-center">
                  <FlipSafari
                    safariProps={{
                      url: projectLinks['helicity'],
                      videoSrc: "/helicity.mov",
                      style: { width: `calc(100% + ${safariLength}px)` },
                    }}
                    projectName={projectDisplayNames['helicity']}
                    projectDescription={projectDescriptions['helicity']}

                    projectUrl={projectRepoLinks['helicity']}
                  />
                </div>
                {/* Fourth Project */}
                <div className="absolute top-[1800px] left-0 right-0 flex items-center">
                  <FlipSafari
                    safariProps={{
                      url: projectLinks['zamsizing'],
                      videoSrc: "/zam-copy.mp4",
                      videoCropTop: 42,
                      videoCropBottom: 42,
                      videoCropLeft: 112,
                      videoCropRight: 112,
                      style: { width: `calc(100% + ${safariLength}px)` },
                    }}
                    projectName={projectDisplayNames['zamsizing']}
                    projectDescription={projectDescriptions['zamsizing']}

                    projectUrl={projectRepoLinks['zamsizing']}
                  />
                </div>
                {/* Fifth Project */}
                <div className="absolute top-[2400px] left-0 right-0 flex items-center">
                  <FlipSafari
                    safariProps={{
                      url: projectLinks['galatea'],
                      videoSrc: "/recording-1.mov",
                      videoCropTop: 11,
                      style: { width: `calc(100% + ${safariLength}px)` },
                    }}
                    projectName={projectDisplayNames['galatea']}
                    projectDescription={projectDescriptions['galatea']}

                    projectUrl={projectRepoLinks['galatea']}
                  />
                </div>
              </motion.div>

              {/* Right side — Icon Cloud */}
              <div className="flex items-center justify-center md:w-[40%]" style={{ transform: `translateX(${cloudX}px) translateY(${cloudY}px)` }}>
                <IconCloud images={images} size={cloudSize} activeIconIndices={activeSlugIndices} rotationTargetIndices={rotationTargetIndex} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
