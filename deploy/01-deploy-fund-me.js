const { networkConfig } = require("../helper-hardhat-config");
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    // const address = '0xA39434A63A52E749F02807ae27335515BA4b07F7';
    // const address = networkConfig[chainId]["ethUsdPriceFeed"];
    let ethUSDpriceFeedAddress;

    if (chainId == 31337) {
        const ethUSDAggregator = await deployments.get("MockV3Aggregator");
        ethUSDpriceFeedAddress = ethUSDAggregator.address
    } else {
        ethUSDpriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    }
    console.log(ethUSDpriceFeedAddress);

    await deploy('FundMe', {
        from: deployer,
        args: [ethUSDpriceFeedAddress],
        log: true,
    });
};
module.exports.tags = ['all', 'FundMe'];