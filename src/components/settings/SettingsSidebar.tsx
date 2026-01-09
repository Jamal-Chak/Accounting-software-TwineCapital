'use client'

import { LucideIcon, Building, Calculator, Landmark, BarChart3, AppWindow, Users, Bell, FileCheck, Code2, Database } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarItem {
    id: string
    name: string
    icon: LucideIcon
}

const items: SidebarItem[] = [
    { id: 'org', name: 'Organization', icon: Building },
    { id: 'accounting', name: 'Accounting', icon: Calculator },
    { id: 'banking', name: 'Banking', icon: Landmark },
    { id: 'inventory', name: 'Inventory', icon: FileCheck }, // Added Inventory
    { id: 'intelligence', name: 'Intelligence & Analytics', icon: BarChart3 },
    { id: 'apps', name: 'Marketplace & Apps', icon: AppWindow },
    { id: 'users', name: 'Users & Permissions', icon: Users },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'compliance', name: 'Compliance & Audit', icon: FileCheck },
    { id: 'developer', name: 'Developer', icon: Code2 },
    { id: 'data', name: 'Data Management', icon: Database }, // Kept our useful tool
]

interface SettingsSidebarProps {
    activeSection: string
    onSelect: (id: string) => void
}

export function SettingsSidebar({ activeSection, onSelect }: SettingsSidebarProps) {
    return (
        <nav className="w-64 bg-gray-50 border-r border-gray-200 h-[calc(100vh-64px)] overflow-y-auto">
            <div className="p-4">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
                    Configuration
                </h2>
                <div className="space-y-1">
                    {items.map((item) => {
                        const Icon = item.icon
                        const isActive = activeSection === item.id
                        return (
                            <button
                                key={item.id}
                                onClick={() => onSelect(item.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                    isActive
                                        ? "bg-white text-blue-600 shadow-sm ring-1 ring-gray-200"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                )}
                            >
                                <Icon className={cn("w-4 h-4", isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500")} />
                                {item.name}
                            </button>
                        )
                    })}
                </div>
            </div>
        </nav>
    )
}
