# SolPayX ⚡

> **Instant USDC remittance on Solana — No banks. No borders. Near-zero fees.**

[![Live Demo](https://img.shields.io/badge/Live-solpayx.vercel.app-blueviolet?style=for-the-badge)](https://solpayx.vercel.app)
[![Solana](https://img.shields.io/badge/Solana-Devnet-9945FF?style=for-the-badge&logo=solana)](https://solana.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Anchor](https://img.shields.io/badge/Anchor-1.0.0-orange?style=for-the-badge)](https://anchor-lang.com)


---

## 🌍 What is SolPayX?

SolPayX is a **decentralized remittance platform** built on Solana that lets anyone send USDC across the world instantly — replacing expensive, slow traditional remittance services like Western Union and bank wire transfers.

Send $100 to family in Nepal from the US in **under 3 seconds** for a fraction of a cent. No middlemen. No waiting days. No hidden fees.

---

## ✨ Features

| Feature | Description |
|---|---|
| ⚡ **Instant Transfers** | Transactions finalize in ~400ms on Solana |
| 💸 **Near-Zero Fees** | 0.1% platform fee + ~$0.00025 gas |
| 🔗 **Blinks / Payment Links** | Shareable links like `solpayx.vercel.app/pay/yourname` |
| 📊 **Live Dashboard** | Real-time USDC & SOL balance with transaction history |
| 🔐 **Non-Custodial** | Your keys, your money — we never touch your funds |
| 🌐 **On-Chain Fee Logic** | Anchor smart contract enforces 0.1% fee trustlessly |
| 📡 **Helius RPC** | Enterprise-grade RPC for fast, reliable transactions |
| 🔄 **WebSocket Confirmations** | Real-time transaction status updates |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│          Next.js Frontend           │
│     (App Router + TailwindCSS)      │
└──────────────┬──────────────────────┘
               │
   ┌───────────┼───────────────┐
   ▼           ▼               ▼
Phantom     Blinks API     Dashboard
Wallet    /api/actions/    (Balance +
Adapter      remit          History)
   │           │               │
   └───────────┼───────────────┘
               ▼
   ┌───────────────────────────┐
   │      Helius RPC Layer     │
   │   (WebSocket + REST)      │
   └───────────┬───────────────┘
               ▼
   ┌───────────────────────────┐
   │     Solana Blockchain     │
   │  ┌─────────────────────┐  │
   │  │  Anchor Program     │  │
   │  │  (remittance.so)    │  │
   │  │  - Fee enforcement  │  │
   │  │  - Transfer logic   │  │
   │  │  - Event emission   │  │
   │  └─────────────────────┘  │
   │  USDC SPL Token           │
   └───────────────────────────┘
```

---

## 💰 How Fees Work

```
User sends 100 USDC
         ↓
Smart contract intercepts
         ↓
0.1% fee automatically split:
  ├── 99.9 USDC → Recipient ✅
  └──  0.1 USDC → SolPayX Treasury 💼
```

The fee logic lives **on-chain** in the Anchor program — it cannot be bypassed.

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- Rust + Cargo
- Solana CLI
- Anchor CLI
- Phantom Wallet browser extension

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/solpayx.git
cd solpayx

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_HELIUS_KEY
```

Get your free Helius API key at 👉 https://helius.dev

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔨 Smart Contract

The Anchor program lives in `/remittance/programs/remittance/src/lib.rs`.

### Build

```bash
cd remittance
anchor build
```

### Deploy to Devnet

```bash
anchor program deploy --provider.cluster devnet --provider.wallet ~/.config/solana/devnet.json
```

### Program ID

```
72citsVT8pcy5orD5HVAS9UN1aBspCkui1NmcGAB8Xsg
```

View on Solscan 👉 https://solscan.io/account/72citsVT8pcy5orD5HVAS9UN1aBspCkui1NmcGAB8Xsg?cluster=devnet

---

## 📁 Project Structure

```
solpayx/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Home / Send USDC
│   │   ├── dashboard/page.tsx        # Balance & History
│   │   ├── pay/[user]/page.tsx       # Public payment page
│   │   └── api/actions/remit/        # Blinks API endpoint
│   │       └── route.ts
│   ├── components/
│   │   ├── WalletProvider.tsx
│   │   ├── SendForm.tsx
│   │   ├── BalanceCard.tsx
│   │   └── TxHistory.tsx
│   └── lib/
│       ├── transfer.ts               # USDC transfer logic
│       ├── program.ts                # Anchor program client
│       ├── helius.ts                 # Helius RPC helpers
│       └── remittance.json           # Anchor IDL
├── remittance/
│   └── programs/remittance/
│       └── src/lib.rs                # Anchor smart contract
└── .env.local                        # Environment variables
```

---

## 🌐 Blinks — Viral Payment Links

SolPayX supports [Solana Actions & Blinks](https://solana.com/docs/advanced/actions), allowing payment links to render as interactive buttons on Twitter/X, Telegram, and other platforms.

**Your payment link:**
```
https://solpayx.vercel.app/pay/YOUR_WALLET_ADDRESS
```

Share it anywhere — anyone with a Phantom wallet can send you USDC instantly.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TailwindCSS, TypeScript |
| Blockchain | Solana, USDC SPL Token |
| Smart Contract | Anchor Framework, Rust |
| Wallet | Phantom Wallet Adapter |
| RPC | Helius (WebSocket + REST) |
| Deployment | Vercel |

---

## 🗺️ Roadmap

- [x] USDC transfers on devnet
- [x] Anchor smart contract with fee logic
- [x] Blinks / viral payment links
- [x] Live dashboard
- [x] Helius RPC integration
- [x] WebSocket confirmations
- [x] Deployed to Vercel
- [ ] Token-2022 transfer hook
- [ ] Mainnet launch
- [ ] Mobile app (React Native)
- [ ] Fiat on-ramp integration
- [ ] Multi-currency support
- [ ] Custom domain (solpayx.com)

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## ⚠️ Disclaimer

SolPayX is currently running on **Solana Devnet** for testing purposes. Devnet tokens have no real monetary value. Do not use real funds until mainnet launch.

---

## 📄 License

This project is currently not licensed.
All rights are reserved by the author unless stated otherwise.

---

## 👨‍💻 Built By

**Dipendra** — Pokhara University Software Engineering student, building real-world Web3 applications and exploring decentralized systems. 🚀

> *"Replace Western Union with code."*

---

<div align="center">

**[Live Demo](https://solpayx.vercel.app)** • **[Smart Contract](https://solscan.io/account/72citsVT8pcy5orD5HVAS9UN1aBspCkui1NmcGAB8Xsg?cluster=devnet)** • **[Report Bug](https://github.com/yourusername/solpayx/issues)**

⭐ Star this repo if you find it useful!

</div>
