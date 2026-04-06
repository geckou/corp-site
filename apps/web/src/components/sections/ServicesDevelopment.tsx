'use client'

import { SearchLight } from '@/components/SearchLight'
import { SectionContainer } from '@/components/SectionContainer'
import { SectionHeading } from '@/components/SectionHeading'
import { ServiceItem } from '@/components/ServiceItem'
import { useCurrentSection } from '@/hooks/use-current-section'
import { useMediaDevice } from '@/hooks/use-media-device'

type ServicesDevelopmentProps = {
  isActivated: boolean
  heading : string
}

export const ServicesDevelopment = ({ isActivated, heading }: ServicesDevelopmentProps) => {
  const currentSection = useCurrentSection(s => s.currentSection)
  const mediaDevice = useMediaDevice()
  const isShownHeading = currentSection.split('_')[0] === 'services'

  const angleValues = mediaDevice === 'mobile'
    ? { left: { angleValue: -30, topEdgeWidth: 120 }, right: { angleValue: 10, topEdgeWidth: 500 } }
    : { left: { angleValue: -55, topEdgeWidth: 500 }, right: { angleValue: 15, topEdgeWidth: 1000 } }

  const bgImageSrc = mediaDevice === 'mobile' ? '/images/development_mobile.webp' : '/images/development.webp'

  return (
    <SectionContainer className="services-development-container">
      <SearchLight
        isActive={isActivated}
        angleValue={angleValues.left.angleValue}
        topEdgeWidth={angleValues.left.topEdgeWidth}
        bgImageSrc={bgImageSrc}
      />
      <SearchLight
        isActive={isActivated}
        angleValue={angleValues.right.angleValue}
        topEdgeWidth={angleValues.right.topEdgeWidth}
        bgImageSrc={bgImageSrc}
      />
      <ServiceItem
        heading={<>WEB DESIGN<br />& DEVELOPMENT</>}
        description={
          <>
            デザインから開発まで一貫して行なっています。
            <br />
            <span>Webアプリ、ECサイトなどアイディアの実現や、既存システムを改良した業務の効率化など、</span>
            <span>デザイン段階から完成までお任せいただくことが可能です。</span>
            <span>バックエンドのシステムには、提携企業である株式会社STOVE開発のノーコードツール</span>
            <span>&quot;CORE&quot;を使用し、迅速な開発を可能としています。</span>
          </>
        }
      />
      <SectionHeading heading={heading} isShown={isShownHeading} />
      <style>{`
        .services-development-container {
          display: flex;
          align-items: center;
        }
      `}</style>
    </SectionContainer>
  )
}
