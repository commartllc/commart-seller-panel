import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value }
      }
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('payouts')
    .select('*')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  // Calculate totals
  const total_revenue = data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0
  const pending = data?.reduce((sum, p) => p.status === 'pending' ? sum + Number(p.amount) : sum, 0) || 0
  const paid = data?.reduce((sum, p) => p.status === 'paid' ? sum + Number(p.amount) : sum, 0) || 0

  // Normalize history data for UI
  const history = (data || []).map((item: any) => ({
    id: item.id,
    amount: item.amount,
    status: item.status,
    date: item.payout_date ?? item.created_at
  }))

  return NextResponse.json({
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
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value }
      }
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
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
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}
