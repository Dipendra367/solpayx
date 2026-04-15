'use client'
import { useParams } from 'next/navigation'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { sendUSDC } from '@/lib/transfer'
import { Transaction } from '@solana/web3.js'

const WalletMultiButtonDynamic = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  { ssr: false }
)

export default function PayPage() {
  const params = useParams()
  const recipient = params.user as string
  const { connected, publicKey, signTransaction } = useWallet()
  const { connection } = useConnection()
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [txLink, setTxLink] = useState('')

  const quickAmounts = [1, 5, 10, 25, 50, 100]

  const handleSend = async (customAmount?: number) => {
    if (!connected || !publicKey || !signTransaction) {
      setStatus('Please connect your wallet first!')
      return
    }
    const sendAmount = customAmount || parseFloat(amount)
    if (!sendAmount || !recipient) {
      setStatus('Please enter an amount')
      return
    }
    setLoading(true)
    setStatus('Sending transaction...')
    setTxLink('')

    const result = await sendUSDC(
      connection,
      publicKey,
      recipient,
      sendAmount,
      (tx: Transaction) => signTransaction(tx)
    )

    if (result.success) {
      setStatus(`✅ Sent ${sendAmount} USDC successfully!`)
      setTxLink('https://solscan.io/tx/' + result.signature + '?cluster=devnet')
    } else {
      setStatus('❌ Error: ' + result.error)
    }
    setLoading(false)
  }

  const shortAddress = recipient
    ? `${recipient.slice(0, 6)}...${recipient.slice(-6)}`
    : 'Unknown'

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-purple-400 mb-1">💸 SolPayX</h1>
        <p className="text-gray-400 text-sm">Instant USDC on Solana</p>
      </div>

      {/* Recipient Card */}
      <div className="w-full max-w-md bg-gray-900 rounded-2xl p-6 border border-purple-800 mb-6 text-center">
        <div className="w-16 h-16 bg-purple-700 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
          👤
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Send USDC to</h2>
        <p className="text-purple-400 font-mono text-sm">{shortAddress}</p>
      </div>

      {/* Wallet Button */}
      <div className="mb-6">
        <WalletMultiButtonDynamic />
      </div>

      {/* Quick Amount Buttons */}
      <div className="w-full max-w-md mb-4">
        <p className="text-sm text-gray-400 mb-2 text-center">Quick Send</p>
        <div className="grid grid-cols-3 gap-2">
          {quickAmounts.map(amt => (
            <button
              key={amt}
              onClick={() => handleSend(amt)}
              disabled={loading || !connected}
              className="bg-gray-800 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-700 hover:border-purple-500 rounded-lg py-2 text-sm font-semibold transition-colors"
            >
              ${amt}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Amount */}
      <div className="w-full max-w-md bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <p className="text-sm text-gray-400 mb-3 text-center">Or enter custom amount</p>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="0.00 USDC"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !connected}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 disabled:cursor-not-allowed text-white font-semibold px-5 rounded-lg transition-colors"
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>

        {status && (
          <p className="mt-4 text-sm text-center text-yellow-400">{status}</p>
        )}
        {txLink && (
          <a
            href={txLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block text-center text-xs text-purple-400 hover:text-purple-300 underline"
          >
            View on Solscan ↗
          </a>
        )}
      </div>

      {/* Share this link */}
      <div className="w-full max-w-md mt-6 bg-gray-900 rounded-xl p-4 border border-gray-800">
        <p className="text-xs text-gray-500 text-center mb-2">Share your payment link</p>
        <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
          <p className="text-xs text-purple-400 font-mono flex-1 truncate">
            localhost:3000/pay/{recipient}
          </p>
          <button
            onClick={() => navigator.clipboard.writeText(`http://localhost:3000/pay/${recipient}`)}
            className="text-xs text-gray-400 hover:text-white transition-colors shrink-0"
          >
            Copy
          </button>
        </div>
      </div>

      <p className="mt-6 text-xs text-gray-600">
        0.1% platform fee · Near-zero gas · Instant finality
      </p>
    </main>
  )
}