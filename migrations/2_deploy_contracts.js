var TrustAnchor = artifacts.require("./TrustAnchor.sol");
var BrokerMsgRepo = artifacts.require("./BrokerMessageRepo.sol");

module.exports = function(deployer) {
  deployer.deploy(BrokerMsgRepo);
  deployer.deploy(TrustAnchor);
};


