require('dotenv').config({ path: './.env' });
const { generateItinerary } = require('./services/geminiService');

async function test() {
  try {
    console.log("Testing Gemini API...");
    const result = await generateItinerary({
      destination: 'Tokyo',
      days: 3,
      budget: 1500,
      currency: 'USD',
      travelers: 2,
      tripType: 'Adventure'
    });
    console.log("Success! Received days:", result.days.length);
  } catch(e) {
    console.error("Gemini Failure:", e.message);
  }
}
test();
