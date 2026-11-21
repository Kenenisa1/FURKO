-- ==============================================================================
-- Migration: 001_institution_rbac_and_transfers.sql
-- Description: Institution RBAC, Branches, Report Assignment & Transfers, Audit Logs
-- Target: FURKO CivicTech Platform - Jimma Pilot
-- ==============================================================================

-- 1. Extend user_role enum for RBAC
DO $$ BEGIN
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'institution_super_admin';
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'branch_manager';
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'institution_staff';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Extend report_status enum for complete workflow
DO $$ BEGIN
    ALTER TYPE report_status ADD VALUE IF NOT EXISTS 'assigned';
    ALTER TYPE report_status ADD VALUE IF NOT EXISTS 'submitted_for_review';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Create Branches Table
CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL,
    address TEXT,
    contact_phone VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_branches_institution_code UNIQUE (institution_id, code)
);

CREATE INDEX IF NOT EXISTS idx_branches_institution ON branches(institution_id);

-- 4. Add branch references to users and reports
ALTER TABLE users ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS current_branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS resolution_notes TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_users_branch ON users(branch_id);
CREATE INDEX IF NOT EXISTS idx_reports_branch ON reports(current_branch_id);

-- 5. Create Report Transfers Table
DO $$ BEGIN
    CREATE TYPE transfer_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS report_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    source_branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    destination_branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    source_institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    destination_institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    initiated_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    reviewed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    review_notes TEXT,
    status transfer_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_report_transfers_report ON report_transfers(report_id);
CREATE INDEX IF NOT EXISTS idx_report_transfers_dest_branch ON report_transfers(destination_branch_id);
CREATE INDEX IF NOT EXISTS idx_report_transfers_status ON report_transfers(status);

-- 6. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_institution ON audit_logs(institution_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- 7. Seed Initial Pilot Branches for Jimma City Institutions
INSERT INTO branches (id, institution_id, name, code, address, contact_phone) VALUES
('d1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Central District Maintenance Branch', 'ROAD-CENTRAL', 'Jimma Aba Jifar Way, Kebele 02', '+251471112233'),
('d1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Ginjo & Higher Education Road Unit', 'ROAD-GINJO', 'Ginjo Guduru Rd, Kebele 07', '+251471112234'),
('d1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 'Central Water & Treatment Plant', 'WATER-CENTRAL', 'Boye Lake Water Works, Kebele 04', '+251471113344'),
('d1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'Bacho Bore Pipelines Unit', 'WATER-BACHO', 'Bacho Bore Ring Rd, Kebele 11', '+251471113345'),
('d1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000003', 'Main Sanitation Operations Unit', 'WASTE-MAIN', 'Hirmata Market Office, Kebele 01', '+251471114455'),
('d1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000004', 'Grid & Streetlighting Maintenance Unit', 'EEU-LIGHTING', 'EEU Jimma Substation, Kebele 03', '+251471115566')
ON CONFLICT (institution_id, code) DO NOTHING;
