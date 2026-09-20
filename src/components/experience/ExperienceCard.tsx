import { useState } from 'react'
import { motion } from 'framer-motion'
import type { ExperienceItem } from '../../data/experience'
import { CARD_BORDER, CARD_RADIUS, COLOR, SHADOW, TEXT } from '../../lib/theme'

export const CARD_W = 580
export const CARD_H = 560
export const CARD_GAP = 24

const WHITE_80 = 'rgba(255,255,255,0.8)'
const WHITE_88 = 'rgba(255,255,255,0.88)'

/** Tint stops are appended as hex alpha to each entry's brand color. */
function gradient(color: string, strong: boolean) {
  return strong
    ? `linear-gradient(180deg, ${color}73 0%, ${color}D0 55%, ${color}F5 100%)`
    : `linear-gradient(180deg, ${color}50 0%, ${color}A0 55%, ${color}DD 100%)`
}

function TechLabel({ src, name, size }: { src: string; name: string; size: number }) {
  const [errored, setErrored] = useState(false)
  const showIcon = Boolean(src) && !errored

  return (
    <div className="flex items-center" style={{ gap: showIcon ? 6 : 0 }}>
      {showIcon && (
        <img
          src={src}
          alt={name}
          width={size}
          height={size}
          className="object-contain"
          loading="lazy"
          decoding="async"
          style={{ filter: 'brightness(0) invert(1)', opacity: 0.85 }}
          onError={(event) => {
            setErrored(true)
            event.currentTarget.style.display = 'none'
          }}
        />
      )}
      <span style={{ color: 'rgba(255,255,255,0.7)' }}>{name}</span>
    </div>
  )
}

function Logo({ item }: { item: ExperienceItem }) {
  return (
    <img
      src={item.logo}
      alt={item.company}
      className="self-start"
      style={{
        height: item.logoHeight * 0.8,
        width: 'auto',
        maxWidth: '55%',
        objectFit: 'contain',
        filter: item.logoInvert ? 'brightness(0) invert(1)' : 'none',
        borderRadius: item.logoInvert ? 0 : 8,
        marginTop: item.logoOffsetY ?? 0,
        marginLeft: item.logoOffsetX ?? 0,
      }}
    />
  )
}

const TYPOGRAPHY = {
  carousel: {
    duration: 'text-sm font-medium tracking-wide uppercase',
    role: 'font-semibold mt-1.5 leading-snug',
    roleSize: TEXT.h3,
    description: 'mt-2.5 leading-relaxed',
    descriptionSize: TEXT.body,
    techRow: 'flex items-center gap-3 mt-3 flex-wrap',
    techText: 'text-xs',
    techIcon: 16,
  },
  mobile: {
    duration: 'text-[10px] font-medium tracking-wide uppercase',
    role: 'text-[16px] font-semibold mt-1 leading-snug',
    roleSize: undefined,
    description: 'text-[13px] leading-[1.3] mt-2',
    descriptionSize: undefined,
    techRow: 'flex items-center gap-2 mt-2 flex-wrap',
    techText: 'text-[10px]',
    techIcon: 14,
  },
} as const

function CardBody({ item, variant }: { item: ExperienceItem; variant: 'carousel' | 'mobile' }) {
  const t = TYPOGRAPHY[variant]
  return (
    <>
      {item.duration && (
        <p className={t.duration} style={{ color: WHITE_80, letterSpacing: '0.05em' }}>
          {item.duration}
        </p>
      )}
      <h3 className={t.role} style={{ color: COLOR.white, textShadow: '0 1px 4px rgba(0,0,0,0.3)', fontSize: t.roleSize }}>
        {item.role}
      </h3>
      <p className={t.description} style={{ color: WHITE_88, textShadow: '0 1px 3px rgba(0,0,0,0.3)', fontSize: t.descriptionSize }}>
        {item.description}
      </p>
      <div className={t.techRow}>
        {item.tech.map((tech) => (
          <div key={tech.name} className={t.techText}>
            <TechLabel src={tech.icon} name={tech.name} size={t.techIcon} />
          </div>
        ))}
      </div>
    </>
  )
}

interface CarouselCardProps {
  item: ExperienceItem
  isActive: boolean
  onClick: () => void
  /** Hides the auto-advance progress bar. */
  paused: boolean
  rotationMs: number
}

/** Desktop rail card: only the active one expands to the full detail block. */
export function ExperienceCarouselCard({ item, isActive, onClick, paused, rotationMs }: CarouselCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative cursor-pointer overflow-hidden"
      style={{
        width: CARD_W,
        height: CARD_H,
        flexShrink: 0,
        borderRadius: CARD_RADIUS,
        border: CARD_BORDER,
        boxShadow: hovered || isActive ? SHADOW.cardHover : SHADOW.card,
        opacity: isActive ? 1 : 0.92,
        transition: 'opacity 0.4s ease, box-shadow 0.3s ease',
      }}
    >
      <img
        src={item.bgImage}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          transform: isActive || hovered ? 'scale(1.05)' : 'scale(1)',
          transition: 'transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{ background: gradient(item.gradientColor, isActive), transition: 'background 0.5s ease' }}
      />

      <div className="relative z-10 flex h-full flex-col justify-between p-7">
        <Logo item={item} />
        <div>
          {isActive ? (
            <motion.div
              key={`active-${item.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.12, ease: 'easeOut' }}
            >
              <CardBody item={item} variant="carousel" />
            </motion.div>
          ) : (
            <p className="leading-relaxed" style={{ color: WHITE_88, textShadow: '0 1px 3px rgba(0,0,0,0.4)', fontSize: TEXT.body }}>
              {item.description}
            </p>
          )}
        </div>
      </div>

      {isActive && !paused && (
        <div
          className="absolute bottom-0 left-0 right-0 z-20"
          style={{ height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: `0 0 ${CARD_RADIUS}px ${CARD_RADIUS}px` }}
        >
          <motion.div
            key={item.id}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: (rotationMs - 300) / 1000, ease: 'linear' }}
            style={{ height: '100%', background: 'rgba(255,255,255,0.65)', borderRadius: `0 0 0 ${CARD_RADIUS}px` }}
          />
        </div>
      )}
    </div>
  )
}

/** Mobile peek-carousel card: always shows the full detail block. */
export function ExperienceMobileCard({ item }: { item: ExperienceItem }) {
  return (
    <div className="relative w-full" style={{ height: 'var(--project-card-h)' }}>
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ borderRadius: CARD_RADIUS, border: CARD_BORDER, boxShadow: SHADOW.card }}
      >
        <img src={item.bgImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ background: gradient(item.gradientColor, true) }} />
        <div className="relative z-10 flex h-full flex-col justify-between p-7">
          <Logo item={item} />
          <div>
            <CardBody item={item} variant="mobile" />
          </div>
        </div>
      </div>
    </div>
  )
}
