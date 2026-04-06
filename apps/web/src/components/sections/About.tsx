'use client'

import { useState, useEffect } from 'react'

import { SectionContainer } from '@/components/SectionContainer'

type AboutProps = {
  isActivated: boolean
}

export const About = ({ isActivated }: AboutProps) => {
  const [isShownText, setIsShownText] = useState(false)

  useEffect(() => {
    if (isActivated) setIsShownText(true)
  }, [isActivated])

  return (
    <SectionContainer className="section-about">
      {isShownText && (
        <>
          <p className="about-text about-text-1">
            Geckouという名前は、月光が暗闇で迷う人を照らして導くように、
            <br />
            「人々の支えとなる存在でありたい」という想いから名付けられました。
          </p>
          <p className="about-text about-text-2">
            エンタテインメントのような付加価値の提供だけではなく、
            <br />
            Webサービス、Web開発の効率化により、悩みや不満を解消することで、
            <br />
            自身の望む道を歩めるような社会づくりに、貢献いたします。
          </p>
        </>
      )}
      <style>{`
        .section-about {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: var(--sp-large);
        }
        .section-about::before {
          content: '';
          inline-size: min(50svh, 50vw);
          margin: auto;
          aspect-ratio: 1 / 1;
          opacity: .05;
          border-radius: 50%;
          background: var(--white);
          mix-blend-mode: overlay;
          filter: blur(var(--sp-larger));
          position: absolute;
          inset: 0;
        }
        .about-text {
          font-size: var(--fs-large);
          z-index: var(--z-index-contents);
          animation-name: shown;
          animation-duration: .8s;
          animation-timing-function: ease-in;
          animation-fill-mode: forwards;
          opacity: 0;
          text-shadow: 0 0 0 var(--corp-color);
        }
        .about-text-1 { animation-delay: 0s; }
        .about-text-2 { animation-delay: .8s; }
        @media (max-width: 576px) {
          .section-about { padding: 0 var(--sp-larger); }
          .about-text br { display: none; }
        }
      `}</style>
    </SectionContainer>
  )
}
