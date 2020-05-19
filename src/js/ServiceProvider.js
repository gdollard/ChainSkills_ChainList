/**
 * This is the hypothetical Service Provider. It will handle requests for data storage
 * and retrieval. It will perform claim verification using the EtherDID Registry. 
 * 
 * G. Dollard
 */

require('dotenv').config();
const HDWalletProvider = require("truffle-hdwallet-provider");
var walletProvider =  new HDWalletProvider(process.env.MNEMONIC, "https://ropsten.infura.io/v3/" + process.env.INFURA_API_KEY);
const Web3 = require('web3');
var fs = require('fs');
var web3 = new Web3(walletProvider); 
const didJWT = require('did-jwt');
const Resolver = require('did-resolver').Resolver;
const getResolver = require('ethr-did-resolver').getResolver;
const IPFS = require('ipfs');
const all = require('it-all');
const EthrDID = require('ethr-did');
var ganacheProvider = new Web3.providers.HttpProvider("http://localhost:7545");



const messageBroadcasterArtifact = require('../../build/contracts/BrokerMessageRepo.json');
var truffleContract = require("@truffle/contract");
let messageBroadcasterContract = truffleContract(messageBroadcasterArtifact);
messageBroadcasterContract.setProvider(walletProvider);
//messageBroadcasterContract.setProvider(ganacheProvider);
const ETHEREUM_DID_REGISTRY_ADDRESS = '0xdCa7EF03e98e0DC2B855bE647C39ABe984fcF21B'

// sample broker
const BROKER_ID = "MosquittoBroker_CK_IE_0";

//Registering Ethr Did To Resolver
const ethrDidResolver = getResolver({
    web3,
    registry: ETHEREUM_DID_REGISTRY_ADDRESS,
})
/**
 * create a DID resolver based on the ethr DID resolver, if using a different DID Method (uPort, nacl, https etc)
 * I would pass that specific resolver to the Resolver object.
 */
const didResolver = new Resolver(ethrDidResolver);


/**
 * This function will be called by Alice to request a service. She will present her
 * her JWT (token) and DID object. The provider will verify the token using the did-jwt
 * library. Part of the checks will include using the ethr-did-resolver to resolve the 
 * presented DID object against the ethr-did-registry on the ledger. If all checks come 
 * good then the request is authorised.
 * 
 */
const authoriseDataAccessClaim = async (jwt, didObject, brokerID, timestamp) => {
    let result = didJWT.verifyJWT(jwt, {resolver: didResolver, audience: didObject.did }).then((verifiedResponse) => {
        // Get the hashes for the specified broker
        let data = getContentHashes(brokerID).then(messageObjects => {
            for(i = 0; i < messageObjects.length; i++) {
                if(messageObjects[i].timestamp == timestamp) {
                    const iotData = getIoTData(messageObjects[i].hashVal);
                    return iotData; 
                }
            }
            return null;
        }).catch(error => {
            console.log("Error retrieving data from ledger/IPFS node: ", error.message);
        });
        return data;
    });
    return result;
 };


 /**
  * This function returns a list of timestamps representing when files were published to
  * the IPFS node. A user would typically use the returned data to query specific files
  * using the timestamps.
  * 
  * @param {*} jwt 
  * @param {*} didObject 
  * @param {*} brokerID 
  */
 const getPublishedTimestamps = async (jwt, didObject, brokerID) => {
    let result = didJWT.verifyJWT(jwt, {resolver: didResolver, audience: didObject.did }).then((verifiedResponse) => {
        // Get the hashes for the specified broker
        let data = getContentHashes(brokerID).then(messageObjects => {
            let timestamps = [];
            //iterate thru the objects extracting the timestamp
            for(i = 0; i < messageObjects.length; i++) {
                timestamps.push(messageObjects[i].timestamp);
            }
            return timestamps;
            }).catch(error => {
                console.log("Error retrieving timestamps from ledger: ", error.message);
            });
        return data;
        });
    return result;
 };


 /**
  * While basically a copy of the other auth claim function the idea is this function could be
  * implemented by a different Service Provider on the network.
  */
 const authoriseDataPublishClaim = async (jwt, didObject, messages, brokerID) => {
    let result = didJWT.verifyJWT(jwt, {resolver: didResolver, audience: didObject.did }).then((error, verifiedResponse) => { 
            let result = submitToStorage(messages).then( cid => {
                console.log("SP: Broker data successfully written to IPFS Node, writing CID %s to the BrokerMsgRepo smart contract. ", cid);
                let timeStmp = new Date().getTime().toString();
                let broadcastResult = broadcastToLedger(brokerID, timeStmp, cid).then(result => {
                    console.log("SP: Message Data CID written to the ledger.");
                    return result;
                });
                return broadcastResult;
            });
            return result;
        })
    return result;
 };



 /**
 * Queries the public IPFS gateway with the CID for the content.
 * example: https://ipfs.io/ipfs/Qmb74tGyo7m94jwWb3aMqEr5Jpn7U5r6fBVR5fJ7QvqMnz
 */
 const getIoTData = async(cidHash) => {
    const node = await IPFS.create({silent: true});
    const data = Buffer.concat(await all(node.cat(cidHash)));
    node.stop();
    return data.toString();
  };

  
    /**
  * Is responsible for taking the chunk of IOT data and invoke the smart contract to persist the data onto an IPFS node. 
  * It will then ensure the transaction is recorded in the ledger for future requests.
  * 
  * 
  * Publish the received messages to an IPFS data store.
  * @See https://github.com/ipfs/interface-js-ipfs-core/blob/master/SPEC/FILES.md#cat
  * 
  * @param {string}[] messages from the message agent.
  */
