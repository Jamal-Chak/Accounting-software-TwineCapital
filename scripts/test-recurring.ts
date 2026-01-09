
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Environment setup
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

async function testRecurring() {
    console.log('Testing Recurring Billing Logic...');

    // Dynamic import
    const { createRecurringProfile, getRecurringProfiles, processDueProfiles } = await import('../src/lib/recurring');
    const { getInvoices } = await import('../src/lib/database');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Get Client
    const { data: clients } = await supabase.from('clients').select('id, name').limit(1);
    if (!clients || clients.length === 0) {
        console.error('❌ No clients found');
        return;
    }
    const clientId = clients[0].id;
    console.log(`Using Client: ${clients[0].name}`);

    // 2. Create Profile (Due Today/Yesterday to force run)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const startDate = yesterday.toISOString().split('T')[0];

    console.log(`Creating profile starting ${startDate}...`);
    const createRes = await createRecurringProfile(clientId, 'monthly', startDate, [
        {
            description: 'Test Retainer',
            quantity: 1,
            unit_price: 1500,
            tax_rate: 15,
            total_amount: 1500
        }
    ]);

    if (!createRes.success) {
        console.error('❌ Failed to create profile:', createRes.error);
        return;
    }
    const profileId = createRes.data?.id;
    console.log(`✅ Profile created with ID: ${profileId}`);

    // 3. Verify Lists
    const profiles = await getRecurringProfiles();
    const myProfile = profiles.find(p => p.id === profileId);
    if (myProfile) {
        console.log(`✅ Found profile in list. Next Run: ${myProfile.next_run_date}`);
    } else {
        console.error('❌ Profile not found in list.');
        return;
    }

    // 4. Process
    console.log('Running processDueProfiles()...');
    const processRes = await processDueProfiles();
    console.log('Process Result:', processRes);

    if (processRes.processed > 0 && processRes.invoices_created.length > 0) {
        console.log(`✅ Processed successfully. Created Invoice ID: ${processRes.invoices_created[0]}`);
    } else {
        console.error('❌ Failed to process or no profiles due.');
    }

    // 5. Verify Update
    const profilesAfter = await getRecurringProfiles();
    const myProfileAfter = profilesAfter.find(p => p.id === profileId);
    if (myProfileAfter && myProfileAfter.next_run_date > startDate) {
        console.log(`✅ Profile updated. New Next Run: ${myProfileAfter.next_run_date}`);
    } else {
        console.error(`❌ Profile date not updated. Is: ${myProfileAfter?.next_run_date}`);
    }

    // Cleanup (Optional - Delete the test invoice)
    // await supabase.from('invoices').delete().eq('id', profileId);
}

testRecurring();
