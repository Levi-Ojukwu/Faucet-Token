import { useState } from 'react'
import { useWallet } from '../context/WalletContext'
import { useContractRead } from '../hooks/useContractRead'
import { useContractWrite } from '../hooks/useContractWrite'
import { AlertTriangle } from 'lucide-react'

export default function AdminSuitePage() {
  const { address } = useWallet()
  const [mintRecipient, setMintRecipient] = useState('')
  const [mintAmount, setMintAmount] = useState('')
  const [newOwner, setNewOwner] = useState('')
  const [mintError, setMintError] = useState<string | null>(null)
  const [transferOwnerError, setTransferOwnerError] = useState<string | null>(null)
  const [showTransferWarning, setShowTransferWarning] = useState(false)

  // Read contract data
  const { data: owner } = useContractRead({
    contractAddress: '0x...',
    functionName: 'owner',
  })

  const { data: totalSupply } = useContractRead({
    contractAddress: '0x...',
    functionName: 'totalSupply',
  })

  const { data: maxSupply } = useContractRead({
    contractAddress: '0x...',
    functionName: 'maxSupply',
  })

  const { write: mint, isLoading: isMintLoading } = useContractWrite({
    contractAddress: '0x...',
    functionName: 'mint',
  })

  const { write: transferOwnership, isLoading: isTransferLoading } = useContractWrite({
    contractAddress: '0x...',
    functionName: 'transferOwnership',
  })

  const handleMint = async () => {
    setMintError(null)

    if (!address) {
      setMintError('Wallet not connected')
      return
    }

    if (address.toLowerCase() !== owner?.toLowerCase?.()) {
      setMintError('Only the contract owner can mint tokens')
      return
    }

    if (!mintRecipient.trim()) {
      setMintError('Please enter a recipient address')
      return
    }

    if (!mintAmount.trim() || isNaN(Number(mintAmount))) {
      setMintError('Please enter a valid amount')
      return
    }

    const amount = Number(mintAmount)
    const current = Number(totalSupply || 0)
    const max = Number(maxSupply || 10000000)

    if (current + amount > max) {
      setMintError(`Cannot mint. Maximum supply is ${max} LTK. Current supply: ${current} LTK`)
      return
    }

    try {
      const result = await mint([mintRecipient, mintAmount])
      if (result) {
        setMintRecipient('')
        setMintAmount('')
      }
    } catch (err) {
      setMintError(err instanceof Error ? err.message : 'Failed to mint tokens')
    }
  }

  const handleTransferOwnership = async () => {
    setTransferOwnerError(null)

    if (!address) {
      setTransferOwnerError('Wallet not connected')
      return
    }

    if (address.toLowerCase() !== owner?.toLowerCase?.()) {
      setTransferOwnerError('Only the contract owner can transfer ownership')
      return
    }

    if (!newOwner.trim()) {
      setTransferOwnerError('Please enter a new owner address')
      return
    }

    if (!showTransferWarning) {
      return
    }

    try {
      const result = await transferOwnership([newOwner])
      if (result) {
        setNewOwner('')
        setShowTransferWarning(false)
      }
    } catch (err) {
      setTransferOwnerError(err instanceof Error ? err.message : 'Failed to transfer ownership')
    }
  }

  const isOwner = address?.toLowerCase() === owner?.toLowerCase?.()

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold tracking-wider mb-4">
          <span className="w-2 h-2 bg-yellow-600 rounded-full mr-2"></span>
          OWNER ONLY ACCESS
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-dark">Admin Suite</h2>
        <p className="text-gray-600 mt-2">
          Manage the LTK ecosystem's core functions and ownership protocols through the architectural control plane.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {!isOwner && (
            <div className="p-4 bg-warning bg-opacity-10 border border-warning rounded-lg text-warning text-sm font-medium">
              You do not have owner privileges to access these functions.
            </div>
          )}

          {/* Mint Tokens Card */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-2xl">➕</span>
              <h4 className="text-xl font-bold text-dark">Mint Tokens</h4>
            </div>

            <div className="space-y-4">
              {/* Recipient Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">RECIPIENT ADDRESS</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={mintRecipient}
                  onChange={(e) => setMintRecipient(e.target.value)}
                  disabled={!isOwner}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">TOKEN AMOUNT</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  disabled={!isOwner}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Error */}
              {mintError && (
                <div className="p-3 bg-error bg-opacity-10 border border-error rounded-lg text-error text-sm">
                  {mintError}
                </div>
              )}

              {/* Mint Button */}
              <button
                onClick={handleMint}
                disabled={!isOwner || isMintLoading}
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isMintLoading ? 'Executing...' : 'Execute Mint Transaction'}
              </button>
            </div>
          </div>

          {/* Ownership Management Card */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-2xl">🛡️</span>
              <h4 className="text-xl font-bold text-dark">Ownership Management</h4>
            </div>

            <div className="space-y-4">
              {/* New Owner Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">NEW OWNER ADDRESS</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                  disabled={!isOwner}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Warning Message */}
              <div className="p-4 bg-error bg-opacity-10 border border-error rounded-lg flex items-start space-x-3">
                <AlertTriangle size={20} className="text-error flex-shrink-0 mt-0.5" />
                <p className="text-error text-sm">
                  This action is irreversible. Transferring ownership will remove your administrative privileges immediately.
                </p>
              </div>

              {/* Error */}
              {transferOwnerError && (
                <div className="p-3 bg-error bg-opacity-10 border border-error rounded-lg text-error text-sm">
                  {transferOwnerError}
                </div>
              )}

              {/* Confirm Transfer Button */}
              {!showTransferWarning ? (
                <button
                  onClick={() => setShowTransferWarning(true)}
                  disabled={!isOwner || !newOwner.trim()}
                  className="w-full bg-secondary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Transfer Ownership
                </button>
              ) : (
                <div className="space-y-3 p-4 bg-warning bg-opacity-10 border border-warning rounded-lg">
                  <p className="text-warning text-sm font-semibold">Are you sure? This is irreversible.</p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowTransferWarning(false)}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleTransferOwnership}
                      disabled={isTransferLoading}
                      className="flex-1 px-4 py-2 bg-error text-white rounded-lg font-semibold hover:bg-opacity-90 disabled:opacity-50 transition"
                    >
                      {isTransferLoading ? 'Processing...' : 'Confirm Transfer'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Supply Metrics */}
        <div className="lg:col-span-1 space-y-6">
          {/* Supply Metrics Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 sticky top-24">
            <h4 className="text-lg font-bold text-dark mb-6">SUPPLY METRICS</h4>

            {/* Current Supply */}
            <div className="mb-6">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Current Circulating Supply</p>
              <p className="text-3xl font-bold text-dark">
                {totalSupply || '0'}
                <span className="text-sm text-gray-600 ml-2">/ {maxSupply || '10,000,000'} LTK</span>
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">USAGE</p>
                <p className="text-xs text-gray-500 font-semibold">
                  {totalSupply && maxSupply ? Math.round((Number(totalSupply) / Number(maxSupply)) * 100) : 0}%
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-primary-600 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${totalSupply && maxSupply ? Math.round((Number(totalSupply) / Number(maxSupply)) * 100) : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Remaining */}
            <div className="space-y-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">USAGE</p>
                <p className="text-xs text-gray-700 font-semibold">20%</p>
              </div>
              <div className="flex justify-between">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">REMAINING</p>
                <p className="text-xs text-gray-700 font-semibold">8.0M</p>
              </div>
            </div>
          </div>

          {/* Network Status Card */}
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white shadow-sm overflow-hidden relative">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            </div>
            <div className="relative z-10">
              <p className="text-xs font-semibold tracking-wider opacity-80 mb-3">ECOSYSTEM VISION</p>
              <p className="text-lg font-bold leading-tight">
                Built on solid architectural foundations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
