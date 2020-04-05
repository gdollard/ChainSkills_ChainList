pragma solidity >0.4.99 <0.6.0;

contract TrustAnchor {

    string public message;

    function setMessage(string memory newMessage) public {
        message = newMessage;
    }


     function getMessage() public view returns (string memory) {
        return "Hello from the Trust Anchor";
    }
}