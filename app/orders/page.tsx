'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import Sidebar from '@/components/ui/Sidebar'
import { Search, Filter, Calendar } from 'lucide-react'

interface Order {
  id: string
  user_id: string
  buyer: string
  buyer_email: string
  product_id: string
  quantity: number
  total: number
  status: string
  date: string
  created_at: string
  currency?: string
  product?: {
    title: string
    price: number
    image_url: string
  }
}

const formatCurrency = (amount: number, currency: string = 'USD') => {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    TRY: '₺',
    GBP: '£'
  }
  return `${symbols[currency] || '$'}${amount.toFixed(2)}`
}

export default function OrdersPage() {
  const { t } = useLanguage()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders')
      const json = await res.json()
      const items = json.data ?? json.orders ?? []
      setOrders(Array.isArray(items) ? items : [])
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return t.common.pending
      case 'processing': return t.common.processing
      case 'shipped': return t.common.shipped
      case 'delivered': return t.common.delivered
      case 'cancelled': return t.common.cancelled
      default: return status
    }
  }

  const filterByDate = (order: Order) => {
    if (dateFilter === 'all') return true

    const orderDate = new Date(order.date || order.created_at)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    switch (dateFilter) {
      case 'today':
        return orderDate >= today
      case '7days':
        const weekAgo = new Date(today)
        weekAgo.setDate(weekAgo.getDate() - 7)
        return orderDate >= weekAgo
      case '30days':
        const monthAgo = new Date(today)
        monthAgo.setDate(monthAgo.getDate() - 30)
        return orderDate >= monthAgo
      default:
        return true
    }
  }

  const filteredOrders = orders.filter(order => {
    const buyerInfo = order.buyer || order.buyer_email || ''
    const matchesSearch = buyerInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesDate = filterByDate(order)
    return matchesSearch && matchesStatus && matchesDate
  })

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 pt-16 lg:pt-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t.orders.title}</h1>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t.orders.searchOrders}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">{t.common.all}</option>
                <option value="pending">{t.common.pending}</option>
                <option value="processing">{t.common.processing}</option>
                <option value="shipped">{t.common.shipped}</option>
                <option value="delivered">{t.common.delivered}</option>
                <option value="cancelled">{t.common.cancelled}</option>
              </select>
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-6 text-center text-gray-500">{t.common.loading}</div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-6 text-center text-gray-500">{t.orders.noOrders}</div>
            ) : (
              <div className="overflow-x-auto max-h-[70vh]">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-20 min-w-[120px]">{t.orders.orderId}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">{t.orders.customer}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">{t.orders.total}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">{t.orders.date}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">{t.orders.status}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                          #{order.id.slice(0, 8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 truncate max-w-[150px]">{order.buyer || order.buyer_email}</div>
                          {order.product && (
                            <div className="text-sm text-gray-500 truncate max-w-[150px]">{order.product.title}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(order.total ?? 0, order.currency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.date || order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-md ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
