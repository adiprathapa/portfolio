import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import type { ProjectMedia as ProjectMediaItem } from '../../data/projects'
import { Safari } from '../../components/ui/safari'

/** Browser-framed screenshot or video. Nothing loads until it's near the viewport. */
export function ProjectMedia({ media }: { media: ProjectMediaItem }) {
  const ref = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true)
          observer.disconnect()
        }
      },
      { rootMargin: '300px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const isVideo = media.kind === 'video'

  if (media.frame === 'plain' && !isVideo) {
    return (
      <figure>
        <img
          src={media.src}
          alt={media.alt}
          loading="lazy"
          decoding="async"
          className="block w-full rounded-xl"
          style={{ background: '#FFFFFF', border: '1.5px solid rgba(6, 113, 164, 0.3)' }}
        />
        {media.caption && (
          <figcaption className="mt-3 text-sm" style={{ color: '#4B5563' }}>
            {media.caption}
          </figcaption>
        )}
      </figure>
    )
  }

  return (
    <figure aria-label={media.alt}>
      <div ref={ref} style={{ aspectRatio: '1203 / 753' }}>
        {near && (
          <Safari
            url={media.url}
            imageSrc={isVideo ? undefined : media.src}
            videoSrc={isVideo ? media.src : undefined}
            posterSrc={media.poster}
            videoCropTop={media.cropTop}
            videoCropBottom={media.cropBottom}
            videoCropLeft={media.cropLeft}
            videoCropRight={media.cropRight}
            playing={isVideo ? !reducedMotion : undefined}
            style={{ width: '100%' }}
          />
        )}
      </div>
      {media.caption && (
        <figcaption className="mt-3 text-sm" style={{ color: '#4B5563' }}>
          {media.caption}
        </figcaption>
      )}
    </figure>
  )
}
