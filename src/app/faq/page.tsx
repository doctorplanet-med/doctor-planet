'use client'

import DynamicPage from '@/components/dynamic-page'

const defaultContent = {
  heroTitle: 'Frequently Asked Questions',
  heroSubtitle: 'Find answers to common questions about our products, shipping, and services.',
  sections: [
    {
      id: 'faq-orders',
      type: 'faq' as const,
      title: 'Orders & Shipping',
      items: [
        {
          question: 'How long does shipping take?',
          answer: 'Standard shipping within Pakistan takes 3-5 business days. Express shipping is available for 1-2 day delivery in major cities.',
        },
        {
          question: 'Do you offer free shipping?',
          answer: 'Yes! We offer free standard shipping on all orders above PKR 5,000.',
        },
        {
          question: 'Can I track my order?',
          answer: 'Yes, once your order ships, you will receive a tracking number via email and SMS.',
        },
        {
          question: 'What payment methods do you accept?',
          answer: 'We currently accept Cash on Delivery (COD) for all orders within Pakistan.',
        },
      ],
    },
    {
      id: 'faq-products',
      type: 'faq' as const,
      title: 'Products & Sizing',
      bgColor: 'light' as const,
      items: [
        {
          question: 'How do I find my size?',
          answer: 'Check our Size Guide page for detailed measurements. If you\'re between sizes, we recommend sizing up for a more comfortable fit.',
        },
        {
          question: 'Are your scrubs suitable for long shifts?',
          answer: 'Absolutely! Our scrubs are designed with breathable, stretch fabric that keeps you comfortable during 12+ hour shifts.',
        },
        {
          question: 'Do your shoes provide good arch support?',
          answer: 'Yes, all our medical shoes feature ergonomic insoles and arch support designed for healthcare professionals who stand for extended periods.',
        },
      ],
    },
    {
      id: 'faq-returns',
      type: 'faq' as const,
      title: 'Returns & Exchanges',
      items: [
        {
          question: 'What is your return policy?',
          answer: 'We accept returns within 7 days of delivery for unworn items with original tags. See our Returns page for full details.',
        },
        {
          question: 'How do I exchange an item?',
          answer: 'Contact our support team with your order number and desired exchange. We\'ll guide you through the process.',
        },
        {
          question: 'When will I receive my refund?',
          answer: 'Refunds are processed within 5-7 business days after we receive and inspect the returned item.',
        },
      ],
    },
    {
      id: 'cta',
      type: 'cta' as const,
      title: 'Still have questions?',
      content: 'Our support team is here to help you with any questions.',
      buttonText: 'Contact Us',
      buttonLink: '/contact',
      bgColor: 'primary' as const,
    },
  ],
}

export default function FAQPage() {
  return <DynamicPage slug="faq" defaultContent={defaultContent} />
}
