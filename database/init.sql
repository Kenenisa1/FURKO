-- FURKO CivicTech Platform - Database Initialization Script
-- Target Pilot: Jimma City, Ethiopia

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. INSTITUTIONS
CREATE TABLE IF NOT EXISTS institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. USERS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('citizen', 'staff', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'citizen',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    default_priority VARCHAR(20) DEFAULT 'medium',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. LOCATIONS
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    geom GEOMETRY(Point, 4326),
    address_text TEXT,
    landmark VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_locations_geom ON locations USING GIST (geom);

-- 5. ROUTING RULES
CREATE TABLE IF NOT EXISTS routing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    target_institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    jurisdiction_name VARCHAR(150) NOT NULL,
    location_bounds GEOMETRY(Polygon, 4326),
    priority_weight INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_routing_rules_bounds ON routing_rules USING GIST (location_bounds);

-- 6. REPORTS
DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('submitted', 'under_review', 'in_progress', 'resolved', 'rejected');
    CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracking_number VARCHAR(50) NOT NULL UNIQUE,
    citizen_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
    current_institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status report_status NOT NULL DEFAULT 'submitted',
    verification_status verification_status NOT NULL DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium',
    resolution_information TEXT,
    is_fallback BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reports_institution ON reports(current_institution_id);
CREATE INDEX IF NOT EXISTS idx_reports_citizen ON reports(citizen_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- 7. ATTACHMENTS
DO $$ BEGIN
    CREATE TYPE attachment_type AS ENUM ('evidence', 'resolution_proof');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    uploaded_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type attachment_type NOT NULL DEFAULT 'evidence',
    mime_type VARCHAR(100),
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. ASSIGNMENTS
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    to_institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
    assigned_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL DEFAULT 'direct_routing',
    justification_notes TEXT,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. STATUS HISTORY
CREATE TABLE IF NOT EXISTS status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    changed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    previous_status report_status,
    new_status report_status NOT NULL,
    comment TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. CITIZEN FEEDBACK
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL UNIQUE REFERENCES reports(id) ON DELETE CASCADE,
    citizen_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SEED DATA FOR JIMMA CITY PILOT

-- 1. Pilot Institutions
INSERT INTO institutions (id, name, code, description, contact_email, contact_phone) VALUES
('a1000000-0000-0000-0000-000000000001', 'Jimma City Road & Infrastructure Development Bureau', 'JIMA-ROAD', 'Responsible for urban road networks, paving, potholes, and drainage canals.', 'roads@jimma.gov.et', '+251471112233'),
('a1000000-0000-0000-0000-000000000002', 'Jimma City Water & Sewerage Authority', 'JIMA-WATER', 'Responsible for drinking water pipes, leaks, water shortages, and sewage systems.', 'water@jimma.gov.et', '+251471113344'),
('a1000000-0000-0000-0000-000000000003', 'Jimma City Sanitation & Waste Management Office', 'JIMA-WASTE', 'Responsible for solid waste collection, municipal dumpsters, and street cleaning.', 'waste@jimma.gov.et', '+251471114455'),
('a1000000-0000-0000-0000-000000000004', 'Ethiopian Electric Utility (EEU) - Jimma Branch', 'EEU-JIMMA', 'Responsible for electric distribution grids, transformers, power lines, and public streetlights.', 'eeu.jimma@eeu.gov.et', '+251471115566')
ON CONFLICT (code) DO NOTHING;

-- 2. Core Problem Categories
INSERT INTO categories (id, name, slug, description, default_priority) VALUES
('b1000000-0000-0000-0000-000000000001', 'Roads & Streets', 'roads-streets', 'Damaged road surfaces, dangerous potholes, broken sidewalk pavers, or blocked culverts.', 'high'),
('b1000000-0000-0000-0000-000000000002', 'Water & Sewerage', 'water-sewerage', 'Main pipeline leaks, broken public taps, contaminated water, or overflowing sewer drains.', 'high'),
('b1000000-0000-0000-0000-000000000003', 'Waste Management', 'waste-management', 'Overflowing public waste containers, unauthorized garbage heaps, or skipped collection schedules.', 'medium'),
('b1000000-0000-0000-0000-000000000004', 'Street Lighting & Power', 'lighting-power', 'Non-functional streetlights, dangling electrical cables, or damaged utility poles.', 'high')
ON CONFLICT (name) DO NOTHING;

-- 3. Spatial Routing Rules (Jimma City Perimeter Polygon: approx 7.64 - 7.72 N, 36.80 - 36.88 E)
INSERT INTO routing_rules (category_id, target_institution_id, jurisdiction_name, location_bounds, priority_weight) VALUES
(
    'b1000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001',
    'Jimma Municipality Road Jurisdiction',
    ST_GeomFromText('POLYGON((36.80 7.64, 36.88 7.64, 36.88 7.72, 36.80 7.72, 36.80 7.64))', 4326),
    10
),
(
    'b1000000-0000-0000-0000-000000000002',
    'a1000000-0000-0000-0000-000000000002',
    'Jimma Water & Sewerage Jurisdiction',
    ST_GeomFromText('POLYGON((36.80 7.64, 36.88 7.64, 36.88 7.72, 36.80 7.72, 36.80 7.64))', 4326),
    10
),
(
    'b1000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000003',
    'Jimma Sanitation & Waste Jurisdiction',
    ST_GeomFromText('POLYGON((36.80 7.64, 36.88 7.64, 36.88 7.72, 36.80 7.72, 36.80 7.64))', 4326),
    10
),
(
    'b1000000-0000-0000-0000-000000000004',
    'a1000000-0000-0000-0000-000000000004',
    'EEU Jimma Electric & Lighting Jurisdiction',
    ST_GeomFromText('POLYGON((36.80 7.64, 36.88 7.64, 36.88 7.72, 36.80 7.72, 36.80 7.64))', 4326),
    10
);
