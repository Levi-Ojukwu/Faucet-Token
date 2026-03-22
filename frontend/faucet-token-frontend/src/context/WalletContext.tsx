import React, { createContext, useContext, useState, useEffect } from 'react'

interface WalletContextType {
  isConnected: boolean
  address: string | null
  chainId: number | null
  balance: string | null
  isLoading: boolean
  error: string | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize wallet state from localStorage
  useEffect(() => {
    const savedAddress = localStorage.getItem('wallet_address')
    const savedChainId = localStorage.getItem('wallet_chainId')
    
    if (savedAddress) {
      setAddress(savedAddress)
      setIsConnected(true)
      if (savedChainId) {
        setChainId(Number(savedChainId))
      }
    }
  }, [])

  const connectWallet = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Placeholder for AppKit integration
      // This will be replaced with actual AppKit provider logic
      const mockAddress = '0x' + Math.random().toString(16).slice(2, 42)
      const mockChainId = 11155111 // Sepolia testnet
      
      setAddress(mockAddress)
      setChainId(mockChainId)
      setIsConnected(true)
      
      localStorage.setItem('wallet_address', mockAddress)
      localStorage.setItem('wallet_chainId', mockChainId.toString())
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet'
      setError(errorMessage)
      console.error('Wallet connection error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectWallet = () => {
    setAddress(null)
    setIsConnected(false)
    setChainId(null)
    setBalance(null)
    setError(null)
    
    localStorage.removeItem('wallet_address')
    localStorage.removeItem('wallet_chainId')
  }

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address,
        chainId,
        balance,
        isLoading,
        error,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
