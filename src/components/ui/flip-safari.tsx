import { useState, useRef, useEffect, useLayoutEffect, type CSSProperties, Fragment } from 'react'
import { Safari } from './safari'
import { RippleButton } from './ripple-button'
import type { SafariProps } from './safari'
import { posthog } from '../../lib/analytics'

const warmedProjectVideos = new Map<string, HTMLVideoElement>()

function warmProjectVideoMetadata(src: string | undefined) {
  if (!src || warmedProjectVideos.has(src)) return

  const video = document.createElement('video')
  video.preload = 'metadata'
  video.muted = true
  video.src = src
  video.load()
  warmedProjectVideos.set(src, video)
}

// Split text into word spans tagged for the Capoo game. Only ~2 of every 3 words
// become actual platforms — the rest are rendered as invisible gaps so the level
// reads like a real platformer with jumps between platforms.
function renderWordSpans(text: string | undefined, projectKey: string) {
  if (!text) return null
  const parts = text.split(/(\s+)/)
  let wordIdx = 0
  return parts.map((part, i) => {
    if (part.length === 0) return null
    if (/^\s+$/.test(part)) return <Fragment key={i}>{part}</Fragment>
    const idx = wordIdx++
    // Gap pattern: every 3rd word is rendered as a non-platform gap
    const isGap = idx % 3 === 2
    if (isGap) {
      return (
        <span key={i} className="game-gap">
          {part}
        </span>
      )
    }
    return (
      <span key={i} data-game-word={projectKey} className="game-word">
        {part}
      </span>
    )
  })
}

interface FlipSafariProps {
  safariProps: SafariProps
  projectName: string
  projectDescription: string
  projectTagline?: string
  projectUrl: string
  logoSrc?: string
  logoContent?: React.ReactNode
  techStack?: string[]
  gradientColor?: string
  bgImage?: string
  cardHeight?: string
  enableBackground?: boolean
  interactive?: boolean
  logoBlendMode?: 'screen' | 'normal'
}

