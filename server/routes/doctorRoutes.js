const express = require('express');
const router = express.Router();
const { 
  getDoctors, 
  getDoctorById, 
  getDoctorsBySpecialty 
} = require('../controllers/doctorController');

// Get all doctors or search by name/specialty
router.get('/', getDoctors);

// Get doctors by specialty - specific route must come before param route
router.get('/specialty/:specialty', getDoctorsBySpecialty);

// Get doctor by ID
router.get('/:id', getDoctorById);

module.exports = router; 