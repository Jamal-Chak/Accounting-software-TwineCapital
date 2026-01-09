
import { Navbar } from '@/components/marketing/Navbar'
import { Hero } from '@/components/marketing/Hero'
import { SocialProof } from '@/components/marketing/SocialProof'
import { Features } from '@/components/marketing/Features'
import { Footer } from '@/components/marketing/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      <Navbar />
      <Hero />
      <SocialProof />
      <Features />
      <Footer />
    </main>
  )
}

