import { supabase } from './supabase'

export interface HealthScore {
    totalScore: number
    pillars: {
        profitability: {
            score: number
            metrics: {
                netMargin: number
                grossMargin: number
            }
        }
        liquidity: {
            score: number
            metrics: {
                currentRatio: number
                quickRatio: number
                cashRunway: number
                workingCapital: number
            }
        }
        efficiency: {
            score: number
            metrics: {
                arAging: number
                arAging30: number
                arAging60: number
                arAging90Plus: number
                dso: number
                expenseRatio: number
            }
        }
        growth: {
            score: number
            metrics: {
                revenueGrowth: number
            }
        }
    }
    recommendations: Array<{
        message: string
        priority: 'critical' | 'high' | 'medium' | 'low'
        category: string
    }>
}

/**
 * Calculate Business Health Score
 */
export async function calculateHealthScore(companyId: string): Promise<HealthScore> {
    // 1. Fetch Data
    const [invoices, expenses, accounts] = await Promise.all([
        fetchInvoices(companyId),
        fetchExpenses(companyId),
        fetchBankAccounts(companyId)
    ])

    // 2. Calculate Metrics
    const revenue = calculateRevenue(invoices)
    const costOfSales = calculateCostOfSales(expenses)
    const operatingExpenses = calculateOperatingExpenses(expenses)
    const netIncome = revenue - costOfSales - operatingExpenses

    const currentAssets = calculateCurrentAssets(accounts, invoices)
    const currentLiabilities = calculateCurrentLiabilities(expenses) // Simplified
    const monthlyBurn = calculateMonthlyBurn(expenses)

    const overdueInvoices = invoices.filter(i => isOverdue(i))
    const overdueAmount = overdueInvoices.reduce((sum, i) => sum + i.total_amount, 0)
    const totalReceivables = invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.total_amount, 0)


    // 3. Calculate Pillar Scores

    // Profitability (30%)
    const netMargin = revenue > 0 ? (netIncome / revenue) * 100 : 0
    const grossMargin = revenue > 0 ? ((revenue - costOfSales) / revenue) * 100 : 0
    const profitabilityScore = calculateSubScore([
        { value: netMargin, target: 20, weight: 0.6 },
        { value: grossMargin, target: 40, weight: 0.4 }
    ])

    // Liquidity (25%)
    const cash = accounts.reduce((sum, a) => sum + (a.balance || 0), 0)
    const quickAssets = cash + totalReceivables // Cash + receivables (no inventory)
    const workingCapital = currentAssets - currentLiabilities

    const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 10
    const quickRatio = currentLiabilities > 0 ? quickAssets / currentLiabilities : 10
    const cashRunway = monthlyBurn > 0 ? (currentAssets / monthlyBurn) : 12

    const liquidityScore = calculateSubScore([
        { value: currentRatio, target: 1.5, weight: 0.3 },
        { value: quickRatio, target: 1.0, weight: 0.3 },
        { value: cashRunway, target: 6, weight: 0.4 }
    ])

    // Efficiency (25%)
    // AR Aging buckets
    const now = new Date()
    const arAging30 = invoices.filter(i => i.status !== 'paid' && isAgedBetween(i, 0, 30)).reduce((sum, i) => sum + i.total_amount, 0)
    const arAging60 = invoices.filter(i => i.status !== 'paid' && isAgedBetween(i, 31, 60)).reduce((sum, i) => sum + i.total_amount, 0)
    const arAging90Plus = invoices.filter(i => i.status !== 'paid' && isAgedBetween(i, 61, 999)).reduce((sum, i) => sum + i.total_amount, 0)

    const arAging = totalReceivables > 0 ? (overdueAmount / totalReceivables) * 100 : 0
    const dso = revenue > 0 ? (totalReceivables / (revenue / 365)) : 0 // Days Sales Outstanding
    const expenseRatio = revenue > 0 ? ((costOfSales + operatingExpenses) / revenue) * 100 : 0

    const efficiencyScore = calculateSubScore([
        { value: 100 - arAging, target: 90, weight: 0.4 },
        { value: Math.max(0, 100 - dso), target: 70, weight: 0.3 }, // Target 30 days DSO
        { value: 100 - expenseRatio, target: 30, weight: 0.3 }
    ])

    // Growth (20%)
    const revenueGrowth = await calculateRevenueGrowth(companyId, invoices)
    const growthScore = calculateSubScore([
        { value: revenueGrowth, target: 5, weight: 1.0 }
    ])

    // 4. Total Score
    const totalScore = Math.round(
        (profitabilityScore * 0.3) +
        (liquidityScore * 0.25) +
        (efficiencyScore * 0.25) +
        (growthScore * 0.2)
    )

    // 5. Generate Recommendations
    const recommendations = generateRecommendations({
        profitabilityScore, liquidityScore, efficiencyScore, growthScore,
        arAging, arAging30, arAging60, arAging90Plus, cashRunway, netMargin,
        quickRatio, dso, expenseRatio, workingCapital
    })

    return {
        totalScore,
        pillars: {
            profitability: {
                score: Math.round(profitabilityScore),
                metrics: { netMargin, grossMargin }
            },
            liquidity: {
                score: Math.round(liquidityScore),
                metrics: { currentRatio, quickRatio, cashRunway, workingCapital }
            },
            efficiency: {
                score: Math.round(efficiencyScore),
                metrics: {
                    arAging,
                    arAging30,
                    arAging60,
                    arAging90Plus,
                    dso,
                    expenseRatio
                }
            },
            growth: {
                score: Math.round(growthScore),
                metrics: { revenueGrowth }
            }
        },
        recommendations
    }
}

