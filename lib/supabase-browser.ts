import { createClient } from "@supabase/supabase-js";

export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
