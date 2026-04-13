const mongoose = require('mongoose')

const expenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
  desc: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  category: {
    type: String,
    enum: ['food', 'transport', 'hotel', 'activity', 'shopping', 'other'],
    default: 'other',
  },
  date: { type: Date, default: Date.now },
  paidBy: { type: String, default: 'me' },
  splitWith: [{ name: String, userId: mongoose.Schema.Types.ObjectId }],
  isSettled: { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model('Expense', expenseSchema)