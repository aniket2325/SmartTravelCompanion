const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { sendWelcomeEmail } = require('../services/emailService')

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id)
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      xp: user.xp,
      level: user.level,
      badges: user.badges,
      preferences: user.preferences,
    },
  })
}

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ success: false, message: 'Email already registered' })

    const user = await User.create({ name, email, password })

    // Send welcome email
    await sendWelcomeEmail({ to: email, userName: name })
      .catch(err => console.error('Welcome email error:', err))

    sendToken(user, 201, res)
  } catch (err) {
    next(err)
  }
}

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' })

    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' })

    sendToken(user, 200, res)
  } catch (err) {
    next(err)
  }
}

// POST /api/auth/social-login
const socialLogin = async (req, res, next) => {
  try {
    const { email, name, uid } = req.body
    if (!email || !uid) 
      return res.status(400).json({ success: false, message: 'Email and UID required from provider' })

    let user = await User.findOne({ email })
    
    if (!user) {
      // Create user without password since they use social login
      // We can generate a random dummy password just to satisfy schema requirements if needed
      const crypto = require('crypto')
      const dummyPassword = crypto.randomBytes(16).toString('hex')
      
      user = await User.create({ name: name || 'Explorer', email, password: dummyPassword })
      
      await sendWelcomeEmail({ to: email, userName: name || 'Explorer' })
        .catch(err => console.error('Welcome email error:', err))
    }

    sendToken(user, 200, res)
  } catch (err) {
    next(err)
  }
}

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user })
}

// PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, preferences, emergencyContacts } = req.body
    const updates = {}
    if (name) updates.name = name
    if (preferences) updates.preferences = { ...req.user.preferences, ...preferences }
    if (emergencyContacts) updates.emergencyContacts = emergencyContacts

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })
    res.json({ success: true, user })
  } catch (err) {
    next(err)
  }
}

// PUT /api/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.user._id).select('+password')
    if (!(await user.matchPassword(currentPassword)))
      return res.status(401).json({ success: false, message: 'Current password incorrect' })

    user.password = newPassword
    await user.save()
    sendToken(user, 200, res)
  } catch (err) {
    next(err)
  }
}

module.exports = { register, login, socialLogin, getMe, updateProfile, changePassword }