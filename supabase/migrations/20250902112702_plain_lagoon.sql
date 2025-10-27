-- NRC Management System - MySQL Database Schema
-- Complete schema for healthcare management system with admin panel

-- Create database
CREATE DATABASE IF NOT EXISTS nrc_management;
USE nrc_management;

-- =============================================
-- USERS TABLE - Authentication and Role Management
-- =============================================
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('anganwadi_worker', 'supervisor', 'hospital', 'admin') NOT NULL,
    contact_number VARCHAR(15),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_employee_id (employee_id),
    INDEX idx_users_role (role),
    INDEX idx_users_username (username)
);

-- =============================================
-- ANGANWADI CENTERS TABLE
-- =============================================
CREATE TABLE anganwadi_centers (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    location_area VARCHAR(255) NOT NULL,
    location_district VARCHAR(255) NOT NULL,
    location_state VARCHAR(255) NOT NULL,
    location_pincode VARCHAR(10),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    supervisor_name VARCHAR(255),
    supervisor_contact VARCHAR(15),
    supervisor_employee_id VARCHAR(50),
    capacity_pregnant_women INT DEFAULT 0,
    capacity_children INT DEFAULT 0,
    facilities JSON,
    coverage_areas JSON,
    established_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supervisor_employee_id) REFERENCES users(employee_id)
);

-- =============================================
-- WORKERS TABLE
-- =============================================
CREATE TABLE workers (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('head', 'supervisor', 'helper', 'asha') NOT NULL,
    anganwadi_id VARCHAR(36),
    contact_number VARCHAR(15) NOT NULL,
    address TEXT,
    assigned_areas JSON,
    qualifications JSON,
    working_hours_start TIME,
    working_hours_end TIME,
    emergency_contact_name VARCHAR(255),
    emergency_contact_relation VARCHAR(100),
    emergency_contact_number VARCHAR(15),
    join_date DATE DEFAULT (CURRENT_DATE),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (anganwadi_id) REFERENCES anganwadi_centers(id),
    CHECK (role IN ('head', 'supervisor', 'helper', 'asha'))
);

