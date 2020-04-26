/**
 * This is a simple JS client to subscribe to my local broker topics. It will then 
 * attempt to broadcast the message to the ledger via smart contract calls using
 * its DID and authorisation tokens.
 * 
 * Using MQTT.js https://github.com/mqttjs/MQTT.js as the client.
 */
const requestDataPublishClaim = require('./TrustAnchor').requestDataPublishClaim;
const authDataPublish = require('./ServiceProvider').authoriseDataPublishClaim;
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
      console.log("Connected to broker...");
    }
  });
});

// specify a callback when a message is published
client.on('message', function (topic, message) {
    // message is Buffer
    console.log("Received a message: %s on topic %s, next up write this to the ledger if authorised.", message.toString(), topic);
    let messageSize = messages.push(message+ '\n');

    if(messageSize == process.env.MESSAGE_BUFFER_LIMIT) {
      publishData();
    }
    //client.end();
  });



// Keeping getters here for reference
const getAllHashesForBroker = async (broker_id) => {
  const accountNumber = process.env.GANACHE_ADDRESS_ACCOUNT_0;
  let contractInstance = await messageBroadcasterContract.deployed();
  let claimResult = await contractInstance.getHashes(broker_id);
  console.log("Hashes Returned: ", claimResult);
};

// Keeping getters here for reference
const getTotalNumberOfMessagesForBroker = async (broker_id) => {
  const accountNumber = process.env.GANACHE_ADDRESS_ACCOUNT_0;
  let contractInstance = await messageBroadcasterContract.deployed();
  let claimResult = await contractInstance.getTotalNumberOfMessagesForBroker(broker_id);
  console.log("Hashes Returned: ", claimResult.toNumber());
};



/**
 * This function publishes the latest set of messages to the IPFS data store.
 * It will then write the Content Identifier (CID) to our BrokerMsgRepo smart contract.
 */
const publishData = async () => {
  requestDataPublishClaim(myDID).then((result) => {
      if(result === null) {
          console.log("Something went wrong, no token issued.");
          process.exit(1);
      } else {
          console.log(">>>>> mqttSubscriber: Publishing messages to storage <<<<<<");
          authDataPublish(result, myDID, messages, BROKER_ID).then(auth => {
              console.log("Returned Storage Hash:", auth);
              messages = [];
          });
      }
  });
};


