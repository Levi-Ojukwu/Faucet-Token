// src/hooks/useTransactionHistory.ts
import { useState, useEffect, useCallback } from 'react'
import { Contract, formatUnits, ZeroAddress } from 'ethers'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../constants/contract'
import useRunners from './useRunner'

export interface ChainTransaction {
  id: string
  type: 'claim' | 'mint' | 'transfer' | 'ownership'
  amount: string
  token: string
  status: 'success'
  timestamp: string   // e.g. "Mar 24, 2026, 10:45 AM"
  from: string
  to: string
  txHash: string
  blockNumber: number
}

// ─────────────────────────────────────────────
// Format a Unix timestamp (seconds) into a
// precise, human-readable date + time string.
// Examples:
//   "Today, 10:45 AM"
//   "Yesterday, 3:22 PM"
//   "Mar 18, 2026, 9:01 AM"
// ─────────────────────────────────────────────
const formatTimestamp = (unixSeconds: number): string => {
  // Convert seconds → milliseconds
  const date = new Date(unixSeconds * 1000)
  const now = new Date()

  // Midnight of today and yesterday (local time)
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterdayMidnight = new Date(todayMidnight)
  yesterdayMidnight.setDate(yesterdayMidnight.getDate() - 1)

  // Time portion — always show exact time
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })

  if (date >= todayMidnight) {
    return `Today, ${timeStr}`
  }
  if (date >= yesterdayMidnight) {
    return `Yesterday, ${timeStr}`
  }

  // Older: show full date + time
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  return `${dateStr}, ${timeStr}`
}

