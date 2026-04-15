# Supabase Database Setup Guide

Execute the following SQL queries in your Supabase SQL Editor to initialize the database architecture, security policies, and geo-spatial matching logic for Aahara Setu.

## 1. Enable Required Extensions
We need `postgis` for geo-spatial distance calculations (finding the closest donor).
```sql
-- Enable PostGIS for mapping and proximity matching
CREATE EXTENSION IF NOT EXISTS postgis;
-- Enable UUID generator
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

## 2. Generate Core Tables
Run this to create the primary tables for Users, Food Listings, and Claims.
```sql
-- 👤 USERS TABLE (Extends Supabase Auth Auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('donor', 'ngo', 'volunteer')) NOT NULL,
  phone_number TEXT,
  organization_name TEXT,
  location geography(POINT, 4326), -- PostGIS coordinates
  created_at TIMESTAMPTZ DEFAULT NOW(),
  kindness_score INT DEFAULT 0
);

-- 🍎 FOOD DONATIONS TABLE
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  food_type TEXT CHECK (food_type IN ('Bakery', 'Main Course', 'Dessert', 'Healthy', 'Raw')) NOT NULL,
  quantity TEXT NOT NULL,
  expiry_time TIMESTAMPTZ NOT NULL,
  pickup_location geography(POINT, 4326) NOT NULL,
  urgency_score INT DEFAULT 0, -- Scaled 0 to 100
  status TEXT CHECK (status IN ('available', 'claimed', 'completed', 'expired')) DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 🤝 CLAIMS TABLE (When an NGO accepts the food)
CREATE TABLE public.claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donation_id UUID REFERENCES public.donations(id) NOT NULL,
  claimant_id UUID REFERENCES public.profiles(id) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'fulfilled', 'cancelled')) DEFAULT 'pending',
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  fulfilled_at TIMESTAMPTZ
);
```

## 3. PostGIS Function: Calculate Distance
This creates a function to seamlessly find the nearest available food within a given radius.
```sql
CREATE OR REPLACE FUNCTION get_nearby_food(
    user_lon DOUBLE PRECISION, 
    user_lat DOUBLE PRECISION, 
    max_distance_meters INT
)
RETURNS TABLE (
    donation_id UUID, 
    title TEXT, 
    distance_meters FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    id, 
    title, 
    ST_Distance(pickup_location, ST_MakePoint(user_lon, user_lat)::geography) AS distance
  FROM public.donations
  WHERE status = 'available'
    AND ST_DWithin(pickup_location, ST_MakePoint(user_lon, user_lat)::geography, max_distance_meters)
  ORDER BY distance ASC;
END;
$$ LANGUAGE plpgsql;
```

## 4. Setup Row Level Security (RLS)
This ensures nobody can maliciously alter data. Donors can only edit their own listings.
```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can view profiles, but only the owner can update
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Donations: Anyone can view available donations
CREATE POLICY "Anyone can view available donations" ON public.donations FOR SELECT USING (status = 'available');
-- Only logged-in users who are 'donors' can insert a listing
CREATE POLICY "Donors can insert donations" ON public.donations FOR INSERT WITH CHECK (auth.uid() = donor_id);
-- Donors can update their own listings
CREATE POLICY "Donors can update own donations" ON public.donations FOR UPDATE USING (auth.uid() = donor_id);

-- Claims: Users can only see their own claims or claims on their donations
CREATE POLICY "Users view own claims" ON public.claims FOR SELECT USING (
  auth.uid() = claimant_id OR auth.uid() IN (SELECT donor_id FROM public.donations WHERE id = donation_id)
);
CREATE POLICY "Claimants can insert their claims" ON public.claims FOR INSERT WITH CHECK (auth.uid() = claimant_id);
```

## 5. Enable Real-Time Triggers
This ensures WebSockets instantly notify the React frontend when new food is posted or claimed.
```sql
-- Enable real-time broadcasting for these core tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.donations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.claims;
```
