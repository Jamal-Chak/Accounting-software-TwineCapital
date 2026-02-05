'use server'

import { getAuthenticatedClient, getCurrentCompanyId } from '@/lib/auth/database-helpers'

export async function updateBankingSettings(settings: {
    autoMatchEnabled: boolean
    matchThreshold: number
    reconciliationFrequency: 'daily' | 'weekly' | 'monthly'
}) {
    const { supabase, user } = await getAuthenticatedClient()
    if (!supabase || !user) return { success: false, error: 'Unauthorized' }

    const companyId = await getCurrentCompanyId()
    if (!companyId) return { success: false, error: 'No company found' }

    try {
        // Fetch existing settings first
        const { data: company, error: fetchError } = await supabase
            .from('companies')
            .select('settings')
            .eq('id', companyId)
            .single()

        if (fetchError) throw fetchError

        // Merge with existing settings
        const currentSettings = company.settings || {}
        const newSettings = {
            ...currentSettings,
            banking: settings
        }

        const { error: updateError } = await supabase
            .from('companies')
            .update({ settings: newSettings })
            .eq('id', companyId)

        if (updateError) throw updateError

        return { success: true }
    } catch (error) {
        console.error('Error updating settings:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

export async function deleteBankConnection(id: string) {
    const { supabase, user } = await getAuthenticatedClient()
    if (!supabase || !user) return { success: false, error: 'Unauthorized' }

    try {
        const { error } = await supabase
            .from('bank_connections')
            .delete()
            .eq('id', id)

        if (error) throw error

        return { success: true }
    } catch (error) {
        console.error('Error deleting bank connection:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}
