const express = require('express');
const csvManager = require('../utils/csvManager');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Get notifications by role
router.get('/role/:role', async (req, res) => {
  try {
    console.log(`📊 Fetching notifications for role ${req.params.role} from CSV...`);
    
    const notifications = csvManager.findByField('notifications.csv', 'user_role', req.params.role);
    
    // Transform to frontend format
    const transformedNotifications = notifications.map(notification => ({
      id: notification.id,
      userRole: notification.user_role,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      actionRequired: notification.action_required === 'true',
      read: notification.read_status === 'true',
      date: notification.date
    }));
    
    console.log(`✅ Successfully retrieved ${transformedNotifications.length} notifications from CSV`);
    res.json(transformedNotifications);
  } catch (err) {
    console.error('❌ Error fetching notifications:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create notification
router.post('/', async (req, res) => {
  try {
    console.log('📝 Received notification data from frontend:', JSON.stringify(req.body, null, 2));
    
    const notificationData = {
      id: uuidv4(),
      user_role: req.body.userRole,
      type: req.body.type,
      title: req.body.title,
      message: req.body.message,
      priority: req.body.priority || 'medium',
      action_required: (req.body.actionRequired || false).toString(),
      read_status: 'false',
      date: req.body.date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };

    console.log('🔄 Processing notification data for CSV storage:', JSON.stringify(notificationData, null, 2));

    const success = csvManager.writeToCSV('notifications.csv', notificationData);
    
    if (success) {
      console.log('✅ Notification successfully saved to CSV with ID:', notificationData.id);
      res.status(201).json({ 
        message: 'Notification created successfully', 
        id: notificationData.id
      });
    } else {
      throw new Error('Failed to save notification to CSV');
    }
  } catch (err) {
    console.error('❌ Error creating notification:', err);
    res.status(500).json({ error: err.message });
  }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    console.log(`📝 Marking notification ${req.params.id} as read...`);
    
    const success = csvManager.updateCSV('notifications.csv', req.params.id, { 
      read_status: 'true',
      updated_at: new Date().toISOString()
    });
    
    if (success) {
      console.log('✅ Notification successfully marked as read in CSV');
      res.json({ message: 'Notification marked as read' });
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
  } catch (err) {
    console.error('❌ Error updating notification:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;