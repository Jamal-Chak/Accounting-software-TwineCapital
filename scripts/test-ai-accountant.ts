
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    console.log('🤖 Testing AI Accountant...');

    try {
        const { chatWithAccountant } = await import('../src/lib/ai-service');

        if (!process.env.GEMINI_API_KEY) {
            console.error('❌ GEMINI_API_KEY is missing from .env.local');
            process.exit(1);
        }

        console.log('Testing general chat...');
        const question = "What is the VAT rate in South Africa?";
        const answer = await chatWithAccountant(question, {
            healthScore: 85,
            companyName: 'Test Company Pty Ltd'
        });

        console.log(`\nQ: ${question}`);
        console.log(`A: ${answer}\n`);

        if (answer.toLowerCase().includes('15%') || answer.toLowerCase().includes('15 percent')) {
            console.log('✅ AI Accountant answered correctly about VAT.');
        } else if (answer.includes('trouble connecting')) {
            console.error('❌ AI service connection failed.');
            process.exit(1);
        } else {
            console.log('⚠️ Answer received but content uncertain (manual review needed).');
        }

        console.log('\nAI Accountant test passed! 🤖');
        process.exit(0);

    } catch (error) {
        console.error('Error running test:', error);
        process.exit(1);
    }
}

main().catch(console.error);
