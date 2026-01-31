'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderTree,
  Settings,
  BarChart3,
  Star,
  Mail,
  FileText,
  MessageSquare,
  UserCircle,
  Store,
  UserCog,
  Receipt,
  X,
  Barcode,
} from 'lucide-react'

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/barcodes', label: 'Barcodes', icon: Barcode },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/pos', label: 'POS Sales', icon: Store },
  { href: '/admin/bills', label: 'All Bills', icon: Receipt },
  { href: '/admin/salesmen', label: 'Salesmen', icon: UserCog },
  { href: '/admin/bill-settings', label: 'Bill Design', icon: FileText },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { href: '/admin/testimonials', label: 'Testimonials', icon: Star },
  { href: '/admin/team', label: 'Team', icon: UserCircle },
  { href: '/admin/subscribers', label: 'Subscribers', icon: Mail },
  { href: '/admin/pages', label: 'Pages', icon: FileText },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

interface AdminSidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 lg:translate-x-0 lg:top-16 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between h-16 px-4 border-b border-secondary-200">
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/logos/logo.png" alt="Logo" width={32} height={32} />
          <span className="font-bold text-secondary-900">Admin</span>
        </Link>
        <button onClick={onClose} className="p-2 hover:bg-secondary-100 rounded-lg">
          <X className="w-5 h-5 text-secondary-600" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 h-[calc(100%-4rem)] lg:h-[calc(100vh-4rem)] overflow-y-auto">
        <h2 className="text-xs font-semibold text-secondary-400 uppercase tracking-wider mb-4 px-4">
          Navigation
        </h2>
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-secondary-600 hover:bg-secondary-100'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-secondary-500'}`} />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
