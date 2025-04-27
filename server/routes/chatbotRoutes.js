const express = require('express');
const router = express.Router();
const { getChatbotResponse } = require('../controllers/chatbotController');
const { protect } = require('../middleware/authMiddleware');
const { checkChatbotAccess } = require('../middleware/subscriptionMiddleware');

// Protect all chatbot routes
router.use(protect);

// Get chatbot response route (with subscription check)
router.post('/', checkChatbotAccess, getChatbotResponse);

module.exports = router; 