import { NextRequest, NextResponse } from 'next/server'
import { autoReconcileTransactions } from '@/lib/reconciliation'
import { getCompanyId } from '@/lib/database'

export async function POST(request: NextRequest) {
    try {
        const { threshold } = await request.json()

        const companyId = await getCompanyId()
        if (!companyId) {
            return NextResponse.json(
                { error: 'Company not found' },
                { status: 404 }
            )
        }

        const result = await autoReconcileTransactions(
            companyId,
            threshold || 0.85
        )

        return NextResponse.json(result)
    } catch (error) {
        console.error('Auto-reconciliation error:', error)
        return NextResponse.json(
            { error: 'Failed to auto-reconcile transactions' },
            { status: 500 }
        )
    }
}
