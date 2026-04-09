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
      <div className={`pointer-events-none h-svh w-full ${className ?? ''}`}>
        <div className="z-bg absolute inset-0">
          <GradientBackground
            ref={gradientRef}
            scrollPercentage={scrollPercentage}
          />
        </div>
        <div className="z-bg absolute inset-0">
          <StarrySky />
        </div>
      </div>
    )
  }
)

TopBackground.displayName = 'TopBackground'
