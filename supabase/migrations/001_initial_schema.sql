-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invites table
CREATE TABLE public.invites (
  code TEXT PRIMARY KEY,
  issued_to_email TEXT,
  max_uses INT DEFAULT 1,
  uses INT DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  size TEXT CHECK (size IN ('half_gallon','gallon')) NOT NULL,
  description TEXT,
  price_cents INT NOT NULL,
  active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment method enum
CREATE TYPE payment_method AS ENUM ('cashapp','zelle');
CREATE TYPE order_status AS ENUM ('pending','awaiting_payment','paid','fulfilled','cancelled');

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL, -- array of {product_id, name, size, qty, price_cents}
  notes TEXT,
  total_cents INT NOT NULL,
  payment payment_method NOT NULL,
  status order_status DEFAULT 'pending',
  confirmation_code TEXT GENERATED ALWAYS AS (
    encode(sha256((id::text || created_at::text)::bytea), 'hex')
  ) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create plans table
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  interval TEXT CHECK (interval IN ('weekly','monthly')) NOT NULL,
  price_cents INT NOT NULL,
  items JSONB NOT NULL, -- default bundle composition
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.plans(id),
  next_run_date DATE NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admins table
CREATE TABLE public.admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: users can read/update own profile, admins can manage all
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
  );

-- Invites: read-only for authenticated users, write for admins
CREATE POLICY "Authenticated users can read invites" ON public.invites
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage invites" ON public.invites
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
  );

-- Products: read-only for authenticated users, write for admins
CREATE POLICY "Authenticated users can read products" ON public.products
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
  );

-- Orders: users can read/insert own, admins can manage all
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all orders" ON public.orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
  );

-- Plans: read-only for authenticated users, write for admins
CREATE POLICY "Authenticated users can read plans" ON public.plans
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage plans" ON public.plans
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
  );

-- Subscriptions: users can read/insert own, admins can manage all
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscriptions" ON public.subscriptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
  );

-- Admins: only admins can read, no one can insert/update/delete
CREATE POLICY "Admins can read admin list" ON public.admins
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
  );

-- Insert seed data
INSERT INTO public.products (name, size, description, price_cents, sort_order) VALUES
  ('Kava Half-Gallon', 'half_gallon', 'Traditional kava root beverage', 2500, 1),
  ('Kava Gallon', 'gallon', 'Traditional kava root beverage', 4500, 2),
  ('Kratom Tea Half-Gallon', 'half_gallon', 'Premium kratom leaf tea', 3000, 3),
  ('Kratom Tea Gallon', 'gallon', 'Premium kratom leaf tea', 5500, 4);

INSERT INTO public.plans (name, description, interval, price_cents, items) VALUES
  ('Weekly Kava Half', 'Weekly delivery of half-gallon kava', 'weekly', 2500, '[{"name": "Kava Half-Gallon", "size": "half_gallon", "qty": 1, "price_cents": 2500}]'),
  ('Monthly Mixed', 'Monthly delivery of mixed beverages', 'monthly', 10000, '[{"name": "Kava Half-Gallon", "size": "half_gallon", "qty": 1, "price_cents": 2500}, {"name": "Kratom Tea Half-Gallon", "size": "half_gallon", "qty": 1, "price_cents": 3000}]'); 