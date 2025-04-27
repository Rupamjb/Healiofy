const express = require('express');
const router = express.Router();
const { 
  bookAppointment, 
  getUserAppointments, 
  updateAppointmentStatus 
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');
const { checkConsultationAccess } = require('../middleware/subscriptionMiddleware');

// Get user appointments
router.get('/', protect, getUserAppointments);

// Create appointment with subscription check
router.post('/', protect, checkConsultationAccess, bookAppointment);

// Update appointment status
router.put('/:id/status', protect, updateAppointmentStatus);

module.exports = router; 