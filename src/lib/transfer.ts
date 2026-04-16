import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { 
  getAssociatedTokenAddress, 
  createTransferInstruction, 
  getMint,
  createAssociatedTokenAccountInstruction, 
  getAccount,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token'
import { AnchorWallet } from '@solana/wallet-adapter-react'
import { BN } from '@coral-xyz/anchor'
import { getProgram } from './program'
import { parseTransactionError } from './errors'

export const USDC_MINT = new PublicKey('EGy3fLWXRMLnaFvCUHhV9cTZE2q6Amcs6ktiJQVDQXcH')
const FEE_RATE = 0.001
const TREASURY = new PublicKey('DfjFNrxWVSHHvSWdNjTFFRaTkVxhwEZSEpVBnXpicfDy')

export async function sendUSDC(
  connection: Connection,
  senderPublicKey: PublicKey,
  recipientAddress: string,
  amount: number,
  signTransaction: (tx: Transaction) => Promise<Transaction>,
  onStatus?: (status: string) => void
) {
  try {
    onStatus?.('Building transaction...')

    let recipient: PublicKey
    try {
      recipient = new PublicKey(recipientAddress)
    } catch {
      return { success: false, error: '❌ Invalid recipient address.' }
    }

    if (amount <= 0) {
      return { success: false, error: '❌ Amount must be greater than 0.' }
    }

    const mint = await getMint(connection, USDC_MINT)
    const decimals = mint.decimals

    const totalAmount = Math.floor(amount * Math.pow(10, decimals))
    const feeAmount = Math.floor(totalAmount * FEE_RATE)
    const sendAmount = totalAmount - feeAmount

    const senderATA = await getAssociatedTokenAddress(USDC_MINT, senderPublicKey)
    const recipientATA = await getAssociatedTokenAddress(USDC_MINT, recipient)
    const treasuryATA = await getAssociatedTokenAddress(USDC_MINT, TREASURY)

    // Check sender balance
    try {
      const senderAccount = await getAccount(connection, senderATA)
      if (Number(senderAccount.amount) < totalAmount) {
        return { success: false, error: '❌ Insufficient USDC balance.' }
      }
    } catch {
      return { success: false, error: '❌ You have no USDC. Please top up your wallet first.' }
    }

    const transaction = new Transaction()

    try {
      await getAccount(connection, recipientATA)
    } catch {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          senderPublicKey, recipientATA, recipient, USDC_MINT
        )
      )
    }

    try {
      await getAccount(connection, treasuryATA)
    } catch {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          senderPublicKey, treasuryATA, TREASURY, USDC_MINT
        )
      )
    }

    transaction.add(
      createTransferInstruction(senderATA, recipientATA, senderPublicKey, sendAmount)
    )
    transaction.add(
      createTransferInstruction(senderATA, treasuryATA, senderPublicKey, feeAmount)
    )

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized')
    transaction.recentBlockhash = blockhash
    transaction.feePayer = senderPublicKey

    onStatus?.('Waiting for wallet signature...')
    const signed = await signTransaction(transaction)

    onStatus?.('Sending to Solana...')
    const signature = await connection.sendRawTransaction(signed.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
      maxRetries: 3,
    })

    onStatus?.('Confirming transaction...')
    await connection.confirmTransaction(
      { signature, blockhash, lastValidBlockHeight },
      'confirmed'
    )

    onStatus?.('✅ Sent successfully!')
    return { success: true, signature }

  } catch (error: unknown) {
    const friendly = parseTransactionError(error)
    if (friendly.startsWith('✅')) return { success: true, error: friendly }
    return { success: false, error: friendly }
  }
}

export async function sendUSDCViaProgram(
  connection: Connection,
  wallet: AnchorWallet,
  recipientAddress: string,
  amount: number,
  memo: string = 'remittance'
) {
  try {
    const program = getProgram(connection, wallet)
    const recipient = new PublicKey(recipientAddress)
    const senderATA = await getAssociatedTokenAddress(USDC_MINT, wallet.publicKey)
    const recipientATA = await getAssociatedTokenAddress(USDC_MINT, recipient)
    const treasuryATA = await getAssociatedTokenAddress(USDC_MINT, TREASURY)
    const mint = await getMint(connection, USDC_MINT)
    const amountInDecimals = new BN(amount * Math.pow(10, mint.decimals))

    const setupTx = new Transaction()

    try {
      await getAccount(connection, recipientATA)
    } catch {
      setupTx.add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey, recipientATA, recipient, USDC_MINT
        )
      )
    }

    try {
      await getAccount(connection, treasuryATA)
    } catch {
      setupTx.add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey, treasuryATA, TREASURY, USDC_MINT
        )
      )
    }

    if (setupTx.instructions.length > 0) {
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized')
      setupTx.recentBlockhash = blockhash
      setupTx.feePayer = wallet.publicKey
      const signed = await wallet.signTransaction(setupTx)
      const sig = await connection.sendRawTransaction(signed.serialize())
      await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight })
    }

    const tx = await program.methods
      .sendRemittance(amountInDecimals, memo)
      .accounts({
        sender: wallet.publicKey,
        senderTokenAccount: senderATA,
        recipientTokenAccount: recipientATA,
        treasuryTokenAccount: treasuryATA,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc()

    return { success: true, signature: tx }
  } catch (error: unknown) {
    const friendly = parseTransactionError(error)
    if (friendly.startsWith('✅')) return { success: true, error: friendly }
    return { success: false, error: friendly }
  }
}