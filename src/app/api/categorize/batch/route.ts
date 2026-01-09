import { NextRequest, NextResponse } from 'next/server'
import { batchCategorizeTransactions } from '@/lib/categorization'
import { getCompanyId } from '@/lib/database'

/**
 * POST /api/categorize/batch
 * Auto-categorize uncategorized transactions
 */
export async function POST(request: NextRequest) {
    try {
        const companyId = await getCompanyId()
        if (!companyId) {
            return NextResponse.json(
                { error: 'Company not found' },
                { status: 404 }
            )
        }

        const { limit = 50 } = await request.json()

        const result = await batchCategorizeTransactions(companyId, limit)

        return NextResponse.json({
            success: true,
            ...result
        })
    } catch (error) {
        console.error('Batch categorization error:', error)
        return NextResponse.json(
            { error: 'Failed to categorize transactions' },
            { status: 500 }
        )
    }
}
