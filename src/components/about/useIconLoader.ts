import { useCallback, useEffect, useRef, useState } from 'react'
import { hoverIconOf, type TechItem } from '../../data/tech'

const MAX_RETRIES = 2

/**
 * Loads a tech mark out of band so the card can reserve its layout before the
 * image arrives, retrying a couple of times with a cache-busting suffix before
 * giving up and rendering the name alone.
 */
export function useIconLoader(item: TechItem) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const attempt = useRef(0)

  const baseSrc = item.icon
  const hoverSrc = hoverIconOf(item)

  useEffect(() => {
    let cancelled = false
    attempt.current = 0
    setLoaded(false)
    setFailed(false)
    setRetryKey(0)

    const tryLoad = () => {
      if (cancelled) return
      const img = new Image()
      img.src = attempt.current > 0 ? withRetry(baseSrc, attempt.current) : baseSrc
      img.onload = () => { if (!cancelled) setLoaded(true) }
      img.onerror = () => {
        if (cancelled) return
        if (attempt.current < MAX_RETRIES) {
          attempt.current += 1
          setTimeout(tryLoad, 700 * attempt.current)
        } else {
          setLoaded(true)
          setFailed(true)
        }
      }
    }
    tryLoad()

    if (hoverSrc !== baseSrc) {
      const hoverImg = new Image()
      hoverImg.src = hoverSrc
    }

    return () => { cancelled = true }
  }, [baseSrc, hoverSrc])

  const handleImgError = useCallback(() => {
    if (attempt.current < MAX_RETRIES) {
      attempt.current += 1
      setRetryKey((k) => k + 1)
    } else {
      setFailed(true)
    }
  }, [])

  return {
    showIcon: loaded && !failed,
    handleImgError,
    cacheBustSuffix: retryKey > 0 ? (baseSrc.includes('?') ? `&r=${retryKey}` : `?r=${retryKey}`) : '',
  }
}

function withRetry(src: string, n: number) {
  return `${src}${src.includes('?') ? '&' : '?'}r=${n}`
}
