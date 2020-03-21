pragma solidity >0.4.99 <0.6.0;

contract Inbox {
  string public message;

    constructor () public {
        message = "Init value";
    }

    function setMessage(string memory newMessage) public {
        message = newMessage;
    }

    function getMessage() public view returns (string memory) {
        return "Blaaa";
    }
}