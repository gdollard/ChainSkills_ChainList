var ChainList = artifacts.require("./ChainList.sol");
//var DidRegistryContract = artifacts.require("./EthereumDIDRegistry.sol");
var Inbox = artifacts.require("./Inbox.sol");

module.exports = function(deployer) {
  deployer.deploy(ChainList);
  //deployer.deploy(DidRegistryContract);
  deployer.deploy(Inbox);
};


