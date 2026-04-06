'use client'

import { useState, useEffect, useRef } from 'react'

import { LogoSymbol } from '@/components/Logo/Symbol'
import { LogoText } from '@/components/Logo/Text'
import { SectionContainer } from '@/components/SectionContainer'

type LogoAreaProps = {
  'data-section-id'?: string
  onScrollTo: (sectionId: string) => void
}

export const LogoArea = ({
  'data-section-id': dataSectionId,
  onScrollTo,
}: LogoAreaProps) => {
  const [isOutOfView, setIsOutOfView] = useState(false)
  const logoAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = logoAreaRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => setIsOutOfView(!entries[0].isIntersecting),
      { root: null, rootMargin: '0px', threshold: 0.5 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <SectionContainer data-section-id={dataSectionId}>
      <div ref={logoAreaRef} style={{ inlineSize: '100%', blockSize: '100%' }}>
        <div
          className={`logo-icon ${isOutOfView ? 'rise' : ''}`}
          onClick={() => onScrollTo('logo')}
        >
          <LogoSymbol variant={isOutOfView ? 'normal' : 'white'} />
          <LogoText
            className={`logo-icon-text ${isOutOfView ? 'hide' : ''}`}
            variant="white"
          />
        </div>
      </div>
      <style>{`
        .logo-icon {
          --logo-width: calc(var(--bv) * 32);
          inline-size: calc(var(--logo-width) + var(--logo-width) * .625);
          block-size: calc(var(--logo-width) * .375);
          display: grid;
          grid-template-columns: 37.5% 1fr;
          gap: 5%;
          margin: auto;
          padding-inline-start: calc(var(--logo-width) * .625);
          position: fixed;
          top: calc(50% - var(--logo-width) * .375 / 2);
          right: 0;
          left: 0;
          transition: all .3s ease-out;
          cursor: pointer;
          z-index: calc(var(--z-index-contents) - 1);
        }
        .logo-icon > * { inline-size: 100%; }
        .logo-icon.rise { top: var(--sp-larger); bottom: auto; }
        .logo-icon-text {
          margin-block-start: 15%;
          opacity: 1;
          transition: opacity .3s ease-out;
        }
        .logo-icon-text.hide { opacity: 0; }
      `}</style>
    </SectionContainer>
  )
}
