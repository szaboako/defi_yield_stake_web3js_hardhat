const { expect } = require("chai")
const chai = require("chai")
const { BigNumber } = require("ethers")
const skipIf = require('mocha-skip-if')
chai.use(require('chai-bn')(BigNumber))
const { deployments, getChainId } = require('hardhat')
const { networkConfig, developmentChains } = require('../../helper-hardhat-config')
const Web3 = require("web3")

skip.if(!developmentChains.includes(network.name)).
    describe("TokenFarm unit tests", async function(){
        let tokenFarm
        let dappToken
        let accounts
        let amountStaked = Web3.utils.toWei("1", "ether")

        beforeEach(async () => {
            await deployments.fixture(['all'])
            const TokenFarm = await deployments.get("TokenFarm")
            tokenFarm = await ethers.getContractAt("TokenFarm", TokenFarm.address)
            const DappToken = await deployments.get("DappToken")
            dappToken = await ethers.getContractAt("DappToken", DappToken.address)
            accounts = await hre.ethers.getSigners()
        })

        describe("testing that only the owner can set pricefeed adresses to tokens", async () => {
            it("should only change the pricfeed address if the owner sends the tx", async () => {
                const priceFeed = await deployments.get("EthUsdPriceFeed")
                const notOwner = accounts[1]
                
                tokenFarm.setPriceFeedContract(dappToken.address, priceFeed.address)
    
                expect(await tokenFarm.tokenPriceFeedMapping(dappToken.address) == priceFeed.address).to.be.true        

                await expect(
                    tokenFarm.connect(notOwner).setPriceFeedContract(dappToken.address, priceFeed.address)
                ).to.be.revertedWith('Ownable: caller is not the owner')
            })
        })

        describe("testing staking tokens", async () => {
            it("should test if the staked tokens appear in the TokenFarm", async () => {
                await dappToken.approve(tokenFarm.address, amountStaked)
                await tokenFarm.stakeTokens(amountStaked, dappToken.address)

                expect(
                    await tokenFarm.stakingBalance(dappToken.address, accounts[0].address) == amountStaked
                ).to.be.true

                expect(
                    await tokenFarm.uniqueTokensStaked(accounts[0].address) == 1
                ).to.be.true

                expect(
                    await tokenFarm.stakers(0) == accounts[0].address
                ).to.be.true
            })
        })

        describe("testing issuing tokens to stakers", async () => {
            it("should issue tokens based on their staked value", async () => {
                await dappToken.approve(tokenFarm.address, amountStaked)
                await tokenFarm.stakeTokens(amountStaked, dappToken.address)
                startingBalance = await dappToken.balanceOf(accounts[0].address)

                await tokenFarm.connect(accounts[0]).issueTokens()

                updatedBalance = await dappToken.balanceOf(accounts[0].address)
                expectedBalance = startingBalance.add(BigNumber.from("2000000000000000000000"))

                expect(
                    //we are staking 1 dapp_token that is like having 1 eth in this context
                    //so we should get 2000 dapp tokens in reward because 1 eth is 2000 usd here
                    updatedBalance.eq(expectedBalance)
                ).to.be.true
            })
        })
    })