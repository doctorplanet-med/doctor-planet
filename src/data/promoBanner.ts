/**
 * Config for the 3rd section on the home page: a single centered clickable promo image.
 * Update imageUrl, linkUrl, and alt to match your campaign.
 */

export interface PromoBannerConfig {
  imageUrl: string
  linkUrl: string
  alt: string
  /** Open link in new tab (default true) */
  openInNewTab?: boolean
}

export const promoBanner: PromoBannerConfig = {
  // Replace with your image: put file in public/banners/promo-banner.webp or use full URL (e.g. CDN)
  imageUrl: 'https://placehold.co/1200x400/f5f5f5/666?text=Promo+Banner',
  linkUrl: '/deals',
  alt: 'Doctor Planet - Special offers',
  openInNewTab: false,
}
