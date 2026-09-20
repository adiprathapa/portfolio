import { useState, type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { accentOf, hoverIconOf, iconSizeOf, type TechItem } from '../../data/tech'
import { useCanHoverRef } from '../../hooks/useMediaQuery'
import { alpha, COLOR, PRIMARY, SHADOW } from '../../lib/theme'
import { ExternalLinkIcon } from '../ui/icons'
import { useIconLoader } from './useIconLoader'

type Variant = 'small' | 'tall'

const LAYOUT: Record<Variant, {
  box: CSSProperties
  className: string
  hoverScale: number
  lift: number
  nameClass: string
  arrowSize: number
  arrowClass: string
}> = {
  small: {
    box: { width: 220, height: 146 },
    className: 'flex items-center px-5',
    hoverScale: 1.1,
    lift: 2,
    nameClass: 'text-base',
    arrowSize: 14,
    arrowClass: 'top-3 right-3',
  },
  tall: {
    box: { width: 300, height: 300 },
    className: 'flex flex-col justify-center items-start px-6 gap-3',
    hoverScale: 1.15,
    lift: 3,
    nameClass: 'text-lg',
    arrowSize: 16,
    arrowClass: 'top-4 right-4',
  },
}

/** The `#0671A4` mask tint used by marks that ship without a blue variant. */
function TintedMark({ item, hovered, scale, onError }: {
  item: TechItem
  hovered: boolean
  scale: number
  onError: () => void
}) {
  const transform = hovered ? `rotate(-8deg) scale(${scale})` : 'rotate(0deg)'
  const transition = 'opacity 0.2s ease, transform 0.2s ease'
  const mask: CSSProperties = {
    WebkitMaskImage: `url(${item.icon})`,
    maskImage: `url(${item.icon})`,
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
  }

  return (
    <>
      <div
        className="absolute inset-0"
        style={{ backgroundColor: COLOR.primary, ...mask, opacity: hovered ? 0 : 1, transform, transition }}
      />
      <img
        src={hoverIconOf(item)}
        alt={item.name}
        className="absolute inset-0 h-full w-full"
        loading="eager"
        decoding="async"
        style={{ opacity: hovered ? 1 : 0, transform, transition }}
        onError={onError}
      />
    </>
  )
}

/** A marquee card. `tall` adds the blurb line and a larger mark. */
export function TechCard({ item, variant }: { item: TechItem; variant: Variant }) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const canHover = useCanHoverRef()
  const { showIcon, handleImgError, cacheBustSuffix } = useIconLoader(item)

  const layout = LAYOUT[variant]
  const accent = accentOf(item)
  const textColor = hovered ? accent : COLOR.primary
  const iconSize = iconSizeOf(item, variant)
  const open = () => window.open(item.url, '_blank')

  const scale = pressed ? 'scale(0.97)' : hovered ? `scale(1.03) translateY(-${layout.lift}px)` : 'scale(1)'

  return (
    <div
      className={`relative cursor-pointer select-none rounded-xl ${layout.className}`}
      style={{
        ...layout.box,
        background: hovered ? COLOR.white : '#F5F5F5',
        border: `1.5px solid ${hovered ? accent : PRIMARY.a30}`,
        transform: scale,
        zIndex: hovered ? 20 : 1,
        boxShadow: hovered ? SHADOW.cardHover : SHADOW.card,
        transition: 'all 0.2s ease',
        ...(variant === 'small'
          ? { gap: showIcon ? 12 : 0, justifyContent: showIcon ? 'flex-start' : 'center' }
          : { alignItems: showIcon ? 'flex-start' : 'center', textAlign: showIcon ? 'left' : 'center' }),
      }}
      onMouseEnter={() => { if (canHover.current) setHovered(true) }}
      onMouseLeave={() => { if (canHover.current) { setHovered(false); setPressed(false) } }}
      onMouseDown={() => { if (canHover.current) setPressed(true) }}
      onMouseUp={() => { if (canHover.current) setPressed(false) }}
      onClick={open}
      role="link"
      tabIndex={0}
      aria-label={item.name}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open() } }}
    >
      {showIcon && (
        <motion.div
          className={`relative ${variant === 'small' ? 'shrink-0' : ''}`}
          style={{ width: iconSize, height: iconSize }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {item.maskTinted ? (
            <TintedMark item={item} hovered={hovered} scale={layout.hoverScale} onError={handleImgError} />
          ) : (
            <img
              src={(hovered ? hoverIconOf(item) : item.icon) + cacheBustSuffix}
              alt={item.name}
              className={`h-full w-full ${variant === 'small' ? 'shrink-0' : ''}`}
              loading="eager"
              decoding="async"
              style={{
                transform: hovered ? `rotate(-8deg) scale(${layout.hoverScale})` : 'rotate(0deg)',
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
        className={`font-medium ${layout.nameClass}`}
        style={{
          color: textColor,
          transition: 'color 0.2s ease',
          ...(variant === 'small' ? { textAlign: showIcon ? 'left' : 'center' } : {}),
        }}
      >
        {item.name}
      </motion.span>

      {variant === 'tall' && (
        <motion.span
          layout
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="text-sm leading-relaxed"
          style={{ color: hovered ? alpha(accent, 0.75) : PRIMARY.a75, transition: 'color 0.2s ease' }}
        >
          {blurbOf(item)}
        </motion.span>
      )}

      <ExternalLinkIcon
        size={layout.arrowSize}
        stroke={textColor}
        className={`absolute ${layout.arrowClass}`}
        style={{
          opacity: hovered ? 0.7 : 0,
          transform: hovered ? 'translate(0, 0)' : 'translate(-4px, 4px)',
          transition: 'all 0.2s ease',
        }}
      />
    </div>
  )
}

function blurbOf(item: TechItem) {
  const text = item.blurb ?? `Applied ${item.name} in shipped projects and internal workflows`
  return text.replace(/[.\s]+$/, '')
}
