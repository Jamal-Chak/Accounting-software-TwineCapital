import { supabase } from './supabase'

// ===== JOURNAL INTERFACES =====

export interface Account {
    id: string
    company_id: string
    code: string
    name: string
    type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense'
    parent_id: string | null
    is_active: boolean
    description: string | null
    created_at: string
    updated_at: string
}

export interface Journal {
    id: string
    company_id: string
    journal_date: string
    memo: string | null
    source: 'invoice' | 'payment' | 'bill' | 'expense' | 'manual' | null
    source_id: string | null
    created_by: string | null
    created_at: string
    updated_at: string
}

export interface JournalLine {
    id?: string
    journal_id?: string
    account_id: string
    debit: number
    credit: number
    description: string | null
}

export interface JournalEntry {
    journal_date: string
    memo: string
    source?: 'invoice' | 'payment' | 'bill' | 'expense' | 'manual'
    source_id?: string
    lines: JournalLine[]
}

// ===== CHART OF ACCOUNTS =====

/**
 * Get all active accounts for the current company
 */
export async function getChartOfAccounts(companyId?: string): Promise<Account[]> {
    try {
        let query = supabase
            .from('accounts')
            .select('*')
            .eq('is_active', true)
            .order('code', { ascending: true })

        if (companyId) {
            query = query.eq('company_id', companyId)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching chart of accounts:', error)
            return []
        }

        return data || []
    } catch (error) {
        console.error('Error in getChartOfAccounts:', error)
        return []
    }
}

/**
 * Get a specific account by code
 */
export async function getAccountByCode(code: string, companyId: string): Promise<Account | null> {
    try {
        const { data, error } = await supabase
            .from('accounts')
            .select('*')
            .eq('company_id', companyId)
            .eq('code', code)
            .eq('is_active', true)
            .single()

        if (error) {
            console.error(`Error fetching account ${code}:`, error)
            return null
        }

        return data
    } catch (error) {
        console.error('Error in getAccountByCode:', error)
        return null
    }
}

/**
 * Initialize chart of accounts for a company from defaults
 */
