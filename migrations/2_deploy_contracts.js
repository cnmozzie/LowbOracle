const LowbOracle = artifacts.require("LowbOracle");

module.exports = function(deployer) {
  const lowbAddress = '0x5aa1a18432aa60bad7f3057d71d3774f56cd34b8'; // bsc testnet
  //const lowbAddress = '0xaa159B8d4156C4feDC94Edc752A2eDa0D00768eE'; // oec testnet
  deployer.deploy(LowbOracle, lowbAddress);
};
