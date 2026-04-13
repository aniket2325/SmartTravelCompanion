require('dotenv').config({ override: process.env.NODE_ENV !== 'production' })
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const path = require('path')

const connectDB = require('./config/db')
const errorHandler = require('./middleware/errorHandler')

// Route imports
const authRoutes     = require('./routes/auth')
const aiRoutes       = require('./routes/ai')
const tripRoutes     = require('./routes/trips')
const expenseRoutes  = require('./routes/expenses')
const documentRoutes = require('./routes/documents')
const { weatherRouter, currencyRouter, placesRouter, safetyRouter, rewardsRouter } = require('./routes/misc')

const app = express()

// ── Connect Database ─────────────────────────────────────────────────────────
connectDB()

// ── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ── Rate Limiting ────────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
})

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { success: false, message: 'AI request limit reached. Wait 1 minute.' },
})

app.use(generalLimiter)

// ── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ── Logging ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// ── Static Uploads ───────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Smart Travel Companion API is running 🚀',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
})

// ── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes)
app.use('/api/ai',        aiLimiter, aiRoutes)
app.use('/api/trips',     tripRoutes)
app.use('/api/expenses',  expenseRoutes)
app.use('/api/documents', documentRoutes)
app.use('/api/weather',   weatherRouter)
app.use('/api/currency',  currencyRouter)
app.use('/api/places',    placesRouter)
app.use('/api/safety',    safetyRouter)
app.use('/api/rewards',   rewardsRouter)

// ── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` })
})

// ── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler)

// ── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000
const server = app.listen(PORT, () => {
  console.log(`\n🚀 STC Backend running on http://localhost:${PORT}`)
  console.log(`📋 Environment : ${process.env.NODE_ENV}`)
  console.log(`🤖 Gemini AI   : ${process.env.GEMINI_API_KEY ? '✅ Connected' : '❌ Key missing'}`)
  console.log(`🗺️  Map System  : ✅ OpenStreetMap + Leaflet (No key needed)`)
  console.log(`💱 Exchange API: ${process.env.EXCHANGE_RATE_API_KEY ? '✅ Connected' : '⚠️  Using fallback'}`)
  console.log(`📨 Email SOS    : ${process.env.SMTP_USER && process.env.SMTP_PASS ? '✅ Configured' : '⚠️  Not configured'}`)
  console.log(`🌤️  Weather     : ✅ Open-Meteo (no key needed)\n`)
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use.`)
    console.error(`   Kill it with: Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT} -State Listen | Select -ExpandProperty OwningProcess) -Force`)
    console.error(`   Then re-run: npm run dev\n`)
    process.exit(0)
  } else {
    throw err
  }
})

module.exports = app

