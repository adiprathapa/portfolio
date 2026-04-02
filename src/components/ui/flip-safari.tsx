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
          border: '1px solid #FFFFFF',
          backgroundColor: '#F4F4F4',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease',
          transform: showBack ? 'rotateY(180deg)' : 'rotateY(0deg)',
          opacity: showBack ? 0 : 1,
        }}
      >
        <Safari {...restSafariProps} />
      </div>

      {/* Back face */}
      <div
        onClick={handleClick}
        className="flex flex-col justify-center px-10"
        style={{
          backfaceVisibility: 'hidden',
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: showBack ? 'rotateY(0deg)' : 'rotateY(-180deg)',
          position: 'absolute',
          inset: 0,
          backgroundColor: '#F4F4F4',
          border: '1px solid #FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          aspectRatio: '1203/753', // Match Safari aspect ratio exactly
        }}
      >
        <h3
          className="font-bold font-heading text-left"
          style={{ fontSize: '1.5rem', color: '#0671A4' }}
        >
          {projectName}
        </h3>
        <p className="mt-4 leading-relaxed text-left text-heading" style={{ fontSize: '0.9rem' }}>
          {projectDescription}
        </p>

        <div className="w-full flex justify-center mt-10">
          <RippleButton
            rippleColor="#38BDF8"
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
    </div>
  )
}
