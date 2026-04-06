'use client'

import { useState, useEffect } from 'react'

import { LightIcon } from '@/components/icons/LightIcon'

type NavButtonProps = {
  isActive: boolean
  className?: string
  onClick?: () => void
}

export const NavButton = ({ isActive, className, onClick }: NavButtonProps) => {
  return (
    <button
      className={className}
      onClick={onClick}
      aria-label="メニューを開く"
      style={{
        inlineSize: 'var(--nav-button-size)',
        aspectRatio: '1 / 1',
      }}
    >
      <div style={{ position: 'absolute', inset: 0 }}>
        <MenuIcon isShown={isActive} />
      </div>
      <div style={{ position: 'absolute', inset: 0 }}>
        <CloseIcon isShown={!isActive} />
      </div>
    </button>
  )
}

const MenuIcon = ({ isShown }: { isShown: boolean }) => {
  const [isClicked, setIsClicked] = useState(false)

  useEffect(() => {
    if (!isClicked) setIsClicked(true)
  }, [isShown, isClicked])

  const statusClass = isClicked ? (isShown ? 'shown' : 'hidden') : ''

  return (
    <div
      style={{
        inlineSize: 'var(--nav-button-size)',
        aspectRatio: '1 / 1',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: statusClass === 'shown' ? 'flex-end' : 'flex-start',
        gap: 'calc(var(--sp-small) * 1.5)',
      }}
    >
      {[1, 2].map((i) => (
        <span
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--sp-min)',
            inlineSize: statusClass === 'hidden' ? 0 : '100%',
            transition: 'all 0.3s ease-out',
            opacity: statusClass === 'hidden' ? 0 : 1,
            paddingInlineEnd: i === 2 ? 'var(--sp-small)' : undefined,
            transitionDelay:
              statusClass === 'shown'
                ? i === 1
                  ? '0.2s'
                  : '0.26s'
                : undefined,
          }}
        >
          <span
            style={{
              content: '""',
              display: 'inline-block',
              backgroundColor: 'var(--white)',
              inlineSize: 'calc(var(--bv) / 2)',
              aspectRatio: '1 / 1',
              borderRadius: '50%',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              flex: '1 1 auto',
              blockSize: 'calc(var(--bv) / 2 - 2px)',
              borderRadius: '50%',
              borderTopLeftRadius: 'calc(var(--bv) / 4) 50%',
              borderBottomLeftRadius: 'calc(var(--bv) / 4) 50%',
              backgroundColor: 'var(--white)',
            }}
          />
        </span>
      ))}
    </div>
  )
}

const CloseIcon = ({ isShown }: { isShown: boolean }) => {
  const [isClicked, setIsClicked] = useState(false)

  useEffect(() => {
    if (!isClicked) setIsClicked(true)
  }, [isShown, isClicked])

  const statusClass = isClicked ? (isShown ? 'shown' : 'hidden') : ''

  return (
    <div
      style={{
        inlineSize: 'var(--nav-button-size)',
        aspectRatio: '1 / 1',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 'var(--sp-small)',
      }}
    >
      <LightIcon className={`nav-close-icon ${statusClass}`} />
      <style>{`
        .nav-close-icon {
          inline-size: 100%;
          block-size: 100%;
          transform-origin: center;
          animation-fill-mode: forwards;
          fill: var(--white);
          stroke: var(--white);
          opacity: 0;
        }
        .nav-close-icon.shown {
          opacity: 0;
          animation-name: twinklingStars;
          animation-timing-function: ease-out;
          animation-duration: .3s;
          animation-delay: 0.2s;
          animation-fill-mode: forwards;
        }
        .nav-close-icon.hidden {
          opacity: 1;
          animation-name: navFadeOut;
          animation-timing-function: ease-in;
          animation-duration: 0.3s;
          animation-fill-mode: forwards;
        }
        @keyframes twinklingStars {
          0% { scale: 0; rotate: -45deg; opacity: 0; }
          70% { scale: 1.5; rotate: -45deg; opacity: 1; }
          100% { scale: 1; opacity: 1; rotate: 0deg; }
        }
        @keyframes navFadeOut {
          0% { opacity: 1; scale: 1; rotate: 0deg; }
          100% { opacity: 0; scale: 0; rotate: 45deg; }
        }
      `}</style>
    </div>
  )
}
