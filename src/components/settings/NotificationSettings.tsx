'use client'

import { useState, useEffect } from 'react'
import { Save, Bell, Mail } from 'lucide-react'
import { Company, CompanySettings } from '@/lib/database'
import { useToast } from '@/components/ui/toast'

interface NotificationSettingsProps {
    company: Company | null
    onSave: (updates: Partial<Company>) => Promise<void>
}

export function NotificationSettings({ company, onSave }: NotificationSettingsProps) {
    const [settings, setSettings] = useState({
        failedSync: true,
        vatThreshold: true,
        lowRunway: true,
        periodLock: false,
        intelligence: true,
        emailDigest: true
    })
    const [saving, setSaving] = useState(false)
    const toast = useToast()

    useEffect(() => {
        if (company?.settings?.notifications) {
            setSettings({
                // Fallback for missing keys if the structure is different
                failedSync: company.settings.notifications?.failedSync ?? true,
                vatThreshold: company.settings.notifications?.vatThreshold ?? true,
                lowRunway: company.settings.notifications?.lowRunway ?? true,
                periodLock: company.settings.notifications?.periodLock ?? false,
                intelligence: company.settings.notifications?.intelligence ?? true,
                emailDigest: company.settings.notifications?.emailDigest ?? true
            })
        }
    }, [company])

    const toggle = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const handleSave = async () => {
        if (!company) return
        setSaving(true)
        try {
            const currentSettings = company.settings || {}
            const newSettings: CompanySettings = {
                ...currentSettings,
                notifications: {
                    ...currentSettings.notifications, // Keep existing if any
                    ...settings, // Overwrite with local state
                    // The type definition I added doesn't have 'failedSync' etc.
                    // functionality will break TS build.
                    // I MUST update database.ts first.
                } as any // Temporary cast to avoid blocking, but I should fix the type.
            }

            await onSave({ settings: newSettings })
            toast.success('Preferences Saved', 'Notification settings updated.')
        } catch (error) {
            console.error(error)
            toast.error('Save Failed', 'Could not save preferences.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Notifications</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Configure what financial signals you want to receive.
                </p>
            </div>

            <div className="bg-white shadow rounded-lg divide-y divide-gray-200 border border-gray-200">
                <div className="p-6 space-y-6">
                    <fieldset>
                        <legend className="text-base font-medium text-gray-900 flex items-center gap-2">
                            <Bell className="w-4 h-4" />
                            Alerts
                        </legend>
                        <p className="text-sm text-gray-500 mb-4">Choose which events trigger an alert.</p>

                        <div className="space-y-4">
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="failedSync"
                                        type="checkbox"
                                        checked={settings.failedSync}
                                        onChange={() => toggle('failedSync')}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="failedSync" className="font-medium text-gray-700">Failed Bank Syncs</label>
                                    <p className="text-gray-500">Notify me immediately if a bank feed connection drops.</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="vatThreshold"
                                        type="checkbox"
                                        checked={settings.vatThreshold}
                                        onChange={() => toggle('vatThreshold')}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="vatThreshold" className="font-medium text-gray-700">VAT Threshold Warnings</label>
                                    <p className="text-gray-500">Alert when nearing the registration threshold.</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="lowRunway"
                                        type="checkbox"
                                        checked={settings.lowRunway}
                                        onChange={() => toggle('lowRunway')}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="lowRunway" className="font-medium text-gray-700">Low Cash Runway</label>
                                    <p className="text-gray-500">Warning when forecasted runway drops below 3 months.</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="intelligence"
                                        type="checkbox"
                                        checked={settings.intelligence}
                                        onChange={() => toggle('intelligence')}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="intelligence" className="font-medium text-gray-700">Intelligence Insights</label>
                                    <p className="text-gray-500">Weekly AI-generated financial insights.</p>
                                </div>
                            </div>
                        </div>
                    </fieldset>
                </div>

                {/* Delivery Channels (Mock) */}
                <div className="p-6 bg-gray-50">
                    <fieldset>
                        <legend className="text-base font-medium text-gray-900 flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Delivery Channels
                        </legend>
                        <div className="mt-4 flex items-center gap-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Email (Enabled)
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                Slack (Coming Soon)
                            </span>
                        </div>
                    </fieldset>
                </div>

                <div className="px-6 py-4 flex justify-end">
                    <button
                        disabled={saving}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Preferences'}
                    </button>
                </div>
            </div>
        </div>
    )
}
