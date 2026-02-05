/**
 * Web3 Configuration Module
 * Handles Web3 initialization and MetaMask connection
 */

const Web3Config = {
    web3: null,
    account: null,
    networkId: null,
    
    // Supported test networks
    supportedNetworks: {
        11155111: 'Sepolia',
        17000: 'Holesky',
        1337: 'Localhost'
    },
    
    /**
     * Initialize Web3 and check for MetaMask
     */
    async init() {
        // Check if MetaMask is installed
        if (typeof window.ethereum !== 'undefined') {
            console.log('MetaMask is installed!');
            
            // Ensure Web3.js library is loaded
            if (typeof Web3 === 'undefined') {
                console.error('Web3.js library not loaded. Please include web3.min.js.');
                alert('Web3 library is missing. Please ensure web3.min.js is included.');
                return false;
            }

            // Create Web3 instance
            try {
                this.web3 = new Web3(window.ethereum);
            } catch (err) {
                console.error('Error creating Web3 instance:', err);
                alert('Failed to initialize Web3: ' + err.message);
                return false;
            }
            
            // Setup account change listener
            window.ethereum.on('accountsChanged', (accounts) => {
                console.log('Account changed:', accounts[0]);
                if (accounts.length === 0) {
                    this.handleDisconnect();
                } else {
                    this.account = accounts[0];
                    this.updateAccountInfo();
                }
            });
            
            // Setup network change listener
            window.ethereum.on('chainChanged', (chainId) => {
                console.log('Network changed:', chainId);
                window.location.reload();
            });
            
            return true;
        } else {
            console.error('MetaMask is not installed!');
            alert('Please install MetaMask to use this application!');
            return false;
        }
    },

    
    /**
     * Connect to MetaMask wallet
     */
    async connect() {
        try {
            // Request account access
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            this.account = accounts[0];
            console.log('Connected account:', this.account);
            
            // Get network ID
            this.networkId = await this.web3.eth.net.getId();
            console.log('Network ID:', this.networkId);
            
            // Check if on supported network
            if (!this.supportedNetworks[this.networkId]) {
                alert('Please connect to Sepolia, Holesky, or a local test network!');
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Error connecting to MetaMask:', error);
            alert('Failed to connect to MetaMask: ' + error.message);
            return false;
        }
    },
    
    /**
     * Get current account
     */
    getAccount() {
        return this.account;
    },
    
    /**
     * Get Web3 instance
     */
    getWeb3() {
        return this.web3;
    },
    
    /**
     * Get network name
     */
    getNetworkName() {
        return this.supportedNetworks[this.networkId] || 'Unknown Network';
    },
    
    /**
     * Get network ID
     */
    getNetworkId() {
        return this.networkId;
    },
    
    /**
     * Check if connected
     */
    isConnected() {
        return this.account !== null;
    },
    
    /**
     * Handle disconnect
     */
    handleDisconnect() {
        this.account = null;
        console.log('Wallet disconnected');
        // UI fallbacks (some elements may not exist in markup)
        const connectBtn = document.getElementById('connect-wallet');
        const logoutBtn = document.getElementById('logout-btn');
        const acctAddr = document.getElementById('account-address');
        const ethBal = document.getElementById('eth-balance');
        const headerBal = document.getElementById('header-balance');
        const walletShort = document.getElementById('wallet-short');

        if (connectBtn) connectBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (acctAddr) acctAddr.textContent = 'Not connected';
        if (ethBal) ethBal.textContent = '0.0000';
        if (headerBal) headerBal.textContent = '0.0000 ETH';
        if (walletShort) walletShort.textContent = '(Wallet: Not connected)';
    },
    
    /**
     * Update account information display
     */
    async updateAccountInfo() {
        if (!this.isConnected()) return;
        
        // Get ETH balance
        const balance = await this.web3.eth.getBalance(this.account);
        const ethBalance = this.web3.utils.fromWei(balance, 'ether');
        const displayBalance = parseFloat(ethBalance).toFixed(4);
        
        // Update UI (safely check elements exist)
        const acctAddr = document.getElementById('account-address');
        const ethBal = document.getElementById('eth-balance');
        const headerBal = document.getElementById('header-balance');
        const walletShort = document.getElementById('wallet-short');
        const connectBtn = document.getElementById('connect-wallet');
        const logoutBtn = document.getElementById('logout-btn');
        const networkElem = document.getElementById('network-name');

        if (acctAddr) acctAddr.textContent = this.account.substring(0, 6) + '...' + this.account.substring(38);
        if (ethBal) ethBal.textContent = displayBalance;
        if (headerBal) headerBal.textContent = displayBalance + ' ETH';
        if (walletShort) walletShort.textContent = `(Wallet: ${this.formatAddress(this.account)})`;
        if (networkElem) networkElem.textContent = this.getNetworkName();
        if (connectBtn) connectBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';
    },
    
    /**
     * Format address for display
     */
    formatAddress(address) {
        return address.substring(0, 6) + '...' + address.substring(38);
    },
    
    /**
     * Convert Wei to ETH
     */
    fromWei(wei) {
        return this.web3.utils.fromWei(wei.toString(), 'ether');
    },
    
    /**
     * Convert ETH to Wei
     */
    toWei(eth) {
        return this.web3.utils.toWei(eth.toString(), 'ether');
    }
};

// Initialize Web3 library
if (typeof Web3 === 'undefined') {
    console.error('Web3 library not loaded. Please include Web3.js library.');
}
