'use client'

import DynamicPage from '@/components/dynamic-page'

const defaultContent = {
  heroTitle: 'Shipping Information',
  heroSubtitle: 'Fast and reliable delivery across Pakistan. Learn about our shipping options and policies.',
  sections: [
    {
      id: 'shipping-options',
      type: 'cards' as const,
      title: 'Shipping Options',
      subtitle: 'Choose the delivery option that works best for you',
      items: [
        {
          title: 'Standard Shipping',
          description: 'Free on orders over PKR 5,000. Delivery within 3-5 business days to all cities in Pakistan.',
        },
        {
          title: 'Express Shipping',
          description: 'PKR 300 flat rate. 1-2 business day delivery to major cities including Karachi, Lahore, and Islamabad.',
        },
        {
          title: 'Same Day Delivery',
          description: 'Available in Sargodha for orders placed before 12 PM. Additional PKR 250 fee applies.',
        },
      ],
    },
    {
      id: 'delivery-times',
      type: 'text' as const,
      title: 'Delivery Timeframes',
      bgColor: 'light' as const,
      content: `Our delivery times vary by location:

• Major Cities (Sargodha, Lahore, Islamabad, Rawalpindi): 1-3 business days
• Other Urban Areas: 3-5 business days  
• Remote Areas: 5-7 business days

Please note that delivery times may be affected during peak seasons, holidays, or extreme weather conditions.`,
    },
    {
      id: 'tracking',
      type: 'text' as const,
      title: 'Order Tracking',
      content: `Once your order ships, you'll receive:

• Email confirmation with tracking number
• SMS notification with delivery updates
• Real-time tracking through our website

You can track your order status anytime by logging into your account or using the tracking number provided.`,
    },
    {
      id: 'policies',
      type: 'list' as const,
      title: 'Shipping Policies',
      bgColor: 'light' as const,
      items: [
        { text: 'Orders are processed within 24 hours on business days' },
        { text: 'Signature may be required for high-value orders' },
        { text: 'We ship to all areas in Pakistan' },
        { text: 'PO Box addresses are not supported' },
        { text: 'Multiple items may be shipped separately' },
        { text: 'Free shipping applies to standard delivery only' },
      ],
    },
    {
      id: 'cta',
      type: 'cta' as const,
      title: 'Ready to Shop?',
      content: 'Browse our collection of premium medical apparel',
      buttonText: 'Shop Now',
      buttonLink: '/products',
      bgColor: 'dark' as const,
    },
  ],
}

export default function ShippingPage() {
  return <DynamicPage slug="shipping" defaultContent={defaultContent} />
}
