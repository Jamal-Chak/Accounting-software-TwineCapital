import { NextRequest, NextResponse } from 'next/server'
import { getCompanyId } from '@/lib/database'
import { supabase } from '@/lib/supabase'
import type { ExtractedData } from '@/lib/ocr'

/**
 * POST /api/documents/create-expense
 * Create an expense from extracted document data
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

        const body = await request.json()
        const { extractedData, documentUrl, fileName } = body as {
            extractedData: ExtractedData
            documentUrl?: string
            fileName?: string
        }

        // Validate required fields
        if (!extractedData.amount || !extractedData.date) {
            return NextResponse.json(
                { error: 'Missing required fields: amount and date' },
                { status: 400 }
            )
        }

        // Calculate amounts
        const totalAmount = extractedData.amount
        const taxAmount = extractedData.taxAmount || (totalAmount * 0.15 / 1.15)
        const baseAmount = totalAmount - taxAmount

        // Create expense
        const { data: expense, error: expenseError } = await supabase
            .from('expenses')
            .insert({
                company_id: companyId,
                description: extractedData.vendor || 'Scanned document',
                amount: baseAmount,
                category: extractedData.category || 'General Expenses',
                date: extractedData.date,
                vendor: extractedData.vendor,
                tax_rate: 15.00,
                tax_amount: taxAmount,
                total_amount: totalAmount,
                status: 'approved'
            })
            .select()
            .single()

        if (expenseError) {
            console.error('Error creating expense:', expenseError)
            return NextResponse.json(
                { error: 'Failed to create expense' },
                { status: 500 }
            )
        }

        // Save document upload record
        if (documentUrl) {
            await supabase
                .from('document_uploads')
                .insert({
                    company_id: companyId,
                    file_name: fileName || 'uploaded_document',
                    file_url: documentUrl,
                    file_type: 'image/jpeg',
                    ocr_status: 'completed',
                    raw_text: extractedData.rawText,
                    extracted_data: extractedData,
                    confidence_score: extractedData.confidence,
                    expense_id: expense.id,
                    review_status: extractedData.confidence >= 0.85 ? 'approved' : 'pending',
                    processed_at: new Date().toISOString()
                })
        }

        return NextResponse.json({
            success: true,
            expense,
            message: 'Expense created successfully'
        })
    } catch (error) {
        console.error('Create expense error:', error)
        return NextResponse.json(
            { error: 'Failed to create expense' },
            { status: 500 }
        )
    }
}
