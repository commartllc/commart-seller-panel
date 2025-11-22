import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET() {
  const supabase = supabaseServer()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('payouts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  // Calculate totals
  const totalEarnings = data?.reduce((sum, p) => p.status === 'completed' ? sum + Number(p.amount) : sum, 0) || 0
  const pendingPayouts = data?.reduce((sum, p) => p.status === 'pending' ? sum + Number(p.amount) : sum, 0) || 0

  return NextResponse.json({
    success: true,
    data,
    summary: {
      totalEarnings,
      pendingPayouts,
      completedPayouts: totalEarnings
    }
  })
}
