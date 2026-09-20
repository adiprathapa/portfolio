import { useCallback, useEffect, useRef, useState } from 'react'
import { useMotionValueEvent, useScroll, useTransform } from 'framer-motion'
import { ContactForm } from './contact/ContactForm'
import { LaptopLid } from './contact/LaptopLid'
import { StickerGamePanel } from './contact/StickerGamePanel'
import { useStickerGame } from './contact/useStickerGame'
import { SocialLinks } from './ui/social-links'
import { SITE } from '../data/site'
import { useInView } from '../hooks/useInView'
import { useIsDesktop } from '../hooks/useMediaQuery'
import { TEXT } from '../lib/theme'

// Reference widths the lid art is authored at; everything else scales from here.
const MOBILE_REF_WIDTH = 700
const DESKTOP_REF_WIDTH = 651
const DESKTOP_LEFT_OFFSET = 110
/** Lid SVG aspect ratio, used to estimate the rendered height before layout. */
const LID_ASPECT = 0.83
/** The open lid overshoots its box by this much, so the panel must match. */
const LID_OVERSHOOT = (1400 / 1500) * 1.1

/** Centers the game panel under the lid, which is scaled and offset on desktop. */
function panelMarginLeft(isLg: boolean) {
  return isLg ? { marginLeft: DESKTOP_LEFT_OFFSET - (DESKTOP_REF_WIDTH * (LID_OVERSHOOT - 1)) / 2 } : {}
}

/** Largest scale at which the lid still fits the column and the viewport height. */
function useLaptopScale(containerRef: React.RefObject<HTMLDivElement | null>, isLg: boolean) {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const update = () => {
      const refWidth = isLg ? DESKTOP_REF_WIDTH : MOBILE_REF_WIDTH
      const heightScale = (window.innerHeight * 0.78) / (refWidth * LID_ASPECT)
      const widthScale = isLg
        ? Math.min(Math.max(el.clientWidth - DESKTOP_LEFT_OFFSET, 100), DESKTOP_REF_WIDTH) / DESKTOP_REF_WIDTH
        : (el.clientWidth * 0.85) / MOBILE_REF_WIDTH
      setScale(Math.min(widthScale, heightScale))
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [containerRef, isLg])

  return scale
}

/**
 * Height of whatever currently sits under the lid, so the section can reserve
 * room for it: on desktop the panel is absolutely positioned and would
 * otherwise overlap the footer.
 */
function useReservedPanelHeight(
  target: React.RefObject<HTMLElement | null>,
  enabled: boolean,
  deps: unknown[],
) {
  const [height, setHeight] = useState(0)

  useEffect(() => {
    const el = target.current
    if (!enabled || !el) {
      setHeight(0)
      return
    }
    const update = () => setHeight(el.offsetHeight)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, enabled, ...deps])

  return height
}

export function Contact() {
  const sectionRef = useRef<HTMLElement>(null)
  const laptopContainerRef = useRef<HTMLDivElement>(null)
  const laptopRef = useRef<HTMLDivElement>(null)
  const lidRef = useRef<HTMLDivElement>(null)
  const gamePanelRef = useRef<HTMLDivElement>(null)
  const gameButtonRef = useRef<HTMLButtonElement>(null)

  const isLg = useIsDesktop(false)
  const visualsReady = useInView(sectionRef, { once: true, rootMargin: '900px 0px' })
  const laptopScale = useLaptopScale(laptopContainerRef, isLg)
  const game = useStickerGame(isLg, lidRef)

  // Each dropped sticker takes the next z-index, so it lands on top.
  const stickerZ = useRef(50)
  const nextStickerZ = useCallback(() => ++stickerZ.current, [])

  // The lid swings open as the section scrolls into view.
  const { scrollYProgress } = useScroll({ target: laptopRef, offset: ['start end', 'end start'] })
  const rotateX = useTransform(scrollYProgress, [0, isLg ? 0.4 : 0.24], [70, 0], { clamp: true })
  const scale = useTransform(scrollYProgress, [0, 0.4], [0.935, 1.1], { clamp: true })
  const [laptopOpen, setLaptopOpen] = useState(false)
  useMotionValueEvent(rotateX, 'change', (v) => setLaptopOpen(v <= 1))

  const reservedHeight = useReservedPanelHeight(
    game.active ? gamePanelRef : gameButtonRef,
    isLg && laptopOpen,
    [game.active, game.finished, game.round, game.roundAccuracy],
  )

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="px-6 pb-8 pt-24 md:py-28 lg:flex lg:items-start lg:pb-16 lg:pt-28"
      style={isLg && reservedHeight ? { paddingBottom: `calc(4rem + ${reservedHeight + 16}px)` } : undefined}
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_1.8fr] lg:items-stretch lg:gap-x-24 lg:gap-y-6">
          {/* `contents` on mobile lets the children order independently. */}
          <div className="contents lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:flex lg:flex-col lg:justify-between lg:pb-16">
            <div className="order-1 lg:order-none">
              <h2 className="mb-6 text-left font-normal leading-tight text-white" style={{ fontSize: TEXT.h2 }}>
                Let's work
                <br />
                together
              </h2>
              <p className="max-w-lg leading-relaxed text-black lg:mb-10" style={{ fontSize: TEXT.body }}>
                Have a project or opportunity in mind, or just want to connect? Email me at{' '}
                <a href={`mailto:${SITE.email}`} className="underline underline-offset-4 transition-colors hover:text-white">{SITE.email}</a>, grab a slot on my{' '}
                <a href={SITE.calendar} className="underline underline-offset-4 transition-colors hover:text-white">calendar</a>, or drop your email and I'll reach out.
              </p>
            </div>

            <div className="order-3 lg:order-none">
              <ContactForm />
              <SocialLinks location="contact" />
            </div>
          </div>

          <div ref={laptopContainerRef} className="order-2 mt-1 flex flex-col lg:order-none lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:block">
            <div
              ref={laptopRef}
              className="relative order-2 mt-2 flex items-center justify-center lg:order-none lg:ml-[110px] lg:mt-0"
              style={{
                perspective: 1200,
                width: isLg ? DESKTOP_REF_WIDTH : MOBILE_REF_WIDTH,
                zoom: laptopScale,
                ...(isLg ? {} : { margin: '0 auto' }),
              }}
            >
              <LaptopLid
                lidRef={lidRef}
                rotateX={rotateX}
                scale={scale}
                isLg={isLg}
                open={laptopOpen}
                visualsReady={visualsReady}
                nextStickerZ={nextStickerZ}
                game={game}
              />
            </div>

            <StickerGamePanel
              game={game}
              isLg={isLg}
              laptopOpen={laptopOpen}
              panelRef={gamePanelRef}
              buttonRef={gameButtonRef}
              buttonStyle={panelMarginLeft(isLg)}
              panelStyle={{
                width: isLg ? DESKTOP_REF_WIDTH * LID_OVERSHOOT : MOBILE_REF_WIDTH * laptopScale,
                zoom: isLg ? laptopScale : undefined,
                ...panelMarginLeft(isLg),
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

