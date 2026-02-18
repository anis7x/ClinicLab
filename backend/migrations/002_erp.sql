-- ClinicLab ERP Schema
-- Migration 002: ERP modules for Clinic El Widad
-- Modules: Reception, Patients/EMR, Appointments, Billing, Dashboard,
--          Hospitalization, Operating Theater, Laboratory, HR, Accounting

-- =====================================================
-- ENUM TYPES
-- =====================================================

DO $$ BEGIN CREATE TYPE gender_type AS ENUM ('male', 'female'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE blood_type AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE insurance_type AS ENUM ('CNAS', 'CASNOS', 'MUTUAL', 'PRIVATE', 'NONE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE marital_status AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE appointment_status AS ENUM ('SCHEDULED', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE admission_type AS ENUM ('PLANNED', 'URGENT', 'TRANSFER'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE admission_status AS ENUM ('ADMITTED', 'IN_TREATMENT', 'DISCHARGED', 'TRANSFERRED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE bed_status AS ENUM ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE surgery_status AS ENUM ('SCHEDULED', 'PRE_OP', 'IN_PROGRESS', 'POST_OP', 'COMPLETED', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE invoice_status AS ENUM ('DRAFT', 'ISSUED', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE payment_method AS ENUM ('CASH', 'CHECK', 'BANK_TRANSFER', 'CARD', 'CHIFA'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE lab_test_status AS ENUM ('ORDERED', 'SAMPLE_COLLECTED', 'IN_PROGRESS', 'COMPLETED', 'VALIDATED', 'DELIVERED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE staff_role AS ENUM ('DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB_TECH', 'ANESTHETIST', 'SURGEON', 'ACCOUNTANT', 'HR', 'ADMIN', 'OTHER'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE contract_type AS ENUM ('CDI', 'CDD', 'FREELANCE', 'INTERN'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE leave_type AS ENUM ('ANNUAL', 'SICK', 'MATERNITY', 'PATERNITY', 'UNPAID', 'OTHER'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE leave_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================================================
-- MODULE 1: RECEPTION (check-in, queue)
-- =====================================================

-- Clinic departments/services
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ar VARCHAR(255) NOT NULL,
    name_fr VARCHAR(255) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    floor_number INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Staff members (must be created early — referenced by many modules)
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Identity
    full_name_ar VARCHAR(255) NOT NULL,
    full_name_fr VARCHAR(255),
    nin VARCHAR(30),
    date_of_birth DATE,
    gender gender_type,
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    
    -- Job
    staff_role staff_role NOT NULL,
    specialty_ar VARCHAR(100),
    specialty_fr VARCHAR(100),
    department_id UUID REFERENCES departments(id),
    contract_type contract_type DEFAULT 'CDI',
    hire_date DATE,
    end_date DATE,
    
    -- Salary
    base_salary NUMERIC(12,2) DEFAULT 0,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MODULE 2: PATIENTS / EMR
-- =====================================================

-- Extended patient records (ERP-level, separate from platform patient profiles)
CREATE TABLE IF NOT EXISTS erp_patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Link to platform user (optional, for patients who registered online)
    platform_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Identity
    nin VARCHAR(30) UNIQUE,               -- National ID number (NIN)
    chifa_number VARCHAR(30),             -- CHIFA card number
    full_name_ar VARCHAR(255) NOT NULL,
    full_name_fr VARCHAR(255),
    date_of_birth DATE,
    gender gender_type,
    blood_type blood_type,
    marital_status marital_status,
    
    -- Contact
    phone VARCHAR(50),
    phone_secondary VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    wilaya_id VARCHAR(5) REFERENCES wilayas(id),
    city VARCHAR(100),
    
    -- Insurance
    insurance_type insurance_type DEFAULT 'NONE',
    insurance_number VARCHAR(50),
    insurance_holder_name VARCHAR(255),     -- If insured under someone else
    insurance_coverage_pct INT DEFAULT 80,  -- CNAS default 80%
    is_ald BOOLEAN DEFAULT FALSE,           -- Chronic illness = 100% coverage
    
    -- Medical
    allergies TEXT,
    chronic_conditions TEXT,
    notes TEXT,
    
    -- Emergency contact
    emergency_name VARCHAR(255),
    emergency_phone VARCHAR(50),
    emergency_relation VARCHAR(50),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Medical visit history
CREATE TABLE IF NOT EXISTS medical_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES erp_patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES staff(id),
    department_id UUID REFERENCES departments(id),
    
    visit_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    chief_complaint TEXT,                   -- سبب الزيارة
    diagnosis TEXT,                         -- التشخيص
    diagnosis_code VARCHAR(20),             -- ICD-10 code
    treatment_plan TEXT,
    notes TEXT,
    vitals JSONB,                           -- {bp, pulse, temp, weight, height, spo2}
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_id UUID REFERENCES medical_visits(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES erp_patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES staff(id),
    
    prescription_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prescription_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),          -- e.g. "500mg"
    frequency VARCHAR(100),       -- e.g. "3 times daily"
    duration VARCHAR(100),        -- e.g. "7 days"
    quantity INT,
    instructions TEXT              -- e.g. "after meals"
);

-- =====================================================
-- MODULE 3: APPOINTMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES erp_patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES staff(id),
    department_id UUID REFERENCES departments(id),
    
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INT DEFAULT 30,
    status appointment_status DEFAULT 'SCHEDULED',
    
    reason TEXT,                   -- Reason for visit
    notes TEXT,
    is_walk_in BOOLEAN DEFAULT FALSE,
    queue_number INT,              -- For walk-in queue management
    
    -- Reminders
    reminder_sent BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MODULE 4: HOSPITALIZATION (Admission / Discharge)
-- =====================================================

-- Rooms in the clinic
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID REFERENCES departments(id),
    room_number VARCHAR(20) NOT NULL,
    room_type VARCHAR(50) NOT NULL,       -- 'SINGLE', 'SHARED', 'VIP', 'ICU'
    floor_number INT DEFAULT 0,
    daily_rate NUMERIC(10,2) DEFAULT 0,   -- Price per day
    is_active BOOLEAN DEFAULT TRUE
);

-- Beds within rooms
CREATE TABLE IF NOT EXISTS beds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    bed_number VARCHAR(10) NOT NULL,
    status bed_status DEFAULT 'AVAILABLE'
);

-- Hospital admissions
CREATE TABLE IF NOT EXISTS admissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES erp_patients(id) ON DELETE CASCADE,
    bed_id UUID REFERENCES beds(id),
    admitting_doctor_id UUID REFERENCES staff(id),
    department_id UUID REFERENCES departments(id),
    
    admission_type admission_type DEFAULT 'PLANNED',
    status admission_status DEFAULT 'ADMITTED',
    
    admitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    discharged_at TIMESTAMP WITH TIME ZONE,
    
    admission_reason TEXT,
    diagnosis TEXT,
    discharge_summary TEXT,
    discharge_prescriptions TEXT,
    follow_up_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Nursing notes during admission
CREATE TABLE IF NOT EXISTS nursing_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admission_id UUID NOT NULL REFERENCES admissions(id) ON DELETE CASCADE,
    nurse_id UUID REFERENCES staff(id),
    
    note_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    vitals JSONB,
    medications_given TEXT,
    care_notes TEXT,
    observations TEXT
);

-- =====================================================
-- MODULE 5: OPERATING THEATER
-- =====================================================

-- Operating rooms
CREATE TABLE IF NOT EXISTS operating_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ar VARCHAR(100) NOT NULL,
    name_fr VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Surgeries
CREATE TABLE IF NOT EXISTS surgeries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES erp_patients(id) ON DELETE CASCADE,
    admission_id UUID REFERENCES admissions(id),
    operating_room_id UUID REFERENCES operating_rooms(id),
    
    -- Team
    surgeon_id UUID REFERENCES staff(id),
    anesthetist_id UUID REFERENCES staff(id),
    
    -- Details
    procedure_name_ar VARCHAR(255),
    procedure_name_fr VARCHAR(255),
    procedure_code VARCHAR(50),           -- NGAP code
    
    status surgery_status DEFAULT 'SCHEDULED',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    
    -- Pre-op
    consent_signed BOOLEAN DEFAULT FALSE,
    fasting_confirmed BOOLEAN DEFAULT FALSE,
    pre_op_notes TEXT,
    
    -- Intra-op
    anesthesia_type VARCHAR(100),
    operative_notes TEXT,
    complications TEXT,
    
    -- Post-op
    post_op_notes TEXT,
    recovery_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MODULE 6: BILLING / INVOICING
-- =====================================================

-- NGAP medical acts catalog
CREATE TABLE IF NOT EXISTS ngap_acts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    name_fr VARCHAR(255) NOT NULL,
    category_ar VARCHAR(100),
    category_fr VARCHAR(100),
    base_price NUMERIC(10,2) NOT NULL DEFAULT 0,       -- Clinic price
    cnas_tariff NUMERIC(10,2) DEFAULT 0,               -- CNAS reimbursement rate
    is_reimbursable BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,         -- Format: YYYY-NNNN
    patient_id UUID NOT NULL REFERENCES erp_patients(id),
    visit_id UUID REFERENCES medical_visits(id),
    admission_id UUID REFERENCES admissions(id),
    surgery_id UUID REFERENCES surgeries(id),
    
    status invoice_status DEFAULT 'DRAFT',
    
    -- Amounts
    subtotal NUMERIC(12,2) DEFAULT 0,
    cnas_coverage NUMERIC(12,2) DEFAULT 0,             -- Amount covered by CNAS
    mutual_coverage NUMERIC(12,2) DEFAULT 0,           -- Mutuelle coverage
    patient_amount NUMERIC(12,2) DEFAULT 0,            -- Patient co-pay
    discount NUMERIC(12,2) DEFAULT 0,
    total NUMERIC(12,2) DEFAULT 0,
    paid_amount NUMERIC(12,2) DEFAULT 0,
    remaining NUMERIC(12,2) DEFAULT 0,
    
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    due_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Invoice line items
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    ngap_act_id UUID REFERENCES ngap_acts(id),
    
    description_ar VARCHAR(255) NOT NULL,
    description_fr VARCHAR(255),
    quantity INT DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL,
    total NUMERIC(10,2) NOT NULL,
    
    is_cnas_covered BOOLEAN DEFAULT FALSE,
    cnas_rate NUMERIC(10,2) DEFAULT 0               -- CNAS reimbursement for this item
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    
    amount NUMERIC(12,2) NOT NULL,
    method payment_method NOT NULL,
    reference VARCHAR(100),                           -- Check number, transfer ref, etc.
    
    paid_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    received_by UUID REFERENCES staff(id),
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CNAS claims tracking
CREATE TABLE IF NOT EXISTS cnas_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    patient_id UUID NOT NULL REFERENCES erp_patients(id),
    
    claim_amount NUMERIC(12,2) NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(30) DEFAULT 'PENDING',            -- PENDING, SUBMITTED, APPROVED, REJECTED, PAID
    reimbursed_amount NUMERIC(12,2),
    reimbursed_at TIMESTAMP WITH TIME ZONE,
    
    rejection_reason TEXT,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MODULE 7: LABORATORY
-- =====================================================

-- Lab test catalog
CREATE TABLE IF NOT EXISTS lab_tests_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    name_fr VARCHAR(255) NOT NULL,
    category_ar VARCHAR(100),
    category_fr VARCHAR(100),
    price NUMERIC(10,2) DEFAULT 0,
    normal_range VARCHAR(255),
    unit VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE
);

-- Lab orders
CREATE TABLE IF NOT EXISTS lab_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES erp_patients(id) ON DELETE CASCADE,
    ordering_doctor_id UUID REFERENCES staff(id),
    visit_id UUID REFERENCES medical_visits(id),
    
    order_number VARCHAR(50) UNIQUE NOT NULL,
    ordered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    priority VARCHAR(20) DEFAULT 'NORMAL',          -- NORMAL, URGENT
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Lab order items (individual tests)
CREATE TABLE IF NOT EXISTS lab_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lab_order_id UUID NOT NULL REFERENCES lab_orders(id) ON DELETE CASCADE,
    test_id UUID NOT NULL REFERENCES lab_tests_catalog(id),
    
    status lab_test_status DEFAULT 'ORDERED',
    result_value VARCHAR(255),
    result_unit VARCHAR(50),
    is_abnormal BOOLEAN DEFAULT FALSE,
    
    sample_collected_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    validated_by UUID REFERENCES staff(id),
    validated_at TIMESTAMP WITH TIME ZONE,
    
    notes TEXT
);

