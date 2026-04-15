# 🚀 Aahara Setu: Supabase Backend & Database Setup Guide

This document contains all the SQL code required to initialize the full backend architecture for Aahara Setu. Execute these queries in your **Supabase SQL Editor** to set up the database, security policies, real-time engines, and geo-spatial matching logic.

---

## 1. Core extensions & Initialization
We use `postgis` for ultra-fast location matching (finding donors within 2km) and `uuid-ossp` for secure unique identifiers.

```sql
-- Enable PostGIS for geography data types and location-based logic
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable UUID generation for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## 2. Main Database Schema
Run this to create the primary structural tables.

```sql
/**
 * 👤 PROFILES TABLE
 * Links directly to Supabase Auth users for name, role, and location storage.
 */
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT CHECK (role IN ('donor', 'receiver_ngo', 'volunteer', 'individual')) NOT NULL,
  organization_name TEXT, -- e.g., 'McDonalds', 'Akshaya Patra'
  phone_number TEXT,
  avatar_url TEXT,
  coords geography(POINT, 4326), -- Precise lat/lon
  kindness_score INT DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

/**
 * 🍱 FOOD DONATIONS TABLE
 * Tracks all surplus food listings.
 */
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_id UUID REFERENCES public.profiles(id) NOT NULL,
  food_name TEXT NOT NULL,
  category TEXT CHECK (category IN ('Main Course', 'Fast Food', 'Bakery', 'Dessert', 'Healthy', 'Mixed')) NOT NULL,
  quantity_value NUMERIC NOT NULL,
  quantity_unit TEXT NOT NULL, -- e.g., 'kg', 'portions', 'liters'
  expiry_time TIMESTAMPTZ NOT NULL,
  pickup_address TEXT NOT NULL,
  pickup_location geography(POINT, 4326) NOT NULL,
  urgency_score INT DEFAULT 0 CHECK (urgency_score BETWEEN 0 AND 100),
  status TEXT CHECK (status IN ('available', 'claiming', 'claimed', 'expired', 'completed')) DEFAULT 'available',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

/**
 * 🤝 CLAIMS TABLE
 * Triggers when an NGO or Individual initiates a claim.
 */
CREATE TABLE public.claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donation_id UUID REFERENCES public.donations(id) NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) NOT NULL,
  requested_quantity NUMERIC NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'dispatched', 'delivered', 'cancelled')) DEFAULT 'pending',
  verification_code TEXT DEFAULT upper(substring(uuid_generate_v4()::text, 1, 6)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  fulfilled_at TIMESTAMPTZ
);

/**
 * 🔔 NOTIFICATIONS TABLE
 * Stores real-time alerts for users.
 */
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('success', 'warning', 'urgent', 'info')) DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. Advanced Geo-Spatial Functions
Use this function to fetch donations within a specific radius of a user.

```sql
/**
 * Function: get_donations_nearby_donors
 * Returns donations sorted by proximity and urgency.
 */
CREATE OR REPLACE FUNCTION get_nearby_donations(
  user_lon DOUBLE PRECISION,
  user_lat DOUBLE PRECISION,
  radius_meters INT DEFAULT 5000
)
RETURNS TABLE (
  id UUID,
  food_name TEXT,
  donor_name TEXT,
  distance_meters FLOAT,
  urgency_score INT
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id, 
    d.food_name, 
    p.organization_name,
    ST_Distance(d.pickup_location, ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography) AS distance,
    d.urgency_score
  FROM public.donations d
  JOIN public.profiles p ON d.donor_id = p.id
  WHERE d.status = 'available'
    AND ST_DWithin(d.pickup_location, ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography, radius_meters)
  ORDER BY d.urgency_score DESC, distance ASC;
END;
$$;
```

---

## 4. Automation: Urgency & Kindness Triggers
Automate backend logic for scores and notifications.

```sql
/**
 * Trigger: Add kindness points on successful delivery
 */
CREATE OR REPLACE FUNCTION award_kindness_points()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    -- Reward Donor
    UPDATE public.profiles 
    SET kindness_score = kindness_score + 50 
    WHERE id = (SELECT donor_id FROM public.donations WHERE id = NEW.donation_id);
    
    -- Reward Receiver
    UPDATE public.profiles 
    SET kindness_score = kindness_score + 10 
    WHERE id = NEW.receiver_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_claim_fulfilled
AFTER UPDATE ON public.claims
FOR EACH ROW EXECUTE FUNCTION award_kindness_points();
```

---

## 5. Row Level Security (RLS) Policies
Lock down your data so users can only touch what they own.

```sql
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can view profiles, but only users edit themselves
CREATE POLICY "Public profiles are readable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can edit own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Donations: Anyone can see available food. Only donors can create.
CREATE POLICY "Donations are visible to all" ON public.donations FOR SELECT USING (true);
CREATE POLICY "Donors can create donations" ON public.donations FOR INSERT WITH CHECK (auth.uid() = donor_id);
CREATE POLICY "Donors can edit own donations" ON public.donations FOR UPDATE USING (auth.uid() = donor_id);

-- Claims: Users see their own claims or claims on their items
CREATE POLICY "Claims visibility" ON public.claims FOR SELECT USING (
  auth.uid() = receiver_id OR 
  auth.uid() IN (SELECT donor_id FROM public.donations WHERE id = donation_id)
);

-- Notifications: Strictly private
CREATE POLICY "Private notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
```

---

## 6. Enable Real-Time
Run this to ensure the frontend updates instantly when a new donation is posted or a claim status changes.

```sql
-- Step 1: Create a publication for real-time tables
CREATE PUBLICATION aahara_setu_realtime FOR TABLE public.donations, public.claims, public.notifications;

-- Step 2: Ensure tables are added to Supabase replication
ALTER TABLE public.donations REPLICA IDENTITY FULL;
ALTER TABLE public.claims REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
```
