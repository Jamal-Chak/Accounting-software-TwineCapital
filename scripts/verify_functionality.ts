
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Manually read .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const env: Record<string, string> = {};
try {
    if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, 'utf8');
        envFile.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["']|["']$/g, '');
                env[key] = value;
            }
        });
    }
} catch (e) { console.error(e); }

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyFunctionality() {
    console.log('🧪 Verifying application functionality...');

    const email = `test.bot.${Date.now()}@example.com`;
    const password = 'Password123!';

    console.log(`Creating temp user: ${email}`);
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
    });

    if (authError) {
        console.error('❌ Auth SignUp failed with error:', JSON.stringify(authError, null, 2));
        console.error('Message:', authError.message);

        // Maybe we can sign in?
        console.log('Trying to sign in instead...');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (signInError) {
            console.error('❌ Auth SignIn failed:', JSON.stringify(signInError, null, 2));
            return;
        }
        console.log('✅ Signed in successfully');
    } else {
        if (authData.session) {
            console.log('✅ Signed up and auto-signed in successfully');
        } else {
            console.warn('⚠️ Signed up, but NO SESSION. Email confirmation might be required.');
            console.log('Cannot proceed with RLS verification without active session.');
            console.log('If Email Confirmation is enabled in Supabase, disable it for testing or use a Service Role key.');
            return;
        }
    }

    // 2. Create Company
    console.log('Creating Company...');
    const companyId = uuidv4();
    const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert([{
            // id: companyId, // Let DB generate ID or use ours? Schema says default gen_random_uuid()
            name: 'Test Verification Corp',
            country: 'South Africa',
            currency: 'ZAR',
            user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

    if (companyError) {
        console.error('❌ Create Company Failed:', JSON.stringify(companyError, null, 2));
        return;
    }
    console.log(`✅ Company Created: ${companyData.id}`);

    // 3. Create Client
    console.log('Creating Client...');
    const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .insert([{
            company_id: companyData.id,
            name: 'Test Client Ltd',
            email: 'client@test.com'
        }])
        .select()
        .single();

    if (clientError) {
        console.error('❌ Create Client Failed:', JSON.stringify(clientError, null, 2));
        return;
    }
    console.log(`✅ Client Created: ${clientData.id}`);

    // 4. Create Invoice
    console.log('Creating Invoice...');
    const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{
            company_id: companyData.id,
            client_id: clientData.id,
            invoice_number: `INV-TEST-${Date.now()}`,
            issue_date: new Date().toISOString(),
            due_date: new Date().toISOString(),
            status: 'draft',
            total_amount: 1150.00,
            tax_amount: 150.00
        }])
        .select()
        .single();

    if (invoiceError) {
        console.error('❌ Create Invoice Failed:', JSON.stringify(invoiceError, null, 2));
        return;
    }
    console.log(`✅ Invoice Created: ${invoiceData.id}`);

    console.log('\n🎉 FUNCTIONAL VERIFICATION SUCCESSFUL');
}

verifyFunctionality();
