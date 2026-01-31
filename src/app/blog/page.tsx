'use client'

import DynamicPage from '@/components/dynamic-page'

const defaultContent = {
  heroTitle: 'Doctor Planet Blog',
  heroSubtitle: 'Tips, guides, and insights for healthcare professionals.',
  sections: [
    {
      id: 'coming-soon',
      type: 'text' as const,
      title: 'Coming Soon!',
      content: `We're working on bringing you valuable content including:

• Tips for choosing the right medical apparel
• Healthcare professional spotlights
• Industry news and trends
• Product care guides
• Style inspiration for medical professionals

Stay tuned for our upcoming articles!`,
    },
    {
      id: 'subscribe',
      type: 'cta' as const,
      title: 'Be the First to Know',
      content: 'Subscribe to our newsletter to get notified when we publish new content',
      buttonText: 'Shop While You Wait',
      buttonLink: '/products',
      bgColor: 'primary' as const,
    },
  ],
}

export default function BlogPage() {
  return <DynamicPage slug="blog" defaultContent={defaultContent} />
}
