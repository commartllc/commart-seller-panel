import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET() {
  const supabase = supabaseServer()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .eq('seller_id', session.user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PUT(request: NextRequest) {
  const supabase = supabaseServer()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  // Check if settings exist
  const { data: existing } = await supabase
    .from('store_settings')
    .select('id')
    .eq('seller_id', session.user.id)
    .single()

  let result
  if (existing) {
    result = await supabase
      .from('store_settings')
      .update(body)
      .eq('seller_id', session.user.id)
      .select()
      .single()
  } else {
    result = await supabase
      .from('store_settings')
      .insert({ ...body, seller_id: session.user.id })
      .select()
      .single()
  }

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 })
  }

  return NextResponse.json(result.data)
}