// --- Helpers ---

async function fetchInvoices(companyId: string) {
    const { data } = await supabase
        .from('invoices')
        .select('*')
        .eq('company_id', companyId)
    return data || []
}

async function fetchExpenses(companyId: string) {
    const { data } = await supabase
        .from('expenses')
        .select('*')
        .eq('company_id', companyId)
    return data || []
}

async function fetchBankAccounts(companyId: string) {
    const { data } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('company_id', companyId)
    return data || []
}

function calculateRevenue(invoices: any[]) {
    return invoices.reduce((sum, i) => sum + (i.total_amount || 0), 0)
}

function calculateCostOfSales(expenses: any[]) {
    return expenses
        .filter(e => e.category === 'Cost of Sales' || e.category === 'Inventory')
        .reduce((sum, e) => sum + (e.amount || 0), 0)
}

function calculateOperatingExpenses(expenses: any[]) {
    return expenses
        .filter(e => e.category !== 'Cost of Sales' && e.category !== 'Inventory')
        .reduce((sum, e) => sum + (e.amount || 0), 0)
}

function calculateCurrentAssets(accounts: any[], invoices: any[]) {
    const cash = accounts.reduce((sum, a) => sum + (a.balance || 0), 0)
    const receivables = invoices
        .filter(i => i.status !== 'paid')
        .reduce((sum, i) => sum + (i.total_amount || 0), 0)
    return cash + receivables
}

function calculateCurrentLiabilities(expenses: any[]) {
    // Simplified: Assume 50% of expenses are payable within 30 days
    return expenses.reduce((sum, e) => sum + (e.amount || 0), 0) * 0.5
}

function calculateMonthlyBurn(expenses: any[]) {
    // Simplified: Total expenses / 12 (assuming 1 year of data)
    // In real app, filter by date range
    return expenses.reduce((sum, e) => sum + (e.amount || 0), 0) / 12
}

function isOverdue(invoice: any) {
    return invoice.status !== 'paid' && new Date(invoice.due_date) < new Date()
}

function calculateSubScore(metrics: { value: number; target: number; weight: number }[]) {
    let score = 0
    for (const m of metrics) {
        // Cap at 100% of target
        const performance = Math.min(m.value / m.target, 1.2) // Allow up to 120% performance
        score += (performance * 100) * m.weight
    }
    return Math.min(Math.round(score), 100)
}

function isAgedBetween(invoice: any, minDays: number, maxDays: number) {
    if (invoice.status === 'paid') return false
    const dueDate = new Date(invoice.due_date)
    const now = new Date()
    const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
    return daysOverdue >= minDays && daysOverdue <= maxDays
}

