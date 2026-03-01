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
  title: 'Doctor Planet - Medical Scrubs, Crocs, Medical Equipment & Healthcare Apparel Pakistan',
  description: 'Shop premium medical scrubs, crocs shoes, medical equipment, nursing uniforms, doctor scrubs, and healthcare apparel in Pakistan. Men\'s scrubs, women\'s scrubs, medical clogs, stethoscopes, and professional medical supplies for nurses and doctors.',
  keywords: 'scrubs, medical apparel, men\'s scrubs clothing, ladies scrubs, scrubs ladies, female medical scrubs, scrubs women\'s, scrubs uniform for ladies, men\'s scrubs, scrubs men, medical scrubs, nursing scrubs, scrub for men, scrubs for women, medicine scrubs, nurse scrubs, scrub medical, scrubs for men, scrubs uniforms, dr scrubs, crocs, medical crocs, crocs shoes, doctor crocs, nurse crocs, crocs clogs, medical shoes, nursing shoes, healthcare footwear, medical clogs, crocs for nurses, crocs for doctors, medical equipment, medical supplies, stethoscope, blood pressure monitor, thermometer, medical instruments, diagnostic equipment, surgical equipment, medical devices, healthcare equipment, nursing equipment, doctor equipment, medical tools, hospital equipment, medical gear, Pakistan medical supplies',
  icons: {
    icon: '/logos/logo.png',
    shortcut: '/logos/logo.png',
    apple: '/logos/logo.png',
  },
  openGraph: {
    title: 'Doctor Planet - Medical Scrubs, Crocs & Equipment in Pakistan',
    description: 'Premium medical scrubs, crocs shoes, medical equipment, nursing uniforms, and healthcare apparel. Shop men\'s scrubs, women\'s scrubs, medical clogs, and professional medical supplies.',
    images: ['/logos/Full Logo.png'],
    siteName: 'Doctor Planet',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Doctor Planet - Medical Scrubs, Crocs & Healthcare Equipment',
    description: 'Premium medical scrubs, crocs shoes, medical equipment, nursing uniforms, and professional healthcare supplies.',
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
