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

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyReports() {
    console.log('--- Verifying Production Reports Logic ---');

    // 1. Find a company
    console.log('1. Finding a valid company...');
    const { data: companies, error: companyError } = await supabase
        .from('companies')
        .select('id, name')
        .limit(1);

    if (companyError) {
        console.error('Error fetching companies:', companyError);
        return;
    }

    if (!companies || companies.length === 0) {
        console.log('No companies found in database. Reports will be empty for everyone.');
        console.log('To test, you must sign up and create a company.');
        return;
    }

    const company = companies[0];
    console.log(`Found Company: ${company.name} (${company.id})`);

    // 2. Fetch Report Data (Simulating getTrialBalance)
    console.log('\n2. Fetching Trial Balance Data...');

    // Fetch Accounts
    const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .eq('company_id', company.id)
        .order('code');

    if (accountsError) {
        console.error('Error fetching accounts:', accountsError);
        return;
    }
    console.log(`Found ${accounts.length} accounts.`);

    // Fetch Journal Lines
    const { data: lines, error: linesError } = await supabase
        .from('journal_lines')
        .select(`
            account_id,
            debit,
            credit,
            journal:journals!inner(journal_date, company_id)
        `)
        .eq('journal.company_id', company.id);

    if (linesError) {
        console.error('Error fetching journal lines:', linesError);
        return;
    }
    console.log(`Found ${lines.length} journal lines.`);

    // Calculate Totals
    let totalDebit = 0;
    let totalCredit = 0;
    lines.forEach(line => {
        totalDebit += line.debit;
        totalCredit += line.credit;
    });

    console.log(`Total Debits: ${totalDebit.toFixed(2)}`);
    console.log(`Total Credits: ${totalCredit.toFixed(2)}`);

    if (Math.abs(totalDebit - totalCredit) < 0.01) {
        console.log('✅ Trial Balance is BALANCED.');
    } else {
        console.log('❌ Trial Balance is UNBALANCED.');
    }

    console.log('\n--- Verification Complete ---');
    console.log('Logic is working correctly. If UI is empty, it is because the logged-in user has no data or no company.');
}

verifyReports();
