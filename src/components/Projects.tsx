import { useState, useRef, useMemo, useEffect } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import { useScrolled } from '../hooks/useScrolled'

import { IconCloud } from './ui/icon-cloud'
import { FlipSafari } from './ui/flip-safari'


const slugs = ["vuedotjs", "pinia", "githubactions", "yaml", "python", "codemirror", "pytorch", "fastapi", "react", "ollama", "d3", "anthropic", "googlegemini", "ipfs", "leaflet", "express", "mongodb", "vercel", "javascript", "palantir", "networkx", "typescript", "nextdotjs", "nodedotjs", "postgresql", "docker", "git", "github", "tensorflow", "html5", "css3", "flask", "openjdk", "c", "scikitlearn", "numpy", "pandas", "tailwindcss", "plotly", "mistralai", "redis", "sqlite", "confluence", "apache"
]

const slugToName: Record<string, string> = {
  vuedotjs: "Vue.js",
  pinia: "Pinia",
  githubactions: "GitHub Actions",
  yaml: "YAML",
  python: "Python",
  codemirror: "CodeMirror",
  pytorch: "PyTorch",
  fastapi: "FastAPI",
  react: "React",
  ollama: "Ollama",
  d3: "D3.js",
  anthropic: "Claude API",
  googlegemini: "Gemini API",
  ipfs: "IPFS",
  leaflet: "Leaflet",
  express: "Express",
  mongodb: "MongoDB",
  vercel: "Vercel",
  javascript: "JavaScript",
  palantir: "Palantir",
  networkx: "NetworkX",
  typescript: "TypeScript",
  nextdotjs: "Next.js",
  nodedotjs: "Node.js",
  postgresql: "PostgreSQL",
  docker: "Docker",
  git: "Git",
  github: "GitHub",
  tensorflow: "TensorFlow",
  html5: "HTML5",
  css3: "CSS3",
  flask: "Flask",
  openjdk: "Java",
  c: "C",
  scikitlearn: "scikit-learn",
  numpy: "NumPy",
  pandas: "pandas",
  tailwindcss: "Tailwind CSS",
  plotly: "Plotly",
  mistralai: "Mistral AI",
  redis: "Redis",
  sqlite: "SQLite",
  confluence: "Confluence",
  apache: "Apache",
}

const names = slugs.map(slug => slugToName[slug] || slug)

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

import { ProjectsBackground } from './ui/projects-background'

const projectOrder = ['kiwix', 'tauron', 'helicity', 'zamsizing', 'galatea']
const thresholds = [0.00, 0.23, 0.46, 0.73, 0.96]

export function Projects() {
  const { scrolled } = useScrolled(50)

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
    (slug) => slug === "networkx" ? "/networkx.png" : `https://cdn.simpleicons.org/${slug}/0671A4`
  )

  const blueRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const containerEl = blueRef.current
    if (!containerEl) return

    let rafId: number

    // Read current clip from DOM so we can blend smoothly from wherever we are
    const match = containerEl.style.clipPath.match(/inset\((\d+)px/)
    const startClip = match ? parseInt(match[1]) : 0
    const transitionStart = performance.now()
    const BLEND_MS = 500

    const update = () => {
      const navEl = document.querySelector('[data-navbar]') as HTMLElement
      if (!navEl || !containerEl) {
        rafId = requestAnimationFrame(update)
        return
      }

      // Compute where the clip should be based on the navbar's actual position
      let targetClip = 0
      if (scrolled) {
        const navBottom = navEl.getBoundingClientRect().bottom
        const containerTop = containerEl.getBoundingClientRect().top
        const gap = containerTop - navBottom
        if (navBottom > 0 && gap <= 20) {
          targetClip = Math.max(0, 20 - gap)
        }
      }

      // Blend from startClip toward targetClip over BLEND_MS,
      // then track the navbar directly after the blend completes
      const elapsed = performance.now() - transitionStart
      let clip: number
      if (elapsed < BLEND_MS) {
        const t = elapsed / BLEND_MS
        const eased = 1 - (1 - t) * (1 - t) // ease-out quadratic
        clip = startClip + (targetClip - startClip) * eased
      } else {
        clip = targetClip
      }

      containerEl.style.clipPath = `inset(${Math.round(clip)}px 0 0 0 round 24px)`

      // Keep RAF running while scrolled (for navbar hide/show tracking)
      // or while still blending out
      if (scrolled || elapsed < BLEND_MS) {
        rafId = requestAnimationFrame(update)
      }
    }

    containerEl.style.transition = 'none'
    rafId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(rafId)
  }, [scrolled])

  return (
    <div ref={containerRef} className="relative h-[700vh]">
      <section id="projects" className="sticky top-0 bg-surface h-screen overflow-hidden flex items-center justify-center px-6 pb-6 pt-6">
        <div ref={blueRef} className="relative w-full h-full text-foreground overflow-hidden" style={{ clipPath: 'inset(0 0 0 0 round 24px)' }}>
          <ProjectsBackground />

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
                <IconCloud images={images} names={names} size={cloudSize} activeIconIndices={activeSlugIndices} rotationTargetIndices={rotationTargetIndex} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
