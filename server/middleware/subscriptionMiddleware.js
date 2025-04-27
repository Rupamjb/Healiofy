const User = require('../models/User');

// Middleware to check if user has access to prescription analyzer
exports.checkPrescriptionAnalyzerAccess = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if user is on trial with analyses remaining
    if (user.subscriptionStatus === 'trial' && user.trialAnalysesRemaining > 0) {
      // Decrement analyses remaining
      user.trialAnalysesRemaining -= 1;
      await user.save();
      return next();
    }
    
    // Check if user has active subscription
    if (user.subscriptionStatus === 'active' && 
        user.subscriptionEndDate && 
        new Date(user.subscriptionEndDate) > new Date()) {
      return next();
    }
    
    // No access
    return res.status(403).json({
      success: false,
      error: 'Subscription required to access this feature',
      subscriptionStatus: user.subscriptionStatus,
      subscriptionRequired: true
    });
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Middleware to check if user has access to consultant booking
exports.checkConsultationAccess = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if user is on trial with consultations remaining
    if (user.subscriptionStatus === 'trial' && user.trialConsultationsRemaining > 0) {
      // Decrement consultations remaining
      user.trialConsultationsRemaining -= 1;
      await user.save();
      return next();
    }
    
    // Check if user has active subscription
    if (user.subscriptionStatus === 'active' && 
        user.subscriptionEndDate && 
        new Date(user.subscriptionEndDate) > new Date()) {
      return next();
    }
    
    // No access
    return res.status(403).json({
      success: false,
      error: 'Subscription required to access this feature',
      subscriptionStatus: user.subscriptionStatus,
      subscriptionRequired: true
    });
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Middleware to check if user has access to chatbot
exports.checkChatbotAccess = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if user is on trial (unlimited chatbot access during trial)
    if (user.subscriptionStatus === 'trial') {
      return next();
    }
    
    // Check if user has active subscription
    if (user.subscriptionStatus === 'active' && 
        user.subscriptionEndDate && 
        new Date(user.subscriptionEndDate) > new Date()) {
      return next();
    }
    
    // No access
    return res.status(403).json({
      success: false,
      error: 'Subscription required to access this feature',
      subscriptionStatus: user.subscriptionStatus,
      subscriptionRequired: true
    });
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
}; 