# DOCUMENT 4: DATABASE DESIGN SPECIFICATION

**Project:** FURKO — CivicTech Platform  
**Database Engine:** PostgreSQL 16+ with PostGIS 3.4+ Extension  
**Document ID:** FURKO-DB-V2.0  

---

## 1. Schema Overview

The database manages 10 core entities designed for transactional consistency, geospatial indexing, and complete accountability auditing:

1. `users` (Citizens, Institution Staff, Administrators)
2. `institutions` (Public utilities, municipal bureaus)
3. `categories` (Roads, Water, Waste, Streetlights)
4. `locations` (Geographic coordinates, addresses, PostGIS points)
5. `reports` (Central incident entity with tracking numbers)
6. `routing_rules` (Category + PostGIS polygon geometries to target institution)
7. `assignments` (1-to-many audit trail of institutional dispatches & redirects)
8. `status_history` (1-to-many audit trail of status progression)
9. `attachments` (Photo evidence and resolution proofs)
10. `feedback` (Post-resolution citizen ratings and comments)

---

## 2. PostgreSQL + PostGIS DDL Specification

```sql
-- Enable PostGIS extension for spatial routing
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. INSTITUTIONS
CREATE TABLE institutions (
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
CREATE TYPE user_role AS ENUM ('citizen', 'staff', 'admin');

CREATE TABLE users (
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
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    default_priority VARCHAR(20) DEFAULT 'medium',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. LOCATIONS
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    geom GEOMETRY(Point, 4326),
    address_text TEXT,
    landmark VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_locations_geom ON locations USING GIST (geom);

-- 5. ROUTING RULES (Spatial boundary mapping)
CREATE TABLE routing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    target_institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    jurisdiction_name VARCHAR(150) NOT NULL,
    location_bounds GEOMETRY(Polygon, 4326),
    priority_weight INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_routing_rules_bounds ON routing_rules USING GIST (location_bounds);

-- 6. REPORTS
CREATE TYPE report_status AS ENUM (
    'submitted',
    'under_review',
    'in_progress',
    'resolved',
    'rejected'
);

CREATE TYPE verification_status AS ENUM (
    'pending',
    'verified',
    'rejected'
);

CREATE TABLE reports (
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

CREATE INDEX idx_reports_institution ON reports(current_institution_id);
CREATE INDEX idx_reports_citizen ON reports(citizen_id);
CREATE INDEX idx_reports_status ON reports(status);

-- 7. ATTACHMENTS (Evidence and resolution photos)
CREATE TYPE attachment_type AS ENUM ('evidence', 'resolution_proof');

CREATE TABLE attachments (
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

-- 8. ASSIGNMENTS (Immutable Institutional Audit Trail)
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    to_institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
    assigned_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL DEFAULT 'direct_routing', -- 'direct_routing', 'reassignment', 'manual_dispatch'
    justification_notes TEXT,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. STATUS HISTORY (Immutable Lifecycle Progression)
CREATE TABLE status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    changed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    previous_status report_status,
    new_status report_status NOT NULL,
    comment TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. CITIZEN FEEDBACK
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL UNIQUE REFERENCES reports(id) ON DELETE CASCADE,
    citizen_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```
