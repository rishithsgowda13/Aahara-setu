# 🚀 Aahara Setu: Unified Supabase & Data Architecture

This document tracks the complete SQL schema and data architecture for **Aahara Setu**. Use these scripts in the Supabase SQL Editor to initialize or update your database. All queries use `IF NOT EXISTS` to ensure safety.

---

## 1. Core Extensions
We use `postgis` for location-based matching (finding donors within 2km) and `uuid-ossp` for primary keys.

```sql
-- Enable PostGIS for geography logic
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## 2. Global Database Schema

### Profiles Table
Stores unified user data for Donors, Receivers, and Admins.

```sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT CHECK (role IN ('donor', 'receiver', 'admin')) NOT NULL,
  organization_name TEXT, 
  fssai_id TEXT, -- Mandatory for Donor Verification
  phone_number TEXT,
  avatar_url TEXT,
  coords geography(POINT, 4326), 
  kindness_score INT DEFAULT 0, -- Gamification
  trust_score INT DEFAULT 50 CHECK (trust_score BETWEEN 0 AND 100),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Donations Table
Tracks all surplus food listings. Includes SOS/Disaster relief support.

```sql
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_id UUID REFERENCES public.profiles(id) NOT NULL,
  food_name TEXT NOT NULL,
  category TEXT NOT NULL,
  dietary_type TEXT DEFAULT 'Veg',
  is_disaster BOOLEAN DEFAULT FALSE, -- SOS / Relief Mode
  quantity_value NUMERIC NOT NULL,
  quantity_unit TEXT NOT NULL,
  expiry_time TIMESTAMPTZ NOT NULL,
  pickup_location geography(POINT, 4326) NOT NULL,
  urgency_score INT DEFAULT 0,
  is_audit_approved BOOLEAN DEFAULT FALSE,
  status TEXT CHECK (status IN ('available', 'claiming', 'claimed', 'expired', 'completed')) DEFAULT 'available',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Claims Table
Triggered when a Receiver initiates a rescue.

```sql
CREATE TABLE IF NOT EXISTS public.claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donation_id UUID REFERENCES public.donations(id) NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'dispatched', 'delivered', 'cancelled')) DEFAULT 'pending',
  verification_code TEXT DEFAULT upper(substring(uuid_generate_v4()::text, 1, 6)),
  proof_images TEXT[], -- Evidence for impact verification
  created_at TIMESTAMPTZ DEFAULT NOW(),
  fulfilled_at TIMESTAMPTZ
);
```

### Receiver Demands Table (Wishlist/Priority)
Power the "Aahara AI Match" system by allowing NGOs to set needs.

```sql
CREATE TABLE IF NOT EXISTS public.receiver_demands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receiver_id UUID REFERENCES public.profiles(id) NOT NULL,
  food_item TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'high',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Disaster Alerts Table
Drives the emergency response portal.

```sql
CREATE TABLE IF NOT EXISTS public.disaster_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  location_point geography(POINT, 4326) NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  needs TEXT[], -- e.g., ['Water', 'Cooked Meals']
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. Advanced Geospatial Logic (RPC)

Run this function to enable the "Nearby Food" discovery engine.

```sql
CREATE OR REPLACE FUNCTION get_nearby_food(
  user_lon FLOAT, 
  user_lat FLOAT, 
  radius_meters INT DEFAULT 5000
)
RETURNS TABLE (
  id UUID, 
  food_name TEXT, 
  donor_name TEXT,
  distance_meters FLOAT, 
  urgency_score INT,
  is_disaster BOOLEAN
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id, 
    d.food_name, 
    p.organization_name,
    ST_Distance(d.pickup_location, ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography) AS distance,
    d.urgency_score,
    d.is_disaster
  FROM public.donations d
  JOIN public.profiles p ON d.donor_id = p.id
  WHERE d.status = 'available'
    AND ST_DWithin(d.pickup_location, ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography, radius_meters)
  ORDER BY d.is_disaster DESC, d.urgency_score DESC, distance ASC;
END;
$$;
```

---

## 4. Automation & AI Trust Functions

### Automatic Profile Creation
Ensures Auth users always have a database profile.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unnamed User'), 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'donor')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created 
  AFTER INSERT ON auth.users 
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Impact & Kindness Scoring
Updates scores automatically upon successful food delivery.

```sql
CREATE OR REPLACE FUNCTION update_impact_scores()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.status = 'delivered' AND OLD.status != 'delivered') THEN
    -- Reward Donor
    UPDATE public.profiles 
    SET kindness_score = kindness_score + 100, 
        trust_score = LEAST(trust_score + 2, 100) 
    WHERE id = (SELECT donor_id FROM public.donations WHERE id = NEW.donation_id);
    
    -- Reward Receiver
    UPDATE public.profiles SET kindness_score = kindness_score + 50 WHERE id = NEW.receiver_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_impact_event 
  AFTER UPDATE ON public.claims 
  FOR EACH ROW EXECUTE FUNCTION update_impact_scores();
```

---

## 5. Security & Real-Time Sync

```sql
-- Step 1: Enable RLS on core tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receiver_demands ENABLE ROW LEVEL SECURITY;

-- Step 2: Global Read Policy (Simplified for hackathon)
CREATE POLICY "Public profiles are viewable by all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Available donations are viewable by all" ON public.donations FOR SELECT USING (status = 'available');

-- Step 3: Role-Based Creation Policies
CREATE POLICY "Donors can list food" ON public.donations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'donor')
);

-- Step 4: Real-Time Sync Activation
-- Run this to enable the Live Dashboard features
DROP PUBLICATION IF EXISTS aahara_setu_realtime;
CREATE PUBLICATION aahara_setu_realtime FOR TABLE 
  public.donations, 
  public.claims,
  public.disaster_alerts;
```
