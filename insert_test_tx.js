
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function insert() {
    // Get company ID
    const { data: companies, error: cError } = await supabase.from('companies').select('id').limit(1);
    if (cError) console.error(cError);
    if (!companies || companies.length === 0) { console.error('No company'); return; }

    const companyId = companies[0].id;

    const { error } = await supabase.from('transactions').insert({
        company_id: companyId,
        date: new Date().toISOString(),
        description: 'Uber Ride to Airport',
        amount: -150.00,
        currency: 'ZAR',
        is_reconciled: false,
        category: null,
        status: 'posted'
    });

    if (error) console.error(error);
    else console.log('Inserted test transaction: "Uber Ride to Airport"');
}

insert();
