pragma solidity >0.4.99 <0.6.0;

/**
* Chain representation of the claims issued by a typical trust anchor.
* G. Dollard
*/
contract TrustAnchor {

    mapping(uint => Claim) public claims;
    uint claimCounter;

    // Custom types for the claim
    struct Claim {
        uint id;
        string ethereum_address;
        string claim_name;
        string token_string;
        uint256 expiry;
        address payable seller;
    }

     event ClaimIssued (
        string ethereum_address,
        string claim_name,
        string token_string,
        uint256 expiry
     );

    function addClaim(string memory claimName, string memory ethereum_address, string memory token, uint256 expiry) public {
        claimCounter++;

        // store this article
        claims[claimCounter] = Claim(
            claimCounter,
            ethereum_address,
            claimName,
            token,
            expiry,
            msg.sender
        );

        // Trigger even for any listeners
        emit ClaimIssued(ethereum_address, claimName, token, expiry);
    }

    function getNumberOfClaimsIssued() public view returns (uint) {
        return claimCounter;
    }

}