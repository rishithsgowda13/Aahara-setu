# 🚀 Aahara Setu: Supabase Backend & Database Setup Guide

This document contains all the SQL code required to initialize the full backend architecture for Aahara Setu. Execute these queries in your **Supabase SQL Editor** to set up the database, security policies, real-time engines, and geo-spatial matching logic.

---

## 1. Core Extensions & Initialization
We use `postgis` for ultra-fast location matching (finding donors within 2km) and `uuid-ossp` for secure unique identifiers.

```sql
-- Enable PostGIS for geography data types and location-based logic
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable UUID generation for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## 2. Main Database Schema
Run this to create the primary structural tables. Modified to include FSSAI verification and improved role management.

```sql
/**
 * 👤 PROFILES TABLE
 * Links directly to Supabase Auth users.
 */
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT CHECK (role IN ('donor', 'receiver')) NOT NULL,
  organization_name TEXT, 
  fssai_id TEXT, -- Required for Donor Verification
  phone_number TEXT,
  avatar_url TEXT,
  coords geography(POINT, 4326), 
  kindness_score INT DEFAULT 0,
  trust_score INT DEFAULT 50 CHECK (trust_score BETWEEN 0 AND 100), -- AI Trust Score
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
  category TEXT NOT NULL,
  dietary_type TEXT DEFAULT 'Veg',
  quantity_value NUMERIC NOT NULL,
  quantity_unit TEXT NOT NULL,
  expiry_time TIMESTAMPTZ NOT NULL,
  pickup_address TEXT NOT NULL,
  pickup_location geography(POINT, 4326) NOT NULL,
  urgency_score INT DEFAULT 0,
  is_audit_approved BOOLEAN DEFAULT FALSE, -- Set by AI Audit System
  status TEXT CHECK (status IN ('available', 'claiming', 'claimed', 'expired', 'completed')) DEFAULT 'available',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

/**
 * 🤝 CLAIMS TABLE
 * Triggers when a Receiver initiates a claim.
 */
CREATE TABLE public.claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donation_id UUID REFERENCES public.donations(id) NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'dispatched', 'delivered', 'cancelled')) DEFAULT 'pending',
  verification_code TEXT DEFAULT upper(substring(uuid_generate_v4()::text, 1, 6)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  fulfilled_at TIMESTAMPTZ
);

/**
 * ⚠️ DISASTER ALERTS TABLE
 * Drives the Disaster Relief Portal.
 */
CREATE TABLE public.disaster_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_name TEXT NOT NULL,
  location_point geography(POINT, 4326) NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  affected_count INT,
  needs TEXT[], -- e.g., ['Water', 'Cooked Meals', 'Blankets']
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. PostGIS: Urgency-Based Matching
This function powers the discovery engine, sorting food by proximity and expiry urgency.

```sql
CREATE OR REPLACE FUNCTION get_nearby_food(
  user_lon DOUBLE PRECISION,
  user_lat DOUBLE PRECISION,
  radius_meters INT DEFAULT 5000
)
RETURNS TABLE (
  id UUID,
  food_name TEXT,
  donor_name TEXT,
  distance_meters FLOAT,
  urgency_score INT,
  dietary_type TEXT
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id, 
    d.food_name, 
    p.organization_name,
    ST_Distance(d.pickup_location, ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography) AS distance,
    d.urgency_score,
    d.dietary_type
  FROM public.donations d
  JOIN public.profiles p ON d.donor_id = p.id
  WHERE d.status = 'available'
    AND ST_DWithin(d.pickup_location, ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography, radius_meters)
  ORDER BY d.urgency_score DESC, distance ASC;
END;
$$;
```

---

## 4. Automation & AI Trust Logic
Maintains data integrity and gamifies the experience.

```sql
/**
 * Function: award_kindness_points
 * Updates kindness score and trust scores upon successful delivery.
 */
CREATE OR REPLACE FUNCTION update_impact_scores()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    -- Donor Rewards: Points + Trust boost
    UPDATE public.profiles 
    SET kindness_score = kindness_score + 100,
        trust_score = LEAST(trust_score + 5, 100)
    WHERE id = (SELECT donor_id FROM public.donations WHERE id = NEW.donation_id);
    
    -- Receiver Rewards: Impact pts
    UPDATE public.profiles 
    SET kindness_score = kindness_score + 25 
    WHERE id = NEW.receiver_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_impact_event
AFTER UPDATE ON public.claims
FOR EACH ROW EXECUTE FUNCTION update_impact_scores();
```

---

## 5. Security: Role-Based RLS
Ensures Donors can only create listings and Receivers can only claim.

```sql
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

-- Policy: Only verified donors can list food
CREATE POLICY "Donors can create donations" ON public.donations 
FOR INSERT WITH CHECK (
  auth.uid() = donor_id AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'donor')
);

-- Policy: Only receivers can initiate claims
CREATE POLICY "Receivers can initiate claims" ON public.claims 
FOR INSERT WITH CHECK (
  auth.uid() = receiver_id AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'receiver')
);
```

---

## 6. Global Real-Time Sync
Enables instant coordination for the logistics engine.

```sql
-- Enable Realtime for core tables
CREATE PUBLICATION aahara_setu_realtime FOR TABLE 
  public.donations, 
  public.claims, 
  public.disaster_alerts;

ALTER TABLE public.donations REPLICA IDENTITY FULL;
ALTER TABLE public.claims REPLICA IDENTITY FULL;
```
