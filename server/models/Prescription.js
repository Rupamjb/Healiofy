const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ocrText: {
    type: String,
    required: true
  },
  analysis: {
    precautions: {
      dietary_restrictions: [String],
      activity_limitations: [String],
      side_effects: [String]
    },
    duration: {
      total_days: Number,
      frequency: String,
      timing: String
    },
    warnings: {
      drug_interactions: [String],
      contraindications: [String],
      overdose_symptoms: [String]
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Prescription', PrescriptionSchema); 