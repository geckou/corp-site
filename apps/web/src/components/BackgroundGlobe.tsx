'use client'

type BackgroundGlobeProps = {
  rotate: number
}

export const BackgroundGlobe = ({ rotate }: BackgroundGlobeProps) => (
  <div className="globe-body">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      className="globe-shadow"
      src="/images/globe_shadow.svg"
      alt=""
      style={{ rotate: `${rotate}deg` }}
    />
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      className="globe-silhouette"
      src="/images/globe_silhouette.svg"
      alt=""
      style={{ rotate: `${rotate}deg` }}
    />
    <style>{`
      .globe-body {
        inline-size: 100%;
        aspect-ratio: 1 / 1;
        position: relative;
      }
      .globe-body > * {
        position: absolute;
        margin: auto;
      }
      .globe-shadow {
        top: 0;
      }
      .globe-silhouette {
        top: var(--sp-small);
      }
    `}</style>
  </div>
)
