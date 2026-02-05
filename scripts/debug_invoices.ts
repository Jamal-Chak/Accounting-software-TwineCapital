
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manually read .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const env: Record<string, string> = {};
try {
    if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, 'utf8');
        envFile.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["']|["']$/g, '');
                env[key] = value;
            }
        });
    }
} catch (e) { console.error(e); }

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugInvoices() {
    console.log('🔍 Debugging Invoices...');

    // 1. Log In (Use the credentials you are testing with, or a known test user)
    // You might need to change these to the user you are actually using in the browser
    // For now, I'll try to find *any* invoice via Service Role if I had it, but I only have Anon.
    // So I will prompt for email/password or use the test one from before.

    // Attempting to just READ all invoices? No, RLS prevents that.
    // We need to act as a user.

    // Let's first check if we can even sign in.
    const email = 'twineenginehub@yahoo.com'; // Trying the one from the screenshot earlier
    const password = 'Password123!'; // Guessing/Testing or we can try creating a temp user.
    // Actually, asking the user for their email might be better, OR creating a new user and checking flow.

    // Better strategy: Use the recently created test user from verify_functionality.ts if possible,
    // or just try to select *everything* if RLS allows it (it shouldn't).

    console.log('--- Checking RLS Public Access (Should be empty if RLS works) ---');
    const { data: publicInvoices, error: publicError } = await supabase
        .from('invoices')
        .select('*');

    if (publicError) console.error('Public Fetch Error:', publicError.message);
    else console.log(`Public Fetch found ${publicInvoices.length} invoices (Expect 0).`);

    console.log('\n--- Creating Temp User to Test Visibility ---');
    const tempEmail = `debug.${Date.now()}@example.com`;
    const tempPass = 'DebugPass123!';

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: tempEmail,
        password: tempPass
    });

    if (signUpError) {
        console.log(JSON.stringify({ error: signUpError }, null, 2));
        return;
    }

    const userId = signUpData.user?.id;
    console.log(`User created: ${userId}`);

    // Create Company
    const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
            user_id: userId,
            name: 'Debug Co',
            currency: 'ZAR'
        })
        .select()
        .single();

    if (companyError) {
        console.error('Company Create Failed:', companyError.message);
        return;
    }
    console.log(`Company created: ${company.id}`);

    // Create Client
    const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert({
            company_id: company.id,
            name: 'Debug Client'
        })
        .select()
        .single();

    if (clientError) {
        console.error('Client Create Failed:', clientError.message);
        return;
    }

    // Create Invoice
    console.log('Creating Test Invoice...');
    const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
            company_id: company.id,
            client_id: client.id,
            invoice_number: `DBG-${Date.now()}`,
            issue_date: new Date().toISOString(),
            due_date: new Date().toISOString(),
            total_amount: 1000
        })
        .select()
        .single();

    if (invoiceError) {
        console.error('❌ Invoice Insert Failed:', invoiceError.message);
        console.log('Possible Cause: RLS policy for INSERT is missing or incorrect.');
        return;
    }
    console.log('✅ Invoice Inserted:', invoice.id);

    // Now Query it back
    const { data: fetchedInvoices, error: fetchError } = await supabase
        .from('invoices')
        .select('*')
        .eq('company_id', company.id);

    if (fetchError) {
        console.error('❌ Invoice Fetch Failed:', fetchError.message);
    } else {
        console.log(`✅ Invoice Fetch Success. Found: ${fetchedInvoices.length} invoices.`);
        if (fetchedInvoices.length === 0) {
            console.error('❌ Fetch returned 0 rows despite successful insert. RLS SELECT policy is likely hiding it.');
        } else {
            console.log('Invoice visibility is WORKING for new users.');
        }
    }
}

debugInvoices();
