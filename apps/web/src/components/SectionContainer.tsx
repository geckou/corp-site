import type { ReactNode } from 'react'

type SectionContainerProps = {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  'data-section-id'?: string
}

export const SectionContainer = ({
  children,
  className,
  style,
  'data-section-id': dataSectionId,
}: SectionContainerProps) => (
  <section
    className={`w-full h-svh relative ${className ?? ''}`}
    style={style}
    data-section-id={dataSectionId}
  >
    {children}
  </section>
)
