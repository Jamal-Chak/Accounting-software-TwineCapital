import { createClient } from '@supabase/supabase-js';
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

async function testHealthScore() {
    console.log('Testing Health Score Calculation...');

    // Dynamic import to ensure env vars are loaded first
    const { calculateHealthScore } = await import('../src/lib/health');

    // We need a company ID. Let's just grab the first one found in the DB or mock it.
    // Actually, calculateHealthScore takes a companyId.
    // accessing supabase to find a company.

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: companies, error } = await supabase.from('companies').select('id').limit(1);

    if (error || !companies || companies.length === 0) {
        console.error('Could not find a company to test with:', error);
        return;
    }

    const companyId = companies[0].id;
    console.log('Using Company ID:', companyId);

    try {
        const score = await calculateHealthScore(companyId);
        console.log('Health Score Calculated Successfully!');
        console.log('Total Score:', score.totalScore);
        console.log('Pillars:', JSON.stringify(score.pillars, null, 2));
        // console.log('Recommendations:', JSON.stringify(score.recommendations, null, 2));

        if (score.totalScore >= 0 && score.totalScore <= 100) {
            console.log('✅ Health Score Logic Verified');
        } else {
            console.error('❌ Health Score out of range');
        }

    } catch (e) {
        console.error('Error calculating health score:', e);
    }
}

testHealthScore();
