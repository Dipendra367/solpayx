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
    const recipient = new PublicKey(recipientAddress)
    const mint = await getMint(connection, USDC_MINT)
    const decimals = mint.decimals

    const totalAmount = Math.floor(amount * Math.pow(10, decimals))
    const feeAmount = Math.floor(totalAmount * FEE_RATE)
    const sendAmount = totalAmount - feeAmount

    const senderATA = await getAssociatedTokenAddress(USDC_MINT, senderPublicKey)
    const recipientATA = await getAssociatedTokenAddress(USDC_MINT, recipient)
    const treasuryATA = await getAssociatedTokenAddress(USDC_MINT, TREASURY)

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

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = senderPublicKey

    onStatus?.('Waiting for wallet signature...')
    const signed = await signTransaction(transaction)

    onStatus?.('Sending to Solana...')
    const signature = await connection.sendRawTransaction(signed.serialize())

    onStatus?.('Confirming transaction...')
    await connection.confirmTransaction(
      { signature, blockhash, lastValidBlockHeight },
      'confirmed'
    )

    onStatus?.('Sent successfully!')
    return { success: true, signature }

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: message }
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
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: message }
  }
}