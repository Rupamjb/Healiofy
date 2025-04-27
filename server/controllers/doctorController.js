const Doctor = require('../models/Doctor');

// @desc    Get all doctors or search by name/specialty
// @route   GET /api/doctors
// @access  Public
exports.getDoctors = async (req, res) => {
  try {
    const { name, specialty } = req.query;
    let query = {};

    // Build query based on parameters
    if (name || specialty) {
      query = {
        $or: []
      };

      if (name) {
        // Case-insensitive partial match for name
        query.$or.push({ name: new RegExp(name, 'i') });
      }

      if (specialty) {
        // Exact match for specialty (case-insensitive)
        query.$or.push({ specialty: new RegExp(`^${specialty}$`, 'i') });
      }
    }

    // Execute query
    const doctors = await Doctor.find(query).sort({ name: 1 });

    // Return results
    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    console.error('Error fetching doctor by ID:', error);
    
    // If the error is due to invalid ID format
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Doctor not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get doctors by specialty
// @route   GET /api/doctors/specialty/:specialty
// @access  Public
exports.getDoctorsBySpecialty = async (req, res) => {
  try {
    const { specialty } = req.params;
    
    // Case-insensitive exact match for specialty
    const doctors = await Doctor.find({
      specialty: new RegExp(`^${specialty}$`, 'i')
    }).sort({ rating: -1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    console.error('Error fetching doctors by specialty:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
}; 