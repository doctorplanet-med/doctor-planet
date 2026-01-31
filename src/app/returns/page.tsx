'use client'

import DynamicPage from '@/components/dynamic-page'

const defaultContent = {
  heroTitle: 'Returns & Exchanges',
  heroSubtitle: 'We want you to be completely satisfied with your purchase. Learn about our hassle-free return policy.',
  sections: [
    {
      id: 'policy-overview',
      type: 'text' as const,
      title: 'Return Policy Overview',
      content: `We accept returns within 7 days of delivery for a full refund or exchange. Items must be unworn, unwashed, and in their original condition with all tags attached.

Our goal is to make returns as easy as possible while ensuring the quality our customers expect.`,
    },
    {
      id: 'eligible-items',
      type: 'list' as const,
      title: 'Eligible for Return',
      bgColor: 'light' as const,
      subtitle: 'The following items can be returned:',
      items: [
        { text: 'Unworn items with original tags attached' },
        { text: 'Items in original packaging' },
        { text: 'Items without any alterations' },
        { text: 'Items returned within 7 days of delivery' },
      ],
    },
    {
      id: 'non-eligible',
      type: 'list' as const,
      title: 'Non-Returnable Items',
      subtitle: 'The following items cannot be returned:',
      items: [
        { text: 'Worn or washed items' },
        { text: 'Items without original tags' },
        { text: 'Customized or personalized items' },
        { text: 'Undergarments and socks (for hygiene reasons)' },
        { text: 'Items marked as "Final Sale"' },
      ],
    },
    {
      id: 'process',
      type: 'faq' as const,
      title: 'Return Process',
      bgColor: 'light' as const,
      items: [
        {
          question: 'Step 1: Initiate Return',
          answer: 'Log into your account and go to Order History. Select the item you want to return and click "Request Return". Alternatively, contact our support team.',
        },
        {
          question: 'Step 2: Pack Your Item',
          answer: 'Place the item in its original packaging with all tags attached. Include the return authorization form that will be emailed to you.',
        },
        {
          question: 'Step 3: Ship It Back',
          answer: 'Drop off your package at any courier partner location. We\'ll provide you with a prepaid shipping label for eligible returns.',
        },
        {
          question: 'Step 4: Receive Refund',
          answer: 'Once we receive and inspect your return, we\'ll process your refund within 5-7 business days. You\'ll receive a confirmation email.',
        },
      ],
    },
    {
      id: 'exchanges',
      type: 'text' as const,
      title: 'Exchanges',
      content: `Need a different size or color? We're happy to help!

• Contact our support team with your order number
• Let us know what size/color you need
• We'll arrange the exchange at no extra cost
• Exchanges are subject to availability`,
    },
    {
      id: 'cta',
      type: 'cta' as const,
      title: 'Need Help with a Return?',
      content: 'Our customer service team is ready to assist you',
      buttonText: 'Contact Support',
      buttonLink: '/contact',
      bgColor: 'primary' as const,
    },
  ],
}

export default function ReturnsPage() {
  return <DynamicPage slug="returns" defaultContent={defaultContent} />
}
