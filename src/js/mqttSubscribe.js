/**
 * This is a simple JS client to subscribe to my local broker topics. It will then 
 * attempt to broadcast the message to the ledger via smart contract calls using
 * its DID and authorisation tokens.
 * 
 * Using MQTT.js https://github.com/mqttjs/MQTT.js as the client.
 */
var File = require("file-class");
var mqtt = require('mqtt');
const HDWalletProvider = require("truffle-hdwallet-provider");
require('dotenv').config();
const Web3 = require('web3');
var ganacheProvider = new Web3.providers.HttpProvider("http://localhost:7545");
var web3 = new Web3(ganacheProvider);

//const Web3 = require('web3');
//var HDwalletProvider =  new HDWalletProvider(process.env.MNEMONIC, "https://ropsten.infura.io/v3/" + process.env.INFURA_API_KEY);
//const web3 = new Web3(HDwalletProvider);
const EthrDID = require('ethr-did');
const messageBroadcasterArtifact = require('../../build/contracts/BrokerMessageRepo.json');
const messageBroadcasterContractAddress = '0xD773c6028307E882Ec0c8a72D198B4C337345100';
var truffleContract = require("@truffle/contract");
let messageBroadcasterContract = truffleContract(messageBroadcasterArtifact);
//messageBroadcasterContract.setProvider(HDwalletProvider);
messageBroadcasterContract.setProvider(ganacheProvider);

const BROKER_ID = "MosquittoBroker_CK_IE_0";
let messages = [];

const IPFS = require('ipfs');
const all = require('it-all');
const ipfsAPI = require('ipfs-api');

const mqtt_options = {
  username: process.env.MOSQUITTO_USERNAME,
  password: process.env.MOSQUITTO_PASSWORD
  
};

var client  = mqtt.connect('mqtt://localhost:1883', mqtt_options);

const keyPair = {
    address: process.env.EthrDID_ADDRESS_IOT_PI,
    privateKey: process.env.PRIVATE_KEY_IOT_PI
};


// Instantiate the DID for this device
const myDID = new EthrDID({
    ...keyPair,
    provider: web3,
    registry: process.env.ETHEREUM_DID_REGISTRY_ADDRESS
});


// Once we connect to the broker provide a sub function
client.on('connect', function () {
  client.subscribe('TestTopic', function (err) {
    if (!err) {
      console.log("Listening to broker messages..");
    }
  });
});

// specify a callback when a message is published
client.on('message', function (topic, message) {
    // message is Buffer
    console.log("Received a message: %s on topic %s, next up write this to the ledger if authorised.", message.toString(), topic);
    let messageSize = messages.push(message+ '\n');

    if(messageSize == process.env.MESSAGE_BUFFER_LIMIT) {
      console.log("Going to publish...");
      submitToStorage();
      
    }
    //client.end();
  });


/**
 * Calls the smart contract to broadcast the message to the ledger once this client receives
 * a message from the local broker.
 * Takes a message: string
 */
const broadcastToLedger = async(broker_id, timestamp, hashValue ) => {
    //const ropsten_0_address = process.env.ROPSTEN_ACCOUNT_0_ADDRESS;
    const accountNumber = process.env.GANACHE_ADDRESS_ACCOUNT_0;
    let contractInstance = await messageBroadcasterContract.deployed();

    
    let claimResult = await contractInstance.addMessageChunkReference(broker_id, timestamp, hashValue, {from: accountNumber, gas: 500000} ).then
            (result => {
                console.log("result from addMessageChunkReference: ", result);
                return result;
        }).catch(function (err) {
        console.log("Promise Rejected", err)});
    console.log("Returned value is: ", claimResult);
    return claimResult;
};




const getAllHashesForBroker = async (broker_id) => {
  const accountNumber = process.env.GANACHE_ADDRESS_ACCOUNT_0;
  let contractInstance = await messageBroadcasterContract.deployed();
  let claimResult = await contractInstance.getHashes(broker_id);
  console.log("Hashes Returned: ", claimResult);
};

const getTotalNumberOfMessagesForBroker = async (broker_id) => {
  const accountNumber = process.env.GANACHE_ADDRESS_ACCOUNT_0;
  let contractInstance = await messageBroadcasterContract.deployed();
  let claimResult = await contractInstance.getTotalNumberOfMessagesForBroker(broker_id);
  console.log("Hashes Returned: ", claimResult.toNumber());
};

const addMore = async (testFile) => {
  //let testBuffer = Buffer.from(testFile);
  let fileBuffer = new Uint8Array(testFile);
  const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})
  ipfs.files.add(fileBuffer, function (err, file) {
    if (err) {
      console.log(err);
    }
    console.log(file)
  })
};


/**
 * Publish the received messages to an IPFS data store.
 * @See https://github.com/ipfs/interface-js-ipfs-core/blob/master/SPEC/FILES.md#cat
 */
const submitToStorage = async () => {
  let mainString = messages.join(' ');
  const node = await IPFS.create();

  for await (const file of node.add(mainString)) 
  {
    // clear out previously stored messages
    
    console.log(">> CID >>>", JSON.stringify(file));
    let timeStmp = new Date().getTime().toString();
    console.log("Sending CID: ", file.cid.toString());
    broadcastToLedger(BROKER_ID, timeStmp, file.cid.toString());
  }

  // I'm calling stop here for this reason: https://discuss.ipfs.io/t/how-to-reset-the-lock-file-programmatically-in-ipfs-0-41-1/7363/2
  // Perhaps there's a better way to do this.
  node.stop();

  // reset previously stored messages
  messages = []; 
};

/**
 * Queries the IPFS endpoint with the CID for the content.
 * example: https://ipfs.io/ipfs/Qmb74tGyo7m94jwWb3aMqEr5Jpn7U5r6fBVR5fJ7QvqMnz
 */
const testGet = async() => {
  const node = await IPFS.create();
  const data = Buffer.concat(await all(node.cat("QmU32D32gYmnpppCcusqzd688svcMqV7RKev9JWUn6PQ92")));
  //let ary = data.toString().split(',');
  
  console.log('Added file contents: \n', data.toString());
};

const testSubmitStorage = () => {
  var msgs = [];
  msgs.push("One"+ "\n");
  msgs.push("Twasjdfklsd fsdfjsdjkfjksfj sdkf jksdfhsdjkfdh fo" + "\n");
  msgs.push("Somwethign else here" + "\n");
  msgs.push("........ END .............."+ "\n");
  
  let inString = msgs.toString();
  
  // remove the commas from the array storage
  let mainString = msgs.join(' ');
  submitToStorage(mainString);
};



// getTotalNumberOfMessagesForBroker(BROKER_ID);
// broadcastToLedger("newBroker3");
//getAllHashesForBroker(BROKER_ID);
// testSubmitStorage();
  // testGet();




