import { NextRequest, NextResponse } from 'next/server'
import { calculateVATForPeriod, generateVAT201Form, getCurrentVATPeriod } from '@/lib/vat'
import { getCompanyId } from '@/lib/database'

/**
 * GET /api/vat/summary?period=current
 * Calculate VAT summary for a period
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const period = searchParams.get('period') || 'current'

        const companyId = await getCompanyId()
        if (!companyId) {
            return NextResponse.json(
                { error: 'Company not found' },
                { status: 404 }
            )
        }

        // Determine period dates
        let startDate: string, endDate: string
        if (period === 'current') {
            const currentPeriod = getCurrentVATPeriod()
            startDate = currentPeriod.startDate
            endDate = currentPeriod.endDate
        } else {
            // Custom period format: "2024-01-01_2024-02-29"
            const [start, end] = period.split('_')
            startDate = start
            endDate = end
        }

        const summary = await calculateVATForPeriod(companyId, startDate, endDate)

        return NextResponse.json(summary)
    } catch (error) {
        console.error('VAT summary error:', error)
        return NextResponse.json(
            { error: 'Failed to calculate VAT summary' },
            { status: 500 }
        )
    }
}
