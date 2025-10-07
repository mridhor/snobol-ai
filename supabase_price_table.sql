-- Create table for storing current Snobol price
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS snobol_current_price (
  id BIGSERIAL PRIMARY KEY,
  current_price DECIMAL(10, 2) NOT NULL DEFAULT 18.49,
  current_sp500_price DECIMAL(10, 2) NOT NULL DEFAULT 3.30,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial default values
INSERT INTO snobol_current_price (current_price, current_sp500_price)
VALUES (18.49, 3.30)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE snobol_current_price ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON snobol_current_price
  FOR SELECT
  USING (true);

-- Create policy to allow authenticated updates (you can adjust this based on your needs)
CREATE POLICY "Allow public update access" ON snobol_current_price
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create policy to allow insert
CREATE POLICY "Allow public insert access" ON snobol_current_price
  FOR INSERT
  WITH CHECK (true);

-- Create index on updated_at for better query performance
CREATE INDEX idx_snobol_current_price_updated_at ON snobol_current_price(updated_at);

