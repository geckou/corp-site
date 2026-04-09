'use client'

import { useRef, forwardRef, useImperativeHandle } from 'react'

import { GradientBackground } from '@/components/GradientBackground'
import type { GradientBackgroundRef } from '@/components/GradientBackground'
import { StarrySky } from '@/components/StarrySky'

export type TopBackgroundRef = {
  resetScroll: () => void
}

type TopBackgroundProps = {
  scrollPercentage: number
  className?: string
}

export const TopBackground = forwardRef<TopBackgroundRef, TopBackgroundProps>(
  ({ scrollPercentage, className }, ref) => {
    const gradientRef = useRef<GradientBackgroundRef>(null)

    useImperativeHandle(ref, () => ({
      resetScroll: () => gradientRef.current?.resetScroll(),
    }))

    return (
      <div className={`w-full h-svh pointer-events-none ${className ?? ''}`}>
        <div className="absolute inset-0 z-bg">
          <GradientBackground
            ref={gradientRef}
            scrollPercentage={scrollPercentage}
          />
        </div>
        <div className="absolute inset-0 z-bg">
          <StarrySky />
        </div>
      </div>
    )
  }
)

TopBackground.displayName = 'TopBackground'
