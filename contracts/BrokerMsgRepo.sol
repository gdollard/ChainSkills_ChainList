/*
* This smart contract will take the passed broker message and will perist it in a distributed data store.
*/
pragma solidity >0.4.99 <0.6.0;
pragma experimental ABIEncoderV2;

contract BrokerMessageRepo {

    address public owner = msg.sender;

    // brokerID -> IPFS hash
    mapping(string => Message[]) public messages;

    // Custom types Messages
    struct Message {
        string timestamp;
        string hashVal;
    }
    
    event MessageLogged (
        string ipfsHash,
        string brokerID,
        address indexed sourceAccount
     );

     event DebugEvent (
         string message
     );

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "This function can only be called by the contract owner");
        _;
    }

    function isEqualTo(string memory stringA, string memory stringB ) public pure returns(bool) {
        return (keccak256(abi.encode(stringA)) == keccak256(abi.encode(stringB)));
    }


    /**
     * Adds a new message struct to the list for the given broker ID.
     */
    function addMessageChunkReference(string memory _brokerID, string memory _timestamp, string memory _ipfsHash) public onlyOwner returns(uint) {
        messages[_brokerID].push(Message(_timestamp, _ipfsHash));
        
        //emit MessageLogged(_ipfsHash, _brokerID, msg.sender);
    }

    // Get all Message structs for given broker ID
    function getHashes(string memory _brokerID) public view returns (Message[] memory) {
        return messages[_brokerID];
    }


    /**
     * Get num of messages for a given topic.
     */
    function getTotalNumberOfMessagesForBroker(string memory _brokerID) public view returns (uint) {
        return messages[_brokerID].length;
    }

}