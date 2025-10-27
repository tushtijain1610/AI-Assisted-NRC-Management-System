-- NRC Management System Database Schema
-- SQLite Database for persistent data storage

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    employee_id TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('anganwadi_worker', 'supervisor', 'hospital')),
    contact_number TEXT,
    email TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Anganwadi Centers table
CREATE TABLE IF NOT EXISTS anganwadi_centers (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
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
    facilities TEXT, -- JSON array
    coverage_areas TEXT, -- JSON array
    established_date DATE,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Workers table
CREATE TABLE IF NOT EXISTS workers (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    employee_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('head', 'supervisor', 'helper', 'asha')),
    anganwadi_id TEXT,
    contact_number TEXT NOT NULL,
    address TEXT,
    assigned_areas TEXT, -- JSON array
    qualifications TEXT, -- JSON array
    working_hours_start TIME,
    working_hours_end TIME,
    emergency_contact_name TEXT,
    emergency_contact_relation TEXT,
    emergency_contact_number TEXT,
    join_date DATE DEFAULT (date('now')),
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (anganwadi_id) REFERENCES anganwadi_centers(id)
);

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
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
    medical_history TEXT, -- JSON array
    symptoms TEXT, -- JSON array
    documents TEXT, -- JSON array
    photos TEXT, -- JSON array
    remarks TEXT,
    risk_score INTEGER DEFAULT 0,
    nutritional_deficiency TEXT, -- JSON array
    bed_id TEXT,
    last_visit_date DATE,
    next_visit_date DATE,
    registered_by TEXT,
    registration_date DATE DEFAULT (date('now')),
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (registered_by) REFERENCES users(employee_id)
);

-- Medical Records table
CREATE TABLE IF NOT EXISTS medical_records (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    patient_id TEXT NOT NULL,
    visit_date DATE DEFAULT (date('now')),
    visit_type TEXT NOT NULL CHECK (visit_type IN ('routine', 'emergency', 'follow_up', 'admission', 'discharge')),
    health_worker_id TEXT,
    weight REAL NOT NULL,
    height REAL NOT NULL,
    temperature REAL,
    blood_pressure TEXT,
    pulse INTEGER,
    respiratory_rate INTEGER,
    oxygen_saturation INTEGER,
    symptoms TEXT, -- JSON array
    diagnosis TEXT, -- JSON array
    treatment TEXT, -- JSON array
    appetite TEXT CHECK (appetite IN ('poor', 'moderate', 'good')),
    food_intake TEXT CHECK (food_intake IN ('inadequate', 'adequate', 'excessive')),
    supplements TEXT, -- JSON array
    diet_plan TEXT,
    hemoglobin REAL,
    blood_sugar REAL,
    protein_level REAL,
    notes TEXT,
    next_visit_date DATE,
    follow_up_required INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (health_worker_id) REFERENCES users(employee_id)
);

-- Medications table
CREATE TABLE IF NOT EXISTS medications (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    medical_record_id TEXT NOT NULL,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    duration TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medical_record_id) REFERENCES medical_records(id)
);

