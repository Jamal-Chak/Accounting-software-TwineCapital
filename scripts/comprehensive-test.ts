import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function comprehensiveTest() {
    console.log('🧪 COMPREHENSIVE APPLICATION TEST\n')
    console.log('='.repeat(60) + '\n')

    let passedTests = 0
    let failedTests = 0
    const issues: string[] = []

    // Test 1: User and Company Setup
    console.log('TEST 1: User & Company Setup')
    console.log('-'.repeat(60))
    const testEmail = 'twineenginehub@yahoo.com'
    const { data: users } = await supabase.auth.admin.listUsers()
    const user = users.users.find(u => u.email === testEmail)

    if (!user) {
        console.log('❌ FAILED: User not found')
        failedTests++
        issues.push('User account missing')
    } else {
        console.log(`✅ PASSED: User exists (${user.email})`)
        passedTests++
    }

    const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user?.id)
        .single()

    if (companyError || !company) {
        console.log('❌ FAILED: Company not found')
        failedTests++
        issues.push('Company record missing')
    } else {
        console.log(`✅ PASSED: Company exists (${company.name})`)
        passedTests++
    }

    console.log()

    // Test 2: Invoice Count
    console.log('TEST 2: Invoice Storage')
    console.log('-'.repeat(60))
    const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .eq('company_id', company?.id)

    if (invoicesError) {
        console.log('❌ FAILED: Cannot query invoices')
        failedTests++
        issues.push('Invoice query failed: ' + invoicesError.message)
    } else {
        console.log(`✅ PASSED: Found ${invoices?.length || 0} invoices in database`)
        passedTests++

        if (invoices && invoices.length > 0) {
            console.log(`   Latest: #${invoices[0].invoice_number} - R${invoices[0].total_amount}`)
        }
    }

    console.log()

    // Test 3: Client Count
    console.log('TEST 3: Client Storage')
    console.log('-'.repeat(60))
    const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('company_id', company?.id)

    if (clientsError) {
        console.log('❌ FAILED: Cannot query clients')
        failedTests++
        issues.push('Client query failed: ' + clientsError.message)
    } else {
        console.log(`✅ PASSED: Found ${clients?.length || 0} clients in database`)
        passedTests++
    }

    console.log()

    // Test 4: Summary Statistics Calculation
    console.log('TEST 4: Invoice Summary Statistics')
    console.log('-'.repeat(60))

    if (invoices) {
        const totalInvoices = invoices.length
        const draftInvoices = invoices.filter(i => i.status === 'draft').length
        const sentInvoices = invoices.filter(i => i.status === 'sent').length
        const paidInvoices = invoices.filter(i => i.status === 'paid').length
        const overdueInvoices = invoices.filter(i => i.status === 'overdue').length

        const totalAmount = invoices.reduce((sum, i) => sum + (i.total_amount || 0), 0)
        const unpaidAmount = invoices
            .filter(i => i.status !== 'paid')
            .reduce((sum, i) => sum + (i.total_amount || 0), 0)

        console.log(`Total Invoices: ${totalInvoices}`)
        console.log(`  - Draft: ${draftInvoices}`)
        console.log(`  - Sent: ${sentInvoices}`)
        console.log(`  - Paid: ${paidInvoices}`)
        console.log(`  - Overdue: ${overdueInvoices}`)
        console.log(`Total Amount: R${totalAmount.toFixed(2)}`)
        console.log(`Unpaid Amount: R${unpaidAmount.toFixed(2)}`)

        if (totalInvoices > 0) {
            console.log('✅ PASSED: Statistics calculated successfully')
            passedTests++
        } else {
            console.log('⚠️  WARNING: No invoices to calculate statistics from')
        }
    }

    console.log()

    // Test 5: Items & Inventory
    console.log('TEST 5: Items & Inventory')
    console.log('-'.repeat(60))
    const { data: items, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .eq('company_id', company?.id)

    if (itemsError) {
        console.log('❌ FAILED: Cannot query items')
        failedTests++
        issues.push('Items query failed: ' + itemsError.message)
    } else {
        console.log(`✅ PASSED: Found ${items?.length || 0} items in database`)
        passedTests++

        if (items && items.length > 0) {
            // Check for new column usage (using current_stock instead of 0 if packed)
            const stockedItem = items.find(i => i.current_stock > 0 || i.reorder_point !== 10)
            if (stockedItem) {
                console.log(`   Detailed Check: Found item "${stockedItem.name}" with Stock: ${stockedItem.current_stock}`)
            } else {
                console.log(`   Note: All items have default stock (0) or reorder (10).`)
            }
        }
    }

    console.log()

    // Test 6: Expenses
    console.log('TEST 6: Expenses')
    console.log('-'.repeat(60))
    const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('company_id', company?.id)

    if (expensesError) {
        console.log('❌ FAILED: Cannot query expenses')
        failedTests++
        issues.push('Expenses query failed: ' + expensesError.message)
    } else {
        console.log(`✅ PASSED: Found ${expenses?.length || 0} expenses in database`)
        passedTests++
    }

    console.log()

    // Test 7: Journal Entries (Accounting Loop)
    console.log('TEST 7: Journal Entries (Accounting)')
    console.log('-'.repeat(60))
    const { data: journals, error: journalError } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('company_id', company?.id)

    if (journalError) {
        // Table might be named 'journal_entries' or 'journals' - let's check lib/journal.ts or just try 'journal_entries' based on standard conventions
        // Wait, looking at previous files, the table is likely 'journals' or 'journal_entries'. 
        // Let's assume 'journal_entries' based on typical schema, but if it fails I'll try 'journals'.
        console.log('⚠️  Warning: Cannot query journal_entries, trying "journals"...')
        const { data: journalsAlt, error: journalAltError } = await supabase.from('journals').select('*').eq('company_id', company?.id)

        if (journalAltError) {
            console.log('❌ FAILED: Cannot query journals table')
            failedTests++
            issues.push('Journal query failed')
        } else {
            console.log(`✅ PASSED: Found ${journalsAlt?.length || 0} journal entries (table: journals)`)
            passedTests++
        }
    } else {
        console.log(`✅ PASSED: Found ${journals?.length || 0} journal entries`)
        passedTests++
    }

    console.log()

    // Final Summary
    console.log('='.repeat(60))
    console.log('TEST SUMMARY')
    console.log('='.repeat(60))
    console.log(`✅ Passed: ${passedTests}`)
    console.log(`❌ Failed: ${failedTests}`)

    if (issues.length > 0) {
        console.log('\n🚨 ISSUES FOUND:')
        issues.forEach((issue, idx) => {
            console.log(`   ${idx + 1}. ${issue}`)
        })
    }

    console.log('\n📋 REQUIRED ACTIONS:')
    console.log('   1. Apply RLS policies in Supabase (scripts/apply-rls-simple.sql)')
    console.log('   2. Test invoice creation from UI')
    console.log('   3. Verify invoices appear in list at /invoices')
    console.log('   4. Check summary statistics display correctly')

    console.log('\n✨ Test complete!\n')
}

comprehensiveTest()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('❌ Fatal error:', error)
        process.exit(1)
    })
