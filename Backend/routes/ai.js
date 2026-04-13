const express = require('express')
const router = express.Router()
const { generateItinerary, generatePackingList, getVisaInfo, chat, getCultureTips } = require('../controllers/aiController')
const { protect } = require('../middleware/auth')

router.use(protect)

router.post('/itinerary',    generateItinerary)
router.post('/packing-list', generatePackingList)
router.post('/visa-info',    getVisaInfo)
router.post('/chat',         chat)
router.post('/culture',      getCultureTips)

module.exports = router