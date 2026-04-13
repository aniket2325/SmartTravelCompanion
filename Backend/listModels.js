require('dotenv').config({ path: './.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Since listModels might not be exposed directly in older SDKs in the same way,
    // we can use axios to call the REST endpoint directly.
    const axios = require('axios');
    const res = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    console.log("Supported Models:");
    res.data.models.forEach(m => {
      console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`);
    });
  } catch(e) {
    console.error("List fail:", e.message);
  }
}
listModels();
