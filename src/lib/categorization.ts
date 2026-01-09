import { supabase } from './supabase'

/**
 * Transaction Category Types
 */
export type CategoryType =
    | 'Income'
    | 'Cost of Sales'
    | 'Operating Expenses'
    | 'Capital Expenditure'
    | 'Tax'
    | 'Other'

/**
 * Expense Categories (Sub-categories)
 */
export const EXPENSE_CATEGORIES = [
    'Advertising & Marketing',
    'Bank Charges',
    'Computer & Internet',
    'Fuel',
    'Insurance',
    'Legal & Professional Fees',
    'Meals & Entertainment',
    'Office Supplies',
    'Rent',
    'Salaries & Wages',
    'Software & Subscriptions',
    'Telephone',
    'Travel & Accommodation',
    'Utilities',
    'VAT',
    'Other'
] as const

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number]

/**
 * Income Categories
 */
export const INCOME_CATEGORIES = [
    'Sales Revenue',
    'Service Revenue',
    'Consulting Revenue',
    'Interest Income',
    'Other Income'
] as const

export type IncomeCategory = typeof INCOME_CATEGORIES[number]

/**
 * Categorization Result
 */
export interface CategorizationResult {
    category: string
    confidence: number // 0-1
    reasons: string[]
    alternativeCategories?: Array<{ category: string; confidence: number }>
}

/**
 * Training Data Entry
 */
export interface TrainingData {
    description: string
    vendor?: string
    amount: number
    category: string
    companyId: string
}

/**
 * Keyword-based category patterns
 */
const CATEGORY_PATTERNS: Record<string, { keywords: string[]; type: CategoryType }> = {
    'Advertising & Marketing': {
        keywords: ['google ads', 'facebook', 'meta', 'advertising', 'marketing', 'campaign', 'social media', 'seo'],
        type: 'Operating Expenses'
    },
    'Bank Charges': {
        keywords: ['bank fee', 'bank charge', 'service fee', 'monthly fee', 'transaction fee'],
        type: 'Operating Expenses'
    },
    'Computer & Internet': {
        keywords: ['internet', 'wifi', 'broadband', 'hosting', 'domain', 'github', 'aws', 'azure', 'digital ocean'],
        type: 'Operating Expenses'
    },
    'Fuel': {
        keywords: ['petrol', 'diesel', 'fuel', 'gas', 'bp', 'shell', 'engen', 'sasol'],
        type: 'Operating Expenses'
    },
    'Insurance': {
        keywords: ['insurance', 'cover', 'policy', 'premium'],
        type: 'Operating Expenses'
    },
    'Legal & Professional Fees': {
        keywords: ['attorney', 'lawyer', 'legal', 'accountant', 'audit', 'consultant'],
        type: 'Operating Expenses'
    },
    'Meals & Entertainment': {
        keywords: ['restaurant', 'cafe', 'coffee', 'food', 'meal', 'lunch', 'dinner', 'uber eats', 'mr delivery'],
        type: 'Operating Expenses'
    },
    'Office Supplies': {
        keywords: ['stationery', 'paper', 'pens', 'office', 'supplies', 'takealot'],
        type: 'Operating Expenses'
    },
    'Rent': {
        keywords: ['rent', 'lease', 'premises'],
        type: 'Operating Expenses'
    },
    'Salaries & Wages': {
        keywords: ['salary', 'wage', 'payroll', 'staff', 'employee'],
        type: 'Operating Expenses'
    },
    'Software & Subscriptions': {
        keywords: ['software', 'subscription', 'saas', 'license', 'adobe', 'microsoft', 'openai', 'chatgpt'],
        type: 'Operating Expenses'
    },
    'Telephone': {
        keywords: ['vodacom', 'mtn', 'cell c', 'telkom', 'phone', 'mobile', 'airtime', 'data'],
        type: 'Operating Expenses'
    },
    'Travel & Accommodation': {
        keywords: ['uber', 'bolt', 'taxi', 'flight', 'hotel', 'accommodation', 'airbnb', 'booking.com', 'travel'],
        type: 'Operating Expenses'
    },
    'Utilities': {
        keywords: ['electricity', 'water', 'eskom', 'city power', 'municipality'],
        type: 'Operating Expenses'
    },
    'VAT': {
        keywords: ['vat payment', 'sars', 'tax payment'],
        type: 'Tax'
    }
}

