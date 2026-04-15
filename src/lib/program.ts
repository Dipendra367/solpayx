import { Program, AnchorProvider, Idl } from '@coral-xyz/anchor'
import { Connection, PublicKey } from '@solana/web3.js'
import { AnchorWallet } from '@solana/wallet-adapter-react'
import idl from './remittance.json'

export const PROGRAM_ID = new PublicKey('72citsVT8pcy5orD5HVAS9UN1aBspCkui1NmcGAB8Xsg')

export function getProgram(connection: Connection, wallet: AnchorWallet) {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  })
  return new Program(idl as Idl, provider)
}