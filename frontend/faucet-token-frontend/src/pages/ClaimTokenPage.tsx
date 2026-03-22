// src/pages/ClaimTokenPage.tsx
// import { useEffect } from 'react'
import { formatUnits } from 'ethers'
import { useWallet } from '../context/WalletContext'
import { useContractRead } from '../hooks/useContractRead'
import { useContractWrite } from '../hooks/useContractWrite'
import { useFaucetCountdown, setNextClaimTime } from '../hooks/useFaucetCountdown'
import { Lock } from 'lucide-react'

export default function ClaimTokensPage() {
  const { address } = useWallet()

  const { data: totalSupplyRaw, refetch: refetchSupply } = useContractRead<bigint>({
    functionName: 'totalSupply',
  })
  const { data: maxSupplyRaw } = useContractRead<bigint>({
    functionName: 'maxSupply',
  })
  const { data: faucetAmountRaw } = useContractRead<bigint>({
    functionName: 'faucetAmount',
  })

  const {
    write: requestToken,
    isLoading: isClaimLoading,
    isSuccess: isClaimSuccess,
    error: claimError,
    reset: resetClaim,
  } = useContractWrite({ functionName: 'requestToken' })

  const { hours, minutes, seconds, canClaim, isActive } = useFaucetCountdown(address)

  // Format display values
  const totalSupply = totalSupplyRaw ? formatUnits(totalSupplyRaw, 18) : '0'
  const maxSupply = maxSupplyRaw ? formatUnits(maxSupplyRaw, 18) : '10,000,000'
  const faucetAmount = faucetAmountRaw ? formatUnits(faucetAmountRaw, 18) : '10'
  const progressPct =
    totalSupplyRaw && maxSupplyRaw
      ? Math.min(100, Math.round((Number(formatUnits(totalSupplyRaw, 18)) / Number(formatUnits(maxSupplyRaw, 18))) * 100))
      : 0

  const formatNumber = (n: string) =>
    parseFloat(n).toLocaleString('en-US', { maximumFractionDigits: 0 })

  const handleClaim = async () => {
    resetClaim()
    if (!address) return
    const result = await requestToken([])
    if (result) {
      // Optimistically set next claim time so countdown starts immediately
      setNextClaimTime(address)
      refetchSupply()
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-dark">LeviToken</h2>
        <p className="text-gray-600 mt-1">Organic Faucet</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Main Claim Card ── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-dark">Claim Daily LTK</h3>
              <p className="text-gray-600 text-sm mt-2">
                Harvest {faucetAmount} LTK ecosystem rewards every 24 hours.
              </p>
            </div>

            {/* Countdown Timer */}
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-8 mb-8 text-center">
              {isActive ? (
                <>
                  <div className="text-5xl md:text-6xl font-bold text-primary font-mono tracking-tight">
                    {String(hours).padStart(2, '0')}h{' '}
                    {String(minutes).padStart(2, '0')}m{' '}
                    {String(seconds).padStart(2, '0')}s
                  </div>
                  <p className="text-gray-500 text-sm mt-3 uppercase tracking-wider">RETRY IN...</p>
                </>
              ) : (
                <>
                  <div className="text-5xl md:text-6xl font-bold text-success font-mono">READY</div>
                  <p className="text-gray-500 text-sm mt-3 uppercase tracking-wider">You can claim now</p>
                </>
              )}
            </div>

            {/* Claim / Locked Button */}
            {canClaim ? (
              <button
                onClick={handleClaim}
                disabled={isClaimLoading || !address}
                className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition mb-4"
              >
                {isClaimLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Claiming...
                  </span>
                ) : (
                  `Claim ${faucetAmount} LTK`
                )}
              </button>
            ) : (
              <button
                disabled
                className="w-full bg-gray-200 text-gray-400 py-3 px-6 rounded-lg font-semibold flex items-center justify-center space-x-2 cursor-not-allowed mb-4"
              >
                <Lock size={18} />
                <span>Claim Unavailable</span>
              </button>
            )}

            {/* Error */}
            {claimError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {claimError}
              </div>
            )}

            {/* Success */}
            {isClaimSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium">
                🎉 {faucetAmount} LTK claimed successfully! Check your wallet.
              </div>
            )}

            {/* Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 leading-relaxed">
                One claim per wallet every 24 hours — enforced on-chain. Your countdown is tied
                to your address and does not affect other users.
              </p>
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h4 className="text-lg font-bold text-dark mb-4 flex items-center space-x-2">
              <span>📊</span>
              <span>Protocol Distribution</span>
            </h4>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-semibold text-dark">PROGRESS</p>
                <p className="text-sm font-semibold text-primary">{progressPct}%</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Circulating</p>
                <p className="text-2xl font-bold text-dark">{formatNumber(totalSupply)}</p>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Max Supply</p>
                <p className="text-2xl font-bold text-dark">{formatNumber(maxSupply)} LTK</p>
              </div>
              <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Circulating</p>
                <span className="text-xs bg-primary-100 text-primary font-semibold px-2 py-1 rounded-full">
                  High Volume
                </span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Network</p>
                <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-1 rounded-full">
                  MAINNET
                </span>
              </div>
            </div>
          </div>

          {/* Vision card */}
          <div className="bg-primary rounded-2xl p-6 text-white shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl" />
            <div className="relative z-10">
              <p className="text-xs font-semibold tracking-wider opacity-70 mb-3">ECOSYSTEM VISION</p>
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