// ─────────────────────────────────────────────
// Truncate an address: "0x1234...abcd"
// ─────────────────────────────────────────────
export const truncateAddress = (addr: string): string => {
  if (!addr || addr === ZeroAddress) return 'N/A'
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

// ─────────────────────────────────────────────
// Block timestamp cache
// Avoids calling getBlock() multiple times for
// the same block number across many events.
// ─────────────────────────────────────────────
const blockTimestampCache = new Map<number, number>()

const getBlockTimestamp = async (
  provider: any,
  blockNumber: number
): Promise<number> => {
  // Return cached value immediately if available
  if (blockTimestampCache.has(blockNumber)) {
    return blockTimestampCache.get(blockNumber)!
  }

  try {
    // Fetch full block with transactions=false (faster)
    const block = await provider.getBlock(blockNumber, false)

    if (block && typeof block.timestamp === 'number' && block.timestamp > 0) {
      blockTimestampCache.set(blockNumber, block.timestamp)
      return block.timestamp
    }

    // Some RPCs return the timestamp as a bigint
    if (block && block.timestamp) {
      const ts = Number(block.timestamp)
      blockTimestampCache.set(blockNumber, ts)
      return ts
    }

    // If block is null (RPC issue), try fetching by hex block number
    const hexBlock = `0x${blockNumber.toString(16)}`
    const rawBlock = await provider.send('eth_getBlockByNumber', [hexBlock, false])
    if (rawBlock && rawBlock.timestamp) {
      const ts = parseInt(rawBlock.timestamp, 16)
      blockTimestampCache.set(blockNumber, ts)
      return ts
    }
  } catch (err) {
    console.warn(`[getBlockTimestamp] Failed for block ${blockNumber}:`, err)
  }

  // Last resort: return 0 so caller can show "Unknown"
  return 0
}

interface UseTransactionHistoryOptions {
  filterAddress?: string | null
}

interface UseTransactionHistoryResult {
  transactions: ChainTransaction[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useTransactionHistory = ({
  filterAddress,
}: UseTransactionHistoryOptions = {}): UseTransactionHistoryResult => {
  const { readOnlyProvider } = useRunners()
  const [transactions, setTransactions] = useState<ChainTransaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    if (!readOnlyProvider) return

    try {
      setIsLoading(true)
      setError(null)

      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, readOnlyProvider)

      // Scan from block 0 to catch all history
      // If your RPC limits range, increase scanFromBlock
      const currentBlock = await readOnlyProvider.getBlockNumber()
      const scanFromBlock = Math.max(0, currentBlock - 100_000)

      // ── Fetch all event types in parallel ──
      const [claimEvents, mintEvents, transferEvents, ownershipEvents] =
        await Promise.all([
          contract.queryFilter(contract.filters.FaucetClaim(), scanFromBlock),
          contract.queryFilter(contract.filters.Mint(), scanFromBlock),
          contract.queryFilter(contract.filters.Transfer(), scanFromBlock),
          contract.queryFilter(contract.filters.OwnershipTransferred(), scanFromBlock),
        ])

      // Track which tx hashes are already covered by FaucetClaim or Mint
      // so we don't double-count them in the Transfer list
      const claimHashes = new Set(claimEvents.map((e: any) => e.transactionHash))
      const mintHashes = new Set(mintEvents.map((e: any) => e.transactionHash))

      // ── Helper: get timestamp for an event ──
      const tsFor = async (e: any): Promise<string> => {
        const ts = await getBlockTimestamp(readOnlyProvider, e.blockNumber)
        return ts > 0 ? formatTimestamp(ts) : 'Unknown time'
      }

      // ── Process FaucetClaim events ──
      const claimTxs: ChainTransaction[] = await Promise.all(
        claimEvents.map(async (e: any) => ({
          id: `claim-${e.transactionHash}`,
          type: 'claim' as const,
          amount: parseFloat(formatUnits(e.args.amount, 18)).toFixed(2),
          token: 'LTK',
          status: 'success' as const,
          timestamp: await tsFor(e),
          from: 'Faucet',
          to: e.args.user,
          txHash: e.transactionHash,
          blockNumber: e.blockNumber,
        }))
      )

      // ── Process Mint events ──
      const mintTxs: ChainTransaction[] = await Promise.all(
        mintEvents.map(async (e: any) => ({
          id: `mint-${e.transactionHash}`,
          type: 'mint' as const,
          amount: parseFloat(formatUnits(e.args.amount, 18)).toFixed(2),
          token: 'LTK',
          status: 'success' as const,
          timestamp: await tsFor(e),
          from: 'Owner (Mint)',
          to: e.args.to,
          txHash: e.transactionHash,
          blockNumber: e.blockNumber,
        }))
      )

      // ── Process Transfer events (wallet-to-wallet only) ──
      const transferTxs: ChainTransaction[] = await Promise.all(
        transferEvents
          .filter((e: any) => {
            // Skip mint-type transfers (from = zero address)
            if (e.args.from === ZeroAddress) return false
            // Skip if already tracked as claim or mint
            if (claimHashes.has(e.transactionHash)) return false
            if (mintHashes.has(e.transactionHash)) return false
            return true
          })
          .map(async (e: any) => ({
            id: `transfer-${e.transactionHash}`,
            type: 'transfer' as const,
            amount: parseFloat(formatUnits(e.args.value, 18)).toFixed(2),
            token: 'LTK',
            status: 'success' as const,
            timestamp: await tsFor(e),
            from: e.args.from,
            to: e.args.to,
            txHash: e.transactionHash,
            blockNumber: e.blockNumber,
          }))
      )

      // ── Process OwnershipTransferred events ──
      const ownershipTxs: ChainTransaction[] = await Promise.all(
        ownershipEvents.map(async (e: any) => ({
          id: `ownership-${e.transactionHash}`,
          type: 'ownership' as const,
          amount: '0',
          token: '',
          status: 'success' as const,
          timestamp: await tsFor(e),
          from: e.args.oldOwner,
          to: e.args.newOwner,
          txHash: e.transactionHash,
          blockNumber: e.blockNumber,
        }))
      )

      // ── Merge and sort newest first ──
      let allTxs = [...claimTxs, ...mintTxs, ...transferTxs, ...ownershipTxs]
        .sort((a, b) => b.blockNumber - a.blockNumber)

      // ── Filter to a specific address if requested ──
      if (filterAddress) {
        const addr = filterAddress.toLowerCase()
        allTxs = allTxs.filter(
          (tx) =>
            tx.to.toLowerCase() === addr ||
            tx.from.toLowerCase() === addr
        )
      }

      setTransactions(allTxs)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch transactions'
      setError(msg)
      console.error('[useTransactionHistory]', err)
    } finally {
      setIsLoading(false)
    }
  }, [readOnlyProvider, filterAddress])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // Auto-refresh on every new block
  useEffect(() => {
    if (!readOnlyProvider) return
    const handler = () => fetchEvents()
    readOnlyProvider.on('block', handler)
    return () => { readOnlyProvider.off('block', handler) }
  }, [readOnlyProvider, fetchEvents])

  return { transactions, isLoading, error, refetch: fetchEvents }
}