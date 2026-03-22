// src/components/Navbar.tsx
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { useWallet } from '../context/WalletContext'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

interface NavbarProps {
  isDashboard?: boolean
  currentPage?: string
  onNavigate?: (page: string) => void
}

export default function Navbar({ isDashboard = false, currentPage = 'home', onNavigate }: NavbarProps) {
  const { disconnectWallet, isConnected } = useWallet()
  const { open } = useAppKit()
  const { address } = useAppKitAccount()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const truncate = (addr?: string | null) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : ''

  const handleNav = (page: string) => {
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
            {/* <span className="text-gray-400 ml-1">(LTK)</span> */}
          </div>

          {/* Desktop Nav */}
          {isDashboard && (
            <div className="hidden md:flex items-center space-x-8">
              {['claim', 'portfolio', 'governance'].map((page) => (
                <button
                  key={page}
                  onClick={() => handleNav(page)}
                  className={`font-medium capitalize transition ${
                    currentPage === page
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  {page === 'claim' ? 'Faucet' : page === 'governance' ? 'Admin Suite' : 'Portfolio'}
                </button>
              ))}
            </div>
          )}

          {!isDashboard && (
            <div className="hidden md:flex items-center space-x-8">
              {/* <button className="font-medium text-primary border-b-2 border-primary">Home</button> */}
              {/* <button className="font-medium text-gray-600 hover:text-primary transition">Faucet</button> */}
              {/* <button className="font-medium text-gray-600 hover:text-primary transition">Docs</button> */}
            </div>
          )}

          {/* Desktop Right */}
          <div className="hidden md:flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="px-4 py-2 bg-gray-100 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 font-mono">{truncate(address)}</p>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="px-5 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition text-sm"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => open()}
                className="px-6 py-2 bg-[#4d5b49] text-white font-semibold rounded-lg hover:bg-primary-700 transition text-sm"
              >
                Connect Wallet
              </button>
            )}
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center space-x-3">
            {isConnected && (
              <p className="text-xs font-medium text-primary font-mono">{truncate(address)}</p>
            )}
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
                {['claim', 'portfolio', 'governance'].map((page) => (
                  <button
                    key={page}
                    onClick={() => handleNav(page)}
                    className={`block w-full text-left px-4 py-3 font-medium capitalize ${
                      currentPage === page ? 'text-primary bg-gray-50' : 'text-gray-600'
                    }`}
                  >
                    {page === 'claim' ? 'Faucet' : page === 'governance' ? 'Admin Suite' : 'Portfolio'}
                  </button>
                ))}
              </>
            )}
            <div className="border-t border-gray-200 pt-4 px-4">
              {isConnected ? (
                <button
                  onClick={disconnectWallet}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={() => open()}
                  className="w-full px-4 py-2 bg-primary text-white font-semibold rounded-lg"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}