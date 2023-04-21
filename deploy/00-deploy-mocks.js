const { networkConfig, DECIMAL, INITIAL_ANSWER } = require("../helper-hardhat-config");
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    if (chainId == 31337) {
        await deploy("MockV3Aggregator", {
            from: deployer,
            log: true,
            args: [DECIMAL, INITIAL_ANSWER]
        })
        console.log("Mocks deployed");
        console.log("---------------------------------------")
    }
};
module.exports.tags = ['all', 'mocks'];