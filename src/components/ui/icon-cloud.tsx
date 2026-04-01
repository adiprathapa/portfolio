"use client"

import { useEffect, useRef, useState } from "react"

interface Icon {
  x: number
  y: number
  z: number
  scale: number
  opacity: number
  id: number
}

interface IconCloudProps {
  images?: string[]
  size?: number
  activeIconIndices?: number[] | null
  rotationTargetIndices?: number[] | null
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function IconCloud({ images, size = 400, activeIconIndices, rotationTargetIndices }: IconCloudProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [iconPositions, setIconPositions] = useState<Icon[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [targetRotation, setTargetRotation] = useState<{
    x: number
    y: number
    startX: number
    startY: number
    distance: number
    startTime: number
    duration: number
  } | null>(null)
  const animationFrameRef = useRef<number>(0)
  const rotationRef = useRef({ x: 0, y: 0 })
  const lastTargetReachedTimeRef = useRef<number>(0)
  const iconCanvasesRef = useRef<HTMLCanvasElement[]>([])
  const imagesLoadedRef = useRef<boolean[]>([])

  useEffect(() => {
    if (!images) return

    imagesLoadedRef.current = new Array(images.length).fill(false)

    const iconSize = 80
    const newIconCanvases = images.map((src, index) => {
      const offscreen = document.createElement("canvas")
      offscreen.width = iconSize
      offscreen.height = iconSize
      const offCtx = offscreen.getContext("2d")

      if (offCtx) {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.src = src
        img.onload = () => {
          offCtx.clearRect(0, 0, iconSize, iconSize)
          // Fit image proportionally without clipping
          const aspect = img.naturalWidth / img.naturalHeight
          let drawW = iconSize
          let drawH = iconSize
          if (aspect > 1) {
            drawH = iconSize / aspect
          } else {
            drawW = iconSize * aspect
          }
          const offsetX = (iconSize - drawW) / 2
          const offsetY = (iconSize - drawH) / 2
          offCtx.drawImage(img, offsetX, offsetY, drawW, drawH)
          imagesLoadedRef.current[index] = true
        }
      }
      return offscreen
    })

    iconCanvasesRef.current = newIconCanvases
  }, [images])

  useEffect(() => {
    const items = images ?? []
    const newIcons: Icon[] = []
    const numIcons = items.length || 20
    const radius = size * 0.28

    const offset = 2 / numIcons
    const increment = Math.PI * (3 - Math.sqrt(5))

    for (let i = 0; i < numIcons; i++) {
      const y = i * offset - 1 + offset / 2
      const r = Math.sqrt(1 - y * y)
      const phi = i * increment

      const x = Math.cos(phi) * r
      const z = Math.sin(phi) * r

      newIcons.push({
        x: x * radius,
        y: y * radius,
        z: z * radius,
        scale: 1,
        opacity: 1,
        id: i,
      })
    }
    setIconPositions(newIcons)
  }, [images, size])

  // When rotationTargetIndices changes, compute centroid and rotate globe to bring them to front
  const prevActiveRef = useRef<number[] | null | undefined>(null)
  useEffect(() => {
    const indices = rotationTargetIndices
    if (!indices || indices.length === 0) {
      prevActiveRef.current = indices
      return
    }
    if (iconPositions.length === 0) {
      return
    }
    // Only trigger rotation if indices actually changed
    const prev = prevActiveRef.current
    if (prev && prev.length === indices.length && prev.every((v, i) => v === indices[i])) {
      return
    }
    prevActiveRef.current = indices

    // Compute centroid of active icons in sphere coordinates
    let cx = 0, cy = 0, cz = 0
    for (const idx of indices) {
      if (idx < iconPositions.length) {
        cx += iconPositions[idx].x
        cy += iconPositions[idx].y
        cz += iconPositions[idx].z
      }
    }
    cx /= indices.length
    cy /= indices.length
    cz /= indices.length

    // Compute rotation to bring centroid to face viewer (positive z)
    const targetX = -Math.atan2(cy, Math.sqrt(cx * cx + cz * cz))
    const targetY = Math.atan2(cx, cz)

    const currentX = rotationRef.current.x
    const currentY = rotationRef.current.y
    const distance = Math.sqrt(
      Math.pow(targetX - currentX, 2) + Math.pow(targetY - currentY, 2)
    )
    const duration = Math.min(1600, Math.max(800, distance * 800))

    setTargetRotation({
      x: targetX,
      y: targetY,
      startX: currentX,
      startY: currentY,
      distance,
      startTime: performance.now(),
      duration,
    })
    lastTargetReachedTimeRef.current = 0
  }, [rotationTargetIndices, iconPositions])

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect || !canvasRef.current) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Reset pause on interaction
    lastTargetReachedTimeRef.current = 0

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    iconPositions.forEach((icon) => {
      const cosX = Math.cos(rotationRef.current.x)
      const sinX = Math.sin(rotationRef.current.x)
      const cosY = Math.cos(rotationRef.current.y)
      const sinY = Math.sin(rotationRef.current.y)

      const rotatedX = icon.x * cosY - icon.z * sinY
      const rotatedZ = icon.x * sinY + icon.z * cosY
      const rotatedY = icon.y * cosX + rotatedZ * sinX

      const screenX = canvasRef.current!.width / 2 + rotatedX
      const screenY = canvasRef.current!.height / 2 + rotatedY

      const scale = (rotatedZ + 200) / 300
      const radius = 40 * scale
      const dx = x - screenX
      const dy = y - screenY

      if (dx * dx + dy * dy < radius * radius) {
        const targetX = -Math.atan2(
          icon.y,
          Math.sqrt(icon.x * icon.x + icon.z * icon.z)
        )
        const targetY = Math.atan2(icon.x, icon.z)

        const currentX = rotationRef.current.x
        const currentY = rotationRef.current.y
        const distance = Math.sqrt(
          Math.pow(targetX - currentX, 2) + Math.pow(targetY - currentY, 2)
        )

        const duration = Math.min(1600, Math.max(800, distance * 800))

        setTargetRotation({
          x: targetX,
          y: targetY,
          startX: currentX,
          startY: currentY,
          distance,
          startTime: performance.now(),
          duration,
        })
        return
      }
    })

    setIsDragging(true)
    setLastMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      setMousePos({ x, y })
    }

