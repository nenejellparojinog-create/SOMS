-- ============================================================
-- SOMS — Student Organization Management System
-- Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- USERS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name     TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  avatar_url    TEXT,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- ORGANIZATIONS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS organizations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  category    TEXT NOT NULL CHECK (category IN ('academic','cultural','sports','civic','religious','technical')),
  logo_url    TEXT,
  banner_url  TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_by  UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- MEMBERSHIPS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS memberships (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  role            TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member','officer','president')),
  joined_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- ─────────────────────────────────────────────
-- EVENTS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  location        TEXT NOT NULL,
  event_date      TIMESTAMPTZ NOT NULL,
  end_date        TIMESTAMPTZ,
  image_url       TEXT,
  is_published    BOOLEAN DEFAULT true,
  created_by      UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- DOCUMENTS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  file_url        TEXT NOT NULL,
  file_name       TEXT NOT NULL,
  file_size       INTEGER NOT NULL,
  file_type       TEXT NOT NULL,
  document_type   TEXT NOT NULL DEFAULT 'other' CHECK (document_type IN ('requirement','minutes','report','other')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_memberships_user       ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_org        ON memberships(organization_id);
CREATE INDEX IF NOT EXISTS idx_memberships_status     ON memberships(status);
CREATE INDEX IF NOT EXISTS idx_events_org             ON events(organization_id);
CREATE INDEX IF NOT EXISTS idx_events_date            ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_documents_user         ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_org          ON documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_organizations_active   ON organizations(is_active);

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────
-- Disable RLS for service role access (backend uses service key)
ALTER TABLE users         DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE memberships   DISABLE ROW LEVEL SECURITY;
ALTER TABLE events        DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents     DISABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- SUPABASE STORAGE BUCKET
-- ─────────────────────────────────────────────
-- Run this separately in Supabase dashboard → Storage → New Bucket:
-- Bucket name: soms-files
-- Public: true
-- Allowed MIME types: image/*, application/pdf, application/msword,
--   application/vnd.openxmlformats-officedocument.wordprocessingml.document,
--   application/vnd.ms-excel,
--   application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
-- Max file size: 10MB

-- ─────────────────────────────────────────────
-- SEED DATA (Optional — for testing)
-- ─────────────────────────────────────────────

-- Insert admin user (password: admin123)
INSERT INTO users (email, password_hash, full_name, role) VALUES
  ('admin@soms.edu', '$2a$12$LQv3c1yqBwlVZy1uZ0RV8.QTXBlqrFEzPlmL5K/e6N1t3CeZ7N5Wy', 'System Admin', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert student user (password: student123)
INSERT INTO users (email, password_hash, full_name, role) VALUES
  ('student@soms.edu', '$2a$12$LQv3c1yqBwlVZy1uZ0RV8.QTXBlqrFEzPlmL5K/e6N1t3CeZ7N5Wy', 'Juan dela Cruz', 'user')
ON CONFLICT (email) DO NOTHING;
