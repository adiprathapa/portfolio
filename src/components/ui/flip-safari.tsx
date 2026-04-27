import { useState, useRef, useEffect, type CSSProperties } from 'react'
import { Safari } from './safari'
import { RippleButton } from './ripple-button'
import type { SafariProps } from './safari'
import { usePostHog } from '@posthog/react'

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
}: FlipSafariProps) {
  const posthog = usePostHog()
  const [showVideo, setShowVideo] = useState(false)
  const [isVideoHovered, setIsVideoHovered] = useState(false)
  const [cardHovered, setCardHovered] = useState(false)
  const innerRef = useRef<HTMLDivElement>(null)
  const rectRef = useRef<DOMRect | null>(null)
  const pointerRef = useRef<{ x: number; y: number } | null>(null)
  const tiltRafRef = useRef<number | null>(null)
  const { style: safariStyle, ...restSafariProps } = safariProps

  const handleMouseMove = (e: React.MouseEvent) => {
    if (showVideo || !innerRef.current) return
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
    posthog?.capture('project_video_viewed', { project_name: projectName })
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
        if (!showVideo && innerRef.current) {
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
          willChange: 'transform',
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
          <div className="flex flex-col justify-between lg:justify-center px-4 pt-8 pb-4 lg:px-10 lg:py-8" style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <div>
            <h3
              className="font-normal font-heading text-left text-[16px] lg:text-3xl gradient-text"
              style={{ lineHeight: 1.16 }}
            >
              {projectTagline || projectName}
            </h3>
            <p className="mt-2 text-[13px] leading-[1.3] lg:mt-2 lg:text-xl lg:leading-relaxed text-left text-heading">
              {projectDescription}
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

            <div className="flex justify-center lg:justify-start gap-2.5 lg:mt-[18px]">
              {safariProps.videoSrc && (
              <RippleButton
                className="hidden lg:inline-flex px-5 py-2.5 text-base"
                rippleColor="#38BDF8"
                style={{
                  backgroundColor: '#0671A4',
                  color: '#FFFFFF',
                  border: '2px solid transparent',
                  boxShadow: '0 2px 8px rgba(6, 113, 164, 0.12)',
                  transition: 'background-color 0.3s, color 0.3s, border-color 0.3s',
                }}
                onMouseEnter={(e) => {
                  setIsVideoHovered(true)
                  e.currentTarget.style.backgroundColor = '#055a84'
                }}
                onMouseLeave={(e) => {
                  setIsVideoHovered(false)
                  e.currentTarget.style.backgroundColor = '#0671A4'
                }}
                onClick={handleFlipToVideo}
              >
                <span className="inline-flex items-center gap-1.5">
                  <span>View Video</span>
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

          {/* Right column — branded color block with logo (hidden on mobile) */}
          <div
            className="relative hidden lg:flex items-center justify-center overflow-hidden"
            style={{
              width: 530,
              flexShrink: 0,
              borderRadius: '0 12px 12px 0',
              backgroundColor: gradientColor,
            }}
          >
            {bgImage && (
              <img
                src={bgImage}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            {bgImage && (
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
                  mixBlendMode: 'screen',
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
