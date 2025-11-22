'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  DollarSign,
  Settings,
  Globe,
  LogOut,
} from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const navItems = [
    {
      href: '/',
      label: t.sidebar.dashboard,
      icon: LayoutDashboard,
    },
    {
      href: '/products',
      label: t.sidebar.products,
      icon: Package,
    },
    {
      href: '/orders',
      label: t.sidebar.orders,
      icon: ShoppingCart,
    },
    {
      href: '/finance',
      label: t.sidebar.finance,
      icon: DollarSign,
    },
    {
      href: '/store',
      label: t.sidebar.settings,
      icon: Settings,
    },
    {
      href: '/language',
      label: t.sidebar.language,
      icon: Globe,
    },
  ]

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-coral-500">Commart</h1>
        <p className="text-sm text-gray-500">Seller Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-coral-50 text-coral-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-coral-500' : ''}`} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>{t.common.logout}</span>
        </button>
      </div>
    </aside>
  )
}
