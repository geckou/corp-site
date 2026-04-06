export type SectionId =
  | 'logo'
  | 'about'
  | 'services_development'
  | 'services_onechat'
  | 'facts'
  | 'contact'

export type Section = {
  id: SectionId
  heading: string
  component: string
  isShownOnNav: boolean
}

export const sections: Section[] = [
  {
    id: 'about',
    heading: 'ABOUT',
    component: 'About',
    isShownOnNav: false,
  },
  {
    id: 'services_development',
    heading: 'SERVICES',
    component: 'ServicesDevelopment',
    isShownOnNav: true,
  },
  {
    id: 'services_onechat',
    heading: 'SERVICES',
    component: 'ServicesOneChat',
    isShownOnNav: false,
  },
  {
    id: 'facts',
    heading: 'FACTS',
    component: 'Facts',
    isShownOnNav: true,
  },
  {
    id: 'contact',
    heading: 'CONTACT',
    component: 'Contact',
    isShownOnNav: true,
  },
]
