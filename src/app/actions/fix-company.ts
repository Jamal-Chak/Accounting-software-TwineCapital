'use server'

import { getAuthenticatedClient } from '@/lib/auth/database-helpers'

export async function createCompanyForCurrentUser() {
    const { supabase, user } = await getAuthenticatedClient()

    if (!supabase || !user) {
        return { success: false, error: 'Not authenticated' }
    }

    // Check if user already has a company
    const { data: existing } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (existing) {
        return { success: true, message: 'Company already exists', companyId: existing.id }
    }

    // Create company
    const { data: company, error } = await supabase
        .from('companies')
        .insert({
            user_id: user.id,
            name: 'My Company',
            country: 'South Africa',
            currency: 'ZAR',
            vat_number: '',
            settings: {}
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating company:', error)
        return { success: false, error: error.message }
    }

    return { success: true, message: 'Company created', companyId: company.id }
}
