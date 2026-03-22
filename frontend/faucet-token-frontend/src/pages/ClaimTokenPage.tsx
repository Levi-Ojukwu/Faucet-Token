import { useState } from 'react'
import { useWallet } from '../context/WalletContext'
import { useContractWrite } from '../hooks/useContractWrite'
import { useFaucetCountdown, setNextClaimTime } from '../hooks/useFaucetCountdown'
import { Lock } from 'lucide-react'

export default function ClaimTokensPage() {
  const { address } = useWallet()
  const { hours, minutes, seconds, canClaim, isActive } = useFaucetCountdown()
  const [amount, setAmount] = useState('10')
  const [claimError, setClaimError] = useState<string | null>(null)

  const { write: requestToken, isLoading: isClaimLoading, isSuccess: isClaimSuccess } = useContractWrite({
    contractAddress: '0x...', // Will be replaced with actual contract address
    functionName: 'requestToken',
  })

  const handleClaimTokens = async () => {
    setClaimError(null)

    if (!address) {
      setClaimError('Wallet not connected')
      return
    }

    if (!canClaim) {
      setClaimError('Please wait for the cooldown period to end')
      return
    }

    try {
      const result = await requestToken([address, amount])
      if (result) {
        // Set the next claim time in localStorage
        setNextClaimTime(address)
        setTimeout(() => {
          window.location.reload() // Refresh to update countdown
        }, 1500)
      }
    } catch (err) {
      setClaimError(err instanceof Error ? err.message : 'Failed to claim tokens')
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
        {/* Main Content - Claim Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200">
            {/* Card Title */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-dark">Claim Daily LTK</h3>
              <p className="text-gray-600 text-sm mt-2">
                Harvest your ecosystem rewards every 24 hours.
              </p>
            </div>

            {/* Countdown Timer */}
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-8 mb-8 text-center">
              {isActive ? (
                <>
                  <div className="text-5xl md:text-6xl font-bold text-primary-600 font-mono tracking-tight">
                    {String(hours).padStart(2, '0')}h {String(minutes).padStart(2, '0')}m {String(seconds).padStart(2, '0')}s
                  </div>
                  <p className="text-gray-600 text-sm mt-3 uppercase tracking-wider">RETRY IN...</p>
                </>
              ) : (
                <>
                  <div className="text-5xl md:text-6xl font-bold text-success font-mono">READY</div>
                  <p className="text-gray-600 text-sm mt-3 uppercase tracking-wider">You can claim now</p>
                </>
              )}
            </div>

            {/* Claim Button or Unavailable */}
            {canClaim ? (
              <button
                onClick={handleClaimTokens}
                disabled={isClaimLoading}
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition mb-4"
              >
                {isClaimLoading ? 'Claiming...' : 'Claim Now'}
              </button>
            ) : (
              <button
                disabled
                className="w-full bg-gray-300 text-gray-500 py-3 px-6 rounded-lg font-semibold flex items-center justify-center space-x-2 cursor-not-allowed mb-4"
              >
                <Lock size={18} />
                <span>Claim Unavailable</span>
              </button>
            )}

            {/* Error Message */}
            {claimError && (
              <div className="p-4 bg-error bg-opacity-10 border border-error rounded-lg text-error text-sm">
                {claimError}
              </div>
            )}

            {/* Success Message */}
            {isClaimSuccess && (
              <div className="p-4 bg-success bg-opacity-10 border border-success rounded-lg text-success text-sm">
                Tokens claimed successfully!
              </div>
            )}

            {/* Info Box */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 leading-relaxed">
                Only one claim per wallet address is allowed every 24 hours to ensure fair protocol distribution.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar - Protocol Distribution */}
        <div className="lg:col-span-1 space-y-6">
          {/* Distribution Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h4 className="text-lg font-bold text-dark mb-4 flex items-center space-x-2">
              <span>Protocol Distribution</span>
            </h4>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-semibold text-dark">PROGRESS</p>
                <p className="text-sm font-semibold text-primary-600">72%</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div className="bg-primary-600 h-full rounded-full transition-all duration-500" style={{ width: '72%' }}></div>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Circulating</p>
                <p className="text-2xl font-bold text-dark">7,200,000</p>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Max Supply</p>
                <p className="text-2xl font-bold text-dark">10,000,000 LTK</p>
              </div>
            </div>
          </div>

          {/* Network Status Card */}
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white shadow-sm overflow-hidden">
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