/**
 * Categorize a transaction using AI/ML approach
 */
export async function categorizeTransaction(
    description: string,
    vendor: string | null,
    amount: number,
    companyId: string
): Promise<CategorizationResult> {
    // Step 1: Try exact vendor match from history
    const exactMatch = await findExactVendorMatch(vendor, companyId)
    if (exactMatch) {
        return {
            category: exactMatch.category,
            confidence: 0.95,
            reasons: [`Exact match: "${vendor}" previously categorized as ${exactMatch.category}`]
        }
    }

    // Step 2: Try fuzzy vendor match
    const fuzzyMatch = await findFuzzyVendorMatch(vendor, companyId)
    if (fuzzyMatch && fuzzyMatch.confidence > 0.8) {
        return {
            category: fuzzyMatch.category,
            confidence: fuzzyMatch.confidence,
            reasons: [`Similar vendor: "${fuzzyMatch.matchedVendor}" (${Math.round(fuzzyMatch.confidence * 100)}% match)`]
        }
    }

    // Step 3: Keyword-based pattern matching
    const patternMatch = matchByKeywords(description, vendor)
    if (patternMatch.confidence > 0.7) {
        return patternMatch
    }

    // Step 4: Learn from company's transaction history
    const learnedCategory = await learnFromHistory(description, vendor, amount, companyId)
    if (learnedCategory) {
        return learnedCategory
    }

    // Step 5: Default fallback
    return {
        category: amount > 0 ? 'Other Income' : 'Other',
        confidence: 0.3,
        reasons: ['No matching pattern found - needs manual categorization'],
        alternativeCategories: getSuggestedCategories(description, vendor, amount)
    }
}

/**
 * Find exact vendor match from previous transactions
 */
async function findExactVendorMatch(
    vendor: string | null,
    companyId: string
): Promise<{ category: string } | null> {
    if (!vendor) return null

    const { data } = await supabase
        .from('expenses')
        .select('category')
        .eq('company_id', companyId)
        .ilike('vendor', vendor.trim())
        .limit(1)

    return data && data.length > 0 ? { category: data[0].category } : null
}

/**
 * Find fuzzy vendor match using similarity
 */
async function findFuzzyVendorMatch(
    vendor: string | null,
    companyId: string
): Promise<{ category: string; matchedVendor: string; confidence: number } | null> {
    if (!vendor) return null

    const { data: expenses } = await supabase
        .from('expenses')
        .select('vendor, category')
        .eq('company_id', companyId)
        .not('vendor', 'is', null)
        .limit(100)

    if (!expenses || expenses.length === 0) return null

    let bestMatch: { category: string; matchedVendor: string; confidence: number } | null = null

    for (const expense of expenses) {
        if (expense.vendor) {
            const similarity = stringSimilarity(vendor.toLowerCase(), expense.vendor.toLowerCase())
            if (similarity > 0.8 && (!bestMatch || similarity > bestMatch.confidence)) {
                bestMatch = {
                    category: expense.category,
                    matchedVendor: expense.vendor,
                    confidence: similarity
                }
            }
        }
    }

    return bestMatch
}

/**
 * Match by keyword patterns
 */
