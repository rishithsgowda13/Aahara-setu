# 🏛️ Aahara Setu: Complete Supabase SQL Master Manifest

This file contains the segmented SQL logic for the entire Aahara Setu ecosystem. Run these blocks in the Supabase SQL Editor.

---

## 🟢 PART 1: Core Infrastructure & Extensions
Enable the required engines for geospatial matching and identity.

```sql
-- Enable PostGIS for radius-based matching (e.g., finding food within 5km)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable UUID generation for secure primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## 🟢 PART 2: User Identity (Profiles)
Stores roles (Donor/Receiver), organizations, and the **AI Trust Core**.

```sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT CHECK (role IN ('donor', 'receiver', 'admin')) NOT NULL,
  organization_name TEXT, 
  fssai_id TEXT, -- Required for Donor validation
  phone_number TEXT,
  avatar_url TEXT,
  location_name TEXT,
  coords geography(POINT, 4326), 
  kindness_score INT DEFAULT 0, -- Gamification points
  trust_score INT DEFAULT 50 CHECK (trust_score BETWEEN 0 AND 100), -- AI Trust Rating
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AUTO-UPDATE: Sync Auth users to Profiles table
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

-- Trigger only if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        CREATE TRIGGER on_auth_user_created 
        AFTER INSERT ON auth.users 
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;
```

---

## 🟢 PART 3: Donor Operations (Food Inputs)
Stores food listings, expiry data, and urgency parameters.

```sql
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_id UUID REFERENCES public.profiles(id) NOT NULL,
  food_name TEXT NOT NULL,
  category TEXT NOT NULL,
  dietary_type TEXT DEFAULT 'Veg',
  is_disaster BOOLEAN DEFAULT FALSE, -- SOS / Emergency Mode
  quantity_value NUMERIC NOT NULL,
  quantity_unit TEXT NOT NULL,
  expiry_time TIMESTAMPTZ NOT NULL,
  location_name TEXT,
  pickup_location geography(POINT, 4326) NOT NULL,
  urgency_score INT DEFAULT 0, -- Computed by Part 7
  status TEXT CHECK (status IN ('available', 'claiming', 'claimed', 'expired', 'completed')) DEFAULT 'available',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🟢 PART 4: Receiver & NGO Operations (Food Outputs)
Manages the "Aahara AI Match" wishlist and the claim workflow.

```sql
-- NGO Wishlist: "I need Rice & Sambar at High Priority"
CREATE TABLE IF NOT EXISTS public.receiver_demands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receiver_id UUID REFERENCES public.profiles(id) NOT NULL,
  food_item TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'high',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Claim Logic: When an NGO clicks "Claim Now"
CREATE TABLE IF NOT EXISTS public.claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donation_id UUID REFERENCES public.donations(id) NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'dispatched', 'delivered', 'cancelled')) DEFAULT 'pending',
  verification_code TEXT DEFAULT upper(substring(uuid_generate_v4()::text, 1, 6)),
  proof_images TEXT[], -- NGO must upload delivery proof
  created_at TIMESTAMPTZ DEFAULT NOW(),
  fulfilled_at TIMESTAMPTZ
);
```

---

## 🟢 PART 5: Emergency Response (Disaster Alerts)
Powers the Disaster Portal with live relief coordination zones.

```sql
CREATE TABLE IF NOT EXISTS public.disaster_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  location_name TEXT,
  location_point geography(POINT, 4326) NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  people_in_need INT DEFAULT 0,
  needs TEXT[], -- e.g., ['Water', 'Cooked Meals']
  impact_desc TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🟢 PART 6: Traceability & Audit Logs
Unlocks "Chain of Custody" for safety tracking.

```sql
CREATE TABLE IF NOT EXISTS public.traceability_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donation_id UUID REFERENCES public.donations(id),
  action TEXT NOT NULL, -- e.g., 'VERIFIED_DONOR', 'LOGISTICS_PICKUP', 'FINAL_RESCUE'
  performer_id UUID REFERENCES public.profiles(id),
  location_snapshot geography(POINT, 4326),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB -- Safety audit details
);
```

---

## 🟢 PART 7: AI Engine Logic (Urgency & Trust)
The internal brain that calculates scores and rewards partners.

```sql
-- RPC: Find food within X kilometers, priority to Disasters
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

-- AUTOMATION: Reward Trust & Kindness scores on successful delivery
CREATE OR REPLACE FUNCTION update_impact_scores()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.status = 'delivered' AND OLD.status != 'delivered') THEN
    -- Reward Donor Trust
    UPDATE public.profiles 
    SET kindness_score = kindness_score + 100, 
        trust_score = LEAST(trust_score + 2, 100) 
    WHERE id = (SELECT donor_id FROM public.donations WHERE id = NEW.donation_id);
    
    -- Reward Receiver Impact
    UPDATE public.profiles SET kindness_score = kindness_score + 50 WHERE id = NEW.receiver_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_impact_event') THEN
        CREATE TRIGGER on_impact_event 
        AFTER UPDATE ON public.claims 
        FOR EACH ROW EXECUTE FUNCTION update_impact_scores();
    END IF;
END $$;
```

---

## 🟢 PART 8: Data Security (RLS) & Real-Time Sync
Ensures data isolation between roles and powers live notifications.

```sql
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receiver_demands ENABLE ROW LEVEL SECURITY;

-- Sample Policies
CREATE POLICY "Profiles are readable by all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Donors manage own listings" ON public.donations USING (auth.uid() = donor_id);
CREATE POLICY "Receivers see available food" ON public.donations FOR SELECT USING (status = 'available');

-- REAL-TIME SYNC
-- Run this once to enable Dashboard live updates
DROP PUBLICATION IF EXISTS aahara_setu_realtime;
CREATE PUBLICATION aahara_setu_realtime FOR TABLE 
  public.donations, 
  public.claims,
  public.disaster_alerts;
```