-- =====================================================
-- MODULE 8: HR (shifts, leave, payroll — staff table created above)
-- =====================================================

-- Shift scheduling
CREATE TABLE IF NOT EXISTS shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    shift_type VARCHAR(30) DEFAULT 'REGULAR',       -- REGULAR, NIGHT, GUARD
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Leave requests
CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    
    leave_type leave_type NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count INT NOT NULL,
    
    status leave_status DEFAULT 'PENDING',
    approved_by UUID REFERENCES staff(id),
    
    reason TEXT,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payroll records
CREATE TABLE IF NOT EXISTS payroll (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    
    -- Earnings
    base_salary NUMERIC(12,2) NOT NULL,
    overtime_hours NUMERIC(6,2) DEFAULT 0,
    overtime_amount NUMERIC(12,2) DEFAULT 0,
    bonuses NUMERIC(12,2) DEFAULT 0,
    gross_salary NUMERIC(12,2) NOT NULL,
    
    -- Deductions (Algerian law)
    cnas_employee NUMERIC(12,2) DEFAULT 0,         -- 9% employee contribution
    cnas_employer NUMERIC(12,2) DEFAULT 0,         -- 26% employer contribution
    irg NUMERIC(12,2) DEFAULT 0,                   -- Income tax (IRG)
    other_deductions NUMERIC(12,2) DEFAULT 0,
    
    net_salary NUMERIC(12,2) NOT NULL,
    
    paid BOOLEAN DEFAULT FALSE,
    paid_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MODULE 9: ACCOUNTING (basic)
-- =====================================================

-- Chart of accounts (SCF - Système Comptable Financier)
CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    name_fr VARCHAR(255) NOT NULL,
    account_type VARCHAR(30) NOT NULL,              -- ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
    parent_code VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE
);

