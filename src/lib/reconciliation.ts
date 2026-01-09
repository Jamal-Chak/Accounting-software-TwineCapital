import { supabase } from './supabase'
import type { Transaction, Invoice, Expense, Bill } from './database'
import { categorizeTransaction } from './ai-service'

/**
 * Auto-matching confidence levels
 */
export enum MatchConfidence {
    HIGH = 'high',      // 95%+ - Auto-match
    MEDIUM = 'medium',  // 70-95% - Suggest to user  
    LOW = 'low'         // <70% - Manual review
}

/**
 * Match suggestion interface
 */
export interface MatchSuggestion {
    transaction: Transaction
    matchType: 'invoice' | 'expense' | 'bill' | 'none'
    matchedEntity: Invoice | Expense | Bill | null
    confidence: MatchConfidence
    score: number
    reasons: string[]
}

/**
 * Reconciliation result
 */
export interface ReconciliationResult {
    success: boolean
    matched: number
    suggested: number
    unmatched: number
    categorized: number // New field for AI categorized count
    autoMatched: MatchSuggestion[]
    needsReview: MatchSuggestion[]
    error?: string
}

/**
 * Calculate similarity between two strings (0-1)
 * Uses Levenshtein distance
 */
function stringSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim()
    const s2 = str2.toLowerCase().trim()

    if (s1 === s2) return 1
    if (s1.length === 0 || s2.length === 0) return 0

    const longer = s1.length > s2.length ? s1 : s2
    const shorter = s1.length > s2.length ? s2 : s1

    if (longer.includes(shorter)) return 0.8

    // Simple character overlap calculation
    const chars1 = new Set(s1.split(''))
    const chars2 = new Set(s2.split(''))
    const intersection = new Set([...chars1].filter(x => chars2.has(x)))

    return (intersection.size * 2) / (chars1.size + chars2.size)
}

/**
 * Calculate date similarity (0-1) based on proximity
 * Same day = 1, within 3 days = 0.9, within 7 days = 0.7, etc.
 */
function dateSimilarity(date1: string, date2: string): number {
    const d1 = new Date(date1).getTime()
    const d2 = new Date(date2).getTime()
    const diffDays = Math.abs(d1 - d2) / (1000 * 60 * 60 * 24)

    if (diffDays === 0) return 1.0
    if (diffDays <= 3) return 0.9
    if (diffDays <= 7) return 0.7
    if (diffDays <= 14) return 0.5
    if (diffDays <= 30) return 0.3
    return 0
}

/**
 * Calculate amount similarity (0-1)
 * Exact match = 1, close matches get lower scores
 */
function amountSimilarity(amount1: number, amount2: number): number {
    const diff = Math.abs(amount1 - amount2)
    const avg = (Math.abs(amount1) + Math.abs(amount2)) / 2

    if (diff === 0) return 1.0
    if (avg === 0) return 0

    const percentDiff = diff / avg
    if (percentDiff < 0.01) return 0.95  // Within 1%
    if (percentDiff < 0.05) return 0.8   // Within 5%
    if (percentDiff < 0.10) return 0.6   // Within 10%
    return 0
}

/**
 * Match transaction against invoice
 */
async function matchTransactionToInvoice(
    transaction: Transaction,
    invoices: Invoice[]
): Promise<MatchSuggestion | null> {
    let bestMatch: MatchSuggestion | null = null
    let bestScore = 0

    for (const invoice of invoices) {
        const scores = {
            amount: amountSimilarity(transaction.amount, invoice.total_amount),
            date: dateSimilarity(transaction.date, invoice.issue_date),
            description: 0
        }

        // Try to match description with invoice number or client name
        if (transaction.description) {
            const descSimilarityToNumber = stringSimilarity(
                transaction.description,
                invoice.invoice_number
            )
            const clientName = (invoice as any).client?.name || ''
            const descSimilarityToClient = clientName ? stringSimilarity(
                transaction.description,
                clientName
            ) : 0

            scores.description = Math.max(descSimilarityToNumber, descSimilarityToClient)
        }

        // Weighted total score
        const totalScore = (
            scores.amount * 0.5 +      // Amount is most important
            scores.date * 0.3 +         // Date proximity matters
            scores.description * 0.2    // Description helps confirm
        )

        if (totalScore > bestScore && totalScore > 0.4) {
            const reasons: string[] = []
            if (scores.amount > 0.9) reasons.push('Exact amount match')
            else if (scores.amount > 0.7) reasons.push('Similar amount')
            if (scores.date > 0.9) reasons.push('Same date')
            else if (scores.date > 0.6) reasons.push('Close date proximity')
            if (scores.description > 0.7) reasons.push('Description matches')

            let confidence: MatchConfidence
            if (totalScore >= 0.85) confidence = MatchConfidence.HIGH
            else if (totalScore >= 0.65) confidence = MatchConfidence.MEDIUM
            else confidence = MatchConfidence.LOW

            bestScore = totalScore
            bestMatch = {
                transaction,
                matchType: 'invoice',
                matchedEntity: invoice,
                confidence,
                score: totalScore,
                reasons
            }
        }
    }

    return bestMatch
}

/**
 * Match transaction against expense
 */
