const express = require('express');
const router = express.Router();
const { analyzePrescription, preprocessText, extractTextFromImage, getPrescriptionHistory } = require('../controllers/prescriptionController');
const { protect } = require('../middleware/authMiddleware');
const { checkPrescriptionAnalyzerAccess } = require('../middleware/subscriptionMiddleware');
const multer = require('multer');
const os = require('os');
const path = require('path');

// Protect all prescription routes
router.use(protect);

// Preprocess OCR text route
router.post('/preprocess', preprocessText);

// Analyze prescription route (protected + subscription check)
router.post('/analyze', checkPrescriptionAnalyzerAccess, analyzePrescription);

// Get prescription history (protected)
router.get('/history', getPrescriptionHistory);

// Configure multer for Vercel compatibility
const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Extract text from image
router.post('/extract-text', upload.single('image'), extractTextFromImage);

module.exports = router; 