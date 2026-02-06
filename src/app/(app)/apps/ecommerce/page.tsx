'use client'

import { PageHeader } from '@/components/layout/PageHeader'
import { ShoppingCart, RefreshCw, CheckCircle, ArrowRight, ExternalLink } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function EcommerceSyncPage() {
    const [platforms, setPlatforms] = useState(() => {
        const initialPlatforms = [
            { id: 'shopify', name: 'Shopify', status: 'Connected', lastSync: '10 mins ago', icon: '/logos/shopify.svg' },
            { id: 'woocommerce', name: 'WooCommerce', status: 'Not Connected', lastSync: '-', icon: '/logos/woo.svg' },
            { id: 'magento', name: 'Magento', status: 'Not Connected', lastSync: '-', icon: '/logos/magento.svg' },
        ]

        if (typeof window !== 'undefined') {
            const savedState = localStorage.getItem('ecommerce_connections')
            if (savedState) {
                try {
                    const connections = JSON.parse(savedState)
                    return initialPlatforms.map(p => ({
                        ...p,
                        status: connections[p.id] ? 'Connected' : 'Not Connected',
                        lastSync: connections[p.id] ? 'Just now' : '-'
                    }))
                } catch (e) {
                    console.error(e)
                }
            }
        }
        return initialPlatforms
    })
    const [syncing, setSyncing] = useState(false)

    const toggleConnection = (id: string) => {
        setPlatforms(prev => {
            const newPlatforms = prev.map(p => {
                if (p.id === id) {
                    return { ...p, status: p.status === 'Connected' ? 'Not Connected' : 'Connected', lastSync: 'Just now' }
                }
                return p
            })

            // Save state
            const state = newPlatforms.reduce((acc, p) => ({ ...acc, [p.id]: p.status === 'Connected' }), {})
            localStorage.setItem('ecommerce_connections', JSON.stringify(state))

            return newPlatforms
        })
    }

    const handleSync = () => {
        setSyncing(true)
        setTimeout(() => setSyncing(false), 2000)
    }

    return (
        <div>
            <PageHeader
                title="E-commerce Sync"
                description="Connect your online stores to automatically import orders, inventory, and refunds."
                breadcrumbs={[
                    { label: 'Marketplace', href: '/marketplace' },
                    { label: 'E-commerce Sync' }
                ]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Active Connections */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900">Connected Stores</h2>
                            <button
                                onClick={handleSync}
                                disabled={syncing}
                                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                                {syncing ? 'Syncing...' : 'Sync Now'}
                            </button>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {platforms.filter(p => p.status === 'Connected').map(platform => (
                                <div key={platform.id} className="p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <ShoppingCart className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                                            <p className="text-sm text-green-600 flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" />
                                                Active • Last synced {platform.lastSync}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleConnection(platform.id)}
                                        className="text-sm text-gray-500 hover:text-red-600 font-medium"
                                    >
                                        Disconnect
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Available Integrations */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Available Integrations</h2>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {platforms.filter(p => p.status !== 'Connected').map(platform => (
                                <div key={platform.id} className="p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <ShoppingCart className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                                            <p className="text-sm text-gray-500">
                                                Connect your {platform.name} store
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleConnection(platform.id)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Connect
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                        <h3 className="font-semibold text-blue-900 mb-2">Sync Summary</h3>
                        <p className="text-sm text-blue-700 mb-4">
                            Your last sync imported 142 orders and updated 34 inventory items.
                        </p>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-blue-800">Orders Today</span>
                                <span className="font-medium text-blue-900">24</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-blue-800">Revenue Today</span>
                                <span className="font-medium text-blue-900">R8,450</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-blue-800">Pending Refunds</span>
                                <span className="font-medium text-blue-900">2</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <Link href="/items" className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50 group">
                                <span className="text-sm text-gray-700 font-medium">Manage Inventory</span>
                                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                            </Link>
                            <Link href="/sales/invoices" className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50 group">
                                <span className="text-sm text-gray-700 font-medium">View Sales Orders</span>
                                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
