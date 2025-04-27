const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { getCancellationWindowHours } = require('../config/cancellationConfig');

/**
 * @desc    Book a new appointment
 * @route   POST /api/appointments
 * @access  Private
 */
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, date } = req.body;

    // Validate required fields
    if (!doctorId || !date) {
      return res.status(400).json({
        success: false,
        error: 'Please provide doctorId and date'
      });
    }

    // Validate date format is ISO
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use ISO format (e.g., 2024-05-30T14:00:00Z)'
      });
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: 'Doctor not found'
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      doctorId,
      userId: req.user.id, // From JWT auth middleware
      date,
      status: 'pending'
    });

    // Get the created appointment with populated doctor info
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('doctorId', 'name specialty imageUrl')
      .exec();

    res.status(201).json({
      success: true,
      data: populatedAppointment
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * @desc    Get appointments for a user
 * @route   GET /api/appointments
 * @access  Private
 */
exports.getUserAppointments = async (req, res) => {
  try {
    console.log('Fetching appointments for user:', req.user.id);
    
    // Check for a doctor ID parameter to filter by doctor
    const filter = { userId: req.user.id };
    if (req.query.doctorId) {
      filter.doctorId = req.query.doctorId;
    }
    
    // Get appointments with doctor details populated
    const appointments = await Appointment.find(filter)
      .populate('doctorId', 'name specialty imageUrl')
      .sort({ date: 1 })
      .exec();
    
    console.log(`Found ${appointments.length} appointments`);
    
    // Check for any appointments with null doctorId and log them 
    const nullDoctorAppointments = appointments.filter(a => !a.doctorId);
    if (nullDoctorAppointments.length > 0) {
      console.warn(`${nullDoctorAppointments.length} appointments have null doctorId:`, 
        nullDoctorAppointments.map(a => a._id));
    }
    
    // Return the appointments
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * @desc    Get appointment by ID
 * @route   GET /api/appointments/:id
 * @access  Private
 */
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctorId', 'name specialty imageUrl')
      .exec();

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    // Check if appointment belongs to user
    if (appointment.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this appointment'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * @desc    Update appointment status
 * @route   PATCH /api/appointments/:id
 * @access  Private
 */
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Validate status
    if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be one of: pending, confirmed, cancelled'
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    // Check if appointment belongs to user
    if (appointment.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this appointment'
      });
    }

    // Special validation for cancellations
    if (status === 'cancelled') {
      const appointmentDate = new Date(appointment.date);
      const currentDate = new Date();
      
      // If the appointment is already in the past, don't allow cancellation
      if (appointmentDate < currentDate) {
        return res.status(400).json({
          success: false,
          error: 'Cannot cancel appointments that have already occurred'
        });
      }

      // Check if cancellation is within allowed time window
      const cancellationWindow = getCancellationWindowHours(); // Get from config
      
      // Calculate the deadline for cancellation
      const cancellationDeadline = new Date(appointmentDate);
      cancellationDeadline.setHours(cancellationDeadline.getHours() - cancellationWindow);
      
      if (cancellationWindow > 0 && currentDate > cancellationDeadline) {
        return res.status(400).json({
          success: false,
          error: `Appointments must be cancelled at least ${cancellationWindow} hour(s) before the scheduled time`
        });
      }
    }

    // Update status
    appointment.status = status;
    await appointment.save();

    // Return updated appointment with populated doctor info
    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('doctorId', 'name specialty imageUrl')
      .exec();

    res.status(200).json({
      success: true,
      data: updatedAppointment
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
}; 