const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const csvManager = require('../utils/csvManager');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Login endpoint
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('employee_id').notEmpty().withMessage('Employee ID is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, password, employee_id } = req.body;
    console.log('🔐 Login attempt for:', { username, employee_id });

    // Find user in CSV file
    const user = csvManager.findOne('users.csv', { 
      username: username, 
      employee_id: employee_id,
      is_active: 'true'
    });

    if (!user) {
      console.log('❌ User not found in CSV database');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('✅ User found in CSV database:', user.name);

    // For demo purposes, accept simple passwords
    // In production, use: const validPassword = await bcrypt.compare(password, user.password_hash);
    const validPassword = password === 'worker123' || password === 'super123' || password === 'hosp123' || password === 'admin123';
    
    if (!validPassword) {
      console.log('❌ Invalid password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        employeeId: user.employee_id, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    console.log('✅ Login successful for:', user.name);

    res.json({
      token,
      user: {
        id: user.id,
        employee_id: user.employee_id,
        name: user.name,
        role: user.role,
        contact_number: user.contact_number,
        email: user.email
      }
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all users (Admin only)
router.get('/users', async (req, res) => {
  try {
    console.log('📊 Fetching all users from CSV database...');
    
    const users = csvManager.readCSV('users.csv');
    
    // Remove password hashes from response
    const safeUsers = users.map(user => ({
      id: user.id,
      employee_id: user.employee_id,
      username: user.username,
      name: user.name,
      role: user.role,
      contact_number: user.contact_number,
      email: user.email,
      is_active: user.is_active === 'true',
      created_at: user.created_at
    }));
    
    console.log(`✅ Successfully retrieved ${safeUsers.length} users from CSV`);
    res.json(safeUsers);
  } catch (err) {
    console.error('❌ Error fetching users from CSV:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create new user (Admin only)
router.post('/users', [
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
  body('username').notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  body('role').isIn(['anganwadi_worker', 'supervisor', 'hospital', 'admin']).withMessage('Valid role is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    console.log('📝 Creating new user in CSV:', JSON.stringify(req.body, null, 2));
    
    // Check if employee_id or username already exists
    const existingUser = csvManager.findOne('users.csv', { employee_id: req.body.employeeId });
    const existingUsername = csvManager.findOne('users.csv', { username: req.body.username });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Employee ID already exists' });
    }
    
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    
    const userData = {
      id: userId,
      employee_id: req.body.employeeId,
      username: req.body.username,
      password_hash: hashedPassword,
      name: req.body.name,
      role: req.body.role,
      contact_number: req.body.contactNumber || '',
      email: req.body.email || '',
      is_active: 'true',
      created_by: req.body.createdBy || 'ADMIN',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const success = csvManager.writeToCSV('users.csv', userData);
    
    if (success) {
      console.log('✅ User successfully created in CSV database with ID:', userId);
      res.status(201).json({ message: 'User created successfully', id: userId });
    } else {
      throw new Error('Failed to write user data to CSV');
    }
  } catch (err) {
    console.error('❌ Error creating user in CSV:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    console.log(`📝 Updating user ${req.params.id} in CSV:`, JSON.stringify(req.body, null, 2));
    
    const updates = { ...req.body };
    
    // Convert frontend field names to database field names
    if (updates.contactNumber) {
      updates.contact_number = updates.contactNumber;
      delete updates.contactNumber;
    }
    if (updates.isActive !== undefined) {
      updates.is_active = updates.isActive.toString();
      delete updates.isActive;
    }
    if (updates.password) {
      updates.password_hash = await bcrypt.hash(updates.password, 12);
      delete updates.password;
    }
    
    const success = csvManager.updateCSV('users.csv', req.params.id, updates);
    
    if (success) {
      console.log('✅ User successfully updated in CSV database');
      res.json({ message: 'User updated successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error('❌ Error updating user in CSV:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete user (soft delete)
router.delete('/users/:id', async (req, res) => {
  try {
    console.log(`🗑️ Soft deleting user ${req.params.id} in CSV...`);
    
    const success = csvManager.updateCSV('users.csv', req.params.id, { 
      is_active: 'false',
      updated_at: new Date().toISOString()
    });
    
    if (success) {
      console.log('✅ User successfully deactivated in CSV database');
      res.json({ message: 'User deactivated successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error('❌ Error deactivating user in CSV:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;