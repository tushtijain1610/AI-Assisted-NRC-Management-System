-- NRC Management System Database Schema
-- Complete SQL structure for all entities

-- =============================================
-- USERS AND AUTHENTICATION
-- =============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('anganwadi_worker', 'supervisor', 'hospital')),
    contact_number VARCHAR(15),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ANGANWADI CENTERS
-- =============================================

CREATE TABLE anganwadi_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    location_area VARCHAR(255) NOT NULL,
    location_district VARCHAR(255) NOT NULL,
    location_state VARCHAR(255) NOT NULL,
    location_pincode VARCHAR(10),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    supervisor_name VARCHAR(255),
    supervisor_contact VARCHAR(15),
    supervisor_employee_id VARCHAR(50),
    capacity_pregnant_women INTEGER DEFAULT 0,
    capacity_children INTEGER DEFAULT 0,
    facilities TEXT[], -- Array of facilities
    coverage_areas TEXT[], -- Array of coverage areas
    established_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- WORKERS
-- =============================================

CREATE TABLE workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('head', 'supervisor', 'helper', 'asha')),
    anganwadi_id UUID REFERENCES anganwadi_centers(id),
    contact_number VARCHAR(15) NOT NULL,
    address TEXT,
    assigned_areas TEXT[], -- Array of assigned areas
    qualifications TEXT[], -- Array of qualifications
    working_hours_start TIME,
    working_hours_end TIME,
    emergency_contact_name VARCHAR(255),
    emergency_contact_relation VARCHAR(100),
    emergency_contact_number VARCHAR(15),
    join_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- PATIENTS
-- =============================================

CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number VARCHAR(100) UNIQUE NOT NULL,
    aadhaar_number VARCHAR(20) UNIQUE,
    name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('child', 'pregnant')),
    pregnancy_week INTEGER, -- Only for pregnant women
    contact_number VARCHAR(15) NOT NULL,
    emergency_contact VARCHAR(15),
    address TEXT NOT NULL,
    weight DECIMAL(5,2) NOT NULL,
    height DECIMAL(5,2) NOT NULL,
    blood_pressure VARCHAR(20),
    temperature DECIMAL(4,1),
    hemoglobin DECIMAL(4,1),
    nutrition_status VARCHAR(50) NOT NULL CHECK (nutrition_status IN ('normal', 'malnourished', 'severely_malnourished')),
    medical_history TEXT[], -- Array of medical history
    symptoms TEXT[], -- Array of current symptoms
    documents TEXT[], -- Array of document names
    photos TEXT[], -- Array of photo URLs
    remarks TEXT,
    risk_score INTEGER DEFAULT 0,
    nutritional_deficiency TEXT[], -- Array of deficiencies
    bed_id UUID, -- Reference to assigned bed
    last_visit_date DATE,
    next_visit_date DATE,
    registered_by VARCHAR(50) REFERENCES users(employee_id),
    registration_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- MEDICAL RECORDS
-- =============================================

CREATE TABLE medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    visit_type VARCHAR(50) NOT NULL CHECK (visit_type IN ('routine', 'emergency', 'follow_up', 'admission', 'discharge')),
    health_worker_id VARCHAR(50) REFERENCES users(employee_id),
    
    -- Vitals
    weight DECIMAL(5,2) NOT NULL,
    height DECIMAL(5,2) NOT NULL,
    temperature DECIMAL(4,1),
    blood_pressure VARCHAR(20),
    pulse INTEGER,
    respiratory_rate INTEGER,
    oxygen_saturation INTEGER,
    
    -- Clinical Information
    symptoms TEXT[], -- Array of symptoms
    diagnosis TEXT[], -- Array of diagnoses
    treatment TEXT[], -- Array of treatments
    
    -- Nutrition Assessment
    appetite VARCHAR(20) CHECK (appetite IN ('poor', 'moderate', 'good')),
    food_intake VARCHAR(20) CHECK (food_intake IN ('inadequate', 'adequate', 'excessive')),
    supplements TEXT[], -- Array of supplements
    diet_plan TEXT,
    
    -- Lab Results
    hemoglobin DECIMAL(4,1),
    blood_sugar DECIMAL(5,1),
    protein_level DECIMAL(4,1),
    
    -- Notes and Follow-up
    notes TEXT,
    next_visit_date DATE,
    follow_up_required BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- MEDICATIONS
