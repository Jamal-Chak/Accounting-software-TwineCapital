
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    const key = process.env.GEMINI_API_KEY;
    console.log('🔑 Testing Gemini API Key:', key ? `${key.substring(0, 8)}...` : 'MISSING');

    if (!key) {
        console.error('❌ No API key found.');
        return;
    }

    const genAI = new GoogleGenerativeAI(key);

    // Try explicit model that usually works
    const modelName = 'gemini-1.5-flash';
    console.log(`🤖 Testing model: ${modelName}`);

    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hello, are you working?');
        const response = result.response.text();
        console.log('✅ Success! Response:', response);
    } catch (error: any) {
        console.error('❌ API Error:');
        console.error(error.message);
        if (error.status) console.error('Status:', error.status);
        if (error.statusText) console.error('Status Text:', error.statusText);

        // Check if it might be an old model issue
        if (error.message.includes('404')) {
            console.log('\n⚠️ 404 Error suggests "Model not found" or "API not enabled".');
            console.log('Trying fallback model "gemini-pro"...');
            try {
                const fallback = genAI.getGenerativeModel({ model: 'gemini-pro' });
                const res2 = await fallback.generateContent('Hello?');
                console.log('✅ Fallback "gemini-pro" worked!', res2.response.text());
            } catch (e2: any) {
                console.error('❌ Fallback also failed:', e2.message);
            }
        }
    }
}

main().catch(console.error);
