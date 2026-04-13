const axios = require('axios')

// Use Overpass API for nearby places
const getNearby = async (req, res, next) => {
  try {
    const { lat, lng, type = 'restaurant', radius = 2000, keyword } = req.query

    if (!lat || !lng)
      return res.status(400).json({ success: false, message: 'lat and lng are required' })

    const nameFilter = keyword ? `["name"~"${keyword}",i]` : ''

    const CATEGORIES = {
      restaurant: ['node["amenity"="restaurant"]', 'node["amenity"="cafe"]', 'node["amenity"="fast_food"]', 'way["amenity"="restaurant"]', 'way["amenity"="cafe"]', 'way["amenity"="fast_food"]'],
      atm:        ['node["amenity"="atm"]', 'node["amenity"="bank"]'],
      hospital:   ['node["amenity"="hospital"]', 'node["amenity"="clinic"]', 'way["amenity"="hospital"]', 'way["amenity"="clinic"]'],
      hotel:      ['node["tourism"="hotel"]', 'node["tourism"="guest_house"]', 'node["tourism"="hostel"]', 'way["tourism"="hotel"]', 'way["tourism"="guest_house"]', 'way["tourism"="hostel"]'],
      tourist:    ['node["tourism"="attraction"]', 'node["tourism"="museum"]', 'node["tourism"="viewpoint"]', 'node["tourism"="gallery"]', 'way["tourism"="attraction"]', 'way["tourism"="museum"]', 'way["tourism"="viewpoint"]', 'way["tourism"="gallery"]'],
      pharmacy:   ['node["amenity"="pharmacy"]', 'way["amenity"="pharmacy"]'],
      transport:  ['node["highway"="bus_stop"]', 'node["railway"="station"]', 'node["public_transport"="station"]', 'node["public_transport"="stop_position"]'],
      shopping:   ['node["shop"]', 'way["shop"]', 'node["amenity"="marketplace"]', 'way["amenity"="marketplace"]']
    }

    const statements = (CATEGORIES[type] || CATEGORIES['restaurant']).map(
      stmt => `  ${stmt}${nameFilter}(around:${radius},${lat},${lng});`
    ).join('\n')

    // Build standard Overpass QL
    const query = `
      [out:json][timeout:25];
      (
      ${statements}
      );
      out center;
    `

    let response
    const headers = { 
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'SmartTravelCompanion/1.0 (Contact: user@example.com)'
    }

    try {
      response = await axios.post('https://overpass-api.de/api/interpreter', `data=${encodeURIComponent(query)}`, { headers })
    } catch (e) {
      if (e.response && e.response.status === 429) {
        // Fallback to secondary server if rate limited
        response = await axios.post('https://lz4.overpass-api.de/api/interpreter', `data=${encodeURIComponent(query)}`, { headers })
      } else {
        throw e
      }
    }

    const elements = Array.isArray(response?.data?.elements) ? response.data.elements.slice(0, 40) : []
    const places = elements.map((p) => {
      const location = p.type === 'node' ? { lat: p.lat, lng: p.lon } : { lat: p.center?.lat, lng: p.center?.lon }
      return {
        placeId: p.id.toString(),
        name: p.tags?.name || 'Unnamed Place',
        rating: (Math.random() * 2 + 3).toFixed(1), // Mock rating (OSM lacks standard ratings mostly)
        totalRatings: Math.floor(Math.random() * 100) + 10,
        address: [p.tags?.['addr:street'], p.tags?.['addr:city']].filter(Boolean).join(', ') || 'Address not listed',
        location: location,
        open: true, // Mock open state
        type: type,
        photo: null // OSM doesn't natively supply photos
      }
    })

    res.json({ success: true, data: places, total: places.length })
  } catch (err) {
    next(err)
  }
}

// GET /api/places/details/:placeId
const getPlaceDetails = async (req, res, next) => {
  try {
    const { placeId } = req.params

    const query = `
      [out:json];
      (node(${placeId}); way(${placeId}););
      out center;
    `
    const response = await axios.post('https://overpass-api.de/api/interpreter', `data=${encodeURIComponent(query)}`, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    
    const p = response.data.elements?.[0]
    if (!p) return res.status(404).json({ success: false, message: 'Place not found' })

    res.json({
      success: true,
      data: {
        name: p.tags?.name || 'Unknown',
        rating: 4.5, // Mocked rating
        formatted_address: p.tags?.['addr:street'] || 'Address unavailable',
        formatted_phone_number: p.tags?.phone || 'No phone provided',
        website: p.tags?.website || null,
        geometry: { location: p.type === 'node' ? { lat: p.lat, lng: p.lon } : { lat: p.center?.lat, lng: p.center?.lon } }
      }
    })
  } catch (err) {
    next(err)
  }
}

// GET /api/places/geocode?address=Goa
const geocode = async (req, res, next) => {
  try {
    const { address } = req.query
    if (!address) return res.status(400).json({ success: false, message: 'address is required' })

    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { q: address, format: 'json', limit: 1 },
      headers: { 'User-Agent': 'SmartTravelCompanion/1.0' }
    })

    const result = response.data[0]
    if (!result) return res.status(404).json({ success: false, message: 'Location not found' })

    res.json({
      success: true,
      data: {
        address: result.display_name,
        location: { lat: parseFloat(result.lat), lng: parseFloat(result.lon) },
        placeId: result.place_id.toString(),
      },
    })
  } catch (err) {
    next(err)
  }
}

module.exports = { getNearby, getPlaceDetails, geocode }