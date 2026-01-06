-- Billing and Shipping Addresses
-- These will be collected when needed (checkout, premium upgrade, etc.)
-- Not during signup to reduce friction

CREATE TABLE IF NOT EXISTS user_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  address_type text NOT NULL CHECK (address_type IN ('billing', 'shipping', 'both')),
  
  -- Address fields
  first_name text NOT NULL,
  last_name text NOT NULL,
  company text,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state_province text,
  postal_code text NOT NULL,
  country_code text NOT NULL, -- ISO 3166-1 alpha-2 (US, CA, GB, etc.)
  phone text,
  
  -- Default address flags
  is_default_billing boolean DEFAULT false,
  is_default_shipping boolean DEFAULT false,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS Policies
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own addresses" 
  ON user_addresses FOR ALL 
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX idx_user_addresses_defaults ON user_addresses(user_id, is_default_billing, is_default_shipping);

-- Partial unique constraints to ensure only one default per type per user
CREATE UNIQUE INDEX idx_user_addresses_default_billing 
  ON user_addresses(user_id, address_type) 
  WHERE is_default_billing = true;

CREATE UNIQUE INDEX idx_user_addresses_default_shipping 
  ON user_addresses(user_id, address_type) 
  WHERE is_default_shipping = true;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_addresses_updated_at 
  BEFORE UPDATE ON user_addresses 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE user_addresses IS 'User billing and shipping addresses - collected at checkout/billing time, not signup';

