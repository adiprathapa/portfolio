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
        className="flex flex-col items-center justify-center px-12 text-center"
        style={{
          backfaceVisibility: 'hidden',
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: showBack ? 'rotateY(0deg)' : 'rotateY(-180deg)',
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          border: '1px solid rgba(6, 113, 164, 0.2)',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          aspectRatio: '1203/753', // Match Safari aspect ratio exactly
        }}
      >
          <h3
            className="font-bold font-heading"
            style={{ fontSize: '1.5rem', color: '#0671A4' }}
          >
            {projectName}
          </h3>
          <p className="mt-4 leading-relaxed max-w-[320px]" style={{ fontSize: '0.9rem', color: '#4B5563' }}>
            {projectDescription}
          </p>

          <RippleButton
            rippleColor="#38BDF8"
            className="mt-10"
            style={{ backgroundColor: '#0671A4', color: '#f4f4f4', fontSize: '0.9rem' }}
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
