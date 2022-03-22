module.exports = async ({
    getNamedAccounts,
    deployments,
    getChainId
}) => {
    const DECIMALS = '18'
    const INITIAL_PRICE = '2000000000000000000000'
    const {deploy, log} = deployments
    const {deployer} = await getNamedAccounts()
    const chainId = await getChainId()
    
    //If we are on a local development network, we need to deploy mocks!
    if(chainId == 31337){
        log("Local network detected! Deploying mocks...")
        const linkToken = await deploy('LinkToken', {
            from: deployer,
            log: true
        })
        /*const priceFeed = await deploy('MockV3Aggregator', {
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE]
        })*/
        const daiToken = await deploy('MockDAI', {
            from: deployer,
            log: true
        })
        const wethToken = await deploy('MockWETH', {
            from: deployer,
            log: true
        })
        const daiPriceFeed = await deploy('DaiUsdPriceFeed', {
            contract: 'MockV3Aggregator',
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE]
        })
        const ethPriceFeed = await deploy('EthUsdPriceFeed', {
            contract: 'MockV3Aggregator',
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE]
        })
        log("Mocks deployed!")
    }
}
module.exports.tags = ['all', 'mocks', 'main']