import { supabase } from './supabase'

/**
 * VAT Period interface
 */
export interface VATPeriod {
    startDate: string
    endDate: string
    dueDate: string
    period: string // e.g., "2024-Q1" or "2024-11"
}

/**
 * VAT Summary interface
 */
export interface VATSummary {
    period: VATPeriod
    outputVAT: number      // VAT on sales (invoices)
    inputVAT: number       // VAT on purchases (expenses/bills)
    netVAT: number         // outputVAT - inputVAT (payable if positive)
    totalSales: number
    totalPurchases: number
    invoiceCount: number
    expenseCount: number
}

/**
 * VAT201 Form Data (South African VAT Return)
 */
export interface VAT201FormData {
    period: VATPeriod
    // Box 1-8: Output Tax
    box1_standardRateSales: number
    box2_zeroRatedSales: number
    box3_exemptSales: number
    box4_totalSales: number // box1 + box2 + box3
    box5_outputTaxStandardRate: number
    box6_outputTaxOtherRates: number
    box7_totalOutputTax: number // box5 + box6

    // Box 9-14: Input Tax
    box9_standardRatePurchases: number
    box10_zeroRatedPurchases: number
    box11_totalPurchases: number // box9 + box10
    box12_inputTaxStandardRate: number
    box13_inputTaxOtherRates: number
    box14_totalInputTax: number // box12 + box13

    // Box 15-16: Final Calculation
    box15_netVATPayableRefundable: number // box7 - box14
    box16_badDebtsWrittenOff: number
    box17_totalVATPayableRefundable: number // box15 + box16
}

/**
 * Calculate VAT period for a given date
 * South Africa: Bimonthly (every 2 months) for most businesses
 */
export function getVATPeriodForDate(date: Date, frequency: 'monthly' | 'bimonthly' = 'bimonthly'): VATPeriod {
    const year = date.getFullYear()
    const month = date.getMonth() // 0-11

    if (frequency === 'monthly') {
        const startDate = new Date(year, month, 1)
        const endDate = new Date(year, month + 1, 0) // Last day of month
        const dueDate = new Date(year, month + 2, 25) // 25th of 2nd month after period

        return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            dueDate: dueDate.toISOString().split('T')[0],
            period: `${year}-${String(month + 1).padStart(2, '0')}`
        }
    } else {
        // Bimonthly: Jan-Feb, Mar-Apr, May-Jun, Jul-Aug, Sep-Oct, Nov-Dec
        const periodIndex = Math.floor(month / 2)
        const startMonth = periodIndex * 2
        const endMonth = startMonth + 1

        const startDate = new Date(year, startMonth, 1)
        const endDate = new Date(year, endMonth + 1, 0)
        const dueDate = new Date(year, endMonth + 2, 25)

        return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            dueDate: dueDate.toISOString().split('T')[0],
            period: `${year}-P${periodIndex + 1}`
        }
    }
}

/**
 * Get current VAT period
 */
export function getCurrentVATPeriod(frequency: 'monthly' | 'bimonthly' = 'bimonthly'): VATPeriod {
    return getVATPeriodForDate(new Date(), frequency)
}

/**
 * Calculate VAT summary for a period
 */
export async function calculateVATForPeriod(
    companyId: string,
    startDate: string,
    endDate: string
): Promise<VATSummary> {
    try {
        // Get invoices in period (output VAT)
        const { data: invoices, error: invError } = await supabase
            .from('invoices')
            .select('total_amount, tax_amount')
            .eq('company_id', companyId)
            .gte('issue_date', startDate)
            .lte('issue_date', endDate)
            .in('status', ['sent', 'partial', 'paid'])

        if (invError) throw invError

        // Get expenses in period (input VAT)
        const { data: expenses, error: expError } = await supabase
            .from('expenses')
            .select('total_amount, tax_amount, amount')
            .eq('company_id', companyId)
            .gte('date', startDate)
            .lte('date', endDate)

        if (expError) throw expError

        // Get bills in period (input VAT)
        const { data: bills, error: billError } = await supabase
            .from('bills')
            .select('total_amount, tax_amount')
            .eq('company_id', companyId)
            .gte('bill_date', startDate)
            .lte('bill_date', endDate)

        if (billError) throw billError

        // Calculate output VAT (from sales)
        const outputVAT = (invoices || []).reduce((sum, inv) => sum + (inv.tax_amount || 0), 0)
        const totalSales = (invoices || []).reduce((sum, inv) => sum + (inv.total_amount || 0), 0)

        // Calculate input VAT (from purchases)
        const expenseInputVAT = (expenses || []).reduce((sum, exp) => sum + (exp.tax_amount || 0), 0)
        const billInputVAT = (bills || []).reduce((sum, bill) => sum + (bill.tax_amount || 0), 0)
        const inputVAT = expenseInputVAT + billInputVAT

        const totalPurchases =
            (expenses || []).reduce((sum, exp) => sum + (exp.total_amount || 0), 0) +
            (bills || []).reduce((sum, bill) => sum + (bill.total_amount || 0), 0)

        const period = getVATPeriodForDate(new Date(startDate))

        return {
            period,
            outputVAT,
            inputVAT,
            netVAT: outputVAT - inputVAT,
            totalSales,
            totalPurchases,
            invoiceCount: (invoices || []).length,
            expenseCount: (expenses || []).length + (bills || []).length
        }
    } catch (error) {
        console.error('Error calculating VAT:', error)
        throw error
    }
}

/**
 * Generate VAT201 form data
 * Simplified version - assumes all transactions are standard rate (15%)
 */
export async function generateVAT201Form(
    companyId: string,
    startDate: string,
    endDate: string
): Promise<VAT201FormData> {
    const summary = await calculateVATForPeriod(companyId, startDate, endDate)

    // Simplified: assuming all sales/purchases are standard rated at 15%
    const standardRateSales = summary.totalSales - summary.outputVAT
    const standardRatePurchases = summary.totalPurchases - summary.inputVAT

    return {
        period: summary.period,
        // Output Tax
        box1_standardRateSales: standardRateSales,
        box2_zeroRatedSales: 0,
        box3_exemptSales: 0,
        box4_totalSales: standardRateSales,
        box5_outputTaxStandardRate: summary.outputVAT,
        box6_outputTaxOtherRates: 0,
        box7_totalOutputTax: summary.outputVAT,

        // Input Tax
        box9_standardRatePurchases: standardRatePurchases,
        box10_zeroRatedPurchases: 0,
        box11_totalPurchases: standardRatePurchases,
        box12_inputTaxStandardRate: summary.inputVAT,
        box13_inputTaxOtherRates: 0,
        box14_totalInputTax: summary.inputVAT,

        // Final
        box15_netVATPayableRefundable: summary.netVAT,
        box16_badDebtsWrittenOff: 0,
        box17_totalVATPayableRefundable: summary.netVAT
    }
}

/**
 * Get upcoming VAT due dates
 */
export function getUpcomingVATDueDates(count: number = 3): VATPeriod[] {
    const periods: VATPeriod[] = []
    const now = new Date()

    for (let i = 0; i < count; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i * 2, 1)
        periods.push(getVATPeriodForDate(date))
    }

    return periods.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
}

/**
 * Check if VAT submission is overdue
 */
export function isVATOverdue(dueDate: string): boolean {
    return new Date(dueDate) < new Date()
}

/**
 * Calculate days until VAT due
 */
export function daysUntilVATDue(dueDate: string): number {
    const due = new Date(dueDate)
    const now = new Date()
    const diff = due.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
