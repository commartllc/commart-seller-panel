'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import Sidebar from '@/components/ui/Sidebar'
import { DollarSign, Clock, CheckCircle, TrendingUp, Percent, Calendar } from 'lucide-react'

interface Payout {
  id: string
  seller_id: string
  amount: number
  currency: string
  status: string
  description: string | null
  payout_date: string | null
  created_at: string
}

interface NextPayout {
  amount: number
  date: string
  currency: string
}

interface FinanceData {
  total_revenue: number
  total_deductions: number
  net_earned: number
  pending: number
  paid: number
  next_payout: NextPayout | null
  history: Payout[]
}

const getCurrencySymbol = (currency: string) => {
  switch (currency?.toUpperCase()) {
    case 'TRY': return '₺'
    case 'USD': return '$'
    case 'EUR': return '€'
    default: return '₺'
  }
}

export default function FinancePage() {
  const { t } = useLanguage()
  const [financeData, setFinanceData] = useState<FinanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [primaryCurrency, setPrimaryCurrency] = useState('TRY')

  useEffect(() => {
    const fetchFinance = async () => {
      try {
        const res = await fetch('/api/payouts')
        const json = await res.json()
        const data = json.data ?? {
          total_revenue: 0,
          total_deductions: 0,
          net_earned: 0,
          pending: 0,
          paid: 0,
          next_payout: null,
          history: []
        }
        const history = data.history ?? json.payouts ?? []
        const historyArray = Array.isArray(history) ? history : []
        setFinanceData({
          total_revenue: data.total_revenue ?? 0,
          total_deductions: data.total_deductions ?? 0,
          net_earned: data.net_earned ?? 0,
          pending: data.pending ?? 0,
          paid: data.paid ?? 0,
          next_payout: data.next_payout ?? null,
          history: historyArray
        })
        // Set primary currency from first payout or next_payout or default to TRY
        if (data.next_payout?.currency) {
          setPrimaryCurrency(data.next_payout.currency)
        } else if (historyArray.length > 0 && historyArray[0].currency) {
          setPrimaryCurrency(historyArray[0].currency)
        }
      } catch (error) {
        console.error('Failed to fetch finance data:', error)
        setFinanceData({
          total_revenue: 0,
          total_deductions: 0,
          net_earned: 0,
          pending: 0,
          paid: 0,
          next_payout: null,
          history: []
        })
      } finally {
        setLoading(false)
      }
    }

    fetchFinance()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600'
      case 'pending': return 'text-yellow-600'
      case 'cancelled': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return t.common.completed
      case 'pending': return t.common.pending
      case 'cancelled': return t.common.cancelled
      default: return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 pt-16 lg:pt-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t.finance.title}</h1>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">{t.common.loading}</div>
          ) : (
            <>
              {/* KPI Cards - 4 cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Revenue */}
                <div className="bg-white rounded-md shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center">
                    <div className="bg-green-50 p-3 rounded-md">
                      <DollarSign className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">{t.finance.totalEarnings || 'Total Revenue'}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {getCurrencySymbol(primaryCurrency)}{(financeData?.total_revenue || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Total Deductions */}
                <div className="bg-white rounded-md shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center">
                    <div className="bg-red-50 p-3 rounded-md">
                      <Percent className="h-6 w-6 text-red-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Deductions</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {getCurrencySymbol(primaryCurrency)}{(financeData?.total_deductions || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Net Earned */}
                <div className="bg-white rounded-md shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center">
                    <div className="bg-blue-50 p-3 rounded-md">
                      <TrendingUp className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Net Earned</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {getCurrencySymbol(primaryCurrency)}{(financeData?.net_earned || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Next Scheduled Payout */}
                <div className="bg-white rounded-md shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center">
                    <div className="bg-yellow-50 p-3 rounded-md">
                      <Calendar className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">{t.finance.pendingPayout || 'Next Payout'}</p>
                      {financeData?.next_payout ? (
                        <>
                          <p className="text-2xl font-bold text-gray-900">
                            {getCurrencySymbol(financeData.next_payout.currency)}{financeData.next_payout.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">{formatDate(financeData.next_payout.date)}</p>
                        </>
                      ) : (
                        <p className="text-lg font-medium text-gray-400">No pending payout</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payout History */}
              <div className="bg-white rounded-md shadow-sm border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">{t.finance.payoutHistory}</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {financeData?.history && financeData.history.length > 0 ? (
                    financeData.history.map((payout) => (
                      <div key={payout.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center">
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {payout.description || `${t.finance.payout || 'Payout'} #${payout.id.slice(0, 8)}`}
                            </p>
                            <p className="text-sm text-gray-500">
                              {payout.payout_date
                                ? new Date(payout.payout_date).toLocaleDateString()
                                : new Date(payout.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm font-semibold ${getStatusColor(payout.status)}`}>
                            {getCurrencySymbol(payout.currency)}{payout.amount.toFixed(2)}
                          </span>
                          <p className="text-xs text-gray-500">{getStatusText(payout.status)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-8 text-center text-gray-500">
                      {t.finance.noTransactions || 'No payout history yet'}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
