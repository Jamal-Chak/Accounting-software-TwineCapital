'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/toast'
import { TrendingUp, AlertTriangle, Target, Bell } from 'lucide-react'
import { Company, CompanySettings } from '@/lib/database'

interface IntelligenceSettingsProps {
    company: Company | null
    onSave: (updates: Partial<Company>) => Promise<void>
}

export function IntelligenceSettings({ company, onSave }: IntelligenceSettingsProps) {
    const [forecastEnabled, setForecastEnabled] = useState(true)
    const [forecastHorizon, setForecastHorizon] = useState<30 | 60 | 90>(60)
    const [confidenceLevel, setConfidenceLevel] = useState(75)

    // Alert preferences
    const [marginAlerts, setMarginAlerts] = useState(true)
    const [cashRunwayAlerts, setCashRunwayAlerts] = useState(true)
    const [anomalyDetection, setAnomalyDetection] = useState(true)
    const [velocityTracking, setVelocityTracking] = useState(false)

    // Benchmark settings
    const [benchmarkType, setBenchmarkType] = useState<'industry' | 'historical' | 'custom'>('historical')

    const [saving, setSaving] = useState(false)
    const toast = useToast()

    useEffect(() => {
        if (company?.settings?.intelligence) {
            const s = company.settings.intelligence
            setForecastEnabled(s.forecastEnabled ?? true)
            setForecastHorizon(s.forecastHorizon ?? 60)
            setConfidenceLevel(s.confidenceLevel ?? 75)
            setBenchmarkType(s.benchmarkType ?? 'historical')

            setMarginAlerts(s.marginAlerts ?? true)
            setCashRunwayAlerts(s.cashRunwayAlerts ?? true)
            setAnomalyDetection(s.anomalyDetection ?? true)
            setVelocityTracking(s.velocityTracking ?? false)
        }
    }, [company])

    const handleSave = async () => {
        if (!company) return
        setSaving(true)
        try {
            const currentSettings = company.settings || {}
            const newSettings: CompanySettings = {
                ...currentSettings,
                intelligence: {
                    forecastEnabled,
                    forecastHorizon,
                    confidenceLevel,
                    benchmarkType,
                    marginAlerts,
                    cashRunwayAlerts,
                    anomalyDetection,
                    velocityTracking
                }
            }
            await onSave({ settings: newSettings })
            toast.success('Settings Saved', 'Intelligence & Analytics preferences updated')
        } catch (error) {
            console.error(error)
            toast.error('Save Failed', 'Could not save intelligence settings.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Intelligence & Analytics</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Configure AI-powered forecasting, alerts, and business intelligence features.
                </p>
            </div>

            {/* Forecasting */}
            <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-gray-900">Forecasting</h4>
                        <p className="text-sm text-gray-500">Predict future cash flow and revenue</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={forecastEnabled}
                                onChange={(e) => setForecastEnabled(e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Enable AI forecasting</span>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Forecast horizon
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {[30, 60, 90].map((days) => (
                                <button
                                    key={days}
                                    onClick={() => setForecastHorizon(days as any)}
                                    disabled={!forecastEnabled}
                                    className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${forecastHorizon === days
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {days} days
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confidence level: {confidenceLevel}%
                        </label>
                        <input
                            type="range"
                            min="50"
                            max="95"
                            step="5"
                            value={confidenceLevel}
                            onChange={(e) => setConfidenceLevel(Number(e.target.value))}
                            disabled={!forecastEnabled}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Higher confidence means more conservative predictions
                        </p>
                    </div>
                </div>
            </div>

            {/* Insights & Alerts */}
            <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                        <Bell className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-gray-900">Alerts & Insights</h4>
                        <p className="text-sm text-gray-500">Get notified about important changes</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={marginAlerts}
                                onChange={(e) => setMarginAlerts(e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Margin alerts</span>
                        </div>
                        <span className="text-xs text-gray-500">When profit margins drop significantly</span>
                    </label>

                    <label className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={cashRunwayAlerts}
                                onChange={(e) => setCashRunwayAlerts(e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Cash runway alerts</span>
                        </div>
                        <span className="text-xs text-gray-500">When cash reserves are running low</span>
                    </label>

                    <label className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={anomalyDetection}
                                onChange={(e) => setAnomalyDetection(e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Anomaly detection</span>
                        </div>
                        <span className="text-xs text-gray-500">Unusual transaction patterns</span>
                    </label>

                    <label className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={velocityTracking}
                                onChange={(e) => setVelocityTracking(e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Sales velocity tracking</span>
                        </div>
                        <span className="text-xs text-gray-500">Monitor sales trends and momentum</span>
                    </label>
                </div>
            </div>

            {/* Benchmarks */}
            <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                        <Target className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-gray-900">Benchmarks</h4>
                        <p className="text-sm text-gray-500">Compare your performance</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Compare against
                    </label>
                    <select
                        value={benchmarkType}
                        onChange={(e) => setBenchmarkType(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    >
                        <option value="industry">Industry averages</option>
                        <option value="historical">Historical performance</option>
                        <option value="custom">Custom targets</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                        Choose what to compare your metrics against
                    </p>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Preferences'}
                </button>
            </div>
        </div>
    )
}
