const Trip = require('../models/Trip')

// GET /api/trips
const getTrips = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query
    const filter = { user: req.user._id }
    if (status) filter.status = status

    const trips = await Trip.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))

    const total = await Trip.countDocuments(filter)

    res.json({ success: true, data: trips, total, page: parseInt(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    next(err)
  }
}

// GET /api/trips/:id
const getTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id })
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' })
    res.json({ success: true, data: trip })
  } catch (err) {
    next(err)
  }
}

// POST /api/trips
const createTrip = async (req, res, next) => {
  try {
    const trip = await Trip.create({ ...req.body, user: req.user._id })
    res.status(201).json({ success: true, data: trip })
  } catch (err) {
    next(err)
  }
}

// PUT /api/trips/:id
const updateTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    )
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' })
    res.json({ success: true, data: trip })
  } catch (err) {
    next(err)
  }
}

// DELETE /api/trips/:id
const deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, user: req.user._id })
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' })
    res.json({ success: true, message: 'Trip deleted' })
  } catch (err) {
    next(err)
  }
}

module.exports = { getTrips, getTrip, createTrip, updateTrip, deleteTrip }