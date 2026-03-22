import { useState, useEffect } from 'react'
import { useWallet } from '../context/WalletContext'

interface CountdownState {
  hours: number
  minutes: number
  seconds: number
  isActive: boolean
  canClaim: boolean
}

export const useFaucetCountdown = (): CountdownState => {
  const { address } = useWallet()
  const [countdown, setCountdown] = useState<CountdownState>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isActive: false,
    canClaim: true,
  })

  // Generate unique key for each address in localStorage
  const getStorageKey = (addr: string | null) => {
    return addr ? `faucet_next_claim_${addr.toLowerCase()}` : null
  }

  useEffect(() => {
    if (!address) {
      setCountdown({
        hours: 0,
        minutes: 0,
        seconds: 0,
        isActive: false,
        canClaim: true,
      })
      return
    }

    const storageKey = getStorageKey(address)
    if (!storageKey) return

    // Get the next claim time from localStorage
    const nextClaimStr = localStorage.getItem(storageKey)
    const nextClaimTime = nextClaimStr ? parseInt(nextClaimStr, 10) : null

    const updateCountdown = () => {
      if (!nextClaimTime) {
        setCountdown({
          hours: 0,
          minutes: 0,
          seconds: 0,
          isActive: false,
          canClaim: true,
        })
        return
      }

      const now = Date.now()
      const diff = nextClaimTime - now

      if (diff <= 0) {
        // Claim period is available
        setCountdown({
          hours: 0,
          minutes: 0,
          seconds: 0,
          isActive: false,
          canClaim: true,
        })
        // Clear the stored time
        localStorage.removeItem(storageKey)
      } else {
        // Still in cooldown
        const totalSeconds = Math.floor(diff / 1000)
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60

        setCountdown({
          hours,
          minutes,
          seconds,
          isActive: true,
          canClaim: false,
        })
      }
    }

    // Update immediately
    updateCountdown()

    // Set interval for countdown
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [address])

  return countdown
}

// Helper function to set the next claim time
export const setNextClaimTime = (address: string | null) => {
  if (!address) return
  const storageKey = `faucet_next_claim_${address.toLowerCase()}`
  const nextClaimTime = Date.now() + 24 * 60 * 60 * 1000 // 24 hours from now
  localStorage.setItem(storageKey, nextClaimTime.toString())
}

// Helper function to clear claim time
export const clearClaimTime = (address: string | null) => {
  if (!address) return
  const storageKey = `faucet_next_claim_${address.toLowerCase()}`
  localStorage.removeItem(storageKey)
}
