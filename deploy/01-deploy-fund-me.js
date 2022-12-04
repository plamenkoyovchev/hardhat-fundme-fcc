const {
	networkConfig,
	developmentChains,
} = require("../helper-hardhat-config");
const { network } = require("hardhat");
const { verify } = require("../utils/verify");

// hre = hardhat runtime environment
module.exports = async (hre) => {
	const { getNamedAccounts, deployments } = hre;

	const { deploy, log } = deployments;

	// These will be the accounts under the namedAccounts key in hardhat.config.js
	const { deployer } = await getNamedAccounts();
	const chainId = network.config.chainId;

	let ethUsdPriceFeedAddress;
	if (developmentChains.includes(network.name)) {
		// MockV3Aggregator should be deployed with 00-deploy-mocks.js script
		const ethUsdAggregator = await deployments.get("MockV3Aggregator");
		ethUsdPriceFeedAddress = ethUsdAggregator.address;
	} else {
		ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
	}

	const fundMeContract = await deploy("FundMe", {
		from: deployer,
		args: [ethUsdPriceFeedAddress], // this args will be passed to the constructor of FundMe.sol contract
		log: true,
		waitConfirmations: network.config.blockConfirmations || 1,
	});

	if (
		!developmentChains.includes(network.name) &&
		process.env.ETHERSCAN_API_KEY
	) {
		await verify(fundMeContract.address, [ethUsdPriceFeedAddress]);
	}

	log("--------------------");
};

module.exports.tags = ["all", "fundme"];
