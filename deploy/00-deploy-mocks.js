const { network } = require("hardhat");
const {
	developmentChains,
	DECIMALS,
	INITIAL_ANSWER,
} = require("../helper-hardhat-config");

module.exports = async (hre) => {
	const { getNamedAccounts, deployments } = hre;
	const { deploy, log } = deployments;
	const { deployer } = await getNamedAccounts();

	if (developmentChains.includes(network.name)) {
		log("Local network detected! Deploying mocks...");
		await deploy("MockV3Aggregator", {
			contract: "MockV3Aggregator",
			from: deployer,
			log: true,
			args: [DECIMALS, INITIAL_ANSWER], // pass args to MockV3Aggregator constructor
		});
		log("Mocks deployed!");
		log("--------------------------");
	}
};

// npx hardhat deploy --tags mocks

module.exports.tags = ["all", "mocks"];
