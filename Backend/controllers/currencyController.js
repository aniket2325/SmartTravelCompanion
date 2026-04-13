const axios = require('axios')

// Simple in-memory cache (rates valid for 1 hour)
let ratesCache = { data: null, fetchedAt: null }
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

const fetchRates = async (base = 'USD') => {
  const now = Date.now()
  if (ratesCache.data && ratesCache.fetchedAt && (now - ratesCache.fetchedAt) < CACHE_TTL_MS) {
    return ratesCache.data
  }

  const apiKey = process.env.EXCHANGE_RATE_API_KEY
  let rates

  if (apiKey) {
    // Paid / free-tier ExchangeRate-API
    const res = await axios.get(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/${base}`)
    rates = res.data.conversion_rates
  } else {
    // Fallback: open.er-api.com (no key, limited)
    const res = await axios.get(`https://open.er-api.com/v6/latest/${base}`)
    rates = res.data.rates
  }

  ratesCache = { data: rates, fetchedAt: now }
  return rates
}

// GET /api/currency/rates?base=USD
const getRates = async (req, res, next) => {
  try {
    const base = (req.query.base || 'USD').toUpperCase()
    const rates = await fetchRates(base)
    res.json({ success: true, base, rates, fetchedAt: new Date(ratesCache.fetchedAt) })
  } catch (err) {
    next(err)
  }
}

// GET /api/currency/convert?from=USD&to=INR&amount=100
const convertCurrency = async (req, res, next) => {
  try {
    const { from = 'USD', to = 'INR', amount = 1 } = req.query
    const rates = await fetchRates(from.toUpperCase())

    const toRate = rates[to.toUpperCase()]
    if (!toRate) return res.status(400).json({ success: false, message: `Currency "${to}" not found` })

    const converted = parseFloat(amount) * toRate
    res.json({
      success: true,
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      amount: parseFloat(amount),
      converted: Math.round(converted * 100) / 100,
      rate: toRate,
      fetchedAt: new Date(ratesCache.fetchedAt),
    })
  } catch (err) {
    next(err)
  }
}

// GET /api/currency/popular — returns rates for common travel currencies vs INR
const getPopularRates = async (req, res, next) => {
  try {
    const base = (req.query.base || 'INR').toUpperCase()
    const rates = await fetchRates(base)

    const popular = ['USD', 'EUR', 'GBP', 'JPY', 'AED', 'SGD', 'THB', 'AUD', 'CAD', 'CHF', 'MYR', 'HKD']
    const filtered = popular.reduce((acc, cur) => {
      if (rates[cur]) acc[cur] = rates[cur]
      return acc
    }, {})

    res.json({ success: true, base, rates: filtered, fetchedAt: new Date(ratesCache.fetchedAt) })
  } catch (err) {
    next(err)
  }
}

module.exports = { getRates, convertCurrency, getPopularRates }