/**
 * Main Application Logic
 * Handles UI interactions and smart contract calls
 */

const App = {
    contract: null,
    tokenContract: null,
    campaigns: [],
    currentSection: 'dashboard',
    userStats: {
        totalContributed: 0,
        campaignsParticipated: 0,
        campaignsCreated: 0,
        activeCampaigns: 0
    },
    
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
        
        // Logout button
        document.getElementById('logout-btn').addEventListener('click',
            () => this.handleLogout());
        
        // Create campaign buttons
        document.getElementById('create-campaign-btn').addEventListener('click',
            () => this.showCreateCampaignModal());
        document.getElementById('dashboard-create-btn').addEventListener('click',
            () => this.showCreateCampaignModal());
        
        // Create campaign form
        document.getElementById('create-campaign-form').addEventListener('submit', 
            (e) => this.handleCreateCampaign(e));
        
        // Modal close
        document.querySelector('.modal-close').addEventListener('click',
            () => this.hideCreateCampaignModal());
        
        // Close modal on outside click
        document.getElementById('create-campaign-modal').addEventListener('click', (e) => {
            if (e.target.id === 'create-campaign-modal') {
                this.hideCreateCampaignModal();
            }
        });
        
        // Refresh campaigns button
        document.getElementById('refresh-campaigns').addEventListener('click', 
            () => this.loadCampaigns());
        
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.navigateToSection(section);
            });
        });
    },
    
    /**
     * Navigate to section
     */
    navigateToSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');
        
        // Update content
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(`${section}-section`).classList.add('active');
        
        // Update page title
        const titles = {
            'dashboard': 'Dashboard',
            'browse': 'Browse Campaigns',
            'contributions': 'My Contributions',
            'my-campaigns': 'My Campaigns',
            'rewards': 'My Rewards'
        };
        document.getElementById('page-title').textContent = titles[section] || section;
        
        this.currentSection = section;
        
        // Load section-specific data
        if (section === 'browse') {
            this.loadCampaigns();
        } else if (section === 'contributions') {
            this.loadMyContributions();
        } else if (section === 'my-campaigns') {
            this.loadMyCampaigns();
        }
    },
    
    /**
     * Show create campaign modal
     */
    showCreateCampaignModal() {
        if (!Web3Config.isConnected()) {
            alert('Please connect your wallet first!');
            return;
        }
        document.getElementById('create-campaign-modal').style.display = 'block';
    },
    
    /**
     * Hide create campaign modal
     */
    hideCreateCampaignModal() {
        document.getElementById('create-campaign-modal').style.display = 'none';
        document.getElementById('create-campaign-form').reset();
    },
    
    /**
     * Handle logout
     */
    handleLogout() {
        // This is a UI logout - actual wallet connection remains
        document.getElementById('connect-wallet').style.display = 'block';
        document.getElementById('logout-btn').style.display = 'none';
        this.navigateToSection('dashboard');
    },
    
    /**
     * Connect to MetaMask wallet
     */
    async connectWallet() {
        const connected = await Web3Config.connect();
        
        if (connected) {
            // Update UI
            document.getElementById('connect-wallet').style.display = 'none';
            document.getElementById('logout-btn').style.display = 'block';
            
            await Web3Config.updateAccountInfo();
            
            // Initialize contract
            await this.initContract();
            
            // Load campaigns and stats
            await this.loadCampaigns();
            await this.updateTokenBalance();
            await this.calculateUserStats();
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
        
        // Get token address and initialize token contract
        try {
            const tokenAddress = await this.contract.methods.getRewardTokenAddress().call();
            this.tokenContract = new web3.eth.Contract(REWARD_TOKEN_ABI, tokenAddress);
            console.log('Token contract initialized at:', tokenAddress);
            
            // Update token contract address in UI
            document.getElementById('token-contract').textContent = 
                Web3Config.formatAddress(tokenAddress);
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
            
            // Hide modal and clear form
            this.hideCreateCampaignModal();
            
            // Reload campaigns and stats
            setTimeout(() => {
                this.loadCampaigns();
                this.calculateUserStats();
            }, 2000);
            
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
     * Calculate user statistics
     */
    async calculateUserStats() {
        if (!this.contract || this.campaigns.length === 0) return;
        
        const userAddress = Web3Config.getAccount();
        let totalContributed = 0;
        let campaignsParticipated = 0;
        let campaignsCreated = 0;
        let activeCampaigns = 0;
        
        this.campaigns.forEach(campaign => {
            // Count active campaigns
            if (campaign.isActive && !campaign.finalized) {
                activeCampaigns++;
            }
            
            // Count user's campaigns
            if (campaign.creator.toLowerCase() === userAddress.toLowerCase()) {
                campaignsCreated++;
            }
            
            // Count participation and contributions
            if (campaign.userContribution && campaign.userContribution !== '0') {
                campaignsParticipated++;
                const contributionETH = parseFloat(Web3Config.fromWei(campaign.userContribution));
                totalContributed += contributionETH;
            }
        });
        
        // Update stats object
        this.userStats = {
            totalContributed,
            campaignsParticipated,
            campaignsCreated,
            activeCampaigns
        };
        
        // Update UI
        document.getElementById('total-contributed').textContent = 
            totalContributed.toFixed(4) + ' ETH';
        document.getElementById('campaigns-participated').textContent = 
            campaignsParticipated;
        document.getElementById('campaigns-created').textContent = 
            campaignsCreated;
        document.getElementById('active-campaigns-count').textContent = 
            activeCampaigns;
        document.getElementById('my-campaigns-count').textContent = 
            campaignsCreated;
    },
    
    /**
     * Load my contributions
     */
    async loadMyContributions() {
        const userAddress = Web3Config.getAccount();
        const myContributions = this.campaigns.filter(campaign => {
            return campaign.userContribution && campaign.userContribution !== '0';
        });
        
        this.displayFilteredCampaigns(myContributions, 'contributions-list');
    },
    
    /**
     * Load my campaigns
     */
    async loadMyCampaigns() {
        const userAddress = Web3Config.getAccount();
        const myCampaigns = this.campaigns.filter(campaign => {
            return campaign.creator.toLowerCase() === userAddress.toLowerCase();
        });
        
        this.displayFilteredCampaigns(myCampaigns, 'my-campaigns-list');
    },
    
    /**
     * Display filtered campaigns
     */
    displayFilteredCampaigns(campaigns, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        if (campaigns.length === 0) {
            container.innerHTML = '<p class="info-text">No campaigns found</p>';
            return;
        }
        
        campaigns.forEach(campaign => {
            const card = this.createCampaignCard(campaign);
            container.appendChild(card);
        });
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
        
        // Update user stats after displaying
        this.calculateUserStats();
    },
    
    /**
     * Create campaign card element
     */
    createCampaignCard(campaign) {
        const template = document.getElementById('campaign-template');
        const card = template.content.cloneNode(true);
        
        // Fill in campaign details
        card.querySelector('.campaign-title').textContent = campaign.title;
        
        const goalETH = Web3Config.fromWei(campaign.fundingGoal);
        const raisedETH = Web3Config.fromWei(campaign.amountRaised);
        const userContribETH = Web3Config.fromWei(campaign.userContribution);
        
        card.querySelector('.campaign-creator').textContent = 
            Web3Config.formatAddress(campaign.creator);
        card.querySelector('.campaign-goal').textContent = parseFloat(goalETH).toFixed(4) + ' ETH';
        card.querySelector('.campaign-raised').textContent = parseFloat(raisedETH).toFixed(4) + ' ETH';
        card.querySelector('.user-contribution').textContent = parseFloat(userContribETH).toFixed(4) + ' ETH';
        
        // Calculate progress
        const progress = (parseFloat(raisedETH) / parseFloat(goalETH)) * 100;
        card.querySelector('.progress-percentage').textContent = progress.toFixed(2) + '%';
        card.querySelector('.progress-fill').style.width = Math.min(progress, 100) + '%';
        
        // Format deadline
        const deadlineDate = new Date(campaign.deadline * 1000);
        card.querySelector('.campaign-deadline').textContent = deadlineDate.toLocaleString();
        
        // Set status badge
        const badge = card.querySelector('.campaign-badge');
        let status = 'Active';
        let badgeClass = 'badge-active';
        
        if (campaign.finalized) {
            if (campaign.goalReached) {
                status = 'Goal Met';
                badgeClass = 'badge-goal-met';
            } else {
                status = 'Goal Not Met';
                badgeClass = 'badge-ended';
            }
        } else if (!campaign.isActive) {
            status = 'Ended';
            badgeClass = 'badge-ended';
        }
        
        badge.textContent = status;
        badge.className = 'campaign-badge ' + badgeClass;
        
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
            
            // Reload campaigns, balances, and stats
            setTimeout(() => {
                this.loadCampaigns();
                Web3Config.updateAccountInfo();
                this.updateTokenBalance();
                this.calculateUserStats();
                
                // Refresh current section
                if (this.currentSection === 'contributions') {
                    this.loadMyContributions();
                } else if (this.currentSection === 'my-campaigns') {
                    this.loadMyCampaigns();
                }
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
            
            // Reload campaigns and stats
            setTimeout(() => {
                this.loadCampaigns();
                this.calculateUserStats();
                
                // Refresh current section
                if (this.currentSection === 'contributions') {
                    this.loadMyContributions();
                } else if (this.currentSection === 'my-campaigns') {
                    this.loadMyCampaigns();
                }
            }, 2000);
            
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
            const balanceNumber = parseFloat(balanceFormatted);
            
            // Format with thousands separator
            const formattedBalance = balanceNumber.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            });
            
            document.getElementById('token-balance').textContent = 
                formattedBalance + ' CRT';
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
