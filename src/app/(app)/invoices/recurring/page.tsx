
'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { RecurringProfile } from '@/lib/recurring';
import { Plus, RefreshCw, Play, Calendar, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function RecurringInvoicesPage() {
    const [profiles, setProfiles] = useState<RecurringProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [lastResult, setLastResult] = useState<string | null>(null);

    // Ideally use a proper API route for fetching if client-side, 
    // but for now we'll fetch from a new GET endpoint we should make, 
    // OR just use a server action. 
    // Let's assume we need to make a GET route for clean architecture.
    // Actually, I didn't create a GET endpoint yet. 
    // I'll create a simple one or just add GET handling to `src/app/api/invoices/recurring/route.ts` (need to create this).

    // For now, let's mock empty or try to fetch if I create the endpoint.
    // Plan: I'll create `src/app/api/invoices/recurring/route.ts` in the next step.

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        try {
            const res = await fetch('/api/invoices/recurring');
            if (res.ok) {
                const data = await res.json();
                setProfiles(data.data || []);
            }
        } catch (e) {
            console.error('Failed to fetch recurring profiles', e);
        } finally {
            setLoading(false);
        }
    };

    const handleProcess = async () => {
        setProcessing(true);
        setLastResult(null);
        try {
            const res = await fetch('/api/invoices/recurring/process', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setLastResult(`Processed: ${data.data.processed}, Invoices Created: ${data.data.invoices_created.length}`);
                fetchProfiles(); // Refresh to see updated next_run_date
            } else {
                setLastResult('Processing failed');
            }
        } catch (e) {
            setLastResult('Error during processing');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div>
            <PageHeader
                title="Recurring Invoices"
                description="Manage automated recurring billing profiles."
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Invoices', href: '/invoices' },
                    { label: 'Recurring' }
                ]}
                action={
                    <div className="flex gap-2">
                        <button
                            onClick={handleProcess}
                            disabled={processing}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                        >
                            <Play className={`w-4 h-4 ${processing ? 'animate-pulse' : ''}`} />
                            {processing ? 'Processing...' : 'Run Now'}
                        </button>
                        <Link
                            href="/invoices/recurring/create"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <Plus className="w-4 h-4" />
                            New Recurring
                        </Link>
                    </div>
                }
            />

            {lastResult && (
                <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    {lastResult}
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading profiles...</div>
                ) : profiles.length === 0 ? (
                    <div className="p-12 text-center">
                        <RefreshCw className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No Recurring Profiles</h3>
                        <p className="text-gray-500 mb-6">Set up your first automated invoice.</p>
                        <Link
                            href="/invoices/recurring/create"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                            Create Profile
                        </Link>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Run</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {profiles.map(profile => (
                                <tr key={profile.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{profile.client_name}</div>
                                        <div className="text-xs text-gray-500">{profile.description}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700 capitalize">
                                        {profile.interval}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            {format(new Date(profile.next_run_date), 'MMM d, yyyy')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        R{profile.amount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${profile.status === 'active'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {profile.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-blue-600 cursor-pointer hover:underline">
                                        Edit
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
