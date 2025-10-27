const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class CSVManager {
  constructor() {
    this.dataDir = path.join(__dirname, '../data');
    this.ensureDataDirectory();
    this.initializeCSVFiles();
  }

  ensureDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
      console.log('📁 Created data directory for CSV files');
    }
  }

  initializeCSVFiles() {
    const csvFiles = {
      'users.csv': 'id,employee_id,username,password_hash,name,role,contact_number,email,is_active,created_by,created_at,updated_at',
      'patients.csv': 'id,registration_number,aadhaar_number,name,age,type,pregnancy_week,contact_number,emergency_contact,address,weight,height,blood_pressure,temperature,hemoglobin,nutrition_status,medical_history,symptoms,documents,photos,remarks,risk_score,nutritional_deficiency,bed_id,last_visit_date,next_visit_date,registered_by,registration_date,is_active,created_at,updated_at',
      'anganwadi_centers.csv': 'id,name,code,location_area,location_district,location_state,location_pincode,latitude,longitude,supervisor_name,supervisor_contact,supervisor_employee_id,capacity_pregnant_women,capacity_children,facilities,coverage_areas,established_date,is_active,created_at,updated_at',
      'workers.csv': 'id,employee_id,name,role,anganwadi_id,contact_number,address,assigned_areas,qualifications,working_hours_start,working_hours_end,emergency_contact_name,emergency_contact_relation,emergency_contact_number,join_date,is_active,created_at,updated_at',
      'beds.csv': 'id,hospital_id,number,ward,status,patient_id,admission_date,created_at,updated_at',
      'bed_requests.csv': 'id,patient_id,requested_by,request_date,urgency_level,medical_justification,current_condition,estimated_stay_duration,special_requirements,status,reviewed_by,review_date,review_comments,hospital_referral,created_at,updated_at',
      'visits.csv': 'id,patient_id,health_worker_id,scheduled_date,actual_date,status,notes,created_at,updated_at',
      'medical_records.csv': 'id,patient_id,visit_date,visit_type,health_worker_id,weight,height,temperature,blood_pressure,pulse,respiratory_rate,oxygen_saturation,symptoms,diagnosis,treatment,medications,appetite,food_intake,supplements,diet_plan,hemoglobin,blood_sugar,protein_level,notes,next_visit_date,follow_up_required,created_at,updated_at',
      'notifications.csv': 'id,user_role,type,title,message,priority,action_required,read_status,date,created_at',
      'hospitals.csv': 'id,name,code,address,contact_number,total_beds,nrc_equipped,created_at'
    };

    Object.entries(csvFiles).forEach(([filename, headers]) => {
      const filePath = path.join(this.dataDir, filename);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, headers + '\n');
        console.log(`📄 Created ${filename}`);
      }
    });

    // Initialize with sample data
    this.initializeSampleData();
  }

  initializeSampleData() {
    try {
      // Check if users.csv has data (beyond headers)
      const usersData = this.readCSV('users.csv');
      if (usersData.length === 0) {
        console.log('🔄 Initializing sample data...');
        
        // Add default admin user
        this.writeToCSV('users.csv', {
          id: uuidv4(),
          employee_id: 'ADMIN001',
          username: 'admin',
          password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O',
          name: 'System Administrator',
          role: 'admin',
          contact_number: '+91 9999999999',
          email: 'admin@nrc.gov.in',
          is_active: 'true',
          created_by: 'SYSTEM',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        // Add sample users
        const sampleUsers = [
          {
            id: uuidv4(),
            employee_id: 'EMP001',
            username: 'priya.sharma',
            password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O',
            name: 'Priya Sharma',
            role: 'anganwadi_worker',
            contact_number: '+91 9876543210',
            email: 'priya.sharma@gov.in',
            is_active: 'true',
            created_by: 'ADMIN001',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: uuidv4(),
            employee_id: 'SUP001',
            username: 'supervisor1',
            password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O',
            name: 'Dr. Sunita Devi',
            role: 'supervisor',
            contact_number: '+91 9876543212',
            email: 'sunita.devi@gov.in',
            is_active: 'true',
            created_by: 'ADMIN001',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: uuidv4(),
            employee_id: 'HOSP001',
            username: 'hospital1',
            password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O',
            name: 'Dr. Amit Sharma',
            role: 'hospital',
            contact_number: '+91 9876543214',
            email: 'amit.sharma@hospital.gov.in',
            is_active: 'true',
            created_by: 'ADMIN001',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];

        sampleUsers.forEach(user => this.writeToCSV('users.csv', user));

        // Add sample hospitals
        this.writeToCSV('hospitals.csv', {
          id: uuidv4(),
          name: 'District Hospital Meerut',
          code: 'HOSP001',
          address: 'Medical College Road, Meerut, UP',
          contact_number: '+91 121-2234567',
          total_beds: '20',
          nrc_equipped: 'true',
          created_at: new Date().toISOString()
        });

        // Add sample beds
        const sampleBeds = [
          { id: uuidv4(), hospital_id: 'HOSP001', number: '101', ward: 'Pediatric', status: 'available', patient_id: '', admission_date: '', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: uuidv4(), hospital_id: 'HOSP001', number: '102', ward: 'Pediatric', status: 'available', patient_id: '', admission_date: '', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: uuidv4(), hospital_id: 'HOSP001', number: '103', ward: 'Pediatric', status: 'maintenance', patient_id: '', admission_date: '', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: uuidv4(), hospital_id: 'HOSP001', number: '201', ward: 'Maternity', status: 'available', patient_id: '', admission_date: '', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: uuidv4(), hospital_id: 'HOSP001', number: '202', ward: 'Maternity', status: 'occupied', patient_id: '', admission_date: '2024-01-15', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: uuidv4(), hospital_id: 'HOSP001', number: '203', ward: 'Maternity', status: 'available', patient_id: '', admission_date: '', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        ];

        sampleBeds.forEach(bed => this.writeToCSV('beds.csv', bed));

        console.log('✅ Sample data initialized successfully');
      }
    } catch (error) {
      console.error('❌ Error initializing sample data:', error);
    }
  }

  readCSV(filename) {
    try {
      const filePath = path.join(this.dataDir, filename);
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️ CSV file ${filename} not found`);
        return [];
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.trim().split('\n');
      
      if (lines.length <= 1) return [];

      const headers = lines[0].split(',');
      const data = [];

      for (let i = 1; i < lines.length; i++) {
        const values = this.parseCSVLine(lines[i]);
        if (values.length === headers.length) {
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index];
          });
          data.push(row);
        }
      }

      console.log(`📊 Read ${data.length} records from ${filename}`);
      return data;
    } catch (error) {
      console.error(`❌ Error reading ${filename}:`, error);
      return [];
    }
  }

  writeToCSV(filename, data) {
    try {
      const filePath = path.join(this.dataDir, filename);
      const headers = this.getHeaders(filename);
      
      // Convert data to CSV row
      const values = headers.map(header => {
        let value = data[header] || '';
        
        // Handle arrays and objects
        if (Array.isArray(value)) {
          value = JSON.stringify(value);
        } else if (typeof value === 'object' && value !== null) {
          value = JSON.stringify(value);
        }
        
        // Escape commas and quotes
        value = String(value).replace(/"/g, '""');
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = `"${value}"`;
        }
        
        return value;
      });

      const csvRow = values.join(',') + '\n';
      fs.appendFileSync(filePath, csvRow);
      
      console.log(`✅ Data written to ${filename}`);
      return true;
    } catch (error) {
      console.error(`❌ Error writing to ${filename}:`, error);
      return false;
    }
  }

  updateCSV(filename, id, updateData) {
    try {
      const data = this.readCSV(filename);
      const index = data.findIndex(row => row.id === id);
      
      if (index === -1) {
        console.log(`⚠️ Record with id ${id} not found in ${filename}`);
        return false;
      }

      // Update the record
      data[index] = { ...data[index], ...updateData, updated_at: new Date().toISOString() };
      
      // Rewrite the entire file
      this.rewriteCSV(filename, data);
      
      console.log(`✅ Updated record ${id} in ${filename}`);
      return true;
    } catch (error) {
      console.error(`❌ Error updating ${filename}:`, error);
      return false;
    }
  }

  deleteFromCSV(filename, id) {
    try {
      const data = this.readCSV(filename);
      const filteredData = data.filter(row => row.id !== id);
      
      if (data.length === filteredData.length) {
        console.log(`⚠️ Record with id ${id} not found in ${filename}`);
        return false;
      }

      this.rewriteCSV(filename, filteredData);
      
      console.log(`✅ Deleted record ${id} from ${filename}`);
      return true;
    } catch (error) {
      console.error(`❌ Error deleting from ${filename}:`, error);
      return false;
    }
  }

  rewriteCSV(filename, data) {
    const filePath = path.join(this.dataDir, filename);
    const headers = this.getHeaders(filename);
    
    let content = headers.join(',') + '\n';
    
    data.forEach(row => {
      const values = headers.map(header => {
        let value = row[header] || '';
        
        // Handle arrays and objects
        if (Array.isArray(value)) {
          value = JSON.stringify(value);
        } else if (typeof value === 'object' && value !== null) {
          value = JSON.stringify(value);
        }
        
        // Escape commas and quotes
        value = String(value).replace(/"/g, '""');
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = `"${value}"`;
        }
        
        return value;
      });
      
      content += values.join(',') + '\n';
    });

    fs.writeFileSync(filePath, content);
  }

  parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current);
    return values;
  }

  getHeaders(filename) {
    const headerMap = {
      'users.csv': ['id', 'employee_id', 'username', 'password_hash', 'name', 'role', 'contact_number', 'email', 'is_active', 'created_by', 'created_at', 'updated_at'],
      'patients.csv': ['id', 'registration_number', 'aadhaar_number', 'name', 'age', 'type', 'pregnancy_week', 'contact_number', 'emergency_contact', 'address', 'weight', 'height', 'blood_pressure', 'temperature', 'hemoglobin', 'nutrition_status', 'medical_history', 'symptoms', 'documents', 'photos', 'remarks', 'risk_score', 'nutritional_deficiency', 'bed_id', 'last_visit_date', 'next_visit_date', 'registered_by', 'registration_date', 'is_active', 'created_at', 'updated_at'],
      'anganwadi_centers.csv': ['id', 'name', 'code', 'location_area', 'location_district', 'location_state', 'location_pincode', 'latitude', 'longitude', 'supervisor_name', 'supervisor_contact', 'supervisor_employee_id', 'capacity_pregnant_women', 'capacity_children', 'facilities', 'coverage_areas', 'established_date', 'is_active', 'created_at', 'updated_at'],
      'workers.csv': ['id', 'employee_id', 'name', 'role', 'anganwadi_id', 'contact_number', 'address', 'assigned_areas', 'qualifications', 'working_hours_start', 'working_hours_end', 'emergency_contact_name', 'emergency_contact_relation', 'emergency_contact_number', 'join_date', 'is_active', 'created_at', 'updated_at'],
      'beds.csv': ['id', 'hospital_id', 'number', 'ward', 'status', 'patient_id', 'admission_date', 'created_at', 'updated_at'],
      'bed_requests.csv': ['id', 'patient_id', 'requested_by', 'request_date', 'urgency_level', 'medical_justification', 'current_condition', 'estimated_stay_duration', 'special_requirements', 'status', 'reviewed_by', 'review_date', 'review_comments', 'hospital_referral', 'created_at', 'updated_at'],
      'visits.csv': ['id', 'patient_id', 'health_worker_id', 'scheduled_date', 'actual_date', 'status', 'notes', 'created_at', 'updated_at'],
      'medical_records.csv': ['id', 'patient_id', 'visit_date', 'visit_type', 'health_worker_id', 'weight', 'height', 'temperature', 'blood_pressure', 'pulse', 'respiratory_rate', 'oxygen_saturation', 'symptoms', 'diagnosis', 'treatment', 'medications', 'appetite', 'food_intake', 'supplements', 'diet_plan', 'hemoglobin', 'blood_sugar', 'protein_level', 'notes', 'next_visit_date', 'follow_up_required', 'created_at', 'updated_at'],
      'notifications.csv': ['id', 'user_role', 'type', 'title', 'message', 'priority', 'action_required', 'read_status', 'date', 'created_at'],
      'hospitals.csv': ['id', 'name', 'code', 'address', 'contact_number', 'total_beds', 'nrc_equipped', 'created_at']
    };
    
    return headerMap[filename] || [];
  }

  findById(filename, id) {
    const data = this.readCSV(filename);
    return data.find(row => row.id === id) || null;
  }

  findByField(filename, field, value) {
    const data = this.readCSV(filename);
    return data.filter(row => row[field] === value);
  }

  findOne(filename, criteria) {
    const data = this.readCSV(filename);
    return data.find(row => {
      return Object.keys(criteria).every(key => row[key] === criteria[key]);
    }) || null;
  }

  count(filename) {
    return this.readCSV(filename).length;
  }
}

module.exports = new CSVManager();