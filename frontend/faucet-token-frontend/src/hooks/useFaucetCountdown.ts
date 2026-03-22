// src/hooks/useFaucetCountdown.ts
import { useState, useEffect, useCallback } from 'react'
import { Contract } from 'ethers'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../constants/contract'
import useRunners from './useRunner'

interface CountdownState {
  hours: number
  minutes: number
  seconds: number
  isActive: boolean
  canClaim: boolean
  nextClaimTimestamp: number | null
}

/**
 * This hook reads `nextRequestTime(address)` from the blockchain
 * and runs a live countdown timer. Each address gets its own
 * isolated countdown — other users are never affected.
 */
export const useFaucetCountdown = (address: string | null): CountdownState => {
  const { readOnlyProvider } = useRunners()
  const [nextClaimTimestamp, setNextClaimTimestamp] = useState<number | null>(null)
  const [countdown, setCountdown] = useState<CountdownState>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isActive: false,
    canClaim: true,
    nextClaimTimestamp: null,
  })

  // Fetch next claim time from the contract
  const fetchNextClaimTime = useCallback(async () => {
    if (!address || !readOnlyProvider) return

    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, readOnlyProvider)
      const result: bigint = await contract.nextRequestTime(address)
      const timestamp = Number(result) // Unix timestamp in seconds

      if (timestamp === 0) {
        // 0 means user can claim now
        setNextClaimTimestamp(null)
      } else {
        // Convert to milliseconds
        setNextClaimTimestamp(timestamp * 1000)
      }
    } catch (err) {
      console.error('[useFaucetCountdown] fetchNextClaimTime:', err)
      // Fall back to localStorage if RPC fails
      const storageKey = `faucet_next_claim_${address.toLowerCase()}`
      const saved = localStorage.getItem(storageKey)
      if (saved) setNextClaimTimestamp(parseInt(saved, 10))
    }
  }, [address, readOnlyProvider])

  // Fetch on mount and when address changes
  useEffect(() => {
    fetchNextClaimTime()
  }, [fetchNextClaimTime])

  // Run the countdown timer
  useEffect(() => {
    if (!address) {
      setCountdown({ hours: 0, minutes: 0, seconds: 0, isActive: false, canClaim: true, nextClaimTimestamp: null })
      return
    }

    const tick = () => {
      if (!nextClaimTimestamp) {
        setCountdown({ hours: 0, minutes: 0, seconds: 0, isActive: false, canClaim: true, nextClaimTimestamp: null })
        return
      }

      const diff = nextClaimTimestamp - Date.now()

      if (diff <= 0) {
        setCountdown({ hours: 0, minutes: 0, seconds: 0, isActive: false, canClaim: true, nextClaimTimestamp: null })
        setNextClaimTimestamp(null)
        // Clear localStorage too
        localStorage.removeItem(`faucet_next_claim_${address.toLowerCase()}`)
        return
      }

      const totalSeconds = Math.floor(diff / 1000)
      setCountdown({
        hours: Math.floor(totalSeconds / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
        isActive: true,
        canClaim: false,
        nextClaimTimestamp,
      })
    }

    tick() // run immediately
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [nextClaimTimestamp, address])

  return countdown
}

// Call this after a successful claim so the UI updates immediately
// without waiting for the next blockchain read
export const setNextClaimTime = (address: string | null) => {
  if (!address) return
  const storageKey = `faucet_next_claim_${address.toLowerCase()}`
  const nextClaimTime = Date.now() + 24 * 60 * 60 * 1000
  localStorage.setItem(storageKey, nextClaimTime.toString())
}

export const clearClaimTime = (address: string | null) => {
  if (!address) return
  localStorage.removeItem(`faucet_next_claim_${address.toLowerCase()}`)
}