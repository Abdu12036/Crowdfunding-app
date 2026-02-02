// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RewardToken
 * @dev ERC-20 token for rewarding crowdfunding contributors
 * This token has no real monetary value and is for educational purposes only
 */
contract RewardToken {
    
    // Token metadata
    string public constant name = "Crowdfunding Reward Token";
    string public constant symbol = "CRT";
    uint8 public constant decimals = 18;
    
    // Total supply
    uint256 private _totalSupply;
    
    // Balances mapping
    mapping(address => uint256) private _balances;
    
    // Allowances mapping
    mapping(address => mapping(address => uint256)) private _allowances;
    
    // Owner (Crowdfunding contract)
    address public owner;
    
    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Mint(address indexed to, uint256 amount);
    
    /**
     * @dev Constructor sets the owner to the deployer
     */
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Modifier to restrict access to owner only
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    /**
     * @dev Get total supply
     */
    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }
    
    /**
     * @dev Get balance of an account
     * @param account Address to query
     */
    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }
    
    /**
     * @dev Transfer tokens
     * @param to Recipient address
     * @param amount Amount to transfer
     */
    function transfer(address to, uint256 amount) external returns (bool) {
        require(to != address(0), "Transfer to zero address");
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        
        _balances[msg.sender] -= amount;
        _balances[to] += amount;
        
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    /**
     * @dev Get allowance
     * @param tokenOwner Token owner address
     * @param spender Spender address
     */
    function allowance(address tokenOwner, address spender) 
        external 
        view 
        returns (uint256) 
    {
        return _allowances[tokenOwner][spender];
    }
    
    /**
     * @dev Approve spender
     * @param spender Spender address
     * @param amount Amount to approve
     */
    function approve(address spender, uint256 amount) external returns (bool) {
        require(spender != address(0), "Approve to zero address");
        
        _allowances[msg.sender][spender] = amount;
        
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    /**
     * @dev Transfer from
     * @param from Sender address
     * @param to Recipient address
     * @param amount Amount to transfer
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool) {
        require(from != address(0), "Transfer from zero address");
        require(to != address(0), "Transfer to zero address");
        require(_balances[from] >= amount, "Insufficient balance");
        require(_allowances[from][msg.sender] >= amount, "Insufficient allowance");
        
        _balances[from] -= amount;
        _balances[to] += amount;
        _allowances[from][msg.sender] -= amount;
        
        emit Transfer(from, to, amount);
        return true;
    }
    
    /**
     * @dev Mint new tokens (only owner)
     * @param to Recipient address
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Mint to zero address");
        
        _totalSupply += amount;
        _balances[to] += amount;
        
        emit Mint(to, amount);
        emit Transfer(address(0), to, amount);
    }
}
