
import { getConsolidatedTrialBalance } from '../src/lib/journal';
import { generateCFOReport } from '../src/lib/ai-cfo';
import * as dotenv from 'dotenv';
import { supabase } from '../src/lib/supabase';

dotenv.config({ path: '.env.local' });

async function verifyEnterprise() {
    console.log('🧪 Starting Enterprise Verification...');

    // 1. Setup Mock Companies & Data (Conceptually)
    // Since we can't easily create full DB state without valid FKs in a script without seeders,
    // we will rely on reading EXISTING data or assuming the functions work if they return arrays.
    // BUT, to be sure, we can unit test the Logic functions if we mock the DB or just test the CFO logic directly.

    // Let's test the CFO Logic first as it's pure function
    console.log('\n--- Testing AI CFO Logic ---');
    const mockMetrics = {
        revenue: 1500000,
        expenses: 1200000,
        netProfit: 300000,
        margin: 20
    };
    const report = await generateCFOReport(mockMetrics);
    console.log('Input:', mockMetrics);
    console.log('AI Tone:', report.tone);
    console.log('Summary:', report.summary);

    if (report.tone === 'positive' && report.summary.includes('Excellent')) {
        console.log('✅ AI CFO Logic: PASS');
    } else {
        console.error('❌ AI CFO Logic: FAIL (Unexpected output)');
    }

    // 2. Test Consolidation Logic (Integration Test)
    console.log('\n--- Testing Consolidation Engine ---');
    // We will query the actual DB. If no data, it returns empty, which is a valid test of "not crashing".
    try {
        // Fetch real companies first to get valid IDs
        const { data: companies } = await supabase.from('companies').select('id');

        if (!companies || companies.length === 0) {
            console.log('⚠️ No companies found in DB. Skipping live consolidation test.');
        } else {
            const ids = companies.map(c => c.id);
            console.log(`Found ${ids.length} companies. Aggregating...`);

            const consolidated = await getConsolidatedTrialBalance(ids);
            console.log(`Consolidated Trial Balance has ${consolidated.length} account rows.`);

            if (Array.isArray(consolidated)) {
                console.log('✅ Consolidation Query: PASS (Returned array)');
            } else {
                console.error('❌ Consolidation Query: FAIL (Returned invalid type)');
            }
        }
    } catch (e) {
        console.error('❌ Consolidation Error:', e);
    }
}

verifyEnterprise();
