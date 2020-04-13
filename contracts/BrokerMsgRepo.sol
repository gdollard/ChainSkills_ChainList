/*
* This smart contract will take the passed broker message and will perist it in a distributed data store.
* The hash of the transaction is written to this contract for futre requests 
*/
pragma solidity >0.4.99 <0.6.0;

contract BrokerMessageRepo {

    address public owner = msg.sender;
    // A topic can have multiple messages
    uint topicCounter;
    Topic[] topics;

    // Custom types Messages
    struct Topic { 
      mapping(uint => Message) messages;
      uint messageCount;
      string topic;
    }

    struct Message {
        uint id;
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

    function isEqualTo(string memory stringA, string memory stringB ) public pure returns(bool) {
        return (keccak256(abi.encode(stringA)) == keccak256(abi.encode(stringB)));
    }

    // function addTopic(string memory _topic) public {
    //     topics.push(Topic({messageCount: 0, topic: _topic}));
    // }

    function addMessage(string memory _topic, string memory _message, string memory _broker) public {
        // Check if the topic exists already
        // Topic memory foundTopic = Topic({messageCount: 0, topic: _topic});
        
        bool found = false;
        for(uint i = 0; i < topics.length; i++) {
            if(isEqualTo(topics[i].topic, _topic)) {
                topics[i].messages[topics[i].messageCount] = Message(topics[i].messageCount, _message, _broker, msg.sender);
                topics[i].messageCount++;
                break;
            }
        }
        if(!found) {
            topicCounter++;
            //mapping(uint => Message) storage myMessages;
            //myMessages[0] = _message;
            Topic memory newTopic = Topic({messageCount: 0, topic: _topic});
            topics[topicCounter] = newTopic;
            topics[topicCounter].messages[0] = Message(0, _message, _broker, msg.sender);
        }

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
    function getNumberOfMessagesFromTopic(string memory _topic) public view returns (uint) {
        for(uint i = 0; i < topics.length; i++) {
            if(isEqualTo(topics[i].topic, _topic)) {
                return topics[i].messageCount-1;
            }
        }
        return 0;
    }

}