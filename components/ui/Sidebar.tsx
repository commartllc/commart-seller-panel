'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
  Users,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react'

interface SidebarProps {
  onCollapse?: (collapsed: boolean) => void
}

export default function Sidebar({ onCollapse }: SidebarProps) {
  const pathname = usePathname()
  const { t } = useLanguage()
  const supabase = createClient()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    onCollapse?.(collapsed)
  }, [collapsed, onCollapse])

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

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

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className={`p-6 border-b border-gray-200 ${collapsed ? 'px-4' : ''}`}>
        {collapsed ? (
          <div className="flex justify-center">
            <Image
              src="/logo.png"
              alt="Commart"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
              priority
            />
          </div>
        ) : (
          <>
            <Image
              src="/logo.png"
              alt="Commart"
              width={145}
              height={40}
              className="h-auto"
              priority
            />
            <p className="text-sm text-gray-500 mt-1">Seller Panel</p>
          </>
        )}
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
              } ${collapsed ? 'justify-center px-2' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-coral-500' : ''}`} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Community + Logout */}
      <div className="p-4 border-t border-gray-200 space-y-1">
        {/* Community Button */}
        <Link
          href="/community"
          className={`flex items-center gap-3 px-4 py-3 w-full rounded-lg bg-coral-50 text-coral-600 hover:bg-coral-100 transition-colors font-medium ${
            collapsed ? 'justify-center px-2' : ''
          }`}
          title={collapsed ? 'Community' : undefined}
        >
          <Users className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Community</span>}
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors ${
            collapsed ? 'justify-center px-2' : ''
          }`}
          title={collapsed ? t.common.logout : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>{t.common.logout}</span>}
        </button>
      </div>

      {/* Collapse button (desktop only) */}
      <div className="hidden lg:block p-4 border-t border-gray-200">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md border border-gray-200"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar (slide-in drawer) */}
      <aside
        className={`lg:hidden fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col z-50 transform transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex fixed left-0 top-0 h-full bg-white border-r border-gray-200 flex-col transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Spacer for main content */}
      <div className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`} />
    </>
  )
}
