const express = require('express')
const router = express.Router()
const { register, login, socialLogin, getMe, updateProfile, changePassword } = require('../controllers/authController')
const { protect } = require('../middleware/auth')

router.post('/register', register)
router.post('/login', login)
router.post('/social-login', socialLogin)
router.get('/me', protect, getMe)
router.put('/profile', protect, updateProfile)
router.put('/change-password', protect, changePassword)

module.exports = router