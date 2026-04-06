import type { ReactNode } from 'react'

import { LinkButton } from '@/components/LinkButton'

type ServiceItemProps = {
  headingAlign?: 'left' | 'right'
  linkButton?: { text: string; url: string } | null
  heading: ReactNode
  description: ReactNode
}

export const ServiceItem = ({
  headingAlign = 'left',
  linkButton = null,
  heading,
  description,
}: ServiceItemProps) => (
  <div style={{ zIndex: 'var(--z-index-contents)' }}>
    <h3
      className="service-item-heading"
      style={
        {
          '--heading-align': headingAlign,
          marginBlockEnd: 'var(--sp-large)',
          paddingInline: 'var(--sp-large)',
          fontSize: 'var(--fs-service-heading)',
          textShadow: '0 var(--sp-small) 0 var(--main-color)',
          textAlign: headingAlign,
          lineHeight: 'var(--line-height-tight)',
        } as React.CSSProperties
      }
    >
      {heading}
    </h3>
    <div className="service-item-description">
      <p style={{ position: 'relative' }}>{description}</p>
      {linkButton && (
        <LinkButton url={linkButton.url} className="service-item-link">
          {linkButton.text}
        </LinkButton>
      )}
    </div>
    <style>{`
      @media (max-width: 576px) {
        .service-item-heading { padding-inline: var(--sp-medium) !important; }
      }
      .service-item-description {
        --text-bg: 0, 8, 26;
        max-inline-size: calc(var(--contents-max-width) * .68);
        padding: var(--sp-large);
        position: relative;
      }
      .service-item-description::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        inline-size: 100%;
        block-size: 100%;
        background: linear-gradient(90deg, rgba(var(--text-bg), 0) 0%, rgba(var(--text-bg), .5) var(--sp-larger), rgba(var(--text-bg), .5) calc(100% - var(--sp-larger)), rgba(var(--text-bg), 0) 100%);
        mix-blend-mode: multiply;
      }
      .service-item-description span { display: inline-block; }
      .service-item-link {
        position: absolute;
        right: var(--sp-large);
        bottom: calc(-1 * var(--sp-large));
      }
      @media (max-width: 576px) {
        .service-item-description { padding: var(--sp-large) var(--sp-medium); }
      }
    `}</style>
  </div>
)
