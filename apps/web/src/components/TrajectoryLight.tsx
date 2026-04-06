'use client'

import { SectionContainer } from '@/components/SectionContainer'

type TrajectoryLightProps = {
  isActivated: boolean
}

export const TrajectoryLight = ({ isActivated }: TrajectoryLightProps) => (
  <SectionContainer className="trajectory-container">
    {[0, 1, 2].map(i => (
      <div
        key={i}
        className={`trajectory-mask-wrap ${isActivated ? 'active' : 'hidden'}`}
        style={{ transitionDelay: `${i * 0.1}s` }}
      >
        <figure className={`trajectory-mask trajectory-mask-${i}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/services_bg.png" alt="" />
        </figure>
      </div>
    ))}
    <style>{`
      .trajectory-container { inline-size: 100%; position: relative; }
      .trajectory-mask-wrap {
        --trajectory-width: 100vw;
        --trajectory-right: 0vw;
        inline-size: 0;
        block-size: 100svh;
        position: fixed;
        bottom: 0;
        right: var(--trajectory-right);
        left: auto;
        overflow: hidden;
        opacity: 0;
        mix-blend-mode: overlay;
        transition: inline-size 1.5s ease-in-out, opacity 2s ease-in-out;
        pointer-events: none;
      }
      .trajectory-mask-wrap:nth-of-type(2) { --trajectory-right: 5vw; }
      .trajectory-mask-wrap:nth-of-type(3) { --trajectory-right: 10vw; }
      .trajectory-mask-wrap.active {
        inline-size: calc(var(--trajectory-width) - var(--trajectory-right));
        opacity: 1;
      }
      .trajectory-mask-wrap.hidden { inline-size: 0; opacity: 0; left: 0; right: auto; }
      .trajectory-mask {
        inline-size: calc(var(--trajectory-width) - var(--trajectory-right));
        position: absolute;
        right: 0;
        bottom: 0;
        mask-repeat: no-repeat;
        mask-size: 100% auto;
        mask-position: right bottom;
        margin: 0;
      }
      .trajectory-mask-0 { mask-image: url('/images/top_light.svg'); }
      .trajectory-mask-1 { mask-image: url('/images/middle_light.svg'); }
      .trajectory-mask-2 { mask-image: url('/images/bottom_light.svg'); }
    `}</style>
  </SectionContainer>
)
