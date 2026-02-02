# 🚀 BLOCKCHAIN CROWDFUNDING PROJECT - SETUP INSTRUCTIONS

## 📦 Project Contents

This complete blockchain crowdfunding project includes:

1. **Smart Contracts** (Solidity)
   - Crowdfunding.sol - Main crowdfunding logic
   - RewardToken.sol - ERC-20 reward token

2. **Frontend Application**
   - HTML/CSS/JavaScript interface
   - Web3.js integration
   - MetaMask wallet connection

3. **Documentation**
   - Technical Documentation (PDF)
   - README with full instructions
   - This setup guide

4. **Presentation**
   - PowerPoint slides (requires Node.js to generate)

## 🔧 Quick Start Guide

### Step 1: Install Node.js Dependencies

```bash
npm install
```

This installs:
- Hardhat (Ethereum development environment)
- Web3 libraries
- Testing tools

### Step 2: Get Test ETH

Visit these faucets to get free test ETH:

**Sepolia Testnet:**
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia

**Holesky Testnet:**
- https://holesky-faucet.pk910.de/

**Local Network:**
- No faucet needed - Hardhat provides 10000 ETH per account

### Step 3: Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your MetaMask private key
# IMPORTANT: Only use a test account, never your main wallet!
```

Get your private key from MetaMask:
1. Click account icon → Account Details
2. Click "Export Private Key"
3. Enter password
4. Copy the key and paste it in .env file

⚠️ **NEVER commit your .env file or share your private key!**

### Step 4: Deploy Contracts

**Option A: Local Network (Recommended for Testing)**

Terminal 1 - Start local blockchain:
```bash
npm run node
```

Terminal 2 - Deploy contracts:
```bash
npm run deploy:local
```

**Option B: Sepolia Testnet**

```bash
npm run deploy:sepolia
```

**Option C: Holesky Testnet**

```bash
npm run deploy:holesky
```

### Step 5: Configure Frontend

After deployment, you'll see output like:

```
Crowdfunding Contract: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

1. Copy this contract address
2. Open `frontend/js/contract-abi.js`
3. Replace the CONTRACT_ADDRESS value:

```javascript
const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Your address here
```

### Step 6: Run the Application

**Method 1: Direct File Access**
- Navigate to the `frontend` folder
- Open `index.html` in your browser

**Method 2: Local Web Server (Recommended)**

Using Python:
```bash
cd frontend
python -m http.server 8000
```

Then open: http://localhost:8000

Using Node.js:
```bash
npx http-server frontend -p 8000
```

Then open: http://localhost:8000

### Step 7: Connect MetaMask

1. Click "Connect MetaMask" in the application
2. Select the account you want to use
3. Make sure you're on the same network where you deployed:
   - Local: Localhost 8545
   - Sepolia: Sepolia test network
   - Holesky: Holesky test network

### Step 8: Test the Application

1. **Create a Campaign**
   - Fill in campaign title, goal (in ETH), and duration (in days)
   - Click "Create Campaign"
   - Approve the transaction in MetaMask
   - Wait for confirmation

2. **Contribute to a Campaign**
   - Find an active campaign
   - Enter contribution amount
   - Click "Contribute"
   - Approve the transaction
   - You'll receive CRT tokens automatically!

3. **Finalize a Campaign**
   - Wait for campaign deadline to pass
   - Click "Finalize" button
   - Funds are transferred to campaign creator

## 📊 Generate Presentation (Optional)

To generate the PowerPoint presentation:

```bash
# Install pptxgenjs if you haven't
npm install pptxgenjs

# Run the presentation generator
node scripts/create_presentation.js
```

This creates: `Blockchain_Crowdfunding_Presentation.pptx`

## 📄 Documentation

All documentation is already generated:
- `docs/Technical_Documentation.pdf` - Complete technical guide
- `README.md` - Detailed project information

## 🐛 Troubleshooting

### MetaMask Not Connecting
- Ensure MetaMask is installed
- Refresh the page
- Check browser console for errors

### Wrong Network Error
- Open MetaMask
- Switch to the network where you deployed
- Refresh the application

### Transaction Failing
- Check you have enough test ETH
- Verify contract address is correct
- Check you're on the correct network

### Contract Not Found
- Verify CONTRACT_ADDRESS in contract-abi.js
- Ensure deployment was successful
- Check network ID matches

## 📁 Project Structure

```
blockchain-crowdfunding/
├── contracts/              # Smart contracts
│   ├── Crowdfunding.sol
│   └── RewardToken.sol
├── frontend/              # Web application
│   ├── index.html
│   ├── css/styles.css
│   └── js/
│       ├── web3-config.js
│       ├── contract-abi.js
│       └── app.js
├── scripts/               # Deployment scripts
│   └── deploy.js
├── docs/                  # Documentation
│   └── Technical_Documentation.pdf
├── hardhat.config.js      # Hardhat configuration
├── package.json           # Dependencies
└── README.md             # Main documentation
```

## ✅ Submission Checklist

For final submission, ensure you have:

- [ ] PDF documentation (already in docs/)
- [ ] GitHub repository with code
- [ ] Presentation file (generate with script)
- [ ] All smart contracts in contracts/
- [ ] Working frontend in frontend/
- [ ] README with instructions
- [ ] Deployment scripts
- [ ] .gitignore (to protect .env)

## 🎯 Project Requirements Met

✅ Smart contract implementation (Crowdfunding.sol)
✅ ERC-20 token (RewardToken.sol)
✅ MetaMask integration (web3-config.js)
✅ Test network deployment (Sepolia/Holesky/Local)
✅ Campaign creation functionality
✅ Contribution mechanism with token rewards
✅ Campaign finalization
✅ Documentation (PDF + README)
✅ Frontend interface

## 🔐 Security Reminders

- ⚠️ Use test networks only
- ⚠️ Never use real cryptocurrency
- ⚠️ Don't commit .env file
- ⚠️ Use test accounts only
- ⚠️ This is for educational purposes

## 💡 Tips for Success

1. **Test thoroughly** - Try all features before submission
2. **Check documentation** - Make sure PDF is complete
3. **Verify deployment** - Ensure contracts work on testnet
4. **Test with team** - Have teammates test your application
5. **Screenshots** - Take screenshots of working application
6. **Video demo** - Consider recording a demo video

## 🎓 Learning Outcomes

By completing this project, you've demonstrated:
- Solidity smart contract development
- ERC-20 token implementation
- Web3.js blockchain interaction
- MetaMask wallet integration
- DApp architecture design
- Security best practices
- Full-stack blockchain development

## 📞 Need Help?

If you encounter issues:

1. Check the troubleshooting section above
2. Review the README.md file
3. Check browser console for error messages
4. Verify all setup steps were completed
5. Ensure you have test ETH in your wallet
6. Confirm you're on the correct network

## 🎉 Success Indicators

Your project is working correctly if:
- ✓ MetaMask connects successfully
- ✓ You can create campaigns
- ✓ Contributions update balances
- ✓ CRT tokens are minted and transferred
- ✓ Campaigns can be finalized
- ✓ No console errors
- ✓ UI updates reflect blockchain state

---

**Good luck with your final examination project! 🚀**

Remember: This project demonstrates your understanding of blockchain technology, smart contract development, and decentralized application architecture. Make sure to test everything thoroughly before submission.
