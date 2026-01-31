'use client'

import DynamicPage from '@/components/dynamic-page'

const defaultContent = {
  heroTitle: 'Size Guide',
  heroSubtitle: 'Find your perfect fit with our comprehensive size charts and measurement guides.',
  sections: [
    {
      id: 'how-to-measure',
      type: 'text' as const,
      title: 'How to Measure',
      content: `For the most accurate fit, take your measurements while wearing lightweight clothing:

**Chest**: Measure around the fullest part of your chest, keeping the tape horizontal.

**Waist**: Measure around your natural waistline, keeping the tape comfortably loose.

**Hips**: Measure around the fullest part of your hips.

**Inseam**: Measure from the crotch to the bottom of your ankle.

If you're between sizes, we recommend sizing up for a more comfortable fit during long shifts.`,
    },
    {
      id: 'scrubs-tops',
      type: 'cards' as const,
      title: 'Scrub Tops Size Chart',
      bgColor: 'light' as const,
      subtitle: 'Chest measurements in inches',
      items: [
        { title: 'XS', description: 'Chest: 32-34"' },
        { title: 'S', description: 'Chest: 35-37"' },
        { title: 'M', description: 'Chest: 38-40"' },
        { title: 'L', description: 'Chest: 41-43"' },
        { title: 'XL', description: 'Chest: 44-46"' },
        { title: '2XL', description: 'Chest: 47-49"' },
      ],
    },
    {
      id: 'scrubs-pants',
      type: 'cards' as const,
      title: 'Scrub Pants Size Chart',
      subtitle: 'Waist measurements in inches',
      items: [
        { title: 'XS', description: 'Waist: 26-28"' },
        { title: 'S', description: 'Waist: 29-31"' },
        { title: 'M', description: 'Waist: 32-34"' },
        { title: 'L', description: 'Waist: 35-37"' },
        { title: 'XL', description: 'Waist: 38-40"' },
        { title: '2XL', description: 'Waist: 41-43"' },
      ],
    },
    {
      id: 'shoes',
      type: 'cards' as const,
      title: 'Shoe Size Chart',
      bgColor: 'light' as const,
      subtitle: 'Pakistan/EU sizes with foot length in cm',
      items: [
        { title: 'EU 36', description: 'Foot: 22.5 cm' },
        { title: 'EU 37', description: 'Foot: 23 cm' },
        { title: 'EU 38', description: 'Foot: 23.5 cm' },
        { title: 'EU 39', description: 'Foot: 24 cm' },
        { title: 'EU 40', description: 'Foot: 24.5 cm' },
        { title: 'EU 41', description: 'Foot: 25 cm' },
        { title: 'EU 42', description: 'Foot: 25.5 cm' },
        { title: 'EU 43', description: 'Foot: 26 cm' },
        { title: 'EU 44', description: 'Foot: 26.5 cm' },
      ],
    },
    {
      id: 'tips',
      type: 'list' as const,
      title: 'Fitting Tips',
      items: [
        { text: 'Scrubs should allow for comfortable movement - not too tight or too loose' },
        { text: 'Consider your work activities when choosing fit' },
        { text: 'Medical shoes should have about 0.5 cm space at the toe' },
        { text: 'Try on shoes at the end of the day when feet are largest' },
        { text: 'Check each product page for specific fit recommendations' },
      ],
    },
    {
      id: 'cta',
      type: 'cta' as const,
      title: 'Still Unsure About Your Size?',
      content: 'Our team is happy to help you find the perfect fit',
      buttonText: 'Contact Us',
      buttonLink: '/contact',
      bgColor: 'primary' as const,
    },
  ],
}

export default function SizeGuidePage() {
  return <DynamicPage slug="size-guide" defaultContent={defaultContent} />
}
