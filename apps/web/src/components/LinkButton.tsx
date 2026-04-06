import type { ReactNode } from 'react'

type LinkButtonProps = {
  url : string
  children : ReactNode
  className?: string
}

export const LinkButton = ({ url, children, className }: LinkButtonProps) => (
  <a
    className={`link-button ${className ?? ''}`}
    href={url}
    target={url.startsWith('http') ? '_blank' : '_self'}
    rel={url.startsWith('http') ? 'noopener noreferrer' : undefined}
  >
    <div className="link-button-bg" />
    <span className="link-button-text">{children}</span>
    <style>{`
      .link-button {
        display: inline-block;
        position: relative;
        padding: var(--sp-small) var(--sp-larger);
        text-decoration: none;
      }
      .link-button:hover .link-button-bg::after {
        rotate: 180deg;
        mix-blend-mode: screen;
      }
      .link-button-text {
        position: relative;
        color: var(--text-color);
        font-family: var(--font-family-en);
        font-size: var(--fs-larger);
      }
      .link-button-bg {
        inline-size: 100%;
        block-size: 100%;
        background-color: var(--main-color);
        position: absolute;
        inset: 0;
        transform: skew(20deg);
        transform-origin: center;
        pointer-events: none;
        overflow: hidden;
      }
      .link-button-bg::after {
        content: '';
        inline-size: 100%;
        block-size: 100%;
        background-color: var(--main-color);
        mix-blend-mode: multiply;
        position: absolute;
        inset: 0;
        rotate: -5deg;
        transition: all .4s ease-out;
      }
    `}</style>
  </a>
)
