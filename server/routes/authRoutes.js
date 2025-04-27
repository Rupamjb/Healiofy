const express = require('express');
const router = express.Router();
const { register, login, updateProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Get user profile
router.get('/me', protect, async (req, res) => {
  try {
    // Get user without password field
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
  res.status(200).json({
    success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
    }
  });

// Update user profile
router.put('/profile', protect, updateProfile);

// Change password
router.put('/password', protect, changePassword);

module.exports = router; 