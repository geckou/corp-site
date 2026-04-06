'use client'

import { useState, useEffect } from 'react'

import { SectionContainer } from '@/components/SectionContainer'
import { SectionHeading } from '@/components/SectionHeading'

type FactsProps = {
  isActivated: boolean
  heading : string
}

const FACTS = [
  { team: '商号', descriptions: ['合同会社Geckou'] },
  { team: '設立', descriptions: ['2019年12月25日'] },
  { team: '代表役員', descriptions: ['野島将吾'] },
  { team: '資本金', descriptions: ['100万円'] },
  { team: '住所', descriptions: ['〒180-0006', '東京都武蔵野市中町2丁目8番14号', 'WILL吉祥寺302'] },
  { team: '事業内容', descriptions: ['Webデザイン', 'Web開発の受託', 'Webサービス開発'] },
]

const ANIMATION_DURATION = 700

export const Facts = ({ isActivated, heading }: FactsProps) => {
  const [isHidden, setIsHidden] = useState(false)

  useEffect(() => {
    if (!isActivated) {
      setIsHidden(true)
      const timer = setTimeout(() => setIsHidden(false), ANIMATION_DURATION)
      return () => clearTimeout(timer)
    }
  }, [isActivated])

  return (
    <SectionContainer className="facts-container">
      <dl className="facts-list">
        {FACTS.map(fact => (
          <div key={fact.team} className="facts-list-item">
            <dt>{fact.team}</dt>
            <dd>
              {fact.descriptions.map(desc => (
                <div key={desc}>{desc}</div>
              ))}
            </dd>
          </div>
        ))}
      </dl>
      <div
        className={`facts-rays-wrap ${isActivated ? 'active' : ''} ${isHidden ? 'hidden' : ''}`}
        style={{ '--ray-animation-duration': `${ANIMATION_DURATION}ms` } as React.CSSProperties}
      >
        <div className="facts-ray" />
      </div>
      <SectionHeading heading={heading} isShown={isActivated} />
      <style>{`
        .facts-container {
          display: flex;
          justify-content: flex-end;
          align-items: flex-end;
          padding: var(--sp-max);
        }
        @media (max-width: 576px) {
          .facts-container { padding: var(--sp-large); }
        }
        .facts-list-item { margin-block-end: var(--sp-large); }
        .facts-list-item dt,
        .facts-list-item dd {
          animation-name: shown;
          animation-duration: .8s;
          animation-timing-function: ease-in;
          animation-fill-mode: forwards;
          opacity: 0;
          text-shadow: 0 0 0 var(--corp-color);
        }
        .facts-list-item dt {
          margin-block-end: var(--sp-small);
          font-size: var(--fs-small);
        }
        .facts-list-item dd { font-weight: bold; }
        .facts-list {
          display: flex;
          flex-direction: column;
          text-align: right;
          z-index: var(--z-index-contents);
          line-height: 1.7;
        }
        .facts-rays-wrap {
          --ray-skew: -36deg;
          display: block;
          inline-size: 100%;
          block-size: 0%;
          position: fixed;
          top: 0;
          right: 0;
          overflow: hidden;
          opacity: 0;
          pointer-events: none;
          z-index: calc(var(--z-index-contents) + 1);
          mix-blend-mode: hard-light;
          transition: all var(--ray-animation-duration);
        }
        .facts-rays-wrap.active { block-size: 100%; opacity: 1; filter: blur(0); }
        .facts-rays-wrap.hidden { block-size: 100%; opacity: 0; filter: blur(300px); }
        .facts-rays-wrap::before,
        .facts-rays-wrap::after {
          content: '';
          block-size: 100vh;
          background-color: var(--white);
          opacity: .1;
          transform: skew(var(--ray-skew));
          position: absolute;
          top: 0;
        }
        .facts-rays-wrap::before {
          inline-size: calc(var(--bv) * 16);
          background-color: transparent;
          background-image: linear-gradient(0deg, var(--white), var(--white) 38%, transparent 38%);
          right: calc(var(--bv) * 30);
        }
        .facts-rays-wrap::after {
          inline-size: calc(var(--bv) * 10);
          right: calc(var(--sp-large) * -4);
        }
        .facts-ray {
          block-size: 100vh;
          background-color: var(--white);
          opacity: .1;
          transform: skew(var(--ray-skew));
          position: absolute;
          top: 0;
          inline-size: calc(var(--bv) * 50);
          right: calc(var(--sp-larger) * -1);
        }
      `}</style>
    </SectionContainer>
  )
}