-- =============================================
-- HOSPITALS TABLE
-- =============================================
CREATE TABLE hospitals (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    contact_number VARCHAR(15),
    total_beds INT DEFAULT 0,
    nrc_equipped BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- PATIENTS TABLE
-- =============================================
CREATE TABLE patients (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    registration_number VARCHAR(100) UNIQUE NOT NULL,
    aadhaar_number VARCHAR(20) UNIQUE,
    name VARCHAR(255) NOT NULL,
    age INT NOT NULL,
    type ENUM('child', 'pregnant') NOT NULL,
    pregnancy_week INT,
    contact_number VARCHAR(15) NOT NULL,
    emergency_contact VARCHAR(15),
    address TEXT NOT NULL,
    weight DECIMAL(5,2) NOT NULL,
    height DECIMAL(5,2) NOT NULL,
    blood_pressure VARCHAR(20),
    temperature DECIMAL(4,1),
    hemoglobin DECIMAL(4,1),
    nutrition_status ENUM('normal', 'malnourished', 'severely_malnourished') NOT NULL,
    medical_history JSON,
    symptoms JSON,
    documents JSON,
    photos JSON,
    remarks TEXT,
    risk_score INT DEFAULT 0,
    nutritional_deficiency JSON,
    bed_id VARCHAR(36),
    last_visit_date DATE,
    next_visit_date DATE,
    registered_by VARCHAR(50),
    registration_date DATE DEFAULT (CURRENT_DATE),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (registered_by) REFERENCES users(employee_id),
    FOREIGN KEY (bed_id) REFERENCES beds(id),
    CHECK (type IN ('child', 'pregnant')),
    CHECK (nutrition_status IN ('normal', 'malnourished', 'severely_malnourished')),
    INDEX idx_patients_registration_number (registration_number),
    INDEX idx_patients_aadhaar (aadhaar_number),
    INDEX idx_patients_nutrition_status (nutrition_status),
    INDEX idx_patients_registered_by (registered_by)
);

-- =============================================
-- BEDS TABLE
-- =============================================
CREATE TABLE beds (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    hospital_id VARCHAR(36) NOT NULL,
    number VARCHAR(20) NOT NULL,
    ward VARCHAR(100) NOT NULL,
    status ENUM('available', 'occupied', 'maintenance') DEFAULT 'available',
    patient_id VARCHAR(36),
    admission_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    UNIQUE KEY unique_bed_per_hospital (hospital_id, number),
    CHECK (status IN ('available', 'occupied', 'maintenance')),
    INDEX idx_beds_hospital_id (hospital_id),
    INDEX idx_beds_status (status),
    INDEX idx_beds_patient_id (patient_id)
);

-- =============================================
-- BED REQUESTS TABLE
-- =============================================
CREATE TABLE bed_requests (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    patient_id VARCHAR(36) NOT NULL,
    requested_by VARCHAR(50),
    request_date DATE DEFAULT (CURRENT_DATE),
    urgency_level ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    medical_justification TEXT NOT NULL,
    current_condition TEXT NOT NULL,
    estimated_stay_duration INT NOT NULL,
    special_requirements TEXT,
    status ENUM('pending', 'approved', 'declined', 'cancelled') DEFAULT 'pending',
    reviewed_by VARCHAR(50),
    review_date DATE,
    review_comments TEXT,
    hospital_referral JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (requested_by) REFERENCES users(employee_id),
    FOREIGN KEY (reviewed_by) REFERENCES users(employee_id),
    CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')),
    CHECK (status IN ('pending', 'approved', 'declined', 'cancelled'))
);

-- =============================================
-- VISITS TABLE
-- =============================================
CREATE TABLE visits (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    patient_id VARCHAR(36) NOT NULL,
    health_worker_id VARCHAR(50),
    scheduled_date DATE NOT NULL,
    actual_date DATE,
    status ENUM('scheduled', 'completed', 'missed', 'rescheduled') DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (health_worker_id) REFERENCES users(employee_id),
    CHECK (status IN ('scheduled', 'completed', 'missed', 'rescheduled')),
    INDEX idx_visits_patient_id (patient_id),
    INDEX idx_visits_scheduled_date (scheduled_date),
    INDEX idx_visits_status (status)
);

-- =============================================
-- MEDICAL RECORDS TABLE
-- =============================================
CREATE TABLE medical_records (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    patient_id VARCHAR(36) NOT NULL,
    visit_date DATE DEFAULT (CURRENT_DATE),
    visit_type ENUM('routine', 'emergency', 'follow_up', 'admission', 'discharge') NOT NULL,
    health_worker_id VARCHAR(50),
    weight DECIMAL(5,2) NOT NULL,
    height DECIMAL(5,2) NOT NULL,
    temperature DECIMAL(4,1),
    blood_pressure VARCHAR(20),
    pulse INT,
    respiratory_rate INT,
    oxygen_saturation INT,
    symptoms JSON,
    diagnosis JSON,
    treatment JSON,
    medications JSON,
    appetite ENUM('poor', 'moderate', 'good'),
    food_intake ENUM('inadequate', 'adequate', 'excessive'),
    supplements JSON,
    diet_plan TEXT,
    hemoglobin DECIMAL(4,1),
    blood_sugar DECIMAL(5,1),
    protein_level DECIMAL(4,1),
    notes TEXT,
    next_visit_date DATE,
    follow_up_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (health_worker_id) REFERENCES users(employee_id),
    CHECK (visit_type IN ('routine', 'emergency', 'follow_up', 'admission', 'discharge')),
    CHECK (appetite IN ('poor', 'moderate', 'good')),
    CHECK (food_intake IN ('inadequate', 'adequate', 'excessive')),
    INDEX idx_medical_records_patient_id (patient_id),
    INDEX idx_medical_records_visit_date (visit_date)
);

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_role VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    action_required BOOLEAN DEFAULT FALSE,
    read_status BOOLEAN DEFAULT FALSE,
    date DATE DEFAULT (CURRENT_DATE),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    INDEX idx_notifications_user_role (user_role),
    INDEX idx_notifications_read (read_status),
    INDEX idx_notifications_priority (priority)
);

-- =============================================
-- INSERT SAMPLE DATA
-- =============================================

