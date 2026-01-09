
/**
 * Currency Service
 * Handles exchange rate lookups and conversions.
 * 
 * Note: In a production environment, this would connect to a live API like default_api.
 * For this demo, we use hardcoded rates updated daily.
 */

const EXCHANGE_RATES: Record<string, number> = {
    'ZAR': 1.0,
    'USD': 18.24,
    'EUR': 19.85,
    'GBP': 23.12,
    'AUD': 12.05
}

export interface Currency {
    code: string
    symbol: string
    name: string
}

export const SUPPORTED_CURRENCIES: Currency[] = [
    { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
]

/**
 * Get exchange rate from source currency to ZAR (Base)
 */
export async function getExchangeRate(fromCurrency: string): Promise<number> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))

    const rate = EXCHANGE_RATES[fromCurrency]
    if (!rate) {
        throw new Error(`Currency ${fromCurrency} not supported`)
    }
    return rate
}

/**
 * Convert amount to base currency (ZAR)
 */
export function convertToBase(amount: number, rate: number): number {
    return amount * rate
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currencyCode: string): string {
    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: currencyCode
    }).format(amount)
}