function matchByKeywords(description: string, vendor: string | null): CategorizationResult {
    const text = `${description} ${vendor || ''}`.toLowerCase()
    const matches: Array<{ category: string; matchCount: number; matchedKeywords: string[] }> = []

    for (const [category, pattern] of Object.entries(CATEGORY_PATTERNS)) {
        const matchedKeywords = pattern.keywords.filter(keyword => text.includes(keyword.toLowerCase()))
        if (matchedKeywords.length > 0) {
            matches.push({
                category,
                matchCount: matchedKeywords.length,
                matchedKeywords
            })
        }
    }

    if (matches.length === 0) {
        return {
            category: 'Other',
            confidence: 0,
            reasons: []
        }
    }

    // Sort by match count
    matches.sort((a, b) => b.matchCount - a.matchCount)
    const topMatch = matches[0]

    return {
        category: topMatch.category,
        confidence: Math.min(0.7 + (topMatch.matchCount * 0.1), 0.95),
        reasons: [`Matched keywords: ${topMatch.matchedKeywords.join(', ')}`],
        alternativeCategories: matches.slice(1, 3).map(m => ({
            category: m.category,
            confidence: Math.min(0.6 + (m.matchCount * 0.1), 0.9)
        }))
    }
}

/**
 * Learn from company's transaction history
 */
async function learnFromHistory(
    description: string,
    vendor: string | null,
    amount: number,
    companyId: string
): Promise<CategorizationResult | null> {
    // Get similar descriptions from history
    const { data: similarExpenses } = await supabase
        .from('expenses')
        .select('description, category')
        .eq('company_id', companyId)
        .limit(50)

    if (!similarExpenses || similarExpenses.length === 0) return null

    const descWords = description.toLowerCase().split(/\s+/)
    const categoryScores: Record<string, number> = {}

    for (const expense of similarExpenses) {
        const expWords = expense.description.toLowerCase().split(/\s+/)
        const commonWords = descWords.filter(w => expWords.includes(w) && w.length > 3)

        if (commonWords.length > 0) {
            categoryScores[expense.category] = (categoryScores[expense.category] || 0) + commonWords.length
        }
    }

    const topCategory = Object.entries(categoryScores)
        .sort((a, b) => b[1] - a[1])[0]

    if (topCategory && topCategory[1] > 2) {
        return {
            category: topCategory[0],
            confidence: Math.min(0.6 + (topCategory[1] * 0.05), 0.85),
            reasons: ['Learned from similar transactions in your history']
        }
    }

    return null
}

/**
 * String similarity (Levenshtein distance based)
 */
function stringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1

    if (longer.length === 0) return 1.0

    const editDistance = levenshteinDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
}

/**
 * Levenshtein distance calculation
 */
function levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = []

    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i]
    }

    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j
    }

    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1]
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                )
            }
        }
    }

    return matrix[str2.length][str1.length]
}

/**
 * Get suggested alternative categories
 */
function getSuggestedCategories(
    description: string,
    vendor: string | null,
    amount: number
): Array<{ category: string; confidence: number }> {
    if (amount > 0) {
        return [
            { category: 'Sales Revenue', confidence: 0.5 },
            { category: 'Other Income', confidence: 0.4 }
        ]
    } else {
        return [
            { category: 'Office Supplies', confidence: 0.3 },
            { category: 'Other', confidence: 0.3 }
        ]
    }
}

/**
 * Batch categorize transactions
 */
export async function batchCategorizeTransactions(
    companyId: string,
    limit: number = 50
): Promise<{ categorized: number; failed: number }> {
    // Get uncategorized expenses
    const { data: expenses } = await supabase
        .from('expenses')
        .select('id, description, vendor, amount')
        .eq('company_id', companyId)
        .or('category.is.null,category.eq.Other')
        .limit(limit)

    if (!expenses || expenses.length === 0) {
        return { categorized: 0, failed: 0 }
    }

    let categorized = 0
    let failed = 0

    for (const expense of expenses) {
        try {
            const result = await categorizeTransaction(
                expense.description,
                expense.vendor,
                expense.amount,
                companyId
            )

            if (result.confidence > 0.7) {
                await supabase
                    .from('expenses')
                    .update({ category: result.category })
                    .eq('id', expense.id)

                categorized++
            }
        } catch (error) {
            console.error('Error categorizing expense:', error)
            failed++
        }
    }

    return { categorized, failed }
}
