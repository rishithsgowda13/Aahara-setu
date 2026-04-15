# Aahara Setu: Supervisor Database Schema

This document tracks the SQL schema and data architecture for tracking food donations, receiver engagements, and redistribution efficiency on Supabase.

## 🗄️ Supabase SQL Schema

Run these commands in your Supabase SQL Editor to set up the backend.

```sql
-- 1. Profiles: Unified table for Donors and Receivers
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  organization_name TEXT,
  role TEXT CHECK (role IN ('donor', 'receiver')),
  fssai_id TEXT, -- Mandatory for Donors
  phone TEXT,
  location TEXT,
  trust_score INT DEFAULT 80,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Donations: Tracking every donated item
CREATE TABLE donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  donor_id UUID REFERENCES profiles(id),
  food_name TEXT NOT NULL,
  quantity TEXT NOT NULL,
  category TEXT,
  expiry_time TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  latitude FLOAT,
  longitude FLOAT,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'claimed', 'expired', 'redistributed')),
  urgency_score INT, -- AI calculated
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Claims: Tracking every receiver and their pick-ups
CREATE TABLE claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  donation_id UUID REFERENCES donations(id),
  receiver_id UUID REFERENCES profiles(id),
  quantity_claimed TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'delivered', 'verified', 'cancelled')),
  proof_images TEXT[], -- URLs of the 3+ proof images uploaded by NGO
  verification_status TEXT DEFAULT 'pending_admin' CHECK (verification_status IN ('pending_admin', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Impact Analytics: Aggregated data for Leaderboards
CREATE VIEW impact_summary AS
SELECT 
  p.organization_name,
  p.role,
  COUNT(d.id) FILTER (WHERE p.role = 'donor') as total_donations,
  COUNT(c.id) FILTER (WHERE p.role = 'receiver') as total_claims,
  SUM(CASE WHEN c.status = 'verified' THEN 1 ELSE 0 END) as verified_impact_count
FROM profiles p
LEFT JOIN donations d ON p.id = d.donor_id
LEFT JOIN claims c ON p.id = c.receiver_id
GROUP BY p.id, p.organization_name, p.role;
```

## 🔒 Security & Real-time
The following RLS (Row Level Security) ensures only verified receivers see active donations:

```sql
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Logged in users can see available food" 
ON donations FOR SELECT 
USING (status = 'available' AND auth.role() = 'authenticated');
```

## 📊 Business Logic Requirements
- **Donors**: Must have a valid `fssai_id` in their profile to insert into the `donations` table.
- **Receivers**: Accounts are auto-locked if `claims` status is `delivered` but `proof_images` is empty for more than 2 records.
