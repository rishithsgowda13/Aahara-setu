-- ==========================================
-- 🔄 AAHARA SETU: FULL DATABASE RESET
-- ==========================================

-- 1. DROP THE OLD TABLE (Restarting everything)
DROP TABLE IF EXISTS food_listings CASCADE;

-- 2. CREATE THE FRESH TABLE
CREATE TABLE food_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  donor TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity TEXT NOT NULL,
  expires_in TEXT NOT NULL,
  distance TEXT DEFAULT '0.4 km',
  demand TEXT DEFAULT 'High',
  urgency_score INTEGER DEFAULT 85,
  urgency_level TEXT DEFAULT 'high',
  dietary TEXT DEFAULT 'None',
  address TEXT NOT NULL,
  phone TEXT DEFAULT '+91 98765 43210'
);

-- 3. ENABLE REAL-TIME (Crucial for the demo)
-- This allows the Discovery feed to update without refresh!
ALTER PUBLICATION supabase_realtime ADD TABLE food_listings;

-- 4. ENABLE PUBLIC ACCESS ( demo convenience )
ALTER TABLE food_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON food_listings FOR ALL USING (true);

-- 5. (OPTIONAL) INSERT DEMO STARTER DATA
INSERT INTO food_listings (name, donor, category, quantity, expires_in, distance, demand, address)
VALUES 
('Fresh Paneer Curry', 'Haldiram''s', 'North Indian', '20 portions', '45 mins', '0.4 km', 'Very High', 'Indiranagar, Bangalore'),
('Fried Chicken Bucket', 'KFC', 'Fast Food', '15 pieces', '30 mins', '0.8 km', 'Very High', 'Koramangala, Bangalore');
