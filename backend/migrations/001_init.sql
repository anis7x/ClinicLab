-- ClinicLab Database Schema
-- Migration 001: Initial tables

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUM Types (use IF NOT EXISTS pattern via DO blocks)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('PATIENT', 'LAB_ADMIN', 'CLINIC_ADMIN', 'PLATFORM_ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE subscription_tier AS ENUM ('FREE', 'SILVER', 'GOLD');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'PATIENT',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Patient Profiles
CREATE TABLE IF NOT EXISTS profiles_patient (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    date_of_birth DATE,
    gender VARCHAR(10),
    blood_type VARCHAR(5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Professional Profiles (Labs & Clinics)
CREATE TABLE IF NOT EXISTS profiles_professional (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(20) NOT NULL DEFAULT 'clinic',
    phone_number VARCHAR(50),
    address_text TEXT,
    subscription_tier subscription_tier DEFAULT 'FREE',
    subscription_status subscription_status DEFAULT 'ACTIVE',
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Wilayas reference table
CREATE TABLE IF NOT EXISTS wilayas (
    id VARCHAR(5) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    ar_name VARCHAR(100) NOT NULL
);

-- Medical services catalog
CREATE TABLE IF NOT EXISTS medical_services (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL
);

-- Providers (clinics/labs visible in search)
CREATE TABLE IF NOT EXISTS providers (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    type VARCHAR(20) NOT NULL, -- 'clinic' or 'lab'
    wilaya VARCHAR(100) NOT NULL,
    wilaya_id VARCHAR(5) REFERENCES wilayas(id),
    city VARCHAR(100),
    address TEXT,
    phone VARCHAR(50),
    rating NUMERIC(2,1) DEFAULT 0,
    reviews_count INT DEFAULT 0,
    image TEXT,
    open_hours VARCHAR(50),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Provider services (junction with extra data)
CREATE TABLE IF NOT EXISTS provider_services (
    id SERIAL PRIMARY KEY,
    provider_id VARCHAR(20) REFERENCES providers(id) ON DELETE CASCADE,
    service_id VARCHAR(20) REFERENCES medical_services(id),
    name VARCHAR(255) NOT NULL,
    price INT DEFAULT 0,
    turnaround VARCHAR(50),
    doctor_name VARCHAR(100),
    doctor_specialty VARCHAR(100),
    doctor_experience VARCHAR(50),
    equipment_name VARCHAR(100),
    equipment_type VARCHAR(100),
    equipment_origin VARCHAR(100)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_providers_wilaya ON providers(wilaya);
CREATE INDEX IF NOT EXISTS idx_providers_type ON providers(type);
CREATE INDEX IF NOT EXISTS idx_provider_services_provider ON provider_services(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_services_name ON provider_services(name);
