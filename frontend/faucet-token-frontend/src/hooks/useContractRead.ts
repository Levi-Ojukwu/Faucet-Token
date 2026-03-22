// src/hooks/useContractRead.ts
import { useState, useEffect, useCallback } from 'react'
import { Contract } from 'ethers'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../constants/contract'
import useRunners from './useRunner'

interface UseContractReadOptions {
  functionName: string
  args?: any[]
  enabled?: boolean
  watch?: boolean // re-fetch every block
}

interface UseContractReadResult<T> {
  data: T | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useContractRead<T = any>({
  functionName,
  args = [],
  enabled = true,
  watch = false,
}: UseContractReadOptions): UseContractReadResult<T> {
  const { readOnlyProvider } = useRunners()
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!enabled || !readOnlyProvider) return

    try {
      setIsLoading(true)
      setError(null)

      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, readOnlyProvider)
      const result = await contract[functionName](...args)
      setData(result as T)
    } catch (err) {
      const msg = err instanceof Error ? err.message : `Failed to read ${functionName}`
      setError(msg)
      console.error(`[useContractRead] ${functionName}:`, err)
    } finally {
      setIsLoading(false)
    }
  }, [functionName, JSON.stringify(args), enabled])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Optional: re-fetch on new blocks
  useEffect(() => {
    if (!watch || !readOnlyProvider) return
    const handler = () => fetchData()
    readOnlyProvider.on('block', handler)
    return () => { readOnlyProvider.off('block', handler) }
  }, [watch, readOnlyProvider, fetchData])

  return { data, isLoading, error, refetch: fetchData }
}