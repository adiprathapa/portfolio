import { useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GithubIcon, LinkedInIcon } from '../ui/icons'
import { posthog } from '../../lib/analytics'
import { PRIMARY } from '../../lib/theme'
import { SITE } from '../../data/site'

const SPIN_MS = 1500
const SWIPE_THRESHOLD_PX = 30

type Side = 'linkedin' | 'github'

const FACES: Record<Side, { href: string; label: string; event: string; image: string; alt: string; icon: ReactNode; iconClass: string; iconStyle: React.CSSProperties; imageStyle?: React.CSSProperties }> = {
  linkedin: {
    href: `${SITE.linkedin}/`,
    label: 'LinkedIn profile',
    event: 'linkedin_profile_clicked',
    image: '/headshot.webp',
    alt: 'Adi Prathapa',
    icon: <LinkedInIcon />,
    iconClass: 'absolute h-6 w-6 md:h-9 md:w-9',
    iconStyle: { bottom: 'calc(15% + 10px)', right: 'calc(10% + 11px)', color: '#F4F4F4' },
    imageStyle: { objectPosition: 'center 30%', transform: 'scale(1.1) translateY(-10px)' },
  },
  github: {
    href: SITE.github,
    label: 'GitHub profile',
    event: 'github_profile_clicked',
    image: '/pfp.png',
    alt: 'GitHub avatar',
    icon: <GithubIcon />,
    iconClass: 'absolute h-8 w-8 md:h-11 md:w-11',
    iconStyle: { bottom: 'calc(15% + 10px)', right: 'calc(10% + 5px)', color: '#F4F4F4' },
  },
}

function CoinFace({ side, showOverlay }: { side: Side; showOverlay: boolean }) {
  const face = FACES[side]
  const open = () => {
    posthog?.capture(face.event, { location: 'hero_coin' })
    window.open(face.href, '_blank')
  }

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        borderRadius: '50%',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        border: `3px solid ${PRIMARY.a30}`,
        backfaceVisibility: 'hidden',
        cursor: 'pointer',
        ...(side === 'github' ? { transform: 'rotateY(180deg)' } : {}),
      }}
      role="link"
      tabIndex={0}
      aria-label={face.label}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open() } }}
      onClick={open}
    >
      <img
        src={face.image}
        alt={face.alt}
        style={{ width: '100%', height: '100%', objectFit: 'cover', ...face.imageStyle }}
      />
      <div
        className="absolute inset-0"
        onClick={(e) => { e.stopPropagation(); open() }}
        style={{
          borderRadius: '50%',
          background: 'rgba(0, 0, 0, 0.35)',
          transition: 'opacity 0.3s ease',
          opacity: showOverlay ? 1 : 0,
          pointerEvents: showOverlay ? 'auto' : 'none',
          cursor: 'pointer',
        }}
      >
        <span className={face.iconClass} style={face.iconStyle}>{face.icon}</span>
      </div>
    </div>
  )
}

function TossHint({ children, onClick, motionKey }: { children: ReactNode; onClick: () => void; motionKey: string }) {
  return (
    <motion.div
      key={motionKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, y: [0, -5, 5, 0] }}
      exit={{ opacity: 0 }}
      transition={{ y: { duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' } }}
      className="absolute left-1/2 flex -translate-x-1/2 cursor-pointer items-center gap-2 whitespace-nowrap"
      style={{ bottom: '-2%', color: PRIMARY.a75 }}
      onClick={onClick}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 4l7.07 17 2.51-7.39L21 11.07z" />
      </svg>
      <span className="text-sm font-light tracking-wide">{children}</span>
    </motion.div>
  )
}

/** Headshot on one side, GitHub avatar on the other. Flick or click to toss. */
export function ProfileCoin({ isMobile }: { isMobile: boolean }) {
  const [angle, setAngle] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [tossCount, setTossCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [lastSide, setLastSide] = useState<Side | null>(null)
  const coinRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)

  const faceAngle = ((angle % 360) + 360) % 360
  const facing: Side = faceAngle > 90 && faceAngle < 270 ? 'github' : 'linkedin'
  const showOverlay = hovered && !isMobile && !spinning

  // Hover only counts inside the circle, not the square that bounds it.
  const updateHover = (clientX: number, clientY: number) => {
    if (isMobile) return
    const rect = coinRef.current?.getBoundingClientRect()
    if (!rect) return
    const dx = clientX - (rect.left + rect.width / 2)
    const dy = clientY - (rect.top + rect.height / 2)
    const radius = Math.min(rect.width, rect.height) / 2
    setHovered(dx * dx + dy * dy <= radius * radius)
  }

  const toss = () => {
    if (spinning) return
    setSpinning(true)

    const landsOnGithub = Math.random() > 0.5
    const spins = 3 + Math.floor(Math.random() * 4)
    const targetAngle = landsOnGithub ? 180 : 0

    setAngle((prev) => {
      const current = ((prev % 360) + 360) % 360
      let delta = targetAngle - current
      if (delta < 0) delta += 360
      return prev + spins * 360 + delta
    })

    const side: Side = landsOnGithub ? 'github' : 'linkedin'
    setTimeout(() => {
      setSpinning(false)
      setTossCount((c) => c + 1)
      setStreak((s) => (side === lastSide ? s + 1 : 1))
      setLastSide(side)
    }, SPIN_MS)
  }

  return (
    <div
      className="group relative w-62 shrink-0 md:w-84"
      style={{ aspectRatio: '1 / 1', marginRight: -30, perspective: 800 }}
      onMouseEnter={(e) => updateHover(e.clientX, e.clientY)}
      onMouseMove={(e) => updateHover(e.clientX, e.clientY)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={(e) => {
        setHovered(false)
        touchStartX.current = e.touches[0].clientX
      }}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touchStartX.current
        if (Math.abs(dx) <= SWIPE_THRESHOLD_PX) return
        e.preventDefault()
        setAngle((a) => a + (dx < 0 ? -180 : 180))
      }}
    >
      <div
        ref={coinRef}
        className="absolute block"
        style={{
          width: '85%',
          height: '85%',
          top: '5%',
          left: '5%',
          borderRadius: '50%',
          transformStyle: 'preserve-3d',
          transition: spinning
            ? `transform ${SPIN_MS}ms cubic-bezier(0.1, 0.7, 0.3, 1)`
            : 'transform 0.6s cubic-bezier(0.2, 0.8, 0.3, 1)',
          transform: `rotateY(${angle}deg)`,
        }}
      >
        <CoinFace side="linkedin" showOverlay={showOverlay && facing === 'linkedin'} />
        <CoinFace side="github" showOverlay={showOverlay && facing === 'github'} />
      </div>

      {!isMobile && (
        <AnimatePresence mode="wait">
          {!spinning && tossCount === 0 && (
            <TossHint motionKey="hint" onClick={toss}>Click here to toss</TossHint>
          )}
          {!spinning && tossCount > 0 && (
            <TossHint motionKey={`result-${tossCount}`} onClick={toss}>
              {lastSide === 'linkedin' ? 'LinkedIn' : 'GitHub'}!{streak >= 2 && ` ${streak}x`} Click Again
            </TossHint>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
