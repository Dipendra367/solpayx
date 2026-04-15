'use client'
import { useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import '@solana/wallet-adapter-react-ui/styles.css'
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const endpoint = useMemo(() => 
    process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com', 
  [])
  const wallets = useMemo(() => [new PhantomWalletAdapter()], [])

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