# Base Creator Subscriptions

🎯 **On-chain Tiered Membership & Viral Content System for Base L2**

An ERC-1155 based subscription system where fans subscribe to creators, receive soulbound badges, and vote to make exclusive content go viral.

---

## 🏗️ Architecture

```
┌───────────────────────────────────────────────────────┐
│                    SYSTEM OVERVIEW                     │
├───────────────────────────────────────────────────────┤
│                                                        │
│   Creator                          Fan                 │
│   ┌────────────────┐              ┌────────────────┐  │
│   │ registerCreator│              │  subscribe()   │  │
│   │ ("handle",     │              │  + ETH payment │  │
│   │  basePrice)    │              └───────┬────────┘  │
│   └───────┬────────┘                      │           │
│           │                               │           │
│           └───────────┬───────────────────┘           │
│                       ▼                                │
│           ┌───────────────────────┐                   │
│           │  SubscriptionManager  │                   │
│           │  ─────────────────────│                   │
│           │  • handle (unique)    │                   │
│           │  • totalSubscribers   │                   │
│           │  • creatorRevenue     │                   │
│           └───────────┬───────────┘                   │
│                       │                                │
│         ┌─────────────┴─────────────┐                 │
│         ▼                           ▼                 │
│   ┌─────────────┐           ┌─────────────────┐      │
│   │ TieredBadge │           │  GatedContent   │      │
│   │ (ERC-1155)  │◀──────────│  (Viral Vote)   │      │
│   │ • Tier data │           │  • viralScore   │      │
│   │ • Soulbound │           │  • rewards      │      │
│   └─────────────┘           └─────────────────┘      │
│                                                        │
└───────────────────────────────────────────────────────┘
```

---

## 📦 Smart Contracts

### 1. TieredBadge.sol (ERC-1155)

**Token ID Structure:**

```
tokenId = creatorIndex × 1000 + tierLevel

Creator #5:  Bronze=5001, Silver=5002, Gold=5003
```

**Key Features:**

- `Tier` struct with name, price, maxSupply, minHoldTime
- `getTierLevel(user, creator)` - get user's tier
- `calculateLoyaltyBonus(duration)` - reward long-term holders
- Soulbound (non-transferable)

### 2. SubscriptionManager.sol

**Key Features:**

- `registerCreator(handle, basePrice)` - with unique handle
- `totalSubscribers` counter per creator
- `checkAccess(creator, subscriber, postId)`
- `creatorRevenue` mapping
- Platform fee (5% default)

### 3. GatedContent.sol

**Key Features:**

- `viralScore` - weighted by voter tier (Gold=3, Silver=2, Bronze=1)
- `_distributeVoterRewards()` - reward early voters
- `PostWentPublic` event

---

## 🚀 Getting Started

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation.html)
- Base Sepolia ETH ([faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet))

### Installation

```bash
cd base-creator-subscription

# Install dependencies
forge install OpenZeppelin/openzeppelin-contracts
forge install foundry-rs/forge-std

# Build
forge build
```

### Testing

```bash
# Run all tests
forge test

# Verbose
forge test -vvv
```

### Deployment

```bash
# Create .env
cp .env.example .env
# Add your PRIVATE_KEY

# Deploy
source .env
forge script script/Deploy.s.sol --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast
```

---

## 📊 Contract Addresses (Base Sepolia)

| Contract            | Address |
| ------------------- | ------- |
| TieredBadge         | `TBD`   |
| SubscriptionManager | `TBD`   |
| GatedContent        | `TBD`   |

---

## 🎓 Learning

See [LEARNING_GUIDE.md](./LEARNING_GUIDE.md) for comprehensive tutorial.

---

## 📁 Project Structure

```
base-creator-subscription/
├── src/
│   ├── TieredBadge.sol          # ERC-1155 soulbound badge
│   ├── SubscriptionManager.sol   # Payment & subscription
│   └── GatedContent.sol          # Content gating & viral
├── script/
│   └── Deploy.s.sol              # Deployment script
├── test/
│   └── SubscriptionSystem.t.sol  # Unit tests
├── LEARNING_GUIDE.md             # Tutorial
└── README.md
```

---

## 📜 License

MIT
