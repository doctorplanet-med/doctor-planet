'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, Store, ShoppingCart, LogOut, X, User, History, Package, Barcode
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import Image from 'next/image'
import SalesmanNavbar from '@/components/salesman/salesman-navbar'

const menuItems = [
  { href: '/salesman', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/salesman/pos', label: 'POS', icon: Store },
  { href: '/salesman/sales-history', label: 'Sales History', icon: History },
  { href: '/salesman/products', label: 'Products', icon: Package },
  { href: '/salesman/barcodes', label: 'Barcodes', icon: Barcode },
  { href: '/salesman/orders', label: 'Online Orders', icon: ShoppingCart },
  { href: '/salesman/profile', label: 'My Profile', icon: User },
]

export default function SalesmanLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && !['SALESMAN', 'ADMIN'].includes(session?.user?.role || '')) {
      router.push('/')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!session || !['SALESMAN', 'ADMIN'].includes(session.user?.role || '')) {
    return null
  }

  return (
    <div className="min-h-screen bg-secondary-100">
      {/* Navbar */}
      <SalesmanNavbar onMenuClick={() => setSidebarOpen(true)} />

      {/* Sidebar */}
      <aside className={`fixed top-0 lg:top-16 left-0 z-50 h-full lg:h-[calc(100vh-4rem)] w-64 bg-secondary-900 transform transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Sidebar Header (Mobile Only) */}
        <div className="lg:hidden flex items-center justify-between h-16 px-6 border-b border-secondary-800">
          <Link href="/salesman" className="flex items-center gap-2">
            <Image src="/logos/logo.png" alt="Logo" width={32} height={32} />
            <span className="text-lg font-bold text-white">POS</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="text-secondary-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Info */}
        <Link href="/salesman/profile" className="block px-6 py-4 border-b border-secondary-800 hover:bg-secondary-800 transition-colors">
          <div className="flex items-center gap-3">
            {session.user?.image ? (
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-primary-500">
                <Image
                  src={session.user.image}
                  alt={session.user.name || 'Profile'}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <p className="text-white font-medium text-sm">{session.user?.name}</p>
              <p className="text-secondary-400 text-xs">{session.user?.role}</p>
            </div>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="px-4 py-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100% - 180px)' }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-secondary-300 hover:bg-secondary-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-secondary-800">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-3 w-full px-4 py-3 text-secondary-300 hover:bg-secondary-800 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="pt-16 lg:pl-64 min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
