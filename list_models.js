
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error('No API Key');
    process.exit(1);
}

async function listModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        fs.writeFileSync('models_out.json', JSON.stringify(data, null, 2));
        console.log('Models written to models_out.json');
    } catch (e) {
        console.error(e);
        fs.writeFileSync('models_out.json', JSON.stringify({ error: e.message }));
    }
}

listModels();
