import { NextRequest, NextResponse } from 'next/server'
import { generateVAT201Form, getCurrentVATPeriod } from '@/lib/vat'
import { getCompanyId } from '@/lib/database'

/**
 * GET /api/vat/vat201?period=current
 * Generate VAT201 form data
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
            const [start, end] = period.split('_')
            startDate = start
            endDate = end
        }

        const vat201 = await generateVAT201Form(companyId, startDate, endDate)

        return NextResponse.json(vat201)
    } catch (error) {
        console.error('VAT201 generation error:', error)
        return NextResponse.json(
            { error: 'Failed to generate VAT201 form' },
            { status: 500 }
        )
    }
}
