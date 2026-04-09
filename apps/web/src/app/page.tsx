'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

import { BackgroundGlobe } from '@/components/BackgroundGlobe'
import { GlobalNav } from '@/components/GlobalNav'
import { LogoArea } from '@/components/LogoArea'
import { SplashScreen } from '@/components/SplashScreen'
import { TopBackground } from '@/components/TopBackground'
import type { TopBackgroundRef } from '@/components/TopBackground'
import { About } from '@/components/sections/About'
import { Contact } from '@/components/sections/Contact'
import { Facts } from '@/components/sections/Facts'
import { ServicesDevelopment } from '@/components/sections/ServicesDevelopment'
import { ServicesOneChat } from '@/components/sections/ServicesOneChat'
import { useCurrentSection } from '@/hooks/use-current-section'
import { sections } from '@/lib/constants/sections'
import type { SectionId } from '@/lib/constants/sections'

const SECTION_COMPONENTS: Record<
  string,
  React.ComponentType<{ isActivated: boolean; heading: string }>
> = {
  About,
  ServicesDevelopment,
  ServicesOneChat,
  Facts,
  Contact,
}

const SCROLL_SPEED_MULTIPLIER = 0.3
const DEBOUNCE_TIME = 100

export default function Home() {
  const { currentSection, updateCurrentSection } = useCurrentSection()
  const containerRef = useRef<HTMLDivElement>(null)
  const sectionAreaRef = useRef<HTMLDivElement>(null)
  const topBackgroundRef = useRef<TopBackgroundRef>(null)
  const currentSectionElementRef = useRef<Element | null>(null)
  const sectionAreaScrollYRef = useRef(0)
  const scrollTimeoutRef = useRef<number>(0)
  const sectionAreaContentsHeightRef = useRef(0)
  const isInSectionAreaRef = useRef(false)

  const [scrollPercentage, setScrollPercentage] = useState(0)
  const [globeRotateValue, setGlobeRotateValue] = useState(0)

  const scrollToSection = useCallback((sectionId: string) => {
    const sectionArea = sectionAreaRef.current
    const container = containerRef.current
    if (!sectionArea || !container) return

    if (sectionId === 'logo') {
      sectionAreaScrollYRef.current = 0
      isInSectionAreaRef.current = false
      container.scrollTo({ top: 0, behavior: 'smooth' })
      sectionArea.scrollTo({ top: 0, behavior: 'smooth' })

      const onScroll = () => {
        if (sectionArea && Math.abs(sectionArea.scrollTop) < 1) {
          sectionArea.removeEventListener('scroll', onScroll)
          topBackgroundRef.current?.resetScroll()
        }
      }
      sectionArea.addEventListener('scroll', onScroll)
    } else {
      // sectionArea が見える位置にコンテナをスクロール
      const windowHeight = window.innerHeight
      isInSectionAreaRef.current = true
      container.scrollTo({ top: windowHeight, behavior: 'smooth' })

      const targetElement = document.querySelectorAll(
        `[data-section-id=${sectionId}]`
      )[0]
      if (targetElement && sectionArea) {
        const sectionAreaRect = sectionArea.getBoundingClientRect()
        const targetRect = targetElement.getBoundingClientRect()
        const sectionTop =
          targetRect.top - sectionAreaRect.top + sectionArea.scrollTop
        sectionArea.scrollTo({ top: sectionTop, behavior: 'smooth' })
        sectionAreaScrollYRef.current = sectionTop
      }
    }
  }, [])

  useEffect(() => {
    const sectionArea = sectionAreaRef.current
    const container = containerRef.current
    if (!sectionArea || !container) return

    const windowHeight = window.innerHeight

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute(
            'data-section-id'
          ) as SectionId
          updateCurrentSection(sectionId)
          currentSectionElementRef.current = entry.target
        } else {
          currentSectionElementRef.current = null
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '0px',
      threshold: 0.8,
    })

    const sectionElements = document.querySelectorAll('[data-section-id]')
    let totalHeight = 0
    sectionElements.forEach((el) => {
      observer.observe(el)
      const id = el.getAttribute('data-section-id')
      if (id !== 'logo' && id !== 'about') totalHeight += el.clientHeight
    })
    sectionAreaContentsHeightRef.current = totalHeight

    // sectionArea の内部スクロール処理
    const handleScroll = () => {
      const scrollY = sectionArea.scrollTop
      const maxScroll = sectionAreaContentsHeightRef.current - windowHeight
      const currentScroll = Math.min(scrollY, maxScroll)
      const rotationFactor = 360 / sectionAreaContentsHeightRef.current

      setScrollPercentage((currentScroll / maxScroll) * 100)
      setGlobeRotateValue(scrollY * rotationFactor)

      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
      scrollTimeoutRef.current = window.setTimeout(() => {
        if (currentSectionElementRef.current) {
          currentSectionElementRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
        }
      }, DEBOUNCE_TIME)
    }

    // 全体のホイールイベント処理
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const deltaY = e.deltaY * SCROLL_SPEED_MULTIPLIER

      if (!isInSectionAreaRef.current) {
        // LogoArea 表示中: 下スクロールで sectionArea に遷移
        if (e.deltaY > 0) {
          isInSectionAreaRef.current = true
          container.scrollTo({ top: windowHeight, behavior: 'smooth' })
        }
      } else {
        // sectionArea 表示中: 内部をスクロール
        if (sectionAreaScrollYRef.current + deltaY <= 0 && deltaY < 0) {
          // sectionArea の先頭を超えて上スクロール → LogoArea に戻る
          sectionAreaScrollYRef.current = 0
          sectionArea.scrollTo(0, 0)
          isInSectionAreaRef.current = false
          container.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
          sectionAreaScrollYRef.current += deltaY
          requestAnimationFrame(() => {
            sectionArea.scrollTo(0, sectionAreaScrollYRef.current)
          })
        }
      }
    }

    sectionArea.addEventListener('scroll', handleScroll)
    sectionAreaScrollYRef.current = sectionArea.scrollTop

    // ホイールイベントを document レベルで捕捉
    document.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      observer.disconnect()
      sectionArea.removeEventListener('scroll', handleScroll)
      document.removeEventListener('wheel', handleWheel)
    }
  }, [updateCurrentSection])

  return (
    <div
      ref={containerRef}
      className="scrollbar-hide h-svh overflow-auto overscroll-none"
    >
      <TopBackground
        ref={topBackgroundRef}
        className="fixed left-0 top-0"
        scrollPercentage={scrollPercentage}
      />
      <LogoArea data-section-id="logo" onScrollTo={scrollToSection} />
      <div
        ref={sectionAreaRef}
        className="scrollbar-hide h-svh overflow-auto overscroll-none"
      >
        {sections.map((section) => {
          const Component = SECTION_COMPONENTS[section.component]
          return Component ? (
            <div key={section.id} data-section-id={section.id}>
              <Component
                isActivated={section.id === currentSection}
                heading={section.heading}
              />
            </div>
          ) : null
        })}
        <div className="globe-wrap max-w-contents h-globe-h z-contents pointer-events-none sticky bottom-0 mx-auto w-full overflow-hidden">
          <BackgroundGlobe rotate={globeRotateValue} />
        </div>
        <GlobalNav onScrollTo={scrollToSection} />
        <SplashScreen />
      </div>
      <style>{`
        .globe-wrap > * { position: absolute; top: 0; }
      `}</style>
    </div>
  )
}
