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

async function getDemoCompanyId() {
    // Mimic getDemoCompanyId logic but simplified for script
    // We'll just grab the first company we find
    const { data: companies, error } = await supabase
        .from('companies')
        .select('id, name')
        .limit(1);

    if (error) {
        console.error('Error fetching companies:', error);
        return null;
    }

    if (companies && companies.length > 0) {
        return companies[0].id;
    }
    return null;
}

async function checkReportsLogic() {
    const companyId = await getDemoCompanyId();
    console.log('Using Company ID:', companyId);

    if (!companyId) {
        console.error('No company found');
        return;
    }

    const startDate = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];

    console.log('Date Range:', startDate, 'to', endDate);

    // 1. Check Accounts
    const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .eq('company_id', companyId)
        .order('code');

    if (accountsError) {
        console.error('Error fetching accounts:', accountsError);
        return;
    }
    console.log('Found accounts:', accounts.length);

    // 2. Check Journal Lines Query
    let query = supabase
        .from('journal_lines')
        .select(`
            account_id,
            debit,
            credit,
            journal:journals!inner(journal_date, company_id)
        `)
        .eq('journal.company_id', companyId);

    if (startDate) query = query.gte('journal.journal_date', startDate);
    if (endDate) query = query.lte('journal.journal_date', endDate);

    const { data: lines, error: linesError } = await query;

    if (linesError) {
        console.error('Error fetching lines:', linesError);
    } else {
        console.log('Found lines:', lines.length);
        if (lines.length > 0) {
            console.log('Sample line:', JSON.stringify(lines[0], null, 2));
        }
    }
}

checkReportsLogic();
