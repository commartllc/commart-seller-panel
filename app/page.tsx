import { supabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import DashboardContent from '@/components/dashboard/DashboardContent'

interface Notification {
  id: string
  seller_id: string
  title: string
  message: string
  created_at: string
}

async function getKPIs(sellerId: string) {
  const supabase = supabaseServer()

  // Fetch products count
  const { count: productsCount } = await supabase
    .from('master_products')
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

async function getNotifications(sellerId: string): Promise<Notification[]> {
  const supabase = supabaseServer()

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('Notifications fetch error:', error)
    return []
  }

  return data || []
}

export default async function DashboardPage() {
  const supabase = supabaseServer()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const [kpis, notifications] = await Promise.all([
    getKPIs(session.user.id),
    getNotifications(session.user.id)
  ])

  return <DashboardContent kpis={kpis} notifications={notifications} />
}
