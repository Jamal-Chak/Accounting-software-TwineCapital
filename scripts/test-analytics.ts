// Move imports to dynamic
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Environment setup FIRST
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

async function testAnalytics() {
    console.log('Testing Analytics Logic...');

    // Dynamically import AFTER env is set
    const { analyzeCustomers, analyzeSuppliers } = await import('../src/lib/business-analytics');

    // We need a company ID. Let's fetch one from DB or use the demo one if hardcoded.
    // The code uses a hardcoded demo ID '4cdfc253-4207-4af3-b865-d82c5bcb1167' in the API routes.
    // We should probably check if that exists or use a real one.
    // Let's first try to find the company ID for 'TwineCapital' or 'TechCorp'
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: companies } = await supabase.from('companies').select('id, name').limit(1);

    if (!companies || companies.length === 0) {
        console.error('❌ No companies found in DB.');
        return;
    }

    const companyId = companies[0].id; // Use real ID
    console.log(`Using Company ID: ${companyId} (${companies[0].name})`);

    // 1. Test Customer Analytics
    console.log('\n--- Customer Analytics ---');
    try {
        const customers = await analyzeCustomers(companyId);
        console.log(`Analyzing customers... Found ${customers.length} records.`);
        if (customers.length > 0) {
            console.log('Top Customer:', customers[0].customerName);
            console.log('Revenue:', customers[0].totalRevenue);
            console.log('Risk Score:', customers[0].riskScore);
            console.log('Behavior:', customers[0].paymentBehavior);

            if (customers[0].customerName === 'Unknown Customer') {
                console.warn('⚠️ Warning: Top customer name is Unknown. Join might have failed.');
            } else {
                console.log('✅ Customer name resolution working.');
            }
        } else {
            console.log('ℹ️ No customers/invoices found for this company.');
        }
    } catch (e) {
        console.error('❌ Error analyzing customers:', e);
    }

    // 2. Test Supplier Analytics
    console.log('\n--- Supplier Analytics ---');
    try {
        const suppliers = await analyzeSuppliers(companyId);
        console.log(`Analyzing suppliers... Found ${suppliers.length} records.`);
        if (suppliers.length > 0) {
            console.log('Top Supplier:', suppliers[0].supplierName);
            console.log('Spend:', suppliers[0].totalSpend);
            console.log('Reliability:', suppliers[0].reliabilityScore);
            console.log('✅ Supplier analytics returned data.');
        } else {
            console.log('ℹ️ No suppliers/expenses found for this company.');
        }
    } catch (e) {
        console.error('❌ Error analyzing suppliers:', e);
    }
}

testAnalytics();
