import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch payouts
  const { data: payoutsData, error: payoutsError } = await supabase
    .from('payouts')
    .select('*')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  if (payoutsError) {
    console.error('Payouts API error:', payoutsError)
    return Response.json({ success: false, error: payoutsError.message }, { status: 500 })
  }

  // Fetch orders for revenue calculation
  const { data: ordersData, error: ordersError } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('seller_id', user.id)

  if (ordersError) {
    console.error('Orders fetch error:', ordersError)
  }

  // Calculate KPIs from orders
  const orders = ordersData ?? []
  const total_revenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0)
  const total_fees = total_revenue * 0.30
  const net_earnings = total_revenue - total_fees

  // Calculate payout totals
  const payouts = payoutsData ?? []
  const pending_payout = payouts.reduce((sum, p) => p.status === 'pending' ? sum + Number(p.amount) : sum, 0)
  const paid_payout = payouts.reduce((sum, p) => p.status === 'paid' ? sum + Number(p.amount) : sum, 0)

  // Find next scheduled payout (first pending payout)
  const nextPayout = payouts.find(p => p.status === 'pending')
  const next_payout = nextPayout ? {
    amount: nextPayout.amount,
    date: nextPayout.payout_date || nextPayout.created_at,
    currency: nextPayout.currency || 'TRY'
  } : null

  // Normalize history data for UI
  const history = payouts.map((item: any) => ({
    id: item.id,
    amount: item.amount,
    currency: item.currency || 'TRY',
    status: item.status,
    description: item.description,
    payout_date: item.payout_date,
    created_at: item.created_at,
    date: item.payout_date ?? item.created_at
  }))

  return Response.json({
    success: true,
    data: {
      // Order-based KPIs
      total_revenue,
      total_fees,
      net_earnings,
      // Payout-based data
      pending: pending_payout,
      paid: paid_payout,
      next_payout,
      history
    }
  })
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const payoutData = {
    seller_id: user.id,
    amount: body.amount,
    currency: body.currency || 'TRY',
    status: 'pending',
    description: body.description || null,
    payout_date: body.payout_date || null
  }

  const { data, error } = await supabase
    .from('payouts')
    .insert(payoutData)
    .select()
    .single()

  if (error) {
    console.error('Payouts POST error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }

  return Response.json({ success: true, data: data ?? {} })
}
