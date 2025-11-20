# Commart Seller Panel

A modern, production-ready seller dashboard built with Next.js 14, Supabase, and n8n webhooks.

## Features

- **Authentication**: Email + password login with Supabase Auth
- **Dashboard**: KPI overview with real-time metrics
- **Products**: Full CRUD operations for product management
- **Orders**: Order listing and status management
- **Finance**: Earnings tracking and payout history
- **Store Settings**: Configure store preferences and notifications

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Automation**: n8n Webhooks

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Supabase account
- n8n instance (optional, for webhook automation)

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/commartllc/commart-seller-panel.git
cd commart-seller-panel
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Fill in your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
N8N_WEBHOOK_PRODUCT_UPDATE=https://your-n8n-instance.com/webhook/product-update
N8N_WEBHOOK_ORDER_UPDATE=https://your-n8n-instance.com/webhook/order-update
```

### 4. Set up Supabase database

Create the following tables in your Supabase project:

```sql
-- Products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  category TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES auth.users(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  items JSONB,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Finance table
CREATE TABLE finance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES auth.users(id) UNIQUE,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  pending_payouts DECIMAL(10,2) DEFAULT 0,
  completed_payouts DECIMAL(10,2) DEFAULT 0,
  last_payout_date TIMESTAMP WITH TIME ZONE,
  transactions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Store settings table
CREATE TABLE store_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES auth.users(id) UNIQUE,
  store_name TEXT,
  store_url TEXT,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  order_notifications BOOLEAN DEFAULT true,
  marketing_notifications BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can only see their own products" ON products
  FOR ALL USING (auth.uid() = seller_id);

CREATE POLICY "Users can only see their own orders" ON orders
  FOR ALL USING (auth.uid() = seller_id);

CREATE POLICY "Users can only see their own finance" ON finance
  FOR ALL USING (auth.uid() = seller_id);

CREATE POLICY "Users can only see their own settings" ON store_settings
  FOR ALL USING (auth.uid() = seller_id);
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## n8n Webhook Integration

The panel triggers webhooks on the following events:

### Product Events
- `product.created` - When a new product is added
- `product.updated` - When a product is modified
- `product.deleted` - When a product is removed

### Order Events
- `order.created` - When a new order is placed
- `order.status_updated` - When order status changes
- `order.cancelled` - When an order is cancelled

### Webhook Payload Format

```json
{
  "event": "product.created",
  "data": {
    "id": "uuid",
    "name": "Product Name",
    ...
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "seller_id": "uuid"
}
```

## Deployment

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed deployment instructions.

## Project Structure

```
commart-seller-panel/
├── app/
│   ├── api/
│   │   ├── products/
│   │   ├── orders/
│   │   ├── finance/
│   │   └── store/
│   ├── login/
│   ├── products/
│   ├── orders/
│   ├── finance/
│   ├── store/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── DashboardLayout.tsx
│   └── Sidebar.tsx
├── lib/
│   ├── auth.ts
│   ├── n8n.ts
│   └── supabase.ts
├── styles/
├── .env.example
├── README.md
└── VERCEL_DEPLOYMENT.md
```

## License

MIT
