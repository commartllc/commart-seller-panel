'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import Sidebar from '@/components/ui/Sidebar'
import { supabaseBrowser, type Finance, type Transaction } from '@/lib/supabase-browser'
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react'

export default function FinancePage() {
  const { t } = useLanguage()
  const [finance, setFinance] = useState<Finance | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFinance = async () => {
      const { data: { session } } = await supabaseBrowser.auth.getSession()
      if (!session) return

      const { data } = await supabaseBrowser
        .from('finance')
        .select('*')
        .eq('seller_id', session.user.id)
        .single()

      setFinance(data)
      setLoading(false)
    }

    fetchFinance()
  }, [])

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'sale': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'payout': return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'refund': return <Clock className="h-4 w-4 text-red-500" />
      case 'fee': return <DollarSign className="h-4 w-4 text-gray-500" />
      default: return <DollarSign className="h-4 w-4 text-gray-500" />
    }
  }

  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case 'sale': return t.finance.sale
      case 'payout': return t.finance.payout
      case 'refund': return t.finance.refund
      case 'fee': return t.finance.commission
      default: return type
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
                        {t.common.currency}{(finance?.total_earnings || 0).toLocaleString()}
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
                        {t.common.currency}{(finance?.pending_payouts || 0).toLocaleString()}
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
                        {t.common.currency}{(finance?.completed_payouts || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transactions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">{t.finance.transactions}</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {finance?.transactions && finance.transactions.length > 0 ? (
                    finance.transactions.map((transaction: Transaction) => (
                      <div key={transaction.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center">
                          {getTransactionIcon(transaction.type)}
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {transaction.description || getTransactionTypeText(transaction.type)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`text-sm font-semibold ${
                          transaction.type === 'sale' ? 'text-green-600' :
                          transaction.type === 'refund' || transaction.type === 'fee' ? 'text-red-600' :
                          'text-blue-600'
                        }`}>
                          {transaction.type === 'refund' || transaction.type === 'fee' ? '-' : '+'}
                          {t.common.currency}{transaction.amount.toFixed(2)}
                        </span>
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
