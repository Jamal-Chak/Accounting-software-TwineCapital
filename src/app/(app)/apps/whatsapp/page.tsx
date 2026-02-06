'use client'

import { PageHeader } from '@/components/layout/PageHeader'
import { MessageSquare, Save, Smartphone, CheckCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function WhatsAppConnectPage() {
    const [connected, setConnected] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('whatsapp_connected') === 'true'
        }
        return false
    })
    const [loading, setLoading] = useState(false)
    const [phoneNumber, setPhoneNumber] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('whatsapp_phone') || ''
        }
        return ''
    })

    // Load state on mount - No longer needed as handled by useState lazy initializer
    useEffect(() => {
    }, [])

    const handleConnect = () => {
        setLoading(true)
        // Simulate API call
        setTimeout(() => {
            setConnected(true)
            setLoading(false)
            localStorage.setItem('whatsapp_connected', 'true')
            localStorage.setItem('whatsapp_phone', phoneNumber)
        }, 1500)
    }

    const handleDisconnect = () => {
        setConnected(false)
        setPhoneNumber('')
        localStorage.removeItem('whatsapp_connected')
        localStorage.removeItem('whatsapp_phone')
    }

    const handleSendTest = () => {
        if (!phoneNumber) return

        // Sanitize phone number: remove +, spaces, dashes, parens
        const cleanNumber = phoneNumber.replace(/[+\s\-()]/g, '')
        const message = encodeURIComponent('Hello from TwineCapital! This is a test message to confirm your integration.')

        window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank')
    }

    return (
        <div>
            <PageHeader
                title="WhatsApp Connect"
                description="Send invoices, reminders, and notifications via WhatsApp."
                breadcrumbs={[
                    { label: 'Marketplace', href: '/marketplace' },
                    { label: 'WhatsApp Connect' }
                ]}
            />

            <div className="max-w-3xl mx-auto space-y-6">
                {/* Connection Status Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${connected ? 'bg-green-100' : 'bg-gray-100'}`}>
                                <MessageSquare className={`w-6 h-6 ${connected ? 'text-green-600' : 'text-gray-500'}`} />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Connection Status</h2>
                                <p className="text-sm text-gray-500">
                                    {connected
                                        ? 'Connected to WhatsApp Business API'
                                        : 'Not connected. Link your business account to start sending messages.'}
                                </p>
                            </div>
                        </div>
                        {connected && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                <CheckCircle className="w-3 h-3" />
                                Active
                            </span>
                        )}
                    </div>

                    {!connected ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    WhatsApp Business Number
                                </label>
                                <div className="relative">
                                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="tel"
                                        placeholder="+1 234 567 8900"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    Must be a valid phone number registered with WhatsApp Business.
                                </p>
                            </div>

                            <button
                                onClick={handleConnect}
                                disabled={!phoneNumber || loading}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? 'Connecting...' : 'Connect WhatsApp Account'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-green-200">
                                        <span className="text-green-600 font-bold text-sm">TC</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-green-900">Connected to {phoneNumber}</p>
                                        <p className="text-xs text-green-700">TwineCapital Business Account</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleDisconnect}
                                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                                >
                                    Disconnect
                                </button>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={handleSendTest}
                                    className="text-sm text-green-700 hover:text-green-800 font-medium flex items-center gap-1.5"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    Send Test Message
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Templates Section */}
                <div className={`transition-opacity duration-200 ${connected ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Message Templates</h3>

                        <div className="space-y-4">
                            {[
                                { title: 'New Invoice', preview: 'Hi {{customer}}, here is your invoice #{{number}} for {{amount}}. View it here: {{link}}' },
                                { title: 'Payment Reminder', preview: 'Reminder: Invoice #{{number}} is overdue. Please pay {{amount}} as soon as possible.' },
                                { title: 'Payment Receipt', preview: 'Thank you for your payment of {{amount}}. Your receipt is available here: {{link}}' }
                            ].map((template) => (
                                <div key={template.title} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-sm text-gray-900">{template.title}</h4>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" defaultChecked className="sr-only peer" />
                                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                                        </label>
                                    </div>
                                    <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md italic">
                                        &quot;{template.preview}&quot;
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                                <Save className="w-4 h-4" />
                                Save Configuration
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
