'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function Navbar() {
    return (
        <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">T</span>
                            </div>
                            <span className="text-white font-semibold text-xl tracking-tight">TwineCapital</span>
                        </Link>
                    </div>

                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            <a href="#features" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Features</a>
                            <a href="#testimonials" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Testimonials</a>
                            <a href="#pricing" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Pricing</a>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/login"
                            className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/signup"
                            className="group flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-100 transition-all transform hover:scale-105"
                        >
                            Get Started
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    )
}
