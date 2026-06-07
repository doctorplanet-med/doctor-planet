'use client'

import DynamicPage from '@/components/dynamic-page'

const defaultContent = {
  heroTitle: 'Careers at Doctor Planet',
  heroSubtitle: 'Join our team and help us revolutionize medical apparel in Pakistan.',
  sections: [
    {
      id: 'intro',
      type: 'text' as const,
      title: 'Why Work With Us?',
      content: `At Doctor Planet, we're building something special. We're on a mission to provide healthcare professionals with the best medical apparel and equipment they deserve.

We're looking for passionate individuals who share our commitment to quality, innovation, and customer satisfaction. Whether you're a designer, marketer, operations specialist, or customer service champion - there's a place for you here.`,
    },
    {
      id: 'benefits',
      type: 'cards' as const,
      title: 'What We Offer',
      bgColor: 'light' as const,
      items: [
        {
          title: 'Growth Opportunities',
          description: 'We invest in our team\'s professional development with training and advancement paths.',
        },
        {
          title: 'Flexible Work',
          description: 'We understand work-life balance. Enjoy flexible hours and remote work options.',
        },
        {
          title: 'Competitive Pay',
          description: 'We offer competitive salaries and performance-based bonuses.',
        },
        {
          title: 'Product Discounts',
          description: 'Generous employee discount on all Doctor Planet products.',
        },
        {
          title: 'Team Culture',
          description: 'Work with a passionate, supportive team that celebrates wins together.',
        },
        {
          title: 'Make an Impact',
          description: 'Your work directly helps healthcare professionals across Pakistan.',
        },
      ],
    },
    {
      id: 'positions',
      type: 'text' as const,
      title: 'Current Openings',
      content: `We're always looking for talented individuals to join our team. While we may not have specific positions listed at the moment, we welcome applications from:

• **Marketing & Social Media**: Help us tell our story and connect with customers
• **Customer Service**: Be the friendly face of Doctor Planet
• **Operations & Logistics**: Keep things running smoothly
• **Design & Creative**: Bring our brand to life
• **Technology**: Help us build and improve our platform

Even if you don't see a perfect match, send us your resume - we'd love to hear from you!`,
    },
    {
      id: 'values',
      type: 'list' as const,
      title: 'Our Values',
      bgColor: 'light' as const,
      items: [
        { text: 'Quality First: We never compromise on the quality of our products or work' },
        { text: 'Customer Obsession: Our customers are at the heart of everything we do' },
        { text: 'Innovation: We continuously look for ways to improve' },
        { text: 'Integrity: We do the right thing, even when no one is watching' },
        { text: 'Teamwork: We succeed together' },
      ],
    },
    {
      id: 'apply',
      type: 'cta' as const,
      title: 'Ready to Join Us?',
      content: 'Send your resume and tell us why you\'d be a great fit for Doctor Planet',
      buttonText: 'Contact Us',
      buttonLink: '/contact',
      bgColor: 'primary' as const,
    },
  ],
}

export default function CareersPage() {
  return <DynamicPage slug="careers" defaultContent={defaultContent} />
}
