import type { ReactNode } from 'react'

type SectionContainerProps = {
  children: ReactNode
  className?: string
  'data-section-id'?: string
}

export const SectionContainer = ({ children, className, 'data-section-id': dataSectionId }: SectionContainerProps) => (
  <section
    className={className}
    data-section-id={dataSectionId}
    style={{
      inlineSize: '100%',
      blockSize : '100svh',
      position  : 'relative',
    }}
  >
    {children}
  </section>
)
