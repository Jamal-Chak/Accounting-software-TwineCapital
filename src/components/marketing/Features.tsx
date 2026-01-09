'use client'

import { Brain, Receipt, PieChart, Wallet, Shield, Zap } from 'lucide-react'

const features = [
    {
        name: 'AI Bookkeeping',
        description: 'Our Gemini-powered AI categorizes transactions with 99% accuracy, learning from your corrections.',
        icon: Brain,
    },
    {
        name: 'Smart Invoicing',
        description: 'Create professional invoices in seconds, send automated reminders, and get paid faster.',
        icon: Receipt,
    },
    {
        name: 'Cash Flow Prediction',
        description: 'See 13 weeks into the future with our predictive cash flow engine, spotting gaps before they happen.',
        icon: PieChart,
    },
    {
        name: 'Multi-Entity Support',
        description: 'Manage unlimited companies under one login with consolidated reporting and inter-company transfers.',
        icon: Wallet,
    },
    {
        name: 'Fraud Detection',
        description: 'Real-time monitoring for duplicate payments, unusual spending, and potential fraud risks.',
        icon: Shield,
    },
    {
        name: 'Instant Reconciliation',
        description: 'Connect your bank accounts and reconcile thousands of transactions in a single click.',
        icon: Zap,
    },
]

export function Features() {
    return (
        <div id="features" className="py-24 bg-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-base text-blue-500 font-semibold tracking-wide uppercase">Features</h2>
                    <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-white sm:text-4xl">
                        Everything you need to run your business
                    </p>
                    <p className="mt-4 max-w-2xl text-xl text-gray-400 mx-auto">
                        TwineCapital combines traditional accounting with advanced AI to save you 20+ hours per week.
                    </p>
                </div>

                <div className="mt-20">
                    <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature) => (
                            <div key={feature.name} className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                                <div className="relative p-8 bg-zinc-900 ring-1 ring-white/10 rounded-lg leading-none flex items-start space-x-6 h-full">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                                            <feature.icon className="h-6 w-6" aria-hidden="true" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xl font-medium text-white mb-2">{feature.name}</p>
                                        <p className="text-gray-400 leading-relaxed text-sm">{feature.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
