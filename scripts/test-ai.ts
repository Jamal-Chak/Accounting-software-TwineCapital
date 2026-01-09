
import { parseInvoiceFromText, generateFollowUpEmail } from '../src/lib/ai-service';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables manually since we are running with tsx
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
    console.log('Loading .env.local...');
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

async function testAI() {
    console.log('Testing AI Service...');
    if (!process.env.GEMINI_API_KEY) {
        console.error('Skipping test: GEMINI_API_KEY not found in environment.');
        return;
    }

    try {
        console.log('Testing Invoice Parsing...');
        const text = "Create an invoice for ACME Corp for R5000 for website design. Due next friday.";
        const result = await parseInvoiceFromText(text);
        console.log('Parse Result:', JSON.stringify(result, null, 2));

        if (result.customer && result.amount) {
            console.log('✅ AI Invoice Parsing works!');
        } else {
            console.error('❌ AI Parsing returned unexpected format.');
        }

        console.log('Testing Follow-up Email Generation...');
        const email = await generateFollowUpEmail({
            customerName: 'ACME Corp',
            invoiceNumber: 'INV-123',
            amount: 5000,
            daysOverdue: 15,
            previousFollowups: 1
        });
        console.log('Email Result:', JSON.stringify(email, null, 2));

        if (email.subject && email.body) {
            console.log('✅ AI Email Generation works!');
        } else {
            console.error('❌ AI Email Generation returned unexpected format.');
        }

    } catch (e: any) {
        console.error('AI Service Exception:', e.message);
        process.exit(1);
    }
}

testAI();
