-- NRC Management System Database Schema
-- SQLite version

-- =============================================
-- USERS AND AUTHENTICATION
-- =============================================

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    employee_id TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('anganwadi_worker', 'supervisor', 'hospital')),
    contact_number TEXT,
    email TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ANGANWADI CENTERS
-- =============================================

CREATE TABLE IF NOT EXISTS anganwadi_centers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    location_area TEXT NOT NULL,
    location_district TEXT NOT NULL,
    location_state TEXT NOT NULL,
    location_pincode TEXT,
    latitude REAL,
    longitude REAL,
    supervisor_name TEXT,
    supervisor_contact TEXT,
    supervisor_employee_id TEXT,
    capacity_pregnant_women INTEGER DEFAULT 0,
    capacity_children INTEGER DEFAULT 0,
    facilities TEXT, -- JSON string
    coverage_areas TEXT, -- JSON string
    established_date DATE,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- WORKERS
-- =============================================

CREATE TABLE IF NOT EXISTS workers (
    id TEXT PRIMARY KEY,
    employee_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('head', 'supervisor', 'helper', 'asha')),
    anganwadi_id TEXT,
    contact_number TEXT NOT NULL,
    address TEXT,
    assigned_areas TEXT, -- JSON string
    qualifications TEXT, -- JSON string
    working_hours_start TEXT,
    working_hours_end TEXT,
    emergency_contact_name TEXT,
    emergency_contact_relation TEXT,
    emergency_contact_number TEXT,
    join_date DATE DEFAULT (date('now')),
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (anganwadi_id) REFERENCES anganwadi_centers(id)
);

-- =============================================
-- PATIENTS
-- =============================================

CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    registration_number TEXT UNIQUE NOT NULL,
    aadhaar_number TEXT UNIQUE,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('child', 'pregnant')),
    pregnancy_week INTEGER,
    contact_number TEXT NOT NULL,
    emergency_contact TEXT,
    address TEXT NOT NULL,
    weight REAL NOT NULL,
    height REAL NOT NULL,
    blood_pressure TEXT,
    temperature REAL,
    hemoglobin REAL,
    nutrition_status TEXT NOT NULL CHECK (nutrition_status IN ('normal', 'malnourished', 'severely_malnourished')),
    medical_history TEXT, -- JSON string
    symptoms TEXT, -- JSON string
    documents TEXT, -- JSON string
    photos TEXT, -- JSON string
    remarks TEXT,
    risk_score INTEGER DEFAULT 0,
    nutritional_deficiency TEXT, -- JSON string
    bed_id TEXT,
    last_visit_date DATE,
    next_visit_date DATE,
    registered_by TEXT,
    registration_date DATE DEFAULT (date('now')),
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (registered_by) REFERENCES users(employee_id)
);

-- =============================================
-- MEDICAL RECORDS
-- =============================================

CREATE TABLE IF NOT EXISTS medical_records (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    visit_date DATE NOT NULL DEFAULT (date('now')),
    visit_type TEXT NOT NULL CHECK (visit_type IN ('routine', 'emergency', 'follow_up', 'admission', 'discharge')),
    health_worker_id TEXT,
    weight REAL NOT NULL,
    height REAL NOT NULL,
    temperature REAL,
    blood_pressure TEXT,
    pulse INTEGER,
    respiratory_rate INTEGER,
    oxygen_saturation INTEGER,
    symptoms TEXT, -- JSON string
    diagnosis TEXT, -- JSON string
    treatment TEXT, -- JSON string
    medications TEXT, -- JSON string
    appetite TEXT CHECK (appetite IN ('poor', 'moderate', 'good')),
    food_intake TEXT CHECK (food_intake IN ('inadequate', 'adequate', 'excessive')),
    supplements TEXT, -- JSON string
    diet_plan TEXT,
    hemoglobin REAL,
    blood_sugar REAL,
    protein_level REAL,
    notes TEXT,
    next_visit_date DATE,
    follow_up_required BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (health_worker_id) REFERENCES users(employee_id)
);

-- =============================================
-- HOSPITALS AND BEDS
-- =============================================

CREATE TABLE IF NOT EXISTS hospitals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    address TEXT,
    contact_number TEXT,
    total_beds INTEGER DEFAULT 0,
    nrc_equipped BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS beds (
    id TEXT PRIMARY KEY,
    hospital_id TEXT NOT NULL,
    number TEXT NOT NULL,
    ward TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
    patient_id TEXT,
    admission_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    UNIQUE(hospital_id, number)
);

-- =============================================
-- BED REQUESTS
-- =============================================

CREATE TABLE IF NOT EXISTS bed_requests (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    requested_by TEXT,
    request_date DATE DEFAULT (date('now')),
    urgency_level TEXT NOT NULL CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')),
    medical_justification TEXT NOT NULL,
    current_condition TEXT NOT NULL,
    estimated_stay_duration INTEGER NOT NULL,
    special_requirements TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'cancelled')),
    reviewed_by TEXT,
    review_date DATE,
    review_comments TEXT,
    hospital_referral TEXT, -- JSON string
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (requested_by) REFERENCES users(employee_id),
    FOREIGN KEY (reviewed_by) REFERENCES users(employee_id)
);

-- =============================================
-- VISITS
-- =============================================

CREATE TABLE IF NOT EXISTS visits (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    health_worker_id TEXT,
    scheduled_date DATE NOT NULL,
    actual_date DATE,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'missed', 'rescheduled')),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (health_worker_id) REFERENCES users(employee_id)
);

-- =============================================
-- NOTIFICATIONS
-- =============================================

CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_role TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    action_required BOOLEAN DEFAULT 0,
    read BOOLEAN DEFAULT 0,
    date DATE DEFAULT (date('now')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TREATMENT TRACKERS
-- =============================================

CREATE TABLE IF NOT EXISTS treatment_trackers (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    hospital_id TEXT NOT NULL,
    admission_date DATE NOT NULL DEFAULT (date('now')),
    discharge_date DATE,
    treatment_plan TEXT NOT NULL, -- JSON string
    medicine_schedule TEXT, -- JSON string
    doctor_remarks TEXT, -- JSON string
    daily_progress TEXT, -- JSON string
    lab_reports TEXT, -- JSON string
    discharge_summary TEXT, -- JSON string
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- =============================================
-- SURVEY REPORTS
-- =============================================

CREATE TABLE IF NOT EXISTS survey_reports (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    health_worker_id TEXT,
    date DATE DEFAULT (date('now')),
    observations TEXT NOT NULL,
    nutrition_data TEXT, -- JSON string
    symptoms TEXT, -- JSON string
    recommendations TEXT, -- JSON string
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (health_worker_id) REFERENCES users(employee_id)
);

-- =============================================
-- AI PREDICTIONS
-- =============================================

CREATE TABLE IF NOT EXISTS ai_predictions (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    date DATE DEFAULT (date('now')),
    predicted_recovery_days INTEGER NOT NULL,
    confidence REAL NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    risk_factors TEXT NOT NULL, -- JSON string
    recommendations TEXT NOT NULL, -- JSON string
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- =============================================
-- SAMPLE DATA
-- =============================================

-- Insert sample hospitals
INSERT OR IGNORE INTO hospitals (id, name, code, address, contact_number, total_beds, nrc_equipped) VALUES
('hosp-001', 'Government Hospital Patna', 'HOSP001', 'Patna, Bihar', '+91 612-2234567', 50, 1),
('hosp-002', 'District Hospital Meerut', 'HOSP002', 'Meerut, UP', '+91 121-2345678', 30, 1);

-- Insert sample users
INSERT OR IGNORE INTO users (id, employee_id, username, password_hash, name, role, contact_number, email) VALUES
('user-001', 'EMP001', 'priya.sharma', '$2b$12$hash1', 'Priya Sharma', 'anganwadi_worker', '+91 9876543210', 'priya@example.com'),
('user-002', 'EMP002', 'meera.devi', '$2b$12$hash2', 'Meera Devi', 'anganwadi_worker', '+91 9876543211', 'meera@example.com'),
('user-003', 'SUP001', 'supervisor1', '$2b$12$hash3', 'Dr. Sunita Devi', 'supervisor', '+91 9876543212', 'sunita@example.com'),
('user-004', 'HOSP001', 'hospital1', '$2b$12$hash4', 'Dr. Amit Sharma', 'hospital', '+91 9876543213', 'amit@example.com');

-- Insert sample anganwadi centers
INSERT OR IGNORE INTO anganwadi_centers (
    id, name, code, location_area, location_district, location_state, 
    location_pincode, latitude, longitude, supervisor_name, supervisor_contact, 
    supervisor_employee_id, capacity_pregnant_women, capacity_children, 
    facilities, coverage_areas, established_date
) VALUES (
    'awc-001', 'Anganwadi Center Sadar', 'AWC001', 'Sadar Bazaar', 'Meerut', 'Uttar Pradesh',
    '250001', 28.9845, 77.7064, 'Sunita Devi', '+91 9876543210',
    'SUP001', 25, 50, 
    '["Kitchen", "Playground", "Medical Room", "Toilet"]',
    '["Sadar Bazaar", "Civil Lines", "Shastri Nagar"]',
    '2020-01-15'
);

-- Insert sample workers
INSERT OR IGNORE INTO workers (
    id, employee_id, name, role, anganwadi_id, contact_number, address,
    assigned_areas, qualifications, working_hours_start, working_hours_end,
    emergency_contact_name, emergency_contact_relation, emergency_contact_number, join_date
) VALUES (
    'worker-001', 'EMP001', 'Priya Sharma', 'head', 'awc-001', '+91 9876543210', 'Sadar Bazaar, Meerut',
    '["Sadar Bazaar", "Civil Lines"]', '["ANM Certification", "Child Care Training"]', '09:00', '17:00',
    'Raj Sharma', 'Husband', '+91 9876543220', '2020-02-01'
);

-- Insert sample beds
INSERT OR IGNORE INTO beds (id, hospital_id, number, ward, status) VALUES
('bed-001', 'hosp-001', 'B001', 'Pediatric', 'available'),
('bed-002', 'hosp-001', 'B002', 'Pediatric', 'available'),
('bed-003', 'hosp-001', 'M001', 'Maternity', 'available'),
('bed-004', 'hosp-001', 'M002', 'Maternity', 'occupied');

-- Insert sample patients
INSERT OR IGNORE INTO patients (
    id, registration_number, aadhaar_number, name, age, type, contact_number, address,
    weight, height, nutrition_status, medical_history, symptoms, documents, photos,
    remarks, risk_score, nutritional_deficiency, registered_by, registration_date
) VALUES (
    'patient-001', 'NRC001', '1234-5678-9012', 'Aarav Kumar', 3, 'child', '+91 9876543210', 'Sadar Bazaar, Meerut, UP',
    8.5, 85, 'severely_malnourished', '["Anemia", "Frequent infections"]', '["Weakness", "Loss of appetite"]',
    '["Aadhaar Card", "Birth Certificate"]', '["patient_photo.jpg"]',
    'Requires immediate attention', 85, '["Protein", "Iron", "Vitamin D"]', 'EMP001', '2024-01-15'
);