async function matchTransactionToExpense(
    transaction: Transaction,
    expenses: Expense[]
): Promise<MatchSuggestion | null> {
    let bestMatch: MatchSuggestion | null = null
    let bestScore = 0

    for (const expense of expenses) {
        const scores = {
            amount: amountSimilarity(Math.abs(transaction.amount), expense.total_amount),
            date: dateSimilarity(transaction.date, expense.date),
            description: transaction.description ? stringSimilarity(
                transaction.description,
                expense.vendor || expense.category || ''
            ) : 0
        }

        const totalScore = (
            scores.amount * 0.5 +
            scores.date * 0.3 +
            scores.description * 0.2
        )

        if (totalScore > bestScore && totalScore > 0.4) {
            const reasons: string[] = []
            if (scores.amount > 0.9) reasons.push('Exact amount match')
            else if (scores.amount > 0.7) reasons.push('Similar amount')
            if (scores.date > 0.9) reasons.push('Same date')
            else if (scores.date > 0.6) reasons.push('Close date proximity')
            if (scores.description > 0.7) reasons.push('Vendor/category matches')

            let confidence: MatchConfidence
            if (totalScore >= 0.85) confidence = MatchConfidence.HIGH
            else if (totalScore >= 0.65) confidence = MatchConfidence.MEDIUM
            else confidence = MatchConfidence.LOW

            bestScore = totalScore
            bestMatch = {
                transaction,
                matchType: 'expense',
                matchedEntity: expense,
                confidence,
                score: totalScore,
                reasons
            }
        }
    }

    return bestMatch
}

/**
 * Auto-reconcile transactions
 * Returns matches with confidence scores
 */
export async function autoReconcileTransactions(
    companyId: string,
    autoMatchThreshold: number = 0.85
): Promise<ReconciliationResult> {
    try {
        // Get unreconciled transactions
        const { data: transactions, error: txError } = await supabase
            .from('transactions')
            .select('*')
            .eq('is_reconciled', false)
            .order('date', { ascending: false })

        if (txError) {
            return {
                success: false,
                matched: 0,
                suggested: 0,
                unmatched: 0,
                categorized: 0,
                autoMatched: [],
                needsReview: [],
                error: txError.message
            }
        }

        if (!transactions || transactions.length === 0) {
            return {
                success: true,
                matched: 0,
                suggested: 0,
                unmatched: 0,
                categorized: 0,
                autoMatched: [],
                needsReview: []
            }
        }

        // Get potential matches
        const { data: invoices } = await supabase
            .from('invoices')
            .select('*, client:clients(name)')
            .eq('company_id', companyId)
            .in('status', ['sent', 'partial'])

        const { data: expenses } = await supabase
            .from('expenses')
            .select('*')
            .eq('company_id', companyId)

        const autoMatched: MatchSuggestion[] = []
        const needsReview: MatchSuggestion[] = []
        let unmatched = 0
        let categorized = 0

        // Try to match each transaction
        for (const transaction of transactions) {
            let bestMatch: MatchSuggestion | null = null

            // Try matching to invoices (positive amounts)
            if (transaction.amount > 0 && invoices) {
                const invoiceMatch = await matchTransactionToInvoice(transaction, invoices)
                if (invoiceMatch) bestMatch = invoiceMatch
            }

            // Try matching to expenses (negative amounts)
            if (transaction.amount < 0 && expenses) {
                const expenseMatch = await matchTransactionToExpense(transaction, expenses)
                if (expenseMatch && (!bestMatch || expenseMatch.score > bestMatch.score)) {
                    bestMatch = expenseMatch
                }
            }

            if (bestMatch) {
                if (bestMatch.score >= autoMatchThreshold) {
                    autoMatched.push(bestMatch)
                } else {
                    needsReview.push(bestMatch)
                }
            } else {
                // FALLBACK: AI Categorization
                // If the transaction has no match and no category, ask AI
                if (!transaction.category && transaction.amount < 0) { // Only categorize expenses for now
                    const aiContext = { industry: 'General Business' } // Ideally fetch from company settings
                    const aiResult = await categorizeTransaction(transaction.description, transaction.amount, aiContext)

                    if (aiResult.category && aiResult.category !== 'Uncategorized Expenses') {
                        // Update transaction with AI category
                        await supabase
                            .from('transactions')
                            .update({ category: aiResult.category }) // Update without reconciling
                            .eq('id', transaction.id)

                        categorized++
                    }
                }
                unmatched++
            }
        }

        // Auto-apply high-confidence matches
        for (const match of autoMatched) {
            await supabase
                .from('transactions')
                .update({ is_reconciled: true })
                .eq('id', match.transaction.id)
        }

        return {
            success: true,
            matched: autoMatched.length,
            suggested: needsReview.length,
            unmatched,
            categorized, // Return count
            autoMatched,
            needsReview
        }
    } catch (error) {
        console.error('Error in autoReconcileTransactions:', error)
        return {
            success: false,
            matched: 0,
            suggested: 0,
            unmatched: 0,
            categorized: 0,
            autoMatched: [],
            needsReview: [],
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

/**
 * Get match suggestions for a single transaction
 */
export async function getMatchSuggestionsForTransaction(
    transaction: Transaction,
    companyId: string
): Promise<MatchSuggestion[]> {
    const suggestions: MatchSuggestion[] = []

    try {
        // Get potential matches
        const { data: invoices } = await supabase
            .from('invoices')
            .select('*, client:clients(name)')
            .eq('company_id', companyId)

        const { data: expenses } = await supabase
            .from('expenses')
            .select('*')
            .eq('company_id', companyId)

        // Match to invoices
        if (transaction.amount > 0 && invoices) {
            const match = await matchTransactionToInvoice(transaction, invoices)
            if (match) suggestions.push(match)
        }

        // Match to expenses
        if (transaction.amount < 0 && expenses) {
            const match = await matchTransactionToExpense(transaction, expenses)
            if (match) suggestions.push(match)
        }

        // Sort by score descending
        return suggestions.sort((a, b) => b.score - a.score)
    } catch (error) {
        console.error('Error getting match suggestions:', error)
        return []
    }
}
