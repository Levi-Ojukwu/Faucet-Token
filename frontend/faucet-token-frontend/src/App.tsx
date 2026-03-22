import { useState, useEffect } from 'react'
import { WalletProvider, useWallet } from './context/WalletContext'
import LandingPage from './pages/LandingPage'
import DashboardLayout from './components/DashboardLayout'
// import './index.css'
import "./App.css"

function AppContent() {
  const { isConnected } = useWallet()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Check if wallet was previously connected
    const savedAddress = localStorage.getItem('wallet_address')
    if (savedAddress) {
      setIsInitialized(true)
    } else {
      setIsInitialized(true)
    }
  }, [])

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-accent">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-primary font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return isConnected ? <DashboardLayout /> : <LandingPage />
}

export default function App() {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  )
}
