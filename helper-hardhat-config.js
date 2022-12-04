const networkConfig = {
	5: {
		name: "goerli",
		ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e", // https://docs.chain.link/data-feeds/price-feeds/addresses#Goerli%20Testnet
	},
	31337: {
		name: "localhost",
	},
};

const developmentChains = ["localhost", "hardhat"];
const DECIMALS = 8;
const INITIAL_ANSWER = 200000000000;

module.exports = {
	networkConfig,
	developmentChains,
	DECIMALS,
	INITIAL_ANSWER,
};
