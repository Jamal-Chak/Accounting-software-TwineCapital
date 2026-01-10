'use server'

import { createClient } from '@/lib/auth/supabase-server'

/**
 * Get authenticated Supabase client and current user
 * Returns null if user is not authenticated
 */
export async function getAuthenticatedClient() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        return { supabase: null, user: null, error: 'Unauthorized' }
    }

    return { supabase, user, error: null }
}

/**
 * Get the current user's company ID
 * Returns null if user doesn't have a company
 */
export async function getCurrentCompanyId(): Promise<string | null> {
    const { supabase, user, error } = await getAuthenticatedClient()
    if (error || !supabase || !user) return null

    // Get user's company
    const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single()

    return company?.id || null
}

/**
 * Get the current user's company with full details
 */
export async function getCurrentCompany() {
    const { supabase, user, error } = await getAuthenticatedClient()
    if (error || !supabase || !user) return null

    const { data: company } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .single()

    return company
}