-- =============================================

CREATE TABLE medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medical_record_id UUID NOT NULL REFERENCES medical_records(id),
    name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- BEDS AND HOSPITALS
-- =============================================

CREATE TABLE hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    contact_number VARCHAR(15),
    total_beds INTEGER DEFAULT 0,
    nrc_equipped BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE beds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID NOT NULL REFERENCES hospitals(id),
    number VARCHAR(20) NOT NULL,
    ward VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
    patient_id UUID REFERENCES patients(id),
    admission_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hospital_id, number)
);

-- =============================================
-- BED REQUESTS
-- =============================================

CREATE TABLE bed_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    requested_by VARCHAR(50) REFERENCES users(employee_id),
    request_date DATE DEFAULT CURRENT_DATE,
    urgency_level VARCHAR(20) NOT NULL CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')),
    medical_justification TEXT NOT NULL,
    current_condition TEXT NOT NULL,
    estimated_stay_duration INTEGER NOT NULL,
    special_requirements TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'cancelled')),
    reviewed_by VARCHAR(50) REFERENCES users(employee_id),
    review_date DATE,
    review_comments TEXT,
    hospital_referral JSONB, -- For hospital referral details
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- VISITS AND SCHEDULING
-- =============================================

CREATE TABLE visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    health_worker_id VARCHAR(50) REFERENCES users(employee_id),
    scheduled_date DATE NOT NULL,
    actual_date DATE,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'missed', 'rescheduled')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- MISSED VISIT TICKETS
-- =============================================

CREATE TABLE missed_visit_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    visit_id UUID REFERENCES visits(id),
    date_reported DATE DEFAULT CURRENT_DATE,
    reported_by VARCHAR(50) REFERENCES users(employee_id),
    
    -- Missed Conditions (stored as JSONB for flexibility)
    missed_conditions JSONB NOT NULL,
    
    -- Attempt Details
    attempt_time TIME,
    location_visited TEXT,
    contact_method VARCHAR(50),
    
    -- Patient Condition
    current_health_status VARCHAR(50),
    urgency_level VARCHAR(20) CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')),
    visible_symptoms TEXT[],
    family_reported_concerns TEXT[],
    
    -- Actions and Follow-up
    actions_taken TEXT[],
    follow_up_required BOOLEAN DEFAULT true,
    next_attempt_date DATE,
    supervisor_notified BOOLEAN DEFAULT false,
    
    -- Status and Escalation
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'escalated')),
    escalation_level VARCHAR(20) DEFAULT 'none' CHECK (escalation_level IN ('none', 'supervisor', 'district', 'state')),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TREATMENT TRACKING
-- =============================================

