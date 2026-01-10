'use server'

import { getAuthenticatedClient, getCurrentCompanyId } from '@/lib/auth/database-helpers'
import type { Client } from '@/lib/database'

/**
 * Create a new client
 */
export async function createClient(client: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'company_id'>) {
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
            .from('clients')
            .insert([{ ...client, company_id: companyId }])
            .select()
            .single()

        if (error) {
            console.error('Error creating client:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data }
    } catch (error) {
        console.error('Unexpected error in createClient:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

/**
 * Update a client
 */
export async function updateClient(
    id: string,
    updates: Partial<Omit<Client, 'id' | 'company_id' | 'created_at' | 'updated_at'>>
) {
    const { supabase, user } = await getAuthenticatedClient()
    if (!supabase || !user) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        const { data, error } = await supabase
            .from('clients')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating client:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data }
    } catch (error) {
        console.error('Unexpected error in updateClient:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

/**
 * Delete a client
 */
export async function deleteClient(id: string) {
    const { supabase, user } = await getAuthenticatedClient()
    if (!supabase || !user) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        const { error } = await supabase
            .from('clients')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting client:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (error) {
        console.error('Unexpected error in deleteClient:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}
