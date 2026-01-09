const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debug() {
    try {
        console.log('--- START DEBUG ---')

        // Check Companies
        const { data: companies, error: companiesError } = await supabase.from('companies').select('*')
        if (companiesError) console.log('Companies Error:', companiesError)
        else {
            console.log(`Found ${companies.length} companies`)
            companies.forEach(c => console.log(`COMPANY: ${c.id} | ${c.name}`))
        }

        // Check Invoices
        const { data: invoices, error: invoicesError } = await supabase.from('invoices').select('*')
        if (invoicesError) console.log('Invoices Error:', invoicesError)
        else {
            console.log(`Found ${invoices.length} invoices`)
            invoices.forEach(i => console.log(`INVOICE: ${i.id} | No: ${i.invoice_number} | CoID: ${i.company_id}`))
        }

        // Check Expenses
        const { data: expenses, error: expensesError } = await supabase.from('expenses').select('*')
        if (expensesError) console.log('Expenses Error:', expensesError)
        else {
            console.log(`Found ${expenses.length} expenses`)
            expenses.forEach(e => console.log(`EXPENSE: ${e.id} | Payee: ${e.payee} | CoID: ${e.company_id}`))
        }

        // Check Journals
        const { data: journals, error: journalsError } = await supabase.from('journals').select('*')
        if (journalsError) console.log('Journals Error:', journalsError)
        else {
            console.log(`Found ${journals.length} journals`)
            journals.forEach(j => console.log(`JOURNAL: ${j.id} | Ref: ${j.reference} | CoID: ${j.company_id}`))
        }

        // Check Accounts
        const { data: accounts, error: accountsError } = await supabase.from('accounts').select('*')
        if (accountsError) console.log('Accounts Error:', accountsError)
        else {
            console.log(`Found ${accounts.length} accounts`)
            accounts.forEach(a => console.log(`ACCOUNT: ${a.code} | ${a.name} | CoID: ${a.company_id}`))
        }

        console.log('--- END DEBUG ---')
    } catch (e) {
        console.log('CRITICAL ERROR:', e)
    }
}

debug()
