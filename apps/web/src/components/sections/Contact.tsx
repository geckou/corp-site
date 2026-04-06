'use client'

import { useState, useEffect } from 'react'

import { ContactForm } from '@/components/ContactForm'
import { SectionContainer } from '@/components/SectionContainer'
import { SectionHeading } from '@/components/SectionHeading'

type ContactProps = {
  isActivated: boolean
  heading : string
}

export const Contact = ({ isActivated, heading }: ContactProps) => {
  const [isHidden, setIsHidden] = useState(false)

  useEffect(() => {
    if (!isActivated) setIsHidden(true)
  }, [isActivated])

  return (
    <SectionContainer className="contact-container">
      <ContactForm isActive={isActivated} />
      <div className={`contact-copyright ${isActivated ? 'active' : ''} ${isHidden ? 'hidden' : ''}`}>
        <small>© Geckou LLC</small>
      </div>
      <SectionHeading heading={heading} isShown={isActivated} />
      <style>{`
        .contact-container {
          display: flex;
          justify-content: left;
          align-items: center;
          margin-block-end: calc(var(--globe-height) * -1);
        }
        .contact-copyright {
          display: block;
          inline-size: 300px;
          block-size: 0;
          opacity: 0;
          overflow: hidden;
          position: fixed;
          top: 85svh;
          right: 0;
          left: auto;
          transition: all 1s ease-in-out;
        }
        .contact-copyright.active { block-size: 500px; opacity: 1; }
        .contact-copyright.hidden { block-size: 100%; opacity: 0; filter: blur(300px); }
        .contact-copyright > small {
          inline-size: 100%;
          padding-inline: var(--sp-large);
          padding-block: var(--sp-small);
          text-align: center;
          font-size: var(--fs-copyright);
          font-family: var(--font-family-en);
          rotate: -45deg;
          transform-origin: left;
          background-color: rgba(28,74,201,0.1);
          mix-blend-mode: plus-lighter;
          position: absolute;
          top: calc(var(--sp) * 8);
          right: calc(var(--sp) * -12);
        }
        @media (max-width: 576px) {
          .contact-copyright { z-index: calc(var(--z-index-contents) + 1); }
          .contact-copyright > small { rotate: 0deg; }
        }
      `}</style>
    </SectionContainer>
  )
}