-- Journal entries
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_number VARCHAR(50) UNIQUE NOT NULL,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    reference VARCHAR(100),                          -- Invoice number, payroll ref, etc.
    
    created_by UUID REFERENCES staff(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Journal entry lines (double-entry)
CREATE TABLE IF NOT EXISTS journal_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
    
    debit NUMERIC(12,2) DEFAULT 0,
    credit NUMERIC(12,2) DEFAULT 0,
    description TEXT
);

-- =====================================================
-- MODULE 10: SETTINGS & CLINIC CONFIG
-- =====================================================

-- Clinic configuration
CREATE TABLE IF NOT EXISTS clinic_config (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT
);

-- Audit log for sensitive operations
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    staff_id UUID REFERENCES staff(id),
    
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_erp_patients_nin ON erp_patients(nin);
CREATE INDEX IF NOT EXISTS idx_erp_patients_chifa ON erp_patients(chifa_number);
CREATE INDEX IF NOT EXISTS idx_erp_patients_name ON erp_patients(full_name_ar);
CREATE INDEX IF NOT EXISTS idx_erp_patients_phone ON erp_patients(phone);

CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

CREATE INDEX IF NOT EXISTS idx_admissions_patient ON admissions(patient_id);
CREATE INDEX IF NOT EXISTS idx_admissions_status ON admissions(status);

