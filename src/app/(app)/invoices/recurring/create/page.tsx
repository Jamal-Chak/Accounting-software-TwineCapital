
'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import Link from 'next/link';

export default function CreateRecurringInvoicePage() {
    const router = useRouter();
    const [clients, setClients] = useState<any[]>([]);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [clientId, setClientId] = useState('');
    const [interval, setInterval] = useState('monthly');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

    // Single Item for now (extensible later)
    const [description, setDescription] = useState('Monthly Retainer');
    const [amount, setAmount] = useState<number>(0);

    useEffect(() => {
        async function loadClients() {
            const { data } = await supabase.from('clients').select('*').order('name');
            if (data) setClients(data);
        }
        loadClients();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch('/api/invoices/recurring/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientId,
                    interval,
                    startDate,
                    items: [
                        {
                            description,
                            quantity: 1,
                            unit_price: amount,
                            tax_rate: 15, // Default VAT
                            total_amount: amount // Assuming tax excl or incl? standard createInvoice usually handles logic but here we pass total. Let's assume unit_price is the main driver.
                        }
                    ]
                })
            });

            const result = await res.json();
            if (result.success) {
                router.push('/invoices/recurring');
            } else {
                alert('Failed: ' + result.error);
            }
        } catch (err) {
            console.error(err);
            alert('Error creating profile');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <PageHeader
                title="New Recurring Invoice"
                description="Set up an automated billing schedule."
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Invoices', href: '/invoices' },
                    { label: 'Recurring', href: '/invoices/recurring' },
                    { label: 'New' }
                ]}
            />

            <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-200 shadow-sm p-6 ml-0">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Client Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                        <select
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                            <option value="">Select a client...</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Frequency */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                            <select
                                value={interval}
                                onChange={(e) => setInterval(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            >
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="quarterly">Quarterly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>

                        {/* Start Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Next Run Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-medium text-gray-900 mb-4">Invoice Details</h3>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Excl. VAT)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R</span>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(Number(e.target.value))}
                                        required
                                        min="0"
                                        step="0.01"
                                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Link
                            href="/invoices/recurring"
                            className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium shadow-sm"
                        >
                            <Save className="w-4 h-4" />
                            {submitting ? 'Saving...' : 'Create Schedule'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
