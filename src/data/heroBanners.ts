/**
 * Fallback hero banner data when no banners exist in the database.
 * To manage banners from Admin: go to Admin → Settings → Hero Banners.
 * You can add, remove, and reorder banners there.
 *
 * To use the database for hero banners, run:  npm run db:push
 * (This creates the HeroBanner table. Until then, the home page uses this file as fallback.)
 */

export interface HeroBannerImages {
  mobile: string
  tablet?: string
  desktop: string
}

export interface HeroBannerItem {
  id: string
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  /** Tailwind gradient classes e.g. "from-[#1a1a2e] via-[#16213e] to-[#0f3460]" */
  backgroundGradient?: string
  /** Tailwind solid color class e.g. "bg-[#0f3460]" - used when backgroundGradient is not set */
  backgroundColor?: string
  images: HeroBannerImages
}

export const heroBanners: HeroBannerItem[] = [
  {
    id: '1',
    title: 'Explore More at Doctor Planet',
    subtitle: 'Premium medical wear and equipment for healthcare professionals. Quality you can trust.',
    ctaText: 'Shop Now',
    ctaLink: '/products',
    backgroundGradient: 'from-[#4c1d95] via-[#6d28d9] to-[#a78bfa]',
    images: {
      mobile: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800',
      tablet: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1200',
      desktop: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1600',
    },
  },
  {
    id: '2',
    title: 'Comfortable Medical Shoes',
    subtitle: 'Ergonomic design with superior arch support. Perfect for healthcare heroes.',
    ctaText: 'Shop Shoes',
    ctaLink: '/products?category=medical-shoes',
    backgroundGradient: 'from-[#134e5e] via-[#71b280] to-[#134e5e]',
    images: {
      mobile: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800',
      desktop: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=1600',
    },
  },
  {
    id: '3',
    title: 'Professional Lab Coats',
    subtitle: 'Premium quality coats with modern fit. Stain-resistant and durable.',
    ctaText: 'Shop Now',
    ctaLink: '/products?category=medical-equipment',
    backgroundGradient: 'from-[#2c3e50] via-[#4ca1af] to-[#2c3e50]',
    images: {
      mobile: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800',
      desktop: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=1600',
    },
  },
]
