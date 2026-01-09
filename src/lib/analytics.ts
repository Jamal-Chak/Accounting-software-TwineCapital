import { supabase } from './supabase'

export interface CashflowProjection {
    weekStartDate: string
    openingBalance: number
    predictedInflow: number
    predictedOutflow: number
    closingBalance: number
    confidence: number
}

export interface DetectedPattern {
    entityName: string
    entityType: 'vendor' | 'customer'
    amount: number
    frequency: string
    confidence: number
}

/**
 * Generate 13-week cashflow projection
 */
export async function generateCashflowProjection(companyId: string): Promise<CashflowProjection[]> {
    // 1. Get current balance (mocked for now, would come from bank accounts)
    let currentBalance = 0
    const { data: accounts } = await supabase
        .from('bank_accounts')
        .select('balance')
        .eq('company_id', companyId)

    if (accounts) {
        currentBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0)
    }

    // 2. Analyze historical patterns
    const patterns = await analyzePatterns(companyId)

    // 3. Get committed transactions (invoices and bills)
    const committed = await getCommittedTransactions(companyId)

    // 4. Generate week-by-week projection
    const projections: CashflowProjection[] = []
    let runningBalance = currentBalance
    const today = new Date()

    for (let i = 0; i < 13; i++) {
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() + (i * 7))
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)

        // Calculate Inflow
        const committedInflow = getCommittedAmount(committed.inflow, weekStart, weekEnd)
        const projectedInflow = calculateProjectedInflow(patterns, weekStart)
        const totalInflow = committedInflow + projectedInflow

        // Calculate Outflow
        const committedOutflow = getCommittedAmount(committed.outflow, weekStart, weekEnd)
        const projectedOutflow = calculateProjectedOutflow(patterns, weekStart)
        const totalOutflow = committedOutflow + projectedOutflow

        // Confidence score (higher if more committed vs projected)
        const totalVolume = totalInflow + totalOutflow
        const committedVolume = committedInflow + committedOutflow
        const confidence = totalVolume > 0 ? 0.5 + ((committedVolume / totalVolume) * 0.4) : 0.9

        const closingBalance = runningBalance + totalInflow - totalOutflow

        projections.push({
            weekStartDate: weekStart.toISOString().split('T')[0],
            openingBalance: runningBalance,
            predictedInflow: totalInflow,
            predictedOutflow: totalOutflow,
            closingBalance,
            confidence
        })

        runningBalance = closingBalance
    }

    // Cache results
    await cacheProjections(companyId, projections)

    return projections
}

/**
 * Analyze historical transactions to find patterns
 */
async function analyzePatterns(companyId: string): Promise<DetectedPattern[]> {
    // Simple heuristic: Get average monthly expenses
    // In a real implementation, this would use more complex time-series analysis

    // Mock patterns for MVP
    return [
        { entityName: 'Rent', entityType: 'vendor', amount: 15000, frequency: 'monthly', confidence: 0.9 },
        { entityName: 'Salaries', entityType: 'vendor', amount: 45000, frequency: 'monthly', confidence: 0.8 },
        { entityName: 'Software Subs', entityType: 'vendor', amount: 2000, frequency: 'monthly', confidence: 0.7 },
        { entityName: 'Average Sales', entityType: 'customer', amount: 12000, frequency: 'weekly', confidence: 0.5 }
    ]
}

/**
 * Get known future transactions (invoices/bills)
 */
async function getCommittedTransactions(companyId: string) {
    const today = new Date().toISOString()

    // Get unpaid invoices (Inflow)
    const { data: invoices } = await supabase
        .from('invoices')
        .select('due_date, total_amount')
        .eq('company_id', companyId)
        .eq('status', 'sent') // Assuming 'sent' means unpaid/open
        .gt('due_date', today)

    // Get unpaid bills (Outflow)
    // Note: Assuming we have a bills table or similar. Using expenses for now if bills not fully implemented
    // For this MVP, we'll assume bills are tracked in expenses with a future date or separate table
    // Let's use the recurring_invoices table we built earlier as a proxy for known outflows if we don't have bills
    const { data: recurring } = await supabase
        .from('recurring_invoices')
        .select('next_billing_date, amount') // This schema might need adjustment based on actual table
        .eq('company_id', companyId)

    return {
        inflow: invoices?.map(i => ({ date: new Date(i.due_date), amount: i.total_amount })) || [],
        outflow: [] // Placeholder for bills
    }
}

function getCommittedAmount(transactions: Array<{ date: Date, amount: number }>, start: Date, end: Date): number {
    return transactions
        .filter(t => t.date >= start && t.date <= end)
        .reduce((sum, t) => sum + t.amount, 0)
}

function calculateProjectedInflow(patterns: DetectedPattern[], date: Date): number {
    // Add weekly sales pattern
    const weeklySales = patterns.find(p => p.entityType === 'customer' && p.frequency === 'weekly')
    return weeklySales ? weeklySales.amount : 0
}

function calculateProjectedOutflow(patterns: DetectedPattern[], date: Date): number {
    let amount = 0

    // Check for monthly recurring expenses
    // Simplified: If date falls in first week of month, add monthly expenses
    if (date.getDate() <= 7) {
        amount += patterns
            .filter(p => p.entityType === 'vendor' && p.frequency === 'monthly')
            .reduce((sum, p) => sum + p.amount, 0)
    }

    return amount
}

async function cacheProjections(companyId: string, projections: CashflowProjection[]) {
    // Clear old projections
    await supabase
        .from('cashflow_projections')
        .delete()
        .eq('company_id', companyId)

    // Insert new ones
    await supabase
        .from('cashflow_projections')
        .insert(projections.map(p => ({
            company_id: companyId,
            week_start_date: p.weekStartDate,
            opening_balance: p.openingBalance,
            predicted_inflow: p.predictedInflow,
            predicted_outflow: p.predictedOutflow,
            closing_balance: p.closingBalance,
            confidence_score: p.confidence
        })))
}
