import { NextRequest, NextResponse } from 'next/server'
import { PublicKey } from '@solana/web3.js'

const SOLPAYX_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// GET — Returns the Blink metadata (what Twitter/Telegram renders)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const to = searchParams.get('to') || 'unknown'

  return NextResponse.json({
    icon: `${SOLPAYX_URL}/logo.png`,
    label: `Send USDC to ${to}`,
    title: `💸 SolPayX — Send USDC to ${to}`,
    description: `Instant USDC transfer via SolPayX. Near-zero fees, instant finality on Solana.`,
    links: {
      actions: [
        {
          label: 'Send 1 USDC',
          href: `${SOLPAYX_URL}/api/actions/remit?to=${to}&amount=1`,
        },
        {
          label: 'Send 5 USDC',
          href: `${SOLPAYX_URL}/api/actions/remit?to=${to}&amount=5`,
        },
        {
          label: 'Send 10 USDC',
          href: `${SOLPAYX_URL}/api/actions/remit?to=${to}&amount=10`,
        },
        {
          label: 'Custom Amount',
          href: `${SOLPAYX_URL}/api/actions/remit?to=${to}&amount={amount}`,
          parameters: [
            {
              name: 'amount',
              label: 'Enter USDC amount',
              required: true,
            },
          ],
        },
      ],
    },
  })
}

// POST — Builds the transaction when user clicks the Blink button
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const to = searchParams.get('to')
    const amount = searchParams.get('amount')
    const body = await req.json()
    const senderAddress = body.account

    if (!to || !amount || !senderAddress) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    // Validate addresses
    let recipientPubkey: PublicKey
    try {
      recipientPubkey = new PublicKey(to)
    } catch {
      return NextResponse.json({ error: 'Invalid recipient address' }, { status: 400 })
    }

    const { Connection, clusterApiUrl } = await import('@solana/web3.js')
    const { sendUSDC } = await import('@/lib/transfer')

    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')
    const senderPubkey = new PublicKey(senderAddress)

    // Build unsigned transaction
    const { Transaction } = await import('@solana/web3.js')
    const {
      getAssociatedTokenAddress,
      createTransferInstruction,
      createAssociatedTokenAccountInstruction,
      getAccount,
    } = await import('@solana/spl-token')
    const { USDC_MINT } = await import('@/lib/transfer')

    const decimals = 6
    const totalAmount = Math.floor(parseFloat(amount) * Math.pow(10, decimals))
    const feeAmount = Math.floor(totalAmount * 0.001)
    const sendAmount = totalAmount - feeAmount

    const TREASURY = new PublicKey('DfjFNrxWVSHHvSWdNjTFFRaTkVxhwEZSEpVBnXpicfDy')
    const senderATA = await getAssociatedTokenAddress(USDC_MINT, senderPubkey)
    const recipientATA = await getAssociatedTokenAddress(USDC_MINT, recipientPubkey)
    const treasuryATA = await getAssociatedTokenAddress(USDC_MINT, TREASURY)

    const transaction = new Transaction()

    try {
      await getAccount(connection, recipientATA)
    } catch {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          senderPubkey, recipientATA, recipientPubkey, USDC_MINT
        )
      )
    }

    try {
      await getAccount(connection, treasuryATA)
    } catch {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          senderPubkey, treasuryATA, TREASURY, USDC_MINT
        )
      )
    }

    transaction.add(
      createTransferInstruction(senderATA, recipientATA, senderPubkey, sendAmount)
    )
    transaction.add(
      createTransferInstruction(senderATA, treasuryATA, senderPubkey, feeAmount)
    )

    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = senderPubkey

    const serialized = transaction.serialize({ requireAllSignatures: false })
    const base64 = serialized.toString('base64')

    return NextResponse.json({
      transaction: base64,
      message: `Sending ${amount} USDC to ${to.slice(0, 8)}... via SolPayX`,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// Required for Blinks CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept-Encoding',
      'Access-Control-Max-Age': '86400',
    },
  })
}