CREATE INDEX IF NOT EXISTS idx_surgeries_patient ON surgeries(patient_id);
CREATE INDEX IF NOT EXISTS idx_surgeries_date ON surgeries(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_surgeries_status ON surgeries(status);

CREATE INDEX IF NOT EXISTS idx_invoices_patient ON invoices(patient_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(issued_at);

CREATE INDEX IF NOT EXISTS idx_lab_orders_patient ON lab_orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_number ON lab_orders(order_number);

CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(staff_role);
CREATE INDEX IF NOT EXISTS idx_staff_department ON staff(department_id);

CREATE INDEX IF NOT EXISTS idx_medical_visits_patient ON medical_visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_visits_date ON medical_visits(visit_date);

CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_cnas_claims_status ON cnas_claims(status);

CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);

-- =====================================================
-- SEED: Default clinic config
-- =====================================================

INSERT INTO clinic_config (key, value, description) VALUES
    ('clinic_name_ar', 'عيادة الوداد', 'Clinic name in Arabic'),
    ('clinic_name_fr', 'Clinique El Widad', 'Clinic name in French'),
    ('clinic_city', 'خنشلة', 'City'),
    ('clinic_wilaya', 'خنشلة', 'Wilaya'),
    ('clinic_phone', '', 'Phone number'),
    ('clinic_address_ar', 'خنشلة، الجزائر', 'Address in Arabic'),
    ('clinic_address_fr', 'Khenchela, Algérie', 'Address in French'),
    ('default_currency', 'DZD', 'Currency code'),
    ('cnas_coverage_pct', '80', 'Default CNAS coverage percentage'),
    ('ald_coverage_pct', '100', 'ALD (chronic) coverage percentage'),
    ('invoice_prefix', 'WID', 'Invoice number prefix'),
    ('fiscal_year_start', '01-01', 'Start of fiscal year (MM-DD)'),
    ('default_language', 'ar', 'Default UI language')
ON CONFLICT (key) DO NOTHING;

-- Seed: Default departments for a typical Algerian private clinic
INSERT INTO departments (id, name_ar, name_fr, code) VALUES
    (uuid_generate_v4(), 'الاستقبال', 'Accueil', 'RECEPTION'),
    (uuid_generate_v4(), 'الطب العام', 'Médecine Générale', 'MED_GEN'),
    (uuid_generate_v4(), 'الجراحة العامة', 'Chirurgie Générale', 'CHIR_GEN'),
    (uuid_generate_v4(), 'أمراض النساء والتوليد', 'Gynécologie-Obstétrique', 'GYNAECO'),
    (uuid_generate_v4(), 'طب الأطفال', 'Pédiatrie', 'PEDIATR'),
    (uuid_generate_v4(), 'أمراض القلب', 'Cardiologie', 'CARDIO'),
    (uuid_generate_v4(), 'الأشعة', 'Radiologie', 'RADIO'),
    (uuid_generate_v4(), 'المختبر', 'Laboratoire', 'LAB'),
    (uuid_generate_v4(), 'التخدير والإنعاش', 'Anesthésie-Réanimation', 'ANESTH'),
    (uuid_generate_v4(), 'الطوارئ', 'Urgences', 'URGENCE'),
    (uuid_generate_v4(), 'العيادات الخارجية', 'Consultations Externes', 'CONSULT')
ON CONFLICT DO NOTHING;

-- Seed: Default NGAP acts (common acts for private clinics)
INSERT INTO ngap_acts (id, code, name_ar, name_fr, category_ar, category_fr, base_price, cnas_tariff, is_reimbursable) VALUES
    (uuid_generate_v4(), 'C', 'استشارة طبية', 'Consultation médicale', 'استشارة', 'Consultation', 2500, 250, TRUE),
    (uuid_generate_v4(), 'CS', 'استشارة متخصصة', 'Consultation spécialisée', 'استشارة', 'Consultation', 4000, 500, TRUE),
    (uuid_generate_v4(), 'V', 'زيارة منزلية', 'Visite à domicile', 'زيارة', 'Visite', 3000, 300, TRUE),
    (uuid_generate_v4(), 'ECG', 'تخطيط القلب', 'Électrocardiogramme', 'استكشافات', 'Explorations', 3000, 1000, TRUE),
    (uuid_generate_v4(), 'ECHO', 'تصوير بالموجات', 'Échographie', 'أشعة', 'Imagerie', 5000, 2000, TRUE),
    (uuid_generate_v4(), 'RX', 'أشعة سينية', 'Radiographie', 'أشعة', 'Imagerie', 3500, 1500, TRUE),
    (uuid_generate_v4(), 'FNS', 'تعداد الدم الكامل', 'Numération Formule Sanguine', 'مختبر', 'Laboratoire', 1500, 800, TRUE),
    (uuid_generate_v4(), 'GLY', 'تحليل السكر', 'Glycémie', 'مختبر', 'Laboratoire', 500, 300, TRUE),
    (uuid_generate_v4(), 'UREE', 'تحليل اليوريا', 'Urée', 'مختبر', 'Laboratoire', 500, 300, TRUE),
    (uuid_generate_v4(), 'CREAT', 'تحليل الكرياتينين', 'Créatinine', 'مختبر', 'Laboratoire', 500, 300, TRUE),
    (uuid_generate_v4(), 'TC', 'الكوليسترول', 'Cholestérol Total', 'مختبر', 'Laboratoire', 500, 300, TRUE),
    (uuid_generate_v4(), 'TG', 'الدهون الثلاثية', 'Triglycérides', 'مختبر', 'Laboratoire', 500, 300, TRUE),
    (uuid_generate_v4(), 'ANES_G', 'تخدير عام', 'Anesthésie Générale', 'تخدير', 'Anesthésie', 25000, 5000, TRUE),
    (uuid_generate_v4(), 'ANES_L', 'تخدير موضعي', 'Anesthésie Locale', 'تخدير', 'Anesthésie', 5000, 2000, TRUE),
    (uuid_generate_v4(), 'HOSP_J', 'يوم إقامة (غرفة عادية)', 'Journée d''hospitalisation (standard)', 'إقامة', 'Séjour', 8000, 3000, TRUE),
    (uuid_generate_v4(), 'HOSP_VIP', 'يوم إقامة (غرفة خاصة)', 'Journée d''hospitalisation (VIP)', 'إقامة', 'Séjour', 15000, 3000, TRUE),
    (uuid_generate_v4(), 'ACCOU_N', 'ولادة طبيعية', 'Accouchement Normal', 'توليد', 'Obstétrique', 60000, 15000, TRUE),
    (uuid_generate_v4(), 'ACCOU_C', 'عملية قيصرية', 'Césarienne', 'توليد', 'Obstétrique', 120000, 25000, TRUE),
    (uuid_generate_v4(), 'CHIR_APP', 'استئصال الزائدة الدودية', 'Appendicectomie', 'جراحة', 'Chirurgie', 80000, 20000, TRUE),
    (uuid_generate_v4(), 'CHIR_HERN', 'إصلاح الفتق', 'Cure de hernie', 'جراحة', 'Chirurgie', 100000, 25000, TRUE)
ON CONFLICT (code) DO NOTHING;

-- Seed: Default lab tests catalog
INSERT INTO lab_tests_catalog (id, code, name_ar, name_fr, category_ar, category_fr, price, normal_range, unit) VALUES
    (uuid_generate_v4(), 'FNS', 'تعداد الدم الكامل', 'NFS - Numération Formule Sanguine', 'أمراض الدم', 'Hématologie', 1500, '', ''),
    (uuid_generate_v4(), 'VS', 'سرعة التثفل', 'Vitesse de Sédimentation', 'أمراض الدم', 'Hématologie', 500, '< 20 mm/h', 'mm/h'),
    (uuid_generate_v4(), 'TP', 'نسبة البروثرومبين', 'Taux de Prothrombine', 'تخثر', 'Hémostase', 800, '70-100%', '%'),
    (uuid_generate_v4(), 'GLY', 'تحليل السكر', 'Glycémie à jeun', 'كيمياء حيوية', 'Biochimie', 500, '0.70-1.10 g/L', 'g/L'),
    (uuid_generate_v4(), 'HBA1C', 'السكر التراكمي', 'Hémoglobine Glyquée', 'كيمياء حيوية', 'Biochimie', 2500, '< 6.5%', '%'),
    (uuid_generate_v4(), 'UREE', 'اليوريا', 'Urée', 'كيمياء حيوية', 'Biochimie', 500, '0.15-0.45 g/L', 'g/L'),
    (uuid_generate_v4(), 'CREAT', 'الكرياتينين', 'Créatinine', 'كيمياء حيوية', 'Biochimie', 500, '7-13 mg/L', 'mg/L'),
    (uuid_generate_v4(), 'CHOL', 'الكوليسترول الكلي', 'Cholestérol Total', 'كيمياء حيوية', 'Biochimie', 500, '< 2.0 g/L', 'g/L'),
    (uuid_generate_v4(), 'TG', 'الدهون الثلاثية', 'Triglycérides', 'كيمياء حيوية', 'Biochimie', 500, '< 1.5 g/L', 'g/L'),
    (uuid_generate_v4(), 'SGOT', 'ناقلة أمين الأسبارتات', 'Transaminase GOT (ASAT)', 'كيمياء حيوية', 'Biochimie', 500, '< 40 UI/L', 'UI/L'),
    (uuid_generate_v4(), 'SGPT', 'ناقلة أمين الألانين', 'Transaminase GPT (ALAT)', 'كيمياء حيوية', 'Biochimie', 500, '< 40 UI/L', 'UI/L'),
    (uuid_generate_v4(), 'ECBU', 'فحص البول الجرثومي', 'ECBU', 'جراثيم', 'Bactériologie', 1500, '', ''),
    (uuid_generate_v4(), 'GS_RH', 'فصيلة الدم', 'Groupage Sanguin ABO/Rhésus', 'مناعة', 'Immunologie', 1000, '', ''),
    (uuid_generate_v4(), 'CRP', 'بروتين سي التفاعلي', 'Protéine C Réactive', 'مناعة', 'Immunologie', 1200, '< 6 mg/L', 'mg/L'),
    (uuid_generate_v4(), 'TSH', 'هرمون الغدة الدرقية', 'TSH ultra-sensible', 'هرمونات', 'Hormonologie', 2500, '0.27-4.20 mUI/L', 'mUI/L'),
    (uuid_generate_v4(), 'BHCG', 'اختبار الحمل', 'β-HCG', 'هرمونات', 'Hormonologie', 2000, '', 'mUI/mL'),
    (uuid_generate_v4(), 'PSA', 'مستضد البروستاتا', 'PSA Total', 'علامات ورمية', 'Marqueurs Tumoraux', 3000, '< 4.0 ng/mL', 'ng/mL')
ON CONFLICT (code) DO NOTHING;

-- Seed: Operating rooms
INSERT INTO operating_rooms (id, name_ar, name_fr, code) VALUES
    (uuid_generate_v4(), 'غرفة العمليات 1', 'Salle d''opération 1', 'OR1'),
    (uuid_generate_v4(), 'غرفة العمليات 2', 'Salle d''opération 2', 'OR2'),
    (uuid_generate_v4(), 'غرفة الولادة', 'Salle d''accouchement', 'DELIV')
ON CONFLICT (code) DO NOTHING;
