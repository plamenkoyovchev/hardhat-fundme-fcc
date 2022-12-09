const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
	const { deployer } = await getNamedAccounts();
	const fundMeContract = await ethers.getContract("FundMe", deployer);

	console.log("Withdrawing...");

	const transactionResponse = await fundMeContract.withdraw();
	await transactionResponse.wait(1);

	console.log("Withdraw completed...");
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
