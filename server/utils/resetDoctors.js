/**
 * Script to reset the doctors collection and re-seed with updated prices
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { seedDoctors } = require('./seedDoctors');
const Doctor = require('../models/Doctor');

// Load environment variables
dotenv.config();

// Connect to MongoDB and reset doctors collection
async function resetDoctors() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas successfully');

    // Delete all doctors from the collection
    console.log('Deleting all doctors from database...');
    await Doctor.deleteMany({});
    console.log('Doctor collection has been reset');

    // Re-seed the doctors collection with updated data
    console.log('Re-seeding doctors collection...');
    await seedDoctors();
    console.log('Database has been re-seeded with updated prices');

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error) {
    console.error('Error resetting doctors collection:', error);
    process.exit(1);
  }
}

// Run the reset function
resetDoctors(); 