'use client'
import { useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import '@solana/wallet-adapter-react-ui/styles.css'
import './globals.css'

function isMobile() {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i.test(navigator.userAgent)
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const endpoint = useMemo(() =>
    process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com',
  [])

  const wallets = useMemo(() => {
    const mobile = isMobile()
    if (mobile) {
      // On mobile: Phantom deep-links into its in-app browser
      return [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter(),
      ]
    }
    // Desktop: extension adapter
    return [new PhantomWalletAdapter()]
  }, [])

  return (
    <html lang="en">
      <body>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              {children}
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </body>
    </html>
  )
}