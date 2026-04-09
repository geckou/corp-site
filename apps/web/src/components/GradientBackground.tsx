'use client'

import {
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react'

import { backgroundGradients } from '@/lib/constants/gradient'

export type GradientBackgroundRef = {
  resetScroll: () => void
}

type GradientBackgroundProps = {
  scrollPercentage: number
}

export const GradientBackground = forwardRef<
  GradientBackgroundRef,
  GradientBackgroundProps
>(({ scrollPercentage }, ref) => {
  const lastScrollPercentage = useRef(0)

  useEffect(() => {
    if (lastScrollPercentage.current < scrollPercentage) {
      lastScrollPercentage.current = scrollPercentage
    }
  }, [scrollPercentage])

  useImperativeHandle(ref, () => ({
    resetScroll: () => {
      lastScrollPercentage.current = 0
    },
  }))

  const calcOpacity = useCallback(
    (index: number): number => {
      const gradientRangePercent = 100 / (backgroundGradients.length - 1)
      const minRange = gradientRangePercent * index
      const maxRange = gradientRangePercent * (index + 1)
      const current = lastScrollPercentage.current

      if (current >= minRange && current < maxRange) {
        const step = (current - minRange) / gradientRangePercent
        return 1 - step
      } else if (maxRange <= current) return 0
      else return 1
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [scrollPercentage]
  )

  const conversionGradientColor = (
    gradients: { color: string; gradientChangePoint: string }[]
  ): string => {
    return gradients.map((g) => `${g.color} ${g.gradientChangePoint}`).join(',')
  }

  return (
    <div className="w-full h-svh">
      {backgroundGradients.map((gradient, index) => (
        <div
          key={index}
          className="absolute inset-0 w-full h-svh transition-opacity duration-1000"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 150%, ${conversionGradientColor(gradient)})`,
            opacity:
              backgroundGradients.length === index + 1
                ? 10
                : calcOpacity(index),
            zIndex: `calc(var(--z-index-bg) - ${index})`,
          }}
        />
      ))}
    </div>
  )
})

GradientBackground.displayName = 'GradientBackground'
