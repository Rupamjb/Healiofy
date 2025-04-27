const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Doctor name is required'],
    trim: true
  },
  specialty: {
    type: String,
    required: [true, 'Specialty is required'],
    trim: true
  },
  availability: {
    type: [String],
    default: []
  },
  bio: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: 'https://randomuser.me/api/portraits/men/1.jpg'
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 4.5
  },
  experience: {
    type: String,
    default: '5 years'
  },
  reviews: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    default: 100
  },
  isAvailableNow: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add a text index for better search performance
doctorSchema.index({ name: 'text', specialty: 'text', bio: 'text' });

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor; 