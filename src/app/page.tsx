'use client'
import { useWallet, useConnection, useAnchorWallet } from '@solana/wallet-adapter-react'
import { useCallback, useEffect, useState } from 'react'
import { ConfirmedSignatureInfo, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { getAccount, getAssociatedTokenAddress } from '@solana/spl-token'
import { USDC_MINT, sendUSDCViaProgram } from '@/lib/transfer'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const WalletMultiButtonDynamic = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  { ssr: false }
)

export default function Dashboard() {
  const { publicKey, connected } = useWallet()
  const anchorWallet = useAnchorWallet()
  const { connection } = useConnection()
  const [solBalance, setSolBalance] = useState<number | null>(null)
  const [usdcBalance, setUsdcBalance] = useState<number | null>(null)
  const [txHistory, setTxHistory] = useState<ConfirmedSignatureInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  // Send form state
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [status, setStatus] = useState('')
  const [txLink, setTxLink] = useState('')
  const [sending, setSending] = useState(false)

  // ✅ Dynamic URL
  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://solpayx.vercel.app'

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const sol = await connection.getBalance(publicKey!)
      setSolBalance(sol / LAMPORTS_PER_SOL)
      try {
        const ata = await getAssociatedTokenAddress(USDC_MINT, publicKey!)
        const account = await getAccount(connection, ata)
        setUsdcBalance(Number(account.amount) / 1e6)
      } catch {
        setUsdcBalance(0)
      }
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

  const handleSend = async () => {
    if (!connected || !publicKey || !anchorWallet) return
    if (!amount || !recipient) { setStatus('Please fill in all fields'); return }
    setSending(true)
    setTxLink('')
    setStatus('Building transaction...')
    const result = await sendUSDCViaProgram(
      connection,
      anchorWallet,
      recipient,
      parseFloat(amount),
      memo || 'remittance'
    )
    if (result.success) {
      setStatus('✅ Sent successfully!')
      setTxLink('https://solscan.io/tx/' + result.signature + '?cluster=devnet')
      void fetchData()
    } else {
      setStatus('❌ Error: ' + result.error)
    }
    setSending(false)
  }

  const feeAmount = amount ? (parseFloat(amount) * 0.001).toFixed(3) : '0.000'
  const receiveAmount = amount ? (parseFloat(amount) * 0.999).toFixed(3) : '0.000'

  const thisMonth = txHistory.filter(tx => {
    if (!tx.blockTime) return false
    const txDate = new Date(tx.blockTime * 1000)
    const now = new Date()
    return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear()
  }).length

  if (!connected) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-4">
        <h1 className="text-3xl font-bold text-purple-400">SolPayX</h1>
        <p className="text-gray-400">Connect your wallet to view your dashboard</p>
        <WalletMultiButtonDynamic />
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">

      {/* Sidebar */}
      <div className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col p-4">
        <div className="flex items-center gap-2 mb-8 mt-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">S</div>
          <span className="font-bold text-white">SolPayX</span>
        </div>

        <nav className="flex flex-col gap-1">
          {[
            { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
            { id: 'send', icon: '→', label: 'Send USDC' },
            { id: 'history', icon: '◷', label: 'History' },
            { id: 'blink', icon: '⬡', label: 'My Blink' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                activeTab === item.id
                  ? 'bg-purple-900 text-purple-300 border border-purple-700'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto">
          <WalletMultiButtonDynamic />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'send' && 'Send USDC'}
            {activeTab === 'history' && 'History'}
            {activeTab === 'blink' && 'My Blink'}
          </h1>
          <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-lg px-3 py-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-xs font-mono text-gray-300">
              {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)} · Devnet
            </span>
          </div>
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
                <p className="text-gray-400 text-xs mb-1">USDC Balance</p>
                <p className="text-3xl font-bold text-white">
                  {usdcBalance !== null ? usdcBalance.toFixed(2) : '...'}
                </p>
                <p className="text-gray-500 text-xs mt-1">≈ ${usdcBalance?.toFixed(2)} USD</p>
              </div>
              <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
                <p className="text-gray-400 text-xs mb-1">SOL Balance</p>
                <p className="text-3xl font-bold text-white">
                  {solBalance !== null ? solBalance.toFixed(2) : '...'}
                </p>
                <p className="text-gray-500 text-xs mt-1">for gas fees</p>
              </div>
              <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
                <p className="text-gray-400 text-xs mb-1">Sent this month</p>
                <p className="text-3xl font-bold text-white">{thisMonth}</p>
                <p className="text-gray-500 text-xs mt-1">{thisMonth} transactions</p>
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                <h2 className="font-semibold text-gray-200">Recent Transactions</h2>
                <button onClick={fetchData} disabled={loading}
                  className="text-xs text-purple-400 hover:text-purple-300 disabled:opacity-50">
                  {loading ? 'Loading...' : '↻ Refresh'}
                </button>
              </div>
              {txHistory.length === 0 ? (
                <p className="text-gray-500 p-6 text-sm">No transactions found</p>
              ) : (
                txHistory.map((tx, i) => (
                  <div key={i} className="p-4 border-b border-gray-800 flex justify-between items-center hover:bg-gray-800 transition-colors">
                    <div>
                      <p className="text-gray-300 font-mono text-xs">
                        → {tx.signature.slice(0, 10)}...{tx.signature.slice(-6)}
                      </p>
                      <p className="text-gray-600 text-xs mt-1">
                        {tx.blockTime ? new Date(tx.blockTime * 1000).toLocaleString() : 'Pending'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${tx.err ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
                        {tx.err ? 'Failed' : 'Confirmed'}
                      </span>
                      <a href={`https://solscan.io/tx/${tx.signature}?cluster=devnet`}
                        target="_blank" rel="noreferrer"
                        className="text-purple-400 text-xs hover:underline">View ↗</a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* SEND TAB */}
        {activeTab === 'send' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h2 className="font-semibold text-gray-200 mb-4">SEND USDC</h2>

              <div className="mb-4">
                <label className="text-xs text-gray-400 mb-1 block">Recipient wallet</label>
                <input type="text" placeholder="Solana wallet address..."
                  value={recipient} onChange={(e) => setRecipient(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="mb-4">
                <label className="text-xs text-gray-400 mb-1 block">Amount (USDC)</label>
                <div className="flex gap-2 mb-2">
                  {['1', '5', '10', '50'].map(v => (
                    <button key={v} onClick={() => setAmount(v)}
                      className="flex-1 text-xs bg-gray-800 hover:bg-purple-900 border border-gray-700 hover:border-purple-600 text-gray-300 py-2 rounded-lg transition-colors">
                      ${v}
                    </button>
                  ))}
                </div>
                <input type="number" placeholder="0.00"
                  value={amount} onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="mb-4">
                <label className="text-xs text-gray-400 mb-1 block">Memo (optional)</label>
                <input type="text" placeholder="Family remittance..."
                  value={memo} onChange={(e) => setMemo(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {amount && (
                <div className="mb-4 bg-gray-800 rounded-lg p-3 text-xs">
                  <div className="flex justify-between text-gray-400 mb-1">
                    <span>Platform fee (0.1%)</span>
                    <span>{feeAmount} USDC</span>
                  </div>
                  <div className="flex justify-between text-white font-semibold">
                    <span>Recipient receives</span>
                    <span>{receiveAmount} USDC</span>
                  </div>
                </div>
              )}

              <button onClick={handleSend} disabled={sending}
                className="w-full bg-white hover:bg-gray-200 disabled:opacity-50 text-black font-semibold py-3 rounded-lg transition-colors">
                {sending ? status || 'Processing...' : 'Send via Phantom'}
              </button>

              {status && !sending && (
                <p className={`mt-3 text-xs text-center ${status.startsWith('✅') ? 'text-green-400' : status.startsWith('❌') ? 'text-red-400' : 'text-yellow-400'}`}>
                  {status}
                </p>
              )}
              {txLink && (
                <a href={txLink} target="_blank" rel="noreferrer"
                  className="mt-2 block text-center text-xs text-purple-400 hover:underline">
                  View on Solscan ↗
                </a>
              )}
            </div>

            {/* Blink Preview */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h2 className="font-semibold text-gray-200 mb-4">MY BLINK LINK</h2>
              <div className="bg-gray-800 rounded-lg px-3 py-2 mb-3">
                <p className="text-purple-400 text-xs font-mono">
                  {appUrl}/pay/{publicKey?.toString().slice(0, 8)}...
                </p>
              </div>
              <p className="text-gray-400 text-xs mb-4">
                Share this link — anyone can send you USDC instantly from Twitter, Telegram or anywhere.
              </p>
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-lg">💸</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">Send USDC to {publicKey?.toString().slice(0, 6)}...</p>
                    <p className="text-xs text-gray-400">Instant · Near-zero fees · Solana</p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(`${appUrl}/pay/${publicKey?.toString()}`)}
                    className="bg-white text-black text-xs font-semibold px-3 py-1 rounded-lg">
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h2 className="font-semibold text-gray-200">All Transactions</h2>
              <button onClick={fetchData} disabled={loading}
                className="text-xs text-purple-400 hover:text-purple-300 disabled:opacity-50">
                {loading ? 'Loading...' : '↻ Refresh'}
              </button>
            </div>
            {txHistory.length === 0 ? (
              <p className="text-gray-500 p-6 text-sm">No transactions found</p>
            ) : (
              txHistory.map((tx, i) => (
                <div key={i} className="p-4 border-b border-gray-800 flex justify-between items-center hover:bg-gray-800 transition-colors">
                  <div>
                    <p className="text-gray-300 font-mono text-xs">
                      → {tx.signature.slice(0, 20)}...{tx.signature.slice(-10)}
                    </p>
                    <p className="text-gray-600 text-xs mt-1">
                      {tx.blockTime ? new Date(tx.blockTime * 1000).toLocaleString() : 'Pending'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${tx.err ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
                      {tx.err ? 'Failed' : 'Confirmed'}
                    </span>
                    <a href={`https://solscan.io/tx/${tx.signature}?cluster=devnet`}
                      target="_blank" rel="noreferrer"
                      className="text-purple-400 text-xs hover:underline">View ↗</a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* BLINK TAB */}
        {activeTab === 'blink' && (
          <div className="max-w-lg">
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-4">
              <h2 className="font-semibold text-gray-200 mb-4">Your Payment Link</h2>
              <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2 mb-4">
                <p className="text-purple-400 text-xs font-mono flex-1 truncate">
                  {appUrl}/pay/{publicKey?.toString()}
                </p>
                <button
                  onClick={() => navigator.clipboard.writeText(`${appUrl}/pay/${publicKey?.toString()}`)}
                  className="text-xs text-gray-400 hover:text-white shrink-0">
                  Copy
                </button>
              </div>
              <p className="text-gray-400 text-xs">
                Share this link on Twitter, Telegram, or anywhere. Anyone can send you USDC instantly without needing to know your wallet address.
              </p>
            </div>

            <Link href={`/pay/${publicKey?.toString()}`}
              className="block bg-purple-600 hover:bg-purple-700 text-white text-center font-semibold py-3 rounded-xl transition-colors">
              Preview My Payment Page ↗
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}