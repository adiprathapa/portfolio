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

function isMaskTinted(tech: TechItem) {
  return tech.name === 'NetworkX' || tech.name === 'Claude API' || tech.name === 'Matplotlib'
}

const ICON_MAX_RETRIES = 2

function useIconLoader(iconUrl: string) {
  const [iconLoaded, setIconLoaded] = useState(false)
  const [iconFailed, setIconFailed] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const attemptRef = useRef(0)

  useEffect(() => {
    let cancelled = false
    attemptRef.current = 0
    setIconLoaded(false)
    setIconFailed(false)
    setRetryKey(0)

    const baseSrc = getIconSrc(iconUrl, false)
    const hoverSrc = getIconSrc(iconUrl, true)

    const tryLoad = () => {
      if (cancelled) return
      const img = new Image()
      img.src = attemptRef.current > 0 ? `${baseSrc}${baseSrc.includes('?') ? '&' : '?'}r=${attemptRef.current}` : baseSrc
      img.onload = () => { if (!cancelled) setIconLoaded(true) }
      img.onerror = () => {
        if (cancelled) return
        if (attemptRef.current < ICON_MAX_RETRIES) {
          attemptRef.current += 1
          setTimeout(tryLoad, 700 * attemptRef.current)
        } else {
          setIconLoaded(true)
          setIconFailed(true)
        }
      }
    }
    tryLoad()

    if (hoverSrc !== baseSrc) {
      const hoverImg = new Image()
      hoverImg.src = hoverSrc
    }

    return () => { cancelled = true }
  }, [iconUrl])

  const handleImgError = useCallback(() => {
    if (attemptRef.current < ICON_MAX_RETRIES) {
      attemptRef.current += 1
      setRetryKey(k => k + 1)
    } else {
      setIconFailed(true)
    }
  }, [])

  const cacheBustSuffix = retryKey > 0
    ? (iconUrl.includes('?') ? `&r=${retryKey}` : `?r=${retryKey}`)
    : ''

  return { iconLoaded, iconFailed, handleImgError, cacheBustSuffix }
}

function TintedIcon({ tech, hovered, hoverScale, onError }: {
  tech: TechItem
  hovered: boolean
  hoverScale: number
  onError: () => void
}) {
  const transform = hovered ? `rotate(-8deg) scale(${hoverScale})` : 'rotate(0deg)'
  const transition = 'opacity 0.2s ease, transform 0.2s ease'
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: '#0671A4',
          WebkitMaskImage: `url(${tech.icon})`,
          maskImage: `url(${tech.icon})`,
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
          opacity: hovered ? 0 : 1,
          transform,
          transition,
        }}
      />
      <img
        src={getIconSrc(tech.icon, true)}
        alt={tech.name}
        className="absolute inset-0 w-full h-full"
        loading="eager"
        decoding="async"
        style={{
          opacity: hovered ? 1 : 0,
          transform,
          transition,
        }}
        onError={onError}
      />
    </>
  )
}

function getIconSrc(icon: string, hovered: boolean) {
  if (!hovered) return icon
  if (icon === '/matplotlib-mark.svg') return '/matplotlib-rainbow.svg'
  if (icon === '/icons/confluence-0671A4.svg') return '/icons/confluence-4C9AFF.svg'
  if (icon === '/icons/posthog-0671A4.svg') return '/icons/posthog-F9BD2B.svg'
  return icon.replace('-0671A4.svg', '.svg')
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
  confluence: '#4C9AFF',
  git: '#F05032',
  github: '#181717',
  pandas: '#150458',
  numpy: '#013243',
  mongodb: '#47A248',
  postgresql: '#4169E1',
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
  posthog: '#F9BD2B',
  clerk: '#6C47FF',
  pinia: '#FFD859',
  supabase: '#3ECF8E',
  redis: '#DC382D',
  docker: '#2496ED',
  html5: '#E34F26',
  css: '#6E43B8',
  css3: '#6E43B8',
  flask: '#3BABC3',
  plotly: '#7A76FF',
  apache: '#D22128',
  huggingface: '#FFD21E',
  nvidia: '#76B900',
  mediapipe: '#0097A7',
  elevenlabs: '#000000',
}

