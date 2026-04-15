# 🏗️ SolPayX: Full-Stack Solana Remittance & Blinks

**SolPayX** is a decentralized payment and remittance platform designed for speed, low fees, and viral distribution. It combines the power of the **Solana Blockchain** with **Actions (Blinks)** to allow instant USDC transfers directly through a URL or social media feed.

---

## 🚀 Live Demo
* **Website:** [https://solpayx.vercel.app](https://solpayx.vercel.app)
* **Payment Link:** [Pay via SolPayX](https://solpayx.vercel.app/pay/HLBkXFsQMn1f99zA448naAcyiwEao2CEsq1Tf2ECUoSG)

---

## ✨ Features

### 🏦 On-Chain Architecture
* **Anchor Smart Contract:** A custom-built Rust contract handles the payment logic on-chain.
* **Automated Fee Split:** Every transaction automatically splits a **0.1% platform fee** to a dedicated treasury wallet.
* **SPL Token Support:** Optimized for **USDC** (6 decimals) with real-time balance fetching.

### 🔗 Viral Payments (Blinks)
* **Solana Actions API:** Integrated `/api/actions/remit` endpoint to support **Blinks**.
* **Social Pay:** Share a single link on Twitter/X, and users can pay you without leaving their feed.
* **Dynamic Routing:** Personalized payment pages for every user via `/pay/[wallet_address]`.

### 💻 Developer Experience
* **Helius RPC Integration:** High-performance RPC nodes for real-time monitoring.
* **Modern UI/UX:** Built with a "Glassmorphism" aesthetic using **Tailwind CSS** and **Framer Motion**.
* **Solscan Integration:** Direct links to block explorers for every transaction.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), Tailwind CSS |
| **Blockchain** | Solana Web3.js, @solana/actions, @solana/spl-token |
| **Smart Contracts** | Anchor Framework (Rust) |
| **Infrastructure** | Helius RPC, Vercel |

---

## 📂 Project Structure

```text
├── anchor/              # Rust Smart Contract (On-chain logic)
├── public/              # Static assets & Action icons
├── src/
│   ├── app/
│   │   ├── api/         # Blinks/Actions implementation
│   │   └── pay/         # Dynamic [wallet] payment routes
│   ├── components/      # Glassmorphism UI components
│   └── lib/             # Helius config & Blockchain helpers
└── .env.example         # Template for secret keys
⚙️ Local Setup
Clone the Repository:

Bash
git clone https://github.com/Dipendra367/solpayx.git
cd solpayx
Install Dependencies:

Bash
npm install
Environment Variables:
Create a .env.local file:

Bash
HELIUS_RPC_URL=your_helius_url_here
NEXT_PUBLIC_TREASURY_ADDRESS=your_treasury_wallet
🛡️ Security
Non-Custodial: The app never stores private keys. Signing happens via Phantom/Solflare.

Environment Safety: Critical keys are managed via server-side variables.

🚫 Intellectual Property & Usage
Copyright © 2026 Dipendra. All rights reserved. This project is for portfolio purposes only. Unauthorized copying or commercial distribution is prohibited.
