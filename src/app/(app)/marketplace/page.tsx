
'use client'

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { MARKETPLACE_APPS, AppCategory, MarketplaceApp } from '@/lib/marketplace-data';
import { AppCard } from '@/components/marketplace/AppCard';
import { Search, Filter, LayoutGrid } from 'lucide-react';

export default function MarketplacePage() {
    const [activeCategory, setActiveCategory] = useState<AppCategory | 'All'>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [installedApps, setInstalledApps] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    // Load installed apps from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('marketplace_installed_apps');
        if (saved) {
            try {
                setInstalledApps(new Set(JSON.parse(saved)));
            } catch (e) {
                console.error('Failed to parse installed apps', e);
                // Default defaults
                setInstalledApps(new Set(['ai_accountant', 'smart_invoicing', 'cashflow_engine', 'multi_currency']));
            }
        } else {
            // Initialize defaults
            const defaults = ['ai_accountant', 'smart_invoicing', 'cashflow_engine', 'multi_currency'];
            setInstalledApps(new Set(defaults));
            localStorage.setItem('marketplace_installed_apps', JSON.stringify(defaults));
        }
        setLoading(false);
    }, []);

    // Save changes to localStorage
    const handleToggleInstall = (appId: string) => {
        setInstalledApps(prev => {
            const next = new Set(prev);
            if (next.has(appId)) {
                next.delete(appId);
            } else {
                next.add(appId);
            }
            localStorage.setItem('marketplace_installed_apps', JSON.stringify(Array.from(next)));
            return next;
        });
    };

    const filteredApps = MARKETPLACE_APPS.filter(app => {
        const matchesCategory = activeCategory === 'All' || app.category === activeCategory;
        const matchesSearch = app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const categories: (AppCategory | 'All')[] = ['All', 'Finance', 'AI', 'Operations', 'Integrations'];

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading Marketplace...</div>;
    }

    return (
        <div>
            <PageHeader
                title="App Marketplace"
                description="Discover and install add-ons to supercharge your business."
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Marketplace' }
                ]}
            />

            <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-sm">

                {/* Search */}
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search for apps..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Categories */}
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredApps.map(app => (
                    <AppCard
                        key={app.id}
                        app={app}
                        isInstalled={installedApps.has(app.id)}
                        onToggleInstall={handleToggleInstall}
                    />
                ))}
            </div>

            {filteredApps.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <LayoutGrid className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No apps found</h3>
                    <p className="text-gray-500">Try adjusting your search or category filter.</p>
                </div>
            )}
        </div>
    );
}
