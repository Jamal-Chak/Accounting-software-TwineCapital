const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function initializeAccounts() {
    try {
        console.log('Initializing chart of accounts...')

        // Get demo company ID
        const { data: companies, error: companyError } = await supabase
            .from('companies')
            .select('id')
            .limit(1);

        if (companyError) {
            console.error('Error fetching company:', companyError.message);
            return;
        }

        if (!companies || companies.length === 0) {
            console.error('No company found. Please create a company first.');
            return;
        }

        const companyId = companies[0].id;
        console.log('Using company ID:', companyId);

        // Check if accounts already exist
        const { data: existingAccounts, error: accountsError } = await supabase
            .from('accounts')
            .select('id')
            .eq('company_id', companyId)
            .limit(1);

        if (accountsError) {
            console.error('Error checking accounts:', accountsError.message);
            return;
        }

        if (existingAccounts && existingAccounts.length > 0) {
            console.log('Accounts already exist for this company. Skipping initialization.');
            return;
        }

        // Call the initialize_chart_of_accounts function
        const { error: initError } = await supabase.rpc('initialize_chart_of_accounts', {
            company_uuid: companyId
        });

        if (initError) {
            console.error('Error initializing chart of accounts:', initError.message);
            return;
        }

        console.log('SUCCESS: Chart of accounts initialized.');

        // Verify accounts were created
        const { data: newAccounts, error: verifyError } = await supabase
            .from('accounts')
            .select('code, name, type')
            .eq('company_id', companyId)
            .order('code');

        if (verifyError) {
            console.error('Error verifying accounts:', verifyError.message);
        } else {
            console.log(`Created ${newAccounts.length} accounts:`);
            newAccounts.forEach(acc => {
                console.log(`  ${acc.code} - ${acc.name} (${acc.type})`);
            });
        }

    } catch (e) {
        console.error('CRITICAL ERROR:', e)
    }
}

initializeAccounts()
