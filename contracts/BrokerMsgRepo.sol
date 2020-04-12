/*
* This smart contract will take the passed broker message and will perist it in a distributed data store.
* The hash of the transaction is written to this contract for futre requests 
*/
pragma solidity >0.4.99 <0.6.0;

contract BrokerMessageRepo {

    address public owner = msg.sender;
    // a map of massages, might be changed to hashes
    mapping(uint => Message) public messages;
    uint messageCounter;

    // Custom types for the claim
    struct Message {
        uint id;
        string message_value;
        string broker_id;
        address submitter;
    }

    event MessageLogged (
        string message,
        string brokerID,
        address indexed sourceAccount
     );

    // Modifiers
    modifier onlyOwner(address owner) {
        require(msg.sender == owner, "This function can only be called by the contract owner");
        _;
    }

    function logMessage(string memory messageValue, string memory broker_id ) public onlyOwner(owner) {
        //write to the ledger
         messageCounter++;

        // store this article
        messages[messageCounter] = Message(
            messageCounter,
            messageValue,
            broker_id,
            msg.sender
        );
        emit MessageLogged(messageValue, broker_id, msg.sender);
    }
}