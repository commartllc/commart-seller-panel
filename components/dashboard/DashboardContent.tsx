'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import Sidebar from '@/components/ui/Sidebar'
import { TrendingUp, Package, ShoppingCart, DollarSign, Bell } from 'lucide-react'

interface Notification {
  id: string
  seller_id: string
  title: string
  message: string
  created_at: string
}

interface Order {
  id: string
  total_amount: number
  status: string
  created_at: string
  customer_name?: string
  customer_email?: string
}

interface DashboardContentProps {
  kpis: {
    totalProducts: number
    totalOrders: number
    pendingOrders: number
    totalRevenue: number
  }
  notifications?: Notification[]
}

export default function DashboardContent({ kpis, notifications = [] }: DashboardContentProps) {
  const { t } = useLanguage()
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [orderBreakdown, setOrderBreakdown] = useState({ pending: 0, fulfilled: 0, cancelled: 0 })

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders')
        const json = await res.json()
        const orders = json.data ?? []

        // Get recent 5 orders
        setRecentOrders(orders.slice(0, 5))

        // Calculate order breakdown
        const breakdown = {
          pending: orders.filter((o: Order) => o.status === 'pending').length,
          fulfilled: orders.filter((o: Order) => ['completed', 'delivered', 'shipped'].includes(o.status)).length,
          cancelled: orders.filter((o: Order) => o.status === 'cancelled').length
        }
        setOrderBreakdown(breakdown)
      } catch (error) {
        console.error('Failed to fetch orders:', error)
      }
    }
    fetchOrders()
  }, [])

  const stats = [
    {
      name: t.dashboard.totalProducts,
      value: kpis.totalProducts,
      icon: Package,
      color: 'bg-coral-500',
      lightColor: 'bg-coral-50',
    },
    {
      name: t.dashboard.totalOrders,
      value: kpis.totalOrders,
      icon: ShoppingCart,
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
    },
    {
      name: t.dashboard.pendingOrders,
      value: kpis.pendingOrders,
      icon: TrendingUp,
      color: 'bg-yellow-500',
      lightColor: 'bg-yellow-50',
    },
    {
      name: t.dashboard.totalRevenue,
      value: `${t.common.currency}${kpis.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
    },
  ]

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      delivered: 'bg-green-100 text-green-800',
      shipped: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 pt-16 lg:pt-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t.dashboard.title}</h1>
            <p className="text-gray-600">{t.dashboard.welcome}</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.name}
                className="bg-white rounded-md shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center">
                  <div className={`${stat.lightColor} p-3 rounded-md`}>
                    <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Store Notifications */}
          <div className="bg-white rounded-md shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-4">
              <Bell className="h-5 w-5 text-gray-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Store Notifications</h2>
            </div>
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-sm text-gray-600">{notification.message}</p>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                        {formatDate(notification.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No notifications yet</p>
            )}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Overview */}
            <div className="bg-white rounded-md shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.dashboard.salesOverview}</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Sales</span>
                  <span className="font-semibold">{kpis.totalOrders} orders</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Revenue</span>
                  <span className="font-semibold">{t.common.currency}{kpis.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Order</span>
                  <span className="font-semibold">
                    {t.common.currency}{kpis.totalOrders > 0 ? (kpis.totalRevenue / kpis.totalOrders).toFixed(2) : '0'}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Status Breakdown */}
            <div className="bg-white rounded-md shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.dashboard.orderStatus}</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-md">
                    {orderBreakdown.pending}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Fulfilled</span>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-md">
                    {orderBreakdown.fulfilled}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cancelled</span>
                  <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-md">
                    {orderBreakdown.cancelled}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-md shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{t.dashboard.recentOrders}</h2>
              <a href="/orders" className="text-coral-500 hover:text-coral-600 text-sm font-medium">
                {t.dashboard.viewAll}
              </a>
            </div>
            {recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-medium text-gray-500 pb-2">Order ID</th>
                      <th className="text-left text-xs font-medium text-gray-500 pb-2">Customer</th>
                      <th className="text-left text-xs font-medium text-gray-500 pb-2">Amount</th>
                      <th className="text-left text-xs font-medium text-gray-500 pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-50 last:border-0">
                        <td className="py-3 text-sm text-gray-900">#{order.id.slice(0, 8)}</td>
                        <td className="py-3 text-sm text-gray-600">{order.customer_name || order.customer_email || 'N/A'}</td>
                        <td className="py-3 text-sm font-medium text-gray-900">{t.common.currency}{order.total_amount?.toFixed(2) || '0.00'}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-md ${getStatusBadge(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">{t.orders.noOrders}</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
