import { useState, useRef, useMemo } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import { FlickeringGrid } from './ui/flickering-grid'
import { IconCloud } from './ui/icon-cloud'
import { Safari } from './ui/safari'

const slugs = ["vuedotjs", "pinia", "githubactions", "yaml", "python", "codemirror", "pytorch", "fastapi", "react", "ollama", "d3", "anthropic", "googlegemini", "ipfs", "leaflet", "express", "mongodb", "vercel", "javascript", "palantir", "networkx", "typescript", "nextdotjs", "nodedotjs", "postgresql", "docker", "git", "github", "tensorflow", "html5", "css3", "flask", "openjdk", "c", "scikitlearn", "numpy", "pandas", "tailwindcss", "plotly", "mistralai", "redis", "sqlite", "confluence", "apache"
]

const projectTechStacks: Record<string, string[]> = {
  kiwix: ["vuedotjs"],
  tauron: ["fastapi"],
  helicity: ["pytorch"],
  zamsizing: ["mongodb"],
  galatea: ["palantir"],
}

const projectOrder = ['kiwix', 'tauron', 'helicity', 'zamsizing', 'galatea']
const thresholds = [0.00, 0.23, 0.46, 0.73, 0.96]

export function Projects() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const animatedY = useTransform(scrollYProgress, [0, 1], [55, -3365])

  const [activeProject, setActiveProject] = useState<string>(projectOrder[0])
  const activeProjectRef = useRef<string>(projectOrder[0])
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    let index = 0
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (latest >= thresholds[i]) {
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

  const safariX = -63
  const [safariLength] = useState(100)
  const safariScale = 1.4
  const cloudSize = 845
  const cloudX = 154
  const cloudY = 35

  const images = slugs.map(
    (slug) => slug === "networkx" ? "/networkx.png" : `https://cdn.simpleicons.org/${slug}/${slug}`
  )

  return (
    <div ref={containerRef} className="relative h-[700vh]">
      <section id="projects" className="sticky top-0 bg-[#080d14] text-white h-screen overflow-hidden">
        {/* Subtle radial gradient for depth */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: 'radial-gradient(ellipse at 30% 50%, rgba(6, 113, 164, 0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 40%, rgba(56, 189, 248, 0.06) 0%, transparent 50%)',
          }}
        />
        <FlickeringGrid
          color="rgb(56, 189, 248)"
          maxOpacity={0.9}
          squareSize={5}
          gridGap={8}
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
              <Safari
                url="https://browse.library.kiwix.org/viewer#freecodecamp_en_all_2026-02"
                videoSrc="/kiwix.mov"
                style={{ width: `calc(100% + ${safariLength}px)` }}
              />
              {/* Second Project */}
              <div className="absolute top-[600px] left-0 right-0 flex items-center">
                <Safari
                  url="https://adiprathapa.github.io/Tauron/reveal_slides"
                  videoSrc="/tauron.mov"
                  videoCropTop={11}
                  style={{ width: `calc(100% + ${safariLength}px)` }}
                />
              </div>
              {/* Third Project */}
              <div className="absolute top-[1200px] left-0 right-0 flex items-center">
                <Safari
                  url="https://helicity-theta.vercel.app/"
                  videoSrc="/helicity.mov"
                  style={{ width: `calc(100% + ${safariLength}px)` }}
                />
              </div>
              {/* Fourth Project */}
              <div className="absolute top-[1800px] left-0 right-0 flex items-center">
                <Safari
                  url="https://zamsizing.vercel.app/"
                  videoSrc="/zam-copy.mp4"
                  videoCropTop={42}
                  videoCropBottom={42}
                  videoCropLeft={112}
                  videoCropRight={112}
                  style={{ width: `calc(100% + ${safariLength}px)` }}
                />
              </div>
              {/* Fifth Project */}
              <div className="absolute top-[2400px] left-0 right-0 flex items-center">
                <Safari
                  url="https://galatea.usw-3.palantirfoundry.com/stargate/oidc/ee802905-77f2-44a2-a9d0-ed41e2caea0e/login"
                  videoSrc="/recording-1.mov"
                  videoCropTop={11}
                  style={{ width: `calc(100% + ${safariLength}px)` }}
                />
              </div>
            </motion.div>

            {/* Right side — Icon Cloud */}
            <div className="flex items-center justify-center md:w-[40%]" style={{ transform: `translateX(${cloudX}px) translateY(${cloudY}px)` }}>
              <IconCloud images={images} size={cloudSize} activeIconIndices={activeSlugIndices} />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
