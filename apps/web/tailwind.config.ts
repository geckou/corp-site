import type { Config } from 'tailwindcss'
import { colors, fontFamily, borderRadius } from '@geckou/shared/theme'

const config: Config = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ...colors,
        site: {
          white: 'var(--white)',
          black: 'var(--black)',
          'light-black': 'var(--light-black)',
          blue: 'var(--blue)',
          'dark-blue': 'var(--dark-blue)',
          gray: 'var(--gray)',
        },
        base: 'var(--base-color)',
        main: 'var(--main-color)',
        text: 'var(--text-color)',
        link: 'var(--link-color)',
        globe: 'var(--globe-color)',
        light: 'var(--light-color)',
        corp: 'var(--corp-color)',
        'corp-black': 'var(--corp-black)',
      },
      fontFamily: {
        ...fontFamily,
        ja: ['"Zen Kaku Gothic Antique"', 'sans-serif'],
        en: ['var(--font-family-en)'],
      },
      fontSize: {
        'fs-min': 'var(--fs-min)',
        'fs-smaller': 'var(--fs-smaller)',
        'fs-small': 'var(--fs-small)',
        'fs-medium': 'var(--fs-medium)',
        'fs-large': 'var(--fs-large)',
        'fs-larger': 'var(--fs-larger)',
        'fs-max': 'var(--fs-max)',
        'fs-form': 'var(--fs-form)',
        'fs-service-heading': 'var(--fs-service-heading)',
        'fs-nav': 'var(--fs-nav)',
        'fs-copyright': 'var(--fs-copyright)',
      },
      spacing: {
        'sp-min': 'var(--sp-min)',
        'sp-small': 'var(--sp-small)',
        'sp-medium': 'var(--sp-medium)',
        'sp-large': 'var(--sp-large)',
        'sp-larger': 'var(--sp-larger)',
        'sp-max': 'var(--sp-max)',
        bv: 'var(--bv)',
        'nav-button': 'var(--nav-button-size)',
        'button-h': 'var(--button-height)',
        'button-w': 'var(--button-width)',
        'globe-h': 'var(--globe-height)',
        'icon-md': 'var(--icon-medium)',
        'icon-sm': 'var(--icon-small)',
        'header-h': 'var(--global-header-height)',
      },
      maxWidth: {
        contents: 'var(--contents-max-width)',
      },
      lineHeight: {
        tight: 'var(--line-height-tight)',
        narrow: 'var(--line-height-narrow)',
        normal: 'var(--line-height-normal)',
      },
      letterSpacing: {
        normal: 'var(--letter-spacing-normal)',
        narrow: 'var(--letter-spacing-narrow)',
      },
      zIndex: {
        bg: 'var(--z-index-bg)',
        contents: 'var(--z-index-contents)',
        header: 'var(--z-index-header)',
        nav: 'var(--z-index-nav)',
        tooltip: 'var(--z-index-tooltip)',
        overlay: 'var(--z-index-overlay)',
        max: 'var(--z-index-max)',
      },
      borderRadius,
    },
  },
}

export default config
