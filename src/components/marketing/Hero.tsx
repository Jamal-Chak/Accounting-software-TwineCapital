'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react'

export function Hero() {
    return (
        <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden bg-black">
            {/* Background gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[128px]" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[128px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in text-sm text-gray-300">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span>New: AI-Powered Fraud Detection</span>
                </div>

                <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white mb-8">
                    Intelligent accounting <br className="hidden sm:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                        for the modern CFO
                    </span>
                </h1>

                <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
                    Automate your bookkeeping, predict cash flow with 99% accuracy, and manage spend—all in one intelligent platform powered by Google Gemini.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                    <Link
                        href="/signup"
                        className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                        Start Free Trial
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                    <a
                        href="#demo"
                        className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 text-white border border-white/10 font-semibold text-lg hover:bg-white/10 transition-all flex items-center justify-center"
                    >
                        View Demo
                    </a>
                </div>

                {/* Stats / Trust items */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto border-t border-white/10 pt-12">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2 text-white font-semibold mb-1">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                            <span>30% Growth</span>
                        </div>
                        <p className="text-sm text-gray-500">Average revenue increase</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2 text-white font-semibold mb-1">
                            <Sparkles className="w-5 h-5 text-blue-400" />
                            <span>Zero Data Entry</span>
                        </div>
                        <p className="text-sm text-gray-500">Automated categorization</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2 text-white font-semibold mb-1">
                            <ShieldCheck className="w-5 h-5 text-indigo-400" />
                            <span>Bank Security</span>
                        </div>
                        <p className="text-sm text-gray-500">256-bit encryption</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
