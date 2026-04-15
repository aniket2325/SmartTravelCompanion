const gemini = require('../services/geminiService')
const Trip = require('../models/Trip')
const User = require('../models/User')
const { sendTripGeneratedEmail } = require('../services/emailService')

// POST /api/ai/itinerary
const generateItinerary = async (req, res, next) => {
  try {
    const { destination, days, budget, currency = 'INR', travelers = 1, tripType = 'Cultural' } = req.body

    if (!destination || !days || !budget)
      return res.status(400).json({ success: false, message: 'destination, days, and budget are required' })

    const itineraryData = await gemini.generateItinerary({ destination, days, budget, currency, travelers, tripType })

    // Save to DB as a planning trip
    const trip = await Trip.create({
      user: req.user._id,
      destination,
      days: parseInt(days),
      budget: parseFloat(budget),
      currency,
      travelers: parseInt(travelers),
      tripType,
      itinerary: itineraryData.days,
      totalEstimatedCost: itineraryData.costBreakdown?.total || 0,
      status: 'planning',
    })

    // Award XP for generating itinerary
    await User.findByIdAndUpdate(req.user._id, { $inc: { xp: 50 } })

    // Send email notification
    const fullUser = await User.findById(req.user._id)
    if (fullUser?.preferences?.notifications !== false) {
      // Added await to prevent Vercel execution environment from freezing network requests
      await sendTripGeneratedEmail({
        to: fullUser.email,
        userName: fullUser.name,
        destination,
        days: parseInt(days),
        budget: parseFloat(budget),
        currency,
        tripType,
        travelers: parseInt(travelers),
        totalEstimatedCost: itineraryData.costBreakdown?.total || 0,
        tripId: trip._id,
      }).catch(err => console.error('Email send error:', err))
    }

    res.json({ success: true, data: { ...itineraryData, tripId: trip._id } })
  } catch (err) {
    if (err.message?.includes('JSON')) {
      return res.status(502).json({ success: false, message: 'AI returned unexpected format. Please try again.' })
    }
    next(err)
  }
}

// POST /api/ai/packing-list
const generatePackingList = async (req, res, next) => {
  try {
    const { destination, days, tripType, weather } = req.body
    if (!destination) return res.status(400).json({ success: false, message: 'destination is required' })

    const data = await gemini.generatePackingList({ destination, days, tripType, weather })
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

// POST /api/ai/visa-info
const getVisaInfo = async (req, res, next) => {
  try {
    const { fromCountry, toCountry } = req.body
    if (!fromCountry || !toCountry)
      return res.status(400).json({ success: false, message: 'fromCountry and toCountry are required' })

    const data = await gemini.getVisaInfo({ fromCountry, toCountry })
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

// POST /api/ai/chat
const chat = async (req, res, next) => {
  try {
    const { message } = req.body
    if (!message) return res.status(400).json({ success: false, message: 'message is required' })

    const context = { name: req.user.name, preferences: req.user.preferences }
    const reply = await gemini.travelChat({ message, context })
    res.json({ success: true, reply })
  } catch (err) {
    next(err)
  }
}

// POST /api/ai/culture
const getCultureTips = async (req, res, next) => {
  try {
    const { destination } = req.body
    if (!destination) return res.status(400).json({ success: false, message: 'destination is required' })

    const data = await gemini.getCultureTips({ destination })
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

module.exports = { generateItinerary, generatePackingList, getVisaInfo, chat, getCultureTips }