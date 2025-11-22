'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import Sidebar from '@/components/ui/Sidebar'
import { DollarSign, Clock, CheckCircle } from 'lucide-react'

interface Payout {
  id: string
  user_id: string
  amount: number
  status: string
  created_at: string
}

interface FinanceData {
  data: Payout[]
  summary: {
    totalEarnings: number
    pendingPayouts: number
    completedPayouts: number
  }
}

export default function FinancePage() {
  const { t } = useLanguage()
  const [financeData, setFinanceData] = useState<FinanceData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFinance = async () => {
      try {
        const res = await fetch('/api/payouts')
        const json = await res.json()
        if (json.success) {
          setFinanceData({
            data: json.data || [],
            summary: json.summary || {
              totalEarnings: 0,
              pendingPayouts: 0,
              completedPayouts: 0
            }
          })
        }
      } catch (error) {
        console.error('Failed to fetch finance data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFinance()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600'
      case 'pending': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t.finance.title}</h1>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">{t.common.loading}</div>
          ) : (
            <>
              {/* Finance Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <DollarSign className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">{t.finance.totalEarnings}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {t.common.currency}{(financeData?.summary.totalEarnings || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center">
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <Clock className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">{t.finance.pendingPayout}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {t.common.currency}{(financeData?.summary.pendingPayouts || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">{t.finance.lastPayout}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {t.common.currency}{(financeData?.summary.completedPayouts || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payouts List */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">{t.finance.payoutHistory}</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {financeData?.data && financeData.data.length > 0 ? (
                    financeData.data.map((payout) => (
                      <div key={payout.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center">
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {t.finance.payout} #{payout.id.slice(0, 8)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(payout.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm font-semibold ${getStatusColor(payout.status)}`}>
                            {t.common.currency}{payout.amount.toFixed(2)}
                          </span>
                          <p className="text-xs text-gray-500 capitalize">{payout.status}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-8 text-center text-gray-500">
                      {t.finance.noTransactions}
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
