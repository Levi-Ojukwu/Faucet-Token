// src/pages/AdminSuitePage.tsx
import { useState } from 'react'
import { formatUnits } from 'ethers'
import { useWallet } from '../context/WalletContext'
import { useContractRead } from '../hooks/useContractRead'
import { useContractWrite } from '../hooks/useContractWrite'
import { AlertTriangle } from 'lucide-react'

export default function AdminSuitePage() {
  const { address } = useWallet()
  const [mintRecipient, setMintRecipient] = useState('')
  const [mintAmount, setMintAmount] = useState('')
  const [newOwner, setNewOwner] = useState('')
  const [showTransferWarning, setShowTransferWarning] = useState(false)

  // Read hooks
  const { data: ownerAddress } = useContractRead<string>({
    functionName: 'owner',
  })

  const { data: totalSupplyRaw, refetch: refetchSupply } = useContractRead<bigint>({
    functionName: 'totalSupply',
  })

  const { data: maxSupplyRaw } = useContractRead<bigint>({
    functionName: 'maxSupply',
  })

  // ── WRITE hooks ──
  const {
    write: mint,
    isLoading: isMintLoading,
    isSuccess: isMintSuccess,
    error: mintError,
    reset: resetMint,
  } = useContractWrite({ functionName: 'mint' })

  const {
    write: transferOwnership,
    isLoading: isTransferLoading,
    isSuccess: isTransferSuccess,
    error: transferOwnerError,
    reset: resetTransfer,
  } = useContractWrite({ functionName: 'transferOwnership' })

  // Format values
  const totalSupply = totalSupplyRaw ? parseFloat(formatUnits(totalSupplyRaw, 18)) : 0
  const maxSupply = maxSupplyRaw ? parseFloat(formatUnits(maxSupplyRaw, 18)) : 10_000_000
  const progressPct = maxSupply > 0 ? Math.min(100, Math.round((totalSupply / maxSupply) * 100)) : 0
  const remaining = (maxSupply - totalSupply).toLocaleString('en-US', { maximumFractionDigits: 0 })

  const isOwner =
    !!address &&
    !!ownerAddress &&
    address.toLowerCase() === ownerAddress.toLowerCase()

  const handleMint = async () => {
    resetMint()
    const result = await mint([mintRecipient, mintAmount])
    if (result) {
      setMintRecipient('')
      setMintAmount('')
      refetchSupply()
    }
  }

  const handleTransferOwnership = async () => {
    resetTransfer()
    const result = await transferOwnership([newOwner])
    if (result) {
      setNewOwner('')
      setShowTransferWarning(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold tracking-wider mb-4">
          <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2" />
          OWNER ONLY ACCESS
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-dark">Admin Suite</h2>
        <p className="text-gray-600 mt-2">
          Manage the LTK ecosystem's core functions and ownership protocols.
        </p>
      </div>

      {/* Owner info */}
      {ownerAddress && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-500">
          Contract owner: <span className="font-mono text-dark">{ownerAddress}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Main ── */}
        <div className="lg:col-span-2 space-y-6">
          {!isOwner && address && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm font-medium">
              ⚠️ You do not have owner privileges. Connect the owner wallet to use these functions.
            </div>
          )}

          {/* Mint Tokens */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-2xl">➕</span>
              <h4 className="text-xl font-bold text-dark">Mint Tokens</h4>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">RECIPIENT ADDRESS</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={mintRecipient}
                  onChange={(e) => setMintRecipient(e.target.value)}
                  disabled={!isOwner}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">TOKEN AMOUNT</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  disabled={!isOwner}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              {mintError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {mintError}
                </div>
              )}
              {isMintSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium">
                  ✅ Tokens minted successfully!
                </div>
              )}

              <button
                onClick={handleMint}
                disabled={!isOwner || isMintLoading || !mintRecipient || !mintAmount}
                className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isMintLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                    Executing...
                  </span>
                ) : (
                  'Execute Mint Transaction'
                )}
              </button>
            </div>
          </div>

          {/* Ownership Transfer */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-2xl">🛡️</span>
              <h4 className="text-xl font-bold text-dark">Ownership Management</h4>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">NEW OWNER ADDRESS</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                  disabled={!isOwner}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-600 text-sm">
                  This action is irreversible. Transferring ownership will remove your administrative privileges immediately.
                </p>
              </div>

              {transferOwnerError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {transferOwnerError}
                </div>
              )}
              {isTransferSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium">
                  ✅ Ownership transferred successfully!
                </div>
              )}

              {!showTransferWarning ? (
                <button
                  onClick={() => setShowTransferWarning(true)}
                  disabled={!isOwner || !newOwner.trim()}
                  className="w-full bg-secondary text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Transfer Ownership
                </button>
              ) : (
                <div className="space-y-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-700 text-sm font-semibold">⚠️ Are you sure? This is irreversible.</p>
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
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 disabled:opacity-50 transition"
                    >
                      {isTransferLoading ? 'Processing...' : 'Confirm Transfer'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 sticky top-24">
            <h4 className="text-lg font-bold text-dark mb-6">SUPPLY METRICS</h4>

            <div className="mb-6">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Current Circulating Supply</p>
              <p className="text-3xl font-bold text-dark">
                {totalSupply.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                <span className="text-sm text-gray-500 ml-2">
                  / {maxSupply.toLocaleString('en-US', { maximumFractionDigits: 0 })} LTK
                </span>
              </p>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">USAGE</p>
                <p className="text-xs text-gray-600 font-semibold">{progressPct}%</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            <div className="space-y-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">USAGE</p>
                <p className="text-xs text-gray-700 font-semibold">{progressPct}%</p>
              </div>
              <div className="flex justify-between">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">REMAINING</p>
                <p className="text-xs text-gray-700 font-semibold">{remaining} LTK</p>
              </div>
            </div>
          </div>

          <div className="bg-primary rounded-2xl p-6 text-white shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl" />
            <div className="relative z-10">
              <p className="text-xs font-semibold tracking-wider opacity-70 mb-3">ECOSYSTEM VISION</p>
              <p className="text-lg font-bold leading-tight">Built on solid architectural foundations.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}