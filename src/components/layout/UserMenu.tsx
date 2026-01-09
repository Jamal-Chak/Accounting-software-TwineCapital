'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, User, Settings, ChevronDown } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/auth/supabase-client'

export function UserMenu() {
    const [isOpen, setIsOpen] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const toast = useToast()

    useEffect(() => {
        const getUser = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()
    }, [])

    const handleLogout = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST'
            })

            if (response.ok) {
                toast.success('Signed out', 'You have been logged out successfully')
                router.push('/')
            } else {
                throw new Error('Logout failed')
            }
        } catch (error) {
            console.error('Logout error:', error)
            toast.error('Logout failed', 'Please try again')
        } finally {
            setLoading(false)
        }
    }

    if (!user) return null

    const initials = user.user_metadata?.full_name
        ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)
        : user.email?.substring(0, 2).toUpperCase()

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
                    {initials}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user.user_metadata?.full_name || user.email}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1">
                        <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900">
                                {user.user_metadata?.full_name || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>

                        <Link
                            href="/settings"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <Settings className="w-4 h-4" />
                            Settings
                        </Link>

                        <button
                            onClick={handleLogout}
                            disabled={loading}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                            <LogOut className="w-4 h-4" />
                            {loading ? 'Signing out...' : 'Sign out'}
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}
