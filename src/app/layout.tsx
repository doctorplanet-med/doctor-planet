import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import AuthProvider from '@/components/providers/auth-provider'
import WishlistProvider from '@/components/providers/wishlist-provider'
import LayoutWrapper from '@/components/layout/layout-wrapper'

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
  title: 'Doctor Planet - Professional Medical Boutique',
  description: 'Your one-stop shop for premium medical clothes, shoes, and equipment. Quality products for healthcare professionals.',
  keywords: 'medical scrubs, lab coats, nursing shoes, medical equipment, healthcare uniforms',
  icons: {
    icon: '/logos/logo.png',
    shortcut: '/logos/logo.png',
    apple: '/logos/logo.png',
  },
  openGraph: {
    title: 'Doctor Planet - Professional Medical Boutique',
    description: 'Your one-stop shop for premium medical clothes, shoes, and equipment.',
    images: ['/logos/Full Logo.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
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
