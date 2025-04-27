const express = require('express');
const router = express.Router();
const { 
  getSubscriptionStatus, 
  createPaymentTransaction, 
  verifyPayment,
  createTestAccount,
  processTestPayment
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');

// Protect all subscription routes
router.use(protect);

// Get subscription status
router.get('/status', getSubscriptionStatus);

// Create payment transaction
router.post('/payment/create', createPaymentTransaction);

// Verify payment
router.post('/payment/verify', verifyPayment);

// Process test payment
router.post('/payment/test', processTestPayment);

// Create test account (only for hackathon demo purposes)
router.post('/testaccount', createTestAccount);

module.exports = router; 