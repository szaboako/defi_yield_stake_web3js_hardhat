const Web3 = require("web3")
let {networkConfig} = require("../helper-hardhat-config.js")
//const { BigNumber } = require("../node_modules/bignumber.js");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
let KEPTBALANCE = Web3.utils.toWei("100", "ether")

module.exports = async({
  getNamedAccounts,
  deployments,
  getChainId
}) => {
  const { deploy, get, log} = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = await getChainId()
  let linkTokenAddress
  let wethTokenAddress
  let daiTokenAddress
  let dappPriceFeed
  let daiPriceFeed
  let ethPriceFeed

  if(chainId == 31337) {
    let linkToken = await get("LinkToken")
    linkTokenAddress = linkToken.address
    let wethToken = await get("MockWETH")
    wethTokenAddress = wethToken.address
    let daiToken = await get("MockDAI")
    daiTokenAddress = daiToken.address
    let dappUsd = await get("DaiUsdPriceFeed")
    dappPriceFeed = dappUsd.address
    daiPriceFeed = dappUsd.address
    let ethUsd = await get("EthUsdPriceFeed")
    ethPriceFeed = ethUsd.address
  } else {
    linkTokenAddress = networkConfig[chainId]["linkToken"]
    wethTokenAddress = networkConfig[chainId]["wethToken"]
    daiTokenAddress = networkConfig[chainId]["daiToken"]
    dappPriceFeed = networkConfig[chainId]["daiUsdPriceFeed"]
    daiPriceFeed = networkConfig[chainId]["daiUsdPriceFeed"]
    ethPriceFeed = networkConfig[chainId]["ethUsdPriceFeed"]
  }

  log("-----------------------------------------------")
  const DappToken = await deploy("DappToken", {
    from: deployer,
    log: true
  })
  log(`You have deployed your Token contract to ${DappToken.address}`)

  args = [DappToken.address]

  const TokenFarm = await deploy("TokenFarm", {
    from: deployer,
    args: args,
    log: true
  })
  log(`You have deployed your Token Farm contract to ${TokenFarm.address}`)
  
  const accounts = await hre.ethers.getSigners()
  const signer = accounts[0]

  const dappTokenContract = await ethers.getContractFactory("DappToken")
  const dappToken = new ethers.Contract(DappToken.address, dappTokenContract.interface, signer)

  const tokenFarmContract = await ethers.getContractFactory("TokenFarm")
  const tokenFarm = new ethers.Contract(TokenFarm.address, tokenFarmContract.interface, signer)

  const networkName = networkConfig[chainId]['name']
  log(`Verify Token with: \n npx hardhat verify --network ${networkName} ${DappToken.address}`)
  log(`Verify Token Farm with: \n npx hardhat verify --network ${networkName} ${TokenFarm.address}`)

  //let amount = dappToken.totalSupply() - KEPTBALANCE
  let amount = BigNumber.from(await dappToken.totalSupply()).sub(BigNumber.from(KEPTBALANCE))
  let transferFunds_tx = await dappToken.transfer(TokenFarm.address, amount, {gasLimit: 1000000})//.gasLimit(10000000000)
  await transferFunds_tx.wait(1)

  log("Transfered all the tokens.")

  async function addAllowedToken(tokenAddress, priceFeedAddress){
    let add_tx = await tokenFarm.addAllowedTokens(tokenAddress)//.gasLimit(100000000000)
    add_tx.wait(1)
    let set_tx = await tokenFarm.setPriceFeedContract(tokenAddress, priceFeedAddress)//.gasLimit(100000000000)
    set_tx.wait(1)
  }

  await addAllowedToken(DappToken.address, dappPriceFeed)
  await addAllowedToken(daiTokenAddress, daiPriceFeed)
  await addAllowedToken(wethTokenAddress, ethPriceFeed)
}
module.exports.tags = ['all', 'contracts']