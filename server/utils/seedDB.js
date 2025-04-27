const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * Seeds the database with a test user if one doesn't already exist
 */
const seedTestUser = async () => {
  try {
    const testEmail = 'testuser@example.com';
    const testPassword = 'test1234';

    // Check if test user already exists
    const existingUser = await User.findOne({ email: testEmail });
    
    if (existingUser) {
      console.log('Test user already exists in database');
      return;
    }
    
    // Create test user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(testPassword, salt);
    
    await User.create({
      email: testEmail,
      password: hashedPassword
    });
    
    console.log('Test user created successfully');
  } catch (error) {
    console.error('Error seeding test user:', error);
  }
};

module.exports = { seedTestUser }; 