/**
 * This is a simple JS client to subscribe to my local broker topics. It will then 
 * attempt to broadcast the message to the ledger via smart contract calls using
 * its DID and authorisation tokens.
 * 
 * Using MQTT.js https://github.com/mqttjs/MQTT.js as the client.
 */
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


const mqtt_options = {
  // keepalive: 10,
  // clientId: clientId,
  // protocolId: 'MQTT',
  // protocolVersion: 4,
  // clean: true,
  // reconnectPeriod: 1000,
  // connectTimeout: 30 * 1000,
  // will: {
  //   topic: 'WillMsg',
  //   payload: 'Connection Closed abnormally..!',
  //   qos: 0,
  //   retain: false
  // },
  username: process.env.MOSQUITTO_USERNAME,
  password: process.env.MOSQUITTO_PASSWORD
  //rejectUnauthorized: false
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
      console.log("Subscribed..");
    }
  });
});

// specify a callback when a message is published
client.on('message', function (topic, message) {
    // message is Buffer
    console.log("Received a message: %s on topic %s, next up write this to the ledger if authorised.", message.toString(), topic);
    
    broadcastToLedger(topic, message.toString(), "MosquittoBroker_CK_IE_0");
    client.end();
  });


/**
 * Calls the smart contract to broadcast the message to the ledger once this client receives
 * a message from the local broker.
 * Takes a message: string
 */
const broadcastToLedger = async(topic, message, broker_id) => {
    //const ropsten_0_address = process.env.ROPSTEN_ACCOUNT_0_ADDRESS;
    const accountNumber = process.env.GANACHE_ADDRESS_ACCOUNT_0;
    let contractInstance = await messageBroadcasterContract.deployed();
    let claimResult = contractInstance.addMessage(topic, message, broker_id, {from: accountNumber, gas: 5000000} ).then
            (result => {
                console.log("result from txn: ", result);
                return result;
        }).catch(function (err) {
        console.log("Promise Rejected", err)});
    return claimResult;
};

const getTotalNumberOfMessagesLogged = async () => {
  const accountNumber = process.env.GANACHE_ADDRESS_ACCOUNT_0;
  let contractInstance = await messageBroadcasterContract.deployed();
  let claimResult = await contractInstance.getTotalNumberOfMessages();
  console.log("Number of messages logged: ", claimResult.toNumber());
};

getTotalNumberOfMessagesLogged();