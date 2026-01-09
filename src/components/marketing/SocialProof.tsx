'use client'

export function SocialProof() {
    return (
        <div className="bg-zinc-900 py-16 border-y border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="text-center text-sm font-semibold uppercase text-gray-500 tracking-wider mb-8">
                    Trusted by innovative finance teams at
                </p>
                <div className="grid grid-cols-2 gap-8 md:grid-cols-6 lg:grid-cols-5">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="col-span-1 flex justify-center items-center opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                            {/* Placeholder logos using text for now */}
                            <span className="text-xl font-bold text-white tracking-widest">LOGO {i}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
