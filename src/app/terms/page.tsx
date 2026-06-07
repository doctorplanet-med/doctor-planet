'use client'

import DynamicPage from '@/components/dynamic-page'

const defaultContent = {
  heroTitle: 'Terms of Service',
  heroSubtitle: 'Please read these terms carefully before using our website or services.',
  sections: [
    {
      id: 'intro',
      type: 'text' as const,
      title: 'Agreement to Terms',
      content: `By accessing or using the Doctor Planet website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations.

If you do not agree with any part of these terms, you may not use our services.

Last Updated: January 2024`,
    },
    {
      id: 'use',
      type: 'text' as const,
      title: 'Use of Our Services',
      bgColor: 'light' as const,
      content: `You agree to use our website and services only for lawful purposes and in accordance with these Terms. You agree not to:

• Use the service for any illegal purpose
• Attempt to gain unauthorized access to our systems
• Interfere with or disrupt the service
• Submit false or misleading information
• Violate any applicable laws or regulations
• Infringe on the rights of others`,
    },
    {
      id: 'accounts',
      type: 'text' as const,
      title: 'User Accounts',
      content: `When you create an account with us, you must:

• Provide accurate and complete information
• Maintain the security of your account credentials
• Notify us immediately of any unauthorized access
• Be responsible for all activities under your account

We reserve the right to suspend or terminate accounts that violate these terms.`,
    },
    {
      id: 'orders',
      type: 'text' as const,
      title: 'Orders and Payments',
      bgColor: 'light' as const,
      content: `**Pricing**: All prices are in Pakistani Rupees (PKR) and may change without notice. We strive to display accurate pricing, but errors may occur.

**Orders**: We reserve the right to refuse or cancel any order for reasons including product availability, pricing errors, or suspected fraud.

**Payment**: Currently we accept Cash on Delivery (COD). Full payment is due upon delivery.

**Shipping**: Shipping times and costs are estimates and may vary based on location and other factors.`,
    },
    {
      id: 'products',
      type: 'text' as const,
      title: 'Products and Services',
      content: `We make every effort to display our products accurately, including colors and images. However, actual products may vary slightly from images due to photography and display settings.

Product descriptions are for informational purposes and should not be considered medical advice. Consult appropriate professionals for medical guidance.`,
    },
    {
      id: 'ip',
      type: 'list' as const,
      title: 'Intellectual Property',
      bgColor: 'light' as const,
      items: [
        { text: 'All content on this website is owned by Doctor Planet' },
        { text: 'You may not copy, reproduce, or distribute our content without permission' },
        { text: 'Trademarks and logos are the property of their respective owners' },
        { text: 'User-submitted content grants us a license to use it' },
      ],
    },
    {
      id: 'liability',
      type: 'text' as const,
      title: 'Limitation of Liability',
      content: `To the maximum extent permitted by law, Doctor Planet shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services.

Our total liability shall not exceed the amount you paid for the specific product or service giving rise to the claim.`,
    },
    {
      id: 'changes',
      type: 'text' as const,
      title: 'Changes to Terms',
      bgColor: 'light' as const,
      content: `We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to our website.

Your continued use of our services after changes constitutes acceptance of the modified terms.`,
    },
    {
      id: 'contact',
      type: 'cta' as const,
      title: 'Questions About Our Terms?',
      content: 'Contact us if you have any questions about these terms',
      buttonText: 'Contact Us',
      buttonLink: '/contact',
      bgColor: 'primary' as const,
    },
  ],
}

export default function TermsPage() {
  return <DynamicPage slug="terms" defaultContent={defaultContent} />
}
