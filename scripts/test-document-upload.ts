
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manually read .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const env: Record<string, string> = {};
try {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
            env[key] = value;
        }
    });
} catch (e) {
    console.error('Error reading .env.local:', e);
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
// Use Anon Key as we will sign up a user
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Using Supabase URL:', supabaseUrl);

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDocumentUploadFlow() {
    console.log('Testing Document Upload Flow...');

    // 1. Authenticate / Create User
    const email = `test.user.${Date.now()}@example.com`;
    const password = 'TestPassword123!';

    console.log(`Creating test user: ${email}`);

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) {
        console.error('Failed to sign up test user:', authError);
        return;
    }

    // Check if auto-confirmed or requires confirmation
    // If requires confirmation, we might be stuck unless we have service role key to auto-confirm.
    // However, typical dev setups have email confirmation off or we can't test easily.
    // Let's assume we get a session or user.

    const session = authData.session;
    const userId = authData.user?.id;

    if (!userId) {
        console.error('No user ID returned from sign up');
        return;
    }

    console.log('User created:', userId);

    // If we have a session, we're good. If not, we might need to sign in?
    // signUp usually returns a session if email confirm is off.
    if (!session) {
        console.warn('No session returned. Email confirmation might be required. Testing might fail if RLS requires session.');
    } else {
        console.log('Session active.');
    }

    // 2. Create Company for User
    console.log('Creating test company...');
    const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
            user_id: userId,
            name: 'Test Company',
            currency: 'ZAR'
        })
        .select()
        .single();

    if (companyError) {
        console.error('Failed to create company:', companyError);
        return;
    }

    const companyId = company.id;
    console.log('Company created:', companyId);

    // 3. Mock Extracted Data
    const mockExtractedData = {
        vendor: 'Test Vendor ' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        amount: 150.00,
        taxAmount: 19.57,
        items: [
            { description: 'Item 1', amount: 100.00 },
            { description: 'Item 2', amount: 50.00 }
        ],
        confidence: 0.95,
        rawText: 'Test Receipt\nVendor: Test Vendor\nTotal: R150.00',
        category: 'Office Supplies'
    };

    console.log('Simulating API logic...');

    try {
        // Create Expense
        console.log('Creating Expense...');
        const { data: expense, error: expenseError } = await supabase
            .from('expenses')
            .insert({
                company_id: companyId,
                description: mockExtractedData.vendor,
                amount: mockExtractedData.amount - mockExtractedData.taxAmount,
                category: mockExtractedData.category,
                date: mockExtractedData.date,
                vendor: mockExtractedData.vendor,
                tax_rate: 15.00,
                tax_amount: mockExtractedData.taxAmount,
                total_amount: mockExtractedData.amount,
                status: 'approved'
            })
            .select()
            .single();

        if (expenseError) {
            console.error('Failed to create expense:', expenseError);
            return;
        }

        console.log('Expense created:', expense.id);

        // Create Document Upload Record
        console.log('Creating Document Upload Record...');
        const { data: upload, error: uploadError } = await supabase
            .from('document_uploads')
            .insert({
                company_id: companyId,
                file_name: 'test_receipt.jpg',
                file_url: 'https://example.com/test_receipt.jpg',
                file_type: 'image/jpeg',
                ocr_status: 'completed',
                raw_text: mockExtractedData.rawText,
                extracted_data: mockExtractedData,
                confidence_score: mockExtractedData.confidence,
                expense_id: expense.id,
                review_status: 'approved',
                processed_at: new Date().toISOString()
            })
            .select()
            .single();

        if (uploadError) {
            console.error('Failed to create document upload record:', uploadError);
            if (uploadError.code === '42P01') {
                console.error('CRITICAL: Table "document_uploads" does not exist!');
            }
            return;
        }

        console.log('Document Upload Record created:', upload.id);
        console.log('✅ VERIFICATION SUCCESSFUL: Document Scanner database flow works.');

    } catch (e) {
        console.error('Exception during test:', e);
    }
}

testDocumentUploadFlow();
