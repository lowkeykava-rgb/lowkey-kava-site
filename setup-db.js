const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function setupDatabase() {
  console.log('🚀 Setting up Lowkey Kava Orders database...')
  
  try {
    // Create profiles table
    console.log('📋 Creating profiles table...')
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.profiles (
          user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          email TEXT UNIQUE NOT NULL,
          name TEXT,
          phone TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    // Create invites table
    console.log('📋 Creating invites table...')
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.invites (
          code TEXT PRIMARY KEY,
          issued_to_email TEXT,
          max_uses INT DEFAULT 1,
          uses INT DEFAULT 0,
          expires_at TIMESTAMP WITH TIME ZONE,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    // Create products table
    console.log('📋 Creating products table...')
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.products (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          size TEXT CHECK (size IN ('half_gallon','gallon')) NOT NULL,
          description TEXT,
          price_cents INT NOT NULL,
          active BOOLEAN DEFAULT true,
          sort_order INT DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    // Create payment method enum
    console.log('📋 Creating payment method enum...')
    await supabase.rpc('exec_sql', {
      sql: `
        DO $$ BEGIN
          CREATE TYPE payment_method AS ENUM ('cashapp','zelle');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `
    })
    
    // Create order status enum
    console.log('📋 Creating order status enum...')
    await supabase.rpc('exec_sql', {
      sql: `
        DO $$ BEGIN
          CREATE TYPE order_status AS ENUM ('pending','awaiting_payment','paid','fulfilled','cancelled');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `
    })
    
    // Create orders table
    console.log('📋 Creating orders table...')
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.orders (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          items JSONB NOT NULL,
          notes TEXT,
          total_cents INT NOT NULL,
          payment payment_method NOT NULL,
          status order_status DEFAULT 'pending',
          confirmation_code TEXT GENERATED ALWAYS AS (
            encode(sha256((id::text || created_at::text)::bytea), 'hex')
          ) STORED,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    // Create plans table
    console.log('📋 Creating plans table...')
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.plans (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          description TEXT,
          interval TEXT CHECK (interval IN ('weekly','monthly')) NOT NULL,
          price_cents INT NOT NULL,
          items JSONB NOT NULL,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    // Create subscriptions table
    console.log('📋 Creating subscriptions table...')
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.subscriptions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          plan_id UUID NOT NULL REFERENCES public.plans(id),
          next_run_date DATE NOT NULL,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    // Create admins table
    console.log('📋 Creating admins table...')
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.admins (
          user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    // Enable RLS
    console.log('🔒 Enabling Row Level Security...')
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
      `
    })
    
    // Add sample products
    console.log('📦 Adding sample products...')
    await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO public.products (name, size, description, price_cents, sort_order) VALUES
          ('Kava Half-Gallon', 'half_gallon', 'Traditional kava root beverage', 2500, 1),
          ('Kava Gallon', 'gallon', 'Traditional kava root beverage', 4500, 2),
          ('Kratom Tea Half-Gallon', 'half_gallon', 'Premium kratom leaf tea', 3000, 3),
          ('Kratom Tea Gallon', 'gallon', 'Premium kratom leaf tea', 5500, 4)
        ON CONFLICT DO NOTHING;
      `
    })
    
    // Add the WELCOME2024 invite code
    console.log('🎫 Adding WELCOME2024 invite code...')
    await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO public.invites (code, max_uses, expires_at) VALUES
          ('WELCOME2024', 100, '2024-12-31')
        ON CONFLICT (code) DO NOTHING;
      `
    })
    
    console.log('✅ Database setup complete!')
    console.log('🎉 You can now use invite code: WELCOME2024')
    
  } catch (error) {
    console.error('❌ Error setting up database:', error)
  }
}

setupDatabase()
