const mongoose = require('mongoose')

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI
  if (!mongoUri) {
    console.error('❌ MongoDB connection failed: MONGO_URI is not set in the environment.')
    process.exit(1)
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    })
    console.log(`✅ MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    console.error(`❌ MongoDB connection failed: ${err.message}`)
    process.exit(1)
  }
}

module.exports = connectDB