var TrustAnchor = artifacts.require("./TrustAnchor.sol");
module.exports = function(deployer) {
  deployer.deploy(TrustAnchor);
};


