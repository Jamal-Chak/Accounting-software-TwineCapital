'use client'

import { useState } from 'react'
import { SettingsSidebar } from './SettingsSidebar'
import { PageHeader } from '@/components/layout/PageHeader'

interface SettingsLayoutProps {
    children: (activeSection: string) => React.ReactNode
}

export function SettingsLayout({ children }: SettingsLayoutProps) {
    const [activeSection, setActiveSection] = useState('org')

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="border-b border-gray-200 bg-white">
                <PageHeader
                    title="Settings"
                    description="Manage your organization, accounting rules, and intelligence preferences."
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Settings' }
                    ]}
                />
            </div>

            <div className="flex flex-1 overflow-hidden">
                <SettingsSidebar activeSection={activeSection} onSelect={setActiveSection} />
                <main className="flex-1 overflow-y-auto p-8 max-w-5xl">
                    {children(activeSection)}
                </main>
            </div>
        </div>
    )
}
