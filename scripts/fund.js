const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
	const { deployer } = await getNamedAccounts();
	const fundMeContract = await ethers.getContract("FundMe", deployer);

	console.log("Funding ...");
	const transactionResponse = await fundMeContract.fund({
		value: ethers.utils.parseEther("0.1"),
	});
	await transactionResponse.wait(1);
	console.log("Funding completed...");
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
