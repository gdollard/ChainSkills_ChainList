/*
* This smart contract will take the passed broker message and will perist it in a distributed data store.
* The hash of the transaction is written to this contract for futre requests 
*/
pragma solidity >0.4.99 <0.6.0;

contract BrokerMessageRepo {

    address public owner = msg.sender;
    // A topic can have multiple messages
    mapping(string => Message[]) public messages;
    uint topicCounter;

    // Custom types for the claim
    struct Message {
        uint id;
        string message;
        string broker_name;
        address submitter;
    }
    
    event MessageLogged (
        string message,
        string brokerID,
        address indexed sourceAccount
     );

    // Modifiers
    modifier onlyOwner(address _owner) {
        require(msg.sender == owner, "This function can only be called by the contract owner");
        _;
    }

    /**
     * Get num of messages for a given topic.
     */
    function getNumberOfMessagesFromTopic(string memory topic) public view returns (uint) {
        return messages[topic].length;
    }

    function logMessage(string memory topic, string memory messageValue, string memory broker_id ) public onlyOwner(owner) {
        // check if the topic already exists
        if(messages[topic].length > 0) {
            //get the message map for this topic and add the new message
            uint msgCount = messages[topic].length;
            Message memory newMessage = Message(
            msgCount,
            messageValue,
            broker_id,
            msg.sender);
            messages[topic].push(newMessage);
        } else {
            // add first first for a new topic
            Message[] memory newMessages;
            messages[topic] = newMessages;
            Message memory newMessage = Message(0, messageValue, broker_id, msg.sender);
            newMessages[0] = newMessage;
            //messages[topic] = newMessages; //https://stackoverflow.com/questions/49345903/copying-of-type-struct-memory-memory-to-storage-not-yet-supported/49350916
        }
        emit MessageLogged(messageValue, broker_id, msg.sender);
    }
}