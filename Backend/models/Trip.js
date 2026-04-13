const mongoose = require('mongoose')

const activitySchema = new mongoose.Schema({
  time: String,
  icon: String,
  type: { type: String, enum: ['Travel', 'Food', 'Hotel', 'Activity', 'Other'], default: 'Activity' },
  title: String,
  desc: String,
  cost: String,
})

const daySchema = new mongoose.Schema({
  day: Number,
  title: String,
  activities: [activitySchema],
})

const tripSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  destination: { type: String, required: true },
  days: { type: Number, required: true },
  budget: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  travelers: { type: Number, default: 1 },
  tripType: { type: String, default: 'Cultural' },
  startDate: { type: Date },
  endDate: { type: Date },
  status: { type: String, enum: ['planning', 'confirmed', 'ongoing', 'completed'], default: 'planning' },
  itinerary: [daySchema],
  totalEstimatedCost: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  isGroupTrip: { type: Boolean, default: false },
  groupMembers: [{ name: String, email: String }],
}, { timestamps: true })

module.exports = mongoose.model('Trip', tripSchema)