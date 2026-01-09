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

async function checkJournal() {
    console.log('Checking for recent journal entries...');

    const { data, error } = await supabase
        .from('journals')
        .select('*, journal_lines(*)')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error('Error accessing journals:', error.message);
        return;
    }

    if (data.length === 0) {
        console.log('No journal entries found.');
    } else {
        const journal = data[0];
        console.log('Latest Journal Entry:');
        console.log(`ID: ${journal.id}`);
        console.log(`Date: ${journal.journal_date}`);
        console.log(`Source: ${journal.source} (${journal.source_id})`);
        console.log(`Memo: ${journal.memo}`);
        console.log('Lines:');
        journal.journal_lines.forEach(line => {
            console.log(`  - Account: ${line.account_id}, Debit: ${line.debit}, Credit: ${line.credit}, Desc: ${line.description}`);
        });
    }
}

checkJournal();
