'use client'

import { useState, useEffect } from 'react'

type MediaDevice = 'mobile' | 'tablet' | 'desktop'

export const useMediaDevice = (): MediaDevice => {
  const [device, setDevice] = useState<MediaDevice>('desktop')

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth
      if (width <= 576) setDevice('mobile')
      else if (width < 992) setDevice('tablet')
      else setDevice('desktop')
    }

    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return device
}
