/*
* This smart contract will take the passed broker message and will perist it in a distributed data store.
*/
pragma solidity >0.4.99 <0.6.0;

contract BrokerMessageRepo {

    address public owner = msg.sender;
    // A topic can have multiple messages
    mapping(uint => Message) public messages;
    uint messageCounter;

    // Custom types Messages
    struct Message {
        uint id;
        string topic;
        string message;
        string broker_name;
        address submitter;
    }
    
    event MessageLogged (
        string message,
        string brokerID,
        string topic,
        address indexed sourceAccount
     );

     event DebugEvent (
         string message
     );

    function isEqualTo(string memory stringA, string memory stringB ) public pure returns(bool) {
        return (keccak256(abi.encode(stringA)) == keccak256(abi.encode(stringB)));
    }

    function addMessage(string memory _topic, string memory _message, string memory _broker) public onlyOwner(owner) {
        messageCounter++;
        messages[messageCounter] = Message(messageCounter, _topic, _message, _broker, msg.sender);
        emit MessageLogged(_message, _broker, _topic, msg.sender);
    }

    // Modifiers
    modifier onlyOwner(address _owner) {
        require(msg.sender == owner, "This function can only be called by the contract owner");
        _;
    }

    /**
     * Get num of messages for a given topic.
     */
    function getTotalNumberOfMessages() public view returns (uint) {
        return messageCounter;
    }

}