🏗️ SolPayX: Full-Stack Solana Remittance & BlinksSolPayX is a decentralized payment and remittance platform designed for speed, low fees, and viral distribution. It combines the power of the Solana Blockchain with Actions (Blinks) to allow instant USDC transfers directly through a URL or social media feed.🚀 Live DemoWebsite: https://solpayx.vercel.appPayment Link: Pay via SolPayX✨ Features🏦 On-Chain ArchitectureAnchor Smart Contract: A custom-built Rust contract handles the payment logic on-chain.Automated Fee Split: Every transaction automatically splits a 0.1% platform fee to a dedicated treasury wallet, ensuring a sustainable business model.SPL Token Support: Optimized for USDC (6 decimals) with real-time balance fetching.🔗 Viral Payments (Blinks)Solana Actions API: Integrated /api/actions/remit endpoint to support Blinks.Social Pay: Share a single link on Twitter/X, and users can pay you without leaving their feed.Dynamic Routing: Personalized payment pages for every user via /pay/[wallet_address].💻 Developer ExperienceHelius RPC Integration: Uses high-performance RPC nodes and WebSockets for real-time transaction monitoring.Modern UI/UX: Built with a "Glassmorphism" aesthetic using Tailwind CSS and Framer Motion.Solscan Integration: Every transaction generates a direct link to the block explorer for transparency.🛠️ Tech StackLayerTechnologyFrontendNext.js 14 (App Router), Tailwind CSSBlockchainSolana Web3.js, @solana/actions, @solana/spl-tokenSmart ContractsAnchor Framework (Rust)InfrastructureHelius RPC, VercelState ManagementReact Hooks & WebSockets📂 Project StructurePlaintext├── anchor/              # Rust Smart Contract (On-chain logic)
├── public/              # Static assets & Action icons
├── src/
│   ├── app/
│   │   ├── api/         # Blinks/Actions implementation
│   │   ├── pay/         # Dynamic [wallet] payment routes
│   │   └── dashboard/   # User wallet & history views
│   ├── components/      # Glassmorphism UI components
│   └── lib/             # Helius config & Blockchain helpers
└── .env.example         # Template for secret keys
⚙️ Local SetupClone the Repository:Bashgit clone https://github.com/YOUR_USERNAME/solpayx.git
cd solpayx
Install Dependencies:Bashnpm install
Environment Variables:Create a .env.local file and add the following:BashHELIUS_RPC_URL=your_helius_url_here
NEXT_PUBLIC_TREASURY_ADDRESS=your_treasury_wallet
Run Development Server:Bashnpm run dev
🛡️ SecurityNon-Custodial: The app never stores private keys. All signing happens via the user's wallet (Phantom/Solflare).Environment Safety: Critical RPC keys and treasury addresses are managed via server-side environment variables to prevent leaks.🚫 Intellectual Property & UsageCopyright © 2026 Dipendra. All rights reserved. This project is for portfolio and demonstration purposes only. Unauthorized copying of the code, modification, or commercial distribution is prohibited without explicit permission.
