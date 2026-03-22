// src/App.tsx
import { WalletProvider, useWallet } from './context/WalletContext'
import LandingPage from './pages/LandingPage'
import DashboardLayout from './components/DashboardLayout'
import './connection' // Initialize AppKit
import './App.css'

function AppContent() {
  const { isConnected, isLoading } = useWallet()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-accent">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-primary font-medium">Connecting...</p>
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