export function FlipSafari({
  safariProps,
  projectName,
  projectDescription,
  projectTagline,
  projectUrl,
  logoSrc,
  logoContent,
  techStack,
  gradientColor = '#F4F4F4',
  bgImage,
  cardHeight = 'var(--project-card-h)',
  enableBackground = true,
  interactive = true,
  logoBlendMode,
}: FlipSafariProps) {
  const [showVideo, setShowVideo] = useState(false)
  const [isVideoHovered, setIsVideoHovered] = useState(false)
  const [cardHovered, setCardHovered] = useState(false)
  const innerRef = useRef<HTMLDivElement>(null)
  const rectRef = useRef<DOMRect | null>(null)
  const pointerRef = useRef<{ x: number; y: number } | null>(null)
  const tiltRafRef = useRef<number | null>(null)
  const leftColRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentScale, setContentScale] = useState(1)
  const { style: safariStyle, ...restSafariProps } = safariProps

  useLayoutEffect(() => {
    const lc = leftColRef.current
    const ct = contentRef.current
    if (!lc || !ct) return
    const update = () => {
      const cs = getComputedStyle(lc)
      const padTop = parseFloat(cs.paddingTop) || 0
      const padBottom = parseFloat(cs.paddingBottom) || 0
      const availH = lc.clientHeight - padTop - padBottom
      const naturalH = ct.scrollHeight
      if (availH <= 0 || naturalH <= 0) { setContentScale(1); return }
      // Clamp to a 0.88 floor so the card still uses most of its space —
      // slight overflow is acceptable, content shouldn't shrink dramatically.
      setContentScale(Math.max(0.88, Math.min(1, availH / naturalH)))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(lc)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [projectDescription, projectTagline, techStack])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!interactive || showVideo || !innerRef.current) return
    if (!rectRef.current) {
      rectRef.current = innerRef.current.getBoundingClientRect()
    }
    pointerRef.current = { x: e.clientX, y: e.clientY }

    if (tiltRafRef.current !== null) return
    tiltRafRef.current = requestAnimationFrame(() => {
      tiltRafRef.current = null
      if (!innerRef.current || !rectRef.current || !pointerRef.current) return
      const rect = rectRef.current
      const x = (pointerRef.current.x - rect.left) / rect.width - 0.5
      const y = (pointerRef.current.y - rect.top) / rect.height - 0.5
      innerRef.current.style.transform = `rotateX(${y * -3}deg) rotateY(${x * 3}deg) translateY(-4px)`
    })
  }

  const handleMouseLeave = () => {
    setCardHovered(false)
    rectRef.current = null
    if (tiltRafRef.current !== null) {
      cancelAnimationFrame(tiltRafRef.current)
      tiltRafRef.current = null
    }
    if (innerRef.current && !showVideo) {
      innerRef.current.style.transition = 'transform 0.4s ease'
      innerRef.current.style.transform = 'rotateX(0deg) rotateY(0deg) translateY(0px)'
    }
  }

  useEffect(() => {
    return () => {
      if (tiltRafRef.current !== null) {
        cancelAnimationFrame(tiltRafRef.current)
      }
    }
  }, [])

  const handleFlipToVideo = () => {
    if (tiltRafRef.current !== null) {
      cancelAnimationFrame(tiltRafRef.current)
      tiltRafRef.current = null
    }
    posthog?.capture('project_video_viewed', { project_name: projectName, media: safariProps.videoSrc ? 'video' : 'image' })
    if (innerRef.current) {
      innerRef.current.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
      innerRef.current.style.transform = 'rotateY(180deg)'
    }
    setShowVideo(true)
    setCardHovered(false)
  }

  const handleFlipToCard = () => {
    if (innerRef.current) {
      innerRef.current.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
      innerRef.current.style.transform = 'rotateX(0deg) rotateY(0deg) translateY(0px)'
    }
    setShowVideo(false)
  }

  return (
    <div
      className="h-[var(--flip-safari-card-h)]"
      style={{ perspective: '1200px', position: 'relative', '--flip-safari-card-h': cardHeight, ...safariStyle } as CSSProperties}
      onMouseEnter={() => {
        if (interactive && !showVideo && innerRef.current) {
          setCardHovered(true)
          rectRef.current = innerRef.current.getBoundingClientRect()
          innerRef.current.style.transition = 'transform 0.1s ease-out'
        }
      }}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {/* Single rotating wrapper — both faces rotate together */}
      <div
        ref={innerRef}
        className="relative w-full h-full"
        style={{
          transformStyle: 'preserve-3d',
          transform: 'rotateX(0deg) rotateY(0deg) translateY(0px)',
          willChange: cardHovered || showVideo ? 'transform' : 'auto',
        }}
      >
        {/* Front face */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            borderRadius: '12px',
            border: '1.5px solid rgba(6, 113, 164, 0.3)',
            backgroundColor: '#F4F4F4',
            boxShadow: cardHovered
              ? '0 16px 48px rgba(6, 113, 164, 0.1), 0 4px 12px rgba(0, 0, 0, 0.04)'
              : '0 4px 12px rgba(0, 0, 0, 0.04)',
            transition: 'box-shadow 0.3s ease',
            position: 'absolute',
            inset: 0,
            display: 'flex',
            overflow: 'hidden',
          }}
        >
          {/* Hover glare */}
          <div
            className="pointer-events-none absolute inset-0 z-10"
            style={{
              opacity: cardHovered ? 0.06 : 0,
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.8) 50%, transparent 60%)',
              transition: 'opacity 0.3s ease',
            }}
          />
          {/* Left column — text content */}
          <div ref={leftColRef} data-card-leftcol className="flex flex-col justify-between lg:justify-center px-4 pt-8 pb-4 lg:px-10 lg:py-8" style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <div
              ref={contentRef}
              className="card-content-wrapper contents lg:flex lg:flex-col"
              style={contentScale < 1 ? {
                transform: `scale(${contentScale})`,
                transformOrigin: 'top center',
              } : undefined}
            >
            <div>
            {(safariProps.posterSrc || safariProps.imageSrc) && (
              <img
                src={safariProps.posterSrc || safariProps.imageSrc}
                alt=""
                loading="lazy"
                decoding="async"
                className="lg:hidden w-full aspect-video object-cover object-top rounded-lg mb-4"
                style={{ border: '1px solid rgba(6, 113, 164, 0.2)' }}
              />
            )}
            <h3
              className="font-normal font-heading text-left text-[16px] lg:text-[clamp(1.5rem,1vw+1rem,1.875rem)] text-[#0671A4] lg:gradient-text"
              style={{ lineHeight: 1.16 }}
            >
              {projectTagline || projectName}
            </h3>
            <p
              className="mt-2 text-[13px] leading-[1.3] lg:leading-relaxed text-left text-heading lg:text-[clamp(1rem,0.5vw+0.75rem,1.25rem)]"
            >
              {renderWordSpans(projectDescription, projectName)}
              {/* Flag landing pad + checkpoint flag — only shown during game mode.
                  The landing pad is a wider platform that lives right under the
                  flag so Capoo always has something to stand on to reach it. */}
              {' '}
              <span className="flag-cluster" style={{ display: 'none', whiteSpace: 'nowrap', position: 'relative' }}>
                <span
                  data-game-word={projectName}
                  className="game-word flag-landing-pad"
                  aria-hidden="true"
                >
                  GOAL
                </span>
                <span
                  data-card-flag={projectName}
                  className="card-flag"
                  aria-hidden="true"
                >
                  ⚑
                </span>
              </span>
            </p>
            </div>

            <div className="flex flex-col flex-1 justify-evenly lg:justify-start lg:flex-none lg:gap-0">
            {/* Tech stack pills */}
            {techStack && techStack.length > 0 && (
              <div className="flex flex-wrap gap-1 lg:gap-2 lg:mt-2">
                {techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-1.5 py-0.5 lg:px-3 lg:py-1 rounded-xl text-[10px] leading-[1.2] lg:text-sm lg:leading-normal font-medium"
                    style={{
                      backgroundColor: 'rgba(6, 113, 164, 0.08)',
                      color: '#0671A4',
                      border: '1px solid rgba(6, 113, 164, 0.15)',
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}

            <div className="flex justify-start gap-2.5 lg:mt-[18px] items-center">
              {(safariProps.videoSrc || safariProps.imageSrc) && (
              <RippleButton
                className="inline-flex px-3 py-1.5 text-[13px] lg:px-5 lg:py-2.5 lg:text-base"
                rippleColor="#38BDF8"
                style={{
                  backgroundColor: '#0671A4',
                  color: '#FFFFFF',
                  border: '2px solid transparent',
                  boxShadow: '0 2px 8px rgba(6, 113, 164, 0.12)',
                  transition: 'background-color 0.3s, color 0.3s, border-color 0.3s',
                }}
                onMouseEnter={(e) => {
                  warmProjectVideoMetadata(safariProps.videoSrc)
                  setIsVideoHovered(true)
                  e.currentTarget.style.backgroundColor = '#055a84'
                }}
                onFocus={() => warmProjectVideoMetadata(safariProps.videoSrc)}
                onTouchStart={() => warmProjectVideoMetadata(safariProps.videoSrc)}
                onMouseLeave={(e) => {
                  setIsVideoHovered(false)
                  e.currentTarget.style.backgroundColor = '#0671A4'
                }}
                onClick={handleFlipToVideo}
              >
                <span className="inline-flex items-center gap-1.5">
                  <span>{safariProps.videoSrc ? 'View Video' : 'Preview'}</span>
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {isVideoHovered ? (
                      <>
                        <path d="M5 12h14" />
                        <path d="M12 5l7 7-7 7" />
                      </>
                    ) : (
                      <path d="M8 5l7 7-7 7" />
                    )}
                  </svg>
                </span>
              </RippleButton>
              )}
              <RippleButton
                className="px-3 py-1.5 text-[13px] lg:px-5 lg:py-2.5 lg:text-base"
                rippleColor="#38BDF8"
                style={{
                  backgroundColor: 'transparent',
                  color: '#0671A4',
                  border: '2px solid rgba(6, 113, 164, 0.3)',
                  transition: 'background-color 0.3s, border-color 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(6, 113, 164, 0.06)'
                  e.currentTarget.style.borderColor = '#0671A4'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.borderColor = 'rgba(6, 113, 164, 0.3)'
                }}
                onClick={() => { posthog?.capture('project_repo_opened', { project_name: projectName, url: projectUrl }); window.open(projectUrl, '_blank') }}
              >
                <span className="inline-flex items-center gap-1.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  <span>Repository</span>
                </span>
              </RippleButton>
            </div>
            </div>
            </div>
          </div>

          {/* Right column — branded color block with logo (hidden on mobile) */}
          <div
            className="relative hidden lg:flex items-center justify-center overflow-hidden"
            style={{
              width: '42%',
              maxWidth: 530,
              flexShrink: 0,
              borderRadius: '0 12px 12px 0',
              backgroundColor: gradientColor,
            }}
          >
            {enableBackground && bgImage && (
              <img
                src={bgImage}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            )}
            {enableBackground && bgImage && (
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(180deg, ${gradientColor}73 0%, ${gradientColor}D9 55%, ${gradientColor}FF 100%)`,
                }}
              />
            )}
            {logoContent ? (
              <div
                className="relative"
                style={{
                  transform: cardHovered ? 'scale(1.08)' : 'scale(1)',
                  transition: 'transform 0.4s ease',
                  isolation: 'auto',
                  mixBlendMode: logoBlendMode ?? 'screen',
                }}
              >
                {logoContent}
              </div>
            ) : logoSrc ? (
              <img
                src={logoSrc}
                alt={projectName}
                className="relative h-14 object-contain"
                style={{
                  filter: 'brightness(0) invert(1)',
                  opacity: 0.9,
                  transform: cardHovered ? 'scale(1.08)' : 'scale(1)',
                  transition: 'transform 0.4s ease',
                }}
              />
            ) : null}
          </div>
        </div>

        {/* Back face — Safari video */}
        <div
          onClick={handleFlipToCard}
          role="button"
          tabIndex={showVideo ? 0 : -1}
          aria-label="Back to project details"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFlipToCard() } }}
          style={{
            cursor: 'pointer',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            borderRadius: '12px',
            border: '1.5px solid rgba(6, 113, 164, 0.3)',
            backgroundColor: '#F4F4F4',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
          }}
        >
          {showVideo ? (
            <Safari {...restSafariProps} playing={showVideo} style={{ width: '100%' }} />
          ) : null}
        </div>
      </div>
    </div>
  )
}
