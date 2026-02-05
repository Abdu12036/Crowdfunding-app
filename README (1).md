# Decentralized Crowdfunding Platform

A fully functional decentralized crowdfunding application built on Ethereum with ERC-20 reward tokens. This project demonstrates smart contract development, blockchain interaction, and DApp architecture.

## Project Overview

This application enables users to:
- Create crowdfunding campaigns with specific goals and deadlines
- Contribute test ETH to active campaigns
- Receive CRT (Crowdfunding Reward Token) proportional to contributions
- Finalize campaigns after deadlines
- Track all contributions and campaign progress on-chain

## Architecture

### Smart Contracts

1. **Crowdfunding.sol**
   - Main contract managing all crowdfunding logic
   - Handles campaign creation, contributions, and finalization
   - Automatically deploys and integrates with RewardToken
   - Implements secure fund management

2. **RewardToken.sol**
   - ERC-20 compliant token contract
   - Minted proportionally to user contributions (1 CRT per 0.001 ETH)
   - No real monetary value (educational purpose only)
   - Only mintable by Crowdfunding contract

### Frontend Architecture

- **HTML5**: Semantic structure with responsive design
- **CSS3**: Modern styling with gradient effects and animations
- **Vanilla JavaScript**: No framework dependencies
- **Web3.js**: Ethereum blockchain interaction
- **MetaMask**: Wallet integration and transaction signing

### Key Features

✅ Campaign Management
- Create campaigns with title, goal, and duration
- View all active and completed campaigns
- Track individual contributions per user

✅ Smart Contribution System
- Contribute any amount of test ETH
- Automatic reward token distribution
- Real-time balance updates

✅ Security Features
- Input validation at contract level
- Deadline enforcement
- Finalization safeguards
- No reentrancy vulnerabilities

✅ User Interface
- Real-time wallet connection status
- Network validation (Sepolia/Holesky/Localhost)
- Progress bars and status indicators
- Transaction status tracking
- Responsive design for all devices

## 📋 Prerequisites

- Node.js (v16 or higher)
- MetaMask browser extension
- Test ETH from a faucet
- Git

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd blockchain-crowdfunding
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your private key:

```
PRIVATE_KEY=your_metamask_private_key
```

⚠️ **Security Warning**: Never commit your `.env` file or share your private key!

### 4. Get Test ETH

You need test ETH to deploy contracts and interact with the application.

**Sepolia Faucets:**
- https://cloud.google.com/application/web3/faucet/ethereum/sepolia
- https://sepoliafaucet.com/
- https://faucet.quicknode.com/ethereum/sepolia

**Local Network:**
- Hardhat provides test accounts with 10000 ETH each

## 📦 Deployment

### Option 1: Local Network (Recommended for Testing)

Start a local Ethereum node:

```bash
npm run node
```

In a new terminal, deploy:

```bash
npm run deploy:local
```

### Option 2: Sepolia Testnet

```bash
npm run deploy:sepolia
```

### Post-Deployment Steps

1. Copy the deployed contract address from the console output
2. Open `frontend/js/contract-abi.js`
3. Replace `0xYourContractAddressHere` with your actual contract address:

```javascript
const CONTRACT_ADDRESS = '0xYourActualContractAddress';
```

## 🌐 Running the Application

### Method 1: Direct File Opening

1. Navigate to the `frontend` folder
2. Open `index.html` in your browser
3. Connect MetaMask when prompted

### Method 2: Local Web Server (Recommended)

Using Python:

```bash
cd frontend
python -m http.server 8000
```

Or using Node.js:

```bash
npx http-server frontend -p 8000
```

Then open: http://localhost:8000

### Method 3: VS Code Live Server

1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## 🔧 Using the Application

### 1. Connect MetaMask

- Click "Connect MetaMask" button
- Approve the connection request
- Ensure you're on the correct network (Sepolia, Holesky, or Localhost)

### 2. Create a Campaign

- Fill in campaign details:
  - **Title**: Name of your campaign
  - **Funding Goal**: Target amount in ETH (e.g., 0.1)
  - **Duration**: Campaign length in days (e.g., 7)
- Click "Create Campaign"
- Confirm the transaction in MetaMask
- Wait for confirmation (usually 10-30 seconds on testnets)

### 3. Contribute to Campaigns

- Browse active campaigns
- Enter contribution amount in ETH
- Click "Contribute"
- Confirm transaction in MetaMask
- Receive CRT tokens automatically

### 4. Finalize Campaigns

- Wait for campaign deadline to pass
- Click "Finalize" button on expired campaigns
- Funds are transferred to campaign creator
- Campaign marked as complete

## 📊 Smart Contract Functions

### Crowdfunding Contract

| Function | Description | Access |
|----------|-------------|--------|
| `createCampaign()` | Create a new campaign | Public |
| `contribute()` | Contribute ETH to a campaign | Public |
| `finalizeCampaign()` | Finalize expired campaign | Public |
| `getCampaign()` | Get campaign details | View |
| `getContribution()` | Get user's contribution | View |
| `getTotalCampaigns()` | Get total campaign count | View |

### RewardToken Contract (ERC-20)

| Function | Description | Access |
|----------|-------------|--------|
| `balanceOf()` | Get token balance | View |
| `transfer()` | Transfer tokens | Public |
| `approve()` | Approve spender | Public |
| `transferFrom()` | Transfer from approved | Public |
| `mint()` | Mint new tokens | Owner Only |

## 📁 Project Structure

```
blockchain-crowdfunding/
├── contracts/
│   ├── Crowdfunding.sol      # Main crowdfunding contract
│   └── RewardToken.sol        # ERC-20 token contract
├── frontend/
│   ├── css/
│   │   └── styles.css         # Application styles
│   ├── js/
│   │   ├── web3-config.js     # Web3 initialization
│   │   ├── contract-abi.js    # Contract ABIs
│   │   └── app.js             # Main application logic
│   └── index.html             # Main HTML file
├── scripts/
│   └── deploy.js              # Deployment script
├── hardhat.config.js          # Hardhat configuration
├── package.json               # Node dependencies
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
└── README.md                  # This file
```


### Token Economics

- 1 CRT = 0.001 ETH contribution
- Tokens minted automatically on contribution
- No token cap (infinite supply possible)
- Tokens are transferable but have no intrinsic value

### Campaign Lifecycle

1. **Created**: Campaign is active and accepting contributions
2. **Active**: Before deadline, accepting contributions
3. **Expired**: Past deadline, awaiting finalization
4. **Finalized**: Completed, funds transferred to creator

**⚠️ IMPORTANT DISCLAIMER**: This application is for educational purposes only. Use only test networks and test tokens. Never use real cryptocurrency or deploy to mainnet without proper security audits.
