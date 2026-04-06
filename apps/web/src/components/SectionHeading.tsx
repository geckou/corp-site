'use client'

import { useEffect, useId, useRef } from 'react'

import { useCurrentSection } from '@/hooks/use-current-section'

type SectionHeadingProps = {
  heading: string
  isShown?: boolean
}

export const SectionHeading = ({ heading, isShown }: SectionHeadingProps) => {
  const currentSection = useCurrentSection(s => s.currentSection)
  const prevSectionRef = useRef(currentSection)
  const prevIsShownRef = useRef(isShown)
  const slideInRef = useRef<SVGAnimateElement>(null)
  const slideOutRef = useRef<SVGAnimateElement>(null)

  const currentSectionBase = currentSection.split('_')[0]
  const viewBoxWidth = 585
  const viewBoxHeight = 605

  const centerX = viewBoxWidth / 2
  const centerY = viewBoxHeight / 2
  const radius = Math.min(viewBoxWidth, viewBoxHeight) / 2 * 0.9
  const startAngle = 180
  const endAngle = 0
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

  const svgData = `M ${centerX + radius * Math.cos(Math.PI * startAngle / 180)}, ${centerY + radius * Math.sin(Math.PI * startAngle / 180)} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${centerX + radius * Math.cos(Math.PI * endAngle / 180)} ${centerY + radius * Math.sin(Math.PI * endAngle / 180)}`

  // 一意な ID を生成（同じ heading 名の重複を避ける）
  const uniqueId = useId()
  const pathId = `heading-path-${heading}-${uniqueId.replace(/:/g, '')}`

  useEffect(() => {
    const prevBase = prevSectionRef.current.split('_')[0]

    if (isShown && currentSectionBase !== prevBase) {
      slideInRef.current?.beginElement()
    } else if (!isShown && isShown !== prevIsShownRef.current && currentSectionBase !== prevBase) {
      slideOutRef.current?.beginElement()
    }

    prevSectionRef.current = currentSection
    prevIsShownRef.current = isShown
  }, [currentSectionBase, isShown, currentSection])

  return (
    <h2 className="section-heading">
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      >
        <path
          id={pathId}
          stroke="none"
          fill="none"
          d={svgData}
        />
        <text className="section-heading-text">
          <textPath
            href={`#${pathId}`}
            startOffset="80%"
          >
            {heading}
            <animate
              ref={slideInRef}
              attributeName="startOffset"
              from="80%"
              to="35%"
              dur=".2s"
              begin="indefinite"
              fill="freeze"
            />
            <animate
              ref={slideOutRef}
              attributeName="startOffset"
              from="35%"
              to="0%"
              dur=".2s"
              begin="indefinite"
              fill="freeze"
            />
          </textPath>
        </text>
      </svg>
      <style>{`
        .section-heading {
          inline-size: 100%;
          max-inline-size: var(--contents-max-width);
          block-size: var(--globe-height);
          margin: auto;
          position: fixed;
          bottom: calc(var(--globe-height) * -0.35);
          right: 0;
          left: 0;
          z-index: var(--z-index-nav);
          pointer-events: none;
        }
        .section-heading-text {
          inline-size: 100%;
          font-size: 32px;
          font-family: var(--font-family-en);
          font-weight: bold;
          fill: var(--main-color);
          text-anchor: start;
        }
      `}</style>
    </h2>
  )
}
