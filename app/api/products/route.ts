import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('master_products')
    .select('*')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Products API error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }

  // Normalize data for UI
  const normalized = (data ?? []).map((item: any) => ({
    id: item.id,
    title: item.title,
    price: item.base_price ?? item.price,
    image: item.featured_image ?? (Array.isArray(item.images) ? item.images[0] : null),
    created: item.created_at,
    stock: item.total_stock ?? item.available_stock,
    currency: item.currency || 'USD'
  }))

  return Response.json({ success: true, data: normalized })
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const productData = {
    seller_id: user.id,
    title: body.title || body.name,
    description: body.description,
    price: body.price,
    image_url: body.image_url,
    stock: body.stock
  }

  const { data, error } = await supabase
    .from('master_products')
    .insert(productData)
    .select()
    .single()

  if (error) {
    console.error('Products POST error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }

  return Response.json({ success: true, data: data ?? {} })
}
