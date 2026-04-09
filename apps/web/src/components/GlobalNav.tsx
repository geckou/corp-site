'use client'

import { useState, useMemo } from 'react'

import { NavButton } from '@/components/NavButton'
import { LightIcon } from '@/components/icons/LightIcon'
import { sections } from '@/lib/constants/sections'

type GlobalNavProps = {
  onScrollTo: (sectionId: string) => void
}

export const GlobalNav = ({ onScrollTo }: GlobalNavProps) => {
  const [isOpenedNav, setIsOpenedNav] = useState(false)
  const filteredSections = useMemo(
    () => sections.filter((s) => s.isShownOnNav),
    []
  )

  const scrollToSection = (sectionId: string) => {
    onScrollTo(sectionId)
    setIsOpenedNav(false)
  }

  return (
    <div className="contents">
      <div
        className={`global-nav-bg-light ${isOpenedNav ? 'open' : ''}`}
        onClick={() => setIsOpenedNav(!isOpenedNav)}
      />
      <div className="global-nav-light-wrap">
        <LightIcon
          className={`global-nav-light ${isOpenedNav ? 'open' : ''}`}
        />
      </div>
      <nav className={`flex items-end flex-col gap-sp-larger fixed bottom-sp-large right-0 opacity-0 pointer-events-none global-nav ${isOpenedNav ? 'open' : ''}`}>
        <button
          className="global-nav-link"
          type="button"
          data-heading="TOP"
          onClick={() => scrollToSection('about')}
        >
          <span>TOP</span>
        </button>
        {filteredSections.map((section) => (
          <button
            key={section.id}
            className="global-nav-link"
            type="button"
            data-heading={section.heading}
            onClick={() => scrollToSection(section.id)}
          >
            <span>{section.heading}</span>
          </button>
        ))}
      </nav>
      <NavButton
        isActive={!isOpenedNav}
        className="global-nav-button"
        onClick={() => setIsOpenedNav(!isOpenedNav)}
      />
      <style>{`
        .global-nav-bg-light {
          position: fixed;
          top: calc(var(--sp-large) - var(--sp-medium));
          right: calc(var(--sp-large) - var(--sp-medium));
          inline-size: calc(var(--nav-button-size) + (var(--sp-medium) * 2));
          aspect-ratio: 1 / 1;
          border-radius: 50%;
          background-color: var(--main-color);
          mix-blend-mode: lighten;
          opacity: .1;
          transition: all 0.3s;
          transform-origin: center;
        }
        .global-nav-bg-light.open {
          scale: 47;
          mix-blend-mode: hard-light;
          backdrop-filter: blur(0.2px);
          -webkit-backdrop-filter: blur(0.2px);
          opacity: 1;
          z-index: var(--z-index-nav);
        }
        @media (max-width: 576px) {
          .global-nav-bg-light { background-color: rgba(28, 74, 201, 0.8); }
          .global-nav-bg-light.open { mix-blend-mode: normal; }
        }
        .global-nav-light-wrap {
          inline-size: var(--nav-button-size);
          position: fixed;
          top: var(--sp-large);
          right: var(--sp-large);
          z-index: var(--z-index-nav);
          mix-blend-mode: overlay;
        }
        .global-nav-light {
          inline-size: 100%;
          fill: var(--white);
          opacity: 0;
          transition: all .2s ease;
        }
        .global-nav-light.open { scale: 20; opacity: 1; }
        .global-nav.open {
          opacity: 1;
          z-index: var(--z-index-nav);
          pointer-events: all;
        }
        .global-nav-button {
          --animation-duration: .3s;
          position: fixed;
          top: var(--sp-large);
          right: var(--sp-large);
          z-index: var(--z-index-nav);
        }
        .global-nav-link {
          font-family: var(--font-family-en);
          font-size: var(--fs-nav);
          line-height: .8;
          letter-spacing: var(--letter-spacing-narrow);
          transition: all 0.3s;
          position: relative;
        }
        .global-nav-link > span {
          position: relative;
          z-index: var(--z-index-nav);
        }
        .global-nav-link::before {
          content: attr(data-heading);
          position: absolute;
          top: var(--sp-small);
          color: var(--main-color);
          transition: top .3s ease;
        }
        .global-nav-link::after {
          content: '';
          inline-size: 0;
          block-size: 100%;
          position: absolute;
          right: 0;
          background-color: var(--white);
          transition: all .3s ease;
        }
        .global-nav-link:hover:not(:active) { color: var(--main-color); }
        .global-nav-link:hover:not(:active)::before { top: 0; }
        .global-nav-link:hover:not(:active)::after { inline-size: 100%; }
      `}</style>
    </div>
  )
}
