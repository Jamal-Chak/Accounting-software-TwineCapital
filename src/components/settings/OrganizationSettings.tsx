'use client'

import { useState, useEffect } from 'react'
import { type Company } from '@/lib/database'

interface OrganizationSettingsProps {
    company: Company | null
    onSave: (updates: Partial<Company>) => Promise<void>
}

export function OrganizationSettings({ company, onSave }: OrganizationSettingsProps) {
    const [formData, setFormData] = useState({
        name: '',
        vat_number: '',
        country: 'South Africa',
        currency: 'ZAR',
        timezone: 'Africa/Johannesburg',
        financial_year_end: '02-28', // Feb 28th default
        registration_number: '',
        industry: 'Technology'
    })
    const [saving, setSaving] = useState(false)

    // Initialize form data when company loads
    useEffect(() => {
        if (company) {
            const settings = company.settings || {}
            setFormData(prev => ({
                ...prev,
                name: company.name,
                vat_number: company.vat_number || '',
                country: company.country,
                currency: company.currency,
                // Load extended settings from JSONB if available
                timezone: settings.organization?.timezone || 'Africa/Johannesburg',
                financial_year_end: settings.organization?.financial_year_end || '02-28',
                registration_number: settings.organization?.registration_number || '',
                industry: settings.organization?.industry || 'Technology'
            }))
        }
    }, [company])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        // Prepare updates
        // Core fields go to top-level columns
        // Extended fields go to 'settings' JSONB
        const updates: Partial<Company> = {
            name: formData.name,
            vat_number: formData.vat_number,
            country: formData.country,
            currency: formData.currency,
            settings: {
                ...(company?.settings || {}),
                organization: {
                    timezone: formData.timezone,
                    financial_year_end: formData.financial_year_end,
                    registration_number: formData.registration_number,
                    industry: formData.industry
                }
            }
        }

        try {
            await onSave(updates)
            alert('Organization settings saved successfully.')
        } catch (error) {
            console.error('Failed to save settings:', error)
            alert('Failed to save settings.')
        } finally {
            setSaving(false)
        }
    }

    if (!company) return <div>Loading...</div>

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Organization Profile</h3>
                <p className="mt-1 text-sm text-gray-500">
                    General information about your business entity. This drives tax logic and reporting.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700">Company Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                            required
                        />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700">Type / Industry</label>
                        <select
                            value={formData.industry}
                            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                        >
                            <option value="Technology">Technology & Software</option>
                            <option value="Retail">Retail & Ecommerce</option>
                            <option value="Services">Professional Services</option>
                            <option value="Manufacturing">Manufacturing</option>
                            <option value="Hospitality">Hospitality</option>
                            <option value="Construction">Construction</option>
                        </select>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700">Registration Number</label>
                        <input
                            type="text"
                            value={formData.registration_number}
                            onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                            placeholder="e.g. 2023/123456/07"
                        />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700">VAT Number</label>
                        <input
                            type="text"
                            value={formData.vat_number}
                            onChange={(e) => setFormData({ ...formData, vat_number: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                            placeholder="e.g. 4012345678"
                        />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700">Base Currency</label>
                        <select
                            value={formData.currency}
                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                            disabled // Immutable as per TODO
                        >
                            <option value="ZAR">ZAR - South African Rand</option>
                            <option value="USD">USD - US Dollar</option>
                            <option value="GBP">GBP - British Pound</option>
                            <option value="EUR">EUR - Euro</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">Currency cannot be changed once transactions exist.</p>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700">Country</label>
                        <select
                            value={formData.country}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                        >
                            <option value="South Africa">South Africa</option>
                            <option value="United States">United States</option>
                            <option value="United Kingdom">United Kingdom</option>
                        </select>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700">Financial Year End</label>
                        <select
                            value={formData.financial_year_end}
                            onChange={(e) => setFormData({ ...formData, financial_year_end: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                        >
                            <option value="02-28">February 28 (Standard SA)</option>
                            <option value="12-31">December 31</option>
                            <option value="06-30">June 30</option>
                            <option value="03-31">March 31</option>
                        </select>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700">Timezone</label>
                        <select
                            value={formData.timezone}
                            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                        >
                            <option value="Africa/Johannesburg">Johannesburg (GMT+2)</option>
                            <option value="UTC">UTC</option>
                            <option value="Europe/London">London (GMT)</option>
                            <option value="America/New_York">New York (EST)</option>
                        </select>
                    </div>

                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    )
}
