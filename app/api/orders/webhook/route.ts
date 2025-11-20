import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase'
import { triggerOrderWebhook } from '@/lib/n8n'

export async function POST(request: NextRequest) {
  const supabase = createSupabaseServer()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { event, order } = await request.json()

  const success = await triggerOrderWebhook(
    event as 'created' | 'status_updated' | 'cancelled',
    order,
    session.user.id
  )

  return NextResponse.json({ success })
}
