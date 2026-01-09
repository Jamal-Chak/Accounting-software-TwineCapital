'use client'

import Link from 'next/link'

export function Footer() {
    return (
        <footer className="bg-black border-t border-white/10" aria-labelledby="footer-heading">
            <h2 id="footer-heading" className="sr-only">
                Footer
            </h2>
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
                <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                    <div className="space-y-8 xl:col-span-1">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">T</span>
                            </div>
                            <span className="text-white font-semibold text-xl tracking-tight">TwineCapital</span>
                        </Link>
                        <p className="text-gray-400 text-sm max-w-xs">
                            Empowering finance teams with AI-driven insights and automation.
                        </p>
                        <div className="flex space-x-6">
                            {/* Social icons would go here */}
                        </div>
                    </div>
                    <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Product</h3>
                                <ul role="list" className="mt-4 space-y-4">
                                    <li>
                                        <a href="#" className="text-base text-gray-500 hover:text-white transition-colors">
                                            Features
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-base text-gray-500 hover:text-white transition-colors">
                                            Integrations
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-base text-gray-500 hover:text-white transition-colors">
                                            Pricing
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div className="mt-12 md:mt-0">
                                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Company</h3>
                                <ul role="list" className="mt-4 space-y-4">
                                    <li>
                                        <a href="#" className="text-base text-gray-500 hover:text-white transition-colors">
                                            About
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-base text-gray-500 hover:text-white transition-colors">
                                            Blog
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-base text-gray-500 hover:text-white transition-colors">
                                            Careers
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Legal</h3>
                                <ul role="list" className="mt-4 space-y-4">
                                    <li>
                                        <a href="#" className="text-base text-gray-500 hover:text-white transition-colors">
                                            Privacy
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-base text-gray-500 hover:text-white transition-colors">
                                            Terms
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-12 border-t border-white/10 pt-8">
                    <p className="text-base text-gray-500 xl:text-center">
                        &copy; 2025 TwineCapital. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}
