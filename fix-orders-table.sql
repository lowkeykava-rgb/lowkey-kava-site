-- Drop the orders table if it exists (to fix the generation expression error)
DROP TABLE IF EXISTS public.orders;

-- Create orders table without the problematic generated column
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL, -- array of {product_id, name, size, qty, price_cents}
  notes TEXT,
  total_cents INT NOT NULL,
  payment payment_method NOT NULL,
  status order_status DEFAULT 'pending',
  confirmation_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id);

-- Create a function to generate confirmation codes
CREATE OR REPLACE FUNCTION generate_confirmation_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.confirmation_code := encode(sha256((NEW.id::text || extract(epoch from NEW.created_at)::text)::bytea), 'hex');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate confirmation codes
CREATE TRIGGER set_confirmation_code
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_confirmation_code();
