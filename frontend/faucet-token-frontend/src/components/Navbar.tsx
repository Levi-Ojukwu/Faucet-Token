import { useWallet } from '../context/WalletContext'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

interface NavbarProps {
  isDashboard?: boolean
  currentPage?: string
  onNavigate?: (page: string) => void
}

export default function Navbar({ isDashboard = false, currentPage = 'home', onNavigate }: NavbarProps) {
  const { connectWallet, disconnectWallet, isConnected, address, isLoading } = useWallet()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const formatAddress = (addr: string | null) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const handleNavigation = (page: string) => {
    onNavigate?.(page)
    setMobileMenuOpen(false)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 font-bold text-lg">
            <span className="text-primary">LeviToken</span>
            <span className="text-gray-400 ml-1">(LTK)</span>
          </div>

          {/* Desktop Navigation */}
          {isDashboard && (
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => handleNavigation('claim')}
                className={`font-medium transition ${
                  currentPage === 'claim' ? 'text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-primary'
                }`}
              >
                Faucet
              </button>
              <button
                onClick={() => handleNavigation('portfolio')}
                className={`font-medium transition ${
                  currentPage === 'portfolio' ? 'text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-primary'
                }`}
              >
                Portfolio
              </button>
              <button
                onClick={() => handleNavigation('governance')}
                className={`font-medium transition ${
                  currentPage === 'governance' ? 'text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-primary'
                }`}
              >
                Governance
              </button>
            </div>
          )}

          {!isDashboard && (
            <div className="hidden md:flex items-center space-x-8">
              <button className="font-medium text-primary border-b-2 border-primary">Home</button>
              <button className="font-medium text-gray-600 hover:text-primary transition">Faucet</button>
              <button className="font-medium text-gray-600 hover:text-primary transition">Docs</button>
            </div>
          )}

          {/* Right Side - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-4">
                <div className="px-4 py-2 bg-gray-100 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">{formatAddress(address)}</p>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isLoading}
                className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition"
              >
                {isLoading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            {isConnected && <p className="text-xs font-medium text-primary">{formatAddress(address)}</p>}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-primary transition"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white pb-4">
            {isDashboard && (
              <>
                <button
                  onClick={() => handleNavigation('claim')}
                  className={`block w-full text-left px-4 py-3 font-medium ${
                    currentPage === 'claim' ? 'text-primary bg-gray-50' : 'text-gray-600'
                  }`}
                >
                  Faucet
                </button>
                <button
                  onClick={() => handleNavigation('portfolio')}
                  className={`block w-full text-left px-4 py-3 font-medium ${
                    currentPage === 'portfolio' ? 'text-primary bg-gray-50' : 'text-gray-600'
                  }`}
                >
                  Portfolio
                </button>
                <button
                  onClick={() => handleNavigation('governance')}
                  className={`block w-full text-left px-4 py-3 font-medium ${
                    currentPage === 'governance' ? 'text-primary bg-gray-50' : 'text-gray-600'
                  }`}
                >
                  Governance
                </button>
              </>
            )}

            <div className="border-t border-gray-200 pt-4 px-4 space-y-2">
              {isConnected ? (
                <button
                  onClick={disconnectWallet}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-primary text-white font-semibold rounded-lg disabled:opacity-50"
                >
                  {isLoading ? 'Connecting...' : 'Connect Wallet'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