const submitToStorage = async (messages) => {
    let mainString = messages.join(' ');
    const node = await IPFS.create({silent: true});
    let cid;
    for await (const file of node.add(mainString)) 
    {      
        //console.log(">> CID >>>", JSON.stringify(file));
        cid = file.cid.toString();
    }
    
    // stopping the node when finished
    // see: https://discuss.ipfs.io/t/how-to-reset-the-lock-file-programmatically-in-ipfs-0-41-1/7363/2
    node.stop();
    return cid;
  };

  /**
   * This function is responsible for taking the chunk of IOT data and invoke 
   * the smart contract to persist the data onto an IPFS node. 
   * 
   * @param {string} messageFile - full path to file to be published.
   */
  const submitMessageFileToStorage = async (messageFile) => {
    const node = await IPFS.create({silent: true})
    let fileBuffer = fs.readFileSync(messageFile);
    let cid;
    for await (const file of await node.add({
        path: 'messages.txt',
        content: fileBuffer
    }))
    {
        console.log('Added file, returned CID:', file.path, file.cid.toString());
        cid = file.cid.toString();
    }
    node.stop(); //release lock
    return cid;
  };


  /**
 * Calls the smart contract to broadcast the message to the ledger once this client receives
 * a message from the local broker. The timestamp and hashValue are written to the ledger
 * mapped by the brokerID
 * 
 */
const broadcastToLedger = async(brokerID, timestamp, hashValue ) => {
    const accountNumber = process.env.ROPSTEN_ACCOUNT_0_ADDRESS;//GANACHE_ADDRESS_ACCOUNT_0; //
    let contractInstance = await messageBroadcasterContract.deployed();
    let result = await contractInstance.addMessageChunkReference(brokerID, timestamp, hashValue, {from: accountNumber, gas: 500000} ).then
            (result => {
                return result;
        }).catch(function (err) {
    });    
    return result;
};

/**
 * This function queries the BrokerMessageRepo smart contract for the CIDs
 * attributed to the specified brokerID. Any futher processing on the returned
 * data should happen locally (off-chain).
 * 
 * @param {string} brokerID - ID of the broker who published the messages.
 */
const getContentHashes = async(brokerID) => {
    const accountNumber = process.env.ROPSTEN_ACCOUNT_0_ADDRESS; 
    let contractInstance = await messageBroadcasterContract.deployed();
    let result = await contractInstance.getHashes(brokerID, {from: accountNumber, gas: 500000} ).then
            (result => {
                return result;
        });
    return result;
};

/**
 * Get the total number of message objects recorded for the
 * specified brokerID.
 * 
 * @param {string} brokerID 
 */
const getTotalNumberOfMessagesForBroker = async (brokerID) => {
    let contractInstance = await messageBroadcasterContract.deployed();
    let claimResult = await contractInstance.getTotalNumberOfMessagesForBroker(brokerID);
    console.log("Messages: ", claimResult.toNumber());
};


 module.exports = {authoriseDataAccessClaim, authoriseDataPublishClaim, getPublishedTimestamps};


  
 