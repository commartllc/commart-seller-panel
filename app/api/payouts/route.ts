import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('payouts')
    .select('*')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Payouts API error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }

  // Calculate totals
  const items = data ?? []
  const total_revenue = items.reduce((sum, p) => sum + Number(p.amount), 0)
  const pending = items.reduce((sum, p) => p.status === 'pending' ? sum + Number(p.amount) : sum, 0)
  const paid = items.reduce((sum, p) => p.status === 'paid' ? sum + Number(p.amount) : sum, 0)

  // Normalize history data for UI
  const history = items.map((item: any) => ({
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
      total_revenue,
      pending,
      paid,
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
