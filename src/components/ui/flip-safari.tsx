import { useState } from 'react'
import { Safari } from './safari'
import { RippleButton } from './ripple-button'
import type { SafariProps } from './safari'

interface FlipSafariProps {
  safariProps: SafariProps
  projectName: string
  projectDescription: string
  projectTagline?: string
  projectUrl: string
  logoSrc?: string
  techStack?: string[]
  gradientColor?: string
  bgImage?: string
}

export function FlipSafari({
  safariProps,
  projectName,
  projectDescription,
  projectTagline,
  projectUrl,
  logoSrc,
  techStack,
  gradientColor = '#F4F4F4',
  bgImage,
}: FlipSafariProps) {
  const [showVideo, setShowVideo] = useState(false)
  const [isVideoHovered, setIsVideoHovered] = useState(false)
  const { style: safariStyle, ...restSafariProps } = safariProps

  return (
    <div
      style={{ perspective: '1000px', position: 'relative', ...safariStyle }}
    >
      {/* Front face — two-column layout */}
      <div
        style={{
          backfaceVisibility: 'hidden',
          borderRadius: '12px',
          border: '1px solid #FFFFFF',
          backgroundColor: '#F4F4F4',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: showVideo ? 'rotateY(180deg)' : 'rotateY(0deg)',
          zIndex: 2,
          position: 'relative',
          height: 500,
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        {/* Left column — text content */}
        <div className="flex flex-col justify-center px-10 py-8" style={{ flex: 1, minWidth: 0 }}>
          <h3
            className="font-normal font-heading text-left"
            style={{ color: '#0671A4', fontSize: 'clamp(1.4rem, 2.2vw, 1.85rem)', lineHeight: 1.2 }}
          >
            {projectTagline || projectName}
          </h3>
          <p className="mt-2 leading-relaxed text-left text-heading text-base">
            {projectDescription}
          </p>

          {/* Tech stack pills */}
          {techStack && techStack.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 rounded-full text-sm font-medium"
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

          <div className="flex gap-2.5" style={{ marginTop: 18 }}>
            <RippleButton
              className="px-5 py-2.5 text-base"
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
              onClick={() => setShowVideo(true)}
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
            <RippleButton
              className="px-5 py-2.5 text-base"
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
              onClick={() => window.open(projectUrl, '_blank')}
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

        {/* Right column — branded color block with logo */}
        <div
          className="relative flex items-center justify-center overflow-hidden"
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
                background: `linear-gradient(180deg, ${gradientColor}B3 0%, ${gradientColor}D9 55%, ${gradientColor}F5 100%)`,
              }}
            />
          )}
          {logoSrc && (
            <img
              src={logoSrc}
              alt={projectName}
              className="relative h-14 object-contain"
              style={{ filter: 'brightness(0) invert(1)', opacity: 0.9 }}
            />
          )}
        </div>
      </div>

      {/* Back face — Safari video (shown on click) */}
      <div
        onClick={() => setShowVideo(false)}
        style={{
          cursor: 'pointer',
          backfaceVisibility: 'hidden',
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: showVideo ? 'rotateY(0deg)' : 'rotateY(-180deg)',
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          borderRadius: '12px',
          border: '1px solid #FFFFFF',
          backgroundColor: '#F4F4F4',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
        }}
      >
        <Safari {...restSafariProps} playing={showVideo} style={{ width: '100%' }} />
      </div>
    </div>
  )
}
