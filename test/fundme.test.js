const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat")

describe("Fund me contract test", function () {
    let fundMe
    let mockV3Aggregator
    let deployer
    let anotherAccount
    const sendValue = ethers.utils.parseEther("1")
    beforeEach(async () => {
        [deployer, anotherAccount] = await ethers.getSigners()
        // deployer = accounts[0]
        // deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )
    })

    describe("testing constructor", async () => {
        it("constructor", async () => {
            const response = await fundMe.getPriceFeed();
            assert.equal(response, mockV3Aggregator.address);
        })
    })

    describe("fund", () => {
        it("should revert if the amount is less than than required amount", async () => {
            await expect(fundMe.connect(anotherAccount).fund()).to.revertedWith(
                "Please enter sufficient amount"
            )
        })

        it("should update the funder data structure", async () => {
            await fundMe.fund({ value: sendValue });
            const response = await fundMe.getAddressToAmountFunded(deployer.address);
            // console.log(response)
            assert.equal(response.toString(), sendValue.toString())
        })

        it("should insert the funder in the funder data structure", async () => {
            await fundMe.fund({ value: sendValue });
            const response = await fundMe.getFunder(0);
            assert.equal(response, deployer.address);
        })
    })

    describe("withdraw function", () => {
        beforeEach(async () => {
            await fundMe.fund({ value: sendValue });
        });

        it("should withdraw from the funders", async () => {
            // Arrange
            const startingFundMeBalance =
                await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance =
                await fundMe.provider.getBalance(deployer.address)

            // Act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait()
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            // console.log(transactionReceipt)

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance =
                await fundMe.provider.getBalance(deployer.address)

            // Assert
            // Maybe clean up to understand the testing
            assert.equal(endingFundMeBalance, 0)
            assert.equal(
                startingFundMeBalance
                    .add(startingDeployerBalance)
                    .toString(),
                endingDeployerBalance.add(gasCost).toString()
            )
        })
    })
})