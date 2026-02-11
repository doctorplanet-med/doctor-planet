'use client'

import { usePathname } from 'next/navigation'
import AnnouncementBar from './announcement-bar'
import Navbar from './navbar'
import Footer from './footer'
import CartSidebar from '@/components/cart/cart-sidebar'
import WhatsAppFloat from './whatsapp-float'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Routes that should NOT show the main navbar/footer
  const isAdminRoute = pathname?.startsWith('/admin')
  const isSalesmanRoute = pathname?.startsWith('/salesman')
  const hideLayout = isAdminRoute || isSalesmanRoute

  if (hideLayout) {
    // For admin and salesman routes, just render children (they have their own layouts)
    return <>{children}</>
  }

  // For regular pages, show navbar, footer, etc.
  const isHomePage = pathname === '/'
  return (
    <>
      <AnnouncementBar />
      <Navbar transparentOnHero={isHomePage} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <CartSidebar />
      <WhatsAppFloat />
    </>
  )
}
