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
          boxShadow: '0 2px 12px rgba(56, 189, 248, 0.08)',
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
          background: 'linear-gradient(135deg, #0f1d2b 0%, #0a1520 100%)',
          boxShadow: '0 2px 12px rgba(56, 189, 248, 0.08)',
        }}
      >
          <h3
            className="font-bold font-heading gradient-text"
            style={{ fontSize: '1.34rem' }}
          >
            {projectName}
          </h3>
          <p className="mt-3 leading-relaxed text-white" style={{ fontSize: '0.8rem' }}>
            {projectDescription}
          </p>

          <RippleButton
            rippleColor="#38BDF8"
            className="mt-10 self-center"
            style={{ backgroundColor: '#0671A4', color: '#0f1d2b', fontSize: '0.8rem' }}
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
