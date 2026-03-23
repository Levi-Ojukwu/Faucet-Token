import { useWallet } from '../context/WalletContext'
import Navbar from '../components/Navbar'

export default function LandingPage() {
  const { connectWallet, isLoading } = useWallet()

  return (
    <div className="min-h-screen bg-accent">
      <Navbar />
      
      <main className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <section className="py-12 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 animate-slide-in-left">
              {/* Badge */}
              {/* <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold tracking-wider">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Lisk Network
              </div> */}

              {/* Heading */}
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-dark leading-tight">
                  Reliable Liquidity for the
                  <span className="block italic font-light text-primary-600">Digital Earth.</span>
                </h1>
              </div>

              {/* Description */}
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-md">
                LKT provides a seamless faucet experience designed for builders and participants. Pure stability, zero friction.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={connectWallet}
                  disabled={isLoading}
                  className="px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 transition duration-200 w-full sm:w-auto"
                >
                  {isLoading ? 'Connecting...' : 'Connect Wallet to Enter'}
                </button>
                {/* <button className="px-8 py-3 bg-white border-2 border-primary-600 text-primary-600 font-semibold rounded-lg hover:bg-gray-50 transition duration-200 w-full sm:w-auto">
                  View Analytics
                </button> */}
              </div>
            </div>

            {/* Right Image - Placeholder */}
            <div className="hidden md:flex items-center justify-center animate-slide-in-right">
              <div className="relative w-full aspect-square max-w-md">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary-500 to-primary-600 opacity-10 rounded-3xl"></div>
                <div className="absolute inset-6 bg-white rounded-3xl shadow-lg flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <img src="https://cdn.shopify.com/s/files/1/0047/9730/0847/products/nurserylive-anthurium-andreanum-princess-amalia-elegance-plant_520x520.jpg?v=1611122988" alt="" className='w-full' />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-12 md:py-16 border-t border-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {/* Stat 1 */}
              <div className="text-center md:text-left animate-slide-in-up">
                <p className="text-xs font-semibold text-gray-400 tracking-wider mb-2">TOTAL DISTRIBUTED</p>
                <p className="text-3xl md:text-4xl font-bold text-dark">1.2M LTK</p>
              </div>

              {/* Stat 2 */}
              <div className="text-center md:text-left animate-slide-in-up">
                <p className="text-xs font-semibold text-gray-400 tracking-wider mb-2">ACTIVE WALLETS</p>
                <p className="text-3xl md:text-4xl font-bold text-dark">48.3k</p>
              </div>

              {/* Stat 3 */}
              <div className="text-center md:text-left animate-slide-in-up">
                <p className="text-xs font-semibold text-gray-400 tracking-wider mb-2">NETWORK STATUS</p>
                <p className="text-3xl md:text-4xl font-bold text-dark">Optimal</p>
              </div>
            </div>
          </section>

          {/* Footer Note */}
          <section className="py-12 md:py-16 border-t border-gray-300 text-center">
            <p className="text-xs text-gray-400 tracking-wider">EST. 2026</p>
            <p className="text-sm text-gray-500 mt-2">Powered by smart contrac</p>
          </section>
        </div>
      </main>
    </div>
  )
}
