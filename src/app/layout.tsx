import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import AuthProvider from '@/components/providers/auth-provider'
import WishlistProvider from '@/components/providers/wishlist-provider'
import LayoutWrapper from '@/components/layout/layout-wrapper'
import GoogleAnalytics from '@/components/analytics/google-analytics'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'Doctor Planet - Medical Scrubs, Nursing Uniforms & Healthcare Apparel',
  description: 'Shop premium medical scrubs, nursing uniforms, doctor scrubs, and healthcare apparel in Pakistan. Men\'s scrubs, women\'s scrubs, medical equipment, and professional medical clothing for nurses and doctors.',
  keywords: 'scrubs, medical apparel, men\'s scrubs clothing, ladies scrubs, scrubs ladies, female medical scrubs, scrubs women\'s, scrubs uniform for ladies, men\'s scrubs, scrubs men, medical scrubs, nursing scrubs, scrub for men, scrubs for women, medicine scrubs, nurse scrubs, scrub medical, scrubs for men, scrubs uniforms, dr scrubs, medical scrubs Pakistan, nursing uniforms, doctor scrubs, healthcare apparel, medical clothing, hospital uniforms',
  icons: {
    icon: '/logos/logo.png',
    shortcut: '/logos/logo.png',
    apple: '/logos/logo.png',
  },
  openGraph: {
    title: 'Doctor Planet - Medical Scrubs & Nursing Uniforms in Pakistan',
    description: 'Premium medical scrubs, nursing uniforms, and healthcare apparel. Shop men\'s scrubs, women\'s scrubs, and professional medical clothing.',
    images: ['/logos/Full Logo.png'],
    siteName: 'Doctor Planet',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Doctor Planet - Medical Scrubs & Healthcare Apparel',
    description: 'Premium medical scrubs, nursing uniforms, and professional healthcare clothing.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <GoogleAnalytics />
      </head>
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <WishlistProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
            <Toaster 
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1a1a1a',
                color: '#fff',
              },
              success: {
                iconTheme: {
                  primary: '#A52A2A',
                  secondary: '#fff',
                },
              },
            }}
          />
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
