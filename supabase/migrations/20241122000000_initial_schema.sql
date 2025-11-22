-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (linked to Supabase Auth users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamp default now()
);

-- PRODUCTS
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text,
  price numeric(12,2) not null,
  image_url text,
  stock integer default 0,
  created_at timestamp default now()
);

-- ORDERS
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  buyer_email text,
  product_id uuid references products(id),
  quantity integer default 1,
  total numeric(12,2) not null,
  status text default 'pending',
  created_at timestamp default now()
);

-- PAYOUTS
create table if not exists payouts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  amount numeric(12,2) not null,
  status text default 'pending',
  created_at timestamp default now()
);

-- Row Level Security Policies
alter table profiles enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table payouts enable row level security;

-- Profiles policies
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

-- Products policies
create policy "Users can view own products" on products
  for select using (auth.uid() = user_id);

create policy "Users can insert own products" on products
  for insert with check (auth.uid() = user_id);

create policy "Users can update own products" on products
  for update using (auth.uid() = user_id);

create policy "Users can delete own products" on products
  for delete using (auth.uid() = user_id);

-- Orders policies
create policy "Users can view own orders" on orders
  for select using (auth.uid() = user_id);

create policy "Users can insert own orders" on orders
  for insert with check (auth.uid() = user_id);

create policy "Users can update own orders" on orders
  for update using (auth.uid() = user_id);

-- Payouts policies
create policy "Users can view own payouts" on payouts
  for select using (auth.uid() = user_id);

create policy "Users can insert own payouts" on payouts
  for insert with check (auth.uid() = user_id);

-- Indexes for performance
create index if not exists idx_products_user_id on products(user_id);
create index if not exists idx_orders_user_id on orders(user_id);
create index if not exists idx_payouts_user_id on payouts(user_id);
create index if not exists idx_orders_product_id on orders(product_id);
