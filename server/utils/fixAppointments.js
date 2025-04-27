/**
 * Utility script to identify and fix appointments with null doctorId
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

// Load environment variables
dotenv.config();

async function fixAppointments() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas successfully');

    // Find appointments with null doctorId
    const appointments = await Appointment.find();
    console.log(`Found ${appointments.length} total appointments`);

    // Get all appointments with null or invalid doctorId
    const invalidAppointments = [];
    
    for (const appointment of appointments) {
      try {
        // Check if doctorId exists
        if (!appointment.doctorId) {
          invalidAppointments.push(appointment);
          continue;
        }
        
        // Check if the doctorId is valid
        const doctor = await Doctor.findById(appointment.doctorId);
        if (!doctor) {
          invalidAppointments.push(appointment);
        }
      } catch (error) {
        console.error(`Error checking appointment ${appointment._id}:`, error);
        invalidAppointments.push(appointment);
      }
    }
    
    console.log(`Found ${invalidAppointments.length} appointments with invalid doctorId`);
    
    if (invalidAppointments.length > 0) {
      // Get a default doctor to assign
      const defaultDoctor = await Doctor.findOne();
      
      if (!defaultDoctor) {
        console.error('No doctors found in the database to fix appointments');
        return;
      }
      
      console.log(`Using doctor ${defaultDoctor.name} (${defaultDoctor._id}) as default`);
      
      // Fix each invalid appointment
      for (const appointment of invalidAppointments) {
        console.log(`Fixing appointment ${appointment._id}`);
        appointment.doctorId = defaultDoctor._id;
        await appointment.save();
      }
      
      console.log(`Fixed ${invalidAppointments.length} appointments`);
    } else {
      console.log('No invalid appointments found, everything looks good');
    }
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error fixing appointments:', error);
  }
}

// Run the fix function
fixAppointments(); 