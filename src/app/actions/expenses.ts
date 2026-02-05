'use server'

import { getAuthenticatedClient, getCurrentCompanyId } from '@/lib/auth/database-helpers'
import type { Expense } from '@/lib/database'

/**
 * Create a new expense
 */
export async function createExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at' | 'company_id'>) {
    const { supabase, user } = await getAuthenticatedClient()
    if (!supabase || !user) {
        return { success: false, error: 'Unauthorized' }
    }

    const companyId = await getCurrentCompanyId()
    if (!companyId) {
        return { success: false, error: 'No company found' }
    }

    try {
        const { data, error } = await supabase
            .from('expenses')
            .insert([{ ...expense, company_id: companyId }])
            .select()
            .single()

        if (error) {
            console.error('Error creating expense:', error)
            return { success: false, error: error.message }
        }

        // Post to journal
        const { postExpenseJournal } = await import('@/lib/journal')
        // Determine account codes based on category if possible, for now use defaults
        // In a real app, you'd look up the account code mapped to the category

        const journalResult = await postExpenseJournal(
            companyId,
            data.id,
            data.date,
            data.total_amount,
            data.tax_amount,
            data.description || 'Expense'
        )

        if (!journalResult.success) {
            console.error('Warning: Expense created but journal entry failed:', journalResult.error)
            // We return success: true because the expense ITSELF was saved, 
            // but we might want to flag this to the user or admin
        }

        return { success: true, data }
    } catch (error) {
        console.error('Unexpected error in createExpense:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

/**
 * Update an expense
 */
export async function updateExpense(
    id: string,
    updates: Partial<Omit<Expense, 'id' | 'company_id' | 'created_at' | 'updated_at'>>
) {
    const { supabase, user } = await getAuthenticatedClient()
    if (!supabase || !user) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        const { data, error } = await supabase
            .from('expenses')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating expense:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data }
    } catch (error) {
        console.error('Unexpected error in updateExpense:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

/**
 * Delete an expense
 */
export async function deleteExpense(id: string) {
    const { supabase, user } = await getAuthenticatedClient()
    if (!supabase || !user) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        const { error } = await supabase
            .from('expenses')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting expense:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (error) {
        console.error('Unexpected error in deleteExpense:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}
