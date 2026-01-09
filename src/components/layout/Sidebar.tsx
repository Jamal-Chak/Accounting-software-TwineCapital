'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Building2,
    FileText,
    Receipt,
    BarChart3,
    Settings,
    ChevronLeft,
    ChevronRight,
    Package,
    ShoppingCart,
    CreditCard,
    Clock,
    FolderOpen,
    ChevronDown,
    Activity,
    Calculator,
    Store
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
    name: string
    href: string
    icon?: any
}

interface NavGroup {
    name: string
    icon: any
    items: NavItem[]
}

const navigation: (NavItem | NavGroup)[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    {
        name: 'Enterprise',
        icon: Building2,
        items: [
            { name: 'Group Console', href: '/dashboard/consolidated' },
        ]
    },
    { name: 'Items', href: '/items', icon: Package },
    {
        name: 'Banking',
        icon: Building2,
        items: [
            { name: 'Overview', href: '/banking' },
            { name: 'Reconciliation', href: '/banking/reconciliation' }, // Corrected path based on previous file exploration
            { name: 'Autobookkeeping', href: '/categorize' },
        ]
    },
    {
        name: 'Sales',
        icon: ShoppingCart,
        items: [
            { name: 'Clients', href: '/clients' },
            { name: 'Estimates', href: '/sales/estimates' },
            { name: 'Invoices', href: '/invoices' },
        ]
    },
    {
        name: 'Purchases',
        icon: CreditCard,
        items: [
            { name: 'Expenses', href: '/expenses' },
            { name: 'Bills', href: '/purchases/bills' },
        ]
    },
    {
        name: 'Accounting',
        icon: Calculator,
        items: [
            { name: 'Chart of Accounts', href: '/accounts' },
            { name: 'VAT Returns', href: '/vat' },
        ]
    },
    {
        name: 'Time Tracking',
        icon: Clock,
        items: [
            { name: 'Projects', href: '/time-tracking/projects' },
            { name: 'Timesheets', href: '/time-tracking/timesheets' },
        ]
    },
    {
        name: 'Analytics',
        icon: Activity,
        items: [
            { name: 'Risk Console', href: '/analytics/fraud' },
            { name: 'Health Score', href: '/analytics/health' },
            { name: 'Suppliers', href: '/analytics/suppliers' },
            { name: 'Customers', href: '/analytics/customers' },
            { name: 'Products', href: '/analytics/products' },
        ]
    },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Documents', href: '/documents', icon: FolderOpen },
    { name: 'Marketplace', href: '/marketplace', icon: Store },
    { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)
    const [openGroups, setOpenGroups] = useState<string[]>(['Banking', 'Sales', 'Purchases', 'Accounting', 'Time Tracking', 'Analytics'])

    const toggleGroup = (groupName: string) => {
        if (collapsed) return
        setOpenGroups(prev =>
            prev.includes(groupName)
                ? prev.filter(name => name !== groupName)
                : [...prev, groupName]
        )
    }

    return (
        <aside
            className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-30 flex flex-col ${collapsed ? 'w-16' : 'w-60'
                }`}
        >
            {/* Logo */}
            <div className="h-16 flex-shrink-0 flex items-center justify-between px-4 border-b border-gray-200">
                {!collapsed && (
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            TC
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-gray-900">TwineCapital</h1>
                            <p className="text-xs text-gray-500">Accounting</p>
                        </div>
                    </Link>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    {collapsed ? (
                        <ChevronRight className="w-4 h-4" />
                    ) : (
                        <ChevronLeft className="w-4 h-4" />
                    )}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                {navigation.map((item) => {
                    // Handle Single Item
                    if ('href' in item) {
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                        const Icon = item.icon

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${isActive
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                title={collapsed ? item.name : undefined}
                            >
                                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                                {!collapsed && <span>{item.name}</span>}
                            </Link>
                        )
                    }

                    // Handle Group
                    const isOpen = openGroups.includes(item.name)
                    const Icon = item.icon
                    const isGroupActive = item.items.some(subItem => pathname === subItem.href || pathname?.startsWith(subItem.href + '/'))

                    return (
                        <div key={item.name}>
                            <button
                                onClick={() => toggleGroup(item.name)}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${isGroupActive && collapsed
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                title={collapsed ? item.name : undefined}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className={`w-5 h-5 flex-shrink-0 ${isGroupActive ? 'text-blue-700' : 'text-gray-500'}`} />
                                    {!collapsed && <span>{item.name}</span>}
                                </div>
                                {!collapsed && (
                                    <ChevronDown
                                        className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
                                    />
                                )}
                            </button>

                            {!collapsed && isOpen && (
                                <div className="mt-1 ml-4 pl-4 border-l border-gray-200 space-y-1">
                                    {item.items.map((subItem) => {
                                        const isSubActive = pathname === subItem.href || pathname?.startsWith(subItem.href + '/')
                                        return (
                                            <Link
                                                key={subItem.name}
                                                href={subItem.href}
                                                className={`block px-3 py-2 rounded-md text-sm transition-colors ${isSubActive
                                                    ? 'text-blue-700 font-medium bg-blue-50'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {subItem.name}
                                            </Link>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )
                })}
            </nav>

            {/* User Section */}
            {!collapsed && (
                <div className="flex-shrink-0 p-4 border-t border-gray-200">
                    <Link
                        href="/"
                        className="flex items-center gap-3 text-sm text-gray-500 hover:text-blue-600 font-medium mb-4 px-1 transition-colors"
                    >
                        <Store className="w-4 h-4" />
                        Back to Website
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium">
                            U
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">Demo User</p>
                            <p className="text-xs text-gray-500 truncate">demo@twinecapital.com</p>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    )
}
