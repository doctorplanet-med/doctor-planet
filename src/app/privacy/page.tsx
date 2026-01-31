'use client'

import DynamicPage from '@/components/dynamic-page'

const defaultContent = {
  heroTitle: 'Privacy Policy',
  heroSubtitle: 'Your privacy is important to us. This policy explains how we collect, use, and protect your information.',
  sections: [
    {
      id: 'intro',
      type: 'text' as const,
      title: 'Introduction',
      content: `Doctor Planet ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase.

Please read this policy carefully. By using our website, you consent to the practices described in this Privacy Policy.

Last Updated: January 2024`,
    },
    {
      id: 'collection',
      type: 'text' as const,
      title: 'Information We Collect',
      bgColor: 'light' as const,
      content: `We collect information you provide directly to us, including:

**Personal Information:**
• Name and contact details (email, phone number, address)
• Account credentials
• Payment information (processed securely through payment providers)
• Order history and preferences

**Automatically Collected Information:**
• Device information (browser type, operating system)
• IP address and location data
• Website usage data and browsing patterns
• Cookies and similar tracking technologies`,
    },
    {
      id: 'use',
      type: 'list' as const,
      title: 'How We Use Your Information',
      items: [
        { text: 'Process and fulfill your orders' },
        { text: 'Send order confirmations and shipping updates' },
        { text: 'Respond to your inquiries and provide customer support' },
        { text: 'Send promotional emails (with your consent)' },
        { text: 'Improve our website and services' },
        { text: 'Detect and prevent fraud' },
        { text: 'Comply with legal obligations' },
      ],
    },
    {
      id: 'sharing',
      type: 'text' as const,
      title: 'Information Sharing',
      bgColor: 'light' as const,
      content: `We do not sell your personal information. We may share your information with:

• **Service Providers**: Shipping companies, payment processors, and other third parties who assist us in operating our business
• **Legal Requirements**: When required by law or to protect our rights
• **Business Transfers**: In connection with a merger, acquisition, or sale of assets

All third parties are contractually obligated to keep your information confidential.`,
    },
    {
      id: 'security',
      type: 'text' as const,
      title: 'Data Security',
      content: `We implement appropriate security measures to protect your personal information, including:

• Secure SSL encryption for all data transmission
• Secure storage with access controls
• Regular security assessments
• Employee training on data protection

While we strive to protect your information, no method of transmission over the Internet is 100% secure.`,
    },
    {
      id: 'rights',
      type: 'list' as const,
      title: 'Your Rights',
      bgColor: 'light' as const,
      subtitle: 'You have the right to:',
      items: [
        { text: 'Access the personal information we hold about you' },
        { text: 'Request correction of inaccurate information' },
        { text: 'Request deletion of your personal information' },
        { text: 'Opt-out of marketing communications' },
        { text: 'Withdraw consent at any time' },
      ],
    },
    {
      id: 'contact',
      type: 'cta' as const,
      title: 'Questions About Privacy?',
      content: 'Contact our privacy team for any questions or concerns',
      buttonText: 'Contact Us',
      buttonLink: '/contact',
      bgColor: 'dark' as const,
    },
  ],
}

export default function PrivacyPage() {
  return <DynamicPage slug="privacy" defaultContent={defaultContent} />
}
