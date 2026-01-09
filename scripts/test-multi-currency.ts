
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables manually
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
    console.log('Loading .env.local...');
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

async function testMultiCurrency() {
    console.log('Testing Smart Multi-Currency...');

    // Dynamic import
    const { createInvoice, getCompanyId } = await import('../src/lib/database');
    const { getExchangeRate } = await import('../src/lib/currency');

    const companyId = await getCompanyId();
    if (!companyId) {
        console.error('Could not get company ID');
        return;
    }

    console.log('Using Company ID:', companyId);

    // 1. Test Exchange Rate Service
    console.log('Fetching USD Rate...');
    try {
        const rate = await getExchangeRate('USD');
        console.log(`USD to ZAR Rate: ${rate}`);
        if (rate <= 1) {
            console.error('❌ Rate seems incorrect (too low/1.0)');
        }
    } catch (e) {
        console.error('Error fetching rate:', e);
    }

    // 2. Create Multi-Currency Invoice
    const invoiceData = {
        company_id: companyId,
        invoice_number: `INV-MC-${Date.now()}`,
        client_id: '22222222-2222-2222-2222-222222222222', // Assuming demo client exists
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date().toISOString().split('T')[0],
        status: 'draft' as const,
        total_amount: 1000,
        tax_amount: 150,
        notes: 'Test USD Invoice',
        currency: 'USD',
        exchange_rate: 18.5
    };

    const items = [{
        description: 'USD Service',
        quantity: 1,
        unit_price: 1000,
        tax_rate: 15,
        total_amount: 1000
    }];

    console.log('Creating USD Invoice...');
    const result = await createInvoice(invoiceData, items);

    if (result.success && result.data) {
        console.log('✅ Invoice created successfully!');
        console.log('Currency:', result.data.currency);
        console.log('Exchange Rate:', result.data.exchange_rate);

        if (result.data.currency === 'USD' && result.data.exchange_rate === 18.5) {
            console.log('✅ Data verified provided correctly');
        } else {
            console.error('❌ Data mismatch');
        }

    } else {
        console.error('❌ Failed to create invoice:', result.error);
    }
    // 3. Test Multi-Currency Expense
    console.log('Creating USD Expense...');
    const { addExpense } = await import('../src/lib/database');
    const expenseData = {
        company_id: companyId,
        description: 'USD Software Subscription',
        amount: 50,
        category: 'Software',
        date: new Date().toISOString().split('T')[0],
        vendor: 'SaaS Inc',
        tax_rate: 0,
        tax_amount: 0,
        total_amount: 50,
        currency: 'USD',
        exchange_rate: 18.5,
        status: 'pending' as const
    };

    const expResult = await addExpense(expenseData);
    if (expResult.success && expResult.data) {
        console.log('✅ Expense created successfully!');
        console.log('Currency:', expResult.data.currency);
        console.log('Exchange Rate:', expResult.data.exchange_rate);
        console.log('Description:', expResult.data.description); // Should be clean

        if (expResult.data.currency === 'USD' && expResult.data.description === 'USD Software Subscription') {
            console.log('✅ Expense data verified');
        } else {
            console.error('❌ Expense data mismatch');
        }
    } else {
        console.error('❌ Failed to create expense:', expResult.error);
    }
}

testMultiCurrency();
