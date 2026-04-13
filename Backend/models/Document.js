const mongoose = require('mongoose')

const documentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['Passport', 'Visa', 'Flight Ticket', 'Hotel Booking', 'Travel Insurance', 'ID Card', 'Vaccination', 'Other'],
    default: 'Other',
  },
  filename: { type: String, required: true },
  originalName: { type: String },
  size: { type: Number },
  mimeType: { type: String },
  expiresAt: { type: Date },
  isEncrypted: { type: Boolean, default: true },
  tags: [String],
}, { timestamps: true })

module.exports = mongoose.model('Document', documentSchema)