function getTechAccentColor(tech: TechItem) {
  if (tech.name === 'NetworkX') return '#2B7BBB'
  if (tech.name === 'Claude API') return '#D97757'
  if (tech.name === 'Matplotlib') return '#11557C'
  const slugMatch = tech.icon.match(/\/icons\/([^/.-]+)/)
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
  { name: 'React', icon: '/icons/react-0671A4.svg', url: 'https://react.dev', blurb: 'Built interactive UIs for data visualization web applications' },
  { name: 'Python', icon: '/icons/python-0671A4.svg', url: 'https://python.org', blurb: 'Trained ML models and shipped backend APIs for data insights' },
  { name: 'TypeScript', icon: '/icons/typescript-0671A4.svg', url: 'https://typescriptlang.org', blurb: 'Architected type safe frontends for clients' },
  { name: 'PyTorch', icon: '/icons/pytorch-0671A4.svg', url: 'https://pytorch.org', blurb: 'Trained GRU and GraphSAGE models for complex data analysis' },
  { name: 'Node.js', icon: '/icons/nodedotjs-0671A4.svg', url: 'https://nodejs.org', blurb: 'Deployed full stack apps and REST APIs for client projects' },
  { name: 'Java', icon: '/icons/openjdk-0671A4.svg', url: 'https://dev.java', blurb: 'Engineered backend systems and data structures' },
  { name: 'NetworkX', icon: '/networkx.png', url: 'https://networkx.org', blurb: 'Constructed knowledge graphs and contact networks to detect anomalies' },
  { name: 'Google ADK', icon: '/icons/google-0671A4.svg', url: 'https://google.github.io/adk-docs/', blurb: 'Orchestrated sequential multi agent workflows' },
  { name: 'Confluence', icon: '/icons/confluence-0671A4.svg', url: 'https://www.atlassian.com/software/confluence', blurb: 'Documented engineering workflows and team project plans for C2S2' },
  { name: 'Apache HTTP Server', icon: '/icons/apache-0671A4.svg', url: 'https://httpd.apache.org', blurb: "Maintained C2S2 site on Cornell's Apache HTTP Server" },
  { name: 'PostHog', icon: '/icons/posthog-0671A4.svg', url: 'https://posthog.com', blurb: 'This site uses PostHog for product analytics' },
  { name: 'Docker', icon: '/icons/docker-0671A4.svg', url: 'https://www.docker.com', blurb: 'Containerized app services for deployable apps to clients' },
  { name: 'PostgreSQL', icon: '/icons/postgresql-0671A4.svg', url: 'https://www.postgresql.org', blurb: 'Designed relational schemas and queried analytics data for client applications' },
  { name: 'Ollama', icon: '/icons/ollama-0671A4.svg', url: 'https://ollama.com', blurb: 'Ran local LLM inference pipelines for XAI' },
  { name: 'Hugging Face', icon: '/icons/huggingface-0671A4.svg', url: 'https://huggingface.co', blurb: 'Pulled FineWeb shards and pretrained checkpoints from the Hub for ML training pipelines' },
  { name: 'CUDA', icon: '/icons/nvidia-0671A4.svg', url: 'https://developer.nvidia.com/cuda-toolkit', blurb: 'Trained transformer models on H100 GPUs with FlashAttention 3 and CUDA 13' },
]

