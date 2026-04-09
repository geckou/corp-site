'use client'

import { SearchLight } from '@/components/SearchLight'
import { SectionContainer } from '@/components/SectionContainer'
import { SectionHeading } from '@/components/SectionHeading'
import { ServiceItem } from '@/components/ServiceItem'
import { useCurrentSection } from '@/hooks/use-current-section'
import { useMediaDevice } from '@/hooks/use-media-device'

type ServicesOneChatProps = {
  isActivated: boolean
  heading: string
}

export const ServicesOneChat = ({
  isActivated,
  heading,
}: ServicesOneChatProps) => {
  const currentSection = useCurrentSection((s) => s.currentSection)
  const mediaDevice = useMediaDevice()
  const isShownHeading = currentSection.split('_')[0] === 'services'

  const angleValues =
    mediaDevice === 'mobile'
      ? {
          left: { angleValue: -40, topEdgeWidth: 500 },
          right: { angleValue: 5, topEdgeWidth: 120 },
        }
      : {
          left: { angleValue: -60, topEdgeWidth: 1000 },
          right: { angleValue: 20, topEdgeWidth: 500 },
        }

  const bgImageSrc =
    mediaDevice === 'mobile'
      ? '/images/one_chat_mobile.webp'
      : '/images/one_chat.webp'

  return (
    <SectionContainer className="flex items-center justify-end">
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
        headingAlign="right"
        linkButton={{ text: 'TO DETAILS', url: 'https://one-chat.net/' }}
        heading={<>CHAT APPLICATION</>}
        description={
          <>
            <span>
              ワンチャットは、当社が開発した匿名で利用できるチャットアプリです。
            </span>
            <span>
              アカウント登録なしで、そのまま会話を始められる手軽さが特長です。
            </span>
            <span>会話のログは残らないため、安心してご利用いただけます。</span>
            <span>
              柔らかな印象のデザインを採用し、Nuxt・Firebase・Capacitor
              により快適に動作するよう設計されています。
            </span>
          </>
        }
      />
      <SectionHeading heading={heading} isShown={isShownHeading} />
    </SectionContainer>
  )
}
