'use client'

import DynamicPage from '@/components/dynamic-page'

const defaultContent = {
  heroTitle: 'Cookie Policy',
  heroSubtitle: 'This policy explains how we use cookies and similar technologies on our website.',
  sections: [
    {
      id: 'what',
      type: 'text' as const,
      title: 'What Are Cookies?',
      content: `Cookies are small text files that are placed on your device when you visit a website. They help the website remember your preferences and improve your browsing experience.

Cookies can be "session" cookies (deleted when you close your browser) or "persistent" cookies (remain on your device for a set period).`,
    },
    {
      id: 'types',
      type: 'cards' as const,
      title: 'Types of Cookies We Use',
      bgColor: 'light' as const,
      items: [
        {
          title: 'Essential Cookies',
          description: 'Required for the website to function properly. They enable basic features like page navigation and secure checkout.',
        },
        {
          title: 'Functional Cookies',
          description: 'Remember your preferences and choices to provide enhanced features and personalization.',
        },
        {
          title: 'Analytics Cookies',
          description: 'Help us understand how visitors interact with our website so we can improve the user experience.',
        },
        {
          title: 'Marketing Cookies',
          description: 'Used to track visitors across websites to display relevant advertisements.',
        },
      ],
    },
    {
      id: 'how',
      type: 'list' as const,
      title: 'How We Use Cookies',
      items: [
        { text: 'Remember your shopping cart contents' },
        { text: 'Keep you signed in to your account' },
        { text: 'Remember your preferences and settings' },
        { text: 'Analyze website traffic and usage patterns' },
        { text: 'Improve website performance and user experience' },
        { text: 'Provide personalized recommendations' },
      ],
    },
    {
      id: 'third-party',
      type: 'text' as const,
      title: 'Third-Party Cookies',
      bgColor: 'light' as const,
      content: `Some cookies on our website are placed by third-party services we use:

**Analytics**: We use Google Analytics to understand how visitors use our site. Google Analytics uses cookies to collect anonymous information.

**Social Media**: If you share content on social media platforms, they may set cookies on your device.

**Payment Providers**: Our payment processors may use cookies to prevent fraud and ensure secure transactions.

These third parties have their own privacy policies governing the use of cookies.`,
    },
    {
      id: 'manage',
      type: 'text' as const,
      title: 'Managing Cookies',
      content: `You can control cookies through your browser settings. Most browsers allow you to:

• View what cookies are stored on your device
• Delete all or specific cookies
• Block cookies from certain websites
• Block all cookies from being set
• Set preferences for different types of cookies

Note that blocking some cookies may impact your experience on our website.

**Browser Settings:**
• Chrome: Settings > Privacy and Security > Cookies
• Firefox: Options > Privacy & Security > Cookies
• Safari: Preferences > Privacy > Cookies
• Edge: Settings > Privacy > Cookies`,
    },
    {
      id: 'updates',
      type: 'text' as const,
      title: 'Updates to This Policy',
      bgColor: 'light' as const,
      content: `We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our data practices.

Any changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically.

Last Updated: January 2024`,
    },
    {
      id: 'contact',
      type: 'cta' as const,
      title: 'Questions About Cookies?',
      content: 'Contact us if you have any questions about our use of cookies',
      buttonText: 'Contact Us',
      buttonLink: '/contact',
      bgColor: 'dark' as const,
    },
  ],
}

export default function CookiesPage() {
  return <DynamicPage slug="cookies" defaultContent={defaultContent} />
}