CREATE TABLE treatment_trackers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    hospital_id UUID NOT NULL REFERENCES hospitals(id),
    admission_date DATE NOT NULL DEFAULT CURRENT_DATE,
    discharge_date DATE,
    treatment_plan TEXT[] NOT NULL,
    doctor_remarks TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE daily_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    treatment_tracker_id UUID NOT NULL REFERENCES treatment_trackers(id),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    weight DECIMAL(5,2) NOT NULL,
    appetite VARCHAR(20) CHECK (appetite IN ('poor', 'moderate', 'good')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE medicine_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    treatment_tracker_id UUID NOT NULL REFERENCES treatment_trackers(id),
    medicine VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lab_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    treatment_tracker_id UUID NOT NULL REFERENCES treatment_trackers(id),
    type VARCHAR(255) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    results TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE discharge_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    treatment_tracker_id UUID NOT NULL REFERENCES treatment_trackers(id),
    final_weight DECIMAL(5,2) NOT NULL,
    health_improvement TEXT NOT NULL,
    follow_up_instructions TEXT[] NOT NULL,
    next_checkup_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- SURVEYS AND REPORTS
-- =============================================

CREATE TABLE survey_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    health_worker_id VARCHAR(50) REFERENCES users(employee_id),
    date DATE DEFAULT CURRENT_DATE,
    observations TEXT NOT NULL,
    
    -- Nutrition Data
    appetite VARCHAR(20) CHECK (appetite IN ('poor', 'moderate', 'good')),
    food_intake VARCHAR(20) CHECK (food_intake IN ('inadequate', 'adequate', 'excessive')),
    supplements TEXT[],
    
    symptoms TEXT[],
    recommendations TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- AI PREDICTIONS
-- =============================================

CREATE TABLE ai_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    date DATE DEFAULT CURRENT_DATE,
    predicted_recovery_days INTEGER NOT NULL,
    confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    risk_factors TEXT[] NOT NULL,
    recommendations TEXT[] NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- NOTIFICATIONS
-- =============================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_role VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    action_required BOOLEAN DEFAULT false,
    read BOOLEAN DEFAULT false,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ANGANWADI VISIT TICKETS
-- =============================================

CREATE TABLE anganwadi_visit_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anganwadi_id UUID NOT NULL REFERENCES anganwadi_centers(id),
    worker_id UUID NOT NULL REFERENCES workers(id),
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    assigned_area VARCHAR(255) NOT NULL,
    visit_type VARCHAR(50) NOT NULL CHECK (visit_type IN ('routine_checkup', 'nutrition_survey', 'vaccination', 'emergency', 'follow_up')),
    target_pregnant_women INTEGER DEFAULT 0,
    target_children INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'missed', 'cancelled')),
    reported_by VARCHAR(50) REFERENCES users(employee_id),
    reported_date DATE DEFAULT CURRENT_DATE,
    escalation_level VARCHAR(20) DEFAULT 'none',
    
    -- Completion Details (JSONB for flexibility)
    completion_details JSONB,
    missed_reason JSONB,
    supervisor_comments TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- User indexes
CREATE INDEX idx_users_employee_id ON users(employee_id);
CREATE INDEX idx_users_role ON users(role);

-- Patient indexes
CREATE INDEX idx_patients_registration_number ON patients(registration_number);
CREATE INDEX idx_patients_aadhaar ON patients(aadhaar_number);
CREATE INDEX idx_patients_nutrition_status ON patients(nutrition_status);
CREATE INDEX idx_patients_registered_by ON patients(registered_by);

-- Medical records indexes
CREATE INDEX idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX idx_medical_records_visit_date ON medical_records(visit_date);
CREATE INDEX idx_medical_records_health_worker ON medical_records(health_worker_id);

-- Bed indexes
CREATE INDEX idx_beds_hospital_id ON beds(hospital_id);
CREATE INDEX idx_beds_status ON beds(status);
CREATE INDEX idx_beds_patient_id ON beds(patient_id);

-- Visit indexes
CREATE INDEX idx_visits_patient_id ON visits(patient_id);
CREATE INDEX idx_visits_scheduled_date ON visits(scheduled_date);
CREATE INDEX idx_visits_status ON visits(status);

-- Notification indexes
CREATE INDEX idx_notifications_user_role ON notifications(user_role);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_priority ON notifications(priority);

-- =============================================
-- SAMPLE DATA INSERTION
-- =============================================

-- Insert sample hospitals
INSERT INTO hospitals (id, name, code, address, contact_number, total_beds, nrc_equipped) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Government Hospital Patna', 'HOSP001', 'Patna, Bihar', '+91 612-2234567', 50, true),
('550e8400-e29b-41d4-a716-446655440002', 'District Hospital Meerut', 'HOSP002', 'Meerut, UP', '+91 121-2345678', 30, true);