async function calculateRevenueGrowth(companyId: string, invoices: any[]) {
    // Calculate revenue growth comparing last 30 days vs previous 30 days
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    const currentPeriodRevenue = invoices
        .filter(i => new Date(i.created_at) >= thirtyDaysAgo && new Date(i.created_at) <= now)
        .reduce((sum, i) => sum + (i.total_amount || 0), 0)

    const previousPeriodRevenue = invoices
        .filter(i => new Date(i.created_at) >= sixtyDaysAgo && new Date(i.created_at) < thirtyDaysAgo)
        .reduce((sum, i) => sum + (i.total_amount || 0), 0)

    if (previousPeriodRevenue === 0) return 0
    return ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100
}

function generateRecommendations(metrics: any): Array<{ message: string; priority: 'critical' | 'high' | 'medium' | 'low'; category: string }> {
    const recs: Array<{ message: string; priority: 'critical' | 'high' | 'medium' | 'low'; category: string }> = []

    // Critical liquidity issues
    if (metrics.cashRunway < 3) {
        recs.push({
            message: "⚠️ Cash runway is critically low (< 3 months). Immediate action required: reduce expenses, collect receivables, or secure additional funding.",
            priority: 'critical',
            category: 'Liquidity'
        })
    } else if (metrics.cashRunway < 6) {
        recs.push({
            message: "Cash runway is below 6 months. Consider reviewing major expenses and accelerating collections.",
            priority: 'high',
            category: 'Liquidity'
        })
    }

    // Quick ratio concerns
    if (metrics.quickRatio < 0.8) {
        recs.push({
            message: "Quick ratio is low. Focus on collecting outstanding invoices to improve immediate liquidity.",
            priority: 'high',
            category: 'Liquidity'
        })
    }

    // Working capital
    if (metrics.workingCapital < 0) {
        recs.push({
            message: "Negative working capital detected. Your short-term liabilities exceed current assets. Review payment terms with suppliers.",
            priority: 'critical',
            category: 'Liquidity'
        })
    }

    // AR Aging issues
    if (metrics.arAging90Plus > 0) {
        recs.push({
            message: `You have R${metrics.arAging90Plus.toLocaleString()} in invoices overdue by 90+ days. Consider collection agencies or write-offs.`,
            priority: 'high',
            category: 'Efficiency'
        })
    }

    if (metrics.arAging60 > 0 && metrics.arAging > 20) {
        recs.push({
            message: "High percentage of invoices are overdue. Implement automated payment reminders and review credit terms.",
            priority: 'medium',
            category: 'Efficiency'
        })
    }

    // DSO (Days Sales Outstanding)
    if (metrics.dso > 45) {
        recs.push({
            message: `Average collection period is ${Math.round(metrics.dso)} days. Industry best practice is 30-45 days. Tighten credit policies.`,
            priority: 'medium',
            category: 'Efficiency'
        })
    }

    // Expense ratio
    if (metrics.expenseRatio > 80) {
        recs.push({
            message: "Expenses are consuming over 80% of revenue. Analyze operating costs for potential savings.",
            priority: 'high',
            category: 'Profitability'
        })
    }

    // Profitability
    if (metrics.netMargin < 5) {
        recs.push({
            message: "Net margin is below 5%. Review pricing strategy and cost structure to improve profitability.",
            priority: 'high',
            category: 'Profitability'
        })
    } else if (metrics.netMargin < 10) {
        recs.push({
            message: "Net margin could be improved. Look for opportunities to reduce costs or increase pricing.",
            priority: 'medium',
            category: 'Profitability'
        })
    }

    // Overall health
    if (metrics.liquidityScore >= 80 && metrics.profitabilityScore >= 80 && metrics.efficiencyScore >= 80) {
        recs.push({
            message: "Excellent financial health! Consider investing surplus cash in growth opportunities or building reserves.",
            priority: 'low',
            category: 'Growth'
        })
    }

    // If no recommendations, provide encouragement
    if (recs.length === 0) {
        recs.push({
            message: "Your business health metrics are strong. Keep up the good work and maintain current practices.",
            priority: 'low',
            category: 'General'
        })
    }

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    return recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
}

