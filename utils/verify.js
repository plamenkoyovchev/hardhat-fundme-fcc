const { run } = require("hardhat");

// verify contract in etherscan
const verify = async (contractAddress, args) => {
	console.log("Verifying contract ...");
	try {
		await run("verify:verify", {
			address: contractAddress,
			constructorArguments: args,
		});
	} catch (error) {
		console.log(error);
	}
};

module.exports = { verify };
