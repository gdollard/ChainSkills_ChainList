/*
* This smart contract will take the passed broker message and will perist it in a distributed data store.
*/
pragma solidity >0.4.99 <0.6.0;
pragma experimental ABIEncoderV2;

contract BrokerMessageRepo {

    address public owner = msg.sender;

    // brokerID -> IPFS hash
    mapping(string => string[]) public messages;
    uint hashCounter;

    // Custom types Messages
    struct Message {
        uint id;
        string topic;
        string message;
        string broker_name;
        address submitter;
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

    function addMessageChunkReference(string memory _brokerID, string memory _ipfsHash) public returns(uint) {
        // https://ethereum.stackexchange.com/questions/12097/creating-dynamic-arrays
        hashCounter++;
        messages[_brokerID].push(_ipfsHash);
        
        //emit MessageLogged(_ipfsHash, _brokerID, msg.sender);
    }

    // Get the IPFS hashes stored for a given broker ID
    function getHashes(string memory _brokerID) public view returns (string[] memory) {
        return messages[_brokerID];
    }


    /**
     * Get num of messages for a given topic.
     */
    function getTotalNumberOfMessages() public view returns (uint) {
        return hashCounter;
    }

}