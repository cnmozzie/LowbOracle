const LowbOracle = artifacts.require("LowbOracle");

module.exports = function(deployer) {
  //const lowbAddress = '0x5aa1a18432aa60bad7f3057d71d3774f56cd34b8'; // bsc testnet
  const lowbAddress = '0x5cD4d2f947ae4568A8bd0905dbF12D3454D197F3'; // matic testnet
  deployer.deploy(LowbOracle, lowbAddress);
};
