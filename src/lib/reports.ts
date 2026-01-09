import { supabase } from './supabase'

export interface TrialBalanceEntry {
    accountId: string
    accountName: string
    accountCode: string
    accountType: string
    debit: number
    credit: number
}

export interface ProfitLossEntry {
    category: string
    amount: number
    accounts: {
        name: string
        amount: number
    }[]
}

export interface BalanceSheetEntry {
    category: string
    total: number
    accounts: {
        name: string
        amount: number
    }[]
}

/**
 * Generate Trial Balance Report
 * Lists all accounts and their total debit/credit balances
 */
export async function getTrialBalance(companyId: string, startDate?: string, endDate?: string): Promise<TrialBalanceEntry[]> {
    // Get all accounts
    const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .eq('company_id', companyId)
        .order('code')

    if (accountsError) throw accountsError

    // Get journal lines within date range
    let query = supabase
        .from('journal_lines')
        .select(`
      account_id,
      debit,
      credit,
      journal:journals!inner(journal_date, company_id)
    `)
        .eq('journal.company_id', companyId)

    if (startDate) query = query.gte('journal.journal_date', startDate)
    if (endDate) query = query.lte('journal.journal_date', endDate)

    const { data: lines, error: linesError } = await query

    if (linesError) throw linesError

    // Aggregate balances
    const balances = new Map<string, { debit: number, credit: number }>()

    lines.forEach((line: any) => {
        const current = balances.get(line.account_id) || { debit: 0, credit: 0 }
        balances.set(line.account_id, {
            debit: current.debit + (line.debit || 0),
            credit: current.credit + (line.credit || 0)
        })
    })

    // Format result
    return accounts.map(account => {
        const balance = balances.get(account.id) || { debit: 0, credit: 0 }
        return {
            accountId: account.id,
            accountName: account.name,
            accountCode: account.code,
            accountType: account.type,
            debit: balance.debit,
            credit: balance.credit
        }
    }).filter(entry => entry.debit > 0 || entry.credit > 0)
}

/**
 * Generate Profit & Loss Statement
 * Revenue - Expenses = Net Income
 */
export async function getProfitAndLoss(companyId: string, startDate: string, endDate: string) {
    const trialBalance = await getTrialBalance(companyId, startDate, endDate)

    const revenue: ProfitLossEntry = { category: 'Revenue', amount: 0, accounts: [] }
    const expenses: ProfitLossEntry = { category: 'Operating Expenses', amount: 0, accounts: [] }

    trialBalance.forEach(entry => {
        const netAmount = entry.credit - entry.debit // Revenue is Credit normal, Expense is Debit normal

        if (entry.accountType === 'Revenue') {
            revenue.accounts.push({ name: entry.accountName, amount: netAmount })
            revenue.amount += netAmount
        } else if (entry.accountType === 'Expense') {
            const expenseAmount = entry.debit - entry.credit // Expense is Debit normal
            expenses.accounts.push({ name: entry.accountName, amount: expenseAmount })
            expenses.amount += expenseAmount
        }
    })

    return {
        revenue,
        expenses,
        netIncome: revenue.amount - expenses.amount
    }
}

/**
 * Generate Balance Sheet
 * Assets = Liabilities + Equity
 */
export async function getBalanceSheet(companyId: string, asOfDate: string) {
    const trialBalance = await getTrialBalance(companyId, undefined, asOfDate)

    const assets: BalanceSheetEntry = { category: 'Assets', total: 0, accounts: [] }
    const liabilities: BalanceSheetEntry = { category: 'Liabilities', total: 0, accounts: [] }
    const equity: BalanceSheetEntry = { category: 'Equity', total: 0, accounts: [] }

    trialBalance.forEach(entry => {
        const netDebit = entry.debit - entry.credit
        const netCredit = entry.credit - entry.debit

        if (entry.accountType === 'Asset') {
            assets.accounts.push({ name: entry.accountName, amount: netDebit })
            assets.total += netDebit
        } else if (entry.accountType === 'Liability') {
            liabilities.accounts.push({ name: entry.accountName, amount: netCredit })
            liabilities.total += netCredit
        } else if (entry.accountType === 'Equity') {
            equity.accounts.push({ name: entry.accountName, amount: netCredit })
            equity.total += netCredit
        }
    })

    // Calculate Retained Earnings (Net Income from all time)
    // This is a simplification; normally you'd close books to Retained Earnings
    // For this dynamic report, we calculate it on the fly
    // Assets - Liabilities - Equity = Retained Earnings (roughly)
    const retainedEarnings = assets.total - liabilities.total - equity.total

    if (retainedEarnings !== 0) {
        equity.accounts.push({ name: 'Retained Earnings (Calculated)', amount: retainedEarnings })
        equity.total += retainedEarnings
    }

    return {
        assets,
        liabilities,
        equity
    }
}