-- Insert default admin user
INSERT INTO users (employee_id, username, password_hash, name, role, contact_number, email, created_by) VALUES
('ADMIN001', 'admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O', 'System Administrator', 'admin', '+91 9999999999', 'admin@nrc.gov.in', 'SYSTEM');

-- Insert sample users for testing
INSERT INTO users (employee_id, username, password_hash, name, role, contact_number, email, created_by) VALUES
('EMP001', 'priya.sharma', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O', 'Priya Sharma', 'anganwadi_worker', '+91 9876543210', 'priya.sharma@gov.in', 'ADMIN001'),
('SUP001', 'supervisor1', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O', 'Dr. Sunita Devi', 'supervisor', '+91 9876543212', 'sunita.devi@gov.in', 'ADMIN001'),
('HOSP001', 'hospital1', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O', 'Dr. Amit Sharma', 'hospital', '+91 9876543214', 'amit.sharma@hospital.gov.in', 'ADMIN001');

-- Insert sample hospital
INSERT INTO hospitals (id, name, code, address, contact_number, total_beds, nrc_equipped) VALUES
('HOSP-001', 'District Hospital Meerut', 'HOSP001', 'Medical College Road, Meerut, UP', '+91 121-2234567', 20, TRUE);

-- Insert sample beds
INSERT INTO beds (id, hospital_id, number, ward, status) VALUES
('BED-001', 'HOSP-001', '101', 'Pediatric', 'available'),
('BED-002', 'HOSP-001', '102', 'Pediatric', 'available'),
('BED-003', 'HOSP-001', '103', 'Pediatric', 'maintenance'),
('BED-004', 'HOSP-001', '201', 'Maternity', 'available'),
('BED-005', 'HOSP-001', '202', 'Maternity', 'occupied'),
('BED-006', 'HOSP-001', '203', 'Maternity', 'available');

-- Insert sample anganwadi center
INSERT INTO anganwadi_centers (id, name, code, location_area, location_district, location_state, location_pincode, latitude, longitude, supervisor_name, supervisor_contact, supervisor_employee_id, capacity_pregnant_women, capacity_children, facilities, coverage_areas, established_date) VALUES
('AWC-001', 'Anganwadi Center Sadar Bazaar', 'AWC001', 'Sadar Bazaar', 'Meerut', 'Uttar Pradesh', '250001', 28.9845, 77.7064, 'Mrs. Sunita Devi', '+91 9876543213', 'SUP001', 50, 100, '["Kitchen", "Playground", "Medical Room", "Toilet"]', '["Sadar Bazaar", "Civil Lines", "Shastri Nagar"]', '2020-01-15');

-- Insert sample patients
INSERT INTO patients (id, registration_number, aadhaar_number, name, age, type, contact_number, emergency_contact, address, weight, height, nutrition_status, medical_history, symptoms, risk_score, nutritional_deficiency, registered_by) VALUES
('PAT-001', 'NRC001', '1234-5678-9012', 'Aarav Kumar', 3, 'child', '+91 9876543214', '+91 9876543215', 'House No. 123, Sadar Bazaar, Meerut', 8.5, 85, 'severely_malnourished', '["Anemia", "Frequent infections"]', '["Weakness", "Loss of appetite"]', 85, '["Protein", "Iron", "Vitamin D"]', 'EMP001'),
('PAT-002', 'NRC002', '2345-6789-0123', 'Priya Devi', 24, 'pregnant', '+91 9876543216', '+91 9876543217', 'House No. 456, Civil Lines, Meerut', 45, 155, 'malnourished', '["Anemia"]', '["Fatigue", "Dizziness"]', 65, '["Iron", "Folic Acid"]', 'EMP001');

-- Insert sample notifications
INSERT INTO notifications (id, user_role, type, title, message, priority, action_required) VALUES
('NOT-001', 'anganwadi_worker', 'high_risk_alert', 'High Risk Patient Alert', 'New SAM child Aarav Kumar registered with 85% risk score', 'high', TRUE),
('NOT-002', 'supervisor', 'bed_request', 'Bed Request Pending', 'Bed request for Priya Devi awaiting approval', 'medium', TRUE),
('NOT-003', 'hospital', 'admission_status', 'New Patient Admission', 'Ravi Singh admitted to Pediatric Ward, Bed 102', 'medium', FALSE);