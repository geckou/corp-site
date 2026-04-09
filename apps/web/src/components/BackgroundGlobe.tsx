'use client'

type BackgroundGlobeProps = {
  rotate: number
}

export const BackgroundGlobe = ({ rotate }: BackgroundGlobeProps) => (
  <div className="relative aspect-square w-full">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      className="absolute top-0 m-auto"
      src="/images/globe_shadow.svg"
      alt=""
      style={{ rotate: `${rotate}deg` }}
    />
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      className="absolute m-auto"
      src="/images/globe_silhouette.svg"
      alt=""
      style={{ rotate: `${rotate}deg`, top: 'var(--sp-small)' }}
    />
  </div>
)
