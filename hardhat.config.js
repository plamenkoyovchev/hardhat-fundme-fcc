require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */

const GOERLI_RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.RPC_PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;

module.exports = {
	defaultNetwork: "hardhat",
	solidity: {
		compilers: [{ version: "0.8.7" }, { version: "0.6.6" }],
	},
	networks: {
		hardhat: {},
		localhost: {
			url: "http://127.0.0.1:8545",
			chainId: 31337,
		},
		ganache: {
			url: "http://127.0.0.1:7545",
			chainId: 1337,
		},
		goerli: {
			url: GOERLI_RPC_URL,
			accounts: [PRIVATE_KEY],
			chainId: 5,
			blockConfirmations: 6,
		},
	},
	namedAccounts: {
		deployer: {
			default: 0, // zero-th account will be this when calling await getNamedAccounts() func.
		},
	},
	etherscan: {
		apiKey: ETHERSCAN_API_KEY,
	},
	gasReporter: {
		enabled: true,
		outputFile: "gas-report.txt",
		noColors: true,
		currency: "USD",
		coinmarketcap: COINMARKETCAP_API_KEY,
		// token: "MATIC" if we want to deploy to different network
	},
};
