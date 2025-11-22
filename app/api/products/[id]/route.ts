import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch product
  const { data: product, error: productError } = await supabase
    .from('master_products')
    .select('*')
    .eq('id', params.id)
    .eq('seller_id', user.id)
    .single()

  if (productError) {
    console.error('Product fetch error:', productError)
    return Response.json({ success: false, error: productError.message }, { status: 500 })
  }

  // Fetch variants if they exist
  const { data: variants } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', params.id)
    .order('created_at', { ascending: true })

  return Response.json({
    success: true,
    data: {
      ...product,
      variants: variants || []
    }
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  // Build update data - only stock and price, NOT title
  const updateData: Record<string, any> = {}

  if (body.new_stock !== undefined) {
    updateData.total_stock = body.new_stock
  }
  if (body.new_price !== undefined) {
    updateData.base_price = body.new_price
  }
  // Legacy support for direct stock/price
  if (body.stock !== undefined && body.new_stock === undefined) {
    updateData.total_stock = body.stock
  }
  if (body.price !== undefined && body.new_price === undefined) {
    updateData.base_price = body.price
  }

  // Update main product if there are changes
  if (Object.keys(updateData).length > 0) {
    const { error: updateError } = await supabase
      .from('master_products')
      .update(updateData)
      .eq('id', params.id)
      .eq('seller_id', user.id)

    if (updateError) {
      console.error('Product update error:', updateError)
      return Response.json({ success: false, error: updateError.message }, { status: 500 })
    }

    // Also update quantity field to sync with total_stock
    if (updateData.total_stock !== undefined) {
      await supabase
        .from('master_products')
        .update({ quantity: updateData.total_stock })
        .eq('id', params.id)
        .eq('seller_id', user.id)
    }
  }

  // Update variants if provided
  if (body.variants && Array.isArray(body.variants)) {
    let totalVariantStock = 0

    for (const variant of body.variants) {
      if (variant.variant_id && variant.new_stock !== undefined) {
        const { error: variantError } = await supabase
          .from('product_variants')
          .update({ stock: variant.new_stock, quantity: variant.new_stock })
          .eq('id', variant.variant_id)
          .eq('product_id', params.id)

        if (variantError) {
          console.error('Variant update error:', variantError)
        }
        totalVariantStock += variant.new_stock
      }
    }

    // Update master_products.quantity with sum of variant stocks
    if (body.variants.length > 0) {
      await supabase
        .from('master_products')
        .update({ quantity: totalVariantStock, total_stock: totalVariantStock })
        .eq('id', params.id)
        .eq('seller_id', user.id)
    }
  }

  // Fetch updated product
  const { data, error } = await supabase
    .from('master_products')
    .select('*')
    .eq('id', params.id)
    .eq('seller_id', user.id)
    .single()

  if (error) {
    console.error('Product refetch error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }

  return Response.json({ success: true, data })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('master_products')
    .delete()
    .eq('id', params.id)
    .eq('seller_id', user.id)

  if (error) {
    console.error('Product delete error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }

  return Response.json({ success: true })
}
