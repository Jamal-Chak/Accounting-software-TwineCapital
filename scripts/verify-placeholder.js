const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually read .env.local
const envPath = path.join(__dirname, '..', '.env.local');
let env = {};
try {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, '');
            env[key] = value;
        }
    });
} catch (e) {
    console.error('Error reading .env.local:', e);
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log('Starting verification...');

    // 1. Get or Create Company
    let companyId;
    const { data: companies } = await supabase.from('companies').select('id').limit(1);
    if (companies && companies.length > 0) {
        companyId = companies[0].id;
        console.log('Using existing company:', companyId);
    } else {
        console.error('No company found. Please create a company first.');
        return;
    }

    // 2. Initialize Chart of Accounts
    console.log('Initializing Chart of Accounts...');
    const { error: initError } = await supabase.rpc('initialize_chart_of_accounts', { company_uuid: companyId });
    if (initError) {
        console.error('Error initializing COA:', initError);
        // Proceed anyway, maybe it's already initialized
    }

    // 3. Create Client
    console.log('Creating test client...');
    const { data: client, error: clientError } = await supabase.from('clients').insert({
        company_id: companyId,
        name: 'Test Client ' + Date.now(),
        email: 'test@example.com'
    }).select().single();

    if (clientError) {
        console.error('Error creating client:', clientError);
        return;
    }

    // 4. Create Invoice (using the API logic simulated here)
    console.log('Creating invoice...');
    const invoiceData = {
        company_id: companyId,
        client_id: client.id,
        invoice_number: 'INV-TEST-' + Date.now(),
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date().toISOString().split('T')[0],
        total_amount: 1150,
        tax_amount: 150,
        status: 'draft'
    };

    // We need to call the createInvoice function from database.ts, but we can't import TS directly in Node easily without setup.
    // So we will simulate what the UI does: call the API or just replicate the logic here to test the DB triggers/logic if any.
    // Wait, I modified database.ts which is used by the Next.js app.
    // To test my changes in database.ts, I should ideally run this in the Next.js environment or use ts-node.
    // But I can't easily use ts-node with the current setup (imports etc).

    // Alternative: I can manually insert the invoice and then manually call the journal logic?
    // No, I want to test that createInvoice *calls* the journal logic.

    // Since I can't easily run the TS code, I will trust my code changes in database.ts and verify by:
    // 1. Checking if I can see the journal entries in the DB *after* I use the app?
    // Or I can try to use `ts-node` if it's available.

    // Let's try to run a simple TS script with ts-node.
    // If that fails, I'll have to rely on manual verification or browser test.
}

// I'll write a TS script and try to run it with npx ts-node