-- Hospitals table
CREATE TABLE IF NOT EXISTS hospitals (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    address TEXT,
    contact_number TEXT,
    total_beds INTEGER DEFAULT 0,
    nrc_equipped INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Beds table
CREATE TABLE IF NOT EXISTS beds (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    hospital_id TEXT NOT NULL,
    number TEXT NOT NULL,
    ward TEXT NOT NULL,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
    patient_id TEXT,
    admission_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    UNIQUE(hospital_id, number)
);

-- Bed Requests table
CREATE TABLE IF NOT EXISTS bed_requests (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
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
    hospital_referral TEXT, -- JSON object
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (requested_by) REFERENCES users(employee_id),
    FOREIGN KEY (reviewed_by) REFERENCES users(employee_id)
);

-- Visits table
CREATE TABLE IF NOT EXISTS visits (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
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

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_role TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    action_required INTEGER DEFAULT 0,
    read INTEGER DEFAULT 0,
    date DATE DEFAULT (date('now')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Treatment Trackers table
CREATE TABLE IF NOT EXISTS treatment_trackers (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    patient_id TEXT NOT NULL,
    hospital_id TEXT NOT NULL,
    admission_date DATE DEFAULT (date('now')),
    discharge_date DATE,
    treatment_plan TEXT, -- JSON array
    doctor_remarks TEXT, -- JSON array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
);

-- Daily Progress table
CREATE TABLE IF NOT EXISTS daily_progress (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    treatment_tracker_id TEXT NOT NULL,
    date DATE DEFAULT (date('now')),
    weight REAL NOT NULL,
    appetite TEXT CHECK (appetite IN ('poor', 'moderate', 'good')),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (treatment_tracker_id) REFERENCES treatment_trackers(id)
);

-- Medicine Schedule table
CREATE TABLE IF NOT EXISTS medicine_schedule (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    treatment_tracker_id TEXT NOT NULL,
    medicine TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (treatment_tracker_id) REFERENCES treatment_trackers(id)
);

-- Lab Reports table
CREATE TABLE IF NOT EXISTS lab_reports (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    treatment_tracker_id TEXT NOT NULL,
    type TEXT NOT NULL,
    date DATE DEFAULT (date('now')),
    results TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (treatment_tracker_id) REFERENCES treatment_trackers(id)
);

-- Discharge Summaries table
CREATE TABLE IF NOT EXISTS discharge_summaries (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    treatment_tracker_id TEXT NOT NULL,
    final_weight REAL NOT NULL,
    health_improvement TEXT NOT NULL,
    follow_up_instructions TEXT, -- JSON array
    next_checkup_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (treatment_tracker_id) REFERENCES treatment_trackers(id)
);

-- Survey Reports table
CREATE TABLE IF NOT EXISTS survey_reports (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    patient_id TEXT NOT NULL,
    health_worker_id TEXT,
    date DATE DEFAULT (date('now')),
    observations TEXT NOT NULL,
    appetite TEXT CHECK (appetite IN ('poor', 'moderate', 'good')),
    food_intake TEXT CHECK (food_intake IN ('inadequate', 'adequate', 'excessive')),
    supplements TEXT, -- JSON array
    symptoms TEXT, -- JSON array
    recommendations TEXT, -- JSON array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (health_worker_id) REFERENCES users(employee_id)
);

-- AI Predictions table
CREATE TABLE IF NOT EXISTS ai_predictions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    patient_id TEXT NOT NULL,
    date DATE DEFAULT (date('now')),
    predicted_recovery_days INTEGER NOT NULL,
    confidence REAL NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    risk_factors TEXT, -- JSON array
    recommendations TEXT, -- JSON array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Missed Visit Tickets table
CREATE TABLE IF NOT EXISTS missed_visit_tickets (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    patient_id TEXT NOT NULL,
    visit_id TEXT,
    date_reported DATE DEFAULT (date('now')),
    reported_by TEXT,
    missed_conditions TEXT, -- JSON object
    attempt_time TIME,
    location_visited TEXT,
    contact_method TEXT,
    current_health_status TEXT,
    urgency_level TEXT,
    visible_symptoms TEXT, -- JSON array
    family_reported_concerns TEXT, -- JSON array
    actions_taken TEXT, -- JSON array
    follow_up_required INTEGER DEFAULT 1,
    next_attempt_date DATE,
    supervisor_notified INTEGER DEFAULT 0,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'escalated')),
    escalation_level TEXT DEFAULT 'none' CHECK (escalation_level IN ('none', 'supervisor', 'district', 'state')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (reported_by) REFERENCES users(employee_id),
    FOREIGN KEY (visit_id) REFERENCES visits(id)
);

-- Anganwadi Visit Tickets table
CREATE TABLE IF NOT EXISTS anganwadi_visit_tickets (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    anganwadi_id TEXT NOT NULL,
    worker_id TEXT NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    assigned_area TEXT NOT NULL,
    visit_type TEXT NOT NULL CHECK (visit_type IN ('routine_checkup', 'nutrition_survey', 'vaccination', 'emergency', 'follow_up')),
    target_pregnant_women INTEGER DEFAULT 0,
    target_children INTEGER DEFAULT 0,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'missed', 'cancelled')),
    reported_by TEXT,
    reported_date DATE DEFAULT (date('now')),
    escalation_level TEXT DEFAULT 'none' CHECK (escalation_level IN ('none', 'supervisor', 'district', 'state')),
    completion_details TEXT, -- JSON object
    missed_reason TEXT, -- JSON object
    supervisor_comments TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (anganwadi_id) REFERENCES anganwadi_centers(id),
    FOREIGN KEY (worker_id) REFERENCES workers(id),
    FOREIGN KEY (reported_by) REFERENCES users(employee_id)
);

-- Insert sample data
INSERT OR IGNORE INTO users (employee_id, username, password_hash, name, role, contact_number, email) VALUES
('EMP001', 'priya.sharma', 'worker123', 'Priya Sharma', 'anganwadi_worker', '+91 9876543210', 'priya@example.com'),
('EMP002', 'meera.devi', 'worker123', 'Meera Devi', 'anganwadi_worker', '+91 9876543211', 'meera@example.com'),
('SUP001', 'supervisor1', 'super123', 'Dr. Sunita Devi', 'supervisor', '+91 9876543212', 'sunita@example.com'),
('SUP002', 'supervisor2', 'super123', 'Dr. Rajesh Kumar', 'supervisor', '+91 9876543213', 'rajesh@example.com'),
('HOSP001', 'hospital1', 'hosp123', 'Dr. Amit Sharma', 'hospital', '+91 9876543214', 'amit@example.com'),
('HOSP002', 'hospital2', 'hosp123', 'Dr. Kavita Singh', 'hospital', '+91 9876543215', 'kavita@example.com');

