import { useState } from 'react'
import { useWallet } from '../context/WalletContext'
import { useContractRead } from '../hooks/useContractRead'
import { useContractWrite } from '../hooks/useContractWrite'
import { Send } from 'lucide-react'

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
  const [transferError, setTransferError] = useState<string | null>(null)

  // Read contract data
  const { data: balance } = useContractRead({
    contractAddress: '0x...',
    functionName: 'balanceOf',
    args: [address],
  })

  const { data: totalSupply } = useContractRead({
    contractAddress: '0x...',
    functionName: 'totalSupply',
  })

  const { write: transfer, isLoading: isTransferLoading } = useContractWrite({
    contractAddress: '0x...',
    functionName: 'transfer',
  })

  // Mock recent transactions
  const recentTransactions: Transaction[] = [
    {
      id: '1',
      type: 'claim',
      amount: '10.00',
      token: 'LTK',
      status: 'success',
      timestamp: 'TODAY, 10:45 AM',
      from: 'Faucet',
      to: address || '',
    },
    {
      id: '2',
      type: 'transfer',
      amount: '150.00',
      token: 'LTK',
      status: 'success',
      timestamp: 'YESTERDAY',
      from: address || '',
      to: '0x29...182c',
    },
    {
      id: '3',
      type: 'claim',
      amount: '10.00',
      token: 'LTK',
      status: 'success',
      timestamp: 'OCT 24, 2023',
      from: 'Faucet',
      to: address || '',
    },
    {
      id: '4',
      type: 'swap',
      amount: '2,500.00',
      token: 'LTK',
      status: 'success',
      timestamp: 'OCT 22, 2023',
      from: 'Internal',
      to: address || '',
    },
  ]

  const handleTransfer = async () => {
    setTransferError(null)

    if (!address) {
      setTransferError('Wallet not connected')
      return
    }

    if (!recipientAddress.trim()) {
      setTransferError('Please enter a recipient address')
      return
    }

    if (!transferAmount.trim() || isNaN(Number(transferAmount))) {
      setTransferError('Please enter a valid amount')
      return
    }

    try {
      const result = await transfer([recipientAddress, transferAmount])
      if (result) {
        setRecipientAddress('')
        setTransferAmount('')
        // Could show success message
      }
    } catch (err) {
      setTransferError(err instanceof Error ? err.message : 'Failed to transfer tokens')
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'claim':
        return '🌱'
      case 'transfer':
        return '📤'
      case 'swap':
        return '🔄'
      default:
        return '💱'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-700'
      case 'pending':
        return 'bg-warning bg-opacity-10 text-warning'
      case 'failed':
        return 'bg-error bg-opacity-10 text-error'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-dark">LeviToken</h2>
        <p className="text-gray-600 mt-1">Organic Faucet</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Total Assets Card */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">TOTAL ASSETS</p>
            <h3 className="text-4xl md:text-5xl font-bold text-dark">
              {balance || '0.00'}{' '}
              <span className="text-2xl md:text-3xl font-semibold text-gray-600">LTK</span>
            </h3>
            <p className="text-gray-600 text-sm mt-4">
              Your organic token holdings and asset distribution across the LeviToken network.
            </p>

            {/* Network Status */}
            <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">NETWORK</p>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-success rounded-full"></span>
                <p className="text-sm font-medium text-dark">Mainnet</p>
              </div>
            </div>
          </div>

          {/* Transfer Card */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2 mb-6">
              <Send size={20} className="text-primary-600" />
              <h4 className="text-xl font-bold text-dark">Transfer LTK</h4>
            </div>

            <div className="space-y-4">
              {/* Recipient Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Address</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <div className="flex">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 border-r-0 rounded-l-lg focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                  />
                  <div className="px-4 py-3 bg-gray-100 border border-gray-300 border-l-0 rounded-r-lg flex items-center font-medium text-gray-700">
                    LTK
                  </div>
                </div>
              </div>

              {/* Error */}
              {transferError && (
                <div className="p-3 bg-error bg-opacity-10 border border-error rounded-lg text-error text-sm">
                  {transferError}
                </div>
              )}

              {/* Send Button */}
              <button
                onClick={handleTransfer}
                disabled={isTransferLoading}
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition"
              >
                {isTransferLoading ? 'Sending...' : 'Send Tokens →'}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar - Recent Transactions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-bold text-dark">Recent Transactions</h4>
              <button className="text-primary-600 text-sm font-semibold hover:text-primary-700">View All</button>
            </div>

            <div className="space-y-4">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="pb-4 border-b border-gray-200 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="text-2xl">{getTransactionIcon(tx.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-dark capitalize line-clamp-1">{tx.type}</p>
                        <p className="text-xs text-gray-500">{tx.timestamp}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${tx.type === 'transfer' ? 'text-error' : 'text-success'}`}>
                        {tx.type === 'transfer' ? '-' : '+'}
                        {tx.amount} {tx.token}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${getStatusColor(tx.status)}`}>
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

      {/* Bottom Section */}
      <div className="bg-gradient-to-br from-primary from-10% to-primary to-90% rounded-2xl p-8 md:p-12 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-60 h-60 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10">
          <p className="text-xs font-semibold tracking-wider opacity-80 mb-3">SYSTEM INTEGRITY</p>
          <h3 className="text-3xl font-bold leading-tight">
            Built on the principles of organic growth and architectural precision.
          </h3>
        </div>
      </div>
    </div>
  )
}
