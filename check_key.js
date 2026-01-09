
require('dotenv').config({ path: '.env.local' });
console.log(`GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? 'Present' : 'Missing'}`);
if (process.env.GEMINI_API_KEY) {
    console.log(`Key Length: ${process.env.GEMINI_API_KEY.length}`);
    console.log(`Key Start: ${process.env.GEMINI_API_KEY.substring(0, 4)}...`);
}