    if (isDragging) {
      const deltaX = e.clientX - lastMousePos.x
      const deltaY = e.clientY - lastMousePos.y

      rotationRef.current = {
        x: rotationRef.current.x + deltaY * 0.002,
        y: rotationRef.current.y + deltaX * 0.002,
      }

      setLastMousePos({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    // Reset pause on interaction
    lastTargetReachedTimeRef.current = 0
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (canvas && ctx) {
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY)
        const dx = mousePos.x - centerX
        const dy = mousePos.y - centerY
        const distance = Math.sqrt(dx * dx + dy * dy)
        const speed = 0.003 + (distance / maxDistance) * 0.01

        if (targetRotation) {
          const elapsed = performance.now() - targetRotation.startTime
          const progress = Math.min(1, elapsed / targetRotation.duration)
          const easedProgress = easeInOutCubic(progress)

          rotationRef.current = {
            x:
              targetRotation.startX +
              (targetRotation.x - targetRotation.startX) * easedProgress,
            y:
              targetRotation.startY +
              (targetRotation.y - targetRotation.startY) * easedProgress,
          }

          if (progress >= 1) {
            setTargetRotation(null)
            lastTargetReachedTimeRef.current = performance.now()
          }
        } else if (!isDragging) {
          // Pause ambient rotation for 2 seconds after reaching a target
          const isPaused = performance.now() - lastTargetReachedTimeRef.current < 200

          if (!isPaused) {
            rotationRef.current = {
              x: rotationRef.current.x + (dy / canvas.height) * speed,
              y: rotationRef.current.y + (dx / canvas.width) * speed,
            }
          }
        }

        const cosX = Math.cos(rotationRef.current.x)
        const sinX = Math.sin(rotationRef.current.x)
        const cosY = Math.cos(rotationRef.current.y)
        const sinY = Math.sin(rotationRef.current.y)

        // Sort icons back-to-front so closer icons paint on top
        const sorted = iconPositions
          .map((icon, index) => {
            const rotatedX = icon.x * cosY - icon.z * sinY
            const rotatedZ = icon.x * sinY + icon.z * cosY
            const rotatedY = icon.y * cosX + rotatedZ * sinX
            return { icon, index, rotatedX, rotatedY, rotatedZ }
          })
          .sort((a, b) => a.rotatedZ - b.rotatedZ)

        sorted.forEach(({ index, rotatedX, rotatedY, rotatedZ }) => {
          const scale = (rotatedZ + 200) / 300
          const opacity = Math.max(0.2, Math.min(1, (rotatedZ + 150) / 200))

          ctx.save()
          ctx.translate(
            canvas.width / 2 + rotatedX,
            canvas.height / 2 + rotatedY
          )
          ctx.scale(scale, scale)
          ctx.globalAlpha = opacity

          const isActive = activeIconIndices?.includes(index) ?? false

          if (images) {
            if (
              iconCanvasesRef.current[index] &&
              imagesLoadedRef.current[index]
            ) {
              if (isActive) {
                const pulse = (Math.sin(performance.now() / 400) + 1) / 2
                const pulseScale = 1 + pulse * 0.15
                ctx.scale(pulseScale, pulseScale)
                ctx.shadowBlur = 10 + pulse * 6
                ctx.shadowColor = `rgba(0, 0, 0, ${0.25 + pulse * 0.15})`
                ctx.shadowOffsetX = 2
                ctx.shadowOffsetY = 3
                ctx.drawImage(iconCanvasesRef.current[index], -40, -40, 80, 80)
                ctx.shadowBlur = 0
                ctx.drawImage(iconCanvasesRef.current[index], -40, -40, 80, 80)
              } else {
                ctx.drawImage(iconCanvasesRef.current[index], -40, -40, 80, 80)
              }
            }
          } else {
            ctx.beginPath()
            ctx.arc(0, 0, 20, 0, Math.PI * 2)
            ctx.fillStyle = "#4444ff"
            ctx.fill()
            ctx.fillStyle = "white"
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.font = "16px Arial"
            ctx.fillText(`${icon.id + 1}`, 0, 0)
          }

          ctx.restore()
        })
        animationFrameRef.current = requestAnimationFrame(animate)
      }

      animate()
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [images, iconPositions, isDragging, mousePos, targetRotation])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="rounded-lg"
      aria-label="Interactive 3D Icon Cloud"
      role="img"
    />
  )
}
