import DynamicPage from '@/components/dynamic-page'

export default function SizeGuidePage() {
  const defaultContent = {
    heroTitle: 'Size Guide',
    heroSubtitle: 'Find your perfect fit with our comprehensive size charts and measurement guides',
    sections: []
  }

  return <DynamicPage slug="size-guide" defaultContent={defaultContent} />
}
