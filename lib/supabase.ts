import { createClient } from '@supabase/supabase-js'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Client-side Supabase client
export function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Server-side Supabase client (for Server Components and Route Handlers)
export function createSupabaseServer() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookie errors in Server Components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle cookie errors in Server Components
          }
        },
      },
    }
  )
}

// Admin client with service role key (for server-side operations only)
export function createSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Types for database tables
export interface Product {
  id: string
  seller_id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  image_url: string
  status: 'active' | 'inactive' | 'draft'
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  seller_id: string
  customer_name: string
  customer_email: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface OrderItem {
  product_id: string
  product_name: string
  quantity: number
  price: number
}

export interface StoreSettings {
  id: string
  seller_id: string
  store_name: string
  store_url: string
  email_notifications: boolean
  sms_notifications: boolean
  order_notifications: boolean
  marketing_notifications: boolean
  created_at: string
  updated_at: string
}

export interface Finance {
  id: string
  seller_id: string
  total_earnings: number
  pending_payouts: number
  completed_payouts: number
  last_payout_date: string
  transactions: Transaction[]
}

export interface Transaction {
  id: string
  type: 'sale' | 'payout' | 'refund' | 'fee'
  amount: number
  description: string
  created_at: string
}
