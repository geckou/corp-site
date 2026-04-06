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
      <div
        className={className}
        style={{
          inlineSize: '100%',
          blockSize: '100svh',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 'var(--z-index-bg)',
          }}
        >
          <GradientBackground
            ref={gradientRef}
            scrollPercentage={scrollPercentage}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 'var(--z-index-bg)',
          }}
        >
          <StarrySky />
        </div>
      </div>
    )
  }
)

TopBackground.displayName = 'TopBackground'
