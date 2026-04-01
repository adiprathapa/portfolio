import { useState } from 'react'
import { Safari } from './safari'
import { RippleButton } from './ripple-button'
import type { SafariProps } from './safari'

interface FlipSafariProps {
  safariProps: SafariProps
  projectName: string
  projectDescription: string
  projectUrl: string
}

export function FlipSafari({
  safariProps,
  projectName,
  projectDescription,
  projectUrl,
}: FlipSafariProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isLocked, setIsLocked] = useState(false)

  const showBack = isLocked || isHovered

  const handleClick = () => {
    setIsLocked((prev) => !prev)
  }

  const { style: safariStyle, ...restSafariProps } = safariProps

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ perspective: '1000px', cursor: 'pointer', position: 'relative', ...safariStyle }}
    >
      {/* Front face */}
      <div
        onClick={handleClick}
        style={{
          backfaceVisibility: 'hidden',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: showBack ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        <Safari {...restSafariProps} />
      </div>

      {/* Back face */}
      <div
        onClick={handleClick}
        className="flex flex-col justify-center rounded-xl px-10"
        style={{
          backfaceVisibility: 'hidden',
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: showBack ? 'rotateY(0deg)' : 'rotateY(-180deg)',
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.25) 100%), rgb(6,113,164)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
        }}
      >
          <h3
            className="font-bold font-heading"
            style={{ fontSize: '1.34rem', color: '#0671A4' }}
          >
            {projectName}
          </h3>
          <p className="mt-3 leading-relaxed" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)' }}>
            {projectDescription}
          </p>

          <RippleButton
            rippleColor="#38BDF8"
            className="mt-10 self-center"
            style={{ backgroundColor: '#0671A4', color: '#ffffff', fontSize: '0.8rem' }}
            onClick={(e) => {
              e.stopPropagation()
              window.open(projectUrl, '_blank', 'noopener,noreferrer')
            }}
          >
            View Repository
          </RippleButton>
      </div>
    </div>
  )
}
