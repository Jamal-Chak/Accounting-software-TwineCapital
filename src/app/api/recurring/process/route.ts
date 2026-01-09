import { NextRequest, NextResponse } from 'next/server'
import { processDueProfiles } from '@/lib/recurring'
import { getCompanyId } from '@/lib/database'

/**
 * POST /api/recurring/process
 * Process all due recurring invoices for the company
 * This endpoint should be called by a cron job daily
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

        const result = await processDueProfiles()

        return NextResponse.json({
            success: true,
            ...result
        })
    } catch (error) {
        console.error('Recurring invoice processing error:', error)
        return NextResponse.json(
            { error: 'Failed to process recurring invoices' },
            { status: 500 }
        )
    }
}

/**
 * GET /api/recurring/process
 * Get status of last processing run
 */
export async function GET(request: NextRequest) {
    try {
        const companyId = await getCompanyId()
        if (!companyId) {
            return NextResponse.json(
                { error: 'Company not found' },
                { status: 404 }
            )
        }

        // Return upcoming due invoices
        const { supabase } = await import('@/lib/supabase')
        const today = new Date().toISOString().split('T')[0]

        const { data: upcoming, count } = await supabase
            .from('recurring_invoices')
            .select('*, client:clients(name)', { count: 'exact' })
            .eq('company_id', companyId)
            .eq('is_active', true)
            .lte('next_billing_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

        return NextResponse.json({
            upcoming: upcoming || [],
            count: count || 0
        })
    } catch (error) {
        console.error('Error fetching upcoming recurring invoices:', error)
        return NextResponse.json(
            { error: 'Failed to fetch recurring invoices' },
            { status: 500 }
        )
    }
}