-- Insert sample anganwadi centers
INSERT INTO anganwadi_centers (id, name, code, location_area, location_district, location_state, location_pincode, latitude, longitude, supervisor_name, supervisor_contact, supervisor_employee_id, capacity_pregnant_women, capacity_children, facilities, coverage_areas, established_date, is_active) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Anganwadi Center Sadar', 'AWC001', 'Sadar Bazaar', 'Meerut', 'Uttar Pradesh', '250001', 28.9845, 77.7064, 'Sunita Devi', '+91 9876543210', 'SUP001', 25, 50, ARRAY['Kitchen', 'Playground', 'Medical Room', 'Toilet'], ARRAY['Sadar Bazaar', 'Civil Lines', 'Shastri Nagar'], '2020-01-15', true),
('660e8400-e29b-41d4-a716-446655440002', 'Anganwadi Center Cantonment', 'AWC002', 'Cantonment Area', 'Meerut', 'Uttar Pradesh', '250004', 28.9845, 77.7064, 'Rajesh Kumar', '+91 9876543211', 'SUP002', 20, 40, ARRAY['Kitchen', 'Medical Room', 'Toilet'], ARRAY['Cantonment', 'Mall Road'], '2019-03-20', true);

-- Insert sample users
INSERT INTO users (id, employee_id, username, password_hash, name, role, contact_number, email, is_active) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'EMP001', 'priya.sharma', '$2b$10$hash1', 'Priya Sharma', 'anganwadi_worker', '+91 9876543210', 'priya@example.com', true),
('770e8400-e29b-41d4-a716-446655440002', 'EMP002', 'meera.devi', '$2b$10$hash2', 'Meera Devi', 'anganwadi_worker', '+91 9876543211', 'meera@example.com', true),
('770e8400-e29b-41d4-a716-446655440003', 'SUP001', 'supervisor1', '$2b$10$hash3', 'Dr. Sunita Devi', 'supervisor', '+91 9876543212', 'sunita@example.com', true),
('770e8400-e29b-41d4-a716-446655440004', 'HOSP001', 'hospital1', '$2b$10$hash4', 'Dr. Amit Sharma', 'hospital', '+91 9876543213', 'amit@example.com', true);

-- Insert sample workers
INSERT INTO workers (id, employee_id, name, role, anganwadi_id, contact_number, address, assigned_areas, qualifications, working_hours_start, working_hours_end, emergency_contact_name, emergency_contact_relation, emergency_contact_number, join_date, is_active) VALUES
('880e8400-e29b-41d4-a716-446655440001', 'EMP001', 'Priya Sharma', 'head', '660e8400-e29b-41d4-a716-446655440001', '+91 9876543210', 'Sadar Bazaar, Meerut', ARRAY['Sadar Bazaar', 'Civil Lines'], ARRAY['ANM Certification', 'Child Care Training'], '09:00:00', '17:00:00', 'Raj Sharma', 'Husband', '+91 9876543220', '2020-02-01', true),
('880e8400-e29b-41d4-a716-446655440002', 'EMP002', 'Meera Devi', 'helper', '660e8400-e29b-41d4-a716-446655440001', '+91 9876543211', 'Shastri Nagar, Meerut', ARRAY['Shastri Nagar'], ARRAY['Basic Health Training'], '09:00:00', '17:00:00', 'Ram Devi', 'Mother', '+91 9876543221', '2020-03-15', true);

-- Insert sample beds
INSERT INTO beds (id, hospital_id, number, ward, status, patient_id, admission_date) VALUES
('990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'B001', 'Pediatric', 'available', NULL, NULL),
('990e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'B002', 'Pediatric', 'available', NULL, NULL),
('990e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'M001', 'Maternity', 'available', NULL, NULL),
('990e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'M002', 'Maternity', 'occupied', NULL, '2024-01-15');