const express = require('express');
const { body, validationResult } = require('express-validator');
const csvManager = require('../utils/csvManager');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Get all patients
router.get('/', async (req, res) => {
  try {
    console.log('📊 Fetching all patients from CSV database...');
    
    const patients = csvManager.readCSV('patients.csv');
    
    // Transform CSV data to frontend format
    const transformedPatients = patients
      .filter(patient => patient.is_active === 'true')
      .map(patient => ({
        id: patient.id,
        registrationNumber: patient.registration_number,
        aadhaarNumber: patient.aadhaar_number,
        name: patient.name,
        age: parseInt(patient.age),
        type: patient.type,
        pregnancyWeek: patient.pregnancy_week ? parseInt(patient.pregnancy_week) : undefined,
        contactNumber: patient.contact_number,
        emergencyContact: patient.emergency_contact,
        address: patient.address,
        weight: parseFloat(patient.weight),
        height: parseFloat(patient.height),
        bloodPressure: patient.blood_pressure,
        temperature: patient.temperature ? parseFloat(patient.temperature) : undefined,
        hemoglobin: patient.hemoglobin ? parseFloat(patient.hemoglobin) : undefined,
        nutritionStatus: patient.nutrition_status,
        medicalHistory: patient.medical_history ? JSON.parse(patient.medical_history) : [],
        symptoms: patient.symptoms ? JSON.parse(patient.symptoms) : [],
        documents: patient.documents ? JSON.parse(patient.documents) : [],
        photos: patient.photos ? JSON.parse(patient.photos) : [],
        remarks: patient.remarks,
        riskScore: parseInt(patient.risk_score) || 0,
        nutritionalDeficiency: patient.nutritional_deficiency ? JSON.parse(patient.nutritional_deficiency) : [],
        bedId: patient.bed_id,
        lastVisitDate: patient.last_visit_date,
        nextVisitDate: patient.next_visit_date,
        registeredBy: patient.registered_by,
        registrationDate: patient.registration_date,
        admissionDate: patient.registration_date,
        nextVisit: patient.next_visit_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }));
    
    console.log(`✅ Successfully retrieved ${transformedPatients.length} patients from CSV`);
    res.json(transformedPatients);
  } catch (err) {
    console.error('❌ Error fetching patients from CSV:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create new patient
router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('age').isInt({ min: 0 }).withMessage('Valid age is required'),
  body('type').isIn(['child', 'pregnant']).withMessage('Type must be child or pregnant'),
  body('contactNumber').notEmpty().withMessage('Contact number is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('weight').isFloat({ min: 0 }).withMessage('Valid weight is required'),
  body('height').isFloat({ min: 0 }).withMessage('Valid height is required'),
  body('nutritionStatus').isIn(['normal', 'malnourished', 'severely_malnourished']).withMessage('Valid nutrition status is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    console.log('📝 Received patient data from frontend:', JSON.stringify(req.body, null, 2));
    
    const patientId = uuidv4();
    const registrationNumber = `NRC${Date.now()}`;
    
    // Transform frontend data to CSV format
    const patientData = {
      id: patientId,
      registration_number: registrationNumber,
      aadhaar_number: req.body.aadhaarNumber || '',
      name: req.body.name,
      age: req.body.age.toString(),
      type: req.body.type,
      pregnancy_week: req.body.pregnancyWeek ? req.body.pregnancyWeek.toString() : '',
      contact_number: req.body.contactNumber,
      emergency_contact: req.body.emergencyContact || req.body.contactNumber,
      address: req.body.address,
      weight: req.body.weight.toString(),
      height: req.body.height.toString(),
      blood_pressure: req.body.bloodPressure || '',
      temperature: req.body.temperature ? req.body.temperature.toString() : '',
      hemoglobin: req.body.hemoglobin ? req.body.hemoglobin.toString() : '',
      nutrition_status: req.body.nutritionStatus,
      medical_history: JSON.stringify(req.body.medicalHistory || []),
      symptoms: JSON.stringify(req.body.symptoms || []),
      documents: JSON.stringify(req.body.documents || []),
      photos: JSON.stringify(req.body.photos || []),
      remarks: req.body.remarks || '',
      risk_score: (req.body.riskScore || 0).toString(),
      nutritional_deficiency: JSON.stringify(req.body.nutritionalDeficiency || []),
      bed_id: '',
      last_visit_date: '',
      next_visit_date: req.body.nextVisit || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      registered_by: req.body.registeredBy || 'SYSTEM',
      registration_date: new Date().toISOString().split('T')[0],
      is_active: 'true',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('🔄 Processing patient data for CSV storage:', JSON.stringify(patientData, null, 2));

    // Save to CSV file
    const success = csvManager.writeToCSV('patients.csv', patientData);
    
    if (success) {
      console.log('✅ Patient successfully saved to CSV database with ID:', patientId);

      // Create notification for high-risk patients
      if (parseInt(patientData.risk_score) > 80 || patientData.nutrition_status === 'severely_malnourished') {
        console.log('🚨 Creating high-risk patient notification...');
        
        const notificationData = {
          id: uuidv4(),
          user_role: 'supervisor',
          type: 'high_risk_alert',
          title: 'High Risk Patient Registered',
          message: `New high-risk patient ${patientData.name} has been registered with ${patientData.nutrition_status} status.`,
          priority: 'high',
          action_required: 'true',
          read_status: 'false',
          date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString()
        };
        
        csvManager.writeToCSV('notifications.csv', notificationData);
        console.log('✅ High-risk notification created in CSV');
      }

      res.status(201).json({ 
        message: 'Patient created successfully', 
        id: patientId,
        registrationNumber: registrationNumber
      });
    } else {
      throw new Error('Failed to save patient data to CSV');
    }
  } catch (err) {
    console.error('❌ Error creating patient in CSV:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update patient
router.put('/:id', async (req, res) => {
  try {
    console.log(`📝 Updating patient ${req.params.id} in CSV with data:`, JSON.stringify(req.body, null, 2));
    
    const updates = { ...req.body };
    
    // Convert frontend field names to CSV field names
    if (updates.contactNumber) {
      updates.contact_number = updates.contactNumber;
      delete updates.contactNumber;
    }
    if (updates.nutritionStatus) {
      updates.nutrition_status = updates.nutritionStatus;
      delete updates.nutritionStatus;
    }
    if (updates.medicalHistory) {
      updates.medical_history = JSON.stringify(updates.medicalHistory);
      delete updates.medicalHistory;
    }
    
    updates.updated_at = new Date().toISOString();

    console.log('💾 Executing CSV update...');
    const success = csvManager.updateCSV('patients.csv', req.params.id, updates);
    
    if (success) {
      console.log('✅ Patient successfully updated in CSV database');
      res.json({ message: 'Patient updated successfully' });
    } else {
      res.status(404).json({ error: 'Patient not found' });
    }
  } catch (err) {
    console.error('❌ Error updating patient in CSV:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;