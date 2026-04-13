const express = require('express')
const router = express.Router()
const { getTrips, getTrip, createTrip, updateTrip, deleteTrip } = require('../controllers/tripController')
const { protect } = require('../middleware/auth')

router.use(protect)

router.route('/').get(getTrips).post(createTrip)
router.route('/:id').get(getTrip).put(updateTrip).delete(deleteTrip)

module.exports = router