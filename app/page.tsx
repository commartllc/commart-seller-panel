import { supabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import DashboardContent from '@/components/dashboard/DashboardContent'

async function getKPIs(sellerId: string) {
  const supabase = supabaseServer()

  // Fetch products count
  const { count: productsCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', sellerId)

  // Fetch orders
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('seller_id', sellerId)

  // Fetch finance data
  const { data: finance } = await supabase
    .from('finance')
    .select('*')
    .eq('seller_id', sellerId)
    .single()

  const totalOrders = orders?.length || 0
  const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0
  const totalRevenue = finance?.total_earnings || 0

  return {
    totalProducts: productsCount || 0,
    totalOrders,
    pendingOrders,
    totalRevenue
  }
}

export default async function DashboardPage() {
  const supabase = supabaseServer()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const kpis = await getKPIs(session.user.id)

  return <DashboardContent kpis={kpis} />
}
