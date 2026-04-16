const { GoogleGenerativeAI } = require('@google/generative-ai')

let genAI = null

const getClient = () => {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set in .env')
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  }
  return genAI
}

/**
 * Generate a full day-wise travel itinerary using Gemini
 */
const generateItinerary = async ({ origin, destination, days, budget, currency, travelers, tripType, preferredTransport }) => {
  const model = getClient().getGenerativeModel({ model: 'gemini-3-flash-preview' })

  const prompt = `
You are an expert travel planner. Generate a detailed ${days}-day travel itinerary for the following trip.

Trip Details:
${origin ? `- Origin (From): ${origin}` : ''}
- Destination (To): ${destination}
- Duration: ${days} days
- Total Budget: ${currency} ${budget}
- Number of Travellers: ${travelers}
- Trip Type: ${tripType}
- Preferred Transport: ${preferredTransport} (Please optimize the travel segments of the itinerary based on distance, cost, and this preferred mode of transport)

Return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "destination": "string (format as 'From [Origin] to [Destination]' if origin exists, else just Destination)",
  "summary": "2-sentence trip overview",
  "days": [
    {
      "day": 1,
      "title": "Day theme title",
      "activities": [
        {
          "time": "HH:MM",
          "icon": "single emoji",
          "type": "Travel|Food|Hotel|Activity",
          "title": "Activity name",
          "desc": "1-2 sentence description",
          "cost": "cost in ${currency} or Free"
        }
      ]
    }
  ],
  "costBreakdown": {
    "accommodation": number,
    "food": number,
    "transport": number,
    "activities": number,
    "total": number
  },
  "tips": ["tip1", "tip2", "tip3"],
  "bestTimeToVisit": "string",
  "currency": "${currency}"
}

Make the itinerary realistic, specific, and budget-conscious. Include actual place names, restaurants, and attractions.
`

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  // Strip any accidental markdown fences
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

/**
 * Generate AI packing list based on destination weather and trip type
 */
const generatePackingList = async ({ destination, days, tripType, weather }) => {
  const model = getClient().getGenerativeModel({ model: 'gemini-3-flash-preview' })

  const prompt = `
Generate a smart packing list for a ${days}-day ${tripType} trip to ${destination}.
Weather: ${weather || 'typical for the destination'}.

Return ONLY valid JSON (no markdown):
{
  "essentials": ["item1", "item2"],
  "clothing": ["item1", "item2"],
  "toiletries": ["item1", "item2"],
  "electronics": ["item1", "item2"],
  "documents": ["item1", "item2"],
  "destinationSpecific": ["item1", "item2"]
}
`

  const result = await model.generateContent(prompt)
  const text = result.response.text().replace(/```json|```/g, '').trim()
  return JSON.parse(text)
}

/**
 * Generate visa information using Gemini
 */
const getVisaInfo = async ({ fromCountry, toCountry }) => {
  const model = getClient().getGenerativeModel({ model: 'gemini-3-flash-preview' })

  const prompt = `
Provide current visa information for a citizen of ${fromCountry} travelling to ${toCountry}.

Return ONLY valid JSON (no markdown):
{
  "type": "visa type name",
  "required": true/false,
  "onArrival": true/false,
  "eVisa": true/false,
  "duration": "e.g. 30 days",
  "cost": "e.g. $35 or Free",
  "processing": "e.g. 3-5 business days or On arrival",
  "requirements": ["requirement1", "requirement2"],
  "officialLink": "url or null",
  "notes": "any important notes",
  "lastUpdated": "approximate date of this information"
}
`

  const result = await model.generateContent(prompt)
  const text = result.response.text().replace(/```json|```/g, '').trim()
  return JSON.parse(text)
}

/**
 * AI chat assistant for travel queries
 */
const travelChat = async ({ message, context }) => {
  const model = getClient().getGenerativeModel({ model: 'gemini-3-flash-preview' })

  const systemPrompt = `
You are a knowledgeable and friendly travel assistant for Smart Travel Companion app.
You help users with trip planning, travel tips, visa information, local culture, safety advice, and budget planning.
Context about the user: ${JSON.stringify(context || {})}
Keep responses concise, practical, and helpful. Use emojis sparingly.
`

  const result = await model.generateContent(`${systemPrompt}\n\nUser: ${message}`)
  return result.response.text()
}

/**
 * Generate cultural tips for a destination
 */
const getCultureTips = async ({ destination }) => {
  const model = getClient().getGenerativeModel({ model: 'gemini-3-flash-preview' })

  const prompt = `
Provide cultural tips and local knowledge for visiting ${destination}.

Return ONLY valid JSON (no markdown):
{
  "greetings": ["common greeting phrase with pronunciation"],
  "etiquette": ["important do"],
  "avoid": ["things to avoid"],
  "food": ["must-try local dishes"],
  "phrases": [{"phrase": "local phrase", "meaning": "English meaning"}],
  "currency": "local currency name",
  "tipping": "tipping customs",
  "dressCode": "dress code advice",
  "safety": "general safety tips"
}
`

  const result = await model.generateContent(prompt)
  const text = result.response.text().replace(/```json|```/g, '').trim()
  return JSON.parse(text)
}

module.exports = { generateItinerary, generatePackingList, getVisaInfo, travelChat, getCultureTips }