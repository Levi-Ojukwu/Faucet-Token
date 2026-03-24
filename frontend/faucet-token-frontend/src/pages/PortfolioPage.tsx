// src/pages/PortfolioPage.tsx
import { useState } from 'react'
import { formatUnits } from 'ethers'
import { useWallet } from '../context/WalletContext'
import { useContractRead } from '../hooks/useContractRead'
import { useContractWrite } from '../hooks/useContractWrite'
import { useTransactionHistory, truncateAddress, type ChainTransaction } from '../hooks/useTransactionHistory'
import { Send, RefreshCw, ExternalLink } from 'lucide-react'

export default function PortfolioPage() {
  const { address } = useWallet()
  const [recipientAddress, setRecipientAddress] = useState('')
  const [transferAmount, setTransferAmount] = useState('')
  const [showAllTx, setShowAllTx] = useState(false)

  // ── READ hooks ──
  const {
    data: balanceRaw,
    isLoading: isBalanceLoading,
    refetch: refetchBalance,
  } = useContractRead<bigint>({
    functionName: 'balanceOf',
    args: [address],
    enabled: !!address,
  })

  // ── WRITE hook ──
  const {
    write: transfer,
    isLoading: isTransferLoading,
    isSuccess: isTransferSuccess,
    error: transferError,
    reset: resetTransfer,
  } = useContractWrite({ functionName: 'transfer' })

  // ── Transaction History filtered to connected wallet ──
  const {
    transactions,
    isLoading: isTxLoading,
    error: txError,
    refetch: refetchTx,
  } = useTransactionHistory({ filterAddress: address })

  const balance = balanceRaw ? formatUnits(balanceRaw, 18) : '0'
  const fmt = (n: string, dec = 2) =>
    parseFloat(n).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })

  const handleTransfer = async () => {
    resetTransfer()
    if (!recipientAddress || !transferAmount) return
    const result = await transfer([recipientAddress, transferAmount])
    if (result) {
      setRecipientAddress('')
      setTransferAmount('')
      setTimeout(() => { refetchBalance(); refetchTx() }, 3000)
    }
  }

  const displayedTxs = showAllTx ? transactions : transactions.slice(0, 4)

  // ── UI helpers ──
  const getTxIcon = (type: ChainTransaction['type']) => {
    const map = {
      claim:     { emoji: '🌱', bg: 'bg-green-50' },
      mint:      { emoji: '✨', bg: 'bg-purple-50' },
      transfer:  { emoji: '📤', bg: 'bg-red-50' },
      ownership: { emoji: '🛡️', bg: 'bg-yellow-50' },
    }
    return map[type] ?? { emoji: '💱', bg: 'bg-gray-50' }
  }

  const getTxLabel = (tx: ChainTransaction) => {
    const labels = { claim: 'Claim Faucet', mint: 'Token Mint', transfer: 'Transfer', ownership: 'Ownership Transfer' }
    return labels[tx.type] ?? 'Transaction'
  }

  const isOutgoing = (tx: ChainTransaction) =>
    tx.type === 'transfer' && tx.from.toLowerCase() === address?.toLowerCase()

  const getTxAmountDisplay = (tx: ChainTransaction) => {
    if (tx.type === 'ownership') return 'Ownership'
    const prefix = isOutgoing(tx) ? '-' : '+'
    return `${prefix}${parseFloat(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} ${tx.token}`
  }

  const getTxAmountColor = (tx: ChainTransaction) => {
    if (tx.type === 'ownership') return 'text-yellow-600'
    return isOutgoing(tx) ? 'text-red-500' : 'text-green-600'
  }

  const explorerUrl = (hash: string) => `https://sepolia-blockscout.lisk.com/tx/${hash}`

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-dark">LeviToken</h2>
        <p className="text-gray-600 mt-1">Organic Faucet</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Main ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Total Assets */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">TOTAL ASSETS</p>
            {isBalanceLoading ? (
              <div className="animate-pulse h-12 bg-gray-100 rounded w-48" />
            ) : (
              <h3 className="text-4xl md:text-5xl font-bold text-dark">
                {fmt(balance)}{' '}
                <span className="text-2xl md:text-3xl font-semibold text-gray-500">LTK</span>
              </h3>
            )}
            <p className="text-gray-500 text-sm mt-4">
              Your organic token holdings across the LeviToken network.
            </p>
            <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">NETWORK</p>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-success rounded-full" />
                <p className="text-sm font-medium text-dark">Lisk Sepolia</p>
              </div>
            </div>
          </div>

          {/* Transfer Card */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2 mb-6">
              <Send size={20} className="text-primary" />
              <h4 className="text-xl font-bold text-dark">Transfer LTK</h4>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Address</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <div className="flex">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 border-r-0 rounded-l-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  <div className="px-4 py-3 bg-gray-100 border border-gray-300 border-l-0 rounded-r-lg flex items-center font-medium text-gray-700">
                    LTK
                  </div>
                </div>
              </div>
              {transferError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{transferError}</div>
              )}
              {isTransferSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium">
                  ✅ Transfer sent! History will update shortly.
                </div>
              )}
              <button
                onClick={handleTransfer}
                disabled={isTransferLoading || !recipientAddress || !transferAmount}
                className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition"
              >
                {isTransferLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                    Sending...
                  </span>
                ) : 'Send Tokens →'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Sidebar: Live Transaction History ── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 sticky top-24">

            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-bold text-dark">Recent Transactions</h4>
              <button
                onClick={refetchTx}
                disabled={isTxLoading}
                title="Refresh"
                className="text-primary hover:opacity-70 transition disabled:opacity-40"
              >
                <RefreshCw size={16} className={isTxLoading ? 'animate-spin' : ''} />
              </button>
            </div>

            {/* Loading skeleton */}
            {isTxLoading && transactions.length === 0 && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                      <div className="h-2 bg-gray-100 rounded w-1/2" />
                    </div>
                    <div className="h-3 bg-gray-100 rounded w-16" />
                  </div>
                ))}
                <p className="text-xs text-gray-400 text-center pt-2">Scanning blockchain events...</p>
              </div>
            )}

            {/* Error */}
            {txError && !isTxLoading && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">
                Could not load transactions.{' '}
                <button onClick={refetchTx} className="underline font-medium">Retry</button>
              </div>
            )}

            {/* Empty */}
            {!isTxLoading && !txError && transactions.length === 0 && (
              <div className="text-center py-10">
                <p className="text-4xl mb-3">🌱</p>
                <p className="text-sm font-medium text-gray-600">No transactions yet</p>
                <p className="text-xs text-gray-400 mt-1">Claim your first tokens to get started!</p>
              </div>
            )}

            {/* Transaction rows */}
            {displayedTxs.length > 0 && (
              <div className="space-y-4">
                {displayedTxs.map((tx) => {
                  const { emoji, bg } = getTxIcon(tx.type)
                  return (
                    <div key={tx.id} className="pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${bg}`}>
                            {emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <p className="text-sm font-medium text-dark truncate">{getTxLabel(tx)}</p>
                              <a
                                href={explorerUrl(tx.txHash)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-primary flex-shrink-0"
                                title="View on Lisk explorer"
                              >
                                <ExternalLink size={11} />
                              </a>
                            </div>
                            <p className="text-xs text-gray-400">{tx.timestamp}</p>
                            <p className="text-xs text-gray-400 truncate font-mono">
                              {tx.type === 'ownership'
                                ? `→ ${truncateAddress(tx.to)}`
                                : tx.type === 'claim'
                                ? truncateAddress(tx.to)
                                : `${truncateAddress(tx.from)} → ${truncateAddress(tx.to)}`}
                            </p>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <p className={`text-sm font-semibold ${getTxAmountColor(tx)}`}>
                            {getTxAmountDisplay(tx)}
                          </p>
                          <span className="text-xs px-2 py-0.5 rounded-full inline-block mt-1 bg-green-100 text-green-700">
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* View all toggle */}
            {transactions.length > 4 && (
              <button
                onClick={() => setShowAllTx(!showAllTx)}
                className="w-full mt-5 text-primary text-sm font-semibold hover:opacity-80 transition"
              >
                {showAllTx ? 'Show Less ↑' : `View All (${transactions.length}) ↓`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="bg-primary rounded-2xl p-8 md:p-12 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-60 h-60 bg-white opacity-5 rounded-full blur-3xl" />
        <div className="relative z-10">
          <p className="text-xs font-semibold tracking-wider opacity-70 mb-3">SYSTEM INTEGRITY</p>
          <h3 className="text-3xl font-bold leading-tight">
            Built on the principles of organic growth and architectural precision.
          </h3>
        </div>
      </div>
    </div>
  )
}