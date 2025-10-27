const express = require('express');
const csvManager = require('../utils/csvManager');

const router = express.Router();

// Get all beds
router.get('/', async (req, res) => {
  try {
    console.log('📊 Fetching all beds from CSV...');
    
    const beds = csvManager.readCSV('beds.csv');
    const patients = csvManager.readCSV('patients.csv');
    const hospitals = csvManager.readCSV('hospitals.csv');
    
    // Transform to frontend format with patient and hospital data
    const transformedBeds = beds.map(bed => {
      const patient = bed.patient_id ? patients.find(p => p.id === bed.patient_id) : null;
      const hospital = hospitals.find(h => h.id === bed.hospital_id);
      
      return {
        id: bed.id,
        hospitalId: bed.hospital_id,
        number: bed.number,
        ward: bed.ward,
        status: bed.status,
        patientId: bed.patient_id || undefined,
        admissionDate: bed.admission_date || undefined,
        patientName: patient?.name,
        patientType: patient?.type,
        nutritionStatus: patient?.nutrition_status,
        hospitalName: hospital?.name
      };
    });
    
    console.log(`✅ Successfully retrieved ${transformedBeds.length} beds from CSV`);
    res.json(transformedBeds);
  } catch (err) {
    console.error('❌ Error fetching beds:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update bed status
router.put('/:id', async (req, res) => {
  try {
    console.log(`📝 Updating bed ${req.params.id} with data:`, JSON.stringify(req.body, null, 2));
    
    const { status, patientId, admissionDate } = req.body;
    
    console.log('🔄 Starting CSV update...');
    
    // Update bed
    const bedUpdates = { 
      status, 
      patient_id: patientId || '', 
      admission_date: admissionDate || '',
      updated_at: new Date().toISOString()
    };
    
    const bedSuccess = csvManager.updateCSV('beds.csv', req.params.id, bedUpdates);
    
    if (!bedSuccess) {
      return res.status(404).json({ error: 'Bed not found' });
    }
    
    // Update patient's bed assignment if assigning
    if (patientId) {
      console.log('💾 Updating patient bed assignment...');
      csvManager.updateCSV('patients.csv', patientId, { 
        bed_id: req.params.id,
        updated_at: new Date().toISOString()
      });
    } else if (status === 'available') {
      // Clear patient's bed assignment if freeing bed
      console.log('💾 Clearing patient bed assignment...');
      const patients = csvManager.readCSV('patients.csv');
      const patientWithBed = patients.find(p => p.bed_id === req.params.id);
      if (patientWithBed) {
        csvManager.updateCSV('patients.csv', patientWithBed.id, { 
          bed_id: '',
          updated_at: new Date().toISOString()
        });
      }
    }
    
    console.log('✅ Bed successfully updated in CSV');
    res.json({ message: 'Bed updated successfully' });
  } catch (err) {
    console.error('❌ Error updating bed:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;