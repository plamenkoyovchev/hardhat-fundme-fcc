const { network, getNamedAccounts, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { assert } = require("chai");

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", () => {
        let deployer;
        let fundMeContract;

        beforeEach(async function () {
            deployer = (await getNamedAccounts()).deployer;
            fundMeContract = await ethers.getContract("FundMe", deployer);
        });

        it("withdraw funded amount", async function () {
            const fundTxResponse = await fundMeContract.fund({ value: ethers.utils.parseEther("0.05") });
            await fundTxResponse.wait(1);

            const withdrawTxResponse = await fundMeContract.withdraw();
            await withdrawTxResponse.wait(1);

            const endingFundMeBalance = await fundMeContract.provider.getBalance(
                fundMeContract.address
            );
            
            assert.equal(endingFundMeBalance.toString(), "0");
        })
    });