
import React from 'react';
import { MarketplaceApp } from '@/lib/marketplace-data';
import { Download, Check, ExternalLink, Clock, Play } from 'lucide-react';
import Link from 'next/link';

interface AppCardProps {
    app: MarketplaceApp;
    isInstalled: boolean;
    onToggleInstall: (appId: string) => void;
}

export const AppCard: React.FC<AppCardProps> = ({ app, isInstalled, onToggleInstall }) => {
    const Icon = app.icon;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-5 flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                    <Icon className="w-8 h-8 text-blue-600" />
                </div>
                <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${app.status === 'coming_soon'
                        ? 'bg-yellow-100 text-yellow-800'
                        : isInstalled
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}>
                    {app.status === 'coming_soon' ? 'Coming Soon' : app.price}
                </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">{app.title}</h3>
            <p className="text-gray-600 text-sm mb-4 flex-grow">{app.description}</p>

            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                {app.status === 'coming_soon' ? (
                    <button disabled className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-400 rounded-lg cursor-not-allowed font-medium text-sm">
                        <Clock className="w-4 h-4" />
                        Coming Soon
                    </button>
                ) : (
                    <div className="flex gap-2 w-full">
                        <button
                            onClick={() => onToggleInstall(app.id)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${isInstalled
                                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                        >
                            {isInstalled ? (
                                <>
                                    <Download className="w-4 h-4 rotate-180" />
                                    Uninstall
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4" />
                                    Install
                                </>
                            )}
                        </button>

                        {isInstalled && app.link && (
                            <Link href={app.link} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm">
                                <ExternalLink className="w-4 h-4" />
                                Open
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
