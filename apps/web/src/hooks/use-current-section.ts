'use client'

import { create } from 'zustand'

import type { SectionId } from '@/lib/constants/sections'

type CurrentSectionStore = {
  currentSection : SectionId | 'logo'
  updateCurrentSection: (sectionId: SectionId | 'logo') => void
}

export const useCurrentSection = create<CurrentSectionStore>(set => ({
  currentSection      : 'logo',
  updateCurrentSection: sectionId => set({ currentSection: sectionId }),
}))
