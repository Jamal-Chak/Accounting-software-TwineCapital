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

const defaultAccounts = [
    { code: '1000', name: 'Assets', type: 'Asset', parent_code: null, description: 'All company assets' },
    { code: '1100', name: 'Current Assets', type: 'Asset', parent_code: '1000', description: 'Assets convertible to cash within 1 year' },
    { code: '1110', name: 'Cash and Bank', type: 'Asset', parent_code: '1100', description: 'Cash on hand and in bank accounts' },
    { code: '1120', name: 'Accounts Receivable', type: 'Asset', parent_code: '1100', description: 'Money owed by customers' },
    { code: '1200', name: 'Fixed Assets', type: 'Asset', parent_code: '1000', description: 'Long-term tangible assets' },
    { code: '2000', name: 'Liabilities', type: 'Liability', parent_code: null, description: 'All company liabilities' },
    { code: '2100', name: 'Current Liabilities', type: 'Liability', parent_code: '2000', description: 'Debts due within 1 year' },
    { code: '2110', name: 'Accounts Payable', type: 'Liability', parent_code: '2100', description: 'Money owed to suppliers' },
    { code: '2120', name: 'VAT Payable', type: 'Liability', parent_code: '2100', description: 'VAT owed to SARS' },
    { code: '3000', name: 'Equity', type: 'Equity', parent_code: null, description: 'Owner equity' },
    { code: '3100', name: 'Retained Earnings', type: 'Equity', parent_code: '3000', description: 'Accumulated profits' },
    { code: '4000', name: 'Revenue', type: 'Revenue', parent_code: null, description: 'All income' },
    { code: '4100', name: 'Sales Revenue', type: 'Revenue', parent_code: '4000', description: 'Revenue from sales' },
    { code: '4200', name: 'Other Income', type: 'Revenue', parent_code: '4000', description: 'Non-operating income' },
    { code: '5000', name: 'Expenses', type: 'Expense', parent_code: null, description: 'All expenses' },
    { code: '5100', name: 'Cost of Sales', type: 'Expense', parent_code: '5000', description: 'Direct costs of goods/services sold' },
    { code: '5200', name: 'Operating Expenses', type: 'Expense', parent_code: '5000', description: 'General business expenses' },
    { code: '5210', name: 'Rent', type: 'Expense', parent_code: '5200', description: 'Office/premises rent' },
    { code: '5220', name: 'Utilities', type: 'Expense', parent_code: '5200', description: 'Electricity, water, internet' },
    { code: '5230', name: 'Office Supplies', type: 'Expense', parent_code: '5200', description: 'Stationery and supplies' },
    { code: '2130', name: 'VAT Output', type: 'Liability', parent_code: '2100', description: 'VAT collected from customers' },
    { code: '1130', name: 'VAT Input', type: 'Asset', parent_code: '1100', description: 'VAT paid to suppliers' }
];

async function checkAndPopulate() {
    console.log('Checking default_accounts table...');

    // Try to select
    const { data, error } = await supabase.from('default_accounts').select('*').limit(1);

    if (error) {
        console.error('Error accessing default_accounts:', error.message);
        console.log('Table might not exist. Cannot proceed without running migrations.');
        return;
    }

    console.log('Table exists. Checking for data...');
    if (data.length === 0) {
        console.log('Table is empty. Populating...');
        const { error: insertError } = await supabase.from('default_accounts').insert(defaultAccounts);
        if (insertError) {
            console.error('Error inserting default accounts:', insertError);
        } else {
            console.log('Default accounts populated successfully.');
        }
    } else {
        console.log('Table already has data.');
    }
}

checkAndPopulate();
