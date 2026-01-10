'use client'

import { useState, useEffect } from 'react'
import { getCompany, getTaxRates } from '@/app/actions/data'
import { updateCompanySettings } from '@/app/actions/company'
import { getIntegrationsStatus } from './actions'
import { SettingsLayout } from '@/components/settings/SettingsLayout'
import { OrganizationSettings } from '@/components/settings/OrganizationSettings'
import { TaxSettingsModal } from '@/components/settings/TaxSettingsModal'
import { BankingSettings } from '@/components/settings/BankingSettings'
import { IntelligenceSettings } from '@/components/settings/IntelligenceSettings'
import { InventorySettings } from '@/components/settings/InventorySettings'
import { UserManagementSettings } from '@/components/settings/UserManagementSettings'
import { NotificationSettings } from '@/components/settings/NotificationSettings'
import { Database, Network, Globe } from 'lucide-react'
import type { Company, TaxRate } from '@/lib/database'

// Placeholder components for other sections to keep the file clean
function PlaceholderSection({ title, description }: { title: string, description: string }) {
    return (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200 border-dashed">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">{description}</p>
        </div>
    )
}

export default function SettingsPage() {
    const [company, setCompany] = useState<Company | null>(null)
    const [taxRates, setTaxRates] = useState<TaxRate[]>([])
    const [integrations, setIntegrations] = useState<{ gemini: boolean; resend: boolean }>({ gemini: false, resend: false })
    const [seeding, setSeeding] = useState(false)
    // Keep track of tax modal separately as it's a sub-feature of Accounting
    const [showTaxModal, setShowTaxModal] = useState(false)


    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        const companyData = await getCompany()
        setCompany(companyData)

        const rates = await getTaxRates()
        setTaxRates(rates)

        const status = await getIntegrationsStatus()
        setIntegrations(status)
    }

    const handleSaveCompany = async (updates: Partial<Company>) => {
        if (!company || !updates.settings) return
        const result = await updateCompanySettings(company.id, updates.settings)
        if (result.success) {
            await loadData()
        }
    }

    const handleSeedData = async () => {
        if (!confirm('This will add sample clients and transactions to your database. Continue?')) return

        setSeeding(true)
        try {
            // TODO: Implement server action for seeding sample data
            alert('Sample data seeding temporarily disabled - will be re-enabled soon')
        } catch (error) {
            console.error('Error seeding data:', error)
            alert('Failed to add sample data.')
        } finally {
            setSeeding(false)
        }
    }

    return (
        <>
            <SettingsLayout>
                {(activeSection) => {
                    switch (activeSection) {
                        case 'org':
                            return <OrganizationSettings company={company} onSave={handleSaveCompany} />

                        case 'accounting':
                            return (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-medium leading-6 text-gray-900">Accounting Configuration</h3>
                                        <p className="mt-1 text-sm text-gray-500">Manage chart of accounts, tax rules, and journal policies.</p>
                                    </div>

                                    <div className="bg-white shadow rounded-lg divide-y divide-gray-200 border border-gray-200">
                                        <div className="p-6 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                    <Globe className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-900">Tax Rates & VAT</h4>
                                                    <p className="text-sm text-gray-500">Configure standard, zero-rated, and custom tax rates.</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setShowTaxModal(true)}
                                                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                Manage Rates
                                            </button>
                                        </div>
                                        {/* Additional accounting settings would go here */}
                                    </div>
                                </div>
                            )

                        case 'inventory':
                            return <InventorySettings company={company} onSave={handleSaveCompany} />

                        case 'intelligence':
                            return <IntelligenceSettings company={company} onSave={handleSaveCompany} />

                        case 'banking':
                            return <BankingSettings />

                        case 'users':
                            return <UserManagementSettings />

                        case 'notifications':
                            return <NotificationSettings company={company} onSave={handleSaveCompany} />

                        case 'developer':
                            return (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-medium leading-6 text-gray-900">Developer Settings</h3>
                                        <p className="mt-1 text-sm text-gray-500">Manage API keys and system integrations.</p>
                                    </div>
                                    <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
                                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                            <h3 className="text-sm font-medium text-gray-900">System Integrations</h3>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Network className="w-5 h-5 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">Google Gemini AI</p>
                                                        <p className="text-xs text-gray-500">Powers the AI CFO and document scanning.</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${integrations.gemini ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {integrations.gemini ? 'Connected' : 'Missing Key'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Network className="w-5 h-5 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">Resend Email</p>
                                                        <p className="text-xs text-gray-500">Powers transactional emails and invoices.</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${integrations.resend ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {integrations.resend ? 'Connected' : 'Missing Key'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )

                        case 'data':
                            return (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-medium leading-6 text-gray-900">Data Management</h3>
                                        <p className="mt-1 text-sm text-gray-500">Manage demo data and system resets.</p>
                                    </div>
                                    <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-gray-100 rounded-lg">
                                                <Database className="w-5 h-5 text-gray-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900 mb-1">Seed Sample Data</h4>
                                                <p className="text-sm text-gray-500 mb-4">Add demo clients, invoices, and transactions to explore the platform features.</p>
                                                <button
                                                    onClick={handleSeedData}
                                                    disabled={seeding}
                                                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors disabled:opacity-50"
                                                >
                                                    {seeding ? 'Seeding Data...' : 'Seed Sample Data'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )

                        default:
                            return <PlaceholderSection title="Coming Soon" description="This settings module is currently under development." />
                    }
                }}
            </SettingsLayout>

            {/* Tax Modal (kept as a modal for now for UX continuity) */}
            {showTaxModal && company && (
                <TaxSettingsModal
                    companyId={company.id}
                    taxRates={taxRates}
                    onClose={() => setShowTaxModal(false)}
                    onRefresh={loadData}
                />
            )}
        </>
    )
}
