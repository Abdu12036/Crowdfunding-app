const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");
  
  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Get account balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");
  
  // Deploy the Crowdfunding contract (which also deploys RewardToken)
  console.log("\nDeploying Crowdfunding contract...");
  const Crowdfunding = await hre.ethers.getContractFactory("Crowdfunding");
  const crowdfunding = await Crowdfunding.deploy();
  
  await crowdfunding.waitForDeployment();
  const crowdfundingAddress = await crowdfunding.getAddress();
  
  console.log("✅ Crowdfunding contract deployed to:", crowdfundingAddress);
  
  // Get the RewardToken address
  const tokenAddress = await crowdfunding.getRewardTokenAddress();
  console.log("✅ RewardToken contract deployed to:", tokenAddress);
  
  // Display deployment summary
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("Network:", hre.network.name);
  console.log("Crowdfunding Contract:", crowdfundingAddress);
  console.log("RewardToken Contract:", tokenAddress);
  console.log("Deployer:", deployer.address);
  console.log("=".repeat(60));
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    crowdfundingAddress: crowdfundingAddress,
    rewardTokenAddress: tokenAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };
  
  const fs = require('fs');
  fs.writeFileSync(
    'deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n✅ Deployment info saved to deployment-info.json");
  console.log("\nNext steps:");
  console.log("1. Update CONTRACT_ADDRESS in frontend/js/contract-abi.js");
  console.log("2. Open frontend/index.html in a browser");
  console.log("3. Connect MetaMask to the same network");
  console.log("4. Start testing the application!");
  
  // Verify on Etherscan if on a public network
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\nWaiting for block confirmations...");
    await crowdfunding.deploymentTransaction().wait(5);
    
    console.log("\nVerifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: crowdfundingAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on Etherscan");
    } catch (error) {
      console.log("❌ Error verifying contract:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
