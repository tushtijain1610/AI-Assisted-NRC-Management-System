const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const csvManager = require('./utils/csvManager');
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const bedRoutes = require('./routes/beds');
const notificationRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet());
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize CSV data storage
const initializeApp = async () => {
  try {
    console.log('🔄 Initializing NRC Management CSV Database...');
    
    // CSV Manager automatically initializes files and sample data
    console.log('✅ CSV database initialization completed successfully');
    console.log('📊 Sample data available for testing');
    console.log('📁 Data stored in server/data/ directory');
  } catch (error) {
    console.error('❌ CSV database initialization failed:', error);
    process.exit(1);
  }
};

// Initialize CSV storage
initializeApp();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/beds', bedRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const userCount = csvManager.count('users.csv');
  const patientCount = csvManager.count('patients.csv');
  
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '5.0.0',
    database: 'CSV File Storage',
    environment: NODE_ENV,
    statistics: {
      users: userCount,
      patients: patientCount,
      dataDirectory: path.join(__dirname, 'data')
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 NRC Management Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`🔗 Frontend URL: ${FRONTEND_URL}`);
  console.log(`💾 Database: CSV File Storage (Persistent)`);
  console.log(`📡 API Endpoints: /api/patients, /api/beds, /api/notifications, /api/auth`);
  console.log(`👑 Admin Panel: Login with ADMIN001 / admin / admin123`);
  console.log(`📁 Data Directory: ${path.join(__dirname, 'data')}`);
});

module.exports = app;