const networkConfig ={
    31337: {
        name: 'localhost'
    },
    4: {
        name: 'rinkeby',
        wethToken: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
        daiToken: '0x95b58a6Bff3D14B7DB2f5cb5F0Ad413DC2940658',
        daiUsdPriceFeed: '0x2bA49Aaa16E6afD2a993473cfB70Fa8559B523cF',
        ethUsdPriceFeed: '0x8A753747A1Fa494EC906cE90E9f37563A8AF630e',
    },
    42: {
        name: 'kovan',
        wethToken: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
        daiToken: '0xFab46E002BbF0b4509813474841E0716E6730136',
        daiUsdPriceFeed: '0x777A68032a88E5A84678A77Af2CD65A7b3c0775a',
        ethUsdPriceFeed: '0x9326BFA02ADD2366b30bacB125260Af641031331',
        fee: '100000000000000000',
        fundAmount: "1000000000000000000"
    }
}

const developmentChains = ["hardhat", "localhost"]

const getNetworkIdFromName = async (networkIdName) => {
    for (const id in networkConfig) {
        if (networkConfig[id]['name'] == networkIdName) {
            return id
        }
    }
    return null
}

module.exports = {
    networkConfig,
    developmentChains,
    getNetworkIdFromName,
}