const minorTech: TechItem[] = [
  { name: 'Clerk', icon: '/icons/clerk-0671A4.svg', url: 'https://clerk.com' },
  { name: 'Vue.js', icon: '/icons/vuedotjs-0671A4.svg', url: 'https://vuejs.org' },
  { name: 'JavaScript', icon: '/icons/javascript-0671A4.svg', url: 'https://developer.mozilla.org/docs/Web/JavaScript' },
  { name: 'FastAPI', icon: '/icons/fastapi-0671A4.svg', url: 'https://fastapi.tiangolo.com' },
  { name: 'HTML5', icon: '/icons/html5-0671A4.svg', url: 'https://developer.mozilla.org/docs/Web/HTML', blurb: 'Built accessible page structure for production web interfaces' },
  { name: 'CSS3', icon: '/icons/css-0671A4.svg', url: 'https://developer.mozilla.org/docs/Web/CSS', blurb: 'Implemented responsive layouts, theming systems, and polished UI interactions' },
  { name: 'Flask', icon: '/icons/flask-0671A4.svg', url: 'https://flask.palletsprojects.com', blurb: 'Built lightweight API endpoints and backend utilities for rapid feature delivery' },
  { name: 'Git', icon: '/icons/git-0671A4.svg', url: 'https://git-scm.com', blurb: 'Managed branching, review workflows, and release ready version control' },
  { name: 'GitHub', icon: '/icons/github-0671A4.svg', url: 'https://github.com', blurb: 'Shipped collaborative code with PRs, issue tracking, and CI integrated repos' },
  { name: 'Supabase', icon: '/icons/supabase-0671A4.svg', url: 'https://supabase.com' },
  { name: 'Redis', icon: '/icons/redis-0671A4.svg', url: 'https://redis.io' },
  { name: 'pandas', icon: '/icons/pandas-0671A4.svg', url: 'https://pandas.pydata.org' },
  { name: 'NumPy', icon: '/icons/numpy-0671A4.svg', url: 'https://numpy.org' },
  { name: 'MongoDB', icon: '/icons/mongodb-0671A4.svg', url: 'https://mongodb.com' },
  { name: 'D3.js', icon: '/icons/d3-0671A4.svg', url: 'https://d3js.org' },
  { name: 'Plotly', icon: '/icons/plotly-0671A4.svg', url: 'https://plotly.com', blurb: 'Created and presented KPI metrics using Plotly visualizations' },
  { name: 'CodeMirror', icon: '/icons/codemirror-0671A4.svg', url: 'https://codemirror.net' },
  { name: 'YAML', icon: '/icons/yaml-0671A4.svg', url: 'https://yaml.org', blurb: 'Built CI validation and configuration workflows for large open source codebases' },
  { name: 'scikit-learn', icon: '/icons/scikitlearn-0671A4.svg', url: 'https://scikit-learn.org' },
  { name: 'Express', icon: '/icons/express-0671A4.svg', url: 'https://expressjs.com' },
  { name: 'Vercel', icon: '/icons/vercel-0671A4.svg', url: 'https://vercel.com' },
  { name: 'TensorFlow', icon: '/icons/tensorflow-0671A4.svg', url: 'https://tensorflow.org' },
  { name: 'GitHub Actions', icon: '/icons/githubactions-0671A4.svg', url: 'https://github.com/features/actions' },
  { name: 'IPFS', icon: '/icons/ipfs-0671A4.svg', url: 'https://ipfs.tech' },
  { name: 'Claude API', icon: '/claude.svg', url: 'https://docs.anthropic.com' },
  { name: 'Gemini API', icon: '/icons/googlegemini-0671A4.svg', url: 'https://ai.google.dev', blurb: 'Built multi-model AI workflows and fallback orchestration for production apps' },
  { name: 'Mistral AI', icon: '/icons/mistralai-0671A4.svg', url: 'https://mistral.ai' },
  { name: 'Leaflet', icon: '/icons/leaflet-0671A4.svg', url: 'https://leafletjs.com' },
  { name: 'Palantir Foundry', icon: '/icons/palantir-0671A4.svg', url: 'https://www.palantir.com/platforms/foundry/', blurb: 'Built an on-chain risk prototype with graph risk scoring and case management on Foundry' },
  { name: 'MediaPipe', icon: '/icons/mediapipe-0671A4.svg', url: 'https://ai.google.dev/edge/mediapipe', blurb: 'Streamed real time pose keypoints from phone cameras to a 60Hz game server for hit detection' },
  { name: 'ElevenLabs', icon: '/icons/elevenlabs-0671A4.svg', url: 'https://elevenlabs.io', blurb: 'Generated low latency AI commentary voices for live in browser game streams' },
  { name: 'Matplotlib', icon: '/matplotlib-mark.svg', url: 'https://matplotlib.org', blurb: 'Visualized macro placements, training metrics, and sensor signals across ML and EDA projects' },
]

