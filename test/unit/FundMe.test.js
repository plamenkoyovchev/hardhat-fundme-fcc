const { deployments, getNamedAccounts, ethers } = require("hardhat");
const { assert, expect } = require("chai");

describe("FundMe", async function () {
	let fundMeContract;
	let deployer;
	let mockV3Aggregator;
	const sendValue = ethers.utils.parseEther("1"); // 1 ETH = "1000000000000000000";

	beforeEach(async () => {
		// deploy fund me contract with hardhat deploy

		// const accounts = await ethers.getSigners();
		// const accountZero = accounts[0];
		deployer = (await getNamedAccounts()).deployer; // deployer address

		// this will execute all deploy scripts with the provided tag
		await deployments.fixture(["all"]);

		fundMeContract = await ethers.getContract("FundMe", deployer);
		mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
	});

	describe("constructor", async function () {
		it("Sets price feed aggregator addresses correctly", async function () {
			const priceFeedAddress = await fundMeContract.getPriceFeed();
			assert.equal(priceFeedAddress, mockV3Aggregator.address);
		});

		it("Sets contract owner correctly", async function () {
			const owner = await fundMeContract.getOwner();
			assert.equal(owner, deployer);
		});
	});

	describe("fund", async function () {
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
});
