import { type RefObject } from 'react'
import { AnimatePresence, motion, type MotionValue } from 'framer-motion'
import { Sticker } from './Sticker'
import { stickers } from '../../data/stickers'
import type { useStickerGame } from './useStickerGame'

type Game = ReturnType<typeof useStickerGame>

interface LaptopLidProps {
  lidRef: RefObject<HTMLDivElement | null>
  rotateX: MotionValue<number>
  scale: MotionValue<number>
  isLg: boolean
  /** Lid is upright enough for the stickers to be interactive. */
  open: boolean
  /** Defers the per-sticker alpha scan until the section is near the viewport. */
  visualsReady: boolean
  nextStickerZ: () => number
  game: Game
}

export function LaptopLid({ lidRef, rotateX, scale, isLg, open, visualsReady, nextStickerZ, game }: LaptopLidProps) {
  return (
    <motion.div
      ref={lidRef}
      className="relative w-full"
      style={{ maxWidth: '78rem', rotateX, scale, transformOrigin: 'center bottom', transformStyle: 'preserve-3d' }}
    >
      <img src="/macbook-lid.svg" alt="MacBook Air Midnight" className="h-auto w-full" />

      {/* Rendered before the stickers so they always stack above it. */}
      <img
        src="/appl.png"
        alt=""
        className="pointer-events-none absolute select-none"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          height: 71,
          width: 'auto',
          opacity: 0.35,
          filter: 'brightness(0)',
        }}
      />

      {visualsReady && (
        <div
          style={{
            opacity: game.active ? 0 : 1,
            transition: 'opacity 0.5s ease',
            pointerEvents: game.active ? 'none' : 'auto',
          }}
        >
          {stickers.map((sticker) => (
            <Sticker
              key={sticker.src}
              sticker={sticker}
              style={sticker.position(isLg)}
              lidRef={lidRef}
              disabled={!open}
              onDropped={nextStickerZ}
            />
          ))}
        </div>
      )}

      {game.active && (
        <>
          {/* Invisible copies at the true positions, measured for scoring. */}
          {game.rounds.map((sticker, i) => (
            <div
              key={`target-${sticker.src}`}
              ref={(el) => { game.targetRefs.current[i] = el }}
              className="pointer-events-none absolute"
              style={{ ...sticker.style, opacity: 0 }}
            >
              <img src={sticker.src} className="h-auto w-full" alt="" />
            </div>
          ))}

          {!game.finished && game.roundAccuracy === null && (
            <div
              className="absolute z-50"
              style={{ inset: '3%', cursor: 'crosshair', borderRadius: 8 }}
              onClick={game.placeAt}
            />
          )}

          {/* Scored rounds sit where the player put them, until the reveal. */}
          {game.scores.map((_, i) => {
            if (i === game.round && game.roundAccuracy !== null && !game.finished) return null
            const sticker = game.rounds[i]
            const placement = game.placements[i]
            const spin = sticker.rotation ? ` rotate(${sticker.rotation}deg)` : ''

            if (!game.finished && placement) {
              return (
                <div
                  key={`placed-${sticker.src}`}
                  className="pointer-events-none absolute"
                  style={{
                    left: `${placement.x}%`,
                    top: `${placement.y}%`,
                    width: sticker.style.width as string,
                    transform: `translate(-50%, -50%)${spin}`,
                  }}
                >
                  <img src={sticker.src} className="h-auto w-full" alt="" />
                </div>
              )
            }
            return (
              <div
                key={`placed-${sticker.src}`}
                className="pointer-events-none absolute"
                style={{ ...sticker.style, ...(spin ? { transform: spin.trim() } : {}) }}
              >
                <img src={sticker.src} className="h-auto w-full" alt="" />
              </div>
            )
          })}

          <AnimatePresence>
            {game.roundAccuracy !== null && !game.finished && game.lastClick && (
              <motion.div
                className="pointer-events-none absolute"
                style={{
                  left: `${game.lastClick.x}%`,
                  top: `${game.lastClick.y}%`,
                  width: game.rounds[game.round].style.width as string,
                  translateX: '-50%',
                  translateY: '-50%',
                }}
                initial={{ opacity: 0, scale: 0.5, rotate: game.rounds[game.round].rotation ?? 0 }}
                animate={{ opacity: 1, scale: 1, rotate: game.rounds[game.round].rotation ?? 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <img src={game.rounds[game.round].src} className="h-auto w-full" alt="" />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  )
}
