const axios = require('axios')

// Geocode city name → lat/lng using Open-Meteo geocoding API
const geocodeCity = async (city) => {
  const res = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
    params: { name: city, count: 1, language: 'en', format: 'json' },
  })
  const results = res.data.results
  if (!results || results.length === 0) throw new Error(`City "${city}" not found`)
  return { lat: results[0].latitude, lng: results[0].longitude, name: results[0].name, country: results[0].country }
}

// GET /api/weather?city=Goa
const getWeather = async (req, res, next) => {
  try {
    const { city, lat, lng } = req.query
    let coords = {}

    if (lat && lng) {
      coords = { lat: parseFloat(lat), lng: parseFloat(lng), name: city || 'Your Location' }
    } else if (city) {
      coords = await geocodeCity(city)
    } else {
      return res.status(400).json({ success: false, message: 'Provide city or lat/lng' })
    }

    const weatherRes = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: coords.lat,
        longitude: coords.lng,
        daily: [
          'temperature_2m_max', 'temperature_2m_min',
          'precipitation_probability_max', 'weathercode',
          'windspeed_10m_max', 'uv_index_max'
        ].join(','),
        current_weather: true,
        timezone: 'auto',
        forecast_days: 7,
      },
    })

    const { current_weather, daily } = weatherRes.data

    // Map WMO weather codes to readable descriptions
    const describeCode = (code) => {
      if (code === 0) return { desc: 'Clear sky', icon: 'sun' }
      if (code <= 3) return { desc: 'Partly cloudy', icon: 'cloud' }
      if (code <= 49) return { desc: 'Foggy', icon: 'cloud' }
      if (code <= 69) return { desc: 'Drizzle', icon: 'rain' }
      if (code <= 79) return { desc: 'Snow', icon: 'snow' }
      if (code <= 99) return { desc: 'Thunderstorm', icon: 'storm' }
      return { desc: 'Unknown', icon: 'cloud' }
    }

    const forecast = daily.time.map((date, i) => ({
      date,
      day: new Date(date).toLocaleDateString('en', { weekday: 'short' }),
      high: Math.round(daily.temperature_2m_max[i]),
      low: Math.round(daily.temperature_2m_min[i]),
      rain: daily.precipitation_probability_max[i],
      wind: Math.round(daily.windspeed_10m_max[i]),
      uvIndex: daily.uv_index_max[i],
      ...describeCode(daily.weathercode[i]),
    }))

    res.json({
      success: true,
      data: {
        location: { name: coords.name, country: coords.country, lat: coords.lat, lng: coords.lng },
        current: {
          temp: Math.round(current_weather.temperature),
          windspeed: Math.round(current_weather.windspeed),
          ...describeCode(current_weather.weathercode),
        },
        forecast,
      },
    })
  } catch (err) {
    next(err)
  }
}

module.exports = { getWeather }