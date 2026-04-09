'use client'

import { useState, useEffect } from 'react'

import { LogoSymbol } from '@/components/Logo/Symbol'
import { LogoText } from '@/components/Logo/Text'

const DISPLAY_DURATION = 2500

export const SplashScreen = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true)
      setTimeout(() => setIsLoading(false), 500)
    }, DISPLAY_DURATION)

    return () => clearTimeout(timer)
  }, [])

  if (!isLoading) return null

  return (
    <div
      className={`fixed inset-0 w-full h-screen z-overlay grid place-items-center transition-opacity duration-500 ease-in-out ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      style={{ background: 'var(--first-gradient)' }}
    >
      <div
        className="splash-logo"
        style={
          {
            '--animation-duration': `${DISPLAY_DURATION}ms`,
          } as React.CSSProperties
        }
      >
        <LogoSymbol variant="white" />
        <LogoText className="splash-logo-text mt-[15%]" variant="white" />
      </div>
      <style>{`
        .splash-logo {
          --logo-width: calc(var(--bv) * 32);
          inline-size: calc(var(--logo-width) + var(--logo-width) * .625);
          block-size: calc(var(--logo-width) * .375);
          display: grid;
          grid-template-columns: 37.5% 1fr;
          gap: 5%;
          margin: auto;
          padding-inline-start: calc(var(--logo-width) * .625);
          filter: blur(200px);
          animation-name: loadingAnime;
          animation-duration: var(--animation-duration);
          animation-fill-mode: forwards;
          animation-timing-function: ease-in-out;
        }
        .splash-logo > * { inline-size: 100%; }
        @keyframes loadingAnime {
          0% { filter: blur(200px); }
          50% { filter: blur(100px); }
          100% { filter: blur(0); }
        }
      `}</style>
    </div>
  )
}
