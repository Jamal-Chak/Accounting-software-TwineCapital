'use client'

import { Search, Plus, Bell, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

export function Header() {
    const [showQuickCreate, setShowQuickCreate] = useState(false)

    return (
        <header className="fixed top-0 right-0 left-60 h-16 bg-white border-b border-gray-200 z-20">
            <div className="h-full px-6 flex items-center justify-between">
                {/* Search */}
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search invoices, expenses, clients..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            suppressHydrationWarning
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    {/* Quick Create */}
                    <div className="relative">
                        <button
                            onClick={() => setShowQuickCreate(!showQuickCreate)}
                            className="px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 inline-flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>New</span>
                            <ChevronDown className="w-4 h-4" />
                        </button>

                        {showQuickCreate && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowQuickCreate(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20">
                                    <Link
                                        href="/invoices/create"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setShowQuickCreate(false)}
                                    >
                                        New Invoice
                                    </Link>
                                    <Link
                                        href="/expenses?action=new"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setShowQuickCreate(false)}
                                    >
                                        New Expense
                                    </Link>
                                    <Link
                                        href="/banking"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setShowQuickCreate(false)}
                                    >
                                        Connect Bank
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Notifications */}
                    <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* User Menu */}
                    <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-medium">
                            D
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
