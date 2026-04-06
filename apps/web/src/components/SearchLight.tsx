'use client'

import { useRef, useEffect, useCallback } from 'react'

type SearchLightProps = {
  isActive : boolean
  angleValue : number
  topEdgeWidth: number
  bgImageSrc : string
}

export const SearchLight = ({ isActive, angleValue, topEdgeWidth, bgImageSrc }: SearchLightProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const angleRef = useRef(90)
  const animationStartTimeRef = useRef(0)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const prevIsActive = useRef(isActive)
  const ANGLE_CHANGE_SPEED = 450

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const img = imageRef.current
    if (!ctx || !img || !img.complete) return

    const imgAspectRatio = img.width / img.height
    const canvasAspectRatio = canvas.width / canvas.height
    const isImageHorizontal = imgAspectRatio > canvasAspectRatio
    const drawWidth = isImageHorizontal ? canvas.height * imgAspectRatio : canvas.width
    const drawHeight = isImageHorizontal ? canvas.height : canvas.width / imgAspectRatio
    const offsetX = isImageHorizontal ? (canvas.width - drawWidth) / 2 : 0
    const offsetY = isImageHorizontal ? 0 : (canvas.height - drawHeight) / 2
    const centerX = canvas.width / 2
    const centerY = canvas.height
    const diagonal = Math.sqrt(canvas.width ** 2 + canvas.height ** 2)
    const topEdgeStartX = canvas.width / 2 - topEdgeWidth / 2
    const topEdgeEndX = canvas.width / 2 + topEdgeWidth / 2

    ctx.globalCompositeOperation = 'source-over'
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
    ctx.globalCompositeOperation = 'destination-in'

    ctx.beginPath()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.translate(centerX, centerY)
    ctx.rotate(angleRef.current * Math.PI / 180)
    ctx.moveTo(topEdgeStartX, -diagonal)
    ctx.lineTo(topEdgeEndX, -diagonal)
    ctx.lineTo(0, 0)
    ctx.closePath()
    ctx.fillStyle = '#000000'
    ctx.fill()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
  }, [topEdgeWidth])

  useEffect(() => {
    const img = new Image()
    img.src = bgImageSrc
    imageRef.current = img
  }, [bgImageSrc])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
  }, [])

  useEffect(() => {
    if (prevIsActive.current === isActive) return
    prevIsActive.current = isActive

    angleRef.current = isActive ? 90 : angleValue
    animationStartTimeRef.current = 0

    const animate = (timestamp: DOMHighResTimeStamp) => {
      if (!animationStartTimeRef.current) animationStartTimeRef.current = timestamp
      const elapsedTime = timestamp - animationStartTimeRef.current
      const desiredAngle = ANGLE_CHANGE_SPEED * (elapsedTime / 1000)

      if (isActive && angleRef.current > angleValue) {
        angleRef.current = 90 - desiredAngle
      } else if (!isActive && -120 <= angleRef.current) {
        angleRef.current = angleValue - desiredAngle
      }

      const shouldContinue = isActive
        ? angleRef.current > angleValue
        : -120 <= angleRef.current

      if (shouldContinue) {
        draw()
        requestAnimationFrame(animate)
      } else {
        animationStartTimeRef.current = 0
      }
    }

    requestAnimationFrame(animate)
  }, [isActive, angleValue, draw])

  return (
    <canvas
      ref={canvasRef}
      style={{
        inlineSize   : '100%',
        blockSize    : '100%',
        position     : 'fixed',
        top          : 0,
        left         : 0,
        pointerEvents: 'none',
        opacity      : isActive ? 1 : 0,
        transition   : 'opacity .3s',
      }}
    />
  )
}
