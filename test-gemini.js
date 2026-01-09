require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
    console.log('Testing Gemini API...');
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error('Error: GEMINI_API_KEY not found in environment');
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = 'Categorize this transaction: "Uber Trip" - options: [Travel, Meals, Office]. Return just the category.';

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('Success! Gemini responded:');
        console.log(text);
    } catch (error) {
        console.error('Gemini API Error:', error.message);
    }
}

testGemini();