-- Insert sample hospitals
INSERT OR IGNORE INTO hospitals (id, name, code, address, contact_number, total_beds, nrc_equipped) VALUES
('hosp001', 'District Hospital Meerut', 'HOSP001', 'Civil Lines, Meerut, UP', '+91 121-2234567', 20, 1),
('hosp002', 'Community Health Center', 'HOSP002', 'Sadar Bazaar, Meerut, UP', '+91 121-2234568', 15, 1);

-- Insert sample beds
INSERT OR IGNORE INTO beds (id, hospital_id, number, ward, status) VALUES
('bed001', 'hosp001', 'B001', 'Pediatric', 'available'),
('bed002', 'hosp001', 'B002', 'Pediatric', 'available'),
('bed003', 'hosp001', 'B003', 'Pediatric', 'available'),
('bed004', 'hosp001', 'B004', 'Maternity', 'available'),
('bed005', 'hosp001', 'B005', 'Maternity', 'available'),
('bed006', 'hosp002', 'B006', 'Pediatric', 'available'),
('bed007', 'hosp002', 'B007', 'Pediatric', 'maintenance'),
('bed008', 'hosp002', 'B008', 'Maternity', 'available');

-- Insert sample anganwadi centers
INSERT OR IGNORE INTO anganwadi_centers (id, name, code, location_area, location_district, location_state, supervisor_name, supervisor_contact, supervisor_employee_id, capacity_pregnant_women, capacity_children, facilities, coverage_areas, established_date) VALUES
('awc001', 'Anganwadi Center Sadar', 'AWC001', 'Sadar Bazaar', 'Meerut', 'Uttar Pradesh', 'Sunita Devi', '+91 9876543212', 'SUP001', 50, 100, '["Kitchen", "Playground", "Medical Room", "Toilet"]', '["Sadar Bazaar", "Civil Lines", "Shastri Nagar"]', '2020-01-15'),
('awc002', 'Anganwadi Center Rural', 'AWC002', 'Village Mohkampur', 'Meerut', 'Uttar Pradesh', 'Rajesh Kumar', '+91 9876543213', 'SUP002', 30, 80, '["Kitchen", "Medical Room", "Toilet"]', '["Mohkampur", "Kharkhauda", "Jani Khurd"]', '2019-03-20');

-- Insert sample workers
INSERT OR IGNORE INTO workers (id, employee_id, name, role, anganwadi_id, contact_number, address, assigned_areas, qualifications, working_hours_start, working_hours_end, emergency_contact_name, emergency_contact_relation, emergency_contact_number, join_date) VALUES
('work001', 'EMP001', 'Priya Sharma', 'helper', 'awc001', '+91 9876543210', 'House No. 123, Sadar Bazaar, Meerut', '["Sadar Bazaar", "Civil Lines"]', '["ANM Certification", "Child Care Training"]', '09:00', '17:00', 'Raj Sharma', 'Husband', '+91 9876543220', '2022-01-15'),
('work002', 'EMP002', 'Meera Devi', 'helper', 'awc001', '+91 9876543211', 'House No. 456, Shastri Nagar, Meerut', '["Shastri Nagar"]', '["ASHA Training", "Nutrition Counseling"]', '09:00', '17:00', 'Ram Devi', 'Mother', '+91 9876543221', '2022-02-01'),
('work003', 'EMP003', 'Kamala Singh', 'head', 'awc002', '+91 9876543216', 'Village Mohkampur, Meerut', '["Mohkampur", "Kharkhauda"]', '["B.Ed", "Child Development"]', '08:30', '16:30', 'Suresh Singh', 'Husband', '+91 9876543222', '2021-06-10');

-- Insert sample notifications
INSERT OR IGNORE INTO notifications (user_role, type, title, message, priority, action_required) VALUES
('anganwadi_worker', 'high_risk_alert', 'High Risk Patient Alert', 'New severely malnourished child registered in your area. Immediate attention required.', 'high', 1),
('supervisor', 'bed_request', 'Bed Request Pending', 'New bed request submitted for SAM child. Review and approval needed.', 'medium', 1),
('hospital', 'admission_status', 'Patient Admission', 'New patient admitted to Pediatric Ward. Treatment plan required.', 'medium', 1);