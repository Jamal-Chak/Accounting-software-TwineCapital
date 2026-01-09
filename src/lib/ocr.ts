import Tesseract from 'tesseract.js'

/**
 * Extracted document data interface
 */
export interface ExtractedData {
    vendor: string | null
    date: string | null
    amount: number | null
    taxAmount: number | null
    items: Array<{ description: string; amount: number }>
    confidence: number // 0-1
    rawText: string
    category?: string
}

/**
 * OCR Processing result
 */
export interface OCRResult {
    success: boolean
    data: ExtractedData | null
    error?: string
}

/**
 * Process image file with OCR
 */
export async function processDocumentOCR(
    file: File,
    onProgress?: (progress: number) => void
): Promise<OCRResult> {
    try {
        // Run OCR
        const result = await Tesseract.recognize(file, 'eng', {
            logger: (m) => {
                if (m.status === 'recognizing text' && onProgress) {
                    onProgress(m.progress)
                }
            }
        })

        const rawText = result.data.text
        const confidence = result.data.confidence / 100 // Convert to 0-1 scale

        // Extract structured data
        const extractedData = extractDataFromText(rawText, confidence)

        return {
            success: true,
            data: extractedData
        }
    } catch (error) {
        console.error('OCR processing error:', error)
        return {
            success: false,
            data: null,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

/**
 * Extract structured data from OCR text
 */
function extractDataFromText(text: string, ocrConfidence: number): ExtractedData {
    const lines = text.split('\n').filter(line => line.trim().length > 0)

    return {
        vendor: extractVendor(lines),
        date: extractDate(text),
        amount: extractTotalAmount(text),
        taxAmount: extractTaxAmount(text),
        items: extractLineItems(text),
        confidence: calculateConfidence(text, ocrConfidence),
        rawText: text,
        category: suggestCategory(text)
    }
}

/**
 * Extract vendor name (usually first few lines)
 */
function extractVendor(lines: string[]): string | null {
    // Vendor is typically in the first 3 lines
    const topLines = lines.slice(0, 3)

    // Look for lines with company indicators
    for (const line of topLines) {
        if (
            line.length > 3 &&
            line.length < 50 &&
            !line.match(/\d{2}[\/\-]\d{2}[\/\-]\d{2,4}/) && // Not a date
            !line.match(/R?\s*\d+[.,]\d{2}/) // Not an amount
        ) {
            return line.trim()
        }
    }

    return topLines[0]?.trim() || null
}

/**
 * Extract date from text
 */
function extractDate(text: string): string | null {
    // Multiple date formats
    const datePatterns = [
        /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/, // DD/MM/YYYY or MM/DD/YYYY
        /\b(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\b/, // YYYY-MM-DD
        /\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{2,4})\b/i
    ]

    for (const pattern of datePatterns) {
        const match = text.match(pattern)
        if (match) {
            try {
                // Try to parse and format as YYYY-MM-DD
                const dateStr = match[0]
                const parsed = new Date(dateStr)
                if (!isNaN(parsed.getTime())) {
                    return parsed.toISOString().split('T')[0]
                }
            } catch (e) {
                continue
            }
        }
    }

    return null
}

/**
 * Extract total amount
 */
function extractTotalAmount(text: string): number | null {
    // Look for "Total", "Amount Due", etc.
    const totalPatterns = [
        /(?:total|amount\s+due|balance)[:\s]*R?\s*(\d+[.,]\d{2})/i,
        /R\s*(\d+[.,]\d{2})\s*(?:total|due)/i,
        /(?:^|\n)\s*R?\s*(\d+[.,]\d{2})\s*$/m // Last amount on a line
    ]

    for (const pattern of totalPatterns) {
        const match = text.match(pattern)
        if (match) {
            const amount = parseFloat(match[1].replace(',', ''))
            if (amount > 0 && amount < 1000000) { // Sanity check
                return amount
            }
        }
    }

    // Fallback: find largest amount
    const amounts = text.match(/R?\s*(\d+[.,]\d{2})/g)
    if (amounts) {
        const numbers = amounts.map(a => parseFloat(a.replace(/[R,\s]/g, '')))
        return Math.max(...numbers)
    }

    return null
}

/**
 * Extract tax/VAT amount
 */
function extractTaxAmount(text: string): number | null {
    const taxPatterns = [
        /(?:vat|tax|gst)[:\s]*R?\s*(\d+[.,]\d{2})/i,
        /R?\s*(\d+[.,]\d{2})\s*(?:vat|tax)/i
    ]

    for (const pattern of taxPatterns) {
        const match = text.match(pattern)
        if (match) {
            return parseFloat(match[1].replace(',', ''))
        }
    }

    // Try to calculate from 15% of total
    const total = extractTotalAmount(text)
    if (total) {
        const calculatedVat = total * 0.15 / 1.15
        return Math.round(calculatedVat * 100) / 100
    }

    return null
}

/**
 * Extract line items
 */
function extractLineItems(text: string): Array<{ description: string; amount: number }> {
    const items: Array<{ description: string; amount: number }> = []
    const lines = text.split('\n')

    for (const line of lines) {
        // Look for lines with description and amount
        const match = line.match(/^(.+?)\s+R?\s*(\d+[.,]\d{2})$/)
        if (match) {
            const description = match[1].trim()
            const amount = parseFloat(match[2].replace(',', ''))

            if (description.length > 2 && amount > 0 && amount < 100000) {
                items.push({ description, amount })
            }
        }
    }

    return items.slice(0, 20) // Max 20 items
}

/**
 * Calculate overall confidence score
 */
function calculateConfidence(text: string, ocrConfidence: number): number {
    let score = ocrConfidence * 0.4 // OCR quality: 40%

    // Completeness: 30%
    const hasVendor = extractVendor(text.split('\n')) !== null
    const hasDate = extractDate(text) !== null
    const hasAmount = extractTotalAmount(text) !== null

    const completeness = [hasVendor, hasDate, hasAmount].filter(Boolean).length / 3
    score += completeness * 0.3

    // Pattern matching: 30%
    const hasVatKeyword = /vat|tax/i.test(text)
    const hasTotal = /total|amount\s+due/i.test(text)
    const hasDatePattern = /\d{2}[\/\-]\d{2}[\/\-]\d{2,4}/.test(text)

    const patterns = [hasVatKeyword, hasTotal, hasDatePattern].filter(Boolean).length / 3
    score += patterns * 0.3

    return Math.min(Math.max(score, 0), 1) // Clamp to 0-1
}

/**
 * Suggest expense category based on content
 */
function suggestCategory(text: string): string {
    const textLower = text.toLowerCase()

    const categories = [
        { keywords: ['fuel', 'petrol', 'diesel', 'gas'], category: 'Fuel' },
        { keywords: ['food', 'restaurant', 'cafe', 'coffee'], category: 'Meals & Entertainment' },
        { keywords: ['office', 'stationery', 'supplies'], category: 'Office Supplies' },
        { keywords: ['internet', 'wifi', 'hosting', 'domain'], category: 'Internet & Telecoms' },
        { keywords: ['taxi', 'uber', 'bolt', 'transport'], category: 'Travel' },
        { keywords: ['hotel', 'accommodation', 'airbnb'], category: 'Accommodation' },
        { keywords: ['software', 'subscription', 'saas'], category: 'Software & Subscriptions' }
    ]

    for (const { keywords, category } of categories) {
        if (keywords.some(keyword => textLower.includes(keyword))) {
            return category
        }
    }

    return 'General Expenses'
}

/**
 * Get confidence level classification
 */
export function getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' {
    if (confidence >= 0.85) return 'high'
    if (confidence >= 0.65) return 'medium'
    return 'low'
}
