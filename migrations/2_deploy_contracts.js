var ChainList = artifacts.require("./ChainList.sol");
var Inbox = artifacts.require("./Inbox.sol");
var TrustAnchor = artifacts.require("./TrustAnchor.sol");
module.exports = function(deployer) {
  deployer.deploy(ChainList);
  deployer.deploy(Inbox);
  deployer.deploy(TrustAnchor);
};


