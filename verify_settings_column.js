const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifySettings() {
    try {
        console.log('Verifying settings column...');

        // 1. Get first company
        const { data: companies, error: fetchError } = await supabase
            .from('companies')
            .select('id, settings')
            .limit(1);

        if (fetchError) {
            console.error('Error fetching company:', fetchError.message);
            return;
        }

        if (!companies || companies.length === 0) {
            console.log('No companies found. Creating a test company...');
            // Create dummy if needed, but likely exists from previous runs
            return;
        }

        const company = companies[0];
        console.log('Found company:', company.id);
        console.log('Current settings:', company.settings);

        // 2. Update settings
        const testSettings = {
            last_checked: new Date().toISOString(),
            verified_via_script: true,
            organization: { industry: 'Tech_Test' }
        };

        const { error: updateError } = await supabase
            .from('companies')
            .update({ settings: testSettings })
            .eq('id', company.id);

        if (updateError) {
            console.error('Error updating settings column:', updateError.message);
            console.log('FAIL: The column likely does not exist or is not writable.');
            return;
        }

        console.log('Update command sent successfully.');

        // 3. Read back
        const { data: updatedCompany, error: readError } = await supabase
            .from('companies')
            .select('settings')
            .eq('id', company.id)
            .single();

        if (readError) {
            console.error('Error reading back settings:', readError.message);
            return;
        }

        console.log('Read back settings:', updatedCompany.settings);

        if (updatedCompany.settings && updatedCompany.settings.verified_via_script) {
            console.log('SUCCESS: Settings column is fully functional!');
        } else {
            console.log('WARNING: Data read back did not match update.');
        }

    } catch (e) {
        console.error('CRITICAL ERROR:', e)
    }
}

verifySettings()
