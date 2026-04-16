export function parseTransactionError(error: unknown): string {
  const message = error instanceof Error ? error.message : 'Unknown error'
  const logs = (error instanceof Error && 'logs' in error) 
    ? (error as Error & { logs: string[] }).logs?.join(' ') || ''
    : ''

  if (message.includes('already been processed'))
    return '✅ Transaction already confirmed!'

  if (
    message.includes('no record of a prior credit') ||
    message.includes('insufficient funds') ||
    message.includes('0x1') ||
    logs.includes('insufficient funds')
  )
    return '❌ Insufficient USDC balance. You don\'t have enough USDC to send.'

  if (message.includes('User rejected') || message.includes('Transaction cancelled'))
    return '❌ Transaction cancelled.'

  if (message.includes('blockhash not found') || message.includes('Blockhash not found'))
    return '❌ Network timeout. Please try again.'

  if (message.includes('invalid account data'))
    return '❌ Invalid wallet address. Please check the recipient.'

  if (message.includes('Network request failed') || message.includes('Failed to fetch'))
    return '❌ Network error. Check your internet connection.'

  if (message.includes('TokenAccountNotFound'))
    return '❌ Recipient has no USDC account.'

  return '❌ Transaction failed. Please try again.'
}
