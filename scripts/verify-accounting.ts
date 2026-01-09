
import fs from 'fs';
import path from 'path';

// Load env vars
const envPath = path.join(__dirname, '..', '.env.local');
try {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, '');
            process.env[key] = value;
        }
    });
} catch (e) {
    console.error('Error reading .env.local:', e);
}

import { createInvoice, createBill } from '../src/lib/database';
import { supabase } from '../src/lib/supabase';

async function runVerification() {
    console.log('Starting verification...');

    // We need to mock supabase or ensure environment variables are loaded.
    // Since we are running with ts-node, we need dotenv.
    // But we don't have dotenv in package.json dependencies (maybe).
    // Let's assume the environment is set up or we can set it.

    // Actually, src/lib/supabase.ts likely uses process.env.

    try {
        // 1. Get a company
        const { data: companies } = await supabase.from('companies').select('id').limit(1);
        if (!companies || companies.length === 0) {
            console.error('No company found');
            return;
        }
        const companyId = companies[0].id;
        console.log('Company ID:', companyId);

        // 2. Initialize COA
        await supabase.rpc('initialize_chart_of_accounts', { company_uuid: companyId });

        // 3. Create Client
        const { data: client } = await supabase.from('clients').insert({
            company_id: companyId,
            name: 'Test Client TS ' + Date.now()
        }).select().single();

        if (!client) {
            console.error('Failed to create client');
            return;
        }

        // 4. Create Invoice
        console.log('Creating Invoice...');
        const invoiceResult = await createInvoice({
            company_id: companyId,
            client_id: client.id,
            invoice_number: 'INV-TS-' + Date.now(),
            issue_date: new Date().toISOString().split('T')[0],
            due_date: new Date().toISOString().split('T')[0],
            total_amount: 1150,
            tax_amount: 150,
            status: 'draft',
            notes: 'Test Invoice'
        }, [
            {
                description: 'Test Item',
                quantity: 1,
                unit_price: 1000,
                tax_rate: 15,
                total_amount: 1150
            }
        ]);

        if (invoiceResult.success) {
            console.log('Invoice created:', invoiceResult.data.id);
            // Check Journal
            const { data: journals } = await supabase
                .from('journals')
                .select('*, journal_lines(*)')
                .eq('source_id', invoiceResult.data.id);

            if (journals && journals.length > 0) {
                console.log('Journal Entry found:', journals[0].id);
                console.log('Lines:', journals[0].journal_lines.length);
            } else {
                console.error('Journal Entry NOT found!');
            }
        } else {
            console.error('Invoice creation failed:', invoiceResult.error);
        }

    } catch (e) {
        console.error('Verification failed:', e);
    }
}

runVerification();
