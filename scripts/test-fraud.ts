
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    console.log('🕵️‍♀️ Testing Fraud Detection Engine...');

    // Dynamic imports
    const { supabase } = await import('../src/lib/supabase');
    const { analyzeFraud } = await import('../src/lib/fraud');
    const { createInvoice } = await import('../src/lib/database');

    // 1. Setup Dummy Data
    const { data: companies } = await supabase.from('companies').select('id').limit(1);
    const companyId = companies?.[0]?.id || '22222222-2222-2222-2222-222222222222';
    const { data: clients } = await supabase.from('clients').select('id').limit(1);
    const clientId = clients?.[0]?.id;

    if (!clientId) {
        console.error('❌ No clients found to test with.');
        process.exit(1);
    }

    console.log('\n1. Creating suspicious transactions...');

    // A. Duplicate Invoices (Same amount, same client, same day)
    const amount = 1234.56;
    const inv1 = await createInvoice({
        company_id: companyId,
        invoice_number: `FRAUD-DUP-1-${Date.now()}`,
        client_id: clientId,
        issue_date: new Date().toISOString(),
        due_date: new Date().toISOString(),
        status: 'draft',
        total_amount: amount,
        tax_amount: 0,
        notes: 'Test Duplicate 1'
    }, []);

    const inv2 = await createInvoice({
        company_id: companyId,
        invoice_number: `FRAUD-DUP-2-${Date.now()}`,
        client_id: clientId,
        issue_date: new Date().toISOString(),
        due_date: new Date().toISOString(),
        status: 'draft',
        total_amount: amount,
        tax_amount: 0,
        notes: 'Test Duplicate 2'
    }, []);

    // B. Outlier Invoice (Huge amount)
    const inv3 = await createInvoice({
        company_id: companyId,
        invoice_number: `FRAUD-OUTLIER-${Date.now()}`,
        client_id: clientId,
        issue_date: new Date().toISOString(),
        due_date: new Date().toISOString(),
        status: 'draft',
        total_amount: 1000000, // 1 Million
        tax_amount: 0,
        notes: 'Test Outlier'
    }, []);

    // C. Weekend Invoice (Force a Sunday date)
    const nextSunday = new Date();
    nextSunday.setDate(nextSunday.getDate() + (7 - nextSunday.getDay())); // Next Sunday (detectWeekend might fail if today is sunday, but lets force a known sunday string)
    // Actually simplicity: Set date to '2025-10-12' (Sunday)
    // But we need it recent for context? Logic doesn't check recency for weekend, just day of week.

    const inv4 = await createInvoice({
        company_id: companyId,
        invoice_number: `FRAUD-WEEKEND-${Date.now()}`,
        client_id: clientId,
        issue_date: '2025-10-12', // A Sunday
        due_date: '2025-10-12',
        status: 'draft',
        total_amount: 500,
        tax_amount: 0,
        notes: 'Test Weekend'
    }, []);

    console.log('   Created 4 test invoices.');

    // 2. Run Analysis
    console.log('\n2. Running Fraud Analysis...');
    const alerts = await analyzeFraud();

    // 3. Verify Alerts
    console.log(`\n3. Verifying Alerts (Found ${alerts.length})...`);

    const duplicateAlert = alerts.find(a => a.type === 'duplicate' && (a.sourceId === inv1.data?.id || a.sourceId === inv2.data?.id));
    const outlierAlert = alerts.find(a => a.type === 'outlier' && a.sourceId === inv3.data?.id);
    const weekendAlert = alerts.find(a => a.type === 'weekend' && a.sourceId === inv4.data?.id);

    let success = true;

    if (duplicateAlert) console.log('✅ Duplicate detection passed.');
    else { console.error('❌ Failed to detect duplicates.'); success = false; }

    if (outlierAlert) console.log('✅ Outlier detection passed.');
    else { console.error('❌ Failed to detect outlier.'); success = false; }

    if (weekendAlert) console.log('✅ Weekend detection passed.');
    else { console.error('❌ Failed to detect weekend activity.'); success = false; }

    // Cleanup
    console.log('\nCleaning up...');
    if (inv1.data) await supabase.from('invoices').delete().eq('id', inv1.data.id);
    if (inv2.data) await supabase.from('invoices').delete().eq('id', inv2.data.id);
    if (inv3.data) await supabase.from('invoices').delete().eq('id', inv3.data.id);
    if (inv4.data) await supabase.from('invoices').delete().eq('id', inv4.data.id);

    if (success) {
        console.log('\nAll fraud checks passed! 🕵️‍♀️');
        process.exit(0);
    } else {
        console.error('\nSome checks failed.');
        process.exit(1);
    }
}

main().catch(console.error);
