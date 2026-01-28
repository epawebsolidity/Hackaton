<p align="center">
  <img src="frontend/public/logobased.png" alt="PRIFYD Logo" width="120"/>
</p>

<h1 align="center">🎨 PRIFYD</h1>
<h3 align="center">Web3 Creator Subscription Platform on Base</h3>

<p align="center">
  <strong>Empowering creators with blockchain-based subscriptions & NFT badges</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Base-Sepolia-blue?style=for-the-badge&logo=ethereum" alt="Base Sepolia"/>
  <img src="https://img.shields.io/badge/Next.js-16.1.0-black?style=for-the-badge&logo=next.js" alt="Next.js"/>
  <img src="https://img.shields.io/badge/Solidity-0.8.20-363636?style=for-the-badge&logo=solidity" alt="Solidity"/>
  <img src="https://img.shields.io/badge/RainbowKit-2.2.10-7B3FE4?style=for-the-badge" alt="RainbowKit"/>
</p>

<p align="center">
  <a href="#-demo">Demo</a> •
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-smart-contracts">Smart Contracts</a>
</p>

---

## 🎯 The Problem

Creators struggle with:

- 💸 **High platform fees** (up to 30% on traditional platforms)
- 🔒 **No ownership** of their subscriber relationships
- 📊 **Lack of transparency** in earnings
- 🚫 **Centralized control** over their content

## 💡 Our Solution

**PRIFYD** is a decentralized subscription platform that:

| Traditional Platforms | PRIFYD                      |
| --------------------- | --------------------------- |
| 30% platform fees     | **~2% gas fees**            |
| Platform owns data    | **Creators own everything** |
| Opaque payments       | **On-chain transparency**   |
| Can be deplatformed   | **Censorship resistant**    |

---

## ✨ Features

### **Tiered Subscriptions**

Three-tier system (Bronze, Silver, Gold) with customizable pricing by creators

### **NFT Badges**

ERC-1155 NFT badges as proof of subscription - tradeable and collectible

### **Gated Content** 🔐

Smart contract-based content access control

### **Seamless Web3 UX**

RainbowKit integration for easy wallet connection

### **Modern UI/UX**

Dark/Light mode, responsive design, beautiful animations

---

## 🖼️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRIFYD ECOSYSTEM                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   👤 USER                           🎨 CREATOR                   │
│      │                                  │                        │
│      ▼                                  ▼                        │
│   ┌──────────┐                    ┌──────────┐                  │
│   │ Connect  │                    │ Register │                  │
│   │  Wallet  │                    │  Profile │                  │
│   └────┬─────┘                    └────┬─────┘                  │
│        │                               │                        │
│        ▼                               ▼                        │
│   ┌──────────┐                    ┌──────────┐                  │
│   │  Search  │◄──────────────────►│Configure │                  │
│   │ Creators │                    │  Tiers   │                  │
│   └────┬─────┘                    └────┬─────┘                  │
│        │                               │                        │
│        ▼                               ▼                        │
│   ┌──────────┐    PAY ETH        ┌──────────┐                  │
│   │Subscribe │──────────────────►│ Receive  │                  │
│   │  (ETH)   │                   │ Earnings │                  │
│   └────┬─────┘                   └──────────┘                  │
│        │                                                        │
│        ▼                                                        │
│   ┌──────────┐                                                  │
│   │ Get NFT  │                                                  │
│   │  Badge   │                                                  │
│   └────┬─────┘                                                  │
│        │                                                        │
│        ▼                                                        │
│   ┌──────────┐                                                  │
│   │ Access   │                                                  │
│   │ Content  │                                                  │
│   └──────────┘                                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

<table>
<tr>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=nextjs" width="48" height="48" alt="Next.js" />
<br>Next.js 16
</td>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=react" width="48" height="48" alt="React" />
<br>React
</td>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=typescript" width="48" height="48" alt="TypeScript" />
<br>TypeScript
</td>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=tailwind" width="48" height="48" alt="Tailwind" />
<br>Tailwind
</td>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=solidity" width="48" height="48" alt="Solidity" />
<br>Solidity
</td>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=nodejs" width="48" height="48" alt="Node.js" />
<br>Node.js
</td>
</tr>
</table>

### Frontend

- **Next.js 16** - React framework with App Router
- **Wagmi v2** - React hooks for Ethereum
- **RainbowKit** - Beautiful wallet connection
- **TailwindCSS** - Utility-first styling

### Backend

- **Express.js** - Fast, unopinionated web framework
- **Sequelize** - TypeScript ORM
- **MySQL** - Relational database
- **JWT** - Secure authentication

### Smart Contracts

- **Solidity 0.8.20** - Smart contract language
- **Foundry** - Development framework
- **OpenZeppelin** - Secure contract libraries

---

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/raflimulyarahman/prifyd.git
cd prifyd

# Start Backend
cd backend && npm install && npm run dev

# Start Frontend (new terminal)
cd frontend && npm install && npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📜 Smart Contracts

Deployed on **Base Sepolia Testnet**

| Contract                | Address         | Purpose             |
| ----------------------- | --------------- | ------------------- |
| **TieredBadge**         | `0xaB4a...1712` | ERC-1155 NFT Badges |
| **SubscriptionManager** | `0xB036...eA28` | Subscription Logic  |
| **GatedContent**        | `0x52Ed...Ea72` | Content Access      |

### Key Functions

```solidity
// Register as a creator
function registerCreator(string handle, string name, string profileURI)

// Configure subscription tiers
function configureTiers(uint256 bronze, uint256 silver, uint256 gold)

// Subscribe to a creator
function subscribe(address creator, uint256 tierId) payable

// Check access
function hasAccess(address user, address creator, uint256 tierId) → bool
```

---

## 🎨 UI Preview

|      Home       |   Profile    |   Subscribe    |
| :-------------: | :----------: | :------------: |
| Dark/Light Mode | Dynamic Data | Tier Selection |

---

## 📊 What Makes Us Different

| Feature           | PRIFYD | Patreon | OnlyFans |
| ----------------- | :----: | :-----: | :------: |
| Decentralized     |   ✅   |   ❌    |    ❌    |
| NFT Badges        |   ✅   |   ❌    |    ❌    |
| Low Fees (<3%)    |   ✅   |   ❌    |    ❌    |
| On-chain Payments |   ✅   |   ❌    |    ❌    |
| Creator Owned     |   ✅   |   ❌    |    ❌    |
| Base L2           |   ✅   |   ❌    |    ❌    |

---

## 🗺️ Roadmap

- [x] **Phase 1**: Core Platform ✅
  - Wallet connection, Authentication, Creator registration
- [x] **Phase 2**: Subscription System ✅
  - Tier configuration, NFT badges, Payment flow
- [ ] **Phase 3**: Content & Social
  - Exclusive content posting, Messaging, Notifications
- [ ] **Phase 4**: Growth
  - Mobile app, Multi-chain support, DAO governance

---

## 🏆 Built For

<p align="center">
  <img src="https://img.shields.io/badge/Base-Hackathon-0052FF?style=for-the-badge&logo=coinbase" alt="Base Hackathon"/>
</p>

---

## 📄 License

MIT License

---

<p align="center">
  <strong>Made with 💙 on Base</strong>
</p>

<p align="center">
  <a href="https://github.com/raflimulyarahman/prifyd">⭐ Star us on GitHub</a>
</p>
