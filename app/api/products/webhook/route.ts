import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase'
import { triggerProductWebhook } from '@/lib/n8n'

export async function POST(request: NextRequest) {
  const supabase = createSupabaseServer()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { event, product } = await request.json()

  const success = await triggerProductWebhook(
    event as 'created' | 'updated' | 'deleted',
    product,
    session.user.id
  )

  return NextResponse.json({ success })
}
