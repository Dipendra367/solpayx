'use client'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { useCallback, useEffect, useState } from 'react'
import { ConfirmedSignatureInfo, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { getAccount, getAssociatedTokenAddress } from '@solana/spl-token'
import { USDC_MINT } from '@/lib/transfer'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const WalletMultiButtonDynamic = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  { ssr: false }
)

export default function Dashboard() {
  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()
  const [solBalance, setSolBalance] = useState<number | null>(null)
  const [usdcBalance, setUsdcBalance] = useState<number | null>(null)
  const [txHistory, setTxHistory] = useState<ConfirmedSignatureInfo[]>([])
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      // SOL balance
      const sol = await connection.getBalance(publicKey!)
      setSolBalance(sol / LAMPORTS_PER_SOL)

      // USDC balance
      try {
        const ata = await getAssociatedTokenAddress(USDC_MINT, publicKey!)
        const account = await getAccount(connection, ata)
        setUsdcBalance(Number(account.amount) / 1e6)
      } catch {
        setUsdcBalance(0)
      }

      // Transaction history
      const sigs = await connection.getSignaturesForAddress(publicKey!, { limit: 10 })
      setTxHistory(sigs)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }, [connection, publicKey])

  useEffect(() => {
    if (!publicKey) return
    const timer = setTimeout(() => {
      void fetchData()
    }, 0)
    return () => clearTimeout(timer)
  }, [fetchData, publicKey])

  if (!connected) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-4">
        <h1 className="text-3xl font-bold text-purple-400">Dashboard</h1>
        <p className="text-gray-400">Connect your wallet to view your dashboard</p>
        <WalletMultiButtonDynamic />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-purple-400">Dashboard</h1>
          <p className="text-gray-500 text-xs font-mono mt-1">
            {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-purple-400 transition-colors">
            ← Send USDC
          </Link>
          <WalletMultiButtonDynamic />
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-900 rounded-2xl p-6 border border-purple-900">
          <p className="text-gray-400 text-sm mb-2">USDC Balance</p>
          <p className="text-4xl font-bold text-white">
            {usdcBalance !== null ? `$${usdcBalance.toFixed(2)}` : '...'}
          </p>
          <p className="text-gray-600 text-xs mt-1">Devnet USDC</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
          <p className="text-gray-400 text-sm mb-2">SOL Balance</p>
          <p className="text-4xl font-bold text-white">
            {solBalance !== null ? `${solBalance.toFixed(4)}` : '...'}
          </p>
          <p className="text-gray-600 text-xs mt-1">SOL</p>
        </div>
      </div>

      {/* Refresh Button */}
      <button
        onClick={fetchData}
        disabled={loading}
        className="mb-6 text-sm text-purple-400 hover:text-purple-300 border border-purple-800 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? 'Refreshing...' : '↻ Refresh'}
      </button>

      {/* Transaction History */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-gray-200">Recent Transactions</h2>
        </div>

        {txHistory.length === 0 ? (
          <p className="text-gray-500 p-6 text-sm">No transactions found</p>
        ) : (
          txHistory.map((tx, i) => (
            <div key={i} className="p-4 border-b border-gray-800 flex justify-between items-center hover:bg-gray-800 transition-colors">
              <div>
                <p className="text-gray-300 font-mono text-xs">
                  {tx.signature.slice(0, 20)}...{tx.signature.slice(-10)}
                </p>
                <p className="text-gray-600 text-xs mt-1">
                  {tx.blockTime ? new Date(tx.blockTime * 1000).toLocaleString() : 'Pending'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded-full ${tx.err ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
                  {tx.err ? 'Failed' : 'Success'}
                </span>
                <a
                  href={`https://solscan.io/tx/${tx.signature}?cluster=devnet`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-purple-400 text-xs hover:underline"
                >
                  View ↗
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  )
}