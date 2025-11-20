import DashboardLayout from '@/components/DashboardLayout'
import { createSupabaseServer } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { TrendingUp, Package, ShoppingCart, DollarSign } from 'lucide-react'

async function getKPIs(sellerId: string) {
  const supabase = createSupabaseServer()

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
  const supabase = createSupabaseServer()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const kpis = await getKPIs(session.user.id)

  const stats = [
    {
      name: 'Total Products',
      value: kpis.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Orders',
      value: kpis.totalOrders,
      icon: ShoppingCart,
      color: 'bg-green-500',
    },
    {
      name: 'Pending Orders',
      value: kpis.pendingOrders,
      icon: TrendingUp,
      color: 'bg-yellow-500',
    },
    {
      name: 'Total Revenue',
      value: `$${kpis.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-purple-500',
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's an overview of your store.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity Placeholder */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <p className="text-gray-500">No recent activity to display.</p>
        </div>
      </div>
    </DashboardLayout>
  )
}
