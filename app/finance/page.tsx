'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { createBrowserClient } from '@/lib/supabase'
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import type { Finance, Transaction } from '@/lib/supabase'

export default function FinancePage() {
  const [finance, setFinance] = useState<Finance | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    const fetchFinance = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data } = await supabase
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12 text-gray-500">Loading...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance</h1>
          <p className="text-gray-600">Track your earnings and payouts</p>
        </div>

        {/* Finance Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-500 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${(finance?.total_earnings || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-yellow-500 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Payouts</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${(finance?.pending_payouts || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-500 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed Payouts</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${(finance?.completed_payouts || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          </div>
          <div className="divide-y">
            {finance?.transactions && finance.transactions.length > 0 ? (
              finance.transactions.map((transaction: Transaction) => (
                <div key={transaction.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    {getTransactionIcon(transaction.type)}
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${
                    transaction.type === 'sale' ? 'text-green-600' :
                    transaction.type === 'refund' || transaction.type === 'fee' ? 'text-red-600' :
                    'text-blue-600'
                  }`}>
                    {transaction.type === 'refund' || transaction.type === 'fee' ? '-' : '+'}
                    ${transaction.amount.toFixed(2)}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No transactions yet
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
