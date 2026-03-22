// src/context/WalletContext.tsx
import React, { createContext, useContext, useCallback } from 'react'
import { useAppKit, useAppKitAccount, useAppKitNetwork, useDisconnect } from '@reown/appkit/react'

interface WalletContextType {
  isConnected: boolean
  address: string | null
  chainId: number | null
  isLoading: boolean
  connectWallet: () => void
  disconnectWallet: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { open } = useAppKit()
  const { address, isConnected, status } = useAppKitAccount()
  const { chainId } = useAppKitNetwork()
  const { disconnect } = useDisconnect()

  const connectWallet = useCallback(() => {
    open()
  }, [open])

  const disconnectWallet = useCallback(() => {
    disconnect()
  }, [disconnect])

  const isLoading = status === 'connecting' || status === 'reconnecting'

  return (
    <WalletContext.Provider
      value={{
        isConnected: isConnected ?? false,
        address: address ?? null,
        chainId: chainId ? Number(chainId) : null,
        isLoading,
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
  if (!context) throw new Error('useWallet must be used within a WalletProvider')
  return context
}