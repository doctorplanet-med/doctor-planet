'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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
  Tag,
  Wallet,
  ChevronDown,
  Percent,
} from 'lucide-react'

interface MenuItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

interface MenuGroup {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  items: MenuItem[]
}

const menuGroups: MenuGroup[] = [
  {
    id: 'catalog',
    label: 'Catalog',
    icon: FolderTree,
    items: [
      { href: '/admin/categories', label: 'Categories', icon: FolderTree },
      { href: '/admin/products', label: 'Products', icon: Package },
    ],
  },
  {
    id: 'sales',
    label: 'Sales & Orders',
    icon: ShoppingCart,
    items: [
      { href: '/admin/global-discount', label: 'Global Discount', icon: Percent },
      { href: '/admin/deals', label: 'Deals', icon: Tag },
      { href: '/admin/barcodes', label: 'Barcodes', icon: Barcode },
      { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
      { href: '/admin/pos', label: 'POS Sales', icon: Store },
      { href: '/admin/bills', label: 'All Bills', icon: Receipt },
      { href: '/admin/expenses', label: 'Expenses', icon: Wallet },
    ],
  },
  {
    id: 'users',
    label: 'Users',
    icon: Users,
    items: [
      { href: '/admin/salesmen', label: 'Salesmen', icon: UserCog },
      { href: '/admin/customers', label: 'Customers', icon: Users },
      { href: '/admin/team', label: 'Team', icon: UserCircle },
      { href: '/admin/testimonials', label: 'Testimonials', icon: Star },
    ],
  },
  {
    id: 'content',
    label: 'Content',
    icon: FileText,
    items: [
      { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
      { href: '/admin/subscribers', label: 'Subscribers', icon: Mail },
      { href: '/admin/pages', label: 'Pages', icon: FileText },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    items: [
      { href: '/admin/bill-settings', label: 'Bill Design', icon: FileText },
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
      { href: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
]

interface AdminSidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname()

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const open: Record<string, boolean> = {}
    menuGroups.forEach((g) => { open[g.id] = true })
    return open
  })

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev }
      menuGroups.forEach((group) => {
        const hasActive = group.items.some((item) => pathname === item.href || pathname.startsWith(item.href + '/'))
        if (hasActive) next[group.id] = true
      })
      return next
    })
  }, [pathname])

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <aside
      className={`fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 lg:translate-x-0 lg:top-16 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
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
        {/* Dashboard - standalone */}
        <div className="mb-4">
          <h2 className="text-xs font-semibold text-secondary-400 uppercase tracking-wider mb-2 px-4">
            Main
          </h2>
          <Link
            href="/admin"
            onClick={onClose}
            className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
              pathname === '/admin'
                ? 'bg-primary-600 text-white'
                : 'text-secondary-600 hover:bg-secondary-100'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium text-sm">Dashboard</span>
          </Link>
        </div>

        {/* Grouped sections */}
        <div className="space-y-1">
          {menuGroups.map((group) => {
            const isOpenGroup = openGroups[group.id] !== false
            const hasActiveChild = group.items.some(
              (item) => pathname === item.href || pathname.startsWith(item.href + '/')
            )

            return (
              <div key={group.id} className="mb-2">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 text-left ${
                    hasActiveChild ? 'bg-primary-50 text-primary-700' : 'text-secondary-700 hover:bg-secondary-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <group.icon className="w-5 h-5 text-secondary-500" />
                    <span className="font-semibold text-sm">{group.label}</span>
                  </div>
                  <motion.span
                    animate={{ rotate: isOpenGroup ? 0 : -90 }}
                    transition={{ duration: 0.2 }}
                    className="text-secondary-400"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpenGroup && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden pl-4 mt-1 space-y-0.5 border-l-2 border-secondary-200 ml-5"
                    >
                      {group.items.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onClick={onClose}
                              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                isActive
                                  ? 'bg-primary-600 text-white font-medium -ml-[2px] border-l-2 border-primary-600'
                                  : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
                              }`}
                            >
                              <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-secondary-500'}`} />
                              <span>{item.label}</span>
                            </Link>
                          </li>
                        )
                      })}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </nav>
    </aside>
  )
}
