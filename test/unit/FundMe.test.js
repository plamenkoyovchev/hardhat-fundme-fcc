const { deployments, getNamedAccounts, ethers, network } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
	? describe.skip
	: describe("FundMe", function () {
		let fundMeContract;
		let deployer;
		let mockV3Aggregator;
		const sendValue = ethers.utils.parseEther("1"); // 1 ETH = "1000000000000000000";

		beforeEach(async () => {
			// deploy fund me contract with hardhat deploy

			// const accounts = await ethers.getSigners();
			// const accountZero = accounts[0];
			deployer = (await getNamedAccounts()).deployer; // deployer account

			// this will execute all deploy scripts with the provided tag
			await deployments.fixture(["all"]);

			fundMeContract = await ethers.getContract("FundMe", deployer);
			mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
		});

		describe("constructor", function () {
			it("Sets price feed aggregator addresses correctly", async function () {
				const priceFeedAddress = await fundMeContract.getPriceFeed();
				assert.equal(priceFeedAddress, mockV3Aggregator.address);
			});

			it("Sets contract owner correctly", async function () {
				const owner = await fundMeContract.getOwner();
				assert.equal(owner, deployer);
			});
		});

		describe("fund", function () {
			it("Fails if you don't send enough ETH", async function () {
				await expect(fundMeContract.fund()).to.be.revertedWithCustomError(
					fundMeContract,
					"FundMe__NotEnoughETH"
				);

				await expect(
					fundMeContract.fund({ value: 300 })
				).to.be.revertedWithCustomError(fundMeContract, "FundMe__NotEnoughETH");
			});

			it("Should update funded data structure correcly", async function () {
				await fundMeContract.fund({ value: sendValue });
				const storedFundValue = await fundMeContract.getAddressToAmountFunded(
					deployer
				);
				assert.equal(storedFundValue.toString(), sendValue.toString());
			});

			it("Should add funder to funders array", async function () {
				await fundMeContract.fund({ value: sendValue });
				const funderAddress = await fundMeContract.getFunder(0);
				assert.equal(funderAddress, deployer);
			});
		});

		describe("withdraw", function () {
			beforeEach(async () => { 
				await fundMeContract.fund({ value: sendValue });
			});

			it("Should withdraw from single account correctly", async function () {
				// Arrange
				const fundMeContractBalanceBeforeWithdraw = await fundMeContract.provider.getBalance(fundMeContract.address);
				const deployerBalanceBeforeWithdraw = await fundMeContract.provider.getBalance(deployer);

				// Act
				const transactionResponse = await fundMeContract.withdraw();
				const transactionReceipt = await transactionResponse.wait(1);

				const { effectiveGasPrice, gasUsed } = transactionReceipt;
				// BigNumber similar to effectiveGasPrice * gasUsed 
				const gasCost = effectiveGasPrice.mul(gasUsed);

				const fundMeContractBalanceAfterWithdraw = await fundMeContract.provider.getBalance(fundMeContract.address);
				const deployerBalanceAfterWithdraw = await fundMeContract.provider.getBalance(deployer);

				// Assert
				assert.equal(fundMeContractBalanceAfterWithdraw, 0);
				assert.equal(
					// BigNumber similar to deployerBalanceBeforeWithdraw + fundMeBalanceBeforeWithdraw 
					deployerBalanceBeforeWithdraw.add(fundMeContractBalanceBeforeWithdraw).toString(),
					deployerBalanceAfterWithdraw.add(gasCost).toString()
				);

				// or alternative assert by subtracting the gas cost
				assert.equal(
					// BigNumber similar to (deployerBalanceBeforeWithdraw + fundMeBalanceBeforeWithdraw) - gasCost
					(deployerBalanceBeforeWithdraw.add(fundMeContractBalanceBeforeWithdraw)).sub(gasCost).toString(),
					deployerBalanceAfterWithdraw.toString()
				);

				// There shouldn't be any funders in s_funders array.
				await expect(fundMeContract.getFunder(0)).to.be.reverted;
			});

			it("Should withdraw from multiple accounts correctly", async function () {
				// Arrange
				// connect 7 accounts and fund the contract for each account
				const accounts = await ethers.getSigners();
				for (let i = 1; i <= 7; i++) {
					const accountConnectedContract = await fundMeContract.connect(accounts[i]);
					await accountConnectedContract.fund({ value: sendValue });
				}

				// Act
				const fundMeContractBalanceBeforeWithdraw = await fundMeContract.provider.getBalance(fundMeContract.address);
				const deployerBalanceBeforeWithdraw = await fundMeContract.provider.getBalance(deployer);

				const transactionResponse = await fundMeContract.withdraw();
				const transactionReceipt = await transactionResponse.wait(1);

				const { effectiveGasPrice, gasUsed } = transactionReceipt;
				const gasCost = effectiveGasPrice.mul(gasUsed);

				const fundMeContractBalanceAfterWithdraw = await fundMeContract.provider.getBalance(fundMeContract.address);
				const deployerBalanceAfterWithdraw = await fundMeContract.provider.getBalance(deployer);

				// Assert
				assert.equal(fundMeContractBalanceAfterWithdraw, 0);
				assert.equal(
					(deployerBalanceBeforeWithdraw.add(fundMeContractBalanceBeforeWithdraw)).sub(gasCost).toString(),
					deployerBalanceAfterWithdraw.toString()
				);

				// There shouldn't be any funders after withdraw
				await expect(fundMeContract.getFunder(0)).to.be.reverted;

				for (let i = 1; i <= 7; i++) {
					const { address: accountAddress } = accounts[i];
					assert.equal(
						await fundMeContract.getAddressToAmountFunded(accountAddress),
						0
					);
				}
			});

			it("Should revert with FundMe__NotOwner if other account connects to the contract and tries to withdraw the funds", async function () {
				// get account different from the deployer
				const attackerAccount = (await ethers.getSigners())[1];

				// connect anotherAccount to fundMeContract and try to withdraw
				const attackerConnectedToFundMeContract = await fundMeContract.connect(attackerAccount);
				await expect(attackerConnectedToFundMeContract.withdraw())
					.to.be.revertedWithCustomError(fundMeContract, "FundMe__NotOwner");
			});
		});
	});
