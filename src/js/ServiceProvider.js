// This is the hypothetical Service Provider. It will receive a request for a service and via a Token verification
// will determine if the request is to be granted.

require('dotenv').config();
const HDWalletProvider = require("truffle-hdwallet-provider");
var walletProvider =  new HDWalletProvider(process.env.MNEMONIC, "https://ropsten.infura.io/v3/" + process.env.INFURA_API_KEY);
const Web3 = require('web3');
var ganacheProvider = new Web3.providers.HttpProvider("http://localhost:7545");
//var web3 = new Web3(ganacheProvider);

//need to use the Ropsten provider because the resolver depends on it
var web3 = new Web3(walletProvider); 
const didJWT = require('did-jwt');
const Resolver = require('did-resolver').Resolver;
const getResolver = require('ethr-did-resolver').getResolver;
const IPFS = require('ipfs');
const all = require('it-all');


const messageBroadcasterArtifact = require('../../build/contracts/BrokerMessageRepo.json');
//const messageBroadcasterContractAddress = '0xD773c6028307E882Ec0c8a72D198B4C337345100';
var truffleContract = require("@truffle/contract");
let messageBroadcasterContract = truffleContract(messageBroadcasterArtifact);
//messageBroadcasterContract.setProvider(HDwalletProvider);
messageBroadcasterContract.setProvider(ganacheProvider);

//Ethereum DID Registery address (smart contract)
const ETHEREUM_DID_REGISTRY_ADDRESS = '0xdCa7EF03e98e0DC2B855bE647C39ABe984fcF21B'

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
const authoriseDataAccessClaim = async (jwt, didObject) => {

    // In addition to the verifyJWT call this provider should make a call to the did-registry.validDelegate(..)
    // to ensure if the delegate is indeed a valid delegate. Use sigAuth as delegate type.

    let result = didJWT.verifyJWT(jwt, {resolver: didResolver, audience: didObject.did }).then((verifiedResponse) => {
        //console.log("Service Provider: Alice's verified JWT ", verifiedResponse);
        let iotData = getIoTData();
        return iotData;
        }).catch(error => {
            console.log("Sorry Alice, Service Provider says No! ", error.message);
        });
    return result;
 };

 /**
  * 
  * While basically a copy of the other auth claim function the idea is this function could be
  * implemented by a different Service Provider on the network.
  */
 const authoriseDataPublishClaim = async (jwt, didObject, messages, brokerID) => {

    // In addition to the verifyJWT call this provider should make a call to the did-registry.validDelegate(..)
    // to ensure if the delegate is indeed a valid delegate. Use sigAuth as delegate type.
    let result = didJWT.verifyJWT(jwt, {resolver: didResolver, audience: didObject.did }).then((verifiedResponse) => {
        //console.log("Service Provider: IoT Publisher verified JWT ", verifiedResponse);
        let cid = submitToStorage(messages, brokerID);
        return cid;// verifiedResponse;
        }).catch(error => {
            console.log("Sorry IoT Publisher, Service Provider says No! ", error);
        });
    return result;
 };



 /**
 * Queries the IPFS endpoint with the CID for the content.
 * example: https://ipfs.io/ipfs/Qmb74tGyo7m94jwWb3aMqEr5Jpn7U5r6fBVR5fJ7QvqMnz
 * 
 * Pending hash: QmbFMke1KXqnYyBBWxB74N4c5SBnJMVAiMNRcGu6x1AwQH
 */
 const getIoTData = async() => {
    const node = await IPFS.create();
    const data = Buffer.concat(await all(node.cat("Qmb74tGyo7m94jwWb3aMqEr5Jpn7U5r6fBVR5fJ7QvqMnz")));
    node.stop();
    return data.toString();
  };

  /**
  * Is responsible for taking the chunk of IOT data, encrypt it and invoke the smart contract to persist the data onto an IPFS node. 
  * It will then ensure the transaction is recorded in the ledger for future requests.
  * 
  * This will be called by the MQTT nodes to publish their data to the ledger.
  * 
  * Publish the received messages to an IPFS data store.
  * @See https://github.com/ipfs/interface-js-ipfs-core/blob/master/SPEC/FILES.md#cat
  */
const submitToStorage = async (messages, brokerID) => {
    let mainString = messages.join(' ');
    const node = await IPFS.create();
    let cid;
    for await (const file of node.add(mainString)) 
    {      
        console.log(">> CID >>>", JSON.stringify(file));
        let timeStmp = new Date().getTime().toString();
        cid = file.cid.toString();
        broadcastToLedger(brokerID, timeStmp, file.cid.toString());
    }
    
    // I'm calling stop here for this reason: https://discuss.ipfs.io/t/how-to-reset-the-lock-file-programmatically-in-ipfs-0-41-1/7363/2
    // Perhaps there's a better way to do this.
    node.stop();

    return cid;
  };


  /**
 * Calls the smart contract to broadcast the message to the ledger once this client receives
 * a message from the local broker. The timestamp and hashValue are written to the ledger
 * mapped by the brokerID
 * 
 */
const broadcastToLedger = async(brokerID, timestamp, hashValue ) => {
    //const ropsten_0_address = process.env.ROPSTEN_ACCOUNT_0_ADDRESS;
    const accountNumber = process.env.GANACHE_ADDRESS_ACCOUNT_0;
    let contractInstance = await messageBroadcasterContract.deployed();
    console.log("****** Service Provider Recording CID for broker: %s ******", brokerID);
    let result = await contractInstance.addMessageChunkReference(brokerID, timestamp, hashValue, {from: accountNumber, gas: 500000} ).then
            (result => {
                return result;
        }).catch(function (err) {
    });
    
    return result;
};


 module.exports = {authoriseDataAccessClaim, authoriseDataPublishClaim};

 // testing
//  let previousData = getIoTData().then(response => {
//     console.log(response);
//  });
 