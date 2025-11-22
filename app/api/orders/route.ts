import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Orders API error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }

  // Normalize data for UI
  const normalized = (data ?? []).map((item: any) => ({
    id: item.id,
    total: item.total_amount,
    status: item.status,
    date: item.created_at,
    buyer: item.customer_name ?? item.customer_email,
    currency: item.currency || 'USD'
  }))

  return Response.json({ success: true, data: normalized })
}
