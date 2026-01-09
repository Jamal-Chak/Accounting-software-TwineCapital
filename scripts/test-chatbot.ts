
import { chatWithAccountant } from '../src/lib/ai-service';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables manually
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
    console.log('Loading .env.local...');
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

async function testChatbot() {
    console.log('Testing AI Chatbot Accountant...');
    if (!process.env.GEMINI_API_KEY) {
        console.error('Skipping test: GEMINI_API_KEY not found in environment.');
        return;
    }

    try {
        const question = "How can I improve my cash flow?";
        const context = {
            healthScore: 65,
            companyName: 'Test Company Pty Ltd',
            recentRevenue: 150000,
            cashBalance: 25000
        };

        console.log(`Asking: "${question}"`);
        console.log('Context:', JSON.stringify(context, null, 2));

        const answer = await chatWithAccountant(question, context);

        console.log('\n--- AI Response ---');
        console.log(answer);
        console.log('-------------------\n');

        if (answer && answer.length > 50) {
            console.log('✅ Chatbot Logic Verified');
        } else {
            console.error('❌ Chatbot returned empty or too short response');
        }

    } catch (e) {
        console.error('Error testing chatbot:', e);
    }
}

testChatbot();