export async function initializeChartOfAccounts(companyId: string) {
    try {
        // Call the database function to initialize accounts
        const { error } = await supabase.rpc('initialize_chart_of_accounts', {
            company_uuid: companyId
        })

        if (error) {
            console.error('Error initializing chart of accounts:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (error) {
        console.error('Error in initializeChartOfAccounts:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

// ===== JOURNAL ENGINE =====

/**
 * Validate that journal entry is balanced (debits = credits)
 */
export function validateJournalBalance(lines: JournalLine[]): { valid: boolean; message?: string } {
    if (lines.length === 0) {
        return { valid: false, message: 'Journal must have at least one line' }
    }

    const totalDebits = lines.reduce((sum, line) => sum + line.debit, 0)
    const totalCredits = lines.reduce((sum, line) => sum + line.credit, 0)

    // Allow for small rounding differences (less than 1 cent)
    const difference = Math.abs(totalDebits - totalCredits)

    if (difference > 0.01) {
        return {
            valid: false,
            message: `Journal not balanced: Debits=${totalDebits.toFixed(2)}, Credits=${totalCredits.toFixed(2)}`
        }
    }

    // Check that each line is either debit OR credit, not both
    for (const line of lines) {
        if (line.debit > 0 && line.credit > 0) {
            return {
                valid: false,
                message: 'Each journal line must be either debit OR credit, not both'
            }
        }
        if (line.debit === 0 && line.credit === 0) {
            return {
                valid: false,
                message: 'Each journal line must have either a debit or credit amount'
            }
        }
    }

    return { valid: true }
}

/**
 * Create a journal entry with balanced debits and credits
 */
export async function createJournal(
    companyId: string,
    entry: JournalEntry
): Promise<{ success: boolean; journal?: Journal; error?: string }> {
    try {
        // Validate balance
        const validation = validateJournalBalance(entry.lines)
        if (!validation.valid) {
            return { success: false, error: validation.message }
        }

        // Create journal header
        const { data: journalData, error: journalError } = await supabase
            .from('journals')
            .insert([{
                company_id: companyId,
                journal_date: entry.journal_date,
                memo: entry.memo,
                source: entry.source || null,
                source_id: entry.source_id || null
            }])
            .select()
            .single()

        if (journalError) {
            console.error('Error creating journal:', journalError)
            return { success: false, error: journalError.message }
        }

        // Create journal lines
        const linesToInsert = entry.lines.map(line => ({
            journal_id: journalData.id,
            account_id: line.account_id,
            debit: line.debit,
            credit: line.credit,
            description: line.description
        }))

        const { error: linesError } = await supabase
            .from('journal_lines')
            .insert(linesToInsert)

        if (linesError) {
            console.error('Error creating journal lines:', linesError)
            // Rollback: delete the journal header
            await supabase.from('journals').delete().eq('id', journalData.id)
            return { success: false, error: linesError.message }
        }

        return { success: true, journal: journalData }
    } catch (error) {
        console.error('Error in createJournal:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

/**
 * Post journal for invoice creation
 * Debit: Accounts Receivable
 * Credit: Sales Revenue
 * Credit: VAT Output (if applicable)
 */
export async function postInvoiceJournal(
    companyId: string,
    invoiceId: string,
    invoiceDate: string,
    subtotal: number,
    taxAmount: number,
    totalAmount: number,
    invoiceNumber: string
): Promise<{ success: boolean; journal?: Journal; error?: string }> {
    try {
        // Get standard accounts
        const arAccount = await getAccountByCode('1120', companyId) // Accounts Receivable
        const revenueAccount = await getAccountByCode('4100', companyId) // Sales Revenue
        const vatOutputAccount = await getAccountByCode('2130', companyId) // VAT Output

        if (!arAccount || !revenueAccount) {
            return {
                success: false,
                error: 'Required accounts not found. Please initialize chart of accounts.'
            }
        }

        const lines: JournalLine[] = [
            {
                account_id: arAccount.id,
                debit: totalAmount,
                credit: 0,
                description: `Invoice ${invoiceNumber}`
            },
            {
                account_id: revenueAccount.id,
                debit: 0,
                credit: subtotal,
                description: `Sales - Invoice ${invoiceNumber}`
            }
        ]

        // Add VAT line if applicable
        if (taxAmount > 0 && vatOutputAccount) {
            lines.push({
                account_id: vatOutputAccount.id,
                debit: 0,
                credit: taxAmount,
                description: `VAT - Invoice ${invoiceNumber}`
            })
        }

        return await createJournal(companyId, {
            journal_date: invoiceDate,
            memo: `Invoice ${invoiceNumber} issued`,
            source: 'invoice',
            source_id: invoiceId,
            lines
        })
    } catch (error) {
        console.error('Error in postInvoiceJournal:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

/**
 * Post journal for payment received
 * Debit: Cash/Bank
 * Credit: Accounts Receivable
 */
export async function postPaymentJournal(
    companyId: string,
    paymentId: string,
    paymentDate: string,
    amount: number,
    invoiceNumber: string,
    method: string = 'Bank'
): Promise<{ success: boolean; journal?: Journal; error?: string }> {
    try {
        // Get standard accounts
        const cashAccount = await getAccountByCode('1110', companyId) // Cash and Bank
        const arAccount = await getAccountByCode('1120', companyId) // Accounts Receivable

        if (!cashAccount || !arAccount) {
            return {
                success: false,
                error: 'Required accounts not found. Please initialize chart of accounts.'
            }
        }

        const lines: JournalLine[] = [
            {
                account_id: cashAccount.id,
                debit: amount,
                credit: 0,
                description: `Payment received - ${method} - Invoice ${invoiceNumber}`
            },
            {
                account_id: arAccount.id,
                debit: 0,
                credit: amount,
                description: `Payment applied - Invoice ${invoiceNumber}`
            }
        ]

        return await createJournal(companyId, {
            journal_date: paymentDate,
            memo: `Payment received for Invoice ${invoiceNumber}`,
            source: 'payment',
            source_id: paymentId,
            lines
        })
    } catch (error) {
        console.error('Error in postPaymentJournal:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

/**
 * Post journal for supplier bill
 * Debit: Expense
 * Debit: VAT Input (if applicable)
 * Credit: Accounts Payable
 */
export async function postBillJournal(
    companyId: string,
    billId: string,
    billDate: string,
    subtotal: number,
    taxAmount: number,
    totalAmount: number,
    billNumber: string,
    expenseAccountCode: string = '5200' // Default to Operating Expenses
): Promise<{ success: boolean; journal?: Journal; error?: string }> {
    try {
        // Get standard accounts
        const expenseAccount = await getAccountByCode(expenseAccountCode, companyId)
        const apAccount = await getAccountByCode('2110', companyId) // Accounts Payable
        const vatInputAccount = await getAccountByCode('1130', companyId) // VAT Input

        if (!expenseAccount || !apAccount) {
            return {
                success: false,
                error: 'Required accounts not found. Please initialize chart of accounts.'
            }
        }

        const lines: JournalLine[] = [
            {
                account_id: expenseAccount.id,
                debit: subtotal,
                credit: 0,
                description: `Bill ${billNumber}`
            },
            {
                account_id: apAccount.id,
                debit: 0,
                credit: totalAmount,
                description: `Bill ${billNumber} - Payable`
            }
        ]

        // Add VAT line if applicable
        if (taxAmount > 0 && vatInputAccount) {
            lines.push({
                account_id: vatInputAccount.id,
                debit: taxAmount,
                credit: 0,
                description: `VAT Input - Bill ${billNumber}`
            })
        }

        return await createJournal(companyId, {
            journal_date: billDate,
            memo: `Bill ${billNumber} received`,
            source: 'bill',
            source_id: billId,
            lines
        })
    } catch (error) {
        console.error('Error in postBillJournal:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

// ===== REPORTING =====

/**
 * Get trial balance (all debits and credits per account)
 */
export async function getTrialBalance(
    companyId: string,
    asOfDate?: string
): Promise<{ account_code: string; account_name: string; debits: number; credits: number; balance: number }[]> {
    try {
        let query = `
      SELECT 
        a.code as account_code,
        a.name as account_name,
        a.type as account_type,
        COALESCE(SUM(jl.debit), 0) as total_debits,
        COALESCE(SUM(jl.credit), 0) as total_credits
      FROM accounts a
      LEFT JOIN journal_lines jl ON a.id = jl.account_id
      LEFT JOIN journals j ON jl.journal_id = j.id
      WHERE a.company_id = '${companyId}'
        AND a.is_active = true
    `

        if (asOfDate) {
            query += ` AND j.journal_date <= '${asOfDate}'`
        }

        query += `
      GROUP BY a.id, a.code, a.name, a.type
      ORDER BY a.code
    `

        const { data, error } = await supabase.rpc('execute_raw_sql', { sql: query })

        if (error) {
            console.error('Error fetching trial balance:', error)
            return []
        }

        return (data || []).map((row: {
            account_code: string
            account_name: string
            account_type: string
            total_debits: number
            total_credits: number
        }) => ({
            account_code: row.account_code,
            account_name: row.account_name,
            debits: Number(row.total_debits),
            credits: Number(row.total_credits),
            balance: Number(row.total_debits) - Number(row.total_credits)
        }))
    } catch (error) {
        console.error('Error in getTrialBalance:', error)
        return []
    }
}

/**
 * Get consolidated trial balance for multiple companies
 */
export async function getConsolidatedTrialBalance(
    companyIds: string[],
    asOfDate?: string
): Promise<{ account_code: string; account_name: string; account_type: string; debits: number; credits: number; balance: number }[]> {
    if (!companyIds || companyIds.length === 0) return []

    try {
        // We aggregate by account CODE. Assumes consistent Chart of Accounts across entities.
        const companyIdsStr = companyIds.map(id => `'${id}'`).join(',')

        let query = `
      SELECT 
        a.code as account_code,
        MAX(a.name) as account_name, -- Use one name for the group (or MAX)
        a.type as account_type,
        COALESCE(SUM(jl.debit), 0) as total_debits,
        COALESCE(SUM(jl.credit), 0) as total_credits
      FROM accounts a
      LEFT JOIN journal_lines jl ON a.id = jl.account_id
      LEFT JOIN journals j ON jl.journal_id = j.id
      WHERE a.company_id IN (${companyIdsStr})
        AND a.is_active = true
    `

        if (asOfDate) {
            query += ` AND j.journal_date <= '${asOfDate}'`
        }

        // Group by Code (consolidating entities)
        query += `
      GROUP BY a.code, a.type
      ORDER BY a.code
    `

        const { data, error } = await supabase.rpc('execute_raw_sql', { sql: query })

        if (error) {
            console.error('Error fetching consolidated trial balance:', error)
            return []
        }

        return (data || []).map((row: {
            account_code: string
            account_name: string
            account_type: string
            total_debits: number
            total_credits: number
        }) => ({
            account_code: row.account_code,
            account_name: row.account_name || 'Unknown Account',
            debits: Number(row.total_debits),
            credits: Number(row.total_credits),
            balance: Number(row.total_debits) - Number(row.total_credits)
        }))
    } catch (error) {
        console.error('Error in getConsolidatedTrialBalance:', error)
        return []
    }
}
