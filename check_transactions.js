
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
    const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

    if (error) console.error(error);
    else {
        console.log(`Found ${transactions.length} transactions.`);
        transactions.forEach(t => {
            console.log(`- ${t.description}: ${t.amount} (Category: ${t.category || 'NULL'}) [Reconciled: ${t.is_reconciled}]`);
        });
    }
}

check();
