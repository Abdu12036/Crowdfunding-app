/**
 * Main Application Logic
 * Handles UI interactions and smart contract calls
 */

const App = {
    contract: null,
    tokenContract: null,
    campaigns: [],
    
    /**
     * Initialize the application
     */
    async init() {
        console.log('Initializing application...');
        
        // Initialize Web3
        const initialized = await Web3Config.init();
        if (!initialized) return;
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('Application initialized');
    },
    
    /**
     * Setup UI event listeners
     */
    setupEventListeners() {
        // Connect wallet button
        document.getElementById('connect-wallet').addEventListener('click', 
            () => this.connectWallet());
        
        // Create campaign form
        document.getElementById('create-campaign-form').addEventListener('submit', 
            (e) => this.handleCreateCampaign(e));
        
        // Refresh campaigns button
        document.getElementById('refresh-campaigns').addEventListener('click', 
            () => this.loadCampaigns());
    },
    
    /**
     * Connect to MetaMask wallet
     */
    async connectWallet() {
        const connected = await Web3Config.connect();
        
        if (connected) {
            // Update UI
            document.getElementById('connect-wallet').style.display = 'none';
            document.getElementById('account-info').style.display = 'block';
            
            await Web3Config.updateAccountInfo();
            
            // Initialize contract
            await this.initContract();
            
            // Load campaigns
            await this.loadCampaigns();
            
            // Update token balance
            await this.updateTokenBalance();
        }
    },
    
    /**
     * Initialize smart contract
     */
    async initContract() {
        const web3 = Web3Config.getWeb3();
        
        // Create contract instance
        this.contract = new web3.eth.Contract(CROWDFUNDING_ABI, CONTRACT_ADDRESS);
        
        console.log('Contract initialized at:', CONTRACT_ADDRESS);
        
        // Display contract address
        document.getElementById('contract-address').textContent = 
            Web3Config.formatAddress(CONTRACT_ADDRESS);
        
        // Get token address and initialize token contract
        try {
            const tokenAddress = await this.contract.methods.getRewardTokenAddress().call();
            this.tokenContract = new web3.eth.Contract(REWARD_TOKEN_ABI, tokenAddress);
            console.log('Token contract initialized at:', tokenAddress);
        } catch (error) {
            console.error('Error initializing token contract:', error);
        }
    },
    
    /**
     * Handle create campaign form submission
     */
    async handleCreateCampaign(event) {
        event.preventDefault();
        
        if (!Web3Config.isConnected()) {
            alert('Please connect your wallet first!');
            return;
        }
        
        // Get form values
        const title = document.getElementById('campaign-title').value;
        const goalETH = document.getElementById('funding-goal').value;
        const duration = document.getElementById('duration').value;
        
        // Validate inputs
        if (!title || !goalETH || !duration) {
            alert('Please fill in all fields!');
            return;
        }
        
        try {
            this.showTransactionStatus('Creating campaign...', 'pending');
            
            // Convert ETH to Wei
            const goalWei = Web3Config.toWei(goalETH);
            
            // Send transaction
            const receipt = await this.contract.methods
                .createCampaign(title, goalWei, duration)
                .send({ from: Web3Config.getAccount() });
            
            console.log('Campaign created:', receipt);
            
            this.showTransactionStatus(
                'Campaign created successfully!', 
                'success',
                receipt.transactionHash
            );
            
            // Clear form
            document.getElementById('create-campaign-form').reset();
            
            // Reload campaigns
            setTimeout(() => this.loadCampaigns(), 2000);
            
        } catch (error) {
            console.error('Error creating campaign:', error);
            this.showTransactionStatus(
                'Error creating campaign: ' + error.message, 
                'error'
            );
        }
    },
    
    /**
     * Load all campaigns
     */
    async loadCampaigns() {
        if (!this.contract) {
            console.log('Contract not initialized');
            return;
        }
        
        try {
            // Get total number of campaigns
            const totalCampaigns = await this.contract.methods.getTotalCampaigns().call();
            console.log('Total campaigns:', totalCampaigns);
            
            if (totalCampaigns == 0) {
                document.getElementById('campaigns-list').innerHTML = 
                    '<p class="info-text">No campaigns yet. Create the first one!</p>';
                return;
            }
            
            // Load each campaign
            this.campaigns = [];
            for (let i = 0; i < totalCampaigns; i++) {
                const campaign = await this.loadCampaign(i);
                if (campaign) {
                    this.campaigns.push(campaign);
                }
            }
            
            // Display campaigns
            this.displayCampaigns();
            
        } catch (error) {
            console.error('Error loading campaigns:', error);
        }
    },
    
    /**
     * Load a single campaign
     */
    async loadCampaign(campaignId) {
        try {
            const campaign = await this.contract.methods.getCampaign(campaignId).call();
            
            // Get user's contribution
            const userContribution = await this.contract.methods
                .getContribution(campaignId, Web3Config.getAccount())
                .call();
            
            return {
                id: campaignId,
                creator: campaign.creator,
                title: campaign.title,
                fundingGoal: campaign.fundingGoal,
                deadline: campaign.deadline,
                amountRaised: campaign.amountRaised,
                finalized: campaign.finalized,
                goalReached: campaign.goalReached,
                isActive: campaign.isActive,
                userContribution: userContribution
            };
        } catch (error) {
            console.error(`Error loading campaign ${campaignId}:`, error);
            return null;
        }
    },
    
    /**
     * Display campaigns in UI
     */
    displayCampaigns() {
        const container = document.getElementById('campaigns-list');
        container.innerHTML = '';
        
        if (this.campaigns.length === 0) {
            container.innerHTML = '<p class="info-text">No campaigns found</p>';
            return;
        }
        
        this.campaigns.forEach(campaign => {
            const card = this.createCampaignCard(campaign);
            container.appendChild(card);
        });
    },
    
    /**
     * Create campaign card element
     */
    createCampaignCard(campaign) {
        const template = document.getElementById('campaign-template');
        const card = template.content.cloneNode(true);
        
        // Fill in campaign details
        card.querySelector('.campaign-title').textContent = campaign.title;
        card.querySelector('.campaign-creator').textContent = 
            Web3Config.formatAddress(campaign.creator);
        
        const goalETH = Web3Config.fromWei(campaign.fundingGoal);
        const raisedETH = Web3Config.fromWei(campaign.amountRaised);
        const userContribETH = Web3Config.fromWei(campaign.userContribution);
        
        card.querySelector('.campaign-goal').textContent = parseFloat(goalETH).toFixed(4);
        card.querySelector('.campaign-raised').textContent = parseFloat(raisedETH).toFixed(4);
        card.querySelector('.user-contribution').textContent = parseFloat(userContribETH).toFixed(4);
        
        // Calculate progress
        const progress = (parseFloat(raisedETH) / parseFloat(goalETH)) * 100;
        card.querySelector('.campaign-progress').textContent = progress.toFixed(2);
        card.querySelector('.progress-fill').style.width = Math.min(progress, 100) + '%';
        
        // Format deadline
        const deadlineDate = new Date(campaign.deadline * 1000);
        card.querySelector('.campaign-deadline').textContent = deadlineDate.toLocaleString();
        
        // Set status
        let status = 'Active';
        let statusClass = 'status-active';
        if (campaign.finalized) {
            status = campaign.goalReached ? 'Successful' : 'Ended';
            statusClass = campaign.goalReached ? 'status-successful' : 'status-ended';
        } else if (!campaign.isActive) {
            status = 'Ended (Not Finalized)';
            statusClass = 'status-ended';
        }
        
        const statusSpan = card.querySelector('.campaign-status');
        statusSpan.textContent = status;
        statusSpan.className = 'campaign-status ' + statusClass;
        
        // Setup contribute button
        const contributeBtn = card.querySelector('.contribute-btn');
        const contributeInput = card.querySelector('.contribute-amount');
        
        if (campaign.isActive && !campaign.finalized) {
            contributeBtn.addEventListener('click', () => 
                this.handleContribute(campaign.id, contributeInput.value));
        } else {
            contributeBtn.disabled = true;
            contributeInput.disabled = true;
        }
        
        // Setup finalize button
        const finalizeBtn = card.querySelector('.finalize-btn');
        if (!campaign.isActive && !campaign.finalized) {
            finalizeBtn.style.display = 'inline-block';
            finalizeBtn.addEventListener('click', () => 
                this.handleFinalize(campaign.id));
        }
        
        return card;
    },
    
    /**
     * Handle contribution to campaign
     */
    async handleContribute(campaignId, amountETH) {
        if (!amountETH || parseFloat(amountETH) <= 0) {
            alert('Please enter a valid amount!');
            return;
        }
        
        try {
            this.showTransactionStatus('Processing contribution...', 'pending');
            
            const amountWei = Web3Config.toWei(amountETH);
            
            const receipt = await this.contract.methods
                .contribute(campaignId)
                .send({ 
                    from: Web3Config.getAccount(),
                    value: amountWei
                });
            
            console.log('Contribution successful:', receipt);
            
            this.showTransactionStatus(
                'Contribution successful! You received CRT tokens!', 
                'success',
                receipt.transactionHash
            );
            
            // Reload campaigns and balances
            setTimeout(() => {
                this.loadCampaigns();
                Web3Config.updateAccountInfo();
                this.updateTokenBalance();
            }, 2000);
            
        } catch (error) {
            console.error('Error contributing:', error);
            this.showTransactionStatus(
                'Error contributing: ' + error.message, 
                'error'
            );
        }
    },
    
    /**
     * Handle campaign finalization
     */
    async handleFinalize(campaignId) {
        try {
            this.showTransactionStatus('Finalizing campaign...', 'pending');
            
            const receipt = await this.contract.methods
                .finalizeCampaign(campaignId)
                .send({ from: Web3Config.getAccount() });
            
            console.log('Campaign finalized:', receipt);
            
            this.showTransactionStatus(
                'Campaign finalized successfully!', 
                'success',
                receipt.transactionHash
            );
            
            // Reload campaigns
            setTimeout(() => this.loadCampaigns(), 2000);
            
        } catch (error) {
            console.error('Error finalizing campaign:', error);
            this.showTransactionStatus(
                'Error finalizing: ' + error.message, 
                'error'
            );
        }
    },
    
    /**
     * Update token balance display
     */
    async updateTokenBalance() {
        if (!this.tokenContract) return;
        
        try {
            const balance = await this.tokenContract.methods
                .balanceOf(Web3Config.getAccount())
                .call();
            
            const balanceFormatted = Web3Config.fromWei(balance);
            document.getElementById('token-balance').textContent = 
                parseFloat(balanceFormatted).toFixed(2);
        } catch (error) {
            console.error('Error getting token balance:', error);
        }
    },
    
    /**
     * Show transaction status
     */
    showTransactionStatus(message, type, txHash = null) {
        const statusDiv = document.getElementById('transaction-status');
        const messageDiv = document.getElementById('status-message');
        const linkDiv = document.getElementById('transaction-link');
        
        statusDiv.style.display = 'block';
        messageDiv.textContent = message;
        
        if (txHash) {
            const networkId = Web3Config.getNetworkId();
            let explorerUrl = '';
            
            if (networkId === 11155111) {
                explorerUrl = `https://sepolia.etherscan.io/tx/${txHash}`;
            } else if (networkId === 17000) {
                explorerUrl = `https://holesky.etherscan.io/tx/${txHash}`;
            }
            
            if (explorerUrl) {
                linkDiv.innerHTML = `<a href="${explorerUrl}" target="_blank">View on Block Explorer</a>`;
            } else {
                linkDiv.innerHTML = `<p>Transaction Hash: ${txHash}</p>`;
            }
        } else {
            linkDiv.innerHTML = '';
        }
        
        // Auto-hide after 10 seconds for success/error
        if (type !== 'pending') {
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 10000);
        }
    }
};

// Initialize app when page loads
window.addEventListener('load', () => {
    App.init();
});
