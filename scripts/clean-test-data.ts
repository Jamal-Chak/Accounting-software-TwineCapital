
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanTestData() {
    console.log('🧹 Cleaning test data...');

    // 1. Delete Test Clients (cascade deletes invoices usually, but we check)
    const clients = ['Test Client', 'Fraudster Ltd', 'High Value Corp', 'Recurring Client'];
    for (const name of clients) {
        const { error } = await supabase.from('clients').delete().ilike('name', `%${name}%`);
        if (error) console.error(`Failed to delete client ${name}:`, error.message);
        else console.log(`Deleted client: ${name}`);
    }

    // 2. Delete Test Vendors
    const vendors = ['Fuel Station A', 'Shell', 'Test Vendor'];
    for (const name of vendors) {
        const { error } = await supabase.from('expenses').delete().ilike('vendor', `%${name}%`);
        if (error) console.error(`Failed to delete exp vendor ${name}:`, error.message);
        else console.log(`Deleted expenses for: ${name}`);
    }

    // 3. Delete Specific Test Items
    const { error: itemError } = await supabase.from('items').delete().ilike('name', '%Inventory Item%');
    if (!itemError) console.log('Deleted test inventory items.');

    console.log('✨ Database clean complete.');
}

cleanTestData().catch(console.error);
