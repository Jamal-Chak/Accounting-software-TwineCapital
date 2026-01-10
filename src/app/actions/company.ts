'use server'

import { createClient } from '@/lib/auth/supabase-server'
import { getAuthenticatedClient } from '@/lib/auth/database-helpers'
import type { Company, CompanySettings } from '@/lib/database'

export async function updateCompanySettings(companyId: string, settings: CompanySettings) {
    try {
        const supabase = await createClient()

        // Verify user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return { success: false, error: 'Unauthorized' }
        }

        // Update company settings
        const { data, error } = await supabase
            .from('companies')
            .update({ settings })
            .eq('id', companyId)
            .eq('user_id', user.id) // Ensure user owns this company
            .select()
            .single()

        if (error) {
            console.error('Error updating company settings:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data }
    } catch (error) {
        console.error('Error in updateCompanySettings:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

/**
 * Update company information (name, VAT number, country, currency)
 */
export async function updateCompanyInfo(companyId: string, updates: {
    name?: string
    vat_number?: string | null
    country?: string
    currency?: string
}) {
    const { supabase, user } = await getAuthenticatedClient()
    if (!supabase || !user) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        const { data, error } = await supabase
            .from('companies')
            .update(updates)
            .eq('id', companyId)
            .eq('user_id', user.id)
            .select()
            .single()

        if (error) {
            console.error('Error updating company info:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data }
    } catch (error) {
        console.error('Unexpected error in updateCompanyInfo:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}
