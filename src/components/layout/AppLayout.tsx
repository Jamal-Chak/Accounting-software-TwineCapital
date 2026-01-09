'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { UserMenu } from './UserMenu'
import Link from 'next/link'
import { Header } from './Header'

interface AppLayoutProps {
    children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
    const pathname = usePathname()
    const isLandingPage = pathname === '/'

    if (isLandingPage) {
        return <>{children}</>
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <Header />

            {/* Main Content */}
            <main className="ml-60 mt-16 p-8">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
