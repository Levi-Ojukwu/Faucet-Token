// src/hooks/useContractWrite.ts
import { useState, useCallback } from 'react'
import { Contract, parseUnits } from 'ethers'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../constants/contract'
import useRunners from './useRunner'

interface UseContractWriteOptions {
  functionName: string
}

interface TxResult {
  hash: string
  status: 'success' | 'error'
  receipt: any
}

interface UseContractWriteResult {
  write: (args?: any[]) => Promise<TxResult | null>
  isLoading: boolean
  isSuccess: boolean
  error: string | null
  data: TxResult | null
  reset: () => void
}

// Helper: parse human-readable token amount to BigInt (18 decimals)
export const toTokenUnits = (amount: string | number): bigint => {
  return parseUnits(String(amount), 18)
}

// Helper: decode a custom contract error
const decodeContractError = (err: any): string => {
  // Ethers v6 wraps revert data in err.data or err.revert
  const errorMessage: string = err?.message ?? ''

  if (errorMessage.includes('COOLDOWNACTIVE')) {
    // Extract timeRemaining from the error if possible
    const match = errorMessage.match(/timeRemaining=(\d+)/)
    if (match) {
      const seconds = Number(match[1])
      const h = Math.floor(seconds / 3600)
      const m = Math.floor((seconds % 3600) / 60)
      const s = seconds % 60
      return `Cooldown active. Retry in ${h}h ${m}m ${s}s`
    }
    return 'Cooldown active. Please wait 24 hours between claims.'
  }
  if (errorMessage.includes('NOTOWNER')) return 'Only the contract owner can perform this action.'
  if (errorMessage.includes('INVALIDADDRESS')) return 'Invalid address provided.'
  if (errorMessage.includes('INVALIDAMOUNT')) return 'Amount must be greater than zero.'
  if (errorMessage.includes('MAXSUPPLYEXCEEDED')) return 'Cannot exceed maximum supply of 10,000,000 LTK.'
  if (errorMessage.includes('user rejected')) return 'Transaction was rejected in your wallet.'
  if (errorMessage.includes('insufficient funds')) return 'Insufficient ETH for gas fees.'

  return errorMessage || `Transaction failed.`
}

export function useContractWrite({ functionName }: UseContractWriteOptions): UseContractWriteResult {
  const { signer } = useRunners()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<TxResult | null>(null)

  const write = useCallback(async (args: any[] = []): Promise<TxResult | null> => {
    if (!signer) {
      setError('Wallet not connected. Please connect your wallet first.')
      return null
    }

    try {
      setIsLoading(true)
      setError(null)
      setIsSuccess(false)

      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

      // Auto-convert token amounts for functions that expect wei
      let processedArgs = [...args]

      if (functionName === 'mint') {
        // args: [address, humanReadableAmount]
        if (processedArgs[1] !== undefined) {
          processedArgs[1] = toTokenUnits(processedArgs[1])
        }
      }

      if (functionName === 'transfer') {
        // args: [address, humanReadableAmount]
        if (processedArgs[1] !== undefined) {
          processedArgs[1] = toTokenUnits(processedArgs[1])
        }
      }

      if (functionName === 'approve') {
        if (processedArgs[1] !== undefined) {
          processedArgs[1] = toTokenUnits(processedArgs[1])
        }
      }

      // Send the transaction
      const tx = await contract[functionName](...processedArgs)

      // Wait for 1 confirmation
      const receipt = await tx.wait(1)

      const result: TxResult = {
        hash: tx.hash,
        status: 'success',
        receipt,
      }

      setData(result)
      setIsSuccess(true)
      return result
    } catch (err: any) {
      const decoded = decodeContractError(err)
      setError(decoded)
      console.error(`[useContractWrite] ${functionName}:`, err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [signer, functionName])

  const reset = useCallback(() => {
    setIsLoading(false)
    setIsSuccess(false)
    setError(null)
    setData(null)
  }, [])

  return { write, isLoading, isSuccess, error, data, reset }
}