// src/pages/PortfolioPage.tsx
// import { useState, useEffect } from 'react'
import { formatUnits } from 'ethers'
import { useWallet } from '../context/WalletContext'
import { useContractRead } from '../hooks/useContractRead'
import { useContractWrite } from '../hooks/useContractWrite'
import { Send } from 'lucide-react'
import { useState } from 'react'

interface Transaction {
  id: string
  type: 'claim' | 'transfer' | 'swap'
  amount: string
  token: string
  status: 'success' | 'pending' | 'failed'
  timestamp: string
  from: string
  to: string
}

export default function PortfolioPage() {
  const { address } = useWallet()
  const [recipientAddress, setRecipientAddress] = useState('')
  const [transferAmount, setTransferAmount] = useState('')

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

//   const { data: totalSupplyRaw } = useContractRead<bigint>({
//     functionName: 'totalSupply',
//   })

//   const { data: maxSupplyRaw } = useContractRead<bigint>({
//     functionName: 'maxSupply',
//   })

  // ── WRITE hook ──
  const {
    write: transfer,
    isLoading: isTransferLoading,
    isSuccess: isTransferSuccess,
    error: transferError,
    reset: resetTransfer,
  } = useContractWrite({ functionName: 'transfer' })

  // Format numbers
  const balance = balanceRaw ? formatUnits(balanceRaw, 18) : '0'
//   const totalSupply = totalSupplyRaw ? formatUnits(totalSupplyRaw, 18) : '0'
//   const maxSupply = maxSupplyRaw ? formatUnits(maxSupplyRaw, 18) : '10000000'
//   const progressPct =
//     totalSupplyRaw && maxSupplyRaw
//       ? Math.min(100, Math.round((Number(formatUnits(totalSupplyRaw, 18)) / Number(formatUnits(maxSupplyRaw, 18))) * 100))
//       : 0

  const fmt = (n: string, dec = 2) =>
    parseFloat(n).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })

  const truncate = (addr: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : ''

  const handleTransfer = async () => {
    resetTransfer()
    if (!recipientAddress || !transferAmount) return

    const result = await transfer([recipientAddress, transferAmount])
    if (result) {
      setRecipientAddress('')
      setTransferAmount('')
      // Refetch balance after a short delay (let the block confirm)
      setTimeout(() => refetchBalance(), 3000)
    }
  }

  // Mock recent transactions — in a real app you'd index contract events
  const recentTransactions: Transaction[] = [
    {
      id: '1', type: 'claim', amount: '10.00', token: 'LTK',
      status: 'success', timestamp: 'TODAY, 10:45 AM',
      from: 'Faucet', to: address || '',
    },
    {
      id: '2', type: 'transfer', amount: '150.00', token: 'LTK',
      status: 'success', timestamp: 'YESTERDAY',
      from: address || '', to: '0x29...182c',
    },
    {
      id: '3', type: 'claim', amount: '10.00', token: 'LTK',
      status: 'success', timestamp: 'OCT 24, 2023',
      from: 'Faucet', to: address || '',
    },
    {
      id: '4', type: 'swap', amount: '2,500.00', token: 'LTK',
      status: 'success', timestamp: 'OCT 22, 2023',
      from: 'Internal', to: address || '',
    },
  ]

  const getIcon = (type: string) => ({ claim: '🌱', transfer: '📤', swap: '🔄' }[type] ?? '💱')
  const getStatusStyle = (s: string) =>
    ({ success: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700', failed: 'bg-red-100 text-red-600' }[s] ?? 'bg-gray-100 text-gray-600')

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
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {transferError}
                </div>
              )}
              {isTransferSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium">
                  ✅ Transfer sent successfully!
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
                ) : (
                  'Send Tokens →'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-bold text-dark">Recent Transactions</h4>
              <button className="text-primary text-sm font-semibold hover:opacity-80">View All</button>
            </div>

            <div className="space-y-4">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                        tx.type === 'claim' ? 'bg-green-50' : tx.type === 'transfer' ? 'bg-red-50' : 'bg-blue-50'
                      }`}>
                        {getIcon(tx.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-dark capitalize">
                          {tx.type === 'claim' ? 'Claim Faucet' : tx.type === 'transfer' ? 'Transfer' : 'Asset Swap'}
                        </p>
                        <p className="text-xs text-gray-400">{tx.timestamp}</p>
                        <p className="text-xs text-gray-400">{truncate(tx.type === 'transfer' ? tx.to : tx.from)}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-semibold ${tx.type === 'transfer' ? 'text-red-500' : 'text-green-600'}`}>
                        {tx.type === 'transfer' ? '-' : '+'}{tx.amount} {tx.token}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${getStatusStyle(tx.status)}`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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