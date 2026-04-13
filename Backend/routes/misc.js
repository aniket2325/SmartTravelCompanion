const express = require('express')
const { protect } = require('../middleware/auth')

// Weather
const weatherRouter = express.Router()
const { getWeather } = require('../controllers/weatherController')
weatherRouter.get('/', protect, getWeather)

// Currency
const currencyRouter = express.Router()
const { getRates, convertCurrency, getPopularRates } = require('../controllers/currencyController')
currencyRouter.get('/rates',   getRates)
currencyRouter.get('/convert', convertCurrency)
currencyRouter.get('/popular', getPopularRates)

// Places
const placesRouter = express.Router()
const { getNearby, getPlaceDetails, geocode } = require('../controllers/placesController')
placesRouter.get('/nearby',          protect, getNearby)
placesRouter.get('/geocode',         protect, geocode)
placesRouter.get('/details/:placeId',protect, getPlaceDetails)

// Safety
const safetyRouter = express.Router()
const { getContacts, addContact, removeContact, triggerSOS, getEmergencyNumbers } = require('../controllers/safetyController')
safetyRouter.get('/numbers',             getEmergencyNumbers)
safetyRouter.get('/contacts',            protect, getContacts)
safetyRouter.post('/contacts',           protect, addContact)
safetyRouter.delete('/contacts/:contactId', protect, removeContact)
safetyRouter.post('/sos',               protect, triggerSOS)

// Rewards
const rewardsRouter = express.Router()
const { getRewards, awardBadge, addXP } = require('../controllers/rewardsController')
rewardsRouter.get('/',           protect, getRewards)
rewardsRouter.post('/award-badge', protect, awardBadge)
rewardsRouter.post('/add-xp',    protect, addXP)

module.exports = { weatherRouter, currencyRouter, placesRouter, safetyRouter, rewardsRouter }