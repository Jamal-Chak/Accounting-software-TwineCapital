
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

// Initialize Gemini AI
const apiKey = process.env.GEMINI_API_KEY || '';
console.log('API Key Present:', !!apiKey, 'Length:', apiKey.length);
const genAI = new GoogleGenerativeAI(apiKey);

async function categorizeTransaction(description, amount, context) {
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const prompt = `You are an expert AI accountant. Categorize this bank transaction:

Transaction: "${description}"
Amount: ${amount}
Industry: ${context.industry || 'General Business'}

Available Categories:
- Advertising & Marketing
- Bank Fees & Charges
- Consulting & Accounting
- Entertainment
- Equipment
- Insurance
- Legal Expenses
- Meals & Entertainment
- Office Supplies
- Payroll & Wages
- Rent & Lease
- Repairs & Maintenance
- Software & SaaS
- Subscriptions
- Taxes & Licenses
- Telephone & Internet
- Travel
- Utilities
- Vehicles & Fuel

Return JSON:
{
  "category": "Exact Category Name from list above",
  "confidence": number (0.0 - 1.0),
  "reasoning": "brief explanation"
}

Rules:
- If unsure, use "Uncategorized Expenses"
- Return ONLY the JSON object.`;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleanResponse);
        return parsed;
    } catch (error) {
        const fs = require('fs');
        const errorLog = {
            message: error.message,
            stack: error.stack,
            response: error.response || null
        };
        fs.writeFileSync('error_log.json', JSON.stringify(errorLog, null, 2));
        console.error('Error logged to error_log.json');
        return {
            category: 'Uncategorized Expenses',
            confidence: 0,
            reasoning: 'AI categorization failed'
        };
    }
}

async function test() {
    console.log('Testing AI Transaction Categorization...');

    const testCases = [
        { desc: 'Uber Trip', amount: -150.00 },
        { desc: 'Adobe Creative Cloud', amount: -600.00 },
        { desc: 'Checkers Hyper', amount: -2340.50 },
        { desc: 'Mugg & Bean', amount: -85.00 },
        { desc: 'Vodacom Data', amount: -450.00 }
    ];

    for (const test of testCases) {
        console.log(`\nparams: "${test.desc}" (${test.amount})`);
        const result = await categorizeTransaction(test.desc, test.amount, { industry: 'Tech Startup' });
        console.log('Result:', result);
    }
}

test();