function SmallCard({ tech }: { tech: TechItem }) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const canHoverRef = useRef(false)
  const iconSize = tech.name === 'Apache HTTP Server' ? 40 : tech.name === 'YAML' ? 24 : 32
  const accentColor = getTechAccentColor(tech)
  const borderColor = hovered ? accentColor : 'rgba(6, 113, 164, 0.3)'
  const textColor = hovered ? accentColor : '#0671A4'
  const { iconLoaded, iconFailed, handleImgError, cacheBustSuffix } = useIconLoader(tech.icon)
  const showIcon = iconLoaded && !iconFailed

  useEffect(() => {
    const mql = window.matchMedia('(hover: hover) and (pointer: fine)')
    const update = () => {
      canHoverRef.current = mql.matches
    }
    update()
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [])

  return (
    <div
      className="rounded-xl flex items-center px-5 cursor-pointer select-none relative"
      style={{
        width: 220,
        height: 146,
        background: hovered ? '#FFFFFF' : '#F5F5F5',
        border: `1.5px solid ${borderColor}`,
        transform: pressed ? 'scale(0.97)' : hovered ? 'scale(1.03) translateY(-2px)' : 'scale(1)',
        zIndex: hovered ? 20 : 1,
        boxShadow: hovered
          ? '0 16px 48px rgba(6, 113, 164, 0.1), 0 4px 12px rgba(0, 0, 0, 0.04)'
          : '0 4px 12px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.2s ease',
        gap: showIcon ? 12 : 0,
        justifyContent: showIcon ? 'flex-start' : 'center',
      }}
      onMouseEnter={() => { if (canHoverRef.current) setHovered(true) }}
      onMouseLeave={() => { if (canHoverRef.current) { setHovered(false); setPressed(false) } }}
      onMouseDown={() => { if (canHoverRef.current) setPressed(true) }}
      onMouseUp={() => { if (canHoverRef.current) setPressed(false) }}
      onClick={() => window.open(tech.url, '_blank')}
      role="link"
      tabIndex={0}
      aria-label={tech.name}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.open(tech.url, '_blank') } }}
    >
      {showIcon && (
        <motion.div
          className="relative shrink-0"
          style={{ width: iconSize, height: iconSize }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {isMaskTinted(tech) ? (
            <TintedIcon
              tech={tech}
              hovered={hovered}
              hoverScale={1.1}
              onError={handleImgError}
            />
          ) : (
            <img
              src={getIconSrc(tech.icon, hovered) + cacheBustSuffix}
              alt={tech.name}
              className="w-full h-full shrink-0"
              loading="eager"
              decoding="async"
              style={{
                transform: hovered ? 'rotate(-8deg) scale(1.1)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
              onError={handleImgError}
            />
          )}
        </motion.div>
      )}
      <motion.span
        layout
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="text-base font-medium"
        style={{ color: textColor, transition: 'color 0.2s ease', textAlign: showIcon ? 'left' : 'center' }}
      >
        {tech.name}
      </motion.span>
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
    const canHoverRef = useRef(false)
    const iconSize = tech.name === 'Apache HTTP Server' ? 52 : tech.name === 'YAML' ? 30 : 40
    const tallBlurb = (tech.blurb ?? `Applied ${tech.name} in shipped projects and internal workflows`).replace(/[.\s]+$/, '')
    const accentColor = getTechAccentColor(tech)
    const borderColor = hovered ? accentColor : 'rgba(6, 113, 164, 0.3)'
    const textColor = hovered ? accentColor : '#0671A4'
    const blurbColor = hovered ? hexToRgba(accentColor, 0.75) : 'rgba(6, 113, 164, 0.7)'
    const { iconLoaded, iconFailed, handleImgError, cacheBustSuffix } = useIconLoader(tech.icon)
    const showIcon = iconLoaded && !iconFailed

    useEffect(() => {
      const mql = window.matchMedia('(hover: hover) and (pointer: fine)')
      const update = () => {
        canHoverRef.current = mql.matches
      }
      update()
      mql.addEventListener('change', update)
      return () => mql.removeEventListener('change', update)
    }, [])

    return (
      <div
        className="rounded-xl flex flex-col justify-center items-start px-6 gap-3 cursor-pointer select-none relative"
        style={{
          width: 300,
          height: 300,
          background: hovered ? '#FFFFFF' : '#F5F5F5',
          border: `1.5px solid ${borderColor}`,
          transform: pressed ? 'scale(0.97)' : hovered ? 'scale(1.03) translateY(-3px)' : 'scale(1)',
          zIndex: hovered ? 20 : 1,
          boxShadow: hovered
            ? '0 16px 48px rgba(6, 113, 164, 0.1), 0 4px 12px rgba(0, 0, 0, 0.04)'
            : '0 4px 12px rgba(0, 0, 0, 0.04)',
          transition: 'all 0.2s ease',
          alignItems: showIcon ? 'flex-start' : 'center',
          textAlign: showIcon ? 'left' : 'center',
        }}
        onMouseEnter={() => { if (canHoverRef.current) setHovered(true) }}
        onMouseLeave={() => { if (canHoverRef.current) { setHovered(false); setPressed(false) } }}
        onMouseDown={() => { if (canHoverRef.current) setPressed(true) }}
        onMouseUp={() => { if (canHoverRef.current) setPressed(false) }}
        onClick={() => window.open(tech.url, '_blank')}
        role="link"
        tabIndex={0}
        aria-label={tech.name}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.open(tech.url, '_blank') } }}
      >
        {showIcon && (
          <motion.div
            className="relative"
            style={{ width: iconSize, height: iconSize }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {isMaskTinted(tech) ? (
              <TintedIcon
                tech={tech}
                hovered={hovered}
                hoverScale={1.15}
                onError={handleImgError}
              />
            ) : (
              <img
                src={getIconSrc(tech.icon, hovered) + cacheBustSuffix}
                alt={tech.name}
                className="w-full h-full"
                loading="eager"
                decoding="async"
                style={{
                  transform: hovered ? 'rotate(-8deg) scale(1.15)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                }}
                onError={handleImgError}
              />
            )}
          </motion.div>
        )}
        <motion.span layout transition={{ duration: 0.3, ease: 'easeOut' }} className="text-lg font-medium" style={{ color: textColor, transition: 'color 0.2s ease' }}>{tech.name}</motion.span>
        <motion.span layout transition={{ duration: 0.3, ease: 'easeOut' }} className="text-sm leading-relaxed" style={{ color: blurbColor, transition: 'color 0.2s ease' }}>{tallBlurb}</motion.span>
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

export function ProjectMarquee({ active }: { active: boolean }) {
    const halfRef = useRef<HTMLDivElement>(null)
    const trackRef = useRef<HTMLDivElement>(null)
    const offsetRef = useRef(0)
    const halfWidthRef = useRef(0)
    const rafRef = useRef<number>(0)
    const pausedRef = useRef(false)
    const speedMultiplierRef = useRef(1)
    const canHoverRef = useRef(false)

    const handleMouseEnter = useCallback(() => {
      if (canHoverRef.current) pausedRef.current = true
    }, [])
    const handleMouseLeave = useCallback(() => {
      if (canHoverRef.current) pausedRef.current = false
    }, [])

    useEffect(() => {
      const mql = window.matchMedia('(hover: hover) and (pointer: fine)')
      const update = () => {
        canHoverRef.current = mql.matches
      }
      update()
      mql.addEventListener('change', update)

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
          speedMultiplierRef.current = 2
        }
      }

      const onKeyUp = (e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
          speedMultiplierRef.current = 1
        }
      }

      const onWindowBlur = () => {
        speedMultiplierRef.current = 1
      }

      window.addEventListener('keydown', onKeyDown)
      window.addEventListener('keyup', onKeyUp)
      window.addEventListener('blur', onWindowBlur)

      return () => {
        mql.removeEventListener('change', update)
        window.removeEventListener('keydown', onKeyDown)
        window.removeEventListener('keyup', onKeyUp)
        window.removeEventListener('blur', onWindowBlur)
      }
    }, [])

    useEffect(() => {
      const halfEl = halfRef.current
      if (!halfEl) return

      const updateHalfWidth = () => {
        halfWidthRef.current = halfEl.offsetWidth + 16
      }

      updateHalfWidth()
      const ro = new ResizeObserver(updateHalfWidth)
      ro.observe(halfEl)

      return () => ro.disconnect()
    }, [])

    useEffect(() => {
      if (!active) return
      const baseSpeed = 1.5
      const tick = () => {
        if (!pausedRef.current) {
          const halfWidth = halfWidthRef.current
          if (halfWidth > 0) {
            offsetRef.current -= baseSpeed * speedMultiplierRef.current
            if (offsetRef.current <= -halfWidth) offsetRef.current += halfWidth
          }
          if (trackRef.current) {
            trackRef.current.style.transform = `translateX(${offsetRef.current}px)`
          }
        }
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
      return () => cancelAnimationFrame(rafRef.current)
    }, [active])

    // Build a full pass that exhausts all tech items before repeating.
    const buildItems = useCallback((keyPrefix: string) => {
      const nodes: React.ReactNode[] = []
      const majorQueue = [...majorTech]
      const minorQueue = [...minorTech]
      let i = 0

      const pullMinorForTall = () => {
        const idx = minorQueue.findIndex(
          (t) => t.name !== 'YAML' && t.name !== 'CodeMirror' && t.name !== 'Leaflet' && t.name !== 'Pinia'
        )
        if (idx >= 0) return minorQueue.splice(idx, 1)[0]
        return minorQueue.shift()
      }

      while (majorQueue.length > 0 || minorQueue.length > 0) {
        const tallTech = majorQueue.shift() ?? pullMinorForTall()
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
    }, [])

    return (
      <div
        className="w-full overflow-visible"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          ref={trackRef}
          className="flex gap-4 w-max items-start"
          style={{ willChange: 'transform' }}
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

const COARSE_POINTER = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

const CARDS: {
  id: string
  image: string
  caption: string
  bgSize?: string
  bgPosition?: string
  topLeftBlue?: boolean
}[] = [
  { id: 'card-1', image: '/img3.webp', caption: 'Cornell Data & Strategy Meeting' },
  { id: 'card-2', image: '/team-presentation.webp', caption: 'Stablecoin Presentation at Cornell Hackathon' },
  { id: 'card-3', image: '/img3-stack.webp', caption: 'Formal Organizing Group' },
  { id: 'card-6', image: '/treman-hiking.webp', caption: 'Hiking in Robert H. Treman State Park', topLeftBlue: true },
  { id: 'card-4', image: '/card-3.webp', caption: 'Eagle Scout Project' },
  { id: 'card-5', image: '/coh.webp', caption: 'After Eagle Scout Board of Review', bgSize: '180%', bgPosition: 'center center' },
]

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

function ThrowableCard({ card, zIndex, rotation, imageLoaded, onGone, onGrab, onThrowSpeed }: {
  card: typeof CARDS[number]
  zIndex: number
  rotation: number
  imageLoaded: boolean
  onGone: (id: string) => void
  onGrab?: () => void
  onThrowSpeed?: (speed: number) => void
}) {
  const controls = useAnimation()
  const cardRef = useRef<HTMLDivElement>(null)
  const throwSampleRef = useRef({
    lastTime: 0,
    lastVx: 0,
    lastVy: 0,
    peakSpeed: 0,
    peakAcceleration: 0,
  })

  const resetThrowSample = useCallback(() => {
    throwSampleRef.current = {
      lastTime: performance.now(),
      lastVx: 0,
      lastVy: 0,
      peakSpeed: 0,
      peakAcceleration: 0,
    }
    onGrab?.()
  }, [onGrab])

  const sampleThrowMotion = useCallback((_: unknown, info: PanInfo) => {
    const now = performance.now()
    const sample = throwSampleRef.current
    const dt = Math.max((now - sample.lastTime) / 1000, 0.016)
    const speed = Math.hypot(info.velocity.x, info.velocity.y)
    const acceleration = Math.hypot(
      info.velocity.x - sample.lastVx,
      info.velocity.y - sample.lastVy
    ) / dt

    sample.lastTime = now
    sample.lastVx = info.velocity.x
    sample.lastVy = info.velocity.y
    sample.peakSpeed = Math.max(sample.peakSpeed, speed)
    sample.peakAcceleration = Math.max(sample.peakAcceleration, acceleration)
  }, [])

  const handleDragEnd = useCallback(async (_: unknown, info: PanInfo) => {
    const vx = info.velocity.x
    const vy = info.velocity.y
    const speed = Math.sqrt(vx * vx + vy * vy)

    if (speed > 300) {
      onThrowSpeed?.(Math.round(speed))
      const { peakSpeed, peakAcceleration } = throwSampleRef.current
      const releaseForce = clamp((speed - 300) / 1800, 0, 1)
      const peakForce = clamp((peakSpeed - 300) / 2600, 0, 1)
      const accelerationForce = clamp((peakAcceleration - 1800) / 22000, 0, 1)
      const rawThrowForce = clamp(releaseForce * 0.45 + peakForce * 0.3 + accelerationForce * 0.25, 0, 1)
      const throwForce = Math.pow(rawThrowForce, 0.72)
      const viewportExitDistance = clamp(Math.hypot(window.innerWidth, window.innerHeight) * 0.68, 680, 1300)
      const forceDistance = viewportExitDistance * (0.7 + throwForce * 0.22)
      const directionX = vx / speed
      const directionY = vy / speed
      const rect = cardRef.current?.getBoundingClientRect()
      const cardCenterX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
      const cardCenterY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2
      const exitX = directionX > 0
        ? (window.innerWidth - cardCenterX) / directionX
        : directionX < 0
          ? -cardCenterX / directionX
          : Number.POSITIVE_INFINITY
      const exitY = directionY > 0
        ? (window.innerHeight - cardCenterY) / directionY
        : directionY < 0
          ? -cardCenterY / directionY
          : Number.POSITIVE_INFINITY
      const distanceToEdge = Math.min(exitX, exitY)
      const clearDistance = Number.isFinite(distanceToEdge)
        ? distanceToEdge + Math.max(rect?.width ?? 400, rect?.height ?? 420)
        : viewportExitDistance
      const throwDistance = Math.max(forceDistance, clearDistance)
      const speedFloor = 2000
      const speedCeiling = 100000
      const clampedSpeed = clamp(speed, speedFloor, speedCeiling)
      const speedRange = Math.log(clampedSpeed / speedFloor) / Math.log(speedCeiling / speedFloor)
      const speedCurve = Math.pow(speedRange, 0.55)
      const visualPixelsPerSecond = (620 + speedCurve * 2600) * 1.5
      const throwDuration = clamp(throwDistance / visualPixelsPerSecond, 0.32, 1.8)
      const spinDirection = vx >= 0 ? 1 : -1
      const spin = spinDirection * (7 + throwForce * 24)

      await controls.start({
        x: info.offset.x + directionX * throwDistance,
        y: info.offset.y + directionY * throwDistance,
        rotate: rotation + spin,
        transition: { duration: throwDuration, ease: 'linear' },
      })
      onGone(card.id)
      controls.set({ x: 0, y: 0, rotate: rotation, scale: 0.95 })
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
  }, [controls, card.id, onGone, onThrowSpeed, rotation])

  return (
    <motion.div
      ref={cardRef}
      drag={COARSE_POINTER ? 'x' : true}
      dragDirectionLock={COARSE_POINTER}
      onDragStart={resetThrowSample}
      onDrag={sampleThrowMotion}
      dragElastic={0.8}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      animate={controls}
      initial={{ rotate: rotation }}
      whileDrag={{ scale: 1.05, cursor: 'grabbing' }}
      className="absolute inset-0 group cursor-grab rounded-2xl overflow-hidden"
      style={{
        zIndex,
        rotate: rotation,
        ...(COARSE_POINTER ? { touchAction: 'pan-y' as const } : {}),
        border: '1.5px solid rgba(6, 113, 164, 0.3)',
        boxSizing: 'border-box',
        backgroundClip: 'padding-box',
        backgroundImage: imageLoaded
          ? card.topLeftBlue
            ? `linear-gradient(145deg, rgba(6,113,164,0.5) 0%, rgba(56,189,248,0.3) 36%, transparent 65%), url('${card.image}')`
            : `linear-gradient(135deg, rgba(6,113,164,0.3), rgba(56,189,248,0.2), transparent 60%), url('${card.image}')`
          : card.topLeftBlue
            ? 'linear-gradient(145deg, rgba(6,113,164,0.34), rgba(56,189,248,0.22), rgba(6,113,164,0.1))'
            : 'linear-gradient(135deg, rgba(6,113,164,0.22), rgba(56,189,248,0.14), rgba(6,113,164,0.08))',
        backgroundSize: card.bgSize ?? 'cover',
        backgroundPosition: card.bgPosition ?? 'center',
        filter: 'saturate(1.3) contrast(1.1) brightness(1.05)',
        transition: 'background-image 0.25s ease',
      }}
    >
      {!imageLoaded && (
        <div
          className="absolute inset-0 animate-pulse"
          style={{ background: 'rgba(255, 255, 255, 0.22)' }}
        />
      )}
      <span className="absolute bottom-0 left-0 right-0 px-4 py-3 text-white text-xs font-medium bg-gradient-to-t from-[rgba(6,113,164,0.7)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl">
        {card.caption}
      </span>
    </motion.div>
  )
}

function getThrowMessage(speed: number): string {
  const pick = (msgs: string[]) => msgs[Math.floor(Math.random() * msgs.length)]
  if (speed < 2500) return pick([
    'Gentle toss',
    'Easy there',
    'Baby throw',
    'That was cute',
    'Soft hands',
    'Not bad',
    'Nice flick',
  ])
  if (speed < 5000) return pick([
    'Getting warmer',
    'Decent arm',
    'Solid throw',
    'Now we\'re talking',
    'Strong arm!',
    'Impressive',
    'That had some zip',
  ])
  if (speed < 10000) return pick([
    'Serious heat',
    'Absolute cannon',
    'Did you play baseball?',
    'Sheesh',
    'Certified launcher',
    'That card had a family',
  ])
  return pick([
    'Are you okay??',
    'Call the police',
    'Physics left the chat',
    'Unholy velocity',
    'Bro chill',
    'NASA called, they want their rocket back',
  ])
}

export function About() {
  // order[0] = top of stack (highest z), order[last] = bottom
  const [order, setOrder] = useState(() => CARDS.map((_, i) => i))
  const [hasGrabbed, setHasGrabbed] = useState(false)
  const [lastThrowSpeed, setLastThrowSpeed] = useState<number | null>(null)
  const [throwMessage, setThrowMessage] = useState('')
  const [marqueeActive, setMarqueeActive] = useState(false)
  const [aboutMediaActive, setAboutMediaActive] = useState(false)
  const [loadedCardImages, setLoadedCardImages] = useState<Record<string, boolean>>({})
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    let warmupIdleId: number | null = null
    let warmupTimeoutId: ReturnType<typeof setTimeout> | null = null
    const marqueeObserver = new IntersectionObserver(
      ([entry]) => setMarqueeActive(entry.isIntersecting),
      { threshold: 0.3 },
    )
    const mediaObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAboutMediaActive(true)
          mediaObserver.disconnect()
        }
      },
      { rootMargin: '320px 0px', threshold: 0.1 },
    )

    marqueeObserver.observe(el)
    mediaObserver.observe(el)

    // The About panel is the next horizontal stop on desktop. Its card images
    // are now compact WebPs, so warming them shortly after first paint is cheap
    // and avoids the hero -> About transition waiting on media work.
    if (typeof requestIdleCallback === 'function') {
      warmupIdleId = requestIdleCallback(() => setAboutMediaActive(true), { timeout: 1200 })
    } else {
      warmupTimeoutId = setTimeout(() => setAboutMediaActive(true), 700)
    }

    return () => {
      marqueeObserver.disconnect()
      mediaObserver.disconnect()
      if (warmupIdleId !== null && typeof cancelIdleCallback === 'function') cancelIdleCallback(warmupIdleId)
      if (warmupTimeoutId !== null) clearTimeout(warmupTimeoutId)
    }
  }, [])

  useEffect(() => {
    if (!aboutMediaActive) return
    let cancelled = false
    let idleId: number | null = null
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    let index = 0

    const loadNext = () => {
      if (cancelled || index >= CARDS.length) return
      const card = CARDS[index++]
      const img = new Image()
      img.src = card.image
      img.onload = () => {
        if (!cancelled) {
          setLoadedCardImages((prev) => ({ ...prev, [card.id]: true }))
          scheduleNext()
        }
      }
      img.onerror = () => {
        if (!cancelled) {
          setLoadedCardImages((prev) => ({ ...prev, [card.id]: true }))
          scheduleNext()
        }
      }
    }

    const scheduleNext = () => {
      if (cancelled || index >= CARDS.length) return
      if (typeof requestIdleCallback === 'function') {
        idleId = requestIdleCallback(loadNext)
      } else {
        timeoutId = setTimeout(loadNext, 80)
      }
    }

    loadNext()

    return () => {
      cancelled = true
      if (idleId !== null && typeof cancelIdleCallback === 'function') cancelIdleCallback(idleId)
      if (timeoutId !== null) clearTimeout(timeoutId)
    }
  }, [aboutMediaActive])

  const handleGrab = useCallback(() => {
    setHasGrabbed(true)
  }, [])

  const handleGone = useCallback((id: string) => {
    setOrder(prev => {
      const cardIdx = CARDS.findIndex(c => c.id === id)
      return [...prev.filter(i => i !== cardIdx), cardIdx]
    })
  }, [])

  const rotations = [-8, -3, 2, 6, -5, 4]

  return (
    <section ref={sectionRef} id="about" className="relative min-h-full lg:h-full flex flex-col lg:flex-row items-center px-6 pt-[clamp(1.5rem,4dvh,2.5rem)] pb-[clamp(6rem,14dvh,9rem)] lg:py-0 overflow-visible" style={{ background: 'var(--color-surface, #EFF3F8)' }}>
      <motion.div
        className="mx-auto max-w-7xl w-full grid lg:grid-cols-2 gap-8 lg:gap-12 items-center"
        variants={heroStagger}
        initial="hidden"
        animate={marqueeActive ? 'visible' : 'hidden'}
      >
        {/* Text */}
        <motion.div variants={heroChild}>
          <motion.div className="lg:-mt-[16px]" variants={staggerContainer}>
            <motion.div variants={heroChild}>
              <GradientText as="h2" className="font-normal mb-1" style={{ fontSize: 'clamp(1.5rem, 1vw + 1rem, 1.875rem)' }}>
                About me
              </GradientText>
            </motion.div>
            <motion.p variants={heroChild} className="text-black leading-relaxed mb-4" style={{ fontSize: 'clamp(1rem, 0.5vw + 0.75rem, 1.25rem)' }}>
              I'm a Computer Science student at Cornell minoring in AI, originally
              from Nebraska. I am really interested in building and working with full stack web
              apps and experimenting with ML models.
            </motion.p>
            <motion.p variants={heroChild} className="text-black leading-relaxed mb-4" style={{ fontSize: 'clamp(1rem, 0.5vw + 0.75rem, 1.25rem)' }}>
              Lately I've been spending most of my time on graph learning, from GNNs for cyber event data
              and chip placement to livestock health prediction. I still enjoy web3, stablecoins, and IPFS, and
              the idea of programmable money is something I keep coming back to. I'm always looking for ways to connect what I'm learning in AI
              with applications outside the classroom, in clubs, hackathons, and through open source work.
            </motion.p>
            <motion.p variants={heroChild} className="text-black leading-relaxed" style={{ fontSize: 'clamp(1rem, 0.5vw + 0.75rem, 1.25rem)' }}>
              Outside of code, I'm an Eagle Scout who still loves getting outdoors,
              camping, hiking, that kind of thing. When I'm not on a trail, you'll
              probably find me gaming, tinkering with some new tech, or catching up
              on anime and other shows.
            </motion.p>
          </motion.div>

        </motion.div>

        {/* Throwable Cards */}
        <motion.div variants={heroChild} className="flex flex-col items-center justify-center lg:ml-[6vw] mt-[clamp(2.5rem,8dvh,5rem)] lg:mt-0 lg:-mt-[2vh] mb-[clamp(4rem,10dvh,6rem)] lg:mb-0">
          <div className="relative w-[min(calc(100vw-var(--mobile-card-inset)),400px)] lg:w-[400px] aspect-[20/21]">
            {CARDS.map((card, i) => (
              <ThrowableCard
                key={card.id}
                card={card}
                zIndex={CARDS.length - order.indexOf(i)}
                rotation={rotations[i]}
                imageLoaded={!!loadedCardImages[card.id]}
                onGone={handleGone}
                onGrab={handleGrab}
                onThrowSpeed={(speed) => { setLastThrowSpeed(speed); setThrowMessage(getThrowMessage(speed)) }}
              />
            ))}
          </div>
          <motion.p
            className="mt-4 lg:mt-6 flex items-center gap-2 text-[10px] lg:text-sm select-none"
            style={{ color: 'rgba(6, 113, 164, 0.75)' }}
            animate={lastThrowSpeed !== null ? { opacity: 1, x: 0 } : hasGrabbed ? { opacity: 0 } : { x: [0, 6, -6, 0] }}
            transition={lastThrowSpeed !== null || hasGrabbed ? { duration: 0.2 } : { duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
          >
            <svg className="size-3 lg:size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v0" />
              <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
              <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
              <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-5.9-2.4L3.3 16.8a2 2 0 0 1 3-2.6L8 16" />
            </svg>
            {lastThrowSpeed !== null ? `${throwMessage}, ${lastThrowSpeed.toLocaleString()} px/s` : 'Drag to throw'}
          </motion.p>
        </motion.div>
      </motion.div>

    </section>
  )
}
