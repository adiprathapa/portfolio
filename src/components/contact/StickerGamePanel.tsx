import { AnimatePresence, motion } from 'framer-motion'
import { PillButton } from '../ui/pill-button'
import { CloseButton } from '../ui/close-button'
import { RestartIcon } from '../ui/icons'
import { COLOR, PRIMARY, TEXT } from '../../lib/theme'
import { accuracyMessage, finalMessage, type useStickerGame } from './useStickerGame'

type Game = ReturnType<typeof useStickerGame>

function GamepadIcon() {
  return (
    <motion.svg
      className="size-3 lg:size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      animate={{ x: [0, 3, -3, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
    >
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M12 12h.01" />
      <path d="M17 12h.01" />
      <path d="M7 12h.01" />
    </motion.svg>
  )
}

/** Which sticker to place, or how close the last guess landed. */
function RoundPrompt({ game, isLg }: { game: Game; isLg: boolean }) {
  const current = game.rounds[game.round]

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg" style={{ background: PRIMARY.a08 }}>
        <img src={current.src} alt={current.gameName} className="h-8 w-8 object-contain" />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="font-medium"
          style={{ color: COLOR.heading, fontSize: isLg ? '0.875rem' : 'clamp(0.7rem, 3.2vw, 0.875rem)', whiteSpace: 'nowrap' }}
        >
          {game.roundAccuracy !== null ? (
            <>
              {accuracyMessage(game.roundAccuracy)} <span style={{ color: COLOR.primary }}>{game.roundAccuracy}%</span>
            </>
          ) : (
            <>
              Place the <span style={{ color: COLOR.primary }}>{current.gameName}</span> sticker
            </>
          )}
        </p>
        <p className="mt-0.5 text-xs" style={{ color: PRIMARY.a50 }}>
          {game.round + 1} / {game.rounds.length} &middot; Click on the lid where it belongs
        </p>
      </div>
      {game.roundAccuracy !== null && isLg ? (
        <PillButton className="shrink-0 px-4 py-1.5" onClick={game.nextRound}>
          {game.isLastRound ? 'Results' : 'Next'}
        </PillButton>
      ) : (
        <CloseButton aria-label="Exit game" onClick={game.exit} />
      )}
    </div>
  )
}

function Results({ game }: { game: Game }) {
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <p className="font-normal" style={{ color: COLOR.primary, fontSize: TEXT.h2 }}>
        {finalMessage(game.averageScore)}
      </p>
      <p className="text-sm" style={{ color: PRIMARY.a50 }}>
        Average accuracy: {game.averageScore}%
      </p>
      <div className="mt-2 flex gap-2">
        <PillButton className="group px-4 py-2" onClick={game.start}>
          <span className="inline-flex items-center gap-1.5">
            <RestartIcon />
            <span>Play Again</span>
          </span>
        </PillButton>
        <PillButton variant="soft" className="px-4 py-2" onClick={game.exit}>Exit</PillButton>
      </div>
    </div>
  )
}

interface StickerGamePanelProps {
  game: Game
  isLg: boolean
  laptopOpen: boolean
  /** Width and horizontal nudge, so the panel lines up under the lid. */
  panelStyle: React.CSSProperties
  buttonStyle: React.CSSProperties
  panelRef: React.RefObject<HTMLDivElement | null>
  buttonRef: React.RefObject<HTMLButtonElement | null>
}

export function StickerGamePanel({ game, isLg, laptopOpen, panelStyle, buttonStyle, panelRef, buttonRef }: StickerGamePanelProps) {
  return (
    <div className="order-1 lg:relative lg:order-none">
      {!game.active && (
        <motion.button
          ref={buttonRef}
          initial={false}
          animate={{ opacity: laptopOpen ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="mx-auto mb-4 mt-0 flex cursor-pointer select-none items-center gap-2 lg:absolute lg:top-0 lg:mb-0 lg:mt-4"
          style={{
            color: COLOR.white,
            background: 'none',
            border: 'none',
            padding: 0,
            pointerEvents: laptopOpen ? 'auto' : 'none',
            ...buttonStyle,
          }}
          onClick={game.start}
        >
          <GamepadIcon />
          <span className="text-[10px] font-medium lg:text-sm">Sticker placement</span>
        </motion.button>
      )}

      <AnimatePresence>
        {game.active && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className={`mx-auto rounded-xl px-5 py-4 ${isLg ? 'absolute top-0 mb-0 mt-4' : 'mb-10 mt-4'}`}
            style={{
              background: 'rgba(239, 243, 248, 0.95)',
              border: `1.5px solid ${PRIMARY.a20}`,
              backdropFilter: 'blur(12px)',
              maxWidth: '100%',
              ...panelStyle,
            }}
          >
            {game.finished ? <Results game={game} /> : <RoundPrompt game={game} isLg={isLg} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
