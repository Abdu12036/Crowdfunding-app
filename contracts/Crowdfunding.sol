// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./RewardToken.sol";

/**
 * @title Crowdfunding
 * @dev Decentralized crowdfunding platform with reward token distribution
 */
contract Crowdfunding {
    
    // Reward token contract instance
    RewardToken public rewardToken;
    
    // Campaign structure
    struct Campaign {
        address payable creator;
        string title;
        uint256 fundingGoal;
        uint256 deadline;
        uint256 amountRaised;
        bool finalized;
        bool exists;
    }
    
    // Mapping from campaign ID to Campaign
    mapping(uint256 => Campaign) public campaigns;
    
    // Mapping from campaign ID to contributor to contribution amount
    mapping(uint256 => mapping(address => uint256)) public contributions;
    
    // Campaign counter
    uint256 public campaignCounter;
    
    // Events
    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed creator,
        string title,
        uint256 fundingGoal,
        uint256 deadline
    );
    
    event ContributionReceived(
        uint256 indexed campaignId,
        address indexed contributor,
        uint256 amount
    );
    
    event TokensIssued(
        uint256 indexed campaignId,
        address indexed contributor,
        uint256 tokenAmount
    );
    
    event CampaignFinalized(
        uint256 indexed campaignId,
        uint256 totalRaised,
        bool goalReached
    );
    
    /**
     * @dev Constructor - deploys the reward token
     */
    constructor() {
        rewardToken = new RewardToken();
        campaignCounter = 0;
    }
    
    /**
     * @dev Create a new crowdfunding campaign
     * @param _title Campaign title
     * @param _fundingGoal Funding goal in wei
     * @param _durationInDays Campaign duration in days
     */
    function createCampaign(
        string memory _title,
        uint256 _fundingGoal,
        uint256 _durationInDays
    ) external returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_fundingGoal > 0, "Funding goal must be greater than 0");
        require(_durationInDays > 0, "Duration must be greater than 0");
        
        uint256 campaignId = campaignCounter;
        uint256 deadline = block.timestamp + (_durationInDays * 1 days);
        
        campaigns[campaignId] = Campaign({
            creator: payable(msg.sender),
            title: _title,
            fundingGoal: _fundingGoal,
            deadline: deadline,
            amountRaised: 0,
            finalized: false,
            exists: true
        });
        
        campaignCounter++;
        
        emit CampaignCreated(
            campaignId,
            msg.sender,
            _title,
            _fundingGoal,
            deadline
        );
        
        return campaignId;
    }
    
    /**
     * @dev Contribute to a campaign
     * @param _campaignId Campaign ID to contribute to
     */
    function contribute(uint256 _campaignId) external payable {
        Campaign storage campaign = campaigns[_campaignId];
        
        require(campaign.exists, "Campaign does not exist");
        require(block.timestamp < campaign.deadline, "Campaign has ended");
        require(!campaign.finalized, "Campaign already finalized");
        require(msg.value > 0, "Contribution must be greater than 0");
        
        // Update contribution tracking
        contributions[_campaignId][msg.sender] += msg.value;
        campaign.amountRaised += msg.value;
        
        // Calculate reward tokens:
        // Reward rate: 1 CRT per 0.001 ETH contributed (i.e., 1000 CRT per 1 ETH).
        // CRT uses 18 decimals, so mint amounts in the token's smallest units.
        // tokenAmount (in token's smallest unit) = msg.value (wei) * 1000
        uint256 tokenAmount = msg.value * 1000;
        
        // Mint reward tokens to contributor (amount is already scaled by 1e18)
        rewardToken.mint(msg.sender, tokenAmount);
        
        emit ContributionReceived(_campaignId, msg.sender, msg.value);
        emit TokensIssued(_campaignId, msg.sender, tokenAmount);
    }
    
    /**
     * @dev Finalize a campaign after deadline
     * @param _campaignId Campaign ID to finalize
     */
    function finalizeCampaign(uint256 _campaignId) external {
        Campaign storage campaign = campaigns[_campaignId];
        
        require(campaign.exists, "Campaign does not exist");
        require(block.timestamp >= campaign.deadline, "Campaign still active");
        require(!campaign.finalized, "Campaign already finalized");
        
        campaign.finalized = true;
        bool goalReached = campaign.amountRaised >= campaign.fundingGoal;
        
        // Transfer funds to creator if any amount raised
        if (campaign.amountRaised > 0) {
            campaign.creator.transfer(campaign.amountRaised);
        }
        
        emit CampaignFinalized(_campaignId, campaign.amountRaised, goalReached);
    }
    
    /**
     * @dev Get campaign details
     * @param _campaignId Campaign ID
     */
    function getCampaign(uint256 _campaignId) external view returns (
        address creator,
        string memory title,
        uint256 fundingGoal,
        uint256 deadline,
        uint256 amountRaised,
        bool finalized,
        bool goalReached,
        bool isActive
    ) {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.exists, "Campaign does not exist");
        
        return (
            campaign.creator,
            campaign.title,
            campaign.fundingGoal,
            campaign.deadline,
            campaign.amountRaised,
            campaign.finalized,
            campaign.amountRaised >= campaign.fundingGoal,
            block.timestamp < campaign.deadline && !campaign.finalized
        );
    }
    
    /**
     * @dev Get contribution amount for a specific contributor
     * @param _campaignId Campaign ID
     * @param _contributor Contributor address
     */
    function getContribution(uint256 _campaignId, address _contributor) 
        external 
        view 
        returns (uint256) 
    {
        return contributions[_campaignId][_contributor];
    }
    
    /**
     * @dev Get total number of campaigns
     */
    function getTotalCampaigns() external view returns (uint256) {
        return campaignCounter;
    }
    
    /**
     * @dev Get reward token address
     */
    function getRewardTokenAddress() external view returns (address) {
        return address(rewardToken);